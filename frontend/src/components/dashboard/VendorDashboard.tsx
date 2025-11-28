import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Plane, Plus, Calendar, Clock, MapPin, RefreshCw, Edit, Trash2 } from "lucide-react";

import { Badge } from "../ui/badge";
import { extractMessage } from "../../lib/extractMessage";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Sheet, SheetContent } from "../ui/sheet";
import { Tabs, TabsContent } from "../ui/tabs";
import { getStoredAuth } from "../auth/Login";
import { useAuth } from "../auth/AuthContext";
import AircraftRegistrationForm from "../aircraft/AircraftRegistrationForm";
import CreateFlightForm from "../flights/CreateFlightForm";
import EditFlightForm from "../flights/EditFlightForm";
import RecentBookings from "../vendor/RecentBookings";
import VendorDashboardHome from "./VendorDashboardHome";
import { useToast } from "../ui/use-toast";

export default function VendorDashboard() {
  const navigate = useNavigate();
  // Use AuthContext to determine authenticated user and loading state
  const { user, loading } = useAuth();
  const auth = getStoredAuth();
  const [isAircraftFormOpen, setIsAircraftFormOpen] = useState(false);
  const [isFlightFormOpen, setIsFlightFormOpen] = useState(false);
  const [isEditFlightFormOpen, setIsEditFlightFormOpen] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any | null>(null);
  const [flightToEdit, setFlightToEdit] = useState<any | null>(null);
  const [deletingFlightId, setDeletingFlightId] = useState<number | null>(null);
  const hasCheckedApproval = useRef(false);
  const hasLoadedFlights = useRef(false);

  

  const loadVendorFlights = useCallback(async (force = false) => {
    if (!auth || auth.role !== "vendor") return;
    if (!force && hasLoadedFlights.current) return;
    
    setFlightsLoading(true);
    try {
      const response = await axios.get("/api/flights/vendor", {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setFlights(response.data);
      hasLoadedFlights.current = true;
    } catch (error) {
      console.error("Error loading flights:", error);
    } finally {
      setFlightsLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    // Prevent infinite loops by checking if we've already checked
    if (hasCheckedApproval.current) return;

    const checkApprovalStatus = async () => {
      // Wait while AuthContext determines current user
      if (loading) return;

      // If no authenticated user or wrong role, send to login
      if (!user || user.role !== "vendor") {
        navigate("/login", { replace: true });
        return;
      }

      // At this point user exists and is vendor
      if (!auth || auth.role !== "vendor") {
        // If token missing, send to login
        navigate("/login", { replace: true });
        return;
      }

      hasCheckedApproval.current = true;

      try {
        const response = await axios.get("/api/vendors/application", {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        const vendor = response.data;

        // If not approved, redirect to application page
        if (vendor.approval_status !== "approved") {
          navigate("/vendor/application", { replace: true });
        } else {
          // Only load flights if approved
          loadVendorFlights();
        }
      } catch (err) {
        // Network or server error - prefer sending to login instead of forcing application redirect
        console.error("Vendor approval check failed:", err);
        navigate("/login", { replace: true });
      }
    };

    checkApprovalStatus();
  }, [user, loading, auth, navigate, loadVendorFlights]);

  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("flights");

  // Function to handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Function to show success message
  const showSuccess = (message: string) => {
    showToast(message, "success");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Actions */}
      <div className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Plane className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold">Vendor Dashboard</h1>
                <p className="font-body text-xs text-muted-foreground">Manage your fleet and operations</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAircraftFormOpen(true);
                  showSuccess("Aircraft form opened");
                }}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Aircraft
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setIsFlightFormOpen(true);
                  showSuccess("Flight creation form opened");
                }}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Flight
              </Button>
              
            </div>
          </div>
        </div>
      </div>

      {/* Aircraft Registration Form Slide-out */}
      <Sheet open={isAircraftFormOpen} onOpenChange={setIsAircraftFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <AircraftRegistrationForm
            onClose={() => setIsAircraftFormOpen(false)}
            onSuccess={() => {
              // Optionally refresh data or show success message
              console.log("Aircraft registered successfully");
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Flight Creation Form Slide-out */}
      <Sheet open={isFlightFormOpen} onOpenChange={setIsFlightFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <CreateFlightForm
            onClose={() => setIsFlightFormOpen(false)}
            onSuccess={() => {
              // Refresh flights list after creating a new flight
              hasLoadedFlights.current = false;
              loadVendorFlights(true);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Flight Edit Form Slide-out */}
      <Sheet open={isEditFlightFormOpen} onOpenChange={setIsEditFlightFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {flightToEdit && (
            <EditFlightForm
              flight={flightToEdit}
              onClose={() => {
                setIsEditFlightFormOpen(false);
                setFlightToEdit(null);
              }}
              onSuccess={() => {
                // Refresh flights list after editing
                hasLoadedFlights.current = false;
                loadVendorFlights(true);
                setIsEditFlightFormOpen(false);
                setFlightToEdit(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      <section className="relative overflow-hidden pt-4 pb-6">
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
              <VendorDashboardHome />

              <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-0">

            {/* Flights Tab */}
            <TabsContent value="flights" className="mt-0">
              {/* My Flights Section */}
              <Card className="border-2 bg-gradient-to-b from-card to-card/50 p-8 shadow-xl transition-all hover:shadow-2xl mb-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Plane className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading text-2xl font-semibold">My Flights</h3>
                      <p className="font-body text-sm text-muted-foreground">All flights you've created</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      hasLoadedFlights.current = false;
                      loadVendorFlights(true);
                    }}
                    disabled={flightsLoading}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${flightsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
                {flightsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading flights...</p>
                  </div>
                ) : flights.length === 0 ? (
                  <div className="text-center py-12">
                    <Plane className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h4 className="font-heading text-xl font-bold mb-2">No Flights Yet</h4>
                    <p className="text-muted-foreground mb-4">
                      Create your first flight to start accepting bookings.
                    </p>
                    <Button onClick={() => setIsFlightFormOpen(true)} className="gap-2">
                      <Calendar className="h-4 w-4" />
                      Create Flight
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="py-3 pr-6 text-left font-body text-sm font-medium text-muted-foreground">Flight</th>
                          <th className="py-3 pr-6 text-left font-body text-sm font-medium text-muted-foreground">Route</th>
                          <th className="py-3 pr-6 text-left font-body text-sm font-medium text-muted-foreground">Departure</th>
                          <th className="py-3 pr-6 text-left font-body text-sm font-medium text-muted-foreground">Arrival</th>
                          <th className="py-3 pr-6 text-left font-body text-sm font-medium text-muted-foreground">Price</th>
                          <th className="py-3 pr-6 text-left font-body text-sm font-medium text-muted-foreground">Status</th>
                          <th className="py-3 pr-6 text-left font-body text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flights.map((flight) => {
                          const departure = new Date(flight.departure_time);
                          const arrival = new Date(flight.arrival_time);
                          const duration = Math.round((arrival.getTime() - departure.getTime()) / (1000 * 60));
                          const isPast = arrival < new Date();
                          
                          const handleEdit = (e: React.MouseEvent) => {
                            e.stopPropagation();
                            setFlightToEdit(flight);
                            setIsEditFlightFormOpen(true);
                          };
                          
                          const handleDelete = async (e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (!window.confirm(`Are you sure you want to delete flight ${flight.flight_number || `FL-${flight.id}`}? This will also remove it from passenger search.`)) {
                              return;
                            }
                            
                            setDeletingFlightId(flight.id);
                            try {
                              await axios.delete(`/api/flights/${flight.id}`, {
                                headers: { Authorization: `Bearer ${auth?.token}` }
                              });
                              // Refresh flights list
                              hasLoadedFlights.current = false;
                              loadVendorFlights(true);
                            } catch (error: any) {
                              const raw = error.response?.data?.detail || error.response?.data?.message || error.message || "Failed to delete flight. Please try again.";
                              alert(extractMessage(raw) || "Failed to delete flight. Please try again.");
                            } finally {
                              setDeletingFlightId(null);
                            }
                          };
                          
                          return (
                            <tr 
                              key={flight.id} 
                              className="border-b border-border transition-colors hover:bg-muted/50"
                            >
                              <td className="py-4 pr-6">
                                <div className="font-heading font-semibold text-foreground">
                                  {flight.flight_number || `FL-${flight.id}`}
                                </div>
                                <div className="font-body text-xs text-muted-foreground">
                                  {duration} min
                                </div>
                              </td>
                              <td className="py-4 pr-6">
                                <div className="font-body font-medium text-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {flight.origin} → {flight.destination}
                                </div>
                              </td>
                              <td className="py-4 pr-6">
                                <div className="font-body text-sm text-foreground">
                                  {departure.toLocaleDateString()}
                                </div>
                                <div className="font-body text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>
                              <td className="py-4 pr-6">
                                <div className="font-body text-sm text-foreground">
                                  {arrival.toLocaleDateString()}
                                </div>
                                <div className="font-body text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>
                              <td className="py-4 pr-6">
                                <div className="font-heading font-semibold text-primary">
                                  ₹{parseFloat(flight.base_price).toLocaleString()}
                                </div>
                                <div className="font-body text-xs text-muted-foreground">per seat</div>
                              </td>
                              <td className="py-4 pr-6">
                                <Badge
                                  className={
                                    isPast
                                      ? "bg-muted text-muted-foreground"
                                      : "bg-accent text-accent-foreground"
                                  }
                                >
                                  {isPast ? "Completed" : "Active"}
                                </Badge>
                              </td>
                              <td className="py-4 pr-6">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleEdit}
                                    className="gap-1"
                                  >
                                    <Edit className="h-3 w-3" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDelete}
                                    disabled={deletingFlightId === flight.id}
                                    className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    {deletingFlightId === flight.id ? "Deleting..." : "Delete"}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* Recent Bookings Section */}
              <div className="mt-6">
                <RecentBookings />
              </div>
            </TabsContent>

            
          </Tabs>
        </div>
      </section>
    </div>
  );
}
