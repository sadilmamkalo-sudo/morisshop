import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignForm, setCampaignForm] = useState({ subject: '', content: '' });
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('/api/admin/newsletter/subscribers', { headers }).then(res => setSubscribers(res.data.subscribers || res.data)).catch(() => {});
    axios.get('/api/admin/newsletter/campaigns', { headers }).then(res => setCampaigns(res.data.campaigns || res.data)).catch(() => {});
  }, []);

  const handleSendCampaign = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/newsletter/campaigns', campaignForm, { headers });
      toast.success('Campaign sent!');
      setCampaignForm({ subject: '', content: '' });
      setShowCampaignForm(false);
      axios.get('/api/admin/newsletter/campaigns', { headers }).then(res => setCampaigns(res.data.campaigns || res.data)).catch(() => {});
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
  };

  const handleDeleteSubscriber = async (id) => {
    if (!confirm('Remove this subscriber?')) return;
    try { await axios.delete(`/api/admin/newsletter/subscribers/${id}`, { headers }); toast.success('Subscriber removed'); setSubscribers(prev => prev.filter(s => s._id !== id)); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-display text-gradient mb-8 flex items-center gap-3">
        <span className="w-1 h-8 bg-gradient-to-b from-moris-500 to-orange-500 rounded-full inline-block"></span>
        Newsletter
      </h1>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="card-solid p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Subscribers ({subscribers.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="text-left text-xs text-gray-500 uppercase"><th className="pb-3">Email</th><th className="pb-3">Date</th><th className="pb-3">Actions</th></tr></thead>
              <tbody>
                {subscribers.map(s => (
                  <tr key={s._id} className="border-t border-gray-100 dark:border-dark-700/50">
                    <td className="py-3 text-sm">{s.email}</td>
                    <td className="py-3 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="py-3"><button onClick={() => handleDeleteSubscriber(s._id)} className="text-red-500 hover:underline text-xs">Remove</button></td>
                  </tr>
                ))}
                {subscribers.length === 0 && <tr><td colSpan={3} className="text-center py-4 text-gray-400">No subscribers</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-solid p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Campaigns</h2>
            <button onClick={() => setShowCampaignForm(!showCampaignForm)} className="btn-primary text-sm py-2 px-4">{showCampaignForm ? 'Cancel' : 'New Campaign'}</button>
          </div>

          {showCampaignForm && (
            <form onSubmit={handleSendCampaign} className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
              <input type="text" value={campaignForm.subject} onChange={e => setCampaignForm({ ...campaignForm, subject: e.target.value })} placeholder="Subject" className="input-field" required />
              <textarea value={campaignForm.content} onChange={e => setCampaignForm({ ...campaignForm, content: e.target.value })} placeholder="Email content..." className="input-field min-h-[150px]" required />
              <button type="submit" className="btn-primary">Send Campaign</button>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="text-left text-xs text-gray-500 uppercase"><th className="pb-3">Subject</th><th className="pb-3">Sent</th><th className="pb-3">Date</th></tr></thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c._id} className="border-t border-gray-100 dark:border-dark-700/50">
                    <td className="py-3 text-sm font-medium">{c.subject}</td>
                    <td className="py-3 text-sm">{c.sentCount || 0}</td>
                    <td className="py-3 text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {campaigns.length === 0 && <tr><td colSpan={3} className="text-center py-4 text-gray-400">No campaigns yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
