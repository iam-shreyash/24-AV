import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

type RequireRoleProps = {
  role: 'admin' | 'vendor' | 'passenger';
  children: JSX.Element;
};

export default function RequireRole({ role, children }: RequireRoleProps) {
  const { isAuthenticated, userRole, loading: authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== role) {
    const redirectTo = 
      userRole === 'admin' ? '/dashboard/admin' :
      userRole === 'vendor' ? '/vendor/dashboard' : 
      '/my-bookings';
    
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}