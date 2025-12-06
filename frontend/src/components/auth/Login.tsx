import { FormEvent, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LogIn, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.log('Login useEffect:', { isAuthenticated, userRole, locationState: location.state });
    if (isAuthenticated && userRole) {
      const from = location.state?.from?.pathname ||
        (userRole === 'admin' ? '/dashboard/admin' :
          userRole === 'vendor' ? '/vendor/dashboard' :
            '/my-bookings');
      console.log('Redirecting from Login to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, userRole, navigate, location]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login(email, password);
      console.log('Login successful, role:', response.userRole);

      const from = location.state?.from?.pathname ||
        (response.userRole === 'admin' ? '/dashboard/admin' :
          response.userRole === 'vendor' ? '/vendor/dashboard' :
            '/my-bookings');

      console.log('Redirect to', from);
      navigate(from, { replace: true });

    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden py-20">
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
              {error && (
                <div className="mb-6 rounded-lg border border-red-500 bg-red-50 p-3">
                  <p className="text-sm font-medium text-red-700">{error}</p>
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
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-background"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {t("Login In")}
                    </div>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      {t("Login")}
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}