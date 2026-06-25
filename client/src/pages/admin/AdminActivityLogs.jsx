import { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import { motion } from 'framer-motion';

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState([]);

  useEffect(() => { loadLogs(); loadStats(); }, [page]);

  const loadLogs = async () => {
    try { const data = await fetchApi(`/activity-logs?page=${page}&limit=30`); setLogs(data.logs); setTotal(data.total); } catch {}
  };
  const loadStats = async () => {
    try { const data = await fetchApi('/activity-logs/stats'); setStats(data); } catch {}
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-display text-gradient">Activity Logs</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.slice(0, 8).map(s => (
          <div key={s._id} className="card-solid p-4 text-center">
            <p className="text-2xl font-bold text-moris-500">{s.count}</p>
            <p className="text-xs text-gray-500 capitalize">{s._id.replace(/_/g, ' ')}</p>
          </div>
        ))}
      </div>

      <div className="card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left p-4 font-semibold">User</th>
                <th className="text-left p-4 font-semibold">Action</th>
                <th className="text-left p-4 font-semibold">Resource</th>
                <th className="text-left p-4 font-semibold">Details</th>
                <th className="text-left p-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <motion.tr key={log._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4">{log.user?.name || 'System'} <span className="text-xs text-gray-400">({log.user?.email})</span></td>
                  <td className="p-4"><span className="px-2 py-1 rounded-full text-xs bg-moris-50 dark:bg-moris-900/30 text-moris-600 dark:text-moris-400 capitalize">{log.action.replace(/_/g, ' ')}</span></td>
                  <td className="p-4 text-gray-500">{log.resource} {log.resourceId?.toString().slice(-8)}</td>
                  <td className="p-4 text-xs text-gray-500 max-w-[200px] truncate">{log.details ? JSON.stringify(log.details) : '-'}</td>
                  <td className="p-4 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 30 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm">Previous</button>
            <span className="px-4 py-2 text-sm">Page {page} of {Math.ceil(total / 30)}</span>
            <button disabled={page >= Math.ceil(total / 30)} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
