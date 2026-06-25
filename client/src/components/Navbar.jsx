import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsDropdown from './NotificationsDropdown';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { lang, setLang, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => { e.preventDefault(); if (searchOpen.trim()) navigate(`/shop?search=${searchOpen.trim()}`); setSearchOpen(''); };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled ? 'glass shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-moris-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-moris-500/30 group-hover:shadow-moris-500/50 transition-shadow">M</div>
            <span className="text-2xl font-bold font-display bg-gradient-to-r from-moris-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">{useSiteConfig().siteName}</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/shop', label: t('nav.shop') },
              ].map(link => (
                <Link key={link.to} to={link.to} className="relative font-medium text-gray-700 dark:text-gray-300 hover:text-moris-600 dark:hover:text-moris-400 transition-colors group">
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-moris-500 to-yellow-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
              ))}
            </div>

            <form onSubmit={handleSearch} className="relative group">
              <input type="text" value={searchOpen} onChange={e => setSearchOpen(e.target.value)} placeholder={t('common.search')} className="w-48 lg:w-60 py-2.5 px-4 pl-10 rounded-2xl bg-gray-100 dark:bg-dark-700 border-2 border-transparent focus:border-moris-500 focus:ring-4 focus:ring-moris-500/20 outline-none transition-all text-sm" />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </form>

            <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors group">
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-moris-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">{cartCount}</span>
              )}
            </Link>

            {user && <NotificationsDropdown />}

            <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors group">
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              )}
            </button>

            <div className="flex items-center bg-gray-100 dark:bg-dark-700 rounded-2xl p-1 gap-1">
              {[
                { code: 'ar', flag: '🇲🇦', label: 'AR' },
                { code: 'fr', flag: '🇫🇷', label: 'FR' },
                { code: 'en', flag: '🇬🇧', label: 'EN' },
              ].map(l => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    lang === l.code
                      ? 'bg-white dark:bg-dark-600 text-moris-600 dark:text-moris-400 shadow-md scale-105'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:scale-105'
                  }`}
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-moris-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">{user.name[0]}</div>
                  <svg className="w-4 h-4 text-gray-500 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-3 w-56 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-dark-700">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="p-2">
                    {[
                      { to: '/profile', label: t('nav.profile'), icon: '👤' },
                      { to: '/orders', label: t('nav.orders'), icon: '📦' },
                      { to: '/wishlist', label: t('nav.wishlist'), icon: '❤️' },
                      { to: '/tickets', label: t('nav.tickets'), icon: '🎫' },
                    ].map(item => (
                      <Link key={item.to} to={item.to} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors text-sm">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                      <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-moris-50 dark:hover:bg-moris-900/30 transition-colors text-sm text-moris-600">
                        <span>⚡</span><span className="font-semibold">{t('nav.dashboard')}</span>
                      </Link>
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-100 dark:border-dark-700">
                    <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-sm text-red-500 w-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2.5 px-6">{t('nav.login')}</Link>
            )}
          </div>

          <div className="flex md:hidden items-center gap-3">
            <Link to="/cart" className="relative p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden pb-6 space-y-1 overflow-hidden">
              <Link to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 font-medium">{t('nav.home')}</Link>
              <Link to="/shop" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 font-medium">{t('nav.shop')}</Link>
              <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }} className="px-4 py-2">
                <input type="text" value={searchOpen} onChange={e => setSearchOpen(e.target.value)} placeholder={t('common.search')} className="input-field py-2 text-sm" />
              </form>
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700">{t('nav.profile')}</Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700">{t('nav.orders')}</Link>
                  <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700">{t('nav.wishlist')}</Link>
                  <Link to="/tickets" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700">{t('nav.tickets')}</Link>
                  {(user.role === 'admin' || user.role === 'superadmin') && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-moris-50 dark:hover:bg-moris-900/30 text-moris-600 font-semibold">{t('nav.dashboard')}</Link>}
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30">{t('nav.logout')}</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 font-medium">{t('nav.login')}</Link>
              )}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex bg-gray-100 dark:bg-dark-700 rounded-2xl p-1 gap-1 flex-1">
                  {[
                    { code: 'ar', flag: '🇲🇦', label: 'AR' },
                    { code: 'fr', flag: '🇫🇷', label: 'FR' },
                    { code: 'en', flag: '🇬🇧', label: 'EN' },
                  ].map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                        lang === l.code
                          ? 'bg-white dark:bg-dark-600 text-moris-600 dark:text-moris-400 shadow-md scale-105'
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
                <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700">
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
