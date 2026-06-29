import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
export default function AdminLiveChat() {
 const [chats, setChats] = useState([]);
 const [selectedChat, setSelectedChat] = useState(null);
 const [messages, setMessages] = useState([]);
 const [input, setInput] = useState('');
 const messagesEndRef = useRef(null);
 const token = localStorage.getItem('token');
 const headers = { Authorization: `Bearer ${token}` };
 useEffect(() => {
 axios.get('/api/live-chat', { headers }).then(res => setChats(res.data.chats || res.data)).catch(() => {});
 }, []);
 useEffect(() => {
 if (selectedChat) {
 axios.get(`/api/live-chat/${selectedChat._id}/messages`, { headers })
 .then(res => setMessages(res.data.messages || res.data)).catch(() => {});
 }
 }, [selectedChat]);
 useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
 const sendMessage = async (e) => {
 e.preventDefault();
 if (!input.trim() || !selectedChat) return;
 try {
 const res = await axios.post(`/api/live-chat/${selectedChat._id}/message`, { text: input.trim(), sender: 'admin' }, { headers });
 setMessages(prev => [...prev, res.data]);
 setInput('');
 } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
 };
 const closeChat = async (id) => {
 if (!confirm('Close this chat?')) return;
 try {
 await axios.put(`/api/live-chat/${id}/close`, {}, { headers });
 toast.success('Chat closed');
 setChats(prev => prev.filter(c => c._id !== id));
 if (selectedChat?._id === id) setSelectedChat(null);
 } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
 };
 return (
 <div className="max-w-7xl mx-auto px-4 py-8">
 <h1 className="text-3xl font-bold font-display mb-8 flex items-center gap-3">
 <span className="w-1 h-8 bg-clay-500 rounded-full inline-block"></span>
 Live Chat
 </h1>
 <div className="grid md:grid-cols-3 gap-6">
 <div className="md:col-span-1 card p-4">
 <h2 className="font-bold mb-4">Open Chats ({chats.length})</h2>
 <div className="space-y-2">
 {chats.filter(c => c.status !== 'closed').map(chat => (
 <button key={chat._id} onClick={() => setSelectedChat(chat)}
 className={`w-full text-left p-3 rounded transition-all ${selectedChat?._id === chat._id ? 'bg-clay-500 text-white' : 'bg-ink-50 dark:bg-ink-700/50 hover:bg-ink-50 dark:hover:bg-ink-700'}`}>
 <p className="text-sm font-medium truncate">{chat.user?.email || chat.user?.name || 'Anonymous'}</p>
 <p className={`text-xs mt-0.5 ${selectedChat?._id === chat._id ? 'text-white/70' : 'text-ink-400'}`}>
 {new Date(chat.updatedAt || chat.createdAt).toLocaleString()}
 </p>
 </button>
 ))}
 {chats.filter(c => c.status !== 'closed').length === 0 && (
 <p className="text-sm text-ink-400 text-center py-4">No open chats</p>
 )}
 </div>
 </div>
 <div className="md:col-span-2 card p-4 flex flex-col" style={{ height: '600px' }}>
 {selectedChat ? (
 <>
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-ink-200 dark:border-ink-700">
 <div>
 <p className="font-bold">{selectedChat.user?.email || selectedChat.user?.name || 'Anonymous'}</p>
 <p className="text-xs text-ink-400">{selectedChat._id}</p>
 </div>
 <button onClick={() => closeChat(selectedChat._id)} className="text-xs bg-red-500/10 text-red-500 px-3 py-1.5 rounded hover:bg-red-500/20 transition-colors">Close Chat</button>
 </div>
 <div className="flex-1 overflow-y-auto space-y-3 mb-4">
 {messages.length === 0 && <p className="text-center text-ink-400 py-8">No messages yet</p>}
 {messages.map((msg, i) => (
 <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
 <div className={`max-w-[75%] p-3 rounded text-sm ${msg.sender === 'admin' ? 'bg-clay-500 text-white rounded-br-sm' : 'bg-ink-50 dark:bg-ink-700 text-ink-800 dark:text-ink-200 rounded-bl-sm'}`}>
 <p>{msg.text}</p>
 <p className={`text-[10px] mt-1 ${msg.sender === 'admin' ? 'text-white/50' : 'text-ink-400'}`}>{new Date(msg.createdAt || Date.now()).toLocaleTimeString()}</p>
 </div>
 </div>
 ))}
 <div ref={messagesEndRef} />
 </div>
 <form onSubmit={sendMessage} className="flex gap-2">
 <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a reply..." className="input flex-1 py-2.5" />
 <button type="submit" disabled={!input.trim()} className="btn-primary py-2.5 px-5">Send</button>
 </form>
 </>
 ) : (
 <div className="flex items-center justify-center h-full text-ink-400">
 <div className="text-center">
 <div className="text-5xl mb-4"></div>
 <p>Select a chat to view messages</p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
