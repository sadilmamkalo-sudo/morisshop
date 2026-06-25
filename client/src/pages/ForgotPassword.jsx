import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      toast.success('If this email is registered, you will receive a password reset link.');
      setEmail('');
    } catch (err) {
      toast.success('If this email is registered, you will receive a password reset link.');
      setEmail('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-moris-50 via-yellow-50 to-orange-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="glass-card p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-moris-500 to-orange-500 flex items-center justify-center shadow-lg shadow-moris-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <h1 className="text-3xl font-bold font-display text-gradient">Forgot Password</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Enter your email to receive a reset link</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className="input-field" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-lg">{loading ? 'Sending...' : 'Send Reset Link'}</button>
          </form>
          <p className="text-center mt-6 text-gray-500">
            Remember your password?{' '}
            <Link to="/login" className="text-moris-500 hover:underline font-semibold">Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
