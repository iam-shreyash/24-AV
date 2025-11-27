import { FormEvent, useState, useEffect } from "react";
import axios from "axios";
import { X, Plane, Calendar, MapPin, CreditCard, CheckCircle, Download, Users, User, Mail, Phone, FileText, ArrowRight, Clock } from "lucide-react";
import { extractMessage } from "../../lib/extractMessage";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AircraftGallery from "./AircraftGallery";
import AircraftInfo from "./AircraftInfo";

// Helper function to get airport code from city name
const getAirportCode = (city: string): string => {
  const airportMap: Record<string, string> = {
    'mumbai': 'BOM',
    'delhi': 'DEL',
    'bangalore': 'BLR',
    'chennai': 'MAA',
    'kolkata': 'CCU',
    'hyderabad': 'HYD',
    'pune': 'PNQ',
    'goa': 'GOI',
    'los angeles': 'LAX',
    'new york': 'JFK',
    'london': 'LHR',
    'dubai': 'DXB',
    'singapore': 'SIN',
    'tokyo': 'NRT',
    'paris': 'CDG',
    'frankfurt': 'FRA',
    'teterboro': 'TEB'
  };
  const cityLower = city.toLowerCase();
  for (const [key, code] of Object.entries(airportMap)) {
    if (cityLower.includes(key)) {
      return code;
    }
  }
  // Return first 3 uppercase letters if not found
  return city.substring(0, 3).toUpperCase().replace(/\s/g, '');
};

// Helper function to get full airport name
const getAirportName = (city: string): string => {
  const airportNames: Record<string, string> = {
    'mumbai': 'Chhatrapati Shivaji Maharaj International Airport',
    'delhi': 'Indira Gandhi International Airport',
    'bangalore': 'Kempegowda International Airport',
    'chennai': 'Chennai International Airport',
    'kolkata': 'Netaji Subhas Chandra Bose International Airport',
    'hyderabad': 'Rajiv Gandhi International Airport',
    'pune': 'Pune Airport',
    'goa': 'Goa International Airport',
    'los angeles': 'Los Angeles International Airport',
    'new york': 'John F. Kennedy International Airport',
    'london': 'Heathrow Airport',
    'dubai': 'Dubai International Airport',
    'teterboro': 'Teterboro Airport'
  };
  const cityLower = city.toLowerCase();
  for (const [key, name] of Object.entries(airportNames)) {
    if (cityLower.includes(key)) {
      return name;
    }
  }
  return `${city} Airport`;
};

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { getStoredAuth } from "../auth/Login";

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
  // Aircraft details
  flight_name?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  aircraft_images?: string[];
};

type BookingModalProps = {
  flight: Flight;
  mode: "seat" | "charter";
  onClose: () => void;
  onSuccess: () => void;
};

