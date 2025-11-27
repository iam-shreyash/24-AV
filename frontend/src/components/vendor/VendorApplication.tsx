import React, { FormEvent, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Building2, CheckCircle, FileText, MapPin, Phone, Sparkles, Upload, Globe, User, CreditCard, ArrowLeft, ArrowRight, Receipt, XCircle } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Stepper } from "../ui/stepper";
import { extractMessage } from "../../lib/extractMessage";
import { getStoredAuth, clearAuth } from "../auth/Login";
import { countries, getStates, getCities } from "../../data/locations";

type VendorApplicationData = {
  company_name: string;
  owner_name: string;
  business_background: string;
  business_background_other: string;
  license_number: string;
  business_registration_number: string;
  tax_id: string;
  contact_phone: string;
  phone: string;
  business_address: string;
  city: string;
  state: string;
  district: string;
  country: string;
  zip_code: string;
  website: string;
  years_in_business: number | null;
  number_of_aircraft: number | null;
  description: string;
  contact_person_name: string;
  contact_person_designation: string;
  contact_person_email: string;
  bank_account_number: string;
  bank_name: string;
  bank_ifsc: string;
  bank_branch: string;
  account_holder_name: string;
};

const STEPS = [
  { number: 1, label: "Personal Details" },
  { number: 2, label: "Bank Details" },
  { number: 3, label: "GST Details" },
  { number: 4, label: "Documents" },
  { number: 5, label: "Success" }
];

const BUSINESS_BACKGROUND_OPTIONS = [
  "Aviation Company",
  "Helicopter Service",
];

