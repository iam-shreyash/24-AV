import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./components/auth/AuthContext";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AdminLogin from "./components/auth/AdminLogin";
import RequireRole from "./components/auth/RequireRole";
import Header from "./components/Header";
import Home from "./components/Home";
import FlightSearch from "./components/flights/FlightSearch";
import Fleet from "./components/Fleet";
import VendorApplication from "./components/vendor/VendorApplication";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import AdminPortal from "./components/admin/AdminPortal";
import VendorDashboard from "./components/dashboard/VendorDashboard";
import PassengerDashboard from "./components/dashboard/PassengerDashboard";
import Support from "./components/Support";
import Offers from "./components/Offers";
import { ToastProvider } from "./components/ui/toast";
import { getStoredAuth } from "./components/auth/Login";

// Component to prevent vendors from accessing passenger-only routes
function VendorOnlyRoute({ children }: { children: React.ReactNode }) {
  // Previously this component read localStorage synchronously and redirected
  // vendors to their dashboard which could cause unexpected redirects.
  // We now avoid auto-redirects here — routing role-checks should be handled
  // by `RequireRole` when accessing dashboards. Keep this a no-op wrapper.
  return <>{children}</>;
}

function App() {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith("/admin");

  useEffect(() => {
    console.log("App rendered, current path:", location.pathname);
  }, [location.pathname]);
  
  return (
    <ToastProvider>
      <div className="min-h-screen bg-background text-foreground">
        {!hideHeader && <Header />}
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<VendorOnlyRoute><FlightSearch /></VendorOnlyRoute>} />
        <Route path="/book" element={<VendorOnlyRoute><FlightSearch /></VendorOnlyRoute>} />
        <Route path="/my-bookings" element={<VendorOnlyRoute><PassengerDashboard /></VendorOnlyRoute>} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/support" element={<Support />} />
        <Route path="/flights" element={<Navigate to="/search" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/vendor/application" element={<VendorApplication />} />
        <Route
          path="/admin/portal"
          element={
            <RequireRole role="admin">
              <AdminPortal />
            </RequireRole>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <RequireRole role="admin">
              <AdminDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/dashboard/vendor"
          element={
            <RequireRole role="vendor">
              <VendorDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/dashboard/passenger"
          element={
            <RequireRole role="passenger">
              <PassengerDashboard />
            </RequireRole>
          }
        />
      </Routes>
    </div>
    </ToastProvider>
  );
}

export default App;
