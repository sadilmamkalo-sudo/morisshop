import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import ReviewSection from '../components/ReviewSection';
import RelatedProducts from '../components/RelatedProducts';
import RecentlyViewed from '../components/RecentlyViewed';
import ImageMagnifier from '../components/ImageMagnifier';
import { addRecentlyViewed } from '../utils/recentlyViewed';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [giftWrapping, setGiftWrapping] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [qa, setQa] = useState([]);
  const [qaQuestion, setQaQuestion] = useState('');
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { t, lang } = useI18n();
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`/api/products/${id}`).then(res => { setProduct(res.data); addRecentlyViewed(res.data); }).catch(() => {});
    axios.get(`/api/products/${id}/questions`).then(res => setQa(res.data.questions || res.data)).catch(() => {});
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-clay-500"></div></div>;

  const name = product.name?.[lang] || product.name?.en;
  const description = product.description?.[lang] || product.description?.en;
  const discount = product.oldPrice && product.oldPrice > product.price ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  const handleWishlist = async () => {
    if (!user) return toast.error('Please login first');
    try {
      if (user.wishlist?.includes(product._id)) {
        await axios.delete(`/api/wishlist/${product._id}`, { headers: { Authorization: `Bearer ${token}` } });
        toast.success(t('product.removeWishlist'));
      } else {
        await axios.post(`/api/wishlist/${product._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        toast.success(t('product.addToWishlist'));
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="min-h-screen bg-clay-50 dark:bg-ink-950 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="relative overflow-hidden p-2">
              <div className="h-96 rounded overflow-hidden">
                {product.images?.[activeImg] ? (
                  <ImageMagnifier src={product.images[activeImg]} alt={name} zoomLevel={2.5} />
                ) : (
                  <div className="flex items-center justify-center h-full"><svg className="w-24 h-24 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                )}
              </div>
              {discount > 0 && (
                <span className="absolute top-6 left-6 bg-red-500 text-white text-sm px-4 py-1.5 rounded-full font-bold shadow-sm">-{discount}%</span>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`w-20 h-20 rounded overflow-hidden border-2 transition-all duration-300 ${i === activeImg ? 'border-clay-500 shadow-sm' : 'border-ink-200 opacity-70 hover:opacity-100'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-4xl font-bold font-display mb-4">{name}</h1>
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-5 h-5 ${i < Math.round(product.rating || product.averageRating) ? 'text-yellow-400' : 'text-ink-300 dark:text-ink-600'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              ))}
              <span className="text-ink-500">({product.numReviews} reviews)</span>
            </div>

            <div className="flex items-end gap-4 mb-6">
              <span className="text-4xl font-bold text-clay-500">{product.price} <span className="text-lg">DH</span></span>
              {product.oldPrice > product.price && (
                <span className="text-xl text-ink-400 line-through mb-1">{product.oldPrice} DH</span>
              )}
            </div>

            <div className="mb-6">
              {product.isAvailable ? (
                <span className="text-green-500 font-semibold flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full animate-pulse-glow"></span>{t('product.inStock')}</span>
              ) : <span className="text-red-500 font-semibold flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span>{t('product.outOfStock')}</span>}
            </div>

            <p className="text-ink-600 dark:text-ink-300 leading-relaxed mb-8">{description}</p>

            <div className="space-y-4 mb-4">
              <label className="flex items-center gap-3 p-4 rounded bg-white dark:bg-ink-800/50 border border-ink-200 dark:border-ink-700 cursor-pointer hover:border-clay-300 transition-colors">
                <input type="checkbox" checked={giftWrapping} onChange={e => setGiftWrapping(e.target.checked)} className="w-5 h-5 text-clay-500 rounded-lg focus:ring-clay-500/20" />
                <div>
                  <span className="font-semibold text-sm">Gift Wrapping</span>
                  <p className="text-xs text-ink-400">+25 DH - Premium gift wrap with personalized message</p>
                </div>
              </label>
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Date</label>
                <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} className="input" />
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <button onClick={() => addToCart({ ...product, giftWrapping, deliveryDate })} className="btn-secondary flex-1 text-lg">{t('product.addToCart')}</button>
              <button onClick={handleWishlist} className="w-14 h-14 rounded bg-white dark:bg-ink-800 border-2 border-ink-200 dark:border-ink-700 hover:border-red-300 flex items-center justify-center transition-all duration-300 group">
                <svg className={`w-6 h-6 ${user?.wishlist?.includes(product._id) ? 'text-red-500 fill-red-500' : 'text-ink-400 group-hover:text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>

            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-white dark:bg-ink-800/50 text-sm text-ink-600 dark:text-ink-400 border border-ink-200 dark:border-ink-700">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <div className="mt-16">
          <div className="card p-6 mb-8">
            <h3 className="section-heading mb-6">Questions & Answers</h3>
            {token ? (
              <form onSubmit={async (e) => { e.preventDefault(); if (!qaQuestion.trim()) return; try { await axios.post(`/api/products/${product._id}/question`, { question: qaQuestion }, { headers: { Authorization: `Bearer ${token}` } }); toast.success('Question submitted'); setQaQuestion(''); } catch (err) { toast.error(err.response?.data?.message || 'Error'); } }} className="flex gap-2 mb-6">
                <input type="text" value={qaQuestion} onChange={e => setQaQuestion(e.target.value)} placeholder="Ask a question about this product..." className="input flex-1" />
                <button type="submit" className="btn-primary">Ask</button>
              </form>
            ) : <p className="text-sm text-ink-500 mb-6">Please <Link to="/login" className="text-clay-500 hover:underline">login</Link> to ask a question.</p>}
            <div className="space-y-4">
              {qa.length === 0 && <p className="text-center text-ink-400 py-4">No questions yet. Be the first to ask!</p>}
              {qa.map((q, i) => (
                <div key={i} className="border-b border-ink-200 dark:border-ink-700 pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-clay-100 dark:bg-clay-900/30 flex items-center justify-center text-clay-600 text-sm font-bold shrink-0">Q</div>
                    <div>
                      <p className="text-sm font-medium">{q.question}</p>
                      <p className="text-xs text-ink-400 mt-1">{new Date(q.createdAt).toLocaleDateString()}</p>
                      {q.answer && (
                        <div className="mt-2 p-3 bg-ink-50 dark:bg-ink-700/50 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 text-xs font-bold">A</span>
                            <span className="text-xs font-semibold text-emerald-600">Seller</span>
                          </div>
                          <p className="text-sm text-ink-600 dark:text-ink-400">{q.answer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ReviewSection productId={product._id} token={token} />
        </div>

        <RelatedProducts category={product.category} excludeId={product._id} />
        <RecentlyViewed />
      </div>
    </div>
  );
}
