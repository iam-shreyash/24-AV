import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getStoredAuth } from "./Login";

type RequireRoleProps = {
  role: "admin" | "vendor" | "passenger";
  children: JSX.Element;
};

export default function RequireRole({ role, children }: RequireRoleProps) {
  const location = useLocation();
  const { user, loading } = useAuth();

  // If auth is still loading, don't redirect yet — let caller handle a loading state.
  if (loading) return null;

  // Fallback to stored auth from localStorage to avoid premature redirects
  const stored = getStoredAuth();

  if (!user && !stored) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const effectiveRole = user?.role || stored?.role;

  if (effectiveRole !== role) {
    // If the user is logged in but has the wrong role, send them to their own dashboard.
    const target =
      effectiveRole === "admin"
        ? "/dashboard/admin"
        : effectiveRole === "vendor"
          ? "/vendor/dashboard"
          : "/passenger/dashboard";
    return <Navigate to={target} replace />;
  }

  return children;
}


