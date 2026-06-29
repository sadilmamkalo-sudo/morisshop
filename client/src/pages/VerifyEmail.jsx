import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`/api/auth/verify/${token}`)
      .then(res => { setStatus('success'); setMessage(res.data.message || 'Email verified successfully!'); })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed'); });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-orange-50 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className=" p-8 md:p-10 text-center">
          {status === 'loading' && (
            <div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-clay-500 mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold font-display  mb-2">Verifying your email...</h1>
              <p className="text-ink-500">Please wait while we verify your email address.</p>
            </div>
          )}
          {status === 'success' && (
            <div>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h1 className="text-2xl font-bold font-display  mb-2">Email Verified!</h1>
              <p className="text-ink-500 mb-6">{message}</p>
              <Link to="/login" className="btn-primary inline-block">Go to Login</Link>
            </div>
          )}
          {status === 'error' && (
            <div>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <h1 className="text-2xl font-bold font-display  mb-2">Verification Failed</h1>
              <p className="text-ink-500 mb-6">{message}</p>
              <Link to="/login" className="btn-primary inline-block">Back to Login</Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
