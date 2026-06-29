import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function Footer() {
  const { t } = useI18n();
  const { siteName } = useSiteConfig();
  return (
    <footer className="bg-ink-50 dark:bg-ink-900 border-t border-ink-100 dark:border-ink-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="text-lg font-display text-ink-900 dark:text-white">
              {siteName}
            </Link>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-4 max-w-xs leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-medium text-ink-900 dark:text-white uppercase tracking-wider mb-6">
              {t('footer.quickLinks')}
            </h4>
            <div className="space-y-3">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/shop', label: t('nav.shop') },
                { to: '/cart', label: t('nav.cart') },
                { to: '/tickets', label: t('nav.tickets') },
              ].map(link => (
                <Link key={link.to} to={link.to} className="block text-sm text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-ink-900 dark:text-white uppercase tracking-wider mb-6">
              Contact
            </h4>
            <div className="space-y-3 text-sm text-ink-500 dark:text-ink-400">
              <p>contact@morisshop.com</p>
              <p>+212 6 00 00 00 00</p>
              <p>Casablanca, Maroc</p>
            </div>
          </div>
        </div>

        <div className="border-t border-ink-200 dark:border-ink-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ink-400 dark:text-ink-500">
            &copy; {new Date().getFullYear()} {siteName}. {t('footer.rights')}
          </p>
          <div className="flex gap-6 text-xs text-ink-400 dark:text-ink-500">
            <a href="#" className="hover:text-ink-900 dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-ink-900 dark:hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-ink-900 dark:hover:text-white transition-colors">FAQ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
