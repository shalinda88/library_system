import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

const LibrarianRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Case-insensitive comparison to handle both uppercase and lowercase roles
  const role = user.role?.toLowerCase();
  return role === 'librarian' || role === 'admin' ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

export default LibrarianRoute;
