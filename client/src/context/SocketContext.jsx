import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
      s.on('connect', () => s.emit('join', user._id));
      s.on('notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(c => c + 1);
      });
      setSocket(s);
      fetchNotifications();
      return () => s.close();
    } else {
      setSocket(null);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) { const data = await res.json(); setNotifications(data.notifications); setUnreadCount(data.unreadCount); }
    } catch {}
  };

  const markRead = async (id) => {
    try { await fetch(`/api/notifications/${id}/read`, { method: 'PUT' }); setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n)); setUnreadCount(c => Math.max(0, c - 1)); } catch {}
  };

  const markAllRead = async () => {
    try { await fetch('/api/notifications/read-all', { method: 'PUT' }); setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); setUnreadCount(0); } catch {}
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markRead, markAllRead }}>
      {children}
    </SocketContext.Provider>
  );
}
