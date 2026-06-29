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
    <div className="min-h-screen bg-orange-50 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950 py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold font-display  mb-10 flex items-center gap-3">
            <span className="w-1 h-8 bg-clay-500 rounded-full inline-block"></span>
            Subscription
          </h1>

          <div className="card p-6 mb-10">
            <h2 className="text-xl font-bold mb-4">Current Plan</h2>
            {currentPlan ? (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded bg-clay-500 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                  {currentPlan === 'yearly' ? 'Y' : currentPlan === 'monthly' ? 'M' : 'W'}
                </div>
                <div>
                  <p className="text-lg font-bold capitalize">{currentPlan}</p>
                  <p className="text-sm text-ink-500">{plans[currentPlan]?.features.length} features included</p>
                </div>
              </div>
            ) : (
              <p className="text-ink-500">No active subscription. Choose a plan below.</p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(plans).map(([key, plan]) => {
              const isCurrent = currentPlan === key;
              return (
                <motion.div key={key} whileHover={{ y: -5 }} className={`card p-6 relative ${isCurrent ? 'ring-2 ring-clay-500 shadow-sm shadow-clay-500/20' : ''}`}>
                  {isCurrent && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-clay-500 text-white text-xs font-bold rounded-full shadow-sm">Current</div>}
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold  mb-2">{plan.price}</div>
                    <div className="text-sm text-ink-400">DH / {plan.period}</div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-4">{plan.name}</h3>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-400">
                        <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleUpgrade(key)} disabled={loading || isCurrent} className={`w-full py-3 rounded font-semibold transition-all text-sm ${isCurrent ? 'bg-ink-50 dark:bg-ink-700 text-ink-400 cursor-not-allowed' : 'btn-primary'}`}>
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
