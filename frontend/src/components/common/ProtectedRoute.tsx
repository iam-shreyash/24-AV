import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useEffect, useState } from 'react';

type ProtectedRouteProps = {
  /**
   * Array of allowed user roles. If not provided, any authenticated user can access the route.
   * Example: `allowedRoles={['admin', 'vendor']}`
   */
  allowedRoles?: string[];
  
  /**
   * Redirect path when user is not authenticated or doesn't have the required role.
   * Defaults to '/login' for unauthenticated users and '/unauthorized' for unauthorized roles.
   */
  redirectPath?: string;
  
  /**
   * If true, will show a loading state while checking authentication.
   * Useful when you need to verify the token with the server.
   */
  checkAuthOnMount?: boolean;
};

/**
 * ProtectedRoute component that handles authentication and authorization.
 * 
 * @example
 * // Basic usage - protects route for any authenticated user
 * <Route element={<ProtectedRoute />}>
 *   <Route path="dashboard" element={<Dashboard />} />
 * </Route>
 * 
 * @example
 * // Role-based protection
 * <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
 *   <Route path="admin" element={<AdminDashboard />} />
 * </Route>
 */
const ProtectedRoute = ({
  allowedRoles,
  redirectPath = '/login',
  checkAuthOnMount = false,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (checkAuthOnMount && isAuthenticated && user?.role) {
      // Here you could add an API call to verify the token if needed
      // For now, we'll just use the local auth state
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    } else if (!checkAuthOnMount) {
      // If we're not checking auth on mount, determine authorization immediately
      const hasRequiredRole = !allowedRoles || (user?.role && allowedRoles.includes(user.role));
      setIsAuthorized(isAuthenticated && hasRequiredRole);
    }
  }, [isAuthenticated, user, allowedRoles, checkAuthOnMount]);

  // Show loading state if we're still checking authentication
  if (authLoading || (checkAuthOnMount && isAuthorized === null)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // If authorized, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
