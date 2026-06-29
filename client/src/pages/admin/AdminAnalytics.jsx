import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444', '#6366f1'];
export default function AdminAnalytics() {
 const token = localStorage.getItem('token');
 const headers = { Authorization: `Bearer ${token}` };
 const [overview, setOverview] = useState(null);
 const [dailySales, setDailySales] = useState([]);
 const [monthlySales, setMonthlySales] = useState([]);
 const [bestSellers, setBestSellers] = useState([]);
 const [topCustomers, setTopCustomers] = useState([]);
 const [categoryRevenue, setCategoryRevenue] = useState([]);
 useEffect(() => {
 axios.get('/api/analytics/overview', { headers }).then(res => setOverview(res.data)).catch(() => {});
 axios.get('/api/analytics/daily-sales', { headers }).then(res => setDailySales(res.data.sales || res.data)).catch(() => {});
 axios.get('/api/analytics/monthly-sales', { headers }).then(res => setMonthlySales(res.data.sales || res.data)).catch(() => {});
 axios.get('/api/analytics/best-sellers', { headers }).then(res => setBestSellers(res.data.products || res.data)).catch(() => {});
 axios.get('/api/analytics/top-customers', { headers }).then(res => setTopCustomers(res.data.customers || res.data)).catch(() => {});
 axios.get('/api/analytics/category-revenue', { headers }).then(res => setCategoryRevenue(res.data.categories || res.data)).catch(() => {});
 }, []);
 const cards = overview ? [
 { label: 'Revenue', value: `${(overview.revenue || 0).toFixed(2)} DH`, change: overview.revenueChange || '+0%', icon: '', color: 'bg-clay-500' },
 { label: 'Orders', value: overview.orders || 0, change: overview.ordersChange || '+0%', icon: '', color: 'bg-blue-500' },
 { label: 'Users', value: overview.users || 0, change: overview.usersChange || '+0%', icon: '', color: 'bg-green-500' },
 { label: 'Products', value: overview.products || 0, change: overview.productsChange || '+0%', icon: '', color: 'bg-purple-500' },
 ] : [];
 return (
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto px-4 py-8">
 <h1 className="text-3xl font-bold font-display mb-8 flex items-center gap-3">
 <span className="w-1 h-8 bg-clay-500 rounded-full inline-block"></span>
 Analytics
 </h1>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
 {cards.map((card, i) => (
 <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-6">
 <div className={`w-12 h-12 bg-clay-500 rounded flex items-center justify-center text-2xl mb-4 shadow-sm`}>{card.icon}</div>
 <p className="text-3xl font-bold font-display">{card.value}</p>
 <p className="text-ink-500 text-sm">{card.label}</p>
 <p className={`text-xs font-semibold mt-1 ${card.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{card.change}</p>
 </motion.div>
 ))}
 </div>
 <div className="grid md:grid-cols-2 gap-8 mb-10">
 <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
 <h2 className="text-xl font-bold mb-4 ">Daily Sales (30 days)</h2>
 <ResponsiveContainer width="100%" height={300}>
 <BarChart data={dailySales}>
 <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
 <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickFormatter={(v) => v?.slice(5) || ''} />
 <YAxis stroke="#9CA3AF" fontSize={12} />
 <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
 <Bar dataKey="revenue" fill="url(#dailyGrad)" radius={[6, 6, 0, 0]} />
 <defs><linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#d97706" /></linearGradient></defs>
 </BarChart>
 </ResponsiveContainer>
 </motion.div>
 <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
 <h2 className="text-xl font-bold mb-4 ">Monthly Sales (12 months)</h2>
 <ResponsiveContainer width="100%" height={300}>
 <LineChart data={monthlySales}>
 <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
 <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
 <YAxis stroke="#9CA3AF" fontSize={12} />
 <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
 <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b' }} />
 </LineChart>
 </ResponsiveContainer>
 </motion.div>
 </div>
 <div className="grid md:grid-cols-2 gap-8 mb-10">
 <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
 <h2 className="text-xl font-bold mb-4 ">Best Sellers</h2>
 <table className="w-full">
 <thead><tr className="text-left text-xs text-ink-500 uppercase"><th className="pb-3">Product</th><th className="pb-3">Sold</th><th className="pb-3">Revenue</th></tr></thead>
 <tbody>
 {bestSellers.map((item, i) => (
 <tr key={i} className="border-t border-ink-100 dark:border-ink-700/50">
 <td className="py-3 flex items-center gap-2">
 {item.image ? <img src={item.image} className="w-8 h-8 rounded-lg object-cover" /> : <div className="w-8 h-8 rounded-lg bg-ink-200 dark:bg-ink-700" />}
 <span className="text-sm font-medium">{item.name}</span>
 </td>
 <td className="py-3 text-sm font-semibold">{item.sold}</td>
 <td className="py-3 text-sm font-semibold text-clay-500">{item.revenue} DH</td>
 </tr>
 ))}
 {bestSellers.length === 0 && <tr><td colSpan={3} className="text-center py-4 text-ink-400">No data</td></tr>}
 </tbody>
 </table>
 </motion.div>
 <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
 <h2 className="text-xl font-bold mb-4 ">Top Customers</h2>
 <table className="w-full">
 <thead><tr className="text-left text-xs text-ink-500 uppercase"><th className="pb-3">Customer</th><th className="pb-3">Orders</th><th className="pb-3">Total</th></tr></thead>
 <tbody>
 {topCustomers.map((c, i) => (
 <tr key={i} className="border-t border-ink-100 dark:border-ink-700/50">
 <td className="py-3 text-sm font-medium">{c.name || c.email}</td>
 <td className="py-3 text-sm">{c.orders}</td>
 <td className="py-3 text-sm font-semibold text-clay-500">{c.total} DH</td>
 </tr>
 ))}
 {topCustomers.length === 0 && <tr><td colSpan={3} className="text-center py-4 text-ink-400">No data</td></tr>}
 </tbody>
 </table>
 </motion.div>
 </div>
 {categoryRevenue.length > 0 && (
 <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
 <h2 className="text-xl font-bold mb-4 ">Revenue by Category</h2>
 <ResponsiveContainer width="100%" height={350}>
 <PieChart>
 <Pie data={categoryRevenue} cx="50%" cy="50%" outerRadius={120} paddingAngle={3} dataKey="revenue" nameKey="category" label={({ name }) => name}>
 {categoryRevenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
 </Pie>
 <Tooltip />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 </motion.div>
 )}
 </motion.div>
 );
}
