import { Menu, Plane, User, Globe } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { clearAuth, getStoredAuth } from "./auth/Login";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import LanguageSelector from "./LanguageSelector";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getStoredAuth();
  const { t } = useTranslation();

  const getMyBookingsHref = () => {
    if (auth?.role === "passenger") return "/my-bookings";
    if (auth?.role === "vendor") return "/vendor/dashboard";
    if (auth?.role === "admin") return "/dashboard/admin";
    return "/my-bookings";
  };

  const navigation = [
    { key: "nav.home", href: "/" },
    ...(auth?.role !== "vendor"
      ? [{ key: "nav.searchFlights", href: "/search" }]
      : []),
    ...(auth?.role === "passenger"
      ? [{ key: "nav.myBookings", href: getMyBookingsHref() }]
      : []),
    { key: "nav.offers", href: "/offers" },
    { key: "nav.support", href: "/support" },
    ...(auth?.role === "vendor"
      ? [{ key: "nav.vendorPortal", href: "/vendor/dashboard" }]
      : []),
    ...(auth?.role === "admin"
      ? [{ key: "nav.adminPortal", href: "/admin/portal" }]
      : []),
  ];

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
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
                className={`font-body text-sm font-medium transition-all duration-300 ${
                  isActive
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

          {auth ? (
            <Button
              size="sm"
              className="ml-4 bg-blue-800 hover:bg-blue-900"
              onClick={handleLogout}
            >
              <User className="mr-2 h-4 w-4" />
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
                    className={`font-body text-base font-medium transition-all duration-300 ${
                      isActive
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

              {auth ? (
                <Button
                  className="bg-blue-800 hover:bg-blue-900"
                  onClick={handleLogout}
                >
                  <User className="mr-2 h-4 w-4" />
                  {t("nav.logout")}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="border-blue-800 text-blue-800 hover:bg-blue-50"
                    onClick={() => navigate("/register")}
                  >
                    {t("nav.register")}
                  </Button>
                  <Button
                    className="bg-blue-800 hover:bg-blue-900"
                    onClick={() => navigate("/login")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {t("nav.signIn")}
                  </Button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
