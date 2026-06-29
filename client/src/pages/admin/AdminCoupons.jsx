import { useState, useEffect } from 'react';
import axios from 'axios';
import { useI18n } from '../../context/I18nContext';
import toast from 'react-hot-toast';
export default function AdminCoupons() {
 const [coupons, setCoupons] = useState([]);
 const [showForm, setShowForm] = useState(false);
 const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrder: '0', maxUses: '100', expiresAt: '' });
 const [editingId, setEditingId] = useState(null);
 const { t } = useI18n();
 const fetchCoupons = () => {
 const token = localStorage.getItem('token');
 axios.get('/api/coupons', { headers: { Authorization: `Bearer ${token}` } })
 .then(res => setCoupons(res.data)).catch(() => {});
 };
 useEffect(() => { fetchCoupons(); }, []);
 const resetForm = () => setForm({ code: '', type: 'percentage', value: '', minOrder: '0', maxUses: '100', expiresAt: '' });
 const handleSubmit = async (e) => {
 e.preventDefault();
 const data = { ...form, value: Number(form.value), minOrder: Number(form.minOrder), maxUses: Number(form.maxUses) };
 try {
 const token = localStorage.getItem('token');
 if (editingId) {
 await axios.put(`/api/coupons/${editingId}`, data, { headers: { Authorization: `Bearer ${token}` } });
 toast.success('Coupon updated');
 } else {
 await axios.post('/api/coupons', data, { headers: { Authorization: `Bearer ${token}` } });
 toast.success('Coupon created');
 }
 setShowForm(false); setEditingId(null); resetForm(); fetchCoupons();
 } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
 };
 const handleDelete = async (id) => {
 if (!confirm('Delete coupon?')) return;
 try {
 const token = localStorage.getItem('token');
 await axios.delete(`/api/coupons/${id}`, { headers: { Authorization: `Bearer ${token}` } });
 toast.success('Coupon deleted'); fetchCoupons();
 } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
 };
 return (
 <div className="max-w-7xl mx-auto px-4 py-8">
 <div className="flex justify-between items-center mb-8">
 <h1 className="text-3xl font-bold font-display flex items-center gap-3">
 <span className="w-1 h-8 bg-clay-500 rounded-full inline-block"></span>
 {t('coupon.title')}
 </h1>
 <button onClick={() => { setShowForm(!showForm); setEditingId(null); resetForm(); }} className="btn-primary">{t('coupon.addCoupon')}</button>
 </div>
 {showForm && (
 <form onSubmit={handleSubmit} className="card p-6 mb-8">
 <div className="grid md:grid-cols-3 gap-4 mb-4">
 <div><label className="block text-sm font-medium mb-1">{t('coupon.code')}</label><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="input uppercase font-bold tracking-wider" required /></div>
 <div><label className="block text-sm font-medium mb-1">{t('coupon.type')}</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input"><option value="percentage">{t('coupon.percentage')}</option><option value="fixed">{t('coupon.fixed')}</option></select></div>
 <div><label className="block text-sm font-medium mb-1">{t('coupon.value')}</label><input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="input" required /></div>
 <div><label className="block text-sm font-medium mb-1">{t('coupon.minOrder')}</label><input type="number" value={form.minOrder} onChange={e => setForm({ ...form, minOrder: e.target.value })} className="input" /></div>
 <div><label className="block text-sm font-medium mb-1">{t('coupon.maxUses')}</label><input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} className="input" /></div>
 <div><label className="block text-sm font-medium mb-1">{t('coupon.expiresAt')}</label><input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="input" required /></div>
 </div>
 <button type="submit" className="btn-primary">{editingId ? t('common.edit') : t('common.add')}</button>
 </form>
 )}
 <div className="card overflow-hidden">
 <table className="w-full">
 <thead>
 <tr className="bg-ink-50 dark:bg-ink-800/50">
 <th className="px-4 py-3 text-left text-sm font-semibold">{t('coupon.code')}</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">{t('coupon.type')}</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">{t('coupon.value')}</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">{t('coupon.used')}</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">{t('coupon.expiresAt')}</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">{t('coupon.isActive')}</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">{t('common.delete')}</th>
 </tr>
 </thead>
 <tbody>
 {coupons.map(c => (
 <tr key={c._id} className="border-t border-ink-100 dark:border-ink-700/50 hover:bg-ink-50 dark:hover:bg-ink-800/30 transition-colors">
 <td className="px-4 py-3">
 <span className="font-bold font-mono tracking-wider bg-clay-50 dark:bg-clay-900/20 px-2.5 py-1 rounded-lg text-clay-600 dark:text-clay-400">{c.code}</span>
 </td>
 <td className="px-4 py-3 text-sm">{t(`coupon.${c.type}`)}</td>
 <td className="px-4 py-3 font-semibold">{c.type === 'percentage' ? `${c.value}%` : `${c.value} DH`}</td>
 <td className="px-4 py-3 text-sm">{c.usedCount}/{c.maxUses}</td>
 <td className="px-4 py-3 text-sm text-ink-500">{new Date(c.expiresAt).toLocaleDateString('fr-FR')}</td>
 <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${c.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>{c.isActive ? 'Yes' : 'No'}</span></td>
 <td className="px-4 py-3">
 <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:underline text-sm font-medium"> {t('common.delete')}</button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {coupons.length === 0 && <p className="text-center py-8 text-ink-500">{t('coupon.noCoupons')}</p>}
 </div>
 </div>
 );
}
