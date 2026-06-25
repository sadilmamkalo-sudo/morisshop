import { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import { motion } from 'framer-motion';

export default function AdminGiftCards() {
  const [cards, setCards] = useState([]);

  useEffect(() => { fetchApi('/gift-cards').then(setCards).catch(() => {}); }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold font-display text-gradient mb-6">Gift Cards</h1>
      <div className="card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left p-4 font-semibold">Code</th>
                <th className="text-left p-4 font-semibold">Amount</th>
                <th className="text-left p-4 font-semibold">Balance</th>
                <th className="text-left p-4 font-semibold">Sender</th>
                <th className="text-left p-4 font-semibold">Recipient</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Expires</th>
              </tr>
            </thead>
            <tbody>
              {cards.map(c => (
                <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4 font-mono text-xs">{c.code}</td>
                  <td className="p-4">{c.amount} DH</td>
                  <td className="p-4">{c.balance} DH</td>
                  <td className="p-4">{c.senderName || '-'}</td>
                  <td className="p-4">{c.recipientEmail || '-'}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${c.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>{c.isActive ? 'Active' : 'Used'}</span></td>
                  <td className="p-4 text-xs text-gray-500">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '-'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {cards.length === 0 && <p className="text-center text-gray-400 py-8">No gift cards yet</p>}
      </div>
    </div>
  );
}
