import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import CompareButton from './CompareButton';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { lang, t } = useI18n();
  const navigate = useNavigate();

  const name = product.name?.[lang] || product.name?.en || '';
  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login first');
    try {
      const token = localStorage.getItem('token');
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
    <div className="group">
      <Link to={`/shop/${product._id}`} className="block">
        <div className="relative overflow-hidden bg-ink-50 dark:bg-ink-900 aspect-[4/5]">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display text-6xl text-ink-200 dark:text-ink-700">M</span>
            </div>
          )}

          {discount > 0 && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-clay-500 text-white text-[11px] font-medium uppercase tracking-wider">
              -{discount}%
            </span>
          )}

          {!product.isAvailable && (
            <div className="absolute inset-0 bg-white/80 dark:bg-ink-950/80 flex items-center justify-center">
              <span className="text-xs font-medium uppercase tracking-wider text-ink-600 dark:text-ink-400">
                {t('product.outOfStock')}
              </span>
            </div>
          )}

          <button
            onClick={handleWishlist}
            className="absolute top-4 right-4 w-8 h-8 bg-white/90 dark:bg-ink-900/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <svg className={`w-4 h-4 ${user?.wishlist?.includes(product._id) ? 'text-clay-500 fill-clay-500' : 'text-ink-700 dark:text-ink-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={(e) => { e.preventDefault(); addToCart(product); }}
              className="w-full py-3 bg-white dark:bg-ink-900 text-ink-900 dark:text-white text-xs font-medium uppercase tracking-wider hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
            >
              {t('product.addToCart')}
            </button>
          </div>
        </div>

        <div className="pt-5 pb-6 px-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-3 h-3 ${i < Math.round(product.averageRating) ? 'text-clay-500' : 'text-ink-200 dark:text-ink-700'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[11px] text-ink-400">({product.numReviews || 0})</span>
          </div>

          <h3 className="text-sm font-medium text-ink-900 dark:text-white mb-1.5 leading-snug">{name}</h3>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-ink-900 dark:text-white">{product.price} <span className="text-xs text-ink-500">DH</span></span>
            {product.oldPrice > product.price && (
              <span className="text-xs text-ink-400 line-through">{product.oldPrice} DH</span>
            )}
          </div>
        </div>
      </Link>
      <CompareButton productId={product._id} />
    </div>
  );
}
