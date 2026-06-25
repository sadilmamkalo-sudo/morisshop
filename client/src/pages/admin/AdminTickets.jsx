import { useState, useEffect } from 'react';
import axios from 'axios';
import { useI18n } from '../../context/I18nContext';
import toast from 'react-hot-toast';

const statusColors = { open: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', resolved: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', closed: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' };

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const { t } = useI18n();

  const fetchTickets = () => {
    const token = localStorage.getItem('token');
    const params = filter ? `?status=${filter}` : '';
    axios.get(`/api/tickets${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setTickets(res.data)).catch(() => {});
  };

  useEffect(() => { fetchTickets(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/tickets/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Status updated');
      fetchTickets();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleReply = async (ticketId) => {
    if (!reply.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/tickets/${ticketId}/respond`, { message: reply }, { headers: { Authorization: `Bearer ${token}` } });
      setSelected(res.data);
      setReply('');
      fetchTickets();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const statuses = ['open', 'in_progress', 'resolved', 'closed'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-display text-gradient mb-8 flex items-center gap-3">
        <span className="w-1 h-8 bg-gradient-to-b from-moris-500 to-orange-500 rounded-full inline-block"></span>
        {t('admin.tickets')}
      </h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('')} className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${!filter ? 'btn-primary' : 'bg-white/50 dark:bg-dark-800/50 border border-gray-200 dark:border-dark-700 hover:bg-white'}`}>{t('common.all')}</button>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === s ? 'btn-primary' : 'bg-white/50 dark:bg-dark-800/50 border border-gray-200 dark:border-dark-700 hover:bg-white'}`}>{t(`ticket.${s}`)}</button>
        ))}
      </div>

      <div className="space-y-4">
        {tickets.map(ticket => (
          <div key={ticket._id} className="card-solid overflow-hidden transition-all duration-300">
            <button onClick={() => setSelected(selected?._id === ticket._id ? null : ticket)} className="w-full text-left p-5 hover:bg-gray-50 dark:hover:bg-dark-800/30 transition-colors">
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${ticket.priority === 'high' || ticket.priority === 'urgent' ? 'bg-red-100 text-red-600' : ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
                    {ticket.subject[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{ticket.subject}</h3>
                    <p className="text-sm text-gray-500">{ticket.user?.name} — {ticket.user?.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColors[ticket.status]}`}>{t(`ticket.${ticket.status}`)}</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${ticket.priority === 'high' || ticket.priority === 'urgent' ? 'bg-red-100 text-red-600' : ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>{t(`ticket.${ticket.priority}`)}</span>
                </div>
              </div>
            </button>
            {selected?._id === ticket._id && (
              <div className="px-5 pb-5 space-y-4 border-t border-gray-100 dark:border-dark-700/50 pt-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-800/50">
                  <p className="text-sm text-gray-500 mb-2">{ticket.user?.name} · {new Date(ticket.createdAt).toLocaleString('fr-FR')}</p>
                  <p className="text-gray-700 dark:text-gray-300">{ticket.message}</p>
                </div>

                {ticket.responses?.map((r, i) => (
                  <div key={i} className={`p-4 rounded-2xl ${r.user?.role !== 'client' ? 'bg-moris-50 dark:bg-moris-900/10 border border-moris-200/50 dark:border-moris-700/30 ml-8' : 'bg-gray-50 dark:bg-dark-800/50 mr-8'}`}>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      {r.user?.role !== 'client' ? <span className="w-5 h-5 rounded-full bg-moris-500/20 flex items-center justify-center text-xs">🛡️</span> : <span className="w-5 h-5 rounded-full bg-gray-500/20 flex items-center justify-center text-xs">👤</span>}
                      <strong>{r.user?.name || 'Support'}</strong> · {new Date(r.createdAt).toLocaleString('fr-FR')}
                    </p>
                    <p>{r.message}</p>
                  </div>
                ))}

                <div className="flex items-center gap-3">
                  <select value={ticket.status} onChange={e => updateStatus(ticket._id, e.target.value)} className="input-field w-auto py-1.5 text-sm">
                    {statuses.map(s => <option key={s} value={s}>{t(`ticket.${s}`)}</option>)}
                  </select>
                  <input type="text" value={reply} onChange={e => setReply(e.target.value)} placeholder={t('ticket.respond')} className="input-field flex-1" />
                  <button onClick={() => handleReply(ticket._id)} className="btn-primary py-2.5 whitespace-nowrap">{t('ticket.respond')}</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {tickets.length === 0 && <div className="card-solid text-center py-16"><div className="text-5xl mb-4">🎫</div><p className="text-gray-500">{t('ticket.noTickets')}</p></div>}
      </div>
    </div>
  );
}
