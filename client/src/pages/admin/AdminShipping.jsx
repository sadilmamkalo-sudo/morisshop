import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminShipping() {
  const [rates, setRates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ city: '', region: '', rate: '', freeShippingMin: '', estimatedDays: '' });
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchRates = () => { axios.get('/api/admin/shipping', { headers }).then(res => setRates(res.data.rates || res.data)).catch(() => {}); };
  useEffect(() => { fetchRates(); }, []);

  const resetForm = () => setForm({ city: '', region: '', rate: '', freeShippingMin: '', estimatedDays: '' });

  const handleEdit = (r) => {
    setForm({ city: r.city, region: r.region || '', rate: r.rate, freeShippingMin: r.freeShippingMin || '', estimatedDays: r.estimatedDays || '' });
    setEditing(r._id); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, rate: Number(form.rate), freeShippingMin: Number(form.freeShippingMin) || 0, estimatedDays: Number(form.estimatedDays) || 0 };
    try {
      if (editing) { await axios.put(`/api/admin/shipping/${editing}`, data, { headers }); toast.success('Rate updated'); }
      else { await axios.post('/api/admin/shipping', data, { headers }); toast.success('Rate created'); }
      setShowForm(false); setEditing(null); resetForm(); fetchRates();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this rate?')) return;
    try { await axios.delete(`/api/admin/shipping/${id}`, { headers }); toast.success('Rate deleted'); fetchRates(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-display text-gradient flex items-center gap-3">
          <span className="w-1 h-8 bg-gradient-to-b from-moris-500 to-orange-500 rounded-full inline-block"></span>
          Shipping Rates
        </h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); resetForm(); }} className="btn-primary">{showForm ? 'Cancel' : 'Add Rate'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-solid p-6 mb-8">
          <div className="grid md:grid-cols-5 gap-4 mb-4">
            <div><label className="block text-sm font-medium mb-1">City</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">Region</label><input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Rate (DH)</label><input type="number" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">Free Shipping Min</label><input type="number" value={form.freeShippingMin} onChange={e => setForm({ ...form, freeShippingMin: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Est. Days</label><input type="number" value={form.estimatedDays} onChange={e => setForm({ ...form, estimatedDays: e.target.value })} className="input-field" /></div>
          </div>
          <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'} Rate</button>
        </form>
      )}

      <div className="card-solid overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-dark-800/50">
              <th className="px-4 py-3 text-left text-sm font-semibold">City</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Region</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Rate</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Free Shipping Min</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Est. Days</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rates.map(r => (
              <tr key={r._id} className="border-t border-gray-100 dark:border-dark-700/50 hover:bg-gray-50 dark:hover:bg-dark-800/30">
                <td className="px-4 py-3 font-medium">{r.city}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{r.region || '-'}</td>
                <td className="px-4 py-3 font-semibold text-moris-500">{r.rate} DH</td>
                <td className="px-4 py-3 text-sm">{r.freeShippingMin ? `${r.freeShippingMin} DH` : '-'}</td>
                <td className="px-4 py-3 text-sm">{r.estimatedDays ? `${r.estimatedDays} days` : '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(r)} className="text-blue-500 hover:underline text-sm">✏️ Edit</button>
                    <button onClick={() => handleDelete(r._id)} className="text-red-500 hover:underline text-sm">🗑️ Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {rates.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500">No shipping rates</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
