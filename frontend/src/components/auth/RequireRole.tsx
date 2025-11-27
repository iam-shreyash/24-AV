import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

type RequireRoleProps = {
  role: "admin" | "vendor" | "passenger";
  children: JSX.Element;
};

export default function RequireRole({ role, children }: RequireRoleProps) {
  const location = useLocation();
  const { user, loading } = useAuth();

  // If auth is still loading, don't redirect yet — let caller handle a loading state.
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== role) {
    // If the user is logged in but has the wrong role, send them to their own dashboard.
    const target =
      user.role === "admin"
        ? "/dashboard/admin"
        : user.role === "vendor"
          ? "/dashboard/vendor"
          : "/dashboard/passenger";
    return <Navigate to={target} replace />;
  }

  return children;
}


