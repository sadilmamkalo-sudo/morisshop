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
        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-300 ${isCompared ? 'bg-moris-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-dark-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'}`}>
        <svg className={`w-3.5 h-3.5 ${isCompared ? 'text-white' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        {isCompared ? 'Comparing' : 'Compare'}
      </button>
      <AnimatePresence>
        {compared.length > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 shadow-2xl px-4 py-3">
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
