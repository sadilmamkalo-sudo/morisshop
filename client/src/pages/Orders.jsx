import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useI18n } from '../context/I18nContext';
import { motion } from 'framer-motion';

const statusColors = { pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300', shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300', delivered: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const { t } = useI18n();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/orders/myorders', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setOrders(res.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-moris-50 via-yellow-50 to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold font-display text-gradient mb-10 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-moris-500 to-orange-500 rounded-full inline-block"></span>
            {t('order.title')}
          </h1>

          {orders.length === 0 ? (
            <div className="card-solid text-center py-20">
              <div className="text-6xl mb-6">📦</div>
              <p className="text-xl text-gray-500 mb-6">{t('order.noOrders')}</p>
              <Link to="/shop" className="btn-primary inline-block">{t('home.shopNow')}</Link>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order, i) => (
                <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/orders/${order._id}`} className="card-solid p-6 block hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-moris-500/20 to-orange-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📋</div>
                        <div>
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="font-bold text-lg">{order.items.length} {t('cart.title')} — <span className="text-moris-500">{order.totalPrice.toFixed(2)} DH</span></p>
                          <p className="text-sm text-gray-400">{order._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>{t(`order.${order.status}`)}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
