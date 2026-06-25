import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const plans = {
  weekly: { name: 'Weekly', price: '49', period: 'week', features: ['Standard delivery', 'Basic support', 'Weekly newsletter'] },
  monthly: { name: 'Monthly', price: '149', period: 'month', features: ['Free delivery', 'Priority support', 'Exclusive offers', 'Early access'] },
  yearly: { name: 'Yearly', price: '1499', period: 'year', features: ['Free delivery', 'Premium support', 'All exclusives', 'Early access', 'Free gift wrapping', 'Birthday gift'] },
};

export default function Subscription() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.subscription?.plan) {
      setCurrentPlan(user.subscription.plan);
    }
  }, [user]);

  const handleUpgrade = async (plan) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/users/subscription', { plan }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Upgraded to ${plan} plan!`);
      setCurrentPlan(plan);
    } catch (err) { toast.error(err.response?.data?.message || 'Upgrade failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-moris-50 via-yellow-50 to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold font-display text-gradient mb-10 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-moris-500 to-orange-500 rounded-full inline-block"></span>
            Subscription
          </h1>

          <div className="card-solid p-6 mb-10">
            <h2 className="text-xl font-bold mb-4">Current Plan</h2>
            {currentPlan ? (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-moris-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {currentPlan === 'yearly' ? 'Y' : currentPlan === 'monthly' ? 'M' : 'W'}
                </div>
                <div>
                  <p className="text-lg font-bold capitalize">{currentPlan}</p>
                  <p className="text-sm text-gray-500">{plans[currentPlan]?.features.length} features included</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No active subscription. Choose a plan below.</p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(plans).map(([key, plan]) => {
              const isCurrent = currentPlan === key;
              return (
                <motion.div key={key} whileHover={{ y: -5 }} className={`card-solid p-6 relative ${isCurrent ? 'ring-2 ring-moris-500 shadow-lg shadow-moris-500/20' : ''}`}>
                  {isCurrent && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-moris-500 text-white text-xs font-bold rounded-full shadow-lg">Current</div>}
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-gradient mb-2">{plan.price}</div>
                    <div className="text-sm text-gray-400">DH / {plan.period}</div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-4">{plan.name}</h3>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleUpgrade(key)} disabled={loading || isCurrent} className={`w-full py-3 rounded-2xl font-semibold transition-all text-sm ${isCurrent ? 'bg-gray-100 dark:bg-dark-700 text-gray-400 cursor-not-allowed' : 'btn-primary'}`}>
                    {loading ? 'Upgrading...' : isCurrent ? 'Current Plan' : 'Upgrade'}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
