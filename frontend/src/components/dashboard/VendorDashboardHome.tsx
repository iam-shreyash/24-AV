import { useAuth } from "../auth/AuthContext";

export default function VendorDashboardHome() {
  const { user } = useAuth();

  // Only render for vendor users
  if (!user || user.role !== "vendor") return null;

  // Return null to hide the section completely
  return null;
}
