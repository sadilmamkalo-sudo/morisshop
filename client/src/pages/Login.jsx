import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { t } = useI18n();
  const { siteName } = useSiteConfig();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success(t('auth.loginSuccess'));
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-moris-50 via-yellow-50 to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="glass-card p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-moris-500 to-orange-500 flex items-center justify-center shadow-lg shadow-moris-500/30">
              <span className="text-3xl font-bold text-white">M</span>
            </div>
            <h1 className="text-3xl font-bold font-display text-gradient">{t('auth.login')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Welcome back to {siteName}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-field" required />
              <div className="text-right mt-1">
                <a href="#" className="text-sm text-moris-500 hover:underline">{t('auth.forgotPassword')}</a>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full text-lg">{t('auth.login')}</button>
          </form>

          <div className="mt-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-700/30">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <strong>Admin demo:</strong> admin@morisshop.com / Admin123456
            </p>
          </div>

          <p className="text-center mt-6 text-gray-500 dark:text-gray-400">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-moris-500 hover:underline font-semibold">{t('auth.register')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
