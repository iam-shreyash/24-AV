import { FormEvent, useState, useEffect } from "react";
import axios from "axios";
import { Save, Loader2, Mail, User, Key, Eye, EyeOff } from "lucide-react";
import { extractMessage } from "../../lib/extractMessage";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { getStoredAuth } from "../../utils/getStoredAuth";
import { useToast } from "../ui/use-toast";

type UserInfo = {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string | null;
};

type EditUserFormProps = {
  user: UserInfo;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditUserForm({ user, onClose, onSuccess }: EditUserFormProps) {
  const auth = getStoredAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: user.email,
    full_name: user.full_name || ""
  });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await axios.patch(`/api/users/${user.id}`, formData, {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });
      toast({ description: "User updated successfully" });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error updating user:", err);
      setError(extractMessage(err.response?.data?.detail) || "Failed to update user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setError(null);
    setResettingPassword(true);

    try {
      await axios.patch(
        `/api/users/${user.id}/reset-password`,
        { new_password: newPassword },
        {
          headers: { Authorization: `Bearer ${auth?.token}` }
        }
      );
      toast({ description: "Password reset successfully" });
      setNewPassword("");
      setShowPasswordReset(false);
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setError(extractMessage(err.response?.data?.detail) || "Failed to reset password. Please try again.");
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-bold">Edit User</h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Update user information
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-body text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email <span className="text-destructive">*</span>
            </label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12"
              required
            />
          </div>

          <div>
            <label className="font-body text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Role:</strong> {user.role.toUpperCase()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Status:</strong> {user.is_active ? "Active" : "Inactive"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Note: Role and status cannot be changed from this form. Use the Activate/Deactivate button or contact a system administrator to change roles.
            </p>
          </div>

          {/* Password Reset Section */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Password Reset
                </h3>
                <p className="text-xs text-muted-foreground">
                  Reset the user's password to a new value
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPasswordReset(!showPasswordReset);
                  setNewPassword("");
                  setError(null);
                }}
              >
                {showPasswordReset ? "Cancel" : "Reset Password"}
              </Button>
            </div>

            {showPasswordReset && (
              <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block">
                    New Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-12 pr-10"
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-12 w-12"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={resettingPassword || !newPassword || newPassword.length < 6}
                  className="w-full"
                >
                  {resettingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update User
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}



