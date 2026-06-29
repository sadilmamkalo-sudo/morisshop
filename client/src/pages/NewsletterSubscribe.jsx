import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/newsletter/subscribe', { email });
      toast.success('Successfully subscribed to newsletter!');
      setSubscribed(true);
    } catch (err) { toast.error(err.response?.data?.message || 'Subscription failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-orange-50 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className=" p-8 md:p-10 text-center">
          {subscribed ? (
            <div>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h1 className="text-2xl font-bold font-display  mb-2">You're subscribed!</h1>
              <p className="text-ink-500">Thank you for subscribing to our newsletter.</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded bg-clay-500 flex items-center justify-center shadow-sm shadow-clay-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h1 className="text-3xl font-bold font-display  mb-2">Newsletter</h1>
              <p className="text-ink-500 dark:text-ink-400 mb-6">Subscribe to get the latest updates and offers</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className="input" required />
                <button type="submit" disabled={loading} className="btn-primary w-full text-lg">{loading ? 'Subscribing...' : 'Subscribe'}</button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
