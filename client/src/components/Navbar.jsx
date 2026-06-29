import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import NotificationsDropdown from './NotificationsDropdown';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { lang, setLang, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { siteName } = useSiteConfig();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 dark:bg-ink-950/95 shadow-sm border-b border-ink-100 dark:border-ink-800' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-xl font-display tracking-tight text-ink-900 dark:text-white">
              {siteName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/shop" className="text-sm font-medium text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white transition-colors">
              {t('nav.shop')}
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('common.search')}
                className="w-48 lg:w-56 py-2 px-4 pr-9 text-sm border border-ink-200 dark:border-ink-700 bg-transparent rounded-none focus:border-ink-900 dark:focus:border-white outline-none transition-colors"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            <Link to="/cart" className="relative p-2 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
              <svg className="w-5 h-5 text-ink-700 dark:text-ink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-clay-500 text-white text-[9px] font-medium flex items-center justify-center">{cartCount}</span>
              )}
            </Link>

            {user && <NotificationsDropdown />}

            <button onClick={toggleTheme} className="p-2 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors" aria-label="Toggle theme">
              {theme === 'dark' ? (
                <svg className="w-4 h-4 text-ink-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-ink-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-1">
              {['ar', 'fr', 'en'].map(code => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`px-2 py-1 text-[11px] font-medium tracking-wider uppercase transition-colors ${
                    lang === code
                      ? 'text-ink-900 dark:text-white bg-ink-100 dark:bg-ink-800'
                      : 'text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-300'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
                  <div className="w-7 h-7 bg-ink-900 dark:bg-white text-white dark:text-ink-900 flex items-center justify-center text-xs font-medium">{user.name[0]}</div>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 border-b border-ink-100 dark:border-ink-800">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{user.email}</p>
                  </div>
                  <div className="py-1">
                    {[
                      { to: '/profile', label: t('nav.profile') },
                      { to: '/orders', label: t('nav.orders') },
                      { to: '/wishlist', label: t('nav.wishlist') },
                      { to: '/tickets', label: t('nav.tickets') },
                    ].map(item => (
                      <Link key={item.to} to={item.to} className="block px-4 py-2 text-sm text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors">
                        {item.label}
                      </Link>
                    ))}
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-clay-600 dark:text-clay-400 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors">
                        {t('nav.dashboard')}
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-ink-100 dark:border-ink-800">
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-ink-900 dark:text-white hover:text-clay-600 dark:hover:text-clay-400 transition-colors">
                {t('nav.login')}
              </Link>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
            <svg className="w-5 h-5 text-ink-700 dark:text-ink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-6 space-y-1 border-t border-ink-100 dark:border-ink-800 pt-4">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block px-2 py-3 text-sm font-medium text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white">{t('nav.home')}</Link>
            <Link to="/shop" onClick={() => setMenuOpen(false)} className="block px-2 py-3 text-sm font-medium text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white">{t('nav.shop')}</Link>
            <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }} className="px-2 py-2">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('common.search')} className="input py-2 text-sm" />
            </form>
            {user ? (
              <>
                <div className="px-2 py-3 border-b border-ink-100 dark:border-ink-800 mb-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-ink-400">{user.email}</p>
                </div>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-2 py-3 text-sm text-ink-600 dark:text-ink-400">{t('nav.profile')}</Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="block px-2 py-3 text-sm text-ink-600 dark:text-ink-400">{t('nav.orders')}</Link>
                <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="block px-2 py-3 text-sm text-ink-600 dark:text-ink-400">{t('nav.wishlist')}</Link>
                <Link to="/tickets" onClick={() => setMenuOpen(false)} className="block px-2 py-3 text-sm text-ink-600 dark:text-ink-400">{t('nav.tickets')}</Link>
                {(user.role === 'admin' || user.role === 'superadmin') && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-2 py-3 text-sm text-clay-600 dark:text-clay-400">{t('nav.dashboard')}</Link>
                )}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left px-2 py-3 text-sm text-red-600">{t('nav.logout')}</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-2 py-3 text-sm font-medium text-ink-600 dark:text-ink-400">{t('nav.login')}</Link>
            )}
            <div className="flex items-center gap-1 px-2 pt-3 border-t border-ink-100 dark:border-ink-800 mt-2">
              {['ar', 'fr', 'en'].map(code => (
                <button key={code} onClick={() => setLang(code)}
                  className={`px-3 py-1.5 text-xs font-medium tracking-wider uppercase transition-colors ${
                    lang === code ? 'bg-ink-100 dark:bg-ink-800 text-ink-900 dark:text-white' : 'text-ink-400 hover:text-ink-700 dark:hover:text-ink-300'
                  }`}
                >
                  {code}
                </button>
              ))}
              <button onClick={toggleTheme} className="ml-auto p-2 hover:bg-ink-100 dark:hover:bg-ink-800">
                {theme === 'dark' ? (
                  <svg className="w-4 h-4 text-ink-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-4 h-4 text-ink-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
