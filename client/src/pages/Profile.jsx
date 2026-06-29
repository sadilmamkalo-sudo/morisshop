import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { motion } from 'framer-motion';
import { fetchApi } from '../utils/api';
import toast from 'react-hot-toast';

const tiers = { bronze: '', silver: '', gold: '', platinum: '' };

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', phone: '', street: '', city: '', zip: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [loyalty, setLoyalty] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', street: user.address?.street || '', city: user.address?.city || '', zip: user.address?.zip || '' });
      fetchApi('/loyalty').then(setLoyalty).catch(() => {});
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, address: { street: form.street, city: form.city, zip: form.zip } }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      updateUser(data);
      toast.success(t('profile.updated'));
    } catch (err) { toast.error(err.message || t('common.error')); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/password', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(passwordForm) });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success('Password updated!');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(err.message || t('common.error')); }
  };

  if (!user) return null;

  const tierName = loyalty?.tier || 'bronze';
  const nextTier = tierName === 'bronze' ? 'silver (500)' : tierName === 'silver' ? 'gold (1500)' : tierName === 'gold' ? 'platinum (3000)' : null;

  return (
    <div className="min-h-screen bg-orange-50 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-6 mb-10">
            <div className="w-20 h-20 rounded bg-clay-500 flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-clay-500/30">{user.name?.[0]?.toUpperCase()}</div>
            <div>
              <h1 className="text-3xl font-bold font-display ">{t('profile.title')}</h1>
              <p className="text-ink-500">{user.email}</p>
            </div>
          </div>

          {loyalty && (
            <div className="card p-6 mb-8 bg-clay-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{tiers[tierName] || ''}</span>
                  <div>
                    <p className="text-lg font-bold">{tierName.toUpperCase()} Member</p>
                    <p className="text-sm text-ink-500">{loyalty.points} points available</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-clay-500">{loyalty.lifetimePoints}</p>
                  <p className="text-xs text-ink-500">Lifetime Points</p>
                  {nextTier && <p className="text-xs text-amber-500 mt-1">Next: {nextTier}</p>}
                </div>
              </div>
              <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-clay-500 rounded-full transition-all" style={{ width: `${Math.min(100, (loyalty.lifetimePoints / 3000) * 100)}%` }} />
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-clay-500/10 flex items-center justify-center text-clay-500 text-sm font-bold"></span>
                {t('profile.info')}
              </h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('auth.name')} className="input" required />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={t('auth.email')} className="input" required />
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder={t('auth.phone')} className="input" />
                <input type="text" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} placeholder={t('profile.street')} className="input" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder={t('profile.city')} className="input" />
                  <input type="text" value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} placeholder={t('profile.zip')} className="input" />
                </div>
                <button type="submit" className="btn-primary w-full">{t('profile.save')}</button>
              </form>
            </div>

            <div className="space-y-8">
              <div className="card p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 text-sm font-bold"></span>
                  {t('profile.changePassword')}
                </h2>
                <form onSubmit={handlePassword} className="space-y-4">
                  <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} placeholder={t('profile.currentPassword')} className="input" required />
                  <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder={t('profile.newPassword')} className="input" required minLength={6} />
                  <button type="submit" className="btn-primary w-full">{t('profile.save')}</button>
                </form>
              </div>

              <div className="card p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 text-sm font-bold"></span>
                  {t('profile.language')}
                </h2>
                <div className="flex gap-2">
                  {[
                    { code: 'ar', flag: '', label: 'العربية' },
                    { code: 'fr', flag: '', label: 'Français' },
                    { code: 'en', flag: '', label: 'English' },
                  ].map(l => (
                    <button key={l.code} onClick={() => setLang(l.code)} className={`flex-1 px-4 py-3 rounded text-sm font-bold transition-all ${lang === l.code ? 'bg-clay-500 text-white shadow-sm shadow-clay-500/30 scale-105' : 'bg-ink-50 dark:bg-gray-800 text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-gray-700'}`}>
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 text-sm font-bold"></span>
                  Subscription
                </h2>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-ink-500">Current Plan</p>
                    <p className="text-lg font-bold capitalize">{user.subscription?.plan || 'Free'}</p>
                  </div>
                  <Link to="/subscription" className="btn-primary text-sm py-2 px-4">Manage</Link>
                </div>
                {user.subscription?.plan && (
                  <p className="text-xs text-ink-400">Valid until: {new Date(user.subscription.endDate).toLocaleDateString()}</p>
                )}
              </div>

              <button onClick={logout} className="w-full py-3 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold border-2 border-red-500/20 hover:border-red-500/40 transition-all">
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
