import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useI18n } from '../context/I18nContext';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const { t } = useI18n();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/wishlist', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProducts(res.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-moris-50 via-yellow-50 to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold font-display text-gradient mb-10 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-moris-500 to-orange-500 rounded-full inline-block"></span>
            {t('wishlist.title')}
          </h1>

          {products.length === 0 ? (
            <div className="card-solid text-center py-20">
              <div className="text-6xl mb-6">🤍</div>
              <p className="text-xl text-gray-500 mb-6">{t('wishlist.empty')}</p>
              <Link to="/shop" className="btn-primary inline-block">{t('home.shopNow')}</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <motion.div key={product._id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
