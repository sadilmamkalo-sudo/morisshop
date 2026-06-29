import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, coupon, setCoupon } = useCart();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const { subtotal, discount, total } = getCartTotal();

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await axios.post('/api/coupons/validate', { code: couponCode, orderTotal: subtotal });
      if (res.data.valid) { setCoupon(res.data.coupon); toast.success('Coupon applied!'); }
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid coupon'); }
  };

  const getLocalizedName = (item) => item.name?.[lang] || item.name?.en || '';

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-clay-50 dark:bg-ink-950">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-display mb-4">{t('cart.empty')}</h2>
          <p className="text-ink-500 mb-8">Votre panier est vide, decouvrez nos produits</p>
          <Link to="/shop" className="btn-primary inline-block">{t('cart.continueShopping')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-bold font-display">{t('cart.title')}</h1>
        <span className="text-ink-500">{cart.length} items</span>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-5">
          {cart.map((item, i) => (
            <motion.div key={item._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="card p-5 flex items-center gap-5">
              <div className="w-24 h-24 rounded bg-ink-50 dark:bg-ink-700 overflow-hidden shrink-0">
                {item.images?.[0] ? <img src={item.images[0]} alt={getLocalizedName(item)} loading="lazy" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full">
                  <svg className="w-8 h-8 text-ink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/shop/${item._id}`} className="font-bold text-lg hover:text-clay-500 transition-colors block truncate">{getLocalizedName(item)}</Link>
                <p className="text-2xl font-bold text-clay-500 mt-1">{item.price} <span className="text-sm">DH</span></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-ink-50 dark:bg-ink-700 rounded overflow-hidden">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center font-bold hover:bg-ink-200 dark:hover:bg-ink-600 transition-colors">-</button>
                  <span className="w-10 text-center font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center font-bold hover:bg-ink-200 dark:hover:bg-ink-600 transition-colors">+</button>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="font-bold text-lg">{(item.price * item.quantity).toFixed(2)} <span className="text-sm">DH</span></p>
                  <button onClick={() => removeFromCart(item._id)} className="text-red-500 text-sm hover:underline">{t('cart.remove')}</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-28">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-lg"><span>{t('cart.subtotal')}</span><span className="font-semibold">{subtotal.toFixed(2)} DH</span></div>
              {discount > 0 && <div className="flex justify-between text-emerald-500"><span>{t('cart.discount')}</span><span className="font-semibold">-{discount.toFixed(2)} DH</span></div>}
              <hr className="border-ink-200 dark:border-ink-700" />
              <div className="flex justify-between text-2xl font-bold"><span>{t('cart.total')}</span><span>{total.toFixed(2)} DH</span></div>
            </div>

            <div className="flex gap-2 mb-6">
              <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder={t('cart.coupon')} className="input py-2.5 flex-1 text-sm" />
              <button onClick={applyCoupon} className="btn-primary py-2.5 text-sm">{t('cart.applyCoupon')}</button>
            </div>

            <button onClick={() => { if (!user) { navigate('/login'); return; } navigate('/checkout'); }} className="btn-secondary w-full text-lg">
              {t('cart.checkout')}
            </button>

            <Link to="/shop" className="block text-center mt-4 text-clay-500 hover:underline text-sm">{t('cart.continueShopping')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
