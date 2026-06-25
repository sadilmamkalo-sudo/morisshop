import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationsDropdown() {
  const { notifications, unreadCount, markRead, markAllRead } = useSocket();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const typeIcons = { order: '📦', ticket: '🎫', promo: '🏷️', review: '⭐', system: '🔔' };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-amber-500 hover:text-amber-600">Mark all read</button>}
            </div>
            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">No notifications</p>
              ) : (
                notifications.slice(0, 20).map(n => (
                  <Link key={n._id} to={n.link || '#'} onClick={() => { markRead(n._id); setOpen(false); }} className={`flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!n.isRead ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                    <span className="text-lg">{typeIcons[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                    </div>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />}
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
