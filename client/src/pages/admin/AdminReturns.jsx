import { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const statusColors = { pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', approved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', refunded: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' };

export default function AdminReturns() {
  const [returns, setReturns] = useState([]);

  useEffect(() => { loadReturns(); }, []);

  const loadReturns = async () => {
    try { const data = await fetchApi('/returns'); setReturns(data); } catch {}
  };

  const updateStatus = async (id, status) => {
    try {
      await fetchApi(`/returns/${id}`, 'PUT', { status });
      toast.success(`Return ${status}`);
      loadReturns();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-display text-gradient mb-6">Returns & Refunds</h1>
      <div className="card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left p-4 font-semibold">Customer</th>
                <th className="text-left p-4 font-semibold">Reason</th>
                <th className="text-left p-4 font-semibold">Amount</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map(r => (
                <motion.tr key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4">
                    <p className="font-medium">{r.user?.name}</p>
                    <p className="text-xs text-gray-500">{r.user?.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{r.reason}</p>
                    <p className="text-xs text-gray-400">Order #{r.order?._id?.toString().slice(-8)}</p>
                  </td>
                  <td className="p-4 font-semibold">{r.refundAmount || r.order?.totalPrice} DH</td>
                  <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[r.status]}`}>{r.status}</span></td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(r._id, 'approved')} className="px-3 py-1 rounded-xl bg-green-500 text-white text-xs hover:bg-green-600">Approve</button>
                          <button onClick={() => updateStatus(r._id, 'rejected')} className="px-3 py-1 rounded-xl bg-red-500 text-white text-xs hover:bg-red-600">Reject</button>
                        </>
                      )}
                      {r.status === 'approved' && <button onClick={() => updateStatus(r._id, 'refunded')} className="px-3 py-1 rounded-xl bg-blue-500 text-white text-xs hover:bg-blue-600">Mark Refunded</button>}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {returns.length === 0 && <p className="text-center text-gray-400 py-8">No return requests</p>}
      </div>
    </div>
  );
}
