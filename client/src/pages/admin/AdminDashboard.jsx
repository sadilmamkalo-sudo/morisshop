import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useI18n } from '../../context/I18nContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444', '#6366f1'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const { t } = useI18n();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setStats(res.data)).catch(() => {});
  }, []);

  const cards = [
    { label: t('admin.totalUsers'), value: stats?.totalUsers || 0, icon: '👥', color: 'from-blue-500 to-blue-600', link: '/admin/users' },
    { label: t('admin.totalProducts'), value: stats?.totalProducts || 0, icon: '📦', color: 'from-green-500 to-emerald-600', link: '/admin/products' },
    { label: t('admin.totalOrders'), value: stats?.totalOrders || 0, icon: '📋', color: 'from-purple-500 to-violet-600', link: '/admin/orders' },
    { label: t('admin.totalRevenue'), value: `${(stats?.totalRevenue || 0).toFixed(2)} DH`, icon: '💰', color: 'from-moris-500 to-orange-500', link: '/admin/orders' },
  ];

  const menuItems = [
    { label: t('admin.products'), icon: '📦', link: '/admin/products' },
    { label: t('admin.orders'), icon: '📋', link: '/admin/orders' },
    { label: t('admin.users'), icon: '👥', link: '/admin/users' },
    { label: t('admin.admins'), icon: '🔐', link: '/admin/admins' },
    { label: t('admin.coupons'), icon: '🏷️', link: '/admin/coupons' },
    { label: t('admin.tickets'), icon: '🎫', link: '/admin/tickets' },
    { label: 'Activity Logs', icon: '📝', link: '/admin/activity-logs' },
    { label: 'Returns', icon: '↩️', link: '/admin/returns' },
    { label: 'Gift Cards', icon: '🎁', link: '/admin/gift-cards' },
    { label: 'Analytics', icon: '📊', link: '/admin/analytics' },
    { label: 'Blog', icon: '📝', link: '/admin/blog' },
    { label: 'Backup', icon: '💾', link: '/admin/backup' },
    { label: 'Live Chat', icon: '💬', link: '/admin/live-chat' },
    { label: 'Shipping', icon: '🚚', link: '/admin/shipping' },
    { label: 'Newsletter', icon: '📧', link: '/admin/newsletter' },
    { label: 'Pages', icon: '📄', link: '/admin/pages' },
    { label: 'Settings', icon: '⚙️', link: '/admin/settings' },
  ];


  const pieData = stats?.ordersByStatus?.map(s => ({ name: t(`order.${s._id}`), value: s.count })) || [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold font-display text-gradient mb-10 flex items-center gap-3">
        <span className="w-1 h-8 bg-gradient-to-b from-moris-500 to-orange-500 rounded-full inline-block"></span>
        {t('admin.dashboard')}
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {cards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Link to={card.link} className="card-solid block p-6 group hover:-translate-y-1 transition-all duration-300">
              <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>{card.icon}</div>
              <p className="text-3xl font-bold font-display">{card.value}</p>
              <p className="text-gray-500 text-sm">{card.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {menuItems.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.05 }}>
            <Link to={item.link} className="card-solid block p-6 text-center hover:-translate-y-1 transition-all duration-300 group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">{item.icon}</div>
              <p className="font-semibold text-sm">{item.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {pieData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-solid p-6">
            <h2 className="text-xl font-bold mb-4 text-gradient">{t('order.title')} Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {pieData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-solid p-6">
            <h2 className="text-xl font-bold mb-4 text-gradient">{t('order.title')} Bar Chart</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                <defs><linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#d97706" /></linearGradient></defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
