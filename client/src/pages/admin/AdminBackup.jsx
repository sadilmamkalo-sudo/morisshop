import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
export default function AdminBackup() {
 const [backups, setBackups] = useState([]);
 const [creating, setCreating] = useState(false);
 const [uploading, setUploading] = useState(false);
 const token = localStorage.getItem('token');
 const headers = { Authorization: `Bearer ${token}` };
 const fetchBackups = () => { axios.get('/api/admin/backups', { headers }).then(res => setBackups(res.data.backups || res.data)).catch(() => {}); };
 useEffect(() => { fetchBackups(); }, []);
 const createBackup = async () => {
 setCreating(true);
 try {
 const res = await axios.post('/api/admin/backups', {}, { headers });
 toast.success('Backup created!');
 fetchBackups();
 } catch (err) { toast.error(err.response?.data?.message || 'Backup failed'); }
 setCreating(false);
 };
 const handleRestore = async (e) => {
 const file = e.target.files[0];
 if (!file) return;
 if (!confirm('Restore from this backup? This will overwrite current data.')) return;
 setUploading(true);
 const formData = new FormData();
 formData.append('backup', file);
 try {
 await axios.post('/api/admin/backups/restore', formData, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
 toast.success('Backup restored!');
 fetchBackups();
 } catch (err) { toast.error(err.response?.data?.message || 'Restore failed'); }
 setUploading(false);
 };
 const handleDelete = async (id) => {
 if (!confirm('Delete this backup?')) return;
 try { await axios.delete(`/api/admin/backups/${id}`, { headers }); toast.success('Backup deleted'); fetchBackups(); }
 catch (err) { toast.error(err.response?.data?.message || 'Error'); }
 };
 return (
 <div className="max-w-7xl mx-auto px-4 py-8">
 <div className="flex justify-between items-center mb-8">
 <h1 className="text-3xl font-bold font-display flex items-center gap-3">
 <span className="w-1 h-8 bg-clay-500 rounded-full inline-block"></span>
 Backup Management
 </h1>
 <div className="flex gap-3">
 <label className="btn-secondary py-2.5 cursor-pointer">{uploading ? 'Restoring...' : ' Restore'} <input type="file" accept=".zip,.gz,.json" onChange={handleRestore} className="hidden" /></label>
 <button onClick={createBackup} disabled={creating} className="btn-primary">{creating ? 'Creating...' : ' Create Backup'}</button>
 </div>
 </div>
 <div className="card overflow-hidden">
 <table className="w-full">
 <thead>
 <tr className="bg-ink-50 dark:bg-ink-800/50">
 <th className="px-4 py-3 text-left text-sm font-semibold">Filename</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Size</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
 </tr>
 </thead>
 <tbody>
 {backups.map(b => (
 <tr key={b._id} className="border-t border-ink-100 dark:border-ink-700/50 hover:bg-ink-50 dark:hover:bg-ink-800/30">
 <td className="px-4 py-3 font-medium">{b.filename}</td>
 <td className="px-4 py-3 text-sm text-ink-500">{b.size ? `${(b.size / 1024 / 1024).toFixed(2)} MB` : '-'}</td>
 <td className="px-4 py-3 text-sm text-ink-500">{new Date(b.createdAt).toLocaleString()}</td>
 <td className="px-4 py-3">
 <div className="flex gap-3">
 <button onClick={() => window.open(`/api/admin/backups/${b._id}/download`, '_blank')} className="text-blue-500 hover:underline text-sm"> Download</button>
 <button onClick={() => handleDelete(b._id)} className="text-red-500 hover:underline text-sm"> Delete</button>
 </div>
 </td>
 </tr>
 ))}
 {backups.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-ink-500">No backups yet</td></tr>}
 </tbody>
 </table>
 </div>
 </div>
 );
}
