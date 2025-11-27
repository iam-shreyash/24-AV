import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plane, MapPin, Calendar, Clock, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

import { Badge } from "../ui/badge";
import { extractMessage } from "../../lib/extractMessage";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { getStoredAuth } from "../auth/Login";
import { useToast } from "../ui/toast";

type ExternalFlight = {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  base_price: number;
  flight_number: string;
  airline: string;
  aircraft: string;
  is_external: boolean;
  source: string;
};

export default function ExternalFlightsViewer() {
  const auth = getStoredAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [flights, setFlights] = useState<ExternalFlight[]>([]);
  const [apiStatus, setApiStatus] = useState<{
    enabled: boolean;
    has_amadeus?: boolean;
    has_aviationstack?: boolean;
    providers?: string[];
    recommended?: string;
  } | null>(null);
  const [searchParams, setSearchParams] = useState({
    origin: "",
    destination: "",
    date: ""
  });
  const [error, setError] = useState<string | null>(null);

  // Check API status on mount
  useEffect(() => {
    if (auth?.token) {
      checkApiStatus();
    }
  }, [auth?.token]);

  const checkApiStatus = async () => {
    setStatusLoading(true);
    try {
      const response = await axios.get("/api/external-flights/status", {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });
      setApiStatus(response.data);
    } catch (error: any) {
      console.error("Error checking API status:", error);
      setApiStatus({ enabled: false, has_api_key: false });
    } finally {
      setStatusLoading(false);
    }
  };

  const searchFlights = async () => {
    if (!searchParams.origin && !searchParams.destination) {
      setError("Please enter at least origin or destination");
      showToast("Please enter at least origin or destination", "error");
      return;
    }

    setLoading(true);
    setError(null);
    setFlights([]);
    
    try {
      const params = new URLSearchParams();
      if (searchParams.origin) params.append("origin", searchParams.origin);
      if (searchParams.destination) params.append("destination", searchParams.destination);
      if (searchParams.date) params.append("date", searchParams.date);
      params.append("limit", "50");

      console.log("Searching flights with params:", {
        origin: searchParams.origin,
        destination: searchParams.destination,
        date: searchParams.date
      });

      const response = await axios.get(`/api/external-flights/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
        timeout: 30000 // 30 second timeout
      });

      console.log("API Response:", response.data);
      
      const flightsData = response.data.flights || [];
      setFlights(flightsData);
      
      if (flightsData.length === 0) {
        setError("No flights found for the given criteria. Try different airports or dates.");
        showToast("No flights found. Try different search criteria.", "warning");
      } else {
        showToast(`Found ${flightsData.length} flight(s)`, "success");
      }
    } catch (error: any) {
      console.error("Error searching flights:", error);
      let raw = error.response?.data?.detail || error.message || "Failed to search flights. Please check your API key and try again.";
      const errorMessage = extractMessage(raw);
      // Format multi-line error messages for display
      const singleLine = errorMessage.includes('\n') ? errorMessage.split('\n').join(' ') : errorMessage;
      setError(singleLine);
      showToast(singleLine.length > 100 ? singleLine.substring(0, 100) + "..." : singleLine, "error");
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl font-bold">External Flights (AviationStack)</h2>
        <p className="text-muted-foreground mt-1">
          Search and view flights from AviationStack API
        </p>
      </div>

      {/* API Status */}
      {!statusLoading && (
        <Card className={`p-4 ${apiStatus?.enabled ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
          <div className="flex items-center gap-3">
            {apiStatus?.enabled ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            <div className="flex-1">
              <p className="font-medium">
                {apiStatus?.enabled ? "External API Enabled" : "External API Disabled"}
              </p>
              <p className="text-sm text-muted-foreground">
                {apiStatus?.enabled
                  ? apiStatus?.recommended === "amadeus"
                    ? "Amadeus API is configured and ready (Free tier available)"
                    : "AviationStack API is configured and ready"
                  : apiStatus?.has_amadeus || apiStatus?.has_aviationstack
                  ? "API credentials found but ENABLE_EXTERNAL_FLIGHT_API is not set to true"
                  : "API credentials not configured. Add them via API Keys section."}
              </p>
              {apiStatus?.providers && apiStatus.providers.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {apiStatus.providers.map((provider: string) => (
                    <Badge key={provider} variant="outline" className="text-xs">
                      {provider === "amadeus" ? "✅ Amadeus" : "AviationStack"}
                    </Badge>
                  ))}
                </div>
              )}
              {apiStatus?.recommended === "aviationstack" && (
                <p className="text-xs text-yellow-700 mt-2">
                  ⚠️ Note: AviationStack free tier may not include Flights endpoint. Consider using Amadeus (free tier available).
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Search Form */}
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Origin (Airport Code)</label>
            <Input
              placeholder="e.g., BOM, DEL"
              value={searchParams.origin}
              onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value.toUpperCase() })}
              className="uppercase"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Destination (Airport Code)</label>
            <Input
              placeholder="e.g., DXB, JFK"
              value={searchParams.destination}
              onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value.toUpperCase() })}
              className="uppercase"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Date (Optional)</label>
            <Input
              type="date"
              value={searchParams.date}
              onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={searchFlights}
              disabled={loading || !apiStatus?.enabled}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search Flights
                </>
              )}
            </Button>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </Card>

      {/* Results */}
      {flights.length > 0 && (
        <Card>
          <div className="p-4 border-b">
            <h3 className="font-heading text-lg font-semibold">
              Found {flights.length} flight(s)
            </h3>
          </div>
          <div className="divide-y">
            {flights.map((flight) => (
              <div key={flight.id} className="p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="bg-blue-50">
                        {flight.flight_number || "N/A"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{flight.airline}</span>
                      <Badge variant="secondary" className="text-xs">
                        {flight.source}
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Origin</p>
                          <p className="font-medium">{flight.origin}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Destination</p>
                          <p className="font-medium">{flight.destination}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Departure</p>
                          <p className="font-medium">{formatDate(flight.departure_time)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Arrival</p>
                          <p className="font-medium">{formatDate(flight.arrival_time)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                    <p className="font-heading text-2xl font-bold text-primary">
                      ₹{flight.base_price.toLocaleString("en-IN")}
                    </p>
                    {flight.aircraft && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Aircraft: {flight.aircraft}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!loading && flights.length === 0 && searchParams.origin && (
        <Card className="p-12 text-center">
          <Plane className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-heading text-xl font-bold mb-2">No Flights Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check if the API is enabled.
          </p>
        </Card>
      )}
    </div>
  );
}

