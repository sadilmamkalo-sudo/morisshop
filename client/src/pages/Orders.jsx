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
    <div className="min-h-screen bg-orange-50 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold font-display  mb-10 flex items-center gap-3">
            <span className="w-1 h-8 bg-clay-500 rounded-full inline-block"></span>
            {t('order.title')}
          </h1>

          {orders.length === 0 ? (
            <div className="card text-center py-20">
              <div className="text-6xl mb-6"></div>
              <p className="text-xl text-ink-500 mb-6">{t('order.noOrders')}</p>
              <Link to="/shop" className="btn-primary inline-block">{t('home.shopNow')}</Link>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order, i) => (
                <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/orders/${order._id}`} className="card p-6 block  transition-all duration-300 group">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-clay-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"></div>
                        <div>
                          <p className="text-sm text-ink-500">{new Date(order.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="font-bold text-lg">{order.items.length} {t('cart.title')} — <span className="text-clay-500">{order.totalPrice.toFixed(2)} DH</span></p>
                          <p className="text-sm text-ink-400">{order._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${statusColors[order.status] || 'bg-ink-50 text-ink-800'}`}>{t(`order.${order.status}`)}</span>
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
