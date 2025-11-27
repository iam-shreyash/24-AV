import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Shield, Lock, Mail, Sparkles } from "lucide-react";
import { extractMessage } from "../../lib/extractMessage";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { saveAuth } from "./Login";

type Role = "admin" | "vendor" | "passenger";

type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  role: Role;
};

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body = new URLSearchParams({
        username: email,
        password
      });
      const { data } = await axios.post<LoginResponse>("/api/auth/login", body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      // Check if user is admin
      if (data.role !== "admin") {
        setError("Access denied. This portal is only for administrators.");
        return;
      }

      saveAuth(data, email);

      // Redirect to admin portal
      navigate("/admin/portal", { replace: true });
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        // Use the backend error message if available, otherwise default message
        setError(extractMessage(err.response?.data?.detail) || "Invalid email or password.");
      } else if (err.response?.status === 403) {
        const raw = err.response?.data?.detail || "Access denied. Admin access required.";
        const errorMessage = extractMessage(raw);
        if (errorMessage.includes("deactivated")) {
          setError("Account is deactivated. Please contact admin.");
        } else {
          setError(errorMessage);
        }
      } else {
        setError(extractMessage(err.response?.data?.detail) || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }}
        />
      </div>

      <Card className="w-full max-w-md border-2 bg-gradient-to-b from-card to-card/50 p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <Badge className="mx-auto mb-4 flex w-fit items-center gap-2 bg-primary/10 text-primary shadow-lg">
            <Sparkles className="h-4 w-4" />
            Admin Portal
          </Badge>
          <h1 className="font-heading text-3xl font-bold mt-4">
            Administrator
            <span className="mt-2 block bg-gradient-to-r from-primary via-[var(--primary-glow)] to-accent bg-clip-text text-transparent">
              Access Only
            </span>
          </h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            Restricted access. Admin credentials required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-body text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4" />
              Email Address
            </label>
            <Input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-background"
            />
          </div>

          <div>
            <label className="font-body text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4" />
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-background pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Authenticating...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Access Admin Portal
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            ⚠️ Unauthorized access is prohibited
          </p>
        </div>
      </Card>
    </div>
  );
}


