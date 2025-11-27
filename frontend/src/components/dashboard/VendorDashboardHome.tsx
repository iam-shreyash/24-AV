import VendorPartnerSection from "../VendorPartnerSection";
import { useAuth } from "../auth/AuthContext";

export default function VendorDashboardHome() {
  const { user } = useAuth();

  // Only render the vendor partner section for vendor users
  if (!user || user.role !== "vendor") return null;

  return (
    <div>
      <VendorPartnerSection />
    </div>
  );
}
