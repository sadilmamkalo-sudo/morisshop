import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
export default function AdminSettings() {
 const [settings, setSettings] = useState({});
 const [loading, setLoading] = useState(true);
 useEffect(() => {
 const token = localStorage.getItem('token');
 axios.get('/api/settings', { headers: { Authorization: `Bearer ${token}` } }).then(res => {
 setSettings(res.data);
 setLoading(false);
 }).catch(() => setLoading(false));
 }, []);
 const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
 const handleSave = async () => {
 try {
 const token = localStorage.getItem('token');
 await axios.put('/api/settings', settings, { headers: { Authorization: `Bearer ${token}` } });
 toast.success('Settings saved');
 } catch (err) {
 toast.error(err.response?.data?.message || 'Error saving settings');
 }
 };
 if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-clay-500 border-t-transparent rounded-full animate-spin"></div></div>;
 const fields = [
 { key: 'siteName', label: 'Site Name', type: 'text' },
 { key: 'siteDescription', label: 'Site Description', type: 'text' },
 { key: 'currency', label: 'Currency', type: 'text' },
 { key: 'freeShippingThreshold', label: 'Free Shipping Threshold', type: 'number' },
 { key: 'defaultShippingRate', label: 'Default Shipping Rate', type: 'number' },
 { key: 'whatsappNumber', label: 'WhatsApp Number', type: 'text' },
 { key: 'phone', label: 'Phone', type: 'text' },
 { key: 'email', label: 'Email', type: 'email' },
 { key: 'address', label: 'Address', type: 'text' },
 { key: 'footerText', label: 'Footer Text', type: 'text' },
 { key: 'metaDescription', label: 'Meta Description', type: 'text' },
 { key: 'metaKeywords', label: 'Meta Keywords', type: 'text' },
 { key: 'facebook', label: 'Facebook URL', type: 'url' },
 { key: 'instagram', label: 'Instagram URL', type: 'url' },
 { key: 'twitter', label: 'Twitter URL', type: 'url' },
 { key: 'tiktok', label: 'TikTok URL', type: 'url' },
 { key: 'logo', label: 'Logo URL', type: 'text' },
 { key: 'favicon', label: 'Favicon URL', type: 'text' },
 ];
 return (
 <div className="max-w-3xl mx-auto px-4 py-8">
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
 <h1 className="text-3xl font-bold font-display mb-8 flex items-center gap-3">
 <span className="w-1 h-8 bg-clay-500 rounded-full inline-block"></span>
 Site Settings
 </h1>
 <div className="card p-8 space-y-6">
 {fields.map(f => (
 <div key={f.key}>
 <label className="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1">{f.label}</label>
 <input type={f.type} value={settings[f.key] || ''} onChange={e => handleChange(f.key, e.target.value)} className="input w-full" />
 </div>
 ))}
 <div className="flex justify-end pt-4">
 <button onClick={handleSave} className="btn-primary">Save Settings</button>
 </div>
 </div>
 </motion.div>
 </div>
 );
}
