import { FormEvent, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserPlus, Sparkles, Eye, EyeOff } from "lucide-react";
import { extractMessage } from "../../lib/extractMessage";
import { useAuth } from "./AuthContext";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
// TODO: Re-enable OTP verification when SMS API key is added.
// import MobileOtpVerification from "./MobileOtpVerification";

type Role = "admin" | "vendor" | "passenger";

type RegisterResponse = {
  id: number;
  email: string;
  full_name: string | null;
  role: Role;
  is_active: boolean;
};

export default function Register() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("passenger");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP verification state (only for passenger accounts)
  // TODO: Re-enable OTP verification when SMS API key is added.
  const [mobileVerified, setMobileVerified] = useState(false);
  const [verifiedMobileNumber, setVerifiedMobileNumber] = useState<string>("");
  // Mobile number state (temporarily used without OTP verification)
  const [mobileNumber, setMobileNumber] = useState<string>("");

  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    if (isAuthenticated && userRole) {
      const target = userRole === 'admin' ? '/dashboard/admin' :
        userRole === 'vendor' ? '/vendor/dashboard' :
          '/my-bookings';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    // TODO: Re-enable OTP verification when SMS API key is added.
    // For passenger accounts, require OTP verification first
    // Temporarily disabled - OTP verification not required
    // if (role === "passenger" && !mobileVerified) {
    //   setError("Please verify your mobile number before creating your account.");
    //   return;
    // }

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email,
        full_name: fullName || null,
        password,
        role
      };

      const { data } = await axios.post<RegisterResponse>("/api/auth/register", payload, {
        headers: { "Content-Type": "application/json" }
      });

      // Registration successful - redirect to login
      // Vendors will be redirected to application form after login
      navigate("/login", {
        replace: true,
        state: {
          message: `Account created successfully! Please login to ${data.role === "vendor" ? "complete your vendor application" : "access your dashboard"}.`,
          redirectTo: data.role === "vendor" ? "/vendor/application" : undefined
        }
      });
    } catch (err: any) {
      console.error("Registration error:", err);

      if (err.response?.data?.detail) {
        // Backend returned a specific error message
        setError(extractMessage(err.response.data.detail));
      } else if (err.response?.status === 400) {
        setError("Invalid registration data. Please check your inputs.");
      } else if (err.response?.status === 403) {
        setError("Admin accounts cannot be created through registration.");
      } else if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        setError("Cannot connect to server. Please make sure the backend is running on http://localhost:8000");
      } else if (err.response?.status === 500) {
        // Show the actual error message from backend if available
        const errorDetail = extractMessage(err.response?.data?.detail) || "Server error. Please check if the database is connected and try again.";
        setError(errorDetail);
      } else {
        setError(`Registration failed: ${err.message || "Please check your connection and try again."}`);
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
                Create Account
              </Badge>
              <h1 className="font-heading text-4xl font-bold text-blue-800 md:text-5xl">
                Join 24AV
              </h1>
              <p className="mt-4 font-body text-lg text-muted-foreground">
                Register as a vendor or passenger to get started.
              </p>
            </div>

            <Card className="border border-gray-200 bg-white p-8 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-body text-sm font-medium text-foreground">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 bg-background"
                    required
                  />
                </div>

                {/* Mobile Number Input (only for passenger accounts) */}
                {/* TODO: Re-enable OTP verification when SMS API key is added. */}
                {/* Mobile OTP Verification temporarily disabled - replaced with simple input */}
                {role === "passenger" && (
                  <div className="space-y-2">
                    <label className="font-body text-sm font-medium text-foreground">
                      Mobile Number <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="Enter your mobile number"
                      value={mobileNumber}
                      onChange={(event) => setMobileNumber(event.target.value)}
                      className="h-12 bg-background"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {/* TODO: Re-enable OTP verification when SMS API key is added. */}
                      OTP verification temporarily disabled
                    </p>
                    {/* OTP Verification Component - Temporarily Disabled */}
                    {/* 
                    {mobileVerified ? (
                      <div className="rounded-lg border border-accent/50 bg-accent/10 p-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-accent" />
                        <p className="text-sm font-medium text-accent">
                          Mobile number verified: {verifiedMobileNumber}
                        </p>
                      </div>
                    ) : (
                      <MobileOtpVerification
                        onVerificationSuccess={(mobileNumber) => {
                          setMobileVerified(true);
                          setVerifiedMobileNumber(mobileNumber);
                        }}
                      />
                    )}
                    */}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="font-body text-sm font-medium text-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="h-12 bg-background"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-body text-sm font-medium text-foreground">
                    Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password (min. 8 characters)"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-12 bg-background pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-body text-sm font-medium text-foreground">
                    Confirm Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="h-12 bg-background pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-body text-sm font-medium text-foreground">
                    Account Type <span className="text-destructive">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["vendor", "passenger"] as Role[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setRole(r);
                          // TODO: Re-enable OTP verification when SMS API key is added.
                          // Reset OTP verification state when switching to vendor
                          if (r === "vendor") {
                            setMobileVerified(false);
                            setVerifiedMobileNumber("");
                            setMobileNumber(""); // Also reset mobile number input
                          }
                        }}
                        className={`rounded-lg border-2 p-4 text-center font-body text-sm font-medium transition-all ${role === r
                          ? "border-blue-800 bg-blue-50 text-blue-800 shadow-md"
                          : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
                          }`}
                      >
                        <div className="font-heading text-base font-semibold">
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {r === "vendor" ? "List your aircraft" : "Book flights"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                    <p className="text-sm font-medium text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  // TODO: Re-enable OTP verification when SMS API key is added.
                  // Temporarily disabled - OTP verification not required
                  disabled={loading /* || (role === "passenger" && !mobileVerified) */}
                  size="lg"
                  className="w-full bg-blue-800 font-semibold text-white shadow-lg transition-all hover:bg-blue-900 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                {/* TODO: Re-enable OTP verification when SMS API key is added. */}
                {/* Temporarily disabled - OTP verification not required */}
                {/* 
                {role === "passenger" && !mobileVerified && (
                  <p className="text-xs text-center text-destructive">
                    Please verify your mobile number first
                  </p>
                )}
                */}

                <p className="text-center text-xs text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="font-medium text-blue-800 hover:underline"
                  >
                    Sign in here
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

