import { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import { useI18n } from '../../context/I18nContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusColors = { pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300', shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300', delivered: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' };
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [noteModal, setNoteModal] = useState(null);
  const [note, setNote] = useState('');
  const [trackModal, setTrackModal] = useState(null);
  const [trackData, setTrackData] = useState({ trackingNumber: '', carrier: '', estimatedDeliveryDate: '' });
  const { t } = useI18n();
  const fetchOrders = () => {
    const params = filter ? `?status=${filter}` : '';
    fetchApi(`/orders${params}`).then(data => setOrders(data.orders || [])).catch(() => {});
  };
  useEffect(() => { fetchOrders(); }, [filter]);
  const updateStatus = async (id, newStatus) => {
    if (newStatus === 'cancelled' || newStatus === 'shipped' || newStatus === 'delivered') {
      setNoteModal(id);
      setNote('');
      return;
    }
    try {
      await fetchApi(`/orders/${id}/status`, 'PUT', { status: newStatus });
      toast.success('Status updated');
      fetchOrders();
    } catch (err) { toast.error(err.message); }
  };
  const confirmUpdate = async () => {
    if (!noteModal) return;
    try {
      const status = document.getElementById('status-select-' + noteModal)?.value || 'confirmed';
      await fetchApi(`/orders/${noteModal}/status`, 'PUT', { status, note });
      toast.success('Status updated');
      setNoteModal(null);
      setNote('');
      fetchOrders();
    } catch (err) { toast.error(err.message); }
  };
  const openTrackModal = (order) => {
    setTrackData({
      trackingNumber: order.trackingNumber || '',
      carrier: order.carrier || '',
      estimatedDeliveryDate: order.estimatedDeliveryDate ? order.estimatedDeliveryDate.slice(0, 10) : ''
    });
    setTrackModal(order._id);
  };
  const saveTracking = async () => {
    if (!trackModal) return;
    try {
      await fetchApi(`/orders/${trackModal}/tracking`, 'PUT', {
        trackingNumber: trackData.trackingNumber,
        carrier: trackData.carrier,
        estimatedDeliveryDate: trackData.estimatedDeliveryDate || null
      });
      toast.success('Tracking info saved');
      setTrackModal(null);
      fetchOrders();
    } catch (err) { toast.error(err.message); }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-display ">{t('admin.orders')}</h1>
        <button onClick={() => window.open('/api/export/orders', '_blank')} className="btn-secondary text-sm">Export Excel</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('')} className={`px-4 py-2 rounded font-medium transition-all duration-300 ${!filter ? 'btn-primary' : 'bg-white dark:bg-ink-800/50 border border-ink-200 dark:border-ink-700'}`}>{t('common.all')}</button>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded font-medium transition-all duration-300 ${filter === s ? 'btn-primary' : 'bg-white dark:bg-ink-800/50 border border-ink-200 dark:border-ink-700'}`}>{t(`order.${s}`)}</button>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Client</th>
                <th className="px-4 py-3 text-left font-semibold">Items</th>
                <th className="px-4 py-3 text-left font-semibold">Total</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Tracking</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-ink-100 dark:border-ink-700/50 hover:bg-ink-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-mono font-bold">#{order._id?.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.user?.name}</p>
                    <p className="text-xs text-ink-500">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">{order.items?.length} items</td>
                  <td className="px-4 py-3 font-bold text-clay-500">{order.totalPrice?.toFixed(2)} DH</td>
                  <td className="px-4 py-3"><span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColors[order.status]}`}>{t(`order.${order.status}`)}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => openTrackModal(order)} className="text-xs text-clay-500 hover:text-clay-600 underline">
                      {order.trackingNumber ? 'Edit' : 'Add'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <select id={`status-select-${order._id}`} value={order.status} onChange={e => updateStatus(order._id, e.target.value)} className="input py-1.5 text-sm w-36">
                      {statuses.map(s => <option key={s} value={s}>{t(`order.${s}`)}</option>)}
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && <p className="text-center py-8 text-ink-500">{t('common.noData')}</p>}
      </div>
      {noteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50" onClick={() => setNoteModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded p-6 w-96 shadow-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Add Note (optional)</h3>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Status update note..." className="input mb-4 h-24" />
            <div className="flex gap-3">
              <button onClick={() => setNoteModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={confirmUpdate} className="btn-primary flex-1">Confirm</button>
            </div>
          </div>
        </div>
      )}
      {trackModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50" onClick={() => setTrackModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded p-6 w-96 shadow-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Tracking Info</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1">Tracking Number</label>
                <input type="text" value={trackData.trackingNumber} onChange={e => setTrackData(p => ({ ...p, trackingNumber: e.target.value }))} className="input" placeholder="e.g. TRK123456" />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1">Carrier</label>
                <input type="text" value={trackData.carrier} onChange={e => setTrackData(p => ({ ...p, carrier: e.target.value }))} className="input" placeholder="e.g. Aramex, FedEx" />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1">Estimated Delivery Date</label>
                <input type="date" value={trackData.estimatedDeliveryDate} onChange={e => setTrackData(p => ({ ...p, estimatedDeliveryDate: e.target.value }))} className="input" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setTrackModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={saveTracking} className="btn-primary flex-1">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
