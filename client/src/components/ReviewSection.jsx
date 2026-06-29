import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchApi } from '../utils/api';

export default function ReviewSection({ productId, token }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ avg: 0, count: 0, distribution: [0, 0, 0, 0, 0] });
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (productId) loadReviews(); }, [productId]);

  const loadReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/product/${productId}`);
      if (res.ok) { const data = await res.json(); setReviews(data.reviews); setStats(data.stats); }
    } catch {}
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetchApi('/api/reviews', 'POST', { productId, ...form }, token);
      if (res.ok) { setForm({ rating: 5, title: '', comment: '' }); loadReviews(); }
    } finally { setSubmitting(false); }
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    const res = await fetchApi(`/api/reviews/${id}`, 'DELETE', null, token);
    if (res.ok) loadReviews();
  };

  const Star = ({ filled, onClick }) => (
    <button type="button" onClick={onClick} className={`text-xl transition-colors ${filled ? 'text-amber-400' : 'text-ink-300 dark:text-ink-600'}`}>★</button>
  );

  return (
    <div className="card p-6">
      <h3 className="section-heading mb-6">Reviews & Ratings</h3>

      <div className="flex flex-wrap gap-8 mb-8">
        <div className="text-center">
          <div className="text-5xl font-bold text-amber-500">{stats.avg}</div>
          <div className="flex gap-0.5 mt-1 justify-center">{Array.from({ length: 5 }, (_, i) => <span key={i} className={`text-lg ${i < Math.round(stats.avg) ? 'text-amber-400' : 'text-ink-300 dark:text-ink-600'}`}>★</span>)}</div>
          <p className="text-sm text-ink-500 mt-1">{stats.count} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map(star => {
            const pct = stats.count > 0 ? (stats.distribution[star - 1] / stats.count) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-right">{star}</span>
                <span className="text-amber-400">★</span>
                <div className="flex-1 h-2 bg-ink-200 dark:bg-ink-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-ink-500">{stats.distribution[star - 1]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {token && (
        <form onSubmit={submitReview} className="mb-8 p-4 bg-ink-50 dark:bg-ink-800/50 rounded-xl">
          <h4 className="font-semibold mb-3">Write a Review</h4>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map(s => <Star key={s} filled={s <= form.rating} onClick={() => setForm(f => ({ ...f, rating: s }))} />)}
          </div>
          <input type="text" placeholder="Review title (optional)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input mb-2" />
          <textarea placeholder="Share your experience..." value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} className="input mb-3 min-h-[80px]" />
          <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Submitting...' : 'Submit Review'}</button>
        </form>
      )}

      <div className="space-y-4">
        {reviews.map(r => (
          <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-b border-ink-200 dark:border-ink-700 pb-4 last:border-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{r.user?.name || 'Anonymous'}</span>
                <div className="flex">{Array.from({ length: 5 }, (_, i) => <span key={i} className={`text-sm ${i < r.rating ? 'text-amber-400' : 'text-ink-300 dark:text-ink-600'}`}>★</span>)}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                {token && <button onClick={() => deleteReview(r._id)} className="text-xs text-red-400 hover:text-red-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>}
              </div>
            </div>
            {r.title && <p className="text-sm font-medium">{r.title}</p>}
            {r.comment && <p className="text-sm text-ink-600 dark:text-ink-400 mt-1">{r.comment}</p>}
          </motion.div>
        ))}
        {reviews.length === 0 && <p className="text-center text-ink-400 py-4">No reviews yet. Be the first!</p>}
      </div>
    </div>
  );
}
