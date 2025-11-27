import { FormEvent, useState } from "react";
import axios from "axios";
import {
  Plane,
  X,
  Upload,
  CheckCircle,
  Loader2,
  Wifi,
  Utensils,
  Tv,
  Dog,
  Wind,
  Image as ImageIcon
} from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { getStoredAuth } from "../auth/Login";

type AircraftRegistrationFormProps = {
  onClose: () => void;
  onSuccess?: () => void;
};


export default function AircraftRegistrationForm({
  onClose,
  onSuccess
}: AircraftRegistrationFormProps) {
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
  const auth = getStoredAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Info
    aircraft_name: "",
    manufacturer: "",
    model: "",
    model_number: "",
    year_of_manufacture: "",
    registration_number: "",
    
    // Capacity & Performance
    seat_capacity: "",
    luggage_load_kg: "",
    maximum_speed: "",
    speed_unit: "km/h",
    range_km: "",
    
    // Amenities
    wifi_available: false,
    dining_service: false,
    entertainment_system: false,
    pet_onboard_allowed: false,
    air_conditioning: false,
    other_amenities: [] as string[]
  });

  const [interiorImages, setInteriorImages] = useState<(File | null)[]>([null, null, null, null]);
  const [exteriorImage, setExteriorImage] = useState<File | null>(null);
  const [interiorPreviews, setInteriorPreviews] = useState<(string | null)[]>([null, null, null, null]);
  const [exteriorPreview, setExteriorPreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.aircraft_name.trim()) errors.aircraft_name = "Required";
    if (!formData.model.trim()) errors.model = "Required";
    if (!formData.registration_number.trim()) errors.registration_number = "Required";
    if (!formData.seat_capacity || parseInt(formData.seat_capacity) <= 0) {
      errors.seat_capacity = "Required (must be > 0)";
    }
    if (!formData.luggage_load_kg || parseFloat(formData.luggage_load_kg) <= 0) {
      errors.luggage_load_kg = "Required (must be > 0)";
    }
    if (!formData.maximum_speed || parseFloat(formData.maximum_speed) <= 0) {
      errors.maximum_speed = "Required (must be > 0)";
    }
    if (!formData.range_km || parseFloat(formData.range_km) <= 0) {
      errors.range_km = "Required (must be > 0)";
    }
    // Validate at least first interior image is provided
    if (!interiorImages[0]) {
      errors.interiorImage0 = "At least one interior image is required";
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
      // Build amenities list
      const amenities: string[] = [];
      if (formData.wifi_available) amenities.push("Wi-Fi");
      if (formData.dining_service) amenities.push("Dining Service");
      if (formData.entertainment_system) amenities.push("Entertainment System");
      if (formData.pet_onboard_allowed) amenities.push("Pet Onboard Allowed");
      if (formData.air_conditioning) amenities.push("Air Conditioning");
      amenities.push(...formData.other_amenities);

      // Validate numeric fields
      const seatCapacity = parseInt(formData.seat_capacity);
      const luggageLoad = parseFloat(formData.luggage_load_kg);
      const maxSpeed = parseFloat(formData.maximum_speed);
      const rangeKm = parseFloat(formData.range_km);

      if (isNaN(seatCapacity) || seatCapacity <= 0) {
        setError("Seat capacity must be a valid positive number");
        setLoading(false);
        return;
      }
      if (isNaN(luggageLoad) || luggageLoad <= 0) {
        setError("Luggage load must be a valid positive number");
        setLoading(false);
        return;
      }
      if (isNaN(maxSpeed) || maxSpeed <= 0) {
        setError("Maximum speed must be a valid positive number");
        setLoading(false);
        return;
      }
      if (isNaN(rangeKm) || rangeKm <= 0) {
        setError("Range must be a valid positive number");
        setLoading(false);
        return;
      }

      // Prepare JSON payload matching backend schema
      const payload: any = {
        aircraft_name: formData.aircraft_name || null,
        manufacturer: formData.manufacturer || null,
        model: formData.model,
        model_number: formData.model_number || null,
        year_of_manufacture: formData.year_of_manufacture ? parseInt(formData.year_of_manufacture) : null,
        registration_number: formData.registration_number,
        seat_capacity: seatCapacity,
        luggage_load_kg: luggageLoad,
        maximum_speed: maxSpeed,
        speed_unit: formData.speed_unit || null,
        range_km: rangeKm,
        wifi_available: formData.wifi_available,
        dining_service: formData.dining_service,
        entertainment_system: formData.entertainment_system,
        pet_onboard_allowed: formData.pet_onboard_allowed,
        air_conditioning: formData.air_conditioning,
        other_amenities: formData.other_amenities,
        amenities: amenities
      };

      // Prepare FormData for file uploads
      const uploadFormData = new FormData();
      
      // Add all form fields
      uploadFormData.append("aircraft_name", payload.aircraft_name || "");
      uploadFormData.append("manufacturer", payload.manufacturer || "");
      uploadFormData.append("model", payload.model);
      uploadFormData.append("model_number", payload.model_number || "");
      if (payload.year_of_manufacture) {
        uploadFormData.append("year_of_manufacture", payload.year_of_manufacture.toString());
      }
      uploadFormData.append("registration_number", payload.registration_number);
      uploadFormData.append("seat_capacity", payload.seat_capacity.toString());
      if (payload.luggage_load_kg) {
        uploadFormData.append("luggage_load_kg", payload.luggage_load_kg.toString());
      }
      if (payload.maximum_speed) {
        uploadFormData.append("maximum_speed", payload.maximum_speed.toString());
      }
      uploadFormData.append("speed_unit", payload.speed_unit || "");
      if (payload.range_km) {
        uploadFormData.append("range_km", payload.range_km.toString());
      }
      uploadFormData.append("wifi_available", payload.wifi_available.toString());
      uploadFormData.append("wifi_type", payload.wifi_type || "");
      uploadFormData.append("dining_service", payload.dining_service.toString());
      uploadFormData.append("entertainment_system", payload.entertainment_system.toString());
      uploadFormData.append("pet_onboard_allowed", payload.pet_onboard_allowed.toString());
      uploadFormData.append("air_conditioning", payload.air_conditioning.toString());
      uploadFormData.append("other_amenities", JSON.stringify(payload.other_amenities));
      uploadFormData.append("amenities", JSON.stringify(payload.amenities));
      
      // Add image files if provided
      if (exteriorImage) {
        uploadFormData.append("exterior_image", exteriorImage);
      }
      // Add all interior images (up to 4)
      interiorImages.forEach((image, index) => {
        if (image) {
          uploadFormData.append("interior_image", image);
        }
      });

      await axios.post("/api/aircraft/", uploadFormData, {
        headers: { 
          Authorization: `Bearer ${auth?.token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error creating aircraft:", err);
      const detail = err.response?.data?.detail;
      const message = err.response?.data?.message;
      const errorMessage = extractMessage(detail) ||
                           (typeof message === 'string' ? message : '') ||
                           err.message ||
                           "Failed to register aircraft. Please try again.";
      setError(errorMessage);
      console.error("Full error response:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
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
        <h2 className="font-heading text-2xl font-bold mb-2">Aircraft Registered!</h2>
        <p className="text-muted-foreground">Your aircraft has been successfully registered.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-bold">Register New Aircraft</h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Add a new aircraft to your fleet
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Section */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              Basic Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-2 block">
                  Aircraft Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g., Sky King"
                  value={formData.aircraft_name}
                  onChange={(e) => handleChange("aircraft_name", e.target.value)}
                  className={`h-12 ${fieldErrors.aircraft_name ? "border-destructive" : ""}`}
                  required
                />
                {fieldErrors.aircraft_name && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.aircraft_name}</p>
                )}
              </div>

              <div>
                <label className="font-body text-sm font-medium text-foreground mb-2 block">
                  Manufacturer <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g., Cessna, Bombardier"
                  value={formData.manufacturer}
                  onChange={(e) => handleChange("manufacturer", e.target.value)}
                  className="h-12"
                />
              </div>

              <div>
                <label className="font-body text-sm font-medium text-foreground mb-2 block">
                  Model <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g., Citation CJ3"
                  value={formData.model}
                  onChange={(e) => handleChange("model", e.target.value)}
                  className={`h-12 ${fieldErrors.model ? "border-destructive" : ""}`}
                  required
                />
                {fieldErrors.model && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.model}</p>
                )}
              </div>

              <div>
                <label className="font-body text-sm font-medium text-foreground mb-2 block">
                  Model Number <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Official model identifier"
                  value={formData.model_number}
                  onChange={(e) => handleChange("model_number", e.target.value)}
                  className="h-12"
                />
              </div>

              <div>
                <label className="font-body text-sm font-medium text-foreground mb-2 block">
                  Year of Manufacture <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="YYYY"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.year_of_manufacture}
                  onChange={(e) => handleChange("year_of_manufacture", e.target.value)}
                  className="h-12"
                />
              </div>

              <div>
                <label className="font-body text-sm font-medium text-foreground mb-2 block">
                  Registration Number <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g., N123AB"
                  value={formData.registration_number}
                  onChange={(e) => handleChange("registration_number", e.target.value.toUpperCase())}
                  className={`h-12 ${fieldErrors.registration_number ? "border-destructive" : ""}`}
                  required
                />
                {fieldErrors.registration_number && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.registration_number}</p>
                )}
              </div>
            </div>
          </div>

          {/* Capacity & Performance Section */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Capacity & Performance</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-2 block">
                  Passenger Capacity <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Total seats"
                  min="1"
                  value={formData.seat_capacity}
                  onChange={(e) => handleChange("seat_capacity", e.target.value)}
                  className={`h-12 ${fieldErrors.seat_capacity ? "border-destructive" : ""}`}
                  required
                />
                {fieldErrors.seat_capacity && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.seat_capacity}</p>
                )}
              </div>

              <div>
                <label className="font-body text-sm font-medium text-foreground mb-2 block">
                  Luggage Load (kg) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Max luggage weight"
                  min="0"
                  step="0.1"
                  value={formData.luggage_load_kg}
                  onChange={(e) => handleChange("luggage_load_kg", e.target.value)}
                  className={`h-12 ${fieldErrors.luggage_load_kg ? "border-destructive" : ""}`}
                  required
                />
                {fieldErrors.luggage_load_kg && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.luggage_load_kg}</p>
                )}
              </div>

              <div>
                <label className="font-body text-sm font-medium text-foreground mb-2 block">
                  Maximum Speed <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Speed"
                    min="0"
                    step="0.1"
                    value={formData.maximum_speed}
                    onChange={(e) => handleChange("maximum_speed", e.target.value)}
                    className={`flex-1 h-12 ${fieldErrors.maximum_speed ? "border-destructive" : ""}`}
                    required
                  />
                  <select
                    value={formData.speed_unit}
                    onChange={(e) => handleChange("speed_unit", e.target.value)}
                    className="w-24 h-12 rounded-lg border border-input bg-background px-3 py-2 font-body text-sm"
                  >
                    <option value="km/h">km/h</option>
                    <option value="knots">knots</option>
                  </select>
                </div>
                {fieldErrors.maximum_speed && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.maximum_speed}</p>
                )}
              </div>

              <div>
                <label className="font-body text-sm font-medium text-foreground mb-2 block">
                  Range (km) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Total distance on full fuel"
                  min="0"
                  step="0.1"
                  value={formData.range_km}
                  onChange={(e) => handleChange("range_km", e.target.value)}
                  className={`h-12 ${fieldErrors.range_km ? "border-destructive" : ""}`}
                  required
                />
                {fieldErrors.range_km && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.range_km}</p>
                )}
              </div>
            </div>
          </div>

          {/* Amenities & Extras Section */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Amenities & Extras</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="wifi_available"
                  checked={formData.wifi_available}
                  onChange={(e) => handleChange("wifi_available", e.target.checked)}
                  className="h-5 w-5 rounded border-input"
                />
                <label htmlFor="wifi_available" className="font-body text-sm font-medium flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Wi-Fi Available
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="dining_service"
                  checked={formData.dining_service}
                  onChange={(e) => handleChange("dining_service", e.target.checked)}
                  className="h-5 w-5 rounded border-input"
                />
                <label htmlFor="dining_service" className="font-body text-sm font-medium flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Dining Service
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="entertainment_system"
                  checked={formData.entertainment_system}
                  onChange={(e) => handleChange("entertainment_system", e.target.checked)}
                  className="h-5 w-5 rounded border-input"
                />
                <label htmlFor="entertainment_system" className="font-body text-sm font-medium flex items-center gap-2">
                  <Tv className="h-4 w-4" />
                  Entertainment System
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="pet_onboard_allowed"
                  checked={formData.pet_onboard_allowed}
                  onChange={(e) => handleChange("pet_onboard_allowed", e.target.checked)}
                  className="h-5 w-5 rounded border-input"
                />
                <label htmlFor="pet_onboard_allowed" className="font-body text-sm font-medium flex items-center gap-2">
                  <Dog className="h-4 w-4" />
                  Pet Onboard Allowed
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="air_conditioning"
                  checked={formData.air_conditioning}
                  onChange={(e) => handleChange("air_conditioning", e.target.checked)}
                  className="h-5 w-5 rounded border-input"
                />
                <label htmlFor="air_conditioning" className="font-body text-sm font-medium flex items-center gap-2">
                  <Wind className="h-4 w-4" />
                  Air Conditioning
                </label>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="mt-6">
              <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Aircraft Images
              </h3>
              <div className="space-y-6">
                {/* Exterior Image */}
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block">
                    Exterior Image
                  </label>
                  <div className="space-y-2">
                    <div className="relative border-2 border-dashed border-primary/20 rounded-lg bg-primary/5 p-6 hover:border-primary/40 transition-colors max-w-md">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Validate file type
                            if (!file.type.startsWith('image/')) {
                              setFieldErrors(prev => ({ ...prev, exteriorImage: "Please select an image file" }));
                              return;
                            }
                            // Validate file size (max 5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              setFieldErrors(prev => ({ ...prev, exteriorImage: "Image size must be less than 5MB" }));
                              return;
                            }
                            setExteriorImage(file);
                            setFieldErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.exteriorImage;
                              return newErrors;
                            });
                            // Create preview
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setExteriorPreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {exteriorPreview ? (
                        <div className="relative">
                          <img
                            src={exteriorPreview}
                            alt="Exterior preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExteriorImage(null);
                              setExteriorPreview(null);
                            }}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="h-10 w-10 text-primary mx-auto mb-2 opacity-50" />
                          <p className="font-body text-sm text-muted-foreground">
                            Click to upload exterior image
                          </p>
                          <p className="font-body text-xs text-muted-foreground mt-1">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      )}
                    </div>
                    {fieldErrors.exteriorImage && (
                      <p className="text-xs text-destructive">{fieldErrors.exteriorImage}</p>
                    )}
                  </div>
                </div>

                {/* Interior Images - 4 slots */}
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block">
                    Interior Images (Up to 4)
                  </label>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[0, 1, 2, 3].map((index) => (
                      <div key={index}>
                        <label className="font-body text-xs text-muted-foreground mb-1 block">
                          Interior Image {index + 1} {index === 0 && <span className="text-destructive">*</span>}
                        </label>
                        <div className="relative border-2 border-dashed border-primary/20 rounded-lg bg-primary/5 p-4 hover:border-primary/40 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Validate file type
                                if (!file.type.startsWith('image/')) {
                                  setFieldErrors(prev => ({ ...prev, [`interiorImage${index}`]: "Please select an image file" }));
                                  return;
                                }
                                // Validate file size (max 5MB)
                                if (file.size > 5 * 1024 * 1024) {
                                  setFieldErrors(prev => ({ ...prev, [`interiorImage${index}`]: "Image size must be less than 5MB" }));
                                  return;
                                }
                                // Update the specific interior image
                                const newInteriorImages = [...interiorImages];
                                newInteriorImages[index] = file;
                                setInteriorImages(newInteriorImages);
                                setFieldErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors[`interiorImage${index}`];
                                  return newErrors;
                                });
                                // Create preview
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const newPreviews = [...interiorPreviews];
                                  newPreviews[index] = reader.result as string;
                                  setInteriorPreviews(newPreviews);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {interiorPreviews[index] ? (
                            <div className="relative">
                              <img
                                src={interiorPreviews[index]}
                                alt={`Interior preview ${index + 1}`}
                                className="w-full h-40 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newInteriorImages = [...interiorImages];
                                  newInteriorImages[index] = null;
                                  setInteriorImages(newInteriorImages);
                                  const newPreviews = [...interiorPreviews];
                                  newPreviews[index] = null;
                                  setInteriorPreviews(newPreviews);
                                }}
                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Upload className="h-8 w-8 text-primary mx-auto mb-2 opacity-50" />
                              <p className="font-body text-xs text-muted-foreground">
                                Click to upload
                              </p>
                              <p className="font-body text-xs text-muted-foreground mt-1">
                                PNG, JPG up to 5MB
                              </p>
                            </div>
                          )}
                        </div>
                        {fieldErrors[`interiorImage${index}`] && (
                          <p className="text-xs text-destructive mt-1">{fieldErrors[`interiorImage${index}`]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
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
                  Registering...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Register Aircraft
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

