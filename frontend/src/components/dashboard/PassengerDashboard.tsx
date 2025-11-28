import { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Plane, Sparkles, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Badge } from "../ui/badge";
import { extractMessage } from "../../lib/extractMessage";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { getStoredAuth } from "../auth/Login";

type Booking = {
  id: number;
  flight_id: number;
  passenger_id: number;
  seat_id: number | null;
  total_amount: number;
  status: string;
  booked_at: string;
  flight?: {
    id: number;
    origin: string;
    destination: string;
    departure_time: string;
    arrival_time: string;
    flight_number: string | null;
    base_price: number;
  };
};

type Flight = {
  id: number;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  base_price: number;
  flight_type: "charter" | "return_leg";
  flight_number?: string | null;
  available_seats?: number | null;
  is_full_charter_only?: boolean;
  aircraft_images?: string[];
  flight_name?: string | null;
  manufacturer?: string | null;
  model?: string | null;
};

export default function PassengerDashboard() {
  const auth = getStoredAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableFlights, setAvailableFlights] = useState<Flight[]>([]);
  const [flightsLoading, setFlightsLoading] = useState(true);

  useEffect(() => {
    loadBookings();
    loadAvailableFlights();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/bookings/", {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });
      
      // Fetch flight details for each booking
      const bookingsWithFlights = await Promise.all(
        response.data.map(async (booking: Booking) => {
          try {
            const flightResponse = await axios.get(`/api/flights/${booking.flight_id}`, {
              headers: { Authorization: `Bearer ${auth?.token}` }
            });
            return { ...booking, flight: flightResponse.data };
          } catch (err) {
            console.error(`Error loading flight ${booking.flight_id}:`, err);
            return booking;
          }
        })
      );
      
      setBookings(bookingsWithFlights);
    } catch (err: any) {
      console.error("Error loading bookings:", err);
      setError(extractMessage(err.response?.data?.detail) || t("passenger.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableFlights = async () => {
    setFlightsLoading(true);
    try {
      const response = await axios.get<Flight[]>("/api/flights", {
        params: {
          include_external: true
        }
      });
      console.log("Available flights response:", response.data);
      console.log("Number of flights received:", response.data.length);
      
      // Show only first 6 flights
      const flightsToShow = response.data.slice(0, 6);
      console.log("Flights to display:", flightsToShow.length);
      setAvailableFlights(flightsToShow);
      
      if (response.data.length === 0) {
        console.warn("No flights returned from API. Check backend logs for details.");
        console.warn("Possible reasons:");
        console.warn("1. All flights have past departure times");
        console.warn("2. No flights exist in database");
        console.warn("3. Backend error (check backend console)");
      }
    } catch (err: any) {
      console.error("Error loading available flights:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
    } finally {
      setFlightsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "ticketed":
        return "bg-accent text-accent-foreground";
      case "pending":
        return "bg-warning/10 text-warning";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
      case "refunded":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const handleDownloadTicket = async (bookingId: number) => {
    try {
      console.log(`Attempting to download ticket for booking ${bookingId}`);
      
      const response = await axios.get(`/api/bookings/${bookingId}/ticket`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
        responseType: "blob"
      });

      console.log("Response received:", {
        status: response.status,
        contentType: response.headers['content-type'],
        dataType: response.data?.constructor?.name,
      });

      // Check if response is actually a PDF
      if (response.headers['content-type'] !== 'application/pdf') {
        // Try to parse as JSON error
        const text = await response.data.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.detail || "Failed to download ticket");
        } catch (parseError) {
          throw new Error(`Invalid response: ${text.substring(0, 100)}`);
        }
      }

      // Check if response is actually a blob
      if (!(response.data instanceof Blob)) {
        console.error("Response data is not a Blob:", typeof response.data);
        throw new Error("Invalid response format - expected Blob");
      }

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `boarding-pass-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log(`Ticket downloaded successfully for booking ${bookingId}`);
    } catch (err: any) {
      console.error("Download error:", err);
      
      let errorMessage = t("passenger.downloadError");
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        console.log("Error status:", status);
        console.log("Error data type:", data?.constructor?.name);
        
        if (data instanceof Blob) {
          try {
            const text = await data.text();
            const errorData = JSON.parse(text);
            errorMessage = errorData.detail || errorMessage;
          } catch (parseError) {
            // If it's not JSON, use default message
            console.error("Could not parse error response:", parseError);
          }
        } else if (typeof data === 'object' && data.detail) {
          errorMessage = data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden py-12">
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
          <div className="mb-8 text-center">
            <Badge className="mx-auto mb-4 flex w-fit items-center gap-2 bg-accent text-accent-foreground shadow-lg">
              <Sparkles className="h-4 w-4" />
              {t("passenger.badge")}
            </Badge>
            <h1 className="font-heading text-4xl font-bold md:text-5xl">
              {t("passenger.welcomeTitle")}
            </h1>
            <p className="mt-4 font-body text-lg text-muted-foreground">
              {t("passenger.welcomeSubtitle")}
            </p>
          </div>

          {/* Available Flights section removed per request */}

          {/* My Bookings Section */}
          <Card className="border-2 bg-gradient-to-b from-card to-card/50 p-8 shadow-xl transition-all hover:shadow-2xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-semibold">{t("passenger.myBookingsTitle")}</h3>
                <p className="font-body text-sm text-muted-foreground">{t("passenger.myBookingsSubtitle")}</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">{t("passenger.loading")}</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <button
                  onClick={loadBookings}
                  className="text-primary hover:underline"
                >
                  {t("passenger.tryAgain")}
                </button>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <Plane className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-heading text-xl font-bold mb-2">{t("passenger.emptyTitle")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("passenger.emptyBody")}
                </p>
                <a
                  href="/search"
                  className="inline-block text-primary hover:underline font-medium"
                >
                  {t("passenger.emptyCta")}
                </a>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {bookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="group border-2 border-primary/20 bg-gradient-to-br from-card to-card/50 p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-body text-xs uppercase text-muted-foreground">
                        {booking.flight ? formatDate(booking.flight.departure_time) : formatDate(booking.booked_at)}
                      </p>
                    </div>
                    {booking.flight ? (
                      <>
                        <p className="font-heading text-xl font-semibold text-foreground">
                          {booking.flight.origin} → {booking.flight.destination}
                        </p>
                        {booking.flight.flight_number && (
                          <p className="font-body text-sm text-muted-foreground mt-1">
                            Flight: {booking.flight.flight_number}
                          </p>
                        )}
                        <p className="font-body text-sm text-muted-foreground mt-2">
                          Departure: {formatDateTime(booking.flight.departure_time)}
                        </p>
                        <p className="font-body text-sm text-muted-foreground">
                          Arrival: {formatDateTime(booking.flight.arrival_time)}
                        </p>
                        <p className="font-body text-sm font-medium text-foreground mt-2">
                          Amount: ₹{booking.total_amount.toLocaleString("en-IN")}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-heading text-xl font-semibold text-foreground">
                          Booking #{booking.id}
                        </p>
                        <p className="font-body text-sm text-muted-foreground mt-2">
                          Booked on: {formatDateTime(booking.booked_at)}
                        </p>
                        <p className="font-body text-sm font-medium text-foreground mt-2">
                          Amount: ₹{booking.total_amount.toLocaleString("en-IN")}
                        </p>
                      </>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <Badge className={getStatusBadgeColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                      {booking.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadTicket(booking.id)}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          {t("passenger.downloadTicket")}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}

