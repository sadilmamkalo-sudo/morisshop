import { useState, useEffect } from 'react';
import axios from 'axios';
import { useI18n } from '../../context/I18nContext';
import { removeRecentlyViewed } from '../../utils/recentlyViewed';
import toast from 'react-hot-toast';
export default function AdminProducts() {
 const [products, setProducts] = useState([]);
 const [showForm, setShowForm] = useState(false);
 const [editing, setEditing] = useState(null);
 const [form, setForm] = useState({ name: { ar: '', fr: '', en: '' }, description: { ar: '', fr: '', en: '' }, price: '', oldPrice: '', category: '', stock: '', images: '', isFeatured: false, tags: '', variants: [] });
 const [uploading, setUploading] = useState(false);
 const { t } = useI18n();
 const fetchProducts = () => { axios.get('/api/products?limit=100').then(res => setProducts(res.data.products || [])).catch(() => {}); };
 useEffect(() => { fetchProducts(); }, []);
 const resetForm = () => setForm({ name: { ar: '', fr: '', en: '' }, description: { ar: '', fr: '', en: '' }, price: '', oldPrice: '', category: '', stock: '', images: '', isFeatured: false, tags: '', variants: [] });
  const handleEdit = (p) => {
  const name = typeof p.name === 'object' && p.name ? p.name : { ar: p.name || '', fr: p.name || '', en: p.name || '' };
  const desc = typeof p.description === 'object' && p.description ? p.description : { ar: p.description || '', fr: p.description || '', en: p.description || '' };
  setForm({ name, description: desc, price: p.price, oldPrice: p.oldPrice || '', category: p.category, stock: p.stock, images: p.images?.join(', ') || '', isFeatured: p.isFeatured, tags: p.tags?.join(', ') || '', variants: p.variants || [] });
  setEditing(p._id); setShowForm(true);
  };
 const handleImageUpload = async (e) => {
 const files = e.target.files;
 if (!files.length) return;
 setUploading(true);
 try {
 const token = localStorage.getItem('token');
 const formData = new FormData();
 for (const f of files) formData.append('images', f);
 const res = await axios.post('/api/upload', formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
 const urls = res.data.images;
 setForm(prev => ({ ...prev, images: prev.images ? `${prev.images}, ${urls.join(', ')}` : urls.join(', ') }));
 toast.success('Images uploaded');
 } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
 setUploading(false);
 };
 const addVariant = () => setForm(prev => ({ ...prev, variants: [...prev.variants, { name: '', type: 'size', price: '', stock: 0, image: '' }] }));
 const removeVariant = (i) => setForm(prev => ({ ...prev, variants: prev.variants.filter((_, idx) => idx !== i) }));
 const updateVariant = (i, field, value) => setForm(prev => {
 const v = [...prev.variants]; v[i] = { ...v[i], [field]: value }; return { ...prev, variants: v };
 });
 const handleSubmit = async (e) => {
 e.preventDefault();
 const data = {
 ...form,
 price: Number(form.price), oldPrice: Number(form.oldPrice) || 0, stock: Number(form.stock),
 images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
 tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
 variants: form.variants
 };
 try {
 const token = localStorage.getItem('token');
 if (editing) { await axios.put(`/api/products/${editing}`, data, { headers: { Authorization: `Bearer ${token}` } }); toast.success('Product updated'); }
 else { await axios.post('/api/products', data, { headers: { Authorization: `Bearer ${token}` } }); toast.success('Product created'); }
 setShowForm(false); setEditing(null); resetForm(); fetchProducts();
 } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
 };
 const handleDelete = async (id) => {
 if (!confirm('Delete product?')) return;
 try { const token = localStorage.getItem('token'); await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } }); removeRecentlyViewed(id); toast.success('Product deleted'); fetchProducts(); }
 catch (err) { toast.error(err.response?.data?.message || 'Error'); }
 };
 return (
 <div className="max-w-7xl mx-auto px-4 py-8">
 <div className="flex justify-between items-center mb-8">
 <h1 className="text-3xl font-bold font-display flex items-center gap-3">
 <span className="w-1 h-8 bg-clay-500 rounded-full inline-block"></span>
 {t('admin.products')}
 </h1>
 <button onClick={() => { setShowForm(!showForm); setEditing(null); resetForm(); }} className="btn-primary">{t('admin.addProduct')}</button>
 </div>
 {showForm && (
 <form onSubmit={handleSubmit} className="card p-6 mb-8">
 <div className="grid md:grid-cols-3 gap-4 mb-4">
 <div><label className="block text-sm font-medium mb-1">Name (AR)</label><input value={form.name.ar} onChange={e => setForm({ ...form, name: { ...form.name, ar: e.target.value } })} className="input" required /></div>
 <div><label className="block text-sm font-medium mb-1">Name (FR)</label><input value={form.name.fr} onChange={e => setForm({ ...form, name: { ...form.name, fr: e.target.value } })} className="input" required /></div>
 <div><label className="block text-sm font-medium mb-1">Name (EN)</label><input value={form.name.en} onChange={e => setForm({ ...form, name: { ...form.name, en: e.target.value } })} className="input" required /></div>
 </div>
 <div className="grid md:grid-cols-3 gap-4 mb-4">
 <div className="md:col-span-3"><label className="block text-sm font-medium mb-1">Desc (AR)</label><textarea value={form.description.ar} onChange={e => setForm({ ...form, description: { ...form.description, ar: e.target.value } })} className="input"></textarea></div>
 <div><label className="block text-sm font-medium mb-1">Desc (FR)</label><textarea value={form.description.fr} onChange={e => setForm({ ...form, description: { ...form.description, fr: e.target.value } })} className="input"></textarea></div>
 <div><label className="block text-sm font-medium mb-1">Desc (EN)</label><textarea value={form.description.en} onChange={e => setForm({ ...form, description: { ...form.description, en: e.target.value } })} className="input"></textarea></div>
 </div>
 <div className="grid md:grid-cols-4 gap-4 mb-4">
 <div><label className="block text-sm font-medium mb-1">Price (DH)</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input" required /></div>
 <div><label className="block text-sm font-medium mb-1">Old Price</label><input type="number" value={form.oldPrice} onChange={e => setForm({ ...form, oldPrice: e.target.value })} className="input" /></div>
 <div><label className="block text-sm font-medium mb-1">Category</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input" required /></div>
 <div><label className="block text-sm font-medium mb-1">Stock</label><input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="input" required /></div>
 </div>
 <div className="mb-4">
 <label className="block text-sm font-medium mb-1">Images (URLs or Upload)</label>
 <div className="flex gap-2 mb-2">
 <input value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} className="input flex-1" placeholder="URL1, URL2, ..." />
 <label className="btn-primary py-2 cursor-pointer text-sm whitespace-nowrap">{uploading ? 'Uploading...' : ' Upload'} <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" /></label>
 </div>
 </div>
 <div className="grid md:grid-cols-2 gap-4 mb-4">
 <div><label className="block text-sm font-medium mb-1">Tags (comma)</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="input" /></div>
 <div className="flex items-end"><label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="text-clay-500 w-5 h-5" /><span>Featured</span></label></div>
 </div>
 <div className="mb-4">
 <div className="flex justify-between items-center mb-2"><label className="font-medium">Variants (Sizes/Colors)</label><button type="button" onClick={addVariant} className="text-sm text-clay-500 hover:underline">+ Add Variant</button></div>
 {form.variants.map((v, i) => (
 <div key={i} className="flex gap-2 mb-2 items-center">
 <input value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)} className="input py-1 flex-1" placeholder="Name (e.g. XL, Red)" />
 <select value={v.type} onChange={e => updateVariant(i, 'type', e.target.value)} className="input py-1 w-24"><option value="size">Size</option><option value="color">Color</option></select>
 <input type="number" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} className="input py-1 w-24" placeholder="Price" />
 <input type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', Number(e.target.value))} className="input py-1 w-20" placeholder="Stock" />
 <button type="button" onClick={() => removeVariant(i)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded-lg transition-colors"></button>
 </div>
 ))}
 </div>
 <button type="submit" className="btn-primary">{editing ? t('common.edit') : t('common.add')}</button>
 </form>
 )}
 <div className="card overflow-hidden">
 <table className="w-full">
 <thead>
 <tr className="bg-ink-50 dark:bg-ink-800/50">
 <th className="px-4 py-3 text-left text-sm font-semibold">Image</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Variants</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
 <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
 </tr>
 </thead>
 <tbody>
 {products.map(p => (
 <tr key={p._id} className="border-t border-ink-100 dark:border-ink-700/50 hover:bg-ink-50 dark:hover:bg-ink-800/30 transition-colors">
 <td className="px-4 py-3">{p.images?.[0] ? <img src={p.images[0]} className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded bg-ink-200 dark:bg-ink-700"></div>}</td>
 <td className="px-4 py-3 font-medium">{p.name?.en}</td>
 <td className="px-4 py-3 font-bold text-clay-500">{p.price} DH</td>
 <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-xs font-semibold ${p.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>{p.stock > 0 ? p.stock : 'Out'}</span></td>
 <td className="px-4 py-3 text-sm text-ink-500">{p.variants?.length || 0} variants</td>
 <td className="px-4 py-3"><span className="px-2 py-1 rounded-lg bg-clay-100 text-clay-700 dark:bg-clay-900/30 dark:text-clay-300 text-xs font-medium">{p.category}</span></td>
 <td className="px-4 py-3">
 <div className="flex gap-3">
 <button onClick={() => handleEdit(p)} className="text-blue-500 hover:underline text-sm font-medium"> {t('common.edit')}</button>
 <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:underline text-sm font-medium"> {t('common.delete')}</button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {products.length === 0 && <p className="text-center py-8 text-ink-500">{t('common.noData')}</p>}
 </div>
 </div>
 );
}
