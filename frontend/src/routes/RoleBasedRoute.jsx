import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RoleBasedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect authenticated users back to their authorized portal
    const fallbackPath = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    const dashboardPath = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
}

export default RoleBasedRoute;

