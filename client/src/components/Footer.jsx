import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { motion } from 'framer-motion';

export default function Footer() {
  const { t } = useI18n();
  const { siteName } = useSiteConfig();
  return (
    <footer className="relative bg-dark-900 text-white dark:bg-dark-950 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0YzAtMiAyLTQgNC00czQgMiA0IDQtMiA0LTQgNC00LTItNC00em0wIDBsMCAweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-moris-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-moris-500/30">M</div>
              <span className="text-2xl font-bold font-display bg-gradient-to-r from-moris-400 to-yellow-400 bg-clip-text text-transparent">{siteName}</span>
            </Link>
            <p className="text-gray-400 max-w-md leading-relaxed">{t('footer.description')}</p>
            <div className="flex gap-4 mt-6">
              {[
                { icon: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z', label: 'Facebook' },
                { icon: 'M12.315 2c2.43 0 2.784.013 3.808.06 ...', label: 'Instagram' },
              ].map((social, i) => (
                <a key={i} href="#" aria-label={social.label} className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-moris-500/20 border border-white/10 hover:border-moris-500/50 flex items-center justify-center transition-all duration-300 group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-moris-400 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d={social.icon.split('...')[0]} /></svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">{t('footer.quickLinks')}</h4>
            <div className="space-y-3">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/shop', label: t('nav.shop') },
                { to: '/cart', label: t('nav.cart') },
                { to: '/tickets', label: t('nav.tickets') },
              ].map(link => (
                <Link key={link.to} to={link.to} className="block text-gray-400 hover:text-white transition-colors hover:translate-x-1 transform duration-300">{link.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">{t('footer.followUs')}</h4>
            <div className="space-y-3 text-gray-400">
              <p className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">📧</span> contact@morisshop.com</p>
              <p className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">📞</span> +212 6 00 00 00 00</p>
              <p className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">📍</span> Casablanca, Maroc</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} {siteName}. {t('footer.rights')}</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">FAQ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