export default function VendorApplication() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getStoredAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<VendorApplicationData>({
    company_name: "",
    owner_name: "",
    business_background: "",
    business_background_other: "",
    license_number: "",
    business_registration_number: "",
    tax_id: "",
    contact_phone: "",
    phone: "",
    business_address: "",
    city: "",
    state: "",
    district: "",
    country: "India",
    zip_code: "",
    website: "",
    years_in_business: null,
    number_of_aircraft: null,
    description: "",
    contact_person_name: "",
    contact_person_designation: "",
    contact_person_email: "",
    bank_account_number: "",
    bank_name: "",
    bank_ifsc: "",
    bank_branch: "",
    account_holder_name: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  // Document uploads
  const [certificateOfIncorporation, setCertificateOfIncorporation] = useState<File | null>(null);
  const [gstCertificate, setGstCertificate] = useState<File | null>(null);
  const [ownerKycDocument, setOwnerKycDocument] = useState<File | null>(null);
  const [ownerKycAddressProof, setOwnerKycAddressProof] = useState<File | null>(null);

  useEffect(() => {
    const locationState = location.state as { userId?: number; email?: string } | null;
    
    if (!auth) {
      if (locationState?.userId) {
        navigate("/login", {
          state: {
            message: "Please login to complete your vendor application.",
            redirectTo: "/vendor/application"
          }
        });
      } else {
        navigate("/login");
      }
      return;
    }

    if (auth.role !== "vendor") {
      navigate("/login");
      return;
    }

    const loadApplication = async () => {
      try {
        const response = await axios.get("/api/vendors/application", {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        if (response.data) {
          setApprovalStatus(response.data.approval_status);
          if (response.data.company_name !== "Pending Application") {
            setFormData({
              company_name: response.data.company_name || "",
              owner_name: response.data.owner_name || "",
              business_background: response.data.business_background || "",
              business_background_other: response.data.business_background_other || "",
              license_number: response.data.license_number || "",
              business_registration_number: response.data.business_registration_number || "",
              tax_id: response.data.tax_id || "",
              contact_phone: response.data.contact_phone || "",
              phone: response.data.phone || "",
              business_address: response.data.business_address || "",
              city: response.data.city || "",
              state: response.data.state || "",
              district: response.data.district || "",
              country: response.data.country || "India",
              zip_code: response.data.zip_code || "",
              website: response.data.website || "",
              years_in_business: response.data.years_in_business || null,
              number_of_aircraft: response.data.number_of_aircraft || null,
              description: response.data.description || "",
              contact_person_name: response.data.contact_person_name || "",
              contact_person_designation: response.data.contact_person_designation || "",
              contact_person_email: response.data.contact_person_email || "",
              bank_account_number: response.data.bank_account_number || "",
              bank_name: response.data.bank_name || "",
              bank_ifsc: response.data.bank_ifsc || "",
              bank_branch: response.data.bank_branch || "",
              account_holder_name: response.data.account_holder_name || ""
            });
            // Initialize states and cities based on loaded data
            if (response.data.country) {
              const states = getStates(response.data.country);
              setAvailableStates(states);
              if (response.data.state) {
                const cities = getCities(response.data.country, response.data.state);
                setAvailableCities(cities);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading application:", err);
      } finally {
        setLoadingExisting(false);
      }
    };

    loadApplication();
  }, [auth, navigate, location.state]);

  // Update available states when country changes
  useEffect(() => {
    if (formData.country) {
      const states = getStates(formData.country);
      setAvailableStates(states);
      // Reset state and city when country changes
      if (formData.state && !states.includes(formData.state)) {
        setFormData(prev => ({ ...prev, state: "", city: "" }));
        setAvailableCities([]);
      }
    } else {
      setAvailableStates([]);
      setAvailableCities([]);
    }
  }, [formData.country, formData.state]);

  // Update available cities when state changes
  useEffect(() => {
    if (formData.country && formData.state) {
      const cities = getCities(formData.country, formData.state);
      setAvailableCities(cities);
      // Reset city when state changes
      if (formData.city && !cities.includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: "" }));
      }
    } else {
      setAvailableCities([]);
    }
  }, [formData.country, formData.state, formData.city]);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.company_name.trim()) errors.company_name = "This field cannot be blank";
      if (!formData.owner_name.trim()) errors.owner_name = "This field cannot be blank";
      if (!formData.business_background.trim()) errors.business_background = "This field cannot be blank";
      if (formData.business_background === "Other" && !formData.business_background_other.trim()) {
        errors.business_background_other = "This field cannot be blank";
      }
      if (!formData.zip_code.trim()) errors.zip_code = "This field cannot be blank";
      if (!formData.country.trim()) errors.country = "Please select a country";
      if (!formData.state.trim()) errors.state = "Please select a state";
      if (!formData.city.trim()) errors.city = "Please select a city";
      if (!formData.business_address.trim()) errors.business_address = "This field cannot be blank";
    } else if (step === 2) {
      if (!formData.account_holder_name.trim()) errors.account_holder_name = "This field cannot be blank";
      if (!formData.bank_name.trim()) errors.bank_name = "This field cannot be blank";
      if (!formData.bank_account_number.trim()) errors.bank_account_number = "This field cannot be blank";
      if (!formData.bank_ifsc.trim()) errors.bank_ifsc = "This field cannot be blank";
      if (!formData.bank_branch.trim()) errors.bank_branch = "This field cannot be blank";
    } else if (step === 3) {
      if (!formData.tax_id.trim()) errors.tax_id = "This field cannot be blank";
      if (!formData.business_registration_number.trim()) errors.business_registration_number = "This field cannot be blank";
      if (!formData.license_number.trim()) errors.license_number = "This field cannot be blank";
    } else if (step === 4) {
      if (!certificateOfIncorporation) errors.certificateOfIncorporation = "Certificate of Incorporation is required";
      if (!gstCertificate) errors.gstCertificate = "GST Certificate is required";
      if (!ownerKycDocument) errors.ownerKycDocument = "Owner KYC document is required";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (currentStep < 4) {
      if (!validateStep(currentStep)) {
        return;
      }
      setCurrentStep(currentStep + 1);
      return;
    }

    // Step 4: Submit the form
    if (!validateStep(currentStep)) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Create FormData to include files
      const formDataToSend = new FormData();
      
      // Add all form fields (convert to snake_case for backend)
      formDataToSend.append("company_name", formData.company_name);
      if (formData.owner_name) formDataToSend.append("owner_name", formData.owner_name);
      if (formData.business_background) formDataToSend.append("business_background", formData.business_background);
      if (formData.business_background_other) formDataToSend.append("business_background_other", formData.business_background_other);
      if (formData.license_number) formDataToSend.append("license_number", formData.license_number);
      if (formData.business_registration_number) formDataToSend.append("business_registration_number", formData.business_registration_number);
      if (formData.tax_id) formDataToSend.append("tax_id", formData.tax_id);
      if (formData.contact_phone) formDataToSend.append("contact_phone", formData.contact_phone);
      if (formData.phone) formDataToSend.append("phone", formData.phone);
      if (formData.business_address) formDataToSend.append("business_address", formData.business_address);
      if (formData.city) formDataToSend.append("city", formData.city);
      if (formData.state) formDataToSend.append("state", formData.state);
      if (formData.district) formDataToSend.append("district", formData.district);
      if (formData.country) formDataToSend.append("country", formData.country);
      if (formData.zip_code) formDataToSend.append("zip_code", formData.zip_code);
      if (formData.website) formDataToSend.append("website", formData.website);
      if (formData.years_in_business !== null) formDataToSend.append("years_in_business", formData.years_in_business.toString());
      if (formData.number_of_aircraft !== null) formDataToSend.append("number_of_aircraft", formData.number_of_aircraft.toString());
      if (formData.description) formDataToSend.append("description", formData.description);
      if (formData.contact_person_name) formDataToSend.append("contact_person_name", formData.contact_person_name);
      if (formData.contact_person_designation) formDataToSend.append("contact_person_designation", formData.contact_person_designation);
      if (formData.contact_person_email) formDataToSend.append("contact_person_email", formData.contact_person_email);
      if (formData.bank_account_number) formDataToSend.append("bank_account_number", formData.bank_account_number);
      if (formData.bank_name) formDataToSend.append("bank_name", formData.bank_name);
      if (formData.bank_ifsc) formDataToSend.append("bank_ifsc", formData.bank_ifsc);
      if (formData.bank_branch) formDataToSend.append("bank_branch", formData.bank_branch);
      if (formData.account_holder_name) formDataToSend.append("account_holder_name", formData.account_holder_name);
      
      // Add document files (required)
      if (certificateOfIncorporation) {
        formDataToSend.append("certificate_of_incorporation", certificateOfIncorporation);
      }
      if (gstCertificate) {
        formDataToSend.append("gst_certificate", gstCertificate);
      }
      if (ownerKycDocument) {
        formDataToSend.append("owner_kyc_document", ownerKycDocument);
      }
      // Optional address proof
      if (ownerKycAddressProof) {
        formDataToSend.append("owner_kyc_address_proof", ownerKycAddressProof);
      }

      const response = await axios.post(
        "/api/vendors/application",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
            "Content-Type": "multipart/form-data"
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`Upload progress: ${percentCompleted}%`);
            }
          }
        }
      );

      // Update approval status
      setApprovalStatus(response.data.approval_status);

      // Move to success step
      setCurrentStep(5);
    } catch (err: any) {
      console.error("Error submitting application:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Full error:", JSON.stringify(err.response?.data, null, 2));
      
      const errorMessage = extractMessage(detail) || 
                          (typeof err.response?.data?.message === 'string' ? err.response?.data?.message : '') ||
                          (typeof err.message === 'string' ? err.message : '') ||
                          "Failed to submit application. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof VendorApplicationData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loadingExisting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  // Success Step
  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <Card className="p-12 text-center max-w-md border-2 bg-gradient-to-b from-card to-card/50 shadow-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle className="h-12 w-12 text-accent" />
          </div>
          <Badge className="mx-auto mb-4 flex w-fit items-center gap-2 bg-accent/10 text-accent shadow-lg">
            <Sparkles className="h-4 w-4" />
            Application Submitted
          </Badge>
          <h2 className="font-heading text-3xl font-bold mb-4">
            Application
            <span className="mt-2 block bg-gradient-to-r from-primary via-[var(--primary-glow)] to-accent bg-clip-text text-transparent">
              Submitted Successfully!
            </span>
          </h2>
          <p className="text-muted-foreground mb-6">
            Your vendor application has been submitted successfully. Our admin team will review it and get back to you soon.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            You can login anytime to check your application status. Once approved, you'll be able to access your vendor dashboard.
          </p>
          <Button
            onClick={() => {
              clearAuth();
              navigate("/login", {
                state: {
                  message: "Vendor application submitted successfully! Please wait for admin approval. You can login to check status."
                }
              });
            }}
            className="w-full"
          >
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

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
              <Building2 className="h-4 w-4" />
              Vendor Application
            </Badge>
            <h1 className="font-heading text-4xl font-bold text-blue-800 md:text-5xl">
              Complete Your Vendor Profile
            </h1>
            <p className="mt-4 font-body text-lg text-muted-foreground">
              Please provide your business details to complete your vendor registration.
            </p>
          </div>

          <Card className="border border-gray-200 bg-white p-8 shadow-lg max-w-4xl mx-auto">
            {/* Approval Status Banner */}
            {approvalStatus === "pending" && currentStep < 5 && (
              <div className="mb-6 rounded-lg border border-warning/50 bg-warning/10 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-body font-semibold text-warning">Application Pending Review</p>
                    <p className="font-body text-sm text-muted-foreground">
                      Your application has been submitted and is awaiting admin approval. You can update your details below.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {approvalStatus === "approved" && (
              <div className="mb-6 rounded-lg border border-accent/50 bg-accent/10 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-body font-semibold text-accent">Application Approved!</p>
                    <p className="font-body text-sm text-muted-foreground">
                      Your application has been approved. You can now access your vendor dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {approvalStatus === "rejected" && (
              <div className="mb-6 rounded-lg border border-orange-500/50 bg-orange-50 p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-body font-semibold text-orange-600">Application Rejected</p>
                    <p className="font-body text-sm text-gray-700">
                      Your previous application was rejected. You can update your details below and resubmit your application for review.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stepper */}
            <div className="mb-8">
              <Stepper steps={STEPS} currentStep={currentStep} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Personal Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-blue-800" />
                    <h3 className="font-heading text-xl font-semibold text-blue-800">Personal Details</h3>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="font-body text-sm font-medium text-foreground">
                        Company Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Enter your company name"
                        value={formData.company_name}
                        onChange={(e) => handleChange("company_name", e.target.value)}
                        className={`h-12 bg-background mt-1 ${fieldErrors.company_name ? "border-destructive" : ""}`}
                        required
                      />
                      {fieldErrors.company_name && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.company_name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="font-body text-sm font-medium text-foreground">
                        Owner Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Enter owner name"
                        value={formData.owner_name}
                        onChange={(e) => handleChange("owner_name", e.target.value)}
                        className={`h-12 bg-background mt-1 ${fieldErrors.owner_name ? "border-destructive" : ""}`}
                        required
                      />
                      {fieldErrors.owner_name && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.owner_name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="font-body text-sm font-medium text-foreground">
                        Business Background <span className="text-destructive">*</span>
                      </label>
                      <select
                        value={formData.business_background}
                        onChange={(e) => handleChange("business_background", e.target.value)}
                        className={`w-full h-12 rounded-lg border border-input bg-background px-3 py-2 font-body text-sm mt-1 ${fieldErrors.business_background ? "border-destructive" : ""}`}
                        required
                      >
                        <option value="">Select</option>
                        {BUSINESS_BACKGROUND_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      {fieldErrors.business_background && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.business_background}</p>
                      )}
                    </div>
                    
                    {formData.business_background === "Other" && (
                      <div>
                        <label className="font-body text-sm font-medium text-foreground">
                          Business Background (Other) <span className="text-destructive">*</span>
                        </label>
                        <Input
                          placeholder="Specify your business background"
                          value={formData.business_background_other}
                          onChange={(e) => handleChange("business_background_other", e.target.value)}
                          className={`h-12 bg-background mt-1 ${fieldErrors.business_background_other ? "border-destructive" : ""}`}
                          required
                        />
                        {fieldErrors.business_background_other && (
                          <p className="text-xs text-destructive mt-1">{fieldErrors.business_background_other}</p>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <label className="font-body text-sm font-medium text-foreground">
                        Country <span className="text-destructive">*</span>
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => handleChange("country", e.target.value)}
                        className={`w-full h-12 rounded-lg border border-input bg-background px-3 py-2 font-body text-sm mt-1 ${fieldErrors.country ? "border-destructive" : ""}`}
                        required
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.country && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.country}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="font-body text-sm font-medium text-foreground">
                        State <span className="text-destructive">*</span>
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                        disabled={!formData.country || availableStates.length === 0}
                        className={`w-full h-12 rounded-lg border border-input bg-background px-3 py-2 font-body text-sm mt-1 ${fieldErrors.state ? "border-destructive" : ""} ${!formData.country || availableStates.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                        required
                      >
                        <option value="">{formData.country ? "Select State" : "Select Country First"}</option>
                        {availableStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.state && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.state}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="font-body text-sm font-medium text-foreground">
                        City <span className="text-destructive">*</span>
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        disabled={!formData.state || availableCities.length === 0}
                        className={`w-full h-12 rounded-lg border border-input bg-background px-3 py-2 font-body text-sm mt-1 ${fieldErrors.city ? "border-destructive" : ""} ${!formData.state || availableCities.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                        required
                      >
                        <option value="">{formData.state ? "Select City" : "Select State First"}</option>
                        {availableCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.city && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="font-body text-sm font-medium text-foreground">
                        Pincode <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Enter pincode"
                        value={formData.zip_code}
                        onChange={(e) => handleChange("zip_code", e.target.value)}
                        className={`h-12 bg-background mt-1 ${fieldErrors.zip_code ? "border-destructive" : ""}`}
                        required
                      />
                      {fieldErrors.zip_code && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.zip_code}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="font-body text-sm font-medium text-foreground">
                        Address <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Enter full address"
                        value={formData.business_address}
                        onChange={(e) => handleChange("business_address", e.target.value)}
                        className={`h-12 bg-background mt-1 ${fieldErrors.business_address ? "border-destructive" : ""}`}
                        required
                      />
                      {fieldErrors.business_address && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.business_address}</p>
                      )}
                    </div>
                    
                    
                    <div>
                      <label className="font-body text-sm font-medium text-foreground">
                        Phone <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="h-12 bg-background mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Bank Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-blue-800" />
                    <h3 className="font-heading text-xl font-semibold text-blue-800">Bank Details</h3>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="font-body text-sm font-medium text-foreground">
                        Account Holder Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Name as per bank account"
                        value={formData.account_holder_name}
                        onChange={(e) => handleChange("account_holder_name", e.target.value)}
                        className="h-12 bg-background mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="font-body text-sm font-medium text-foreground">
                        Bank Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Bank name"
                        value={formData.bank_name}
                        onChange={(e) => handleChange("bank_name", e.target.value)}
                        className={`h-12 bg-background mt-1 ${fieldErrors.bank_name ? "border-destructive" : ""}`}
                        required
                      />
                      {fieldErrors.bank_name && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.bank_name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="font-body text-sm font-medium text-foreground">
                        Account Number <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Bank account number"
                        value={formData.bank_account_number}
                        onChange={(e) => handleChange("bank_account_number", e.target.value)}
                        className={`h-12 bg-background mt-1 ${fieldErrors.bank_account_number ? "border-destructive" : ""}`}
                        required
                      />
                      {fieldErrors.bank_account_number && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.bank_account_number}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="font-body text-sm font-medium text-foreground">
                        IFSC Code <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="IFSC code"
                        value={formData.bank_ifsc}
                        onChange={(e) => handleChange("bank_ifsc", e.target.value.toUpperCase())}
                        className={`h-12 bg-background mt-1 ${fieldErrors.bank_ifsc ? "border-destructive" : ""}`}
                        required
                      />
                      {fieldErrors.bank_ifsc && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.bank_ifsc}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="font-body text-sm font-medium text-foreground">
                        Branch Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Bank branch name"
                        value={formData.bank_branch}
                        onChange={(e) => handleChange("bank_branch", e.target.value)}
                        className={`h-12 bg-background mt-1 ${fieldErrors.bank_branch ? "border-destructive" : ""}`}
                        required
                      />
                      {fieldErrors.bank_branch && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.bank_branch}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: GST Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Receipt className="h-5 w-5 text-blue-800" />
                    <h3 className="font-heading text-xl font-semibold text-blue-800">GST Details</h3>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="font-body text-sm font-medium text-foreground">
                        Tax ID / GST Number <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Tax identification number"
                        value={formData.tax_id}
                        onChange={(e) => handleChange("tax_id", e.target.value)}
                        className={`h-12 bg-background mt-1 ${fieldErrors.tax_id ? "border-destructive" : ""}`}
                        required
                      />
                      {fieldErrors.tax_id && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.tax_id}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="font-body text-sm font-medium text-foreground">
                        Business Registration Number <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Business registration number"
                        value={formData.business_registration_number}
                        onChange={(e) => handleChange("business_registration_number", e.target.value)}
                        className={`h-12 bg-background mt-1 ${fieldErrors.business_registration_number ? "border-destructive" : ""}`}
                        required
                      />
                      {fieldErrors.business_registration_number && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.business_registration_number}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="font-body text-sm font-medium text-foreground">
                        License Number <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Aircraft operating license"
                        value={formData.license_number}
                        onChange={(e) => handleChange("license_number", e.target.value)}
                        className={`h-12 bg-background mt-1 ${fieldErrors.license_number ? "border-destructive" : ""}`}
                        required
                      />
                      {fieldErrors.license_number && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.license_number}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Documents */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-blue-800" />
                    <h3 className="font-heading text-xl font-semibold text-blue-800">Required Documents</h3>
                  </div>
                  
                  {/* Document Uploads */}
                  <div className="mt-6 space-y-6">
                    <div>
                      
                      
                      {/* Certificate of Incorporation */}
                      <div className="mb-6">
                        <label className="font-body text-sm font-medium text-foreground mb-2 block">
                          Certificate of Incorporation (Company Registration) <span className="text-destructive">*</span>
                        </label>
                        <div className="border-2 border-dashed border-primary/20 rounded-lg p-4 bg-primary/5">
                          <input
                            type="file"
                            id="certificateOfIncorporation"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 10 * 1024 * 1024) {
                                  setFieldErrors(prev => ({ ...prev, certificateOfIncorporation: "File size must be less than 10 MB" }));
                                  return;
                                }
                                setCertificateOfIncorporation(file);
                                setFieldErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.certificateOfIncorporation;
                                  return newErrors;
                                });
                              }
                            }}
                            className="hidden"
                          />
                          <div className="flex items-center gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("certificateOfIncorporation")?.click()}
                              className="gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              {certificateOfIncorporation ? "Change File" : "Upload File"}
                            </Button>
                            {certificateOfIncorporation && (
                              <div className="flex-1 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <span className="text-sm text-foreground">{certificateOfIncorporation.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({(certificateOfIncorporation.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCertificateOfIncorporation(null);
                                    const input = document.getElementById("certificateOfIncorporation") as HTMLInputElement;
                                    if (input) input.value = "";
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Accepted formats: PDF, JPG, JPEG, PNG (Max 10 MB)
                          </p>
                          {fieldErrors.certificateOfIncorporation && (
                            <p className="text-xs text-destructive mt-1">{fieldErrors.certificateOfIncorporation}</p>
                          )}
                        </div>
                      </div>

                      {/* GST Certificate */}
                      <div className="mb-6">
                        <label className="font-body text-sm font-medium text-foreground mb-2 block">
                          GST Registration Certificate <span className="text-destructive">*</span>
                        </label>
                        <div className="border-2 border-dashed border-primary/20 rounded-lg p-4 bg-primary/5">
                          <input
                            type="file"
                            id="gstCertificate"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 10 * 1024 * 1024) {
                                  setFieldErrors(prev => ({ ...prev, gstCertificate: "File size must be less than 10 MB" }));
                                  return;
                                }
                                setGstCertificate(file);
                                setFieldErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.gstCertificate;
                                  return newErrors;
                                });
                              }
                            }}
                            className="hidden"
                          />
                          <div className="flex items-center gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("gstCertificate")?.click()}
                              className="gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              {gstCertificate ? "Change File" : "Upload File"}
                            </Button>
                            {gstCertificate && (
                              <div className="flex-1 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <span className="text-sm text-foreground">{gstCertificate.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({(gstCertificate.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setGstCertificate(null);
                                    const input = document.getElementById("gstCertificate") as HTMLInputElement;
                                    if (input) input.value = "";
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Accepted formats: PDF, JPG, JPEG, PNG (Max 10 MB)
                          </p>
                          {fieldErrors.gstCertificate && (
                            <p className="text-xs text-destructive mt-1">{fieldErrors.gstCertificate}</p>
                          )}
                        </div>
                      </div>

                      {/* Owner KYC */}
                      <div className="mb-6">
                        <label className="font-body text-sm font-medium text-foreground mb-2 block">
                          Owner KYC (Aadhaar / Passport / Driving Licence) <span className="text-destructive">*</span>
                        </label>
                        <div className="space-y-4">
                          {/* KYC Document */}
                          <div className="border-2 border-dashed border-primary/20 rounded-lg p-4 bg-primary/5">
                            <label className="text-xs text-muted-foreground mb-2 block">KYC Document (Required)</label>
                            <input
                              type="file"
                              id="ownerKycDocument"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 10 * 1024 * 1024) {
                                    setFieldErrors(prev => ({ ...prev, ownerKycDocument: "File size must be less than 10 MB" }));
                                    return;
                                  }
                                  setOwnerKycDocument(file);
                                  setFieldErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.ownerKycDocument;
                                    return newErrors;
                                  });
                                }
                              }}
                              className="hidden"
                            />
                            <div className="flex items-center gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById("ownerKycDocument")?.click()}
                                className="gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                {ownerKycDocument ? "Change File" : "Upload KYC Document"}
                              </Button>
                              {ownerKycDocument && (
                                <div className="flex-1 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="text-sm text-foreground">{ownerKycDocument.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({(ownerKycDocument.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setOwnerKycDocument(null);
                                      const input = document.getElementById("ownerKycDocument") as HTMLInputElement;
                                      if (input) input.value = "";
                                    }}
                                    className="h-6 w-6 p-0"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            {fieldErrors.ownerKycDocument && (
                              <p className="text-xs text-destructive mt-1">{fieldErrors.ownerKycDocument}</p>
                            )}
                          </div>

                          {/* Address Proof (Optional) */}
                          <div className="border-2 border-dashed border-primary/20 rounded-lg p-4 bg-primary/5">
                            <label className="text-xs text-muted-foreground mb-2 block">Proof of Address (Optional)</label>
                            <input
                              type="file"
                              id="ownerKycAddressProof"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 10 * 1024 * 1024) {
                                    setFieldErrors(prev => ({ ...prev, ownerKycAddressProof: "File size must be less than 10 MB" }));
                                    return;
                                  }
                                  setOwnerKycAddressProof(file);
                                  setFieldErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.ownerKycAddressProof;
                                    return newErrors;
                                  });
                                }
                              }}
                              className="hidden"
                            />
                            <div className="flex items-center gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById("ownerKycAddressProof")?.click()}
                                className="gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                {ownerKycAddressProof ? "Change File" : "Upload Address Proof"}
                              </Button>
                              {ownerKycAddressProof && (
                                <div className="flex-1 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="text-sm text-foreground">{ownerKycAddressProof.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({(ownerKycAddressProof.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setOwnerKycAddressProof(null);
                                      const input = document.getElementById("ownerKycAddressProof") as HTMLInputElement;
                                      if (input) input.value = "";
                                    }}
                                    className="h-6 w-6 p-0"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Accepted formats: PDF, JPG, JPEG, PNG (Max 10 MB each)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                  <p className="text-sm font-medium text-destructive">{error}</p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
                
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-800 text-white hover:bg-blue-900"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {approvalStatus === "rejected" ? "Resubmit Application" : "Submit Application"}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
