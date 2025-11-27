import { Menu, Plane, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { clearAuth, getStoredAuth } from "./auth/Login";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getStoredAuth();

  const getMyBookingsHref = () => {
    if (auth?.role === "vendor") return "/dashboard/vendor";
    if (auth?.role === "admin") return "/dashboard/admin";
    return "/dashboard/passenger";
  };

  // For vendors, hide passenger-only navigation items
  const navigation = [
    { name: "Home", href: "/" },
    ...(auth?.role !== "vendor" ? [{ name: "Search Flights", href: "/search" }] : []),
    ...(auth?.role === "passenger" ? [{ name: "My Bookings", href: getMyBookingsHref() }] : []),
    { name: "Offers", href: "/offers" },
    { name: "Support", href: "/support" },
    // Only show Vendor Portal for vendors
    ...(auth?.role === "vendor" ? [{ name: "Vendor Portal", href: "/dashboard/vendor" }] : []),
    ...(auth?.role === "admin" ? [{ name: "Admin Portal", href: "/admin/portal" }] : [])
  ];

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const handleLogin = () => {
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

        <nav className="hidden items-center space-x-6 md:flex">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`font-body text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "rounded-md bg-blue-50 px-3 py-1.5 text-blue-800"
                    : "text-gray-700 hover:text-blue-800 hover:scale-105"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          {auth ? (
            <Button size="sm" className="ml-4 bg-blue-800 hover:bg-blue-900" onClick={handleLogout}>
              <User className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" className="ml-2 border-blue-800 text-blue-800 hover:bg-blue-50" onClick={() => navigate("/register")}>
                Register
              </Button>
              <Button size="sm" className="ml-2 bg-blue-800 hover:bg-blue-900" onClick={handleLogin}>
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </>
          )}
        </nav>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-white">
            <nav className="mt-8 flex flex-col space-y-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`font-body text-base font-medium transition-all duration-300 ${
                      isActive
                        ? "rounded-md bg-blue-50 px-3 py-1.5 text-blue-800"
                        : "text-gray-700 hover:text-blue-800 hover:scale-105"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              {auth ? (
                <Button className="bg-blue-800 hover:bg-blue-900" onClick={handleLogout}>
                  <User className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="border-blue-800 text-blue-800 hover:bg-blue-50" onClick={() => navigate("/register")}>
                    Register
                  </Button>
                  <Button className="bg-blue-800 hover:bg-blue-900" onClick={handleLogin}>
                    <User className="mr-2 h-4 w-4" />
                    Sign In
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
