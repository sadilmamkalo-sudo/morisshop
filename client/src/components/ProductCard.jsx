import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import CompareButton from './CompareButton';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { lang, t } = useI18n();
  const navigate = useNavigate();

  const name = product.name?.[lang] || product.name?.en || '';
  const description = product.description?.[lang] || product.description?.en || '';

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

  const discount = product.oldPrice && product.oldPrice > product.price ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link to={`/shop/${product._id}`} className="block card overflow-hidden h-full">
        <div className="relative overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-dark-700">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl opacity-30">🛍️</div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {discount > 0 && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-500/30">
                -{discount}%
              </span>
            </div>
          )}

          {!product.isAvailable && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold text-lg px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                {t('product.outOfStock')}
              </span>
            </div>
          )}

          <div className="absolute top-3 right-3">
            <button onClick={handleWishlist} className="w-10 h-10 rounded-2xl bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg">
              <svg className={`w-5 h-5 ${user?.wishlist?.includes(product._id) ? 'text-red-500 fill-red-500' : 'text-gray-600 dark:text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <div className="absolute bottom-3 right-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
            <button onClick={(e) => { e.preventDefault(); addToCart(product); }} className="btn-primary text-xs py-2.5 px-5 shadow-xl">
              {t('product.addToCart')}
            </button>
          </div>

          <div className="absolute bottom-3 left-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-150">
            <button onClick={(e) => { e.preventDefault(); navigate(`/shop/${product._id}`); }} className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm text-xs font-semibold px-3 py-2 rounded-xl shadow-lg hover:bg-white dark:hover:bg-dark-700 transition-all">
              Quick View
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.averageRating) ? 'text-yellow-400' : 'text-gray-200 dark:text-dark-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.numReviews})</span>
          </div>

          <h3 className="font-bold text-lg mb-1 group-hover:text-moris-600 dark:group-hover:text-moris-400 transition-colors leading-tight">{name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">{description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-moris-600 dark:text-moris-400">{product.price} <span className="text-sm">DH</span></span>
              {product.oldPrice > product.price && (
                <span className="text-sm text-gray-400 line-through">{product.oldPrice} DH</span>
              )}
            </div>
          </div>
        </div>
      </Link>
      <div className="px-5 pb-3 pt-0">
        <CompareButton productId={product._id} />
      </div>
    </motion.div>
  );
}
