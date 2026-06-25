const BASE = import.meta.env.VITE_API_URL || '/api';

export const fetchApi = async (url, method = 'GET', body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  const t = token || localStorage.getItem('token');
  if (t) headers['Authorization'] = `Bearer ${t}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${url}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};
