import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { userRole, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = () => {
    console.log('Layout logout clicked');
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-primary text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm uppercase text-slate-200">24AV</p>
            <h1 className="text-2xl font-semibold">{t("layout.title")}</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/90">
                {userRole}
              </span>
            )}
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm text-white/90">
              {t("layout.demoBadge")}
            </span>
          </div>
        </div>
        <nav className="bg-primary/90">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-sm font-medium">
            <div className="flex gap-4">
              <NavLink
                to="/flights"
                className={({ isActive }) =>
                  `rounded px-3 py-1 ${isActive ? "bg-white text-primary" : "text-white/80 hover:text-white"}`
                }
              >
                {t("layout.nav.flights")}
              </NavLink>
              {userRole === "admin" && (
                <NavLink
                  to="/dashboard/admin"
                  className={({ isActive }) =>
                    `rounded px-3 py-1 ${isActive ? "bg-white text-primary" : "text-white/80 hover:text-white"}`
                  }
                >
                  {t("layout.nav.admin")}
                </NavLink>
              )}
              {userRole === "vendor" && (
                <NavLink
                  to="/vendor/dashboard"
                  className={({ isActive }) =>
                    `rounded px-3 py-1 ${isActive ? "bg-white text-primary" : "text-white/80 hover:text-white"}`
                  }
                >
                  {t("layout.nav.vendor")}
                </NavLink>
              )}
              {userRole === "passenger" && (
                <NavLink
                  to="/passenger/dashboard"
                  className={({ isActive }) =>
                    `rounded px-3 py-1 ${isActive ? "bg-white text-primary" : "text-white/80 hover:text-white"}`
                  }
                >
                  {t("layout.nav.passenger")}
                </NavLink>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!isAuthenticated && (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `rounded px-3 py-1 ${isActive ? "bg-white text-primary" : "text-white/80 hover:text-white"}`
                  }
                >
                  {t("layout.nav.login")}
                </NavLink>
              )}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded px-3 py-1 text-xs font-medium text-white hover:bg-white/10"
                >
                  {t("layout.nav.logout")}
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main className="w-full p-0 m-0">{children}</main>
    </div>
  );
}

