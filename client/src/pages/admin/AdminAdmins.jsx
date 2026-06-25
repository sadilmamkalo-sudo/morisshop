import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import toast from 'react-hot-toast';

const allPermissions = ['manage_products', 'manage_orders', 'manage_users', 'manage_admins', 'manage_coupons', 'manage_tickets', 'view_reports'];

export default function AdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', permissions: [] });
  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();
  const { t } = useI18n();

  const fetchAdmins = () => {
    const token = localStorage.getItem('token');
    axios.get('/api/admin/admins', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAdmins(res.data)).catch(() => {});
  };

  useEffect(() => { fetchAdmins(); }, []);

  const togglePermission = (perm) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`/api/admin/admins/${editingId}`, form, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Admin updated');
      } else {
        await axios.post('/api/admin/admins', form, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Admin created');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', email: '', password: '', phone: '', permissions: [] });
      fetchAdmins();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this admin?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/admins/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Admin deleted');
      fetchAdmins();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleEdit = (admin) => {
    setForm({ name: admin.name, email: admin.email, password: '', phone: admin.phone || '', permissions: admin.permissions || [] });
    setEditingId(admin._id);
    setShowForm(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-display text-gradient flex items-center gap-3">
          <span className="w-1 h-8 bg-gradient-to-b from-moris-500 to-orange-500 rounded-full inline-block"></span>
          {t('admin.admins')}
        </h1>
        {user?.role === 'superadmin' && <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', email: '', password: '', phone: '', permissions: [] }); }} className="btn-primary">{t('admin.addAdmin')}</button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-solid p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('auth.name')} className="input-field" required />
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={t('auth.email')} className="input-field" required />
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editingId ? 'Leave empty to keep' : t('auth.password')} className="input-field" required={!editingId} />
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder={t('auth.phone')} className="input-field" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">{t('admin.permissions')}</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {allPermissions.map(perm => (
                <label key={perm} className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-800/50 cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-dark-700">
                  <input type="checkbox" checked={form.permissions.includes(perm)} onChange={() => togglePermission(perm)} className="text-moris-500 w-4 h-4" />
                  <span className="text-sm">{t(`admin.${perm}`)}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary">{editingId ? t('common.edit') : t('admin.addAdmin')}</button>
        </form>
      )}

      <div className="card-solid overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-dark-800/50">
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Permissions</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin._id} className="border-t border-gray-100 dark:border-dark-700/50 hover:bg-gray-50 dark:hover:bg-dark-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">{admin.name?.[0]?.toUpperCase()}</div>
                    <span className="font-medium">{admin.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{admin.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${admin.role === 'superadmin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'}`}>{admin.role}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {admin.permissions?.map(p => <span key={p} className="px-2 py-0.5 bg-gray-100 dark:bg-dark-700 rounded-lg text-xs text-gray-600 dark:text-gray-400">{p.replace('_', ' ')}</span>)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {admin.role !== 'superadmin' && user?.role === 'superadmin' && (
                    <div className="flex gap-3">
                      <button onClick={() => handleEdit(admin)} className="text-blue-500 hover:underline text-sm font-medium">✏️ {t('common.edit')}</button>
                      <button onClick={() => handleDelete(admin._id)} className="text-red-500 hover:underline text-sm font-medium">🗑️ {t('common.delete')}</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
