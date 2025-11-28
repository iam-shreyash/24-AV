import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./components/auth/AuthContext";
import { useTranslation } from "react-i18next";
import { setRTL } from "./utils/rtl";
import { Loader2 } from "lucide-react";

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
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only run this effect after auth state is loaded
    if (!loading && isAuthenticated && user?.role === 'vendor') {
      // If vendor is trying to access a passenger route, redirect to vendor dashboard
      if (!location.pathname.startsWith('/vendor')) {
        navigate('/vendor/dashboard', { replace: true });
      }
    }
  }, [user, loading, isAuthenticated, navigate, location.pathname]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If not authenticated, show the children (will be handled by other auth guards)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // If user is a vendor trying to access a non-vendor route, show loading (will redirect)
  if (user?.role === 'vendor' && !location.pathname.startsWith('/vendor')) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // For all other cases, render the children
  return <>{children}</>;
}

function App() {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith("/admin");

  useEffect(() => {
    console.log("App rendered, current path:", location.pathname);
  }, [location.pathname]);
  const { i18n } = useTranslation();

// Add RTL effect
useEffect(() => {
  // Set RTL based on current language
  setRTL(i18n.language === 'ar' || i18n.language === 'he' /* add other RTL languages */);
  
  // Listen for language changes
  const handleLanguageChange = (lng: string) => {
    setRTL(lng === 'ar' || lng === 'he' /* add other RTL languages */);
  };

  i18n.on('languageChanged', handleLanguageChange);
  
  // Cleanup
  return () => {
    i18n.off('languageChanged', handleLanguageChange);
  };
}, [i18n]);
  
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
          path="/vendor/dashboard"
          element={
            <RequireRole role="vendor">
              <VendorDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/passenger/dashboard"
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
