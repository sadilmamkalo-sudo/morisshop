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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-display text-gradient">{t('admin.orders')}</h1>
        <button onClick={() => window.open('/api/export/orders', '_blank')} className="btn-secondary text-sm">Export Excel</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('')} className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${!filter ? 'btn-primary' : 'bg-white/50 dark:bg-dark-800/50 border border-gray-200 dark:border-dark-700'}`}>{t('common.all')}</button>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === s ? 'btn-primary' : 'bg-white/50 dark:bg-dark-800/50 border border-gray-200 dark:border-dark-700'}`}>{t(`order.${s}`)}</button>
        ))}
      </div>

      <div className="card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Client</th>
                <th className="px-4 py-3 text-left font-semibold">Items</th>
                <th className="px-4 py-3 text-left font-semibold">Total</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-gray-100 dark:border-dark-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-mono font-bold">#{order._id?.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.user?.name}</p>
                    <p className="text-xs text-gray-500">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{order.items?.length} items</td>
                  <td className="px-4 py-3 font-bold text-moris-500">{order.totalPrice?.toFixed(2)} DH</td>
                  <td className="px-4 py-3"><span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColors[order.status]}`}>{t(`order.${order.status}`)}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <select id={`status-select-${order._id}`} value={order.status} onChange={e => updateStatus(order._id, e.target.value)} className="input-field py-1.5 text-sm w-36">
                      {statuses.map(s => <option key={s} value={s}>{t(`order.${s}`)}</option>)}
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && <p className="text-center py-8 text-gray-500">{t('common.noData')}</p>}
      </div>

      {noteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50" onClick={() => setNoteModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Add Note (optional)</h3>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Status update note..." className="input-field mb-4 h-24" />
            <div className="flex gap-3">
              <button onClick={() => setNoteModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={confirmUpdate} className="btn-primary flex-1">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
