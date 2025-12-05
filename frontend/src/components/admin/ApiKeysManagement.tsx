import { useEffect, useState } from "react";
import axios from "axios";
import { Key, Eye, EyeOff, Save, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

import { Badge } from "../ui/badge";
import { extractMessage } from "../../lib/extractMessage";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { getStoredAuth } from "../../utils/getStoredAuth";

type ApiKey = {
  id: number;
  key_name: string;
  description: string | null;
  is_active: boolean;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
};

type ApiKeyWithValue = ApiKey & {
  value?: string;
  showValue?: boolean;
};

// Standard API key definitions
const API_KEY_DEFINITIONS = [
  {
    key_name: "RAZORPAY_KEY_ID",
    label: "Razorpay Key ID",
    description: "Razorpay API Key ID for payment processing",
    type: "text",
  },
  {
    key_name: "RAZORPAY_KEY_SECRET",
    label: "Razorpay Key Secret",
    description: "Razorpay API Key Secret for payment processing",
    type: "password",
  },
  {
    key_name: "STRIPE_SECRET_KEY",
    label: "Stripe Secret Key",
    description: "Stripe API Secret Key for payment processing",
    type: "password",
  },
  {
    key_name: "STRIPE_PUBLISHABLE_KEY",
    label: "Stripe Publishable Key",
    description: "Stripe Publishable Key for client-side operations",
    type: "text",
  },
  {
    key_name: "PAYPAL_CLIENT_ID",
    label: "PayPal Client ID",
    description: "PayPal API Client ID for payment processing",
    type: "text",
  },
  {
    key_name: "PAYPAL_CLIENT_SECRET",
    label: "PayPal Client Secret",
    description: "PayPal API Client Secret for payment processing",
    type: "password",
  },
  {
    key_name: "OTP_SERVICE_KEY",
    label: "OTP Service Key",
    description: "API key for OTP service (optional, for future use)",
    type: "password",
  },

];

export default function ApiKeysManagement() {
  const auth = getStoredAuth();
  const [apiKeys, setApiKeys] = useState<ApiKeyWithValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/api-keys/", {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });

      // Fetch values for each key
      const keysWithValues = await Promise.all(
        response.data.map(async (key: ApiKey) => {
          try {
            const valueResponse = await axios.get(`/api/api-keys/${key.key_name}/value`, {
              headers: { Authorization: `Bearer ${auth?.token}` },
            });
            return {
              ...key,
              value: valueResponse.data.value || "",
              showValue: false,
            };
          } catch {
            return {
              ...key,
              value: "",
              showValue: false,
            };
          }
        })
      );

      // Merge with definitions to ensure all keys are shown
      const allKeys = API_KEY_DEFINITIONS.map((def) => {
        const existing = keysWithValues.find((k) => k.key_name === def.key_name);
        return existing || {
          id: 0,
          key_name: def.key_name,
          description: def.description,
          is_active: true,
          updated_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          value: "",
          showValue: false,
        };
      });

      setApiKeys(allKeys);
    } catch (error: any) {
      console.error("Error loading API keys:", error);
      const raw = error.response?.data?.detail ?? error.response?.data?.message ?? error.message;
      alert(extractMessage(raw) || "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (keyName: string, value: string) => {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [keyName]: "Value cannot be empty" }));
      return;
    }

    setSaving((prev) => ({ ...prev, [keyName]: true }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[keyName];
      return newErrors;
    });

    try {
      const existing = apiKeys.find((k) => k.key_name === keyName && k.id > 0);

      if (existing) {
        // Update existing
        await axios.patch(
          `/api/api-keys/${keyName}`,
          { value },
          { headers: { Authorization: `Bearer ${auth?.token}` } }
        );
      } else {
        // Create new
        const definition = API_KEY_DEFINITIONS.find((d) => d.key_name === keyName);
        await axios.post(
          "/api/api-keys/",
          {
            key_name: keyName,
            value,
            description: definition?.description || null,
            is_active: true,
          },
          { headers: { Authorization: `Bearer ${auth?.token}` } }
        );
      }

      // Reload keys
      await loadApiKeys();

      // Show success message
      setSuccess((prev) => ({ ...prev, [keyName]: true }));
      setTimeout(() => {
        setSuccess((prev) => {
          const newSuccess = { ...prev };
          delete newSuccess[keyName];
          return newSuccess;
        });
      }, 3000);
    } catch (error: any) {
      console.error(`Error saving API key ${keyName}:`, error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const raw = error.response?.data?.detail ?? error.response?.data?.message ?? error.message ?? "Failed to save API key";
      setErrors((prev) => ({
        ...prev,
        [keyName]: extractMessage(raw),
      }));
    } finally {
      setSaving((prev) => {
        const newSaving = { ...prev };
        delete newSaving[keyName];
        return newSaving;
      });
    }
  };

  const toggleShowValue = (keyName: string) => {
    setApiKeys((prev) =>
      prev.map((k) =>
        k.key_name === keyName ? { ...k, showValue: !k.showValue } : k
      )
    );
  };

  const handleValueChange = (keyName: string, newValue: string) => {
    setApiKeys((prev) =>
      prev.map((k) => (k.key_name === keyName ? { ...k, value: newValue } : k))
    );
    // Clear error when user starts typing
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[keyName];
      return newErrors;
    });
  };

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading API keys...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Manage API Keys</h2>
          <p className="text-muted-foreground mt-1">
            Securely manage API keys for payment gateways and external services
          </p>
        </div>
        <Button variant="outline" onClick={loadApiKeys} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Info Alert */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-sm">Security Notice</p>
            <p className="text-xs text-muted-foreground mt-1">
              API keys are encrypted in the database. Only admins can view and update keys.
              Changes take effect immediately after saving.
            </p>
          </div>
        </div>
      </Card>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => {
          const definition = API_KEY_DEFINITIONS.find((d) => d.key_name === apiKey.key_name);
          const isPassword = definition?.type === "password";
          const isSaving = saving[apiKey.key_name];
          const hasError = errors[apiKey.key_name];
          const hasSuccess = success[apiKey.key_name];

          return (
            <Card key={apiKey.key_name} className="p-6">
              <div className="space-y-4">
                {/* Key Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-primary" />
                      <h3 className="font-heading text-lg font-semibold">
                        {definition?.label || apiKey.key_name}
                      </h3>
                      {apiKey.id > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Configured
                        </Badge>
                      )}
                    </div>
                    {definition?.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {definition.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Key Value Input */}
                <div className="space-y-2">
                  <label className="font-body text-sm font-medium text-foreground">
                    API Key Value
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        type={isPassword && !apiKey.showValue ? "password" : "text"}
                        value={apiKey.value || ""}
                        onChange={(e) => handleValueChange(apiKey.key_name, e.target.value)}
                        placeholder={`Enter ${definition?.label || apiKey.key_name}`}
                        className={`pr-10 ${hasError ? "border-destructive" : ""}`}
                        disabled={isSaving}
                      />
                      {isPassword && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => toggleShowValue(apiKey.key_name)}
                        >
                          {apiKey.showValue ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    <Button
                      onClick={() => handleSave(apiKey.key_name, apiKey.value || "")}
                      disabled={isSaving || !apiKey.value?.trim()}
                      className="gap-2"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Error Message */}
                  {hasError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {hasError}
                    </p>
                  )}

                  {/* Success Message */}
                  {hasSuccess && (
                    <p className="text-xs text-primary flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      API key saved successfully
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

