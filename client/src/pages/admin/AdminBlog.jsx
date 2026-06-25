import { useState, useEffect } from 'react';
import axios from 'axios';
import { useI18n } from '../../context/I18nContext';
import toast from 'react-hot-toast';

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: { ar: '', fr: '', en: '' }, description: { ar: '', fr: '', en: '' }, content: { ar: '', fr: '', en: '' }, image: '', tags: '', published: true, slug: '' });
  const { t } = useI18n();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchPosts = () => { axios.get('/api/blog', { headers }).then(res => setPosts(res.data.posts || res.data)).catch(() => {}); };
  useEffect(() => { fetchPosts(); }, []);

  const resetForm = () => setForm({ title: { ar: '', fr: '', en: '' }, description: { ar: '', fr: '', en: '' }, content: { ar: '', fr: '', en: '' }, image: '', tags: '', published: true, slug: '' });

  const handleEdit = (p) => {
    setForm({ title: p.title, description: p.description, content: p.content, image: p.image || '', tags: p.tags?.join(', ') || '', published: p.published, slug: p.slug });
    setEditing(p._id); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, tags: form.tags.split(',').map(s => s.trim()).filter(Boolean) };
    try {
      if (editing) { await axios.put(`/api/blog/${editing}`, data, { headers }); toast.success('Post updated'); }
      else { await axios.post('/api/blog', data, { headers }); toast.success('Post created'); }
      setShowForm(false); setEditing(null); resetForm(); fetchPosts();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    try { await axios.delete(`/api/blog/${id}`, { headers }); toast.success('Post deleted'); fetchPosts(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post('/api/upload', formData, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
      setForm(prev => ({ ...prev, image: res.data.url || res.data.image || res.data.images?.[0] || '' }));
      toast.success('Image uploaded');
    } catch (err) { toast.error('Upload failed'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-display text-gradient flex items-center gap-3">
          <span className="w-1 h-8 bg-gradient-to-b from-moris-500 to-orange-500 rounded-full inline-block"></span>
          Blog Management
        </h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); resetForm(); }} className="btn-primary">{showForm ? 'Cancel' : 'New Post'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-solid p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div><label className="block text-sm font-medium mb-1">Title (AR)</label><input value={form.title.ar} onChange={e => setForm({ ...form, title: { ...form.title, ar: e.target.value } })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Title (FR)</label><input value={form.title.fr} onChange={e => setForm({ ...form, title: { ...form.title, fr: e.target.value } })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Title (EN)</label><input value={form.title.en} onChange={e => setForm({ ...form, title: { ...form.title, en: e.target.value } })} className="input-field" /></div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-3"><label className="block text-sm font-medium mb-1">Description (AR)</label><textarea value={form.description.ar} onChange={e => setForm({ ...form, description: { ...form.description, ar: e.target.value } })} className="input-field"></textarea></div>
            <div><label className="block text-sm font-medium mb-1">Description (FR)</label><textarea value={form.description.fr} onChange={e => setForm({ ...form, description: { ...form.description, fr: e.target.value } })} className="input-field"></textarea></div>
            <div><label className="block text-sm font-medium mb-1">Description (EN)</label><textarea value={form.description.en} onChange={e => setForm({ ...form, description: { ...form.description, en: e.target.value } })} className="input-field"></textarea></div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-3"><label className="block text-sm font-medium mb-1">Content (AR)</label><textarea value={form.content.ar} onChange={e => setForm({ ...form, content: { ...form.content, ar: e.target.value } })} className="input-field min-h-[120px]"></textarea></div>
            <div><label className="block text-sm font-medium mb-1">Content (FR)</label><textarea value={form.content.fr} onChange={e => setForm({ ...form, content: { ...form.content, fr: e.target.value } })} className="input-field min-h-[120px]"></textarea></div>
            <div><label className="block text-sm font-medium mb-1">Content (EN)</label><textarea value={form.content.en} onChange={e => setForm({ ...form, content: { ...form.content, en: e.target.value } })} className="input-field min-h-[120px]"></textarea></div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div><label className="block text-sm font-medium mb-1">Slug</label><input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="input-field" placeholder="my-blog-post" /></div>
            <div><label className="block text-sm font-medium mb-1">Tags (comma)</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="input-field" /></div>
            <div className="flex items-end gap-2">
              <label className="block text-sm font-medium mb-1 w-full">
                Image
                <label className="btn-primary py-2 cursor-pointer text-sm block text-center mt-1">{form.image ? 'Change' : 'Upload'} <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></label>
              </label>
            </div>
          </div>
          {form.image && <img src={form.image} className="w-32 h-20 object-cover rounded-xl mb-4" />}
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="w-5 h-5 text-moris-500" /><span>Published</span></label>
          </div>
          <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'} Post</button>
        </form>
      )}

      <div className="card-solid overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-dark-800/50">
              <th className="px-4 py-3 text-left text-sm font-semibold">Image</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Title (EN)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p._id} className="border-t border-gray-100 dark:border-dark-700/50 hover:bg-gray-50 dark:hover:bg-dark-800/30">
                <td className="px-4 py-3">{p.image ? <img src={p.image} className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-dark-700 flex items-center justify-center text-sm">📰</div>}</td>
                <td className="px-4 py-3 font-medium">{p.title?.en}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{p.slug}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-xs font-semibold ${p.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>{p.published ? 'Published' : 'Draft'}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(p)} className="text-blue-500 hover:underline text-sm">✏️ Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:underline text-sm">🗑️ Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500">No posts yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