export default function BookingModal({ flight, mode, onClose, onSuccess }: BookingModalProps) {
  const auth = getStoredAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingIds, setBookingIds] = useState<number[]>([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [availableSeats, setAvailableSeats] = useState<number | null>(flight.available_seats ?? null);
  const [flightDetails, setFlightDetails] = useState<Flight | null>(null);
  const [loadingFlightDetails, setLoadingFlightDetails] = useState(false);
  
  // Booking form fields
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  
  // Fetch flight details (including aircraft info and images) when modal opens
  useEffect(() => {
    const fetchFlightDetails = async () => {
      setLoadingFlightDetails(true);
      try {
        const response = await axios.get<Flight>(`/api/flights/${flight.id}`);
        const flightData = response.data;
        
        // Update available seats
        if (flightData.available_seats !== undefined) {
          setAvailableSeats(flightData.available_seats);
        }
        
        // Store full flight details including aircraft info
        setFlightDetails(flightData);
      } catch (error) {
        console.error("Error fetching flight details:", error);
        // If fetch fails, use the flight prop as fallback with default aircraft fields
        setFlightDetails({
          ...flight,
          flight_name: flight.flight_number || `Flight ${flight.id}`,
          manufacturer: null,
          model: null,
          aircraft_images: []
        });
      } finally {
        setLoadingFlightDetails(false);
      }
    };
    
    fetchFlightDetails();
  }, [flight.id]);
  const [passengerName, setPassengerName] = useState("");
  const [passengerEmail, setPassengerEmail] = useState(auth?.email || "");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (numberOfTickets < 1) {
      setError("Number of tickets must be at least 1");
      return;
    }
    if (mode === "seat") {
      // Check available seats
      if (availableSeats !== null && numberOfTickets > availableSeats) {
        setError(`Only ${availableSeats} seat(s) available. Requested: ${numberOfTickets}`);
        return;
      }
      if (numberOfTickets > 10) {
        setError("Maximum 10 seats can be booked at once");
        return;
      }
    }
    if (!passengerName.trim()) {
      setError("Passenger name is required");
      return;
    }
    if (!passengerEmail.trim()) {
      setError("Passenger email is required");
      return;
    }
    if (!passengerPhone.trim()) {
      setError("Passenger phone number is required");
      return;
    }

    setLoading(true);

    try {
      if (!auth) {
        setError("Please login to book a flight");
        return;
      }

      // Create booking(s) - backend handles multiple tickets
      const response = await axios.post(
        "/api/bookings/",
        {
          flight_id: flight.id,
          seat_id: null,
          is_full_charter: mode === "charter",
          quantity: numberOfTickets,
          passenger_name: passengerName,
          passenger_email: passengerEmail,
          passenger_phone: passengerPhone,
          special_requests: specialRequests || null,
          emergency_contact_name: emergencyContact || null,
          emergency_contact_phone: emergencyPhone || null
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );

      // Backend returns list of bookings
      const bookings = Array.isArray(response.data) ? response.data : [response.data];
      const ids = bookings.map(booking => booking.id);
      setBookingIds(ids);
      setBookingConfirmed(true);
      onSuccess();
    } catch (err: any) {
      console.error("Booking error:", err);
      console.error("Error response:", err.response?.data);
      
      // Extract detailed error message and normalize it
      let rawError: any = null;
      if (err.response?.data) {
        rawError = err.response.data.detail ?? err.response.data.message ?? err.response.data;
      } else if (err.message) {
        rawError = err.message;
      }
      const normalized = extractMessage(rawError) || "Failed to create booking. Please try again.";
      setError(normalized);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = async (bookingId: number): Promise<boolean> => {
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
        dataSize: response.data?.size
      });

      const contentType = response.headers['content-type'] || response.headers['Content-Type'] || '';
      console.log("Content-Type:", contentType);

      // If it's already a PDF, download it directly
      if (contentType.includes('application/pdf')) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `boarding-pass-${bookingId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        console.log("Download initiated successfully");
        return true;
      }

      // If it's HTML, convert to PDF using html2canvas + jsPDF
      if (contentType.includes('text/html') || contentType.includes('html')) {
        console.log("Received HTML, converting to PDF client-side...");
        const html = await response.data.text();
        
        const container = document.createElement('div');
        container.innerHTML = html;
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '600px';
        container.style.backgroundColor = 'white';
        document.body.appendChild(container);
        
        try {
          const canvas = await html2canvas(container, { scale: 2 });
          const imgData = canvas.toDataURL("image/png");
          
          const pdf = new jsPDF("p", "mm", "a4");
          const imgWidth = 190;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
          pdf.save(`boarding-pass-${bookingId}.pdf`);
          
          console.log("PDF generated and downloaded successfully");
          return true;
        } finally {
          document.body.removeChild(container);
        }
      }

      // If we got here, it's an unexpected content type - try to parse as error
      console.warn("Unexpected content type, attempting to parse as error");
      const text = await response.data.text();
      console.log("Error response text:", text);
      try {
        const errorData = JSON.parse(text);
        throw new Error(errorData.detail || "Failed to download ticket");
      } catch (parseError) {
        throw new Error(`Invalid response: ${text.substring(0, 100)}`);
      }
    } catch (err: any) {
      console.error("Download error:", err);
      
      // Normalize any server error into a readable string
      let rawError: any = null;
      if (err.response) {
        const data = err.response.data;
        if (data instanceof Blob) {
          try {
            const text = await data.text();
            console.log("Error blob text:", text);
            try {
              const parsed = JSON.parse(text);
              rawError = parsed.detail ?? parsed.message ?? text;
            } catch {
              rawError = text;
            }
          } catch (ex) {
            rawError = `Server error (${err.response?.status}). Please check server logs.`;
          }
        } else {
          rawError = data?.detail ?? data?.message ?? data;
        }
      } else if (err.message) {
        rawError = err.message;
      }

      const finalMsg = extractMessage(rawError) || "Failed to download ticket. Please try again.";
      alert(finalMsg);
      return false;
    }
  };

  const handleDownloadAllTickets = async () => {
    let successCount = 0;
    let failCount = 0;
    
    for (const bookingId of bookingIds) {
      const success = await handleDownloadTicket(bookingId);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
      // Small delay between downloads
      if (bookingId !== bookingIds[bookingIds.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (failCount > 0) {
      alert(`${successCount} ticket(s) downloaded successfully. ${failCount} ticket(s) failed to download.`);
    }
  };

  const calculateTotalAmount = () => {
    return flight.base_price * numberOfTickets;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  if (bookingConfirmed && bookingIds.length > 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-green-600">Booking Confirmed!</h2>
            <p className="mb-4 text-muted-foreground">
              {bookingIds.length === 1 
                ? `Your booking has been confirmed. Booking ID: #${bookingIds[0]}`
                : `${bookingIds.length} bookings have been confirmed. Booking IDs: ${bookingIds.map(id => `#${id}`).join(", ")}`
              }
            </p>
            <div className="mb-6 space-y-2 rounded-lg bg-gray-50 p-4 text-left">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-semibold">{flight.origin} → {flight.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>{numberOfTickets} {numberOfTickets === 1 ? "Ticket" : "Tickets"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{formatDate(flight.departure_time)} at {formatTime(flight.departure_time)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Total Amount: ₹{calculateTotalAmount().toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
              {bookingIds.length === 1 ? (
                <Button
                  onClick={() => handleDownloadTicket(bookingIds[0])}
                  className="flex-1 bg-blue-800 text-white hover:bg-blue-900"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Ticket
                </Button>
              ) : (
                <Button
                  onClick={handleDownloadAllTickets}
                  className="flex-1 bg-blue-800 text-white hover:bg-blue-900"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download All Tickets
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 my-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Confirm Booking</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Aircraft Information and Gallery */}
        {flightDetails && (
          <div className="mb-6 space-y-4">
            <AircraftInfo
              flightName={flightDetails.flight_name}
              manufacturer={flightDetails.manufacturer}
              model={flightDetails.model}
            />
            <AircraftGallery images={flightDetails.aircraft_images || []} />
          </div>
        )}

        {/* Flight Details - Three Column Layout */}
        <div className="mb-6 rounded-lg border bg-white p-6">
          <div className="grid grid-cols-3 gap-6 items-center">
            {/* Departure Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-gray-500 uppercase">Departure</p>
              </div>
              <p className="text-3xl font-bold text-gray-800">{getAirportCode(flight.origin)}</p>
              <p className="text-sm text-gray-500">{getAirportName(flight.origin)}</p>
              <div className="flex items-center gap-1 mt-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">{formatTime(flight.departure_time)}</p>
              </div>
            </div>

            {/* Flight Details Center */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <Plane className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-400">{flight.flight_number || `PJ-${flight.id}`}</p>
            </div>

            {/* Arrival Section */}
            <div className="space-y-2 text-right">
              <div className="flex items-center justify-end gap-2">
                <p className="text-xs text-gray-500 uppercase">Arrival</p>
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{getAirportCode(flight.destination)}</p>
              <p className="text-sm text-gray-500">{getAirportName(flight.destination)}</p>
              <div className="flex items-center justify-end gap-1 mt-2">
                <p className="text-sm font-medium text-gray-700">{formatTime(flight.arrival_time)}</p>
                <Clock className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className="mt-4 pt-4 border-t flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <p className="text-sm text-gray-600">{formatDate(flight.departure_time)}</p>
          </div>

          {/* Pricing */}
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {mode === "charter" ? "Full Charter" : "Price per Seat"}
              </span>
              <span className="text-lg font-bold text-blue-600">
                ₹{flight.base_price.toLocaleString("en-IN")}
              </span>
            </div>
            {mode === "seat" && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Amount</span>
                <span className="text-lg font-bold text-blue-600">
                  ₹{calculateTotalAmount().toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Number of Tickets */}
          {mode === "seat" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                <Users className="h-4 w-4" />
                Number of Tickets <span className="text-red-500">*</span>
              </label>
              {availableSeats !== null && (
                <div className="mb-3 rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <p className="text-sm font-medium text-blue-900">
                    {availableSeats > 0 ? (
                      <span>{availableSeats} seat{availableSeats !== 1 ? 's' : ''} available</span>
                    ) : (
                      <span className="text-red-600">No seats available</span>
                    )}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setNumberOfTickets(Math.max(1, numberOfTickets - 1))}
                  disabled={numberOfTickets <= 1}
                  className="h-10 w-10 rounded-full p-0"
                >
                  -
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold">{numberOfTickets}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const maxSeats = availableSeats !== null ? Math.min(availableSeats, 10) : 10;
                    setNumberOfTickets(Math.min(maxSeats, numberOfTickets + 1));
                  }}
                  disabled={
                    numberOfTickets >= 10 || 
                    (availableSeats !== null && numberOfTickets >= availableSeats)
                  }
                  className="h-10 w-10 rounded-full p-0"
                >
                  +
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {availableSeats !== null && availableSeats < 10
                  ? `Maximum ${availableSeats} ticket${availableSeats !== 1 ? 's' : ''} available`
                  : "Maximum 10 tickets per booking"}
              </p>
              {availableSeats !== null && numberOfTickets > availableSeats && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  ⚠ Only {availableSeats} seat{availableSeats !== 1 ? 's' : ''} available. Please reduce quantity.
                </p>
              )}
            </div>
          )}

          {/* Passenger Details */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Passenger Details
            </h3>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Passenger Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter passenger full name"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="passenger@example.com"
                  value={passengerEmail}
                  onChange={(e) => setPassengerEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="+91 1234567890"
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Emergency Contact (Optional)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Contact Name
                </label>
                <Input
                  type="text"
                  placeholder="Emergency contact name"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="h-12"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Contact Phone
                </label>
                <Input
                  type="tel"
                  placeholder="+91 1234567890"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div className="border-t pt-4">
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Special Requests or Notes (Optional)
            </label>
            <textarea
              placeholder="Any special requirements, dietary restrictions, or additional information..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              rows={3}
            />
          </div>

          {/* Total Amount Summary */}
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {numberOfTickets} {numberOfTickets === 1 ? "Ticket" : "Tickets"} × ₹{flight.base_price.toLocaleString("en-IN")}
              </span>
              <span className="text-2xl font-bold text-blue-800">
                ₹{calculateTotalAmount().toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
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
              className="flex-1 bg-blue-800 text-white hover:bg-blue-900"
            >
              {loading ? "Processing..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

