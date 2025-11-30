import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Loader2 } from "lucide-react";

type RequireRoleProps = {
  role: "admin" | "vendor" | "passenger";
  children: JSX.Element;
};

export default function RequireRole({ role, children }: RequireRoleProps) {
  const location = useLocation();
  const { user, loading, isAuthenticated } = useAuth();

  // Debug log
  console.log('RequireRole - Auth State:', {
    isAuthenticated,
    userRole: user?.role,
    requiredRole: role,
    currentPath: location.pathname,
    loading
  });

  // Show loading state while auth is being checked
  if (loading) {
    console.log('Auth loading...');
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If user doesn't have the required role, redirect to their dashboard
  if (user?.role !== role) {
    const target = 
      user?.role === "admin" ? "/dashboard/admin" :
      user?.role === "vendor" ? "/vendor/dashboard" :
      "/my-bookings";
    
    console.log(`User role (${user?.role}) doesn't match required role (${role}), redirecting to ${target}`);
    return <Navigate to={target} replace />;
  }

  // User is authenticated and has the required role
  return children;
}

