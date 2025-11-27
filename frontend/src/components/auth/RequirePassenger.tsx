import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequirePassenger({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is a vendor, redirect to vendor dashboard
  if (user?.role === 'vendor') {
    return <Navigate to="/dashboard/vendor" state={{ from: location }} replace />;
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only allow passenger role to access the route
  if (user.role !== 'passenger') {
    return <Navigate to="/" replace />;
  }

  return children;
}
