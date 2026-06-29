import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const { register } = useAuth();
  const { t } = useI18n();
  const { siteName } = useSiteConfig();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      await register(form);
      toast.success(t('auth.registerSuccess'));
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-orange-50 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className=" p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded bg-clay-500 flex items-center justify-center shadow-sm shadow-clay-500/30">
              <span className="text-3xl font-bold text-white">M</span>
            </div>
            <h1 className="text-3xl font-bold font-display ">{t('auth.register')}</h1>
            <p className="text-ink-500 dark:text-ink-400 mt-2">Create your {siteName} account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.name')}</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.email')}</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.phone')}</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+212 6XXXXXXXX" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.password')}</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="•••••••• (min 6 characters)" className="input" required minLength={6} />
            </div>
            <button type="submit" className="btn-primary w-full text-lg">{t('auth.register')}</button>
          </form>

          <p className="text-center mt-6 text-ink-500 dark:text-ink-400">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-clay-500 hover:underline font-semibold">{t('auth.login')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
