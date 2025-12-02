import { FormEvent, useEffect, useState } from "react";
import {
  Calendar,
  X,
  CheckCircle,
  Loader2,
  Plane,
  Luggage,
  FileText,
  Clock
} from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import api from "../../api/client";

type Aircraft = {
  id: number;
  model: string;
  registration_number: string;
  seat_capacity: number;
  aircraft_name?: string;
};

type CreateFlightFormProps = {
  onClose: () => void;
  onSuccess?: () => void;
};
const extractMessage = (error: any): string => {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (Array.isArray(error)) {
    return error
      .map((it) => it?.msg || it?.message || JSON.stringify(it))
      .join("; ");
  }
  if (error?.msg) return error.msg;
  if (error?.message) return error.message;
  return JSON.stringify(error);
};


export default function CreateFlightForm({
  onClose,
  onSuccess
}: CreateFlightFormProps) {
  const [loading, setLoading] = useState(false);
  const [loadingAircraft, setLoadingAircraft] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);

  const [formData, setFormData] = useState({
    // Section A - Basic Flight Info
    plane_id: "",
    flight_number: "",
    origin: "",
    destination: "",
    departure_date: "",
    departure_time: "",
    arrival_date: "",
    arrival_time: "",
    total_seats_available: "",
    price_per_seat: "",

    // Section B - Additional Details
    allowed_luggage_kg: "",
    special_amenities: [] as string[],
    notes_for_passengers: ""
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAircraft();
  }, []);

  useEffect(() => {
    if (formData.plane_id && aircraftList.length > 0) {
      const aircraft = aircraftList.find(a => a.id === parseInt(formData.plane_id));
      if (aircraft) {
        setSelectedAircraft(aircraft);
        setFormData(prev => ({
          ...prev,
          total_seats_available: prev.total_seats_available || aircraft.seat_capacity.toString()
        }));
      }
    }
  }, [formData.plane_id, aircraftList]);

  const loadAircraft = async () => {
    setLoadingAircraft(true);
    try {
      const response = await api.get("/aircraft/");
      setAircraftList(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, plane_id: response.data[0].id.toString() }));
      }
    } catch (error) {
      console.error("Error loading aircraft:", error);
      setError("Failed to load aircraft. Please try again.");
    } finally {
      setLoadingAircraft(false);
    }
  };

  const calculateDuration = () => {
    if (!formData.departure_date || !formData.departure_time ||
      !formData.arrival_date || !formData.arrival_time) {
      return null;
    }

    try {
      const departure = new Date(`${formData.departure_date}T${formData.departure_time}`);
      const arrival = new Date(`${formData.arrival_date}T${formData.arrival_time}`);
      const diffMs = arrival.getTime() - departure.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}h ${diffMinutes}m`;
    } catch {
      return null;
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Section A validation
    if (!formData.plane_id) errors.plane_id = "Required";
    if (!formData.flight_number.trim()) errors.flight_number = "Required";
    if (!formData.origin.trim()) errors.origin = "Required";
    if (!formData.destination.trim()) errors.destination = "Required";
    if (!formData.departure_date) errors.departure_date = "Required";
    if (!formData.departure_time) errors.departure_time = "Required";
    if (!formData.arrival_date) errors.arrival_date = "Required";
    if (!formData.arrival_time) errors.arrival_time = "Required";
    if (!formData.total_seats_available || parseInt(formData.total_seats_available) <= 0) {
      errors.total_seats_available = "Required (must be > 0)";
    }
    if (!formData.price_per_seat || parseFloat(formData.price_per_seat) <= 0) {
      errors.price_per_seat = "Required (must be > 0)";
    }

    // Section B validation
    if (!formData.allowed_luggage_kg || parseFloat(formData.allowed_luggage_kg) <= 0) {
      errors.allowed_luggage_kg = "Required (must be > 0)";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const departureDateTime = new Date(`${formData.departure_date}T${formData.departure_time}`);
      const arrivalDateTime = new Date(`${formData.arrival_date}T${formData.arrival_time}`);

      if (arrivalDateTime <= departureDateTime) {
        setError("Arrival time must be after departure time");
        setLoading(false);
        return;
      }

      const payload = {
        plane_id: parseInt(formData.plane_id),
        flight_number: formData.flight_number,
        origin: formData.origin,
        destination: formData.destination,
        departure_time: departureDateTime.toISOString(),
        arrival_time: arrivalDateTime.toISOString(),
        flight_type: "charter",
        base_price: parseFloat(formData.price_per_seat),
        is_full_charter_only: false,
        total_seats_available: parseInt(formData.total_seats_available),
        allowed_luggage_kg: parseFloat(formData.allowed_luggage_kg),
        special_amenities: formData.special_amenities,
        notes_for_passengers: formData.notes_for_passengers || null
      };

      console.log('Submitting flight creation with payload:', payload);

      const response = await api.post("/flights/", payload);

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      if (response.status >= 200 && response.status < 300) {
        console.log('Flight created successfully:', response.data);
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        console.error('Flight creation failed:', response.data);
        const raw = response.data?.detail || response.data?.message || `Failed to create flight (Status: ${response.status})`;
        setError(extractMessage(raw));
      }
    } catch (err: any) {
      console.error("Error creating flight:", err);
      const detail = err.response?.data?.detail;
      const message = err.response?.data?.message;
      const errorMessage = extractMessage(detail) ||
        (typeof message === 'string' ? message : '') ||
        err.message ||
        "Failed to create flight. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };


  if (success) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-accent/10 p-4">
          <CheckCircle className="h-12 w-12 text-accent" />
        </div>
        <h2 className="font-heading text-2xl font-bold mb-2">Flight Created!</h2>
        <p className="text-muted-foreground">Your flight has been successfully created and is now available for booking.</p>
      </div>
    );
  }

  const duration = calculateDuration();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold">Create New Flight</h2>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Create a flight that passengers can book
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

        {loadingAircraft && aircraftList.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading aircraft...</p>
          </div>
        ) : aircraftList.length === 0 ? (
          <div className="text-center py-12">
            <Plane className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-heading text-xl font-bold mb-2">No Aircraft Available</h3>
            <p className="text-muted-foreground mb-4">
              You need to add an aircraft to your inventory before creating a flight.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section A - Basic Flight Info */}
            <div>
              <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                Basic Flight Info
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="font-body text-sm font-medium text-foreground mb-2 block">
                    Select Aircraft <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.plane_id}
                    onChange={(e) => handleChange("plane_id", e.target.value)}
                    className={`w-full h-12 rounded-lg border border-input bg-background px-3 py-2 font-body text-sm ${fieldErrors.plane_id ? "border-destructive" : ""}`}
                    required
                  >
                    <option value="">Select Aircraft</option>
                    {aircraftList.map((aircraft) => (
                      <option key={aircraft.id} value={aircraft.id}>
                        {aircraft.aircraft_name || aircraft.model} - {aircraft.registration_number} ({aircraft.seat_capacity} seats)
                      </option>
                    ))}
                  </select>
                  {fieldErrors.plane_id && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.plane_id}</p>
                  )}
                  {selectedAircraft && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Selected: {selectedAircraft.aircraft_name || selectedAircraft.model} ({selectedAircraft.seat_capacity} seats capacity)
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block">
                    Flight Number <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g., AV-1234"
                    value={formData.flight_number}
                    onChange={(e) => handleChange("flight_number", e.target.value.toUpperCase())}
                    className={`h-12 ${fieldErrors.flight_number ? "border-destructive" : ""}`}
                    required
                  />
                  {fieldErrors.flight_number && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.flight_number}</p>
                  )}
                </div>

                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block">
                    Source Airport <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g., DEL (Delhi)"
                    value={formData.origin}
                    onChange={(e) => handleChange("origin", e.target.value)}
                    className={`h-12 ${fieldErrors.origin ? "border-destructive" : ""}`}
                    required
                  />
                  {fieldErrors.origin && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.origin}</p>
                  )}
                </div>

                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block">
                    Destination Airport <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g., BOM (Mumbai)"
                    value={formData.destination}
                    onChange={(e) => handleChange("destination", e.target.value)}
                    className={`h-12 ${fieldErrors.destination ? "border-destructive" : ""}`}
                    required
                  />
                  {fieldErrors.destination && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.destination}</p>
                  )}
                </div>

                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Departure Date <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.departure_date}
                    onChange={(e) => handleChange("departure_date", e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`h-12 ${fieldErrors.departure_date ? "border-destructive" : ""}`}
                    required
                  />
                  {fieldErrors.departure_date && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.departure_date}</p>
                  )}
                </div>

                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Departure Time <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="time"
                    value={formData.departure_time}
                    onChange={(e) => handleChange("departure_time", e.target.value)}
                    className={`h-12 ${fieldErrors.departure_time ? "border-destructive" : ""}`}
                    required
                  />
                  {fieldErrors.departure_time && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.departure_time}</p>
                  )}
                </div>

                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Arrival Date <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.arrival_date}
                    onChange={(e) => handleChange("arrival_date", e.target.value)}
                    min={formData.departure_date || new Date().toISOString().split('T')[0]}
                    className={`h-12 ${fieldErrors.arrival_date ? "border-destructive" : ""}`}
                    required
                  />
                  {fieldErrors.arrival_date && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.arrival_date}</p>
                  )}
                </div>

                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Arrival Time <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="time"
                    value={formData.arrival_time}
                    onChange={(e) => handleChange("arrival_time", e.target.value)}
                    className={`h-12 ${fieldErrors.arrival_time ? "border-destructive" : ""}`}
                    required
                  />
                  {fieldErrors.arrival_time && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.arrival_time}</p>
                  )}
                </div>

                {duration && (
                  <div className="md:col-span-2">
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm font-medium text-foreground">
                        Flight Duration: <span className="text-primary">{duration}</span>
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block">
                    Total Seats Available <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="Auto-filled from aircraft"
                    min="1"
                    value={formData.total_seats_available}
                    onChange={(e) => handleChange("total_seats_available", e.target.value)}
                    className={`h-12 ${fieldErrors.total_seats_available ? "border-destructive" : ""}`}
                    required
                  />
                  {fieldErrors.total_seats_available && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.total_seats_available}</p>
                  )}
                </div>

                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block">
                    Price per Seat <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={formData.price_per_seat}
                    onChange={(e) => handleChange("price_per_seat", e.target.value)}
                    className={`h-12 ${fieldErrors.price_per_seat ? "border-destructive" : ""}`}
                    required
                  />
                  {fieldErrors.price_per_seat && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.price_per_seat}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section B - Additional Flight Details */}
            <div>
              <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Additional Flight Details
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                    <Luggage className="h-4 w-4" />
                    Allowed Luggage (kg) <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="Max luggage weight per passenger"
                    min="0"
                    step="0.1"
                    value={formData.allowed_luggage_kg}
                    onChange={(e) => handleChange("allowed_luggage_kg", e.target.value)}
                    className={`h-12 ${fieldErrors.allowed_luggage_kg ? "border-destructive" : ""}`}
                    required
                  />
                  {fieldErrors.allowed_luggage_kg && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.allowed_luggage_kg}</p>
                  )}
                </div>



                <div className="md:col-span-2">
                  <label className="font-body text-sm font-medium text-foreground mb-2 block">
                    Notes for Passengers (optional)
                  </label>
                  <textarea
                    placeholder="Any special instructions or information for passengers..."
                    value={formData.notes_for_passengers}
                    onChange={(e) => handleChange("notes_for_passengers", e.target.value)}
                    className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 font-body text-sm"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-background pb-6">
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
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Flight
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

