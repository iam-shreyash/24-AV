import { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle, DollarSign, Plane, Shield, TrendingUp, Building2, X, Check } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { getStoredAuth } from "../../utils/getStoredAuth";

const metrics = [
  { label: "Active Flights", value: "42", trend: "+5% WoW", icon: Plane, color: "text-primary" },
  { label: "Seat Fill Rate", value: "78%", trend: "+12 pts", icon: TrendingUp, color: "text-accent" },
  { label: "Refund Queue", value: "3", trend: "Low risk", icon: CheckCircle, color: "text-success" },
  { label: "Revenue (MTD)", value: "$1.2M", trend: "+18% MoM", icon: DollarSign, color: "text-primary" }
];

type VendorApplication = {
  id: number;
  user_id: number;
  company_name: string;
  license_number: string | null;
  business_registration_number: string | null;
  contact_phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  approval_status: string;
  created_at: string;
};

export default function AdminDashboard() {
  const auth = getStoredAuth();
  const [pendingVendors, setPendingVendors] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    loadPendingVendors();
  }, []);

  const loadPendingVendors = async () => {
    try {
      const response = await axios.get("/api/vendors/pending", {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });
      setPendingVendors(response.data);
    } catch (error) {
      console.error("Error loading pending vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (vendorId: number, status: "approved" | "rejected") => {
    setProcessing(vendorId);
    try {
      await axios.patch(
        `/api/vendors/${vendorId}/approve`,
        {
          approval_status: status,
          approval_notes: status === "approved" ? "Application approved by admin" : "Application rejected"
        },
        {
          headers: { Authorization: `Bearer ${auth?.token}` }
        }
      );
      await loadPendingVendors();
    } catch (error) {
      console.error("Error approving vendor:", error);
      alert("Failed to update vendor status. Please try again.");
    } finally {
      setProcessing(null);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden py-12">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="mb-8 text-center">
            <Badge className="mx-auto mb-4 flex w-fit items-center gap-2 bg-primary/10 text-primary shadow-lg">
              <Shield className="h-4 w-4" />
              Admin Command Center
            </Badge>
            <h1 className="font-heading text-4xl font-bold md:text-5xl">
              Monitor Operations
              <span className="mt-2 block bg-gradient-to-r from-primary via-[var(--primary-glow)] to-accent bg-clip-text text-transparent">
                & Approvals
              </span>
            </h1>
            <p className="mt-4 font-body text-lg text-muted-foreground">
              Track operations, approvals, and settlements in real-time.
            </p>
          </div>

          <div className="mb-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric, index) => (
              <Card
                key={metric.label}
                className="group border-2 bg-gradient-to-b from-card to-card/50 p-6 text-center transition-all hover:-translate-y-2 hover:border-primary/20 hover:shadow-2xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 group-hover:scale-110">
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <p className="font-body text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-2 font-heading text-3xl font-bold text-foreground">{metric.value}</p>
                <p className="mt-1 text-xs font-medium text-accent">{metric.trend}</p>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2 bg-gradient-to-b from-card to-card/50 p-6 shadow-xl transition-all hover:shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold">Pending Vendor Applications</h3>
                    <p className="font-body text-sm text-muted-foreground">
                      {pendingVendors.length} application(s) awaiting review
                    </p>
                  </div>
                </div>
                <Badge className="bg-warning/10 text-warning">{pendingVendors.length}</Badge>
              </div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading applications...</p>
                </div>
              ) : pendingVendors.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-accent mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">No pending applications</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {pendingVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className="rounded-lg border border-primary/20 bg-primary/5 p-4 transition-all hover:bg-primary/10"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-heading font-semibold text-foreground">{vendor.company_name}</h4>
                          <p className="font-body text-xs text-muted-foreground mt-1">
                            {vendor.city && vendor.country ? `${vendor.city}, ${vendor.country}` : "Location not provided"}
                          </p>
                          {vendor.license_number && (
                            <p className="font-body text-xs text-muted-foreground">License: {vendor.license_number}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="bg-warning/10 text-warning">
                          Pending
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleApproval(vendor.id, "approved")}
                          disabled={processing === vendor.id}
                          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(vendor.id, "rejected")}
                          disabled={processing === vendor.id}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="border-2 bg-gradient-to-b from-card to-card/50 p-6 shadow-xl transition-all hover:shadow-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-semibold">Operational Alerts</h3>
                  <p className="font-body text-sm text-muted-foreground">Important notifications requiring attention.</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "Flight PP-202 needs compliance review",
                  "Stripe payout delayed for Booking #8841",
                  "System maintenance scheduled for next week"
                ].map((alert, index) => (
                  <li
                    key={index}
                    className="rounded-lg border border-warning/30 bg-warning/10 p-3 font-body text-sm text-foreground transition-all hover:bg-warning/20"
                  >
                    {alert}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

