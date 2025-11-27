import { Navigate, useLocation } from "react-router-dom";
import { getStoredAuth } from "./Login";

type RequireRoleProps = {
  role: "admin" | "vendor" | "passenger";
  children: JSX.Element;
};

export default function RequireRole({ role, children }: RequireRoleProps) {
  const location = useLocation();
  const auth = getStoredAuth();

  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (auth.role !== role) {
    // If the user is logged in but has the wrong role, send them to their own dashboard.
    const target =
      auth.role === "admin"
        ? "/dashboard/admin"
        : auth.role === "vendor"
          ? "/dashboard/vendor"
          : "/dashboard/passenger";
    return <Navigate to={target} replace />;
  }

  return children;
}


