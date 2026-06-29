import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { useI18n } from '../context/I18nContext';

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const stepColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
};

export default function Tracking() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(paramId || searchParams.get('id') || '');
  const [inputId, setInputId] = useState(paramId || searchParams.get('id') || '');
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t, lang } = useI18n();

  const fetchTracking = async (id) => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`/api/orders/track/${id}`);
      setTracking(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found');
      setTracking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramId) { setOrderId(paramId); setInputId(paramId); fetchTracking(paramId); }
  }, [paramId]);

  useEffect(() => {
    if (!tracking?._id) return;
    const socketUrl = import.meta.env.VITE_SOCKET_URL || '';
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => socket.emit('join_order', tracking._id));
    socket.on('order_status_update', (data) => {
      setTracking(prev => ({ ...prev, ...data }));
    });
    return () => { socket.close(); };
  }, [tracking?._id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputId.trim()) { setOrderId(inputId.trim()); fetchTracking(inputId.trim()); }
  };

  const currentStepIndex = tracking
    ? tracking.status === 'cancelled'
      ? -1
      : STEPS.indexOf(tracking.status)
    : -1;

  const getEstimatedRemaining = () => {
    if (!tracking?.estimatedDeliveryDate) return null;
    const now = new Date();
    const eta = new Date(tracking.estimatedDeliveryDate);
    const diffMs = eta - now;
    if (diffMs <= 0) return { past: true, label: 'Estimated delivery passed' };
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return { past: false, days, hours, totalHours };
  };

  const eta = getEstimatedRemaining();

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-ink-950 py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold font-display text-center mb-8">Track Order</h1>

          <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
            <input
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="Enter your order ID"
              className="input flex-1"
              dir="ltr"
            />
            <button type="submit" className="btn-primary px-6" disabled={loading}>
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {error && (
            <div className="card p-6 text-center">
              <p className="text-red-500 font-medium">{error}</p>
              <p className="text-ink-400 text-sm mt-2">Check your order confirmation email for the order ID.</p>
            </div>
          )}

          {tracking && (
            <div className="space-y-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg font-display">
                    Order #{tracking._id?.slice(-8)}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${stepColors[tracking.status]}`}>
                    {t(`order.${tracking.status}`)}
                  </span>
                </div>

                {eta && !eta.past && (
                  <div className="bg-ink-50 dark:bg-ink-800/50 rounded p-4 mb-4">
                    <p className="text-sm text-ink-500 mb-1">Estimated Delivery</p>
                    <p className="text-2xl font-bold font-display text-clay-500">
                      {eta.days > 0 ? `${eta.days}d ` : ''}{eta.hours}h remaining
                    </p>
                    <p className="text-xs text-ink-400 mt-1">
                      Expected by {new Date(tracking.estimatedDeliveryDate).toLocaleDateString(lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                )}

                {eta?.past && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded p-4 mb-4">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Delivery completed</p>
                    {tracking.deliveredAt && (
                      <p className="text-xs text-ink-400 mt-1">
                        Delivered on {new Date(tracking.deliveredAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {tracking.trackingNumber && (
                  <div className="flex flex-wrap gap-4 text-sm text-ink-500 mb-4">
                    <div><span className="font-semibold text-ink-700 dark:text-ink-300">Tracking #:</span> {tracking.trackingNumber}</div>
                    {tracking.carrier && <div><span className="font-semibold text-ink-700 dark:text-ink-300">Carrier:</span> {tracking.carrier}</div>}
                  </div>
                )}

                {tracking.status !== 'cancelled' && (
                  <div className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      {STEPS.map((step, i) => (
                        <div key={step} className="flex flex-col items-center" style={{ width: `${100 / STEPS.length}%` }}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                            i <= currentStepIndex
                              ? 'bg-clay-500 text-white shadow-md'
                              : 'bg-ink-100 dark:bg-ink-800 text-ink-400'
                          }`}>
                            {i + 1}
                          </div>
                          <span className={`text-[10px] mt-1 text-center font-medium ${
                            i <= currentStepIndex ? 'text-clay-600 dark:text-clay-400' : 'text-ink-400'
                          }`}>
                            {t(`order.${step}`)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="relative mt-2">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-ink-100 dark:bg-ink-800 rounded" />
                      <div
                        className="absolute top-0 left-0 h-1 bg-clay-500 rounded transition-all duration-700"
                        style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (STEPS.length - 1)) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}

                {tracking.status === 'cancelled' && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4 text-center">
                    <p className="text-red-600 dark:text-red-400 font-semibold">This order has been cancelled</p>
                    {tracking.cancelledAt && (
                      <p className="text-xs text-ink-400 mt-1">
                        Cancelled on {new Date(tracking.cancelledAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="card p-6">
                <h2 className="font-bold text-lg mb-4 font-display">Timeline</h2>
                <div className="relative">
                  {tracking.trackingHistory?.map((h, i) => (
                    <div key={i} className="flex gap-4 pb-6 last:pb-0 relative">
                      {i < (tracking.trackingHistory?.length || 0) - 1 && (
                        <div className="absolute left-[15px] top-7 bottom-0 w-0.5 bg-clay-200 dark:bg-clay-800" />
                      )}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${stepColors[h.status]?.split(' ')[0] || 'bg-ink-100'}`}>
                        {STEPS.indexOf(h.status) >= 0 ? STEPS.indexOf(h.status) + 1 : ''}
                      </div>
                      <div>
                        <p className="text-sm font-semibold capitalize">{t(`order.${h.status}`)}</p>
                        {h.note && <p className="text-xs text-ink-500">{h.note}</p>}
                        <p className="text-xs text-ink-400 mt-0.5">{new Date(h.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {(!tracking.trackingHistory || tracking.trackingHistory.length === 0) && (
                    <p className="text-ink-400 text-sm py-4">No tracking updates yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
