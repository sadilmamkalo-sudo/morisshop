import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useI18n } from '../context/I18nContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const statusColors = { pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300', shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300', delivered: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' };
const statusIcons = { pending: '', confirmed: '', processing: '', shipped: '', delivered: '', cancelled: '' };

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const { t, lang } = useI18n();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setOrder(res.data)).catch(() => {});
  }, [id]);

  if (!order) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-clay-500"></div></div>;

  const getLocalizedName = (item) => item.product?.name?.[lang] || item.product?.name?.en || 'Unknown';

  return (
    <div className="min-h-screen bg-orange-50 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-display ">{t('order.detailTitle')}</h1>
            <div className="flex gap-3">
              <Link to="/orders" className="px-4 py-2 rounded bg-white dark:bg-ink-800/50 border border-ink-200 dark:border-ink-700 hover:bg-white transition-all text-sm">{t('order.backToOrders')}</Link>
              <button onClick={() => { window.open(`/api/orders/${order._id}/invoice`, '_blank'); }} className="btn-primary text-sm px-4 py-2">{t('order.downloadInvoice')}</button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2"> {t('order.items')}</h2>
                <div className="space-y-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded bg-ink-50 dark:bg-ink-800/50">
                      <div className="w-16 h-16 rounded overflow-hidden bg-ink-50 dark:bg-ink-700 shrink-0">
                        {item.image ? <img src={item.image} alt={getLocalizedName(item)} loading="lazy" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-2xl"></div>}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{item.name?.[lang] || item.name?.en || 'Product'}</p>
                        <p className="text-sm text-ink-500">Qty: {item.quantity} × {item.price} DH</p>
                      </div>
                      <span className="font-bold text-clay-500">{(item.price * item.quantity).toFixed(2)} DH</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2"> {t('order.shippingAddress')}</h2>
                <p className="text-ink-600 dark:text-ink-300">{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
              </div>

              <div className="card p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2"> Order Tracking</h2>
                <div className="relative">
                  {(order.trackingHistory || []).map((h, i) => (
                    <div key={i} className="flex gap-4 pb-6 last:pb-0 relative">
                      {i < (order.trackingHistory?.length || 0) - 1 && <div className="absolute left-[15px] top-7 bottom-0 w-0.5 bg-clay-500" />}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${statusColors[h.status]?.split(' ')[0] || 'bg-ink-50'}`}>
                        {statusIcons[h.status] || ''}
                      </div>
                      <div>
                        <p className="text-sm font-semibold capitalize">{h.status}</p>
                        {h.note && <p className="text-xs text-ink-500">{h.note}</p>}
                        <p className="text-xs text-ink-400 mt-0.5">{new Date(h.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {(!order.trackingHistory || order.trackingHistory.length === 0) && (
                    <p className="text-ink-400 text-sm py-4">No tracking updates yet</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2"> {t('order.summary')}</h2>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-ink-500">{t('order.status')}</span><span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>{t(`order.${order.status}`)}</span></div>
                  <hr className="border-ink-200 dark:border-ink-700" />
                  <div className="flex justify-between"><span className="text-ink-500">{t('cart.subtotal')}</span><span>{order.itemsPrice?.toFixed(2)} DH</span></div>
                  {order.couponCode && <div className="flex justify-between text-emerald-500"><span>{t('cart.coupon')} ({order.couponCode})</span><span>-{order.discountAmount?.toFixed(2)} DH</span></div>}
                  <hr className="border-ink-200 dark:border-ink-700" />
                  <div className="flex justify-between text-xl font-bold"><span>{t('cart.total')}</span><span className="">{order.totalPrice?.toFixed(2)} DH</span></div>
                  <div className="flex justify-between text-sm text-ink-500"><span>{t('order.paymentMethod')}</span><span className="font-semibold capitalize">{order.paymentMethod}</span></div>
                </div>
              </div>

              <div className="card p-6 text-center">
                <p className="text-sm text-ink-500">{t('order.date')}</p>
                <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
