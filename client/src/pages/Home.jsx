import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import axios from 'axios';
import { useI18n } from '../context/I18nContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import ProductCard from '../components/ProductCard';

const fadeUp = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' }, transition: { duration: 0.6 } };
const stagger = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { staggerChildren: 0.1, delayChildren: 0.2 } };

export default function Home() {
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const { t, lang } = useI18n();
  const { siteName } = useSiteConfig();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    axios.get('/api/products?limit=8&sort=newest').then(res => setProducts(res.data.products || [])).catch(() => {});
    axios.get('/api/products?featured=true&limit=4').then(res => setFeatured(res.data.products || [])).catch(() => {});
  }, []);

  const features = [
    { icon: '🚚', title: t('home.freeShipping'), desc: 'Nouveau service au Maroc' },
    { icon: '🔒', title: t('home.securePayment'), desc: 'Paiement 100% sécurisé' },
    { icon: '🎉', title: t('home.discount'), desc: 'Jusqu\'à -70% sur le top' },
    { icon: '💬', title: t('home.support247'), desc: 'Support 7j/7' },
  ];

  const categories = [
    { name: 'Électronique', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { name: 'Mode', icon: '👗', color: 'from-pink-500 to-rose-500' },
    { name: 'Maison', icon: '🏠', color: 'from-emerald-500 to-green-500' },
    { name: 'Sport', icon: '⚽', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div>
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-moris-50 via-yellow-50 to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-moris-400/30 to-orange-400/30 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-yellow-400/20 to-moris-400/20 rounded-full blur-3xl animate-blob-delayed"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-moris-500/5 to-orange-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-blob"></div>
          <div className="absolute bottom-1/3 left-1/5 w-48 h-48 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl animate-blob-delayed"></div>

          <div className="absolute top-[15%] left-[10%] text-3xl particle-float opacity-20 dark:opacity-10">✦</div>
          <div className="absolute top-[25%] right-[15%] text-2xl particle-float opacity-20 dark:opacity-10" style={{ animationDelay: '-5s', animationDuration: '25s' }}>⬡</div>
          <div className="absolute bottom-[30%] left-[20%] text-4xl particle-float opacity-20 dark:opacity-10" style={{ animationDelay: '-10s', animationDuration: '30s' }}>◈</div>
          <div className="absolute top-[40%] right-[25%] text-xl particle-float opacity-20 dark:opacity-10" style={{ animationDelay: '-3s', animationDuration: '22s' }}>◇</div>
          <div className="absolute bottom-[20%] right-[10%] text-3xl particle-float opacity-20 dark:opacity-10" style={{ animationDelay: '-8s', animationDuration: '28s' }}>○</div>
          <div className="absolute top-[60%] left-[5%] text-2xl particle-float opacity-20 dark:opacity-10" style={{ animationDelay: '-15s', animationDuration: '35s' }}>▽</div>
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-7xl mx-auto px-4 pt-32 pb-20 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-dark-800/50 backdrop-blur-sm border border-moris-200/50 dark:border-moris-700/30 mb-6">
                  <span className="w-2 h-2 rounded-full bg-moris-500 animate-pulse-glow"></span>
                  <span className="text-sm font-medium text-moris-600 dark:text-moris-400">{t('home.discount')} jusqu'à -70%</span>
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-display leading-[1.1] mb-6">
                  <span className="text-gray-900 dark:text-white">{t('home.heroTitle')}</span>
                  <br />
                  <span className="text-gradient">{t('home.heroSub').replace('MORISSESHOP', '').replace('MORISSESHOP', '')}</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-8 max-w-xl leading-relaxed">
                  {siteName} - {t('footer.description')}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/shop" className="btn-primary text-lg inline-flex items-center gap-2 group">
                    {t('home.shopNow')}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                  <Link to="/shop?category=Électronique" className="btn-outline">{t('home.featured')}</Link>
                </div>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-moris-500/20 to-orange-500/20 rounded-[60px] blur-3xl transform rotate-6"></div>
                <div className="relative bg-white dark:bg-dark-800 rounded-[40px] shadow-2xl shadow-moris-500/20 p-10 transform hover:rotate-1 transition-transform duration-500">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="text-9xl animate-float">🛍️</div>
                      <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-moris-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-moris-500/30 animate-bounce-gentle">
                        <span className="text-white text-2xl font-bold">-70%</span>
                      </div>
                    </div>
                    <div className="mt-8 space-y-2">
                      <span className="text-4xl font-bold font-display text-gradient">{siteName}</span>
                      <p className="text-gray-400 text-lg">Premium E-commerce Marocain</p>
                    </div>
                    <div className="mt-6 flex justify-center gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-12 h-12 rounded-2xl bg-gradient-to-br from-moris-500/20 to-orange-500/20 flex items-center justify-center animate-bounce-gentle" style={{ animationDelay: `${i * 0.15}s` }}>
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-moris-500 to-orange-500"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fafafa] dark:from-dark-950 pointer-events-none"></div>
      </section>

      <section className="py-20 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...stagger} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} variants={{ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } }} {...fadeUp} transition={{ delay: i * 0.1 }}
                className="glass-card p-6 md:p-8 text-center group hover:shadow-2xl hover:shadow-moris-500/10 transition-all duration-500">
                <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">{f.icon}</div>
                <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-moris-50 dark:bg-moris-900/30 text-moris-600 dark:text-moris-400 text-sm font-medium mb-4">
              <span>🔥</span> Top Collections
            </div>
            <h2 className="section-title">{t('home.featured')}</h2>
            <p className="section-subtitle mx-auto">Découvrez notre sélection de produits premium</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-dark-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-sm font-medium mb-4">
                <span>✨</span> Nouveautés
              </div>
              <h2 className="section-title">{t('home.latest')}</h2>
              <p className="section-subtitle">Les derniers produits ajoutés</p>
            </div>
            <Link to="/shop" className="btn-outline mt-4 md:mt-0 group">
              <span className="flex items-center gap-2">
                {t('nav.shop')}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </span>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-moris-500 via-orange-500 to-yellow-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCA0LTRzNCAyIDQgNC0yIDQtNCA0LTQtMi00LTR6bTAgMGwwIDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div {...fadeUp}>
            <h2 className="text-4xl md:text-6xl font-bold font-display text-white mb-6">{t('home.heroTitle')}</h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">{t('home.heroSub')}</p>
            <Link to="/shop" className="inline-flex items-center gap-3 bg-white text-moris-600 font-bold py-4 px-10 rounded-2xl text-lg hover:shadow-2xl hover:shadow-black/20 transform hover:scale-105 transition-all duration-300 group">
              {t('home.shopNow')}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="section-title">Catégories</h2>
            <p className="section-subtitle mx-auto">Explorez nos catégories populaires</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={`/shop?category=${cat.name}`} className="group block relative overflow-hidden rounded-3xl p-8 text-white hover:scale-[1.02] transition-all duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90`}></div>
                  <div className="relative z-10">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">{cat.icon}</div>
                    <h3 className="text-xl font-bold">{cat.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
