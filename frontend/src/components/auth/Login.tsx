import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { LogIn, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { extractMessage } from "../../lib/extractMessage";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

type Role = "admin" | "vendor" | "passenger";

type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  role: Role;
};

export function saveAuth(auth: LoginResponse, email: string) {
  localStorage.setItem(
    "auth",
    JSON.stringify({
      token: auth.access_token,
      role: auth.role,
      email,
      expiresAt: Date.now() + auth.expires_in * 1000
    })
  );
}

export function getStoredAuth():
  | {
      token: string;
      role: Role;
      email: string;
      expiresAt: number;
    }
  | null {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      token: string;
      role: Role;
      email: string;
      expiresAt: number;
    };
    if (!parsed.token || !parsed.role) return null;
    if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
      localStorage.removeItem("auth");
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem("auth");
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (location.state?.message) {
      // Preserve any message passed in navigation state (e.g. after logout)
      setSuccessMessage(location.state.message as string);
      // Clear the state to prevent showing the message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Attempting login with:', { email });
      
      // In a real app, you would make an API call here
      // For now, we'll simulate a successful login
      const mockResponse = {
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        expires_in: 3600,
        role: email.includes('admin') ? 'admin' : 
              email.includes('vendor') ? 'vendor' : 'passenger'
      } as LoginResponse;
      
      console.log('Login successful, user role:', mockResponse.role);
      saveAuth(mockResponse, email);
      
      // Force a page reload to ensure all auth state is properly initialized
      window.location.href = mockResponse.role === 'vendor' ? '/vendor/dashboard' : 
                           mockResponse.role === 'admin' ? '/dashboard/admin' : 
                           '/my-bookings';

      // Check if there's a redirect path in location state
      const redirectTo = (location.state as { redirectTo?: string } | null)?.redirectTo;

      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        // Vendor deactivated or approval status error
        const raw = err.response?.data?.detail || "Access denied. Please contact support.";
        const errorMessage = extractMessage(raw);
        if (errorMessage.includes("deactivated")) {
          setError("Account is deactivated. Please contact admin.");
        } else {
          setError(errorMessage);
        }
      } else if (err.response?.status === 401) {
        setError(extractMessage(err.response?.data?.detail) || "Invalid email or password.");
      } else {
        setError(extractMessage(err.response?.data?.detail) || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden py-20">
        {/* Aviation-themed background pattern - Clouds and Flight Paths */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cpath d='M20 40 Q40 20 60 40 T100 40' stroke='%231e40af' stroke-width='1.5' opacity='0.4'/%3E%3Cpath d='M10 80 Q30 60 50 80 T90 80' stroke='%231e40af' stroke-width='1.5' opacity='0.3'/%3E%3Cpath d='M30 100 Q50 80 70 100 T110 100' stroke='%231e40af' stroke-width='1.5' opacity='0.2'/%3E%3Ccircle cx='25' cy='25' r='8' fill='%23e0e7ff' opacity='0.5'/%3E%3Ccircle cx='85' cy='35' r='12' fill='%23e0e7ff' opacity='0.4'/%3E%3Ccircle cx='50' cy='70' r='10' fill='%23e0e7ff' opacity='0.3'/%3E%3Ccircle cx='95' cy='85' r='9' fill='%23e0e7ff' opacity='0.4'/%3E%3Cpath d='M15 15 L25 20 L20 25 L10 20 Z' fill='%231e40af' opacity='0.2'/%3E%3Cpath d='M75 15 L85 20 L80 25 L70 20 Z' fill='%231e40af' opacity='0.15'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '120px 120px'
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center">
              <Badge className="mx-auto mb-4 flex w-fit items-center gap-2 bg-blue-100 text-blue-800 shadow-lg">
                <Sparkles className="h-4 w-4" />
                {t("auth.login.badge")}
              </Badge>
              <h1 className="font-heading text-4xl font-bold text-blue-800 md:text-5xl">
                {t("auth.login.title")}
              </h1>
                <p className="mt-4 font-body text-lg text-gray-600">
                  {t("auth.login.subtitle")}
                </p>
            </div>

            <Card className="border border-gray-200 bg-white p-8 shadow-lg">
              {successMessage && (
                <div className="mb-6 rounded-lg border border-accent/50 bg-accent/10 p-3">
                  <p className="text-sm font-medium text-accent">{successMessage}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-body text-sm font-medium text-foreground">
                    {t("auth.login.emailLabel")}
                  </label>
                  <Input
                    type="email"
                    placeholder={t("auth.login.emailPlaceholder")}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 bg-background"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-body text-sm font-medium text-foreground">
                    {t("auth.login.passwordLabel")}
                  </label>
                  <Input
                    type="password"
                    placeholder={t("auth.login.passwordPlaceholder")}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 bg-background"
                    required
                  />
                </div>
                {error && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                    <p className="text-sm font-medium text-destructive">{error}</p>
                  </div>
                )}
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full bg-blue-800 font-semibold text-white shadow-lg transition-all hover:bg-blue-900 hover:scale-105 hover:shadow-xl"
          >
                  <LogIn className="mr-2 h-5 w-5" />
                  {loading ? t("auth.login.submitting") : t("auth.login.submit")}
                </Button>
                <p className="text-center text-xs text-gray-600">
                  {t("auth.login.noAccount")} {" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="font-medium text-blue-800 hover:underline"
                  >
                    {t("auth.login.registerHere")}
                  </button>
                </p>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}


