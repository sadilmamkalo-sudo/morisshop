import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-clay-500"></div></div>;
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return <Navigate to="/" />;
  return children;
}
