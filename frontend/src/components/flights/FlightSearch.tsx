import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { MapPin, Plane, RefreshCw, Search, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import BookingModal from "./BookingModal";

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

export default function FlightSearch() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [bookingMode, setBookingMode] = useState<"seat" | "charter" | null>(null);
  const location = useLocation();
  const { t } = useTranslation();
  const filters = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      origin: params.get("from") ?? "",
      destination: params.get("to") ?? ""
    };
  }, [location.search]);

  const fetchFlights = async (searchOrigin = origin, searchDestination = destination) => {
    setLoading(true);
    try {
      const response = await axios.get<Flight[]>("/api/flights", {
        params: { 
          origin: searchOrigin || undefined, 
          destination: searchDestination || undefined,
          include_external: true
        }
      });
      console.log("Fetched flights:", response.data.length, "flights");
      console.log("Flight data:", response.data);
      setFlights(response.data);
      
      if (response.data.length === 0) {
        console.warn("No flights returned. Check backend logs for details.");
      }
    } catch (error: any) {
      console.error("Error fetching flights:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);
      setFlights([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (flight: Flight, mode: "seat" | "charter") => {
    setSelectedFlight(flight);
    setBookingMode(mode);
  };

  const handleBookingClose = () => {
    setSelectedFlight(null);
    setBookingMode(null);
  };

  const handleBookingSuccess = () => {
    // Refresh flights after successful booking
    fetchFlights();
  };

  useEffect(() => {
    setOrigin(filters.origin);
    setDestination(filters.destination);
    fetchFlights(filters.origin, filters.destination).catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.origin, filters.destination]);

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
            <Badge className="mx-auto mb-4 flex w-fit items-center gap-2 bg-blue-100 text-blue-800 shadow-lg">
              <Sparkles className="h-4 w-4" />
              {t("flightSearch.badge")}
            </Badge>
            <h1 className="font-heading text-4xl font-bold text-blue-800 md:text-5xl">
              {t("flightSearch.title")}
            </h1>
            <p className="mt-4 font-body text-lg text-gray-600">
              {t("flightSearch.subtitle")}
            </p>
          </div>

          <Card className="mb-8 border border-gray-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="grid flex-1 gap-4 md:grid-cols-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder={t("flightSearch.originPlaceholder")}
                    value={origin}
                    onChange={(event) => setOrigin(event.target.value)}
                    className="h-12 bg-background pl-10"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder={t("flightSearch.destinationPlaceholder")}
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    className="h-12 bg-background pl-10"
                  />
                </div>
                <Button
                  onClick={() => fetchFlights()}
                  disabled={loading}
                  size="lg"
                  className="h-12 bg-blue-800 font-semibold text-white shadow-lg transition-all hover:bg-blue-900 hover:scale-105 hover:shadow-xl"
                >
                  <Search className="mr-2 h-5 w-5" />
                  {loading ? t("flightSearch.searching") : t("flightSearch.searchButton")}
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => fetchFlights()}
                disabled={loading}
                className="h-12 border-blue-800 text-blue-800 hover:bg-blue-50"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {t("flightSearch.refresh")}
              </Button>
            </div>
          </Card>

          <div className="mb-6 text-center">
            <h3 className="font-heading text-2xl font-semibold text-blue-800">{t("flightSearch.availableFlightsTitle")}</h3>
            <p className="mt-2 font-body text-sm text-gray-600">
              {flights.length > 0
                ? t("flightSearch.resultsCount", { count: flights.length })
                : t("flightSearch.noFlights")}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {flights.map((flight) => (
              <Card
                key={flight.id}
                className="group border border-gray-200 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      {flight.flight_type.replace("_", " ").toUpperCase()}
                    </Badge>
                    {flight.available_seats !== null && flight.available_seats !== undefined && (
                      <Badge className="bg-green-100 text-green-800">
                        {t("flightSearch.seatsAvailable", { count: flight.available_seats })}
                      </Badge>
                    )}
                  </div>
                  <p className="font-heading text-2xl font-bold text-blue-800">₹{flight.base_price.toLocaleString()}</p>
                </div>
                <div className="mb-4 flex items-center gap-4">
                  <div className="text-center">
                    <div className="font-heading text-xl font-bold">{flight.origin}</div>
                    <div className="font-body text-xs text-muted-foreground">
                      {new Date(flight.departure_time).toLocaleDateString()}
                    </div>
                    <div className="font-body text-sm text-muted-foreground">
                      {new Date(flight.departure_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col items-center">
                    <Plane className="h-6 w-6 text-primary" />
                    <div className="mt-1 font-body text-xs text-muted-foreground">{t("flightSearch.direct")}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-heading text-xl font-bold">{flight.destination}</div>
                    <div className="font-body text-xs text-muted-foreground">
                      {new Date(flight.arrival_time).toLocaleDateString()}
                    </div>
                    <div className="font-body text-sm text-muted-foreground">
                      {new Date(flight.arrival_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                {flight.available_seats !== null && flight.available_seats !== undefined && flight.available_seats === 0 && (
                  <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-2">
                    <p className="text-sm font-medium text-red-800 text-center">No seats available</p>
                  </div>
                )}
                <Button
                  type="button"
                  onClick={() => handleBook(flight, "seat")}
                  disabled={flight.available_seats !== null && flight.available_seats !== undefined && flight.available_seats === 0}
                  className="w-full bg-blue-800 text-white hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book Seat
                </Button>
              </Card>
            ))}
            {!flights.length && !loading && (
              <Card className="col-span-2 border-2 border-dashed p-12 text-center">
                <Plane className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="font-body text-lg text-muted-foreground">
                  {t("flightSearch.noFlightsFiltered")}
                </p>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {selectedFlight && bookingMode && (
        <BookingModal
          flight={selectedFlight}
          mode={bookingMode}
          onClose={handleBookingClose}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

