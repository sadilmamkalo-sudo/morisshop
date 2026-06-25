import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const priorityColors = { low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300', high: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' };
const statusColors = { open: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300', closed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' };

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' });
  const [reply, setReply] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const { user } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/tickets', { headers: { Authorization: `Bearer ${token}` } }).then(res => setTickets(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/tickets', form, { headers: { Authorization: `Bearer ${token}` } });
      setTickets([res.data, ...tickets]);
      setShowForm(false);
      setForm({ subject: '', message: '', priority: 'medium' });
      toast.success(t('ticket.created'));
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  const handleReply = async (ticketId) => {
    if (!reply.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/tickets/${ticketId}/reply`, { message: reply }, { headers: { Authorization: `Bearer ${token}` } });
      setTickets(tickets.map(t => t._id === ticketId ? res.data : t));
      setReply('');
      setReplyingTo(null);
      toast.success(t('ticket.responded'));
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-moris-50 via-yellow-50 to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-4xl font-bold font-display text-gradient flex items-center gap-3">
              <span className="w-1 h-8 bg-gradient-to-b from-moris-500 to-orange-500 rounded-full inline-block"></span>
              {t('ticket.title')}
            </h1>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">{t('ticket.newTicket')}</button>
          </div>

          {showForm && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleSubmit} className="card-solid p-6 mb-8">
              <h2 className="font-bold text-lg mb-4">{t('ticket.newTicket')}</h2>
              <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder={t('ticket.subject')} className="input-field mb-4" required />
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder={t('ticket.message')} className="input-field mb-4 h-24" required />
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input-field mb-4">
                <option value="low">{t('ticket.low')}</option>
                <option value="medium">{t('ticket.medium')}</option>
                <option value="high">{t('ticket.high')}</option>
              </select>
              <button type="submit" className="btn-primary">{t('ticket.newTicket')}</button>
            </motion.form>
          )}

          <div className="space-y-4">
            {tickets.map((ticket, i) => (
              <motion.div key={ticket._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-solid p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${ticket.priority === 'high' ? 'bg-red-100 text-red-600' : ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
                      {ticket.subject[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold">{ticket.subject}</h3>
                      <p className="text-sm text-gray-500">{new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[ticket.priority]}`}>{t(`ticket.${ticket.priority}`)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[ticket.status]}`}>{t(`ticket.${ticket.status}`)}</span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4">{ticket.message}</p>

                {ticket.responses?.map((r, j) => (
                  <div key={j} className={`p-4 rounded-2xl mb-3 ${r.isAdmin ? 'bg-moris-50 dark:bg-moris-500/5 border border-moris-200/50 dark:border-moris-700/30 ml-8' : 'bg-gray-50 dark:bg-dark-800/50 mr-8'}`}>
                    <p className="text-xs text-gray-500 mb-1"><strong>{r.isAdmin ? '🛡️ Support' : '👤 ' + (user?.name || 'You')}</strong> · {new Date(r.createdAt).toLocaleString('fr-FR')}</p>
                    <p className="text-sm">{r.message}</p>
                  </div>
                ))}

                {ticket.status === 'open' && (
                  <div className="mt-4">
                    {replyingTo === ticket._id ? (
                      <div className="flex gap-2">
                        <input type="text" value={reply} onChange={e => setReply(e.target.value)} placeholder={t('ticket.respond')} className="input-field flex-1" />
                        <button onClick={() => handleReply(ticket._id)} className="btn-primary py-2 text-sm">{t('ticket.respond')}</button>
                        <button onClick={() => { setReplyingTo(null); setReply(''); }} className="px-3 py-2 text-sm text-gray-500 hover:underline">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setReplyingTo(ticket._id)} className="text-moris-500 hover:underline text-sm">{t('ticket.respond')}</button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
            {tickets.length === 0 && (
              <div className="card-solid text-center py-16">
                <div className="text-6xl mb-4">🎫</div>
                <p className="text-gray-500">{t('ticket.noTickets')}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
