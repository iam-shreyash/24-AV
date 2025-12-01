import { useEffect, useState } from "react";
import axios from "axios";
import {
  Plane,
  Calendar,
  Clock,
  MapPin,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  DollarSign,
  Users,
  AlertCircle
} from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Sheet, SheetContent } from "../ui/sheet";
import { getStoredAuth } from "../../utils/getStoredAuth";
import EditFlightForm from "../flights/EditFlightForm";
import { extractMessage } from "../../lib/extractMessage";

type Flight = {
  id: number;
  plane_id: number;
  flight_number: string | null;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  base_price: number;
  available_seats: number | null;
  vendor_id: number;
  is_full_charter_only: boolean;
  total_seats_available: number | null;
  allowed_luggage_kg: number | null;
  special_amenities: string[];
  notes_for_passengers: string | null;
};

export default function AdminFlightsManagement() {
  const auth = getStoredAuth();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [flightToEdit, setFlightToEdit] = useState<Flight | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [deletingFlightId, setDeletingFlightId] = useState<number | null>(null);

  useEffect(() => {
    loadAllFlights();
  }, []);

  const loadAllFlights = async () => {
    setLoading(true);
    try {
      // Use admin endpoint to get all flights
      const response = await axios.get("/api/flights/admin/all", {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });
      // Ensure all required fields have default values
      const flightsWithDefaults = response.data.map((flight: any) => ({
        ...flight,
        plane_id: flight.plane_id ?? 0,
        allowed_luggage_kg: flight.allowed_luggage_kg ?? null,
        special_amenities: flight.special_amenities ?? [],
        notes_for_passengers: flight.notes_for_passengers ?? null,
      }));
      setFlights(flightsWithDefaults);
    } catch (error: any) {
      console.error("Error loading flights:", error);
      const raw = error.response?.data?.detail || error.message || "Failed to load flights. Please try again.";
      const errorMessage = extractMessage(raw) || "Failed to load flights. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (flightId: number) => {
    if (!window.confirm("Are you sure you want to delete this flight? This action cannot be undone and will remove it from passenger search.")) {
      return;
    }

    setDeletingFlightId(flightId);
    try {
      await axios.delete(`/api/flights/${flightId}`, {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });
      // Refresh flights list
      loadAllFlights();
      alert("Flight deleted successfully.");
    } catch (error: any) {
      console.error("Error deleting flight:", error);
      const raw = error.response?.data?.detail || "Failed to delete flight. Please try again.";
      alert(extractMessage(raw) || "Failed to delete flight. Please try again.");
    } finally {
      setDeletingFlightId(null);
    }
  };

  const handleEdit = (flight: Flight) => {
    setFlightToEdit(flight);
    setIsEditFormOpen(true);
  };

  const filteredFlights = flights.filter((flight) => {
    const query = searchQuery.toLowerCase();
    return (
      flight.flight_number?.toLowerCase().includes(query) ||
      flight.origin.toLowerCase().includes(query) ||
      flight.destination.toLowerCase().includes(query) ||
      `FL-${flight.id}`.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading flights...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Manage Flights</h2>
          <p className="text-muted-foreground mt-1">
            View, edit, and delete all flights in the system
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadAllFlights}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by flight number, origin, or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Flights Table */}
      {filteredFlights.length === 0 ? (
        <Card className="p-12 text-center">
          <Plane className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-heading text-xl font-bold mb-2">No Flights Found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search query." : "No flights have been created yet."}
          </p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-6 text-left font-body text-sm font-medium text-muted-foreground">Flight</th>
                  <th className="py-3 px-6 text-left font-body text-sm font-medium text-muted-foreground">Route</th>
                  <th className="py-3 px-6 text-left font-body text-sm font-medium text-muted-foreground">Departure</th>
                  <th className="py-3 px-6 text-left font-body text-sm font-medium text-muted-foreground">Arrival</th>
                  <th className="py-3 px-6 text-left font-body text-sm font-medium text-muted-foreground">Price</th>
                  <th className="py-3 px-6 text-left font-body text-sm font-medium text-muted-foreground">Seats</th>
                  <th className="py-3 px-6 text-left font-body text-sm font-medium text-muted-foreground">Status</th>
                  <th className="py-3 px-6 text-left font-body text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlights.map((flight) => {
                  const departure = new Date(flight.departure_time);
                  const arrival = new Date(flight.arrival_time);
                  const duration = Math.round((arrival.getTime() - departure.getTime()) / (1000 * 60));
                  const isPast = arrival < new Date();
                  
                  return (
                    <tr
                      key={flight.id}
                      className="border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <td className="py-4 px-6">
                        <div className="font-heading font-semibold text-foreground">
                          {flight.flight_number || `FL-${flight.id}`}
                        </div>
                        <div className="font-body text-xs text-muted-foreground">
                          {duration} min
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-body font-medium text-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {flight.origin} → {flight.destination}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-body text-sm text-foreground">
                          {departure.toLocaleDateString()}
                        </div>
                        <div className="font-body text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-body text-sm text-foreground">
                          {arrival.toLocaleDateString()}
                        </div>
                        <div className="font-body text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-heading font-semibold text-primary">
                          ₹{parseFloat(flight.base_price.toString()).toLocaleString()}
                        </div>
                        <div className="font-body text-xs text-muted-foreground">per seat</div>
                      </td>
                      <td className="py-4 px-6">
                        {flight.is_full_charter_only ? (
                          <Badge variant="outline">Full Charter</Badge>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="font-body text-sm">
                              {flight.available_seats ?? 0} / {flight.total_seats_available ?? 0}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
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
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(flight)}
                            className="gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(flight.id)}
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
          <div className="px-6 py-4 border-t border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Showing {filteredFlights.length} of {flights.length} flights
            </p>
          </div>
        </Card>
      )}

      {/* Edit Flight Form */}
      <Sheet open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {flightToEdit && (
            <EditFlightForm
              flight={flightToEdit}
              onClose={() => {
                setIsEditFormOpen(false);
                setFlightToEdit(null);
              }}
              onSuccess={() => {
                loadAllFlights();
                setIsEditFormOpen(false);
                setFlightToEdit(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

