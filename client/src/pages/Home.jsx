import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useI18n } from '../context/I18nContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import ProductCard from '../components/ProductCard';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const { t, lang } = useI18n();
  const { siteName } = useSiteConfig();

  useEffect(() => {
    axios.get('/api/products?limit=8&sort=newest').then(res => setProducts(res.data.products || [])).catch(() => {});
    axios.get('/api/products?featured=true&limit=4').then(res => setFeatured(res.data.products || [])).catch(() => {});
  }, []);

  return (
    <div>
      <section className="min-h-screen flex items-center bg-white dark:bg-ink-950 pt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center min-h-[70vh]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
              <p className="text-sm font-medium text-clay-500 dark:text-clay-400 uppercase tracking-[0.2em] mb-6">
                {siteName}
              </p>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display text-ink-900 dark:text-white leading-[1.1] mb-8 text-balance">
                {t('home.heroTitle')}
              </h1>
              <p className="text-base text-ink-500 dark:text-ink-400 leading-relaxed max-w-md mb-10">
                {t('footer.description')}
              </p>
              <div className="flex gap-4">
                <Link to="/shop" className="btn-primary btn-lg">
                  {t('home.shopNow')}
                </Link>
                <Link to="/shop?category=Électronique" className="btn-outline btn-lg">
                  {t('home.featured')}
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="aspect-[4/5] bg-ink-50 dark:bg-ink-900 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 border border-ink-200 dark:border-ink-700 mx-auto mb-6 flex items-center justify-center">
                      <span className="text-5xl font-display text-ink-300 dark:text-ink-600">M</span>
                    </div>
                    <p className="text-sm text-ink-400 dark:text-ink-500 tracking-[0.15em] uppercase">{siteName}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-ink-50 dark:bg-ink-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-100 dark:bg-ink-800">
            {[
              { label: t('home.freeShipping'), desc: 'Livraison partout au Maroc' },
              { label: t('home.securePayment'), desc: 'Paiement à la livraison' },
              { label: t('home.discount'), desc: "Jusqu'à -70% sur le top" },
              { label: t('home.support247'), desc: 'Support 7j/7' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-ink-950 p-8 md:p-10"
              >
                <p className="text-xs font-medium text-clay-500 dark:text-clay-400 uppercase tracking-wider mb-3">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="text-base font-display text-ink-900 dark:text-white mb-2">{f.label}</h3>
                <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-16">
            <p className="text-xs font-medium text-clay-500 uppercase tracking-[0.2em] mb-4">Featured</p>
            <h2 className="section-heading">{t('home.featured')}</h2>
            <p className="section-sub mt-3">Notre sélection de produits incontournables</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ink-100 dark:bg-ink-800">
            {featured.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-ink-950"
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-ink-50 dark:bg-ink-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
            <div>
              <p className="text-xs font-medium text-clay-500 uppercase tracking-[0.2em] mb-4">New In</p>
              <h2 className="section-heading">{t('home.latest')}</h2>
              <p className="section-sub mt-3">Les dernières pièces ajoutées</p>
            </div>
            <Link to="/shop" className="text-sm font-medium text-ink-900 dark:text-white hover:text-clay-600 dark:hover:text-clay-400 transition-colors mt-6 md:mt-0">
              {t('nav.shop')} &rarr;
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ink-100 dark:bg-ink-800">
            {products.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-ink-950"
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 relative bg-clay-500">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <p className="text-xs font-medium text-white/80 uppercase tracking-[0.2em] mb-5">Newsletter</p>
            <h2 className="text-3xl md:text-5xl font-display text-white leading-[1.15] mb-6 text-balance">
              {t('home.heroTitle')}
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm mx-auto mb-10">
              {t('home.heroSub')}
            </p>
            <Link to="/shop" className="inline-flex items-center px-8 py-4 bg-white text-clay-600 font-medium text-sm hover:bg-ink-50 transition-colors">
              {t('home.shopNow')}
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-16">
            <p className="text-xs font-medium text-clay-500 uppercase tracking-[0.2em] mb-4">Categories</p>
            <h2 className="section-heading">Explorer</h2>
            <p className="section-sub mt-3">Trouvez ce que vous cherchez</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-100 dark:bg-ink-800">
            {[
              { name: 'Électronique', count: '24 articles' },
              { name: 'Mode', count: '56 articles' },
              { name: 'Maison', count: '18 articles' },
              { name: 'Sport', count: '12 articles' },
            ].map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/shop?category=${cat.name}`} className="block bg-white dark:bg-ink-950 p-8 md:p-10 h-full hover:bg-ink-50 dark:hover:bg-ink-900 transition-colors group">
                  <p className="text-xs font-medium text-clay-500 uppercase tracking-wider mb-4">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="text-lg font-display text-ink-900 dark:text-white mb-1 group-hover:text-clay-600 dark:group-hover:text-clay-400 transition-colors">{cat.name}</h3>
                  <p className="text-sm text-ink-400">{cat.count}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
