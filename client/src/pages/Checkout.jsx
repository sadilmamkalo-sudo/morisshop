import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import ShippingCalculator from '../components/ShippingCalculator';

export default function Checkout() {
  const { cart, getCartTotal, clearCart, coupon, setCoupon } = useCart();
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.address || { street: '', city: '', state: '', zip: '' });
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const { subtotal, total } = getCartTotal();
  const [shippingCost, setShippingCost] = useState(0);
  const [giftWrapping, setGiftWrapping] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [loyalty, setLoyalty] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/loyalty', { headers: { Authorization: `Bearer ${token}` } }).then(res => setLoyalty(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/orders', {
        items: cart.map(item => ({ product: item._id, quantity: item.quantity, giftWrapping: item.giftWrapping })),
        shippingAddress: address,
        paymentMethod,
        couponCode: coupon?.code || '',
        giftWrapping,
        giftMessage,
        deliveryDate,
        pointsRedeemed: pointsToRedeem,
        shippingCost
      }, { headers: { Authorization: `Bearer ${token}` } });
      clearCart();
      toast.success(t('order.placed'));
      navigate(`/orders/${res.data._id}`);
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
    setLoading(false);
  };

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await axios.post('/api/coupons/validate', { code: couponCode });
      setCoupon(res.data);
      toast.success('Coupon applied!');
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid coupon'); }
  };

  const handleGiftCard = async () => {
    if (!giftCardCode.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/gift-cards/redeem', { code: giftCardCode }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Gift card applied!');
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid gift card'); }
  };

  if (cart.length === 0) { navigate('/cart'); return null; }

  const getLocalizedName = (item) => item.name?.[lang] || item.name?.en || '';

  const finalTotal = total + shippingCost + (giftWrapping ? 25 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-moris-50 via-yellow-50 to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold font-display text-gradient mb-10 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-moris-500 to-orange-500 rounded-full inline-block"></span>
            {t('cart.checkout')}
          </h1>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-8">
              <div className="card-solid p-6 md:p-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-moris-500/10 flex items-center justify-center text-moris-500 text-sm font-bold">1</span>
                  Shipping Calculator
                </h2>
                <ShippingCalculator orderTotal={total} onResult={(data) => setShippingCost(data.cost || 0)} />
              </div>

              <div className="card-solid p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-moris-500/10 flex items-center justify-center text-moris-500 text-sm font-bold">2</span>
                  {t('order.shippingAddress')}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <input type="text" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder={t('profile.street')} className="input-field" required />
                  </div>
                  <input type="text" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder={t('profile.city')} className="input-field" required />
                  <input type="text" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} placeholder={t('profile.state')} className="input-field" />
                  <input type="text" value={address.zip} onChange={e => setAddress({ ...address, zip: e.target.value })} placeholder={t('profile.zip')} className="input-field" />
                </div>
              </div>

              <div className="card-solid p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-moris-500/10 flex items-center justify-center text-moris-500 text-sm font-bold">3</span>
                  Extras
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 dark:bg-dark-800/50 border border-gray-200 dark:border-dark-700 cursor-pointer hover:border-moris-300 transition-colors">
                    <input type="checkbox" checked={giftWrapping} onChange={e => setGiftWrapping(e.target.checked)} className="w-5 h-5 text-moris-500 rounded-lg focus:ring-moris-500/20" />
                    <div>
                      <span className="font-semibold text-sm">Gift Wrapping (+25 DH)</span>
                    </div>
                  </label>
                  {giftWrapping && (
                    <textarea value={giftMessage} onChange={e => setGiftMessage(e.target.value)} placeholder="Gift message..." className="input-field min-h-[80px]" />
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-2">Delivery Date</label>
                    <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} min={tomorrow} className="input-field" />
                  </div>
                </div>
              </div>

              <div className="card-solid p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-moris-500/10 flex items-center justify-center text-moris-500 text-sm font-bold">4</span>
                  Coupon & Gift Card
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Coupon code" className="input-field flex-1" />
                    <button type="button" onClick={handleCoupon} className="btn-primary whitespace-nowrap">Apply</button>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={giftCardCode} onChange={e => setGiftCardCode(e.target.value)} placeholder="Gift card code" className="input-field flex-1" />
                    <button type="button" onClick={handleGiftCard} className="btn-secondary whitespace-nowrap">Redeem</button>
                  </div>
                </div>
              </div>

              {loyalty && loyalty.points > 0 && (
                <div className="card-solid p-6 md:p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-moris-500/10 flex items-center justify-center text-moris-500 text-sm font-bold">5</span>
                    Loyalty Points
                  </h2>
                  <p className="text-sm text-gray-500 mb-3">You have <strong className="text-moris-500">{loyalty.points}</strong> points available</p>
                  <div className="flex gap-2">
                    <input type="number" value={pointsToRedeem} onChange={e => setPointsToRedeem(Math.min(Number(e.target.value), loyalty.points))} placeholder="Points to redeem" max={loyalty.points} className="input-field flex-1" />
                    <span className="self-center text-sm text-gray-400">= {(pointsToRedeem / 100).toFixed(2)} DH</span>
                  </div>
                </div>
              )}

              <div className="card-solid p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-moris-500/10 flex items-center justify-center text-moris-500 text-sm font-bold">6</span>
                  {t('order.paymentMethod')}
                </h2>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-6 border-2 border-emerald-200 dark:border-emerald-700/30">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">💵</div>
                    <div>
                      <p className="font-bold text-lg text-emerald-700 dark:text-emerald-300">{t('order.cod')}</p>
                      <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">Payez en espèces à la livraison — Aucun frais supplémentaire</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="card-solid p-6 md:p-8 sticky top-28">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 text-sm font-bold">{t('cart.title')}</span>
                </h2>

                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-dark-700 overflow-hidden shrink-0">
                        {item.images?.[0] ? <img src={item.images[0]} alt={getLocalizedName(item)} loading="lazy" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-lg">📦</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{getLocalizedName(item)}</p>
                        <p className="text-xs text-gray-500">x{item.quantity}{item.giftWrapping ? ' 🎁' : ''}</p>
                      </div>
                      <span className="font-bold text-moris-500">{(item.price * item.quantity).toFixed(2)} DH</span>
                    </div>
                  ))}
                </div>

                <hr className="border-gray-200 dark:border-dark-700 mb-4" />

                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">{t('cart.subtotal')}</span><span>{subtotal.toFixed(2)} DH</span></div>
                  {coupon && <div className="flex justify-between text-emerald-500"><span>{t('cart.discount')}</span><span>-{(total - subtotal).toFixed(2)} DH</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shippingCost > 0 ? `${shippingCost.toFixed(2)} DH` : 'To be calculated'}</span></div>
                  {giftWrapping && <div className="flex justify-between"><span className="text-gray-500">Gift Wrapping</span><span>25.00 DH</span></div>}
                  {pointsToRedeem > 0 && <div className="flex justify-between text-green-500"><span>Points Discount</span><span>-{(pointsToRedeem / 100).toFixed(2)} DH</span></div>}
                </div>

                <div className="flex justify-between text-2xl font-bold mb-8">
                  <span>{t('cart.total')}</span>
                  <span className="text-gradient">{finalTotal.toFixed(2)} DH</span>
                </div>

                <button type="submit" disabled={loading} className="btn-secondary w-full text-lg disabled:opacity-50">
                  {loading ? <span className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> {t('common.loading')}</span> : t('cart.checkout')}
                </button>

                <p className="text-xs text-gray-400 text-center mt-4">🔒 Paiement sécurisé • Livraison sous 2-5 jours</p>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
