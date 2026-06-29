import { useState, useEffect } from 'react';
import axios from 'axios';
import { useI18n } from '../../context/I18nContext';
import toast from 'react-hot-toast';
export default function AdminPages() {
 const [pages, setPages] = useState([]);
 const [editing, setEditing] = useState(null);
 const [form, setForm] = useState({ slug: '', title: { ar: '', fr: '', en: '' }, content: { ar: '', fr: '', en: '' }, published: true });
 const { lang } = useI18n();
 const token = localStorage.getItem('token');
 const headers = { Authorization: `Bearer ${token}` };
 const fetchPages = () => { axios.get('/api/admin/pages', { headers }).then(res => setPages(res.data.pages || res.data)).catch(() => {}); };
 useEffect(() => { fetchPages(); }, []);
 const resetForm = () => setForm({ slug: '', title: { ar: '', fr: '', en: '' }, content: { ar: '', fr: '', en: '' }, published: true });
 const handleEdit = (p) => {
 setForm({ slug: p.slug, title: p.title, content: p.content, published: p.published });
 setEditing(p._id);
 };
 const handleSubmit = async (e) => {
 e.preventDefault();
 try {
 if (editing) { await axios.put(`/api/admin/pages/${editing}`, form, { headers }); toast.success('Page updated'); }
 else { await axios.post('/api/admin/pages', form, { headers }); toast.success('Page created'); }
 setEditing(null); resetForm(); fetchPages();
 } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
 };
 const handleDelete = async (id) => {
 if (!confirm('Delete this page?')) return;
 try { await axios.delete(`/api/admin/pages/${id}`, { headers }); toast.success('Page deleted'); fetchPages(); }
 catch (err) { toast.error(err.response?.data?.message || 'Error'); }
 };
 const handleCreate = () => {
 const slugs = ['about', 'terms', 'privacy', 'shipping', 'returns', 'faq'];
 const existing = pages.map(p => p.slug);
 const missing = slugs.find(s => !existing.includes(s));
 if (!missing) return toast.error('All default pages exist');
 setForm({ slug: missing, title: { ar: '', fr: '', en: '' }, content: { ar: '', fr: '', en: '' }, published: true });
 setEditing(null);
 };
 return (
 <div className="max-w-7xl mx-auto px-4 py-8">
 <div className="flex justify-between items-center mb-8">
 <h1 className="text-3xl font-bold font-display flex items-center gap-3">
 <span className="w-1 h-8 bg-clay-500 rounded-full inline-block"></span>
 Static Pages
 </h1>
 <div className="flex gap-3">
 <button onClick={handleCreate} className="btn-secondary">Create Default</button>
 </div>
 </div>
 <div className="grid lg:grid-cols-2 gap-8">
 <div className="card overflow-hidden">
 <table className="w-full">
 <thead>
 <tr className="bg-ink-50 dark:bg-ink-800/50">
 <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Title (EN)</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
 </tr>
 </thead>
 <tbody>
 {pages.map(p => (
 <tr key={p._id} className="border-t border-ink-100 dark:border-ink-700/50 hover:bg-ink-50 dark:hover:bg-ink-800/30">
 <td className="px-4 py-3 font-mono text-sm">{p.slug}</td>
 <td className="px-4 py-3 font-medium">{p.title?.en || '-'}</td>
 <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-xs font-semibold ${p.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-ink-50 text-ink-500'}`}>{p.published ? 'Published' : 'Draft'}</span></td>
 <td className="px-4 py-3">
 <div className="flex gap-3">
 <button onClick={() => handleEdit(p)} className="text-blue-500 hover:underline text-sm"> Edit</button>
 <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:underline text-sm"> Delete</button>
 </div>
 </td>
 </tr>
 ))}
 {pages.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-ink-500">No pages yet</td></tr>}
 </tbody>
 </table>
 </div>
 <div>
 {(editing || form.slug) && (
 <form onSubmit={handleSubmit} className="card p-6">
 <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Page' : `Create Page: ${form.slug}`}</h2>
 <div className="mb-4">
 <label className="block text-sm font-medium mb-1">Slug</label>
 <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="input" readOnly={!!editing} required />
 </div>
 <div className="grid gap-4 mb-4">
 <div><label className="block text-sm font-medium mb-1">Title (AR)</label><input value={form.title.ar} onChange={e => setForm({ ...form, title: { ...form.title, ar: e.target.value } })} className="input" /></div>
 <div><label className="block text-sm font-medium mb-1">Title (FR)</label><input value={form.title.fr} onChange={e => setForm({ ...form, title: { ...form.title, fr: e.target.value } })} className="input" /></div>
 <div><label className="block text-sm font-medium mb-1">Title (EN)</label><input value={form.title.en} onChange={e => setForm({ ...form, title: { ...form.title, en: e.target.value } })} className="input" /></div>
 </div>
 <div className="grid gap-4 mb-4">
 <div><label className="block text-sm font-medium mb-1">Content (AR)</label><textarea value={form.content.ar} onChange={e => setForm({ ...form, content: { ...form.content, ar: e.target.value } })} className="input min-h-[100px]" /></div>
 <div><label className="block text-sm font-medium mb-1">Content (FR)</label><textarea value={form.content.fr} onChange={e => setForm({ ...form, content: { ...form.content, fr: e.target.value } })} className="input min-h-[100px]" /></div>
 <div><label className="block text-sm font-medium mb-1">Content (EN)</label><textarea value={form.content.en} onChange={e => setForm({ ...form, content: { ...form.content, en: e.target.value } })} className="input min-h-[100px]" /></div>
 </div>
 <div className="flex items-center gap-4 mb-4">
 <label className="flex items-center gap-2"><input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="w-5 h-5 text-clay-500" /><span>Published</span></label>
 </div>
 <div className="flex gap-3">
 <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'} Page</button>
 <button type="button" onClick={() => { setEditing(null); resetForm(); }} className="btn-ghost">Cancel</button>
 </div>
 </form>
 )}
 </div>
 </div>
 </div>
 );
}
