import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Suspense, lazy, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';


// Providers
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import { setRTL } from './utils/rtl';

// Lazy load components
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const AdminLogin = lazy(() => import('./components/auth/AdminLogin'));
const RequireRole = lazy(() => import('./components/auth/RequireRole'));
const AdminDashboard = lazy(() => import('./components/dashboard/AdminDashboard'));
const VendorDashboard = lazy(() => import('./components/dashboard/VendorDashboard'));
const PassengerDashboard = lazy(() => import('./components/dashboard/PassengerDashboard'));
const Home = lazy(() => import('./components/Home'));
const FlightSearch = lazy(() => import('./components/flights/FlightSearch'));
const Fleet = lazy(() => import('./components/Fleet'));
const Support = lazy(() => import('./components/Support'));
const Header = lazy(() => import('./components/Header'));
const Offers = lazy(() => import('./components/Offers'));
const VendorApplication = lazy(() => import('./components/vendor/VendorApplication'));
const AdminPortal = lazy(() => import('./components/admin/AdminPortal'));

function AppRoutes() {
  const { loading, userRole } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<AdminLogin />} />

      {/* Protected Routes - Only render when userRole is available */}
      {/* Protected Routes - Only render when userRole is available */}
      <Route
        path="/dashboard/admin/*"
        element={
          <RequireRole role="admin">
            <AdminDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/vendor/dashboard/*"
        element={
          <RequireRole role="vendor">
            <VendorDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <RequireRole role="passenger">
            <PassengerDashboard />
          </RequireRole>
        }
      />

      {/* Public Routes */}
      <Route path="/search" element={<FlightSearch />} />
      <Route path="/fleet" element={<Fleet />} />
      <Route path="/support" element={<Support />} />
      <Route path="/offers" element={<Offers />} />
      <Route path="/vendor/application" element={<VendorApplication />} />
      <Route path="/admin/portal" element={<AdminPortal />} />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppContent() {
  const location = useLocation();
  const { userRole, setAuth, loading } = useAuth();
  const { i18n } = useTranslation();
  const hideHeader = location.pathname.startsWith("/admin");

  // Log route changes and auth state (null-safe)
  useEffect(() => {
    console.log("App rendered, current path:", location.pathname);
    console.log("Current user role:", userRole || 'not authenticated');
  }, [location.pathname, userRole]);

  // Handle RTL layout based on language
  useEffect(() => {
    // Set RTL based on current language
    setRTL(i18n.language === 'ar' || i18n.language === 'he');

    // Listen for language changes
    const handleLanguageChange = (lng: string) => {
      setRTL(lng === 'ar' || lng === 'he');
    };

    i18n.on('languageChanged', handleLanguageChange);

    // Cleanup
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!hideHeader && <Header />}
      <main className="">
        <AppRoutes />
      </main>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      }
    >
      <AppContent />
    </Suspense>
  );
}

export default App;