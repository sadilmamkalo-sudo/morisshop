import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (open && token) {
      axios.post('/api/live-chat', {}, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setChatId(res.data._id);
          return axios.get(`/api/live-chat/${res.data._id}/messages`, { headers: { Authorization: `Bearer ${token}` } });
        })
        .then(res => setMessages(res.data.messages || res.data))
        .catch(() => {});
    }
  }, [open, token]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;
    const msg = { text: input.trim(), sender: 'user' };
    setMessages(prev => [...prev, msg]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(`/api/live-chat/${chatId}/message`, { text: msg.text }, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(prev => [...prev.slice(0, -1), res.data]);
    } catch { setMessages(prev => [...prev.slice(0, -1)]); }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="absolute bottom-20 right-0 w-80 sm:w-96 glass-card overflow-hidden shadow-2xl" style={{ maxHeight: '500px' }}>
            <div className="bg-gradient-to-r from-moris-500 to-orange-500 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <div>
                  <p className="font-bold text-sm">Live Chat</p>
                  <p className="text-xs text-white/70">We usually reply in minutes</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 bg-white dark:bg-dark-800" style={{ height: '320px' }}>
              {!token ? (
                <div className="text-center py-8 text-gray-400">
                  <p>Please login to use live chat</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">💬</div>
                  <p>Start a conversation</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-moris-500 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'}`}>
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-white/50' : 'text-gray-400'}`}>{new Date(msg.createdAt || Date.now()).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            {token && (
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 flex gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type your message..." className="input-field flex-1 py-2.5" disabled={loading} />
                <button type="submit" disabled={loading || !input.trim()} className="btn-primary py-2.5 px-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-moris-500 to-orange-500 shadow-xl shadow-moris-500/30 flex items-center justify-center transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-moris-500/40 group">
        <div className="absolute inset-1 rounded-full bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {open ? (
          <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>
    </div>
  );
}
