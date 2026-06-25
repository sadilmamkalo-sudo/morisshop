import { useState, useEffect } from 'react';
import axios from 'axios';
import { useI18n } from '../../context/I18nContext';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const { t } = useI18n();

  const fetchUsers = () => {
    const token = localStorage.getItem('token');
    axios.get('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUsers(res.data)).catch(() => {});
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleActive = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/users/${id}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('User status toggled');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-display text-gradient mb-8 flex items-center gap-3">
        <span className="w-1 h-8 bg-gradient-to-b from-moris-500 to-orange-500 rounded-full inline-block"></span>
        {t('admin.users')}
      </h1>

      <div className="card-solid overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-dark-800/50">
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.role === 'client').map(user => (
              <tr key={user._id} className="border-t border-gray-100 dark:border-dark-700/50 hover:bg-gray-50 dark:hover:bg-dark-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-moris-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">{user.name?.[0]?.toUpperCase()}</div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                <td className="px-4 py-3 text-sm">{user.phone || '-'}</td>
                <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300">{user.role}</span></td>
                <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(user._id)} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400'}`}>
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.filter(u => u.role === 'client').length === 0 && <p className="text-center py-8 text-gray-500">{t('common.noData')}</p>}
      </div>
    </div>
  );
}
