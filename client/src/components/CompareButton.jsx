import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'morisshop_compare';

const getCompared = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};

const setCompared = (ids) => localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));

export default function CompareButton({ productId }) {
  const [compared, setComparedState] = useState(getCompared());

  useEffect(() => {
    const handleStorage = () => setComparedState(getCompared());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isCompared = compared.includes(productId);

  const toggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let updated;
    if (isCompared) {
      updated = compared.filter(id => id !== productId);
    } else {
      if (compared.length >= 4) return toast.error('Maximum 4 products can be compared');
      updated = [...compared, productId];
      toast.success('Added to compare');
    }
    setComparedState(updated);
    setCompared(updated);
    window.dispatchEvent(new Event('storage'));
  };

  const clearAll = () => {
    setComparedState([]);
    setCompared([]);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <>
      <button onClick={toggleCompare}
        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded transition-all duration-300 ${isCompared ? 'bg-clay-500 text-white shadow-sm' : 'bg-ink-50 dark:bg-ink-700 text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-600'}`}>
        <svg className={`w-3.5 h-3.5 ${isCompared ? 'text-white' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        {isCompared ? 'Comparing' : 'Compare'}
      </button>
      <AnimatePresence>
        {compared.length > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-ink-800 border-t border-ink-200 dark:border-ink-700 shadow-md px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{compared.length}/4 products selected</span>
                <button onClick={clearAll} className="text-xs text-red-500 hover:underline">Clear all</button>
              </div>
              <Link to={`/compare?ids=${compared.join(',')}`} className="btn-primary text-sm py-2 px-6">
                Compare ({compared.length})
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
