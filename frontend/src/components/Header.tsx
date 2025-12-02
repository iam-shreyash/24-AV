import { Menu, Plane, User, Globe } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "./auth/AuthContext";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import LanguageSelector from "./LanguageSelector";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();

  const getMyBookingsHref = () => {
    if (userRole === "passenger") return "/my-bookings";
    if (userRole === "vendor") return "/vendor/dashboard";
    if (userRole === "admin") return "/dashboard/admin";
    return "/my-bookings";
  };

  const navigation = [
    { key: "nav.home", href: "/" },
    ...(userRole !== "vendor"
      ? [{ key: "nav.searchFlights", href: "/search" }]
      : []),
    ...(userRole === "passenger"
      ? [{ key: "nav.myBookings", href: getMyBookingsHref() }]
      : []),
    { key: "nav.support", href: "/support" },
    ...(userRole === "vendor"
      ? [{ key: "nav.vendorPortal", href: "/vendor/dashboard" }]
      : []),
    ...(userRole === "admin"
      ? [{ key: "nav.adminPortal", href: "/admin/portal" }]
      : []),
  ];

  const handleLogout = () => {
    console.log('Logout clicked - clearing auth and redirecting to login');
    logout(); // Clear all auth data from context and localStorage
    navigate("/login", { replace: true }); // Redirect to login
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-100 bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-800">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading text-2xl font-bold text-blue-800">
              24AV
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden items-center space-x-6 md:flex">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;

            const handleClick = (e: React.MouseEvent<HTMLElement>) => {
              if (item.href === "/") {
                e.preventDefault();
                e.stopPropagation();
                navigate("/");
              }
            };

            return (
              <Link
                key={item.key}
                to={item.href}
                onClick={handleClick}
                className={`font-body text-sm font-medium transition-all duration-300 ${isActive
                  ? "rounded-md bg-blue-50 px-3 py-1.5 text-blue-800"
                  : "text-gray-700 hover:text-blue-800 hover:scale-105"
                  }`}
              >
                {t(item.key)}
              </Link>
            );
          })}

          {/* New Beautiful Dropdown Language Selector */}
          <LanguageSelector />

          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-blue-800 hover:bg-blue-50"
            >
              {t("nav.logout")}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="ml-2 border-blue-800 text-blue-800 hover:bg-blue-50"
                onClick={() => navigate("/register")}
              >
                {t("nav.register")}
              </Button>
              <Button
                size="sm"
                className="ml-2 bg-blue-800 hover:bg-blue-900"
                onClick={() => navigate("/login")}
              >
                <User className="mr-2 h-4 w-4" />
                {t("nav.signIn")}
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </SheetTrigger>

          <SheetContent side="right" className="w-[300px] bg-white">
            <nav className="mt-8 flex flex-col space-y-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;

                const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (item.href === "/") {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate("/");
                  }
                };

                return (
                  <Link
                    key={item.key}
                    to={item.href}
                    onClick={handleClick}
                    className={`font-body text-base font-medium transition-all duration-300 ${isActive
                      ? "rounded-md bg-blue-50 px-3 py-1.5 text-blue-800"
                      : "text-gray-700 hover:text-blue-800"
                      }`}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}

              {/* Language selector in mobile menu */}
              <LanguageSelector />

            </nav>

            <div className="mt-6 border-t border-blue-100 pt-6">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-blue-800 hover:bg-blue-50"
                  onClick={handleLogout}
                >
                  {t("nav.logout")}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-blue-800 text-blue-800 hover:bg-blue-50"
                    onClick={() => navigate("/register")}
                  >
                    {t("nav.register")}
                  </Button>
                  <Button
                    className="mt-2 w-full justify-start bg-blue-800 hover:bg-blue-900"
                    onClick={() => navigate("/login")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {t("nav.signIn")}
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
