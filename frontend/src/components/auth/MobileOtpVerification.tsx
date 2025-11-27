/**
 * MobileOtpVerification Component - Modular implementation
 * This component can be deleted to remove OTP verification feature entirely.
 */

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Loader2, ChevronDown } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { extractMessage } from "../../lib/extractMessage";

// Complete list of all countries with their international dialing codes
const countryCodes = [
  { code: "+1", country: "United States/Canada" },
  { code: "+7", country: "Russia/Kazakhstan" },
  { code: "+20", country: "Egypt" },
  { code: "+27", country: "South Africa" },
  { code: "+30", country: "Greece" },
  { code: "+31", country: "Netherlands" },
  { code: "+32", country: "Belgium" },
  { code: "+33", country: "France" },
  { code: "+34", country: "Spain" },
  { code: "+36", country: "Hungary" },
  { code: "+39", country: "Italy" },
  { code: "+40", country: "Romania" },
  { code: "+41", country: "Switzerland" },
  { code: "+43", country: "Austria" },
  { code: "+44", country: "United Kingdom" },
  { code: "+45", country: "Denmark" },
  { code: "+46", country: "Sweden" },
  { code: "+47", country: "Norway" },
  { code: "+48", country: "Poland" },
  { code: "+49", country: "Germany" },
  { code: "+51", country: "Peru" },
  { code: "+52", country: "Mexico" },
  { code: "+53", country: "Cuba" },
  { code: "+54", country: "Argentina" },
  { code: "+55", country: "Brazil" },
  { code: "+56", country: "Chile" },
  { code: "+57", country: "Colombia" },
  { code: "+58", country: "Venezuela" },
  { code: "+60", country: "Malaysia" },
  { code: "+61", country: "Australia" },
  { code: "+62", country: "Indonesia" },
  { code: "+63", country: "Philippines" },
  { code: "+64", country: "New Zealand" },
  { code: "+65", country: "Singapore" },
  { code: "+66", country: "Thailand" },
  { code: "+81", country: "Japan" },
  { code: "+82", country: "South Korea" },
  { code: "+84", country: "Vietnam" },
  { code: "+86", country: "China" },
  { code: "+90", country: "Turkey" },
  { code: "+91", country: "India" },
  { code: "+92", country: "Pakistan" },
  { code: "+93", country: "Afghanistan" },
  { code: "+94", country: "Sri Lanka" },
  { code: "+95", country: "Myanmar" },
  { code: "+98", country: "Iran" },
  { code: "+212", country: "Morocco" },
  { code: "+213", country: "Algeria" },
  { code: "+216", country: "Tunisia" },
  { code: "+218", country: "Libya" },
  { code: "+220", country: "Gambia" },
  { code: "+221", country: "Senegal" },
  { code: "+222", country: "Mauritania" },
  { code: "+223", country: "Mali" },
  { code: "+224", country: "Guinea" },
  { code: "+225", country: "Ivory Coast" },
  { code: "+226", country: "Burkina Faso" },
  { code: "+227", country: "Niger" },
  { code: "+228", country: "Togo" },
  { code: "+229", country: "Benin" },
  { code: "+230", country: "Mauritius" },
  { code: "+231", country: "Liberia" },
  { code: "+232", country: "Sierra Leone" },
  { code: "+233", country: "Ghana" },
  { code: "+234", country: "Nigeria" },
  { code: "+235", country: "Chad" },
  { code: "+236", country: "Central African Republic" },
  { code: "+237", country: "Cameroon" },
  { code: "+238", country: "Cape Verde" },
  { code: "+239", country: "São Tomé and Príncipe" },
  { code: "+240", country: "Equatorial Guinea" },
  { code: "+241", country: "Gabon" },
  { code: "+242", country: "Republic of the Congo" },
  { code: "+243", country: "Democratic Republic of the Congo" },
  { code: "+244", country: "Angola" },
  { code: "+245", country: "Guinea-Bissau" },
  { code: "+246", country: "British Indian Ocean Territory" },
  { code: "+248", country: "Seychelles" },
  { code: "+249", country: "Sudan" },
  { code: "+250", country: "Rwanda" },
  { code: "+251", country: "Ethiopia" },
  { code: "+252", country: "Somalia" },
  { code: "+253", country: "Djibouti" },
  { code: "+254", country: "Kenya" },
  { code: "+255", country: "Tanzania" },
  { code: "+256", country: "Uganda" },
  { code: "+257", country: "Burundi" },
  { code: "+258", country: "Mozambique" },
  { code: "+260", country: "Zambia" },
  { code: "+261", country: "Madagascar" },
  { code: "+262", country: "Réunion/Mayotte" },
  { code: "+263", country: "Zimbabwe" },
  { code: "+264", country: "Namibia" },
  { code: "+265", country: "Malawi" },
  { code: "+266", country: "Lesotho" },
  { code: "+267", country: "Botswana" },
  { code: "+268", country: "Swaziland" },
  { code: "+269", country: "Comoros" },
  { code: "+290", country: "Saint Helena" },
  { code: "+291", country: "Eritrea" },
  { code: "+297", country: "Aruba" },
  { code: "+298", country: "Faroe Islands" },
  { code: "+299", country: "Greenland" },
  { code: "+350", country: "Gibraltar" },
  { code: "+351", country: "Portugal" },
  { code: "+352", country: "Luxembourg" },
  { code: "+353", country: "Ireland" },
  { code: "+354", country: "Iceland" },
  { code: "+355", country: "Albania" },
  { code: "+356", country: "Malta" },
  { code: "+357", country: "Cyprus" },
  { code: "+358", country: "Finland" },
  { code: "+359", country: "Bulgaria" },
  { code: "+370", country: "Lithuania" },
  { code: "+371", country: "Latvia" },
  { code: "+372", country: "Estonia" },
  { code: "+373", country: "Moldova" },
  { code: "+374", country: "Armenia" },
  { code: "+375", country: "Belarus" },
  { code: "+376", country: "Andorra" },
  { code: "+377", country: "Monaco" },
  { code: "+378", country: "San Marino" },
  { code: "+380", country: "Ukraine" },
  { code: "+381", country: "Serbia" },
  { code: "+382", country: "Montenegro" },
  { code: "+383", country: "Kosovo" },
  { code: "+385", country: "Croatia" },
  { code: "+386", country: "Slovenia" },
  { code: "+387", country: "Bosnia and Herzegovina" },
  { code: "+389", country: "North Macedonia" },
  { code: "+420", country: "Czech Republic" },
  { code: "+421", country: "Slovakia" },
  { code: "+423", country: "Liechtenstein" },
  { code: "+500", country: "Falkland Islands" },
  { code: "+501", country: "Belize" },
  { code: "+502", country: "Guatemala" },
  { code: "+503", country: "El Salvador" },
  { code: "+504", country: "Honduras" },
  { code: "+505", country: "Nicaragua" },
  { code: "+506", country: "Costa Rica" },
  { code: "+507", country: "Panama" },
  { code: "+508", country: "Saint Pierre and Miquelon" },
  { code: "+509", country: "Haiti" },
  { code: "+590", country: "Guadeloupe" },
  { code: "+591", country: "Bolivia" },
  { code: "+592", country: "Guyana" },
  { code: "+593", country: "Ecuador" },
  { code: "+594", country: "French Guiana" },
  { code: "+595", country: "Paraguay" },
  { code: "+596", country: "Martinique" },
  { code: "+597", country: "Suriname" },
  { code: "+598", country: "Uruguay" },
  { code: "+599", country: "Netherlands Antilles" },
  { code: "+670", country: "East Timor" },
  { code: "+672", country: "Antarctica" },
  { code: "+673", country: "Brunei" },
  { code: "+674", country: "Nauru" },
  { code: "+675", country: "Papua New Guinea" },
  { code: "+676", country: "Tonga" },
  { code: "+677", country: "Solomon Islands" },
  { code: "+678", country: "Vanuatu" },
  { code: "+679", country: "Fiji" },
  { code: "+680", country: "Palau" },
  { code: "+681", country: "Wallis and Futuna" },
  { code: "+682", country: "Cook Islands" },
  { code: "+683", country: "Niue" },
  { code: "+685", country: "Samoa" },
  { code: "+686", country: "Kiribati" },
  { code: "+687", country: "New Caledonia" },
  { code: "+688", country: "Tuvalu" },
  { code: "+689", country: "French Polynesia" },
  { code: "+690", country: "Tokelau" },
  { code: "+691", country: "Micronesia" },
  { code: "+692", country: "Marshall Islands" },
  { code: "+850", country: "North Korea" },
  { code: "+852", country: "Hong Kong" },
  { code: "+853", country: "Macau" },
  { code: "+855", country: "Cambodia" },
  { code: "+856", country: "Laos" },
  { code: "+880", country: "Bangladesh" },
  { code: "+886", country: "Taiwan" },
  { code: "+960", country: "Maldives" },
  { code: "+961", country: "Lebanon" },
  { code: "+962", country: "Jordan" },
  { code: "+963", country: "Syria" },
  { code: "+964", country: "Iraq" },
  { code: "+965", country: "Kuwait" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+967", country: "Yemen" },
  { code: "+968", country: "Oman" },
  { code: "+970", country: "Palestine" },
  { code: "+971", country: "United Arab Emirates" },
  { code: "+972", country: "Israel" },
  { code: "+973", country: "Bahrain" },
  { code: "+974", country: "Qatar" },
  { code: "+975", country: "Bhutan" },
  { code: "+976", country: "Mongolia" },
  { code: "+977", country: "Nepal" },
  { code: "+992", country: "Tajikistan" },
  { code: "+993", country: "Turkmenistan" },
  { code: "+994", country: "Azerbaijan" },
  { code: "+995", country: "Georgia" },
  { code: "+996", country: "Kyrgyzstan" },
  { code: "+998", country: "Uzbekistan" },
].sort((a, b) => a.country.localeCompare(b.country));

interface MobileOtpVerificationProps {
  onVerificationSuccess: (mobileNumber: string) => void;
  onCancel?: () => void;
}

export default function MobileOtpVerification({
  onVerificationSuccess,
  onCancel,
}: MobileOtpVerificationProps) {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null); // For development: store OTP from API
  const dropdownRef = useRef<HTMLDivElement>(null);
  const otpInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };

    if (showCountryDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCountryDropdown]);

  // Countdown timer for resend OTP
  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    setError(null);

    // Validate mobile number (minimum 7 digits, maximum 15 digits)
    if (!mobileNumber || mobileNumber.length < 7 || mobileNumber.length > 15) {
      setError("Please enter a valid phone number (7-15 digits)");
      return;
    }

    setLoading(true);

    try {
      // Add selected country code prefix for the API
      const phoneWithPlus = `${selectedCountryCode}${mobileNumber}`;
      const response = await axios.post("/api/auth/send-otp", {
        mobile_number: phoneWithPlus,
      });

      // For development: store OTP if returned in response
      if (response.data.otp_code) {
        setDevOtp(response.data.otp_code);
        // Auto-fill OTP for testing
        const otpDigits = response.data.otp_code.split("");
        setOtpCode(otpDigits);
      }

      setOtpSent(true);
      startCountdown();
      setError(null);
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      const raw = err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to send OTP. Please try again.";
      setError(extractMessage(raw));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValue = value.replace(/\D/g, "").slice(0, 4);
      const newOtp = [...otpCode];
      for (let i = 0; i < pastedValue.length && index + i < 4; i++) {
        newOtp[index + i] = pastedValue[i];
      }
      setOtpCode(newOtp);
      // Focus the next empty field or the last field
      const nextIndex = Math.min(index + pastedValue.length, 3);
      otpInputRefs[nextIndex].current?.focus();
    } else {
      // Handle single digit input
      const newOtp = [...otpCode];
      newOtp[index] = value.replace(/\D/g, "");
      setOtpCode(newOtp);
      setError(null);

      // Auto-advance to next field
      if (value && index < 3) {
        otpInputRefs[index + 1].current?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);

    const fullOtp = otpCode.join("");
    if (fullOtp.length !== 4) {
      setError("Please enter the complete 4-digit OTP");
      return;
    }

    setLoading(true);

    try {
      // Add selected country code prefix for the API
      const phoneWithPlus = `${selectedCountryCode}${mobileNumber}`;
      const response = await axios.post("/api/auth/verify-otp", {
        mobile_number: phoneWithPlus,
        otp_code: fullOtp,
      });

      if (response.data.success && response.data.mobile_verified) {
        onVerificationSuccess(phoneWithPlus);
      } else {
        setError("OTP verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      const raw = err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to verify OTP. Please try again.";
      setError(extractMessage(raw));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    setOtpCode(["", "", "", ""]);
    setDevOtp(null);
    setOtpSent(false);
    setError(null);
    handleSendOtp();
  };

  return (
    <div className="space-y-4">
      {!otpSent ? (
        <>
          <div className="space-y-2">
            <label className="font-body text-sm font-medium text-foreground">
              Phone Number <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <div ref={dropdownRef} className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center gap-1 text-foreground text-sm font-medium hover:text-primary transition-colors"
                >
                  {selectedCountryCode}
                  <ChevronDown className={`h-3 w-3 transition-transform ${showCountryDropdown ? "rotate-180" : ""}`} />
                </button>
                {showCountryDropdown && (
                  <div className="absolute left-0 top-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-hidden z-20 w-64 flex flex-col">
                    <div className="p-2 border-b border-input">
                      <Input
                        type="text"
                        placeholder="Search country..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto max-h-52">
                      {countryCodes
                        .filter((item) =>
                          item.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
                          item.code.includes(countrySearch)
                        )
                        .map((item) => (
                          <button
                            key={item.code + item.country}
                            type="button"
                            onClick={() => {
                              setSelectedCountryCode(item.code);
                              setShowCountryDropdown(false);
                              setCountrySearch("");
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                              selectedCountryCode === item.code ? "bg-accent/50" : ""
                            }`}
                          >
                            <span className="font-medium">{item.code}</span>{" "}
                            <span className="text-muted-foreground">{item.country}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              <Input
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setMobileNumber(value);
                  setError(null);
                }}
                placeholder="Enter your phone number"
                className="h-12 bg-background pl-16"
                required
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              We'll text you to confirm your number.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="button"
            onClick={handleSendOtp}
            disabled={loading || !mobileNumber.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Enter the 4-digit code sent to your phone: {selectedCountryCode}{mobileNumber}
              </p>
              {devOtp && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                    Development Mode - OTP (for testing):
                  </p>
                  <p className="text-lg font-mono font-bold text-yellow-900 dark:text-yellow-100">
                    {devOtp}
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Note: SMS service not configured. This OTP is shown for testing only.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-3">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={otpInputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="h-14 w-14 text-center text-2xl font-mono bg-background border-2 border-input rounded-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  maxLength={1}
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <p className="text-sm font-medium text-destructive text-center">{error}</p>
              </div>
            )}

            <Button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading || otpCode.join("").length !== 4}
              className="w-full h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode(["", "", "", ""]);
                  setError(null);
                }}
                className="text-primary hover:underline"
                disabled={loading}
              >
                Change Number
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || countdown > 0}
                className="text-primary hover:underline disabled:text-muted-foreground disabled:cursor-not-allowed"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

