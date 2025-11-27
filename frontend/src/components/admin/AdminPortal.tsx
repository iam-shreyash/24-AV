import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Shield,
  Building2,
  CheckCircle,
  Eye,
  MapPin,
  Phone,
  Globe,
  FileText,
  CreditCard,
  User,
  Check,
  XCircle,
  Users,
  Plane,
  Calendar,
  Ticket,
  Menu,
  X,
  Settings,
  Mail,
  UserCircle,
  Calendar as CalendarIcon,
  Save,
  Edit,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Loader2,
  Key,
  History,
  CheckCircle2,
  XCircle as XCircleIcon,
  FileCheck,
  BarChart3,
  DollarSign,
  TrendingUp,
  Activity,
  ClipboardList,
  Bell,
  AlertTriangle,
  Download,
  Upload,
  FileSpreadsheet
} from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Sheet, SheetContent } from "../ui/sheet";
import { Dialog, DialogContent, DialogFooter } from "../ui/dialog";
import { useToast } from "../ui/toast";
import { getStoredAuth, clearAuth } from "../auth/Login";
import AdminFlightsManagement from "./AdminFlightsManagement";
import EditUserForm from "./EditUserForm";
import ApiKeysManagement from "./ApiKeysManagement";
import ExternalFlightsViewer from "./ExternalFlightsViewer";
import AircraftGallery from "../flights/AircraftGallery";

type VendorApplication = {
  id: number;
  user_id: number;
  company_name: string;
  owner_name: string | null;
  business_background: string | null;
  business_background_other: string | null;
  license_number: string | null;
  business_registration_number: string | null;
  tax_id: string | null;
  contact_phone: string | null;
  phone: string | null;
  business_address: string | null;
  city: string | null;
  state: string | null;
  district: string | null;
  country: string | null;
  zip_code: string | null;
  website: string | null;
  years_in_business: number | null;
  number_of_aircraft: number | null;
  description: string | null;
  contact_person_name: string | null;
  contact_person_designation: string | null;
  contact_person_email: string | null;
  bank_account_number: string | null;
  bank_name: string | null;
  bank_ifsc: string | null;
  bank_branch: string | null;
  account_holder_name: string | null;
  approval_status: string;
  approval_notes: string | null;
  certificate_of_incorporation_path: string | null;
  gst_certificate_path: string | null;
  owner_kyc_document_path: string | null;
  owner_kyc_address_proof_path: string | null;
  created_at: string;
};

type AdminSection = "dashboard" | "users" | "aircraft" | "flights" | "bookings" | "notifications" | "api-keys" | "external-flights" | "profile";

type AdminProfile = {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type UserInfo = {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string | null;
};

export default function AdminPortal() {
  const navigate = useNavigate();
  const auth = getStoredAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>("users");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingVendors, setPendingVendors] = useState<VendorApplication[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<VendorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    full_name: "",
    email: ""
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<UserInfo[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("all");
  const [usersTab, setUsersTab] = useState<"all" | "pending">("all");
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [isEditUserFormOpen, setIsEditUserFormOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserInfo | null>(null);
  const [vendorData, setVendorData] = useState<Record<number, { id: number; is_active: boolean; company_name?: string }>>({});
  const [vendorDataLoading, setVendorDataLoading] = useState(false);
  const [vendorDataError, setVendorDataError] = useState(false); // Track if we've failed to prevent infinite retries
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [vendorToDeactivate, setVendorToDeactivate] = useState<{ userId: number; vendorId: number; companyName: string; isActive: boolean } | null>(null);
  const [processingVendorId, setProcessingVendorId] = useState<number | null>(null);
  const [viewingBookingsFor, setViewingBookingsFor] = useState<UserInfo | null>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [isBookingsSheetOpen, setIsBookingsSheetOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState<Record<number, string>>({});
  const [allAircraft, setAllAircraft] = useState<any[]>([]);
  const [aircraftLoading, setAircraftLoading] = useState(false);
  const [aircraftSearchQuery, setAircraftSearchQuery] = useState("");
  const [selectedAircraft, setSelectedAircraft] = useState<any | null>(null);
  const [isAircraftSheetOpen, setIsAircraftSheetOpen] = useState(false);
  const [vendorNames, setVendorNames] = useState<Record<number, string>>({});
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [allBookingsLoading, setAllBookingsLoading] = useState(false);
  const [bookingSearchQuery, setBookingSearchQuery] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all");
  const [bookingDateFilter, setBookingDateFilter] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  
  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsDateRange, setAnalyticsDateRange] = useState<string>("7d");
  
  // Financial state
  const [financialData, setFinancialData] = useState<any>(null);
  const [financialLoading, setFinancialLoading] = useState(false);
  
  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [auditLogsFilter, setAuditLogsFilter] = useState<string>("all");
  
  // Bulk operations state
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkProcessing, setBulkProcessing] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { showToast } = useToast();

  useEffect(() => {
    // Check if user is admin
    if (!auth || auth.role !== "admin") {
      navigate("/admin", { replace: true });
      return;
    }
    // Load pending vendors on initial load (only if we have auth token)
    if (activeSection === "users" && auth?.token) {
      loadPendingVendors();
    }
  }, [auth, navigate]);

  // Load profile when profile section is selected
  useEffect(() => {
    if (activeSection === "profile" && auth && auth.role === "admin" && !adminProfile && !profileLoading) {
      loadAdminProfile();
    }
  }, [activeSection, auth]);

  // Load all users when users section is selected and on "all" tab
  useEffect(() => {
    if (activeSection === "users" && usersTab === "all" && auth && auth.role === "admin" && !usersLoading) {
      loadAllUsers();
    }
  }, [activeSection, usersTab]);

  // Load all aircraft when aircraft section is selected
  useEffect(() => {
    if (activeSection === "aircraft" && auth && auth.role === "admin") {
      loadAllAircraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // Load all bookings when bookings section is selected
  useEffect(() => {
    if (activeSection === "bookings" && auth && auth.role === "admin") {
      loadAllBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);



  // Load notifications when notifications section is selected
  useEffect(() => {
    if (activeSection === "notifications" && auth && auth.role === "admin") {
      loadNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // Load vendor data for vendor users
  useEffect(() => {
    const loadVendorData = async () => {
      if (allUsers.length === 0) {
        setVendorData({});
        setVendorDataLoading(false);
        return;
      }
      
      // Prevent infinite retries if we've already failed
      if (vendorDataError) {
        return;
      }
      
      if (vendorDataLoading) return; // Prevent concurrent requests
      
      const vendorUsers = allUsers.filter(u => u.role === "vendor");
      if (vendorUsers.length === 0) {
        setVendorData({});
        setVendorDataLoading(false);
        return;
      }

      // Set defaults immediately so buttons aren't stuck
      const defaultVendorMap: Record<number, { id: number; is_active: boolean; company_name?: string }> = {};
      vendorUsers.forEach(user => {
        defaultVendorMap[user.id] = {
          id: 0,
          is_active: true,
          company_name: user.email
        };
      });
      setVendorData(defaultVendorMap);
      setVendorDataLoading(true);

      try {
        // Fetch all vendors once with timeout
        const vendorsResponse = await Promise.race([
          axios.get("/api/vendors/", {
            headers: { Authorization: `Bearer ${auth?.token}` }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Request timeout")), 10000)
          )
        ]) as any;
        
        const vendors = vendorsResponse.data || [];
        const vendorMap: Record<number, { id: number; is_active: boolean; company_name?: string }> = {};
        
        // Match vendors to users
        vendorUsers.forEach(user => {
          const vendor = vendors.find((v: any) => v.user_id === user.id);
          if (vendor) {
            vendorMap[user.id] = {
              id: vendor.id,
              is_active: vendor.is_active !== undefined ? vendor.is_active : true,
              company_name: vendor.company_name
            };
          } else {
            // Vendor record doesn't exist yet, keep default
            vendorMap[user.id] = defaultVendorMap[user.id];
          }
        });
        
        setVendorData(vendorMap);
      } catch (error: any) {
        // Mark as error to prevent infinite retries
        setVendorDataError(true);
        
        // Log error once (before setting vendorDataError)
        console.error("Error loading vendor data:", error);
        // Keep defaults if fetch fails - buttons will still work
        if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
          console.warn("Cannot connect to backend server. Make sure it's running on http://localhost:8000");
        } else if (error.response?.status === 403) {
          console.warn("Admin access required to load vendor data");
        } else if (error.message === "Request timeout") {
          console.warn("Vendor data request timed out");
        } else {
          console.warn("Failed to load vendor data:", error.response?.data?.detail || error.message);
        }
      } finally {
        setVendorDataLoading(false);
      }
    };

    if (allUsers.length > 0 && auth && auth.role === "admin" && !vendorDataError) {
      loadVendorData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUsers, auth]); // Only run when allUsers or auth changes, not on every render

  const loadPendingVendors = async () => {
    if (!auth?.token) return;
    
    try {
      const response = await axios.get("/api/vendors/pending", {
        headers: { Authorization: `Bearer ${auth.token}` },
        timeout: 5000 // 5 second timeout to prevent hanging
      });
      setPendingVendors(response.data);
    } catch (error: any) {
      // Only log non-network errors to avoid spam
      if (error.code !== "ERR_NETWORK" && error.code !== "ECONNABORTED") {
        console.error("Error loading pending vendors:", error);
      }
      // Set empty array on error to prevent UI issues
      setPendingVendors([]);
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
          approval_notes: approvalNotes || (status === "approved" ? "Application approved by admin" : "Application rejected")
        },
        {
          headers: { Authorization: `Bearer ${auth?.token}` }
        }
      );
      setApprovalNotes("");
      setSelectedVendor(null);
      await loadPendingVendors();
    } catch (error) {
      console.error("Error approving vendor:", error);
      alert("Failed to update vendor status. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  const loadAdminProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const response = await axios.get("/api/users/me", {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });
      setAdminProfile(response.data);
      setProfileFormData({
        full_name: response.data.full_name || "",
        email: response.data.email || ""
      });
    } catch (error: any) {
      console.error("Error loading admin profile:", error);
      // If endpoint doesn't exist, create profile from auth data
      if (error.response?.status === 404 || error.response?.status === 401) {
        setAdminProfile({
          id: 0,
          email: auth?.email || "",
          full_name: null,
          role: auth?.role || "admin",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setProfileFormData({
          full_name: "",
          email: auth?.email || ""
        });
      } else {
        setProfileError("Failed to load profile information.");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const response = await axios.patch(
        "/api/users/me",
        {
          full_name: profileFormData.full_name || null,
          email: profileFormData.email
        },
        {
          headers: { Authorization: `Bearer ${auth?.token}` }
        }
      );
      setAdminProfile(response.data);
      setIsEditingProfile(false);
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setProfileError(error.response?.data?.detail || "Failed to update profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const loadAllUsers = async (showLoading: boolean = true) => {
    if (showLoading) {
      setUsersLoading(true);
    }
    try {
      const response = await axios.get("/api/users/", {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });
      // Force a new array reference to ensure React detects the change
      const usersArray = Array.isArray(response.data) ? [...response.data] : [];
      setAllUsers(usersArray);
    } catch (error: any) {
      console.error("Error loading users:", error);
      // Show error to user
      alert(error.response?.data?.detail || "Failed to load users. Please refresh the page.");
    } finally {
      if (showLoading) {
        setUsersLoading(false);
      }
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/admin", { replace: true });
  };

  const loadUserBookings = async (userId: number) => {
    setBookingsLoading(true);
    try {
      const response = await axios.get(`/api/bookings/?passenger_id=${userId}`, {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });
      setUserBookings(response.data || []);
    } catch (error: any) {
      console.error("Error loading user bookings:", error);
      showToast(error.response?.data?.detail || "Failed to load bookings", "error");
      setUserBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const loadAllAircraft = async () => {
    if (aircraftLoading) return; // Prevent multiple simultaneous calls
    if (!auth?.token) {
      console.error("No auth token available");
      return;
    }
    
    setAircraftLoading(true);
    try {
      console.log("Fetching aircraft from /api/aircraft/");
      // Fetch all aircraft (admin can now see all)
      const response = await axios.get("/api/aircraft/", {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      console.log("Aircraft response:", response.data);
      const aircraft = Array.isArray(response.data) ? response.data : [];
      setAllAircraft(aircraft);
      console.log(`Loaded ${aircraft.length} aircraft`);
      
      // Fetch vendor information for all unique vendor IDs
      const vendorIds = [...new Set(aircraft.map((a: any) => a.vendor_id).filter(Boolean))];
      if (vendorIds.length > 0) {
        try {
          console.log("Fetching vendor information for:", vendorIds);
          const vendorsResponse = await axios.get("/api/vendors/", {
            headers: { Authorization: `Bearer ${auth.token}` }
          });
          const vendors = Array.isArray(vendorsResponse.data) ? vendorsResponse.data : [];
          const vendorMap: Record<number, string> = {};
          vendors.forEach((vendor: any) => {
            if (vendor && vendor.id) {
              vendorMap[vendor.id] = vendor.company_name || `Vendor ${vendor.id}`;
            }
          });
          setVendorNames(vendorMap);
          console.log("Loaded vendor names:", vendorMap);
        } catch (vendorError: any) {
          console.error("Error loading vendor names:", vendorError);
          // Continue without vendor names - not critical
        }
      }
    } catch (error: any) {
      console.error("Error loading aircraft:", error);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          "Failed to load aircraft";
      
      // Only show toast if it's not a network error (to avoid spam)
      if (error.code !== "ERR_NETWORK" && !error.message?.includes("Network Error")) {
        if (error.response?.status === 403) {
          showToast("Admin access to aircraft endpoint denied. Please check backend permissions.", "error");
        } else if (error.response?.status === 401) {
          showToast("Authentication failed. Please log in again.", "error");
        } else {
          showToast(errorMessage, "error");
        }
      } else {
        console.warn("Network error loading aircraft. Backend may not be running on http://localhost:8000");
        showToast("Cannot connect to backend server. Please ensure it's running.", "error");
      }
      setAllAircraft([]);
    } finally {
      setAircraftLoading(false);
    }
  };

  const loadAllBookings = async () => {
    if (allBookingsLoading) return;
    if (!auth?.token) {
      console.error("No auth token available");
      return;
    }
    
    setAllBookingsLoading(true);
    try {
      console.log("Fetching all bookings from /api/bookings/");
      // Admin can fetch all bookings without passenger_id filter
      const response = await axios.get("/api/bookings/", {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      console.log("Bookings response:", response.data);
      const bookings = Array.isArray(response.data) ? response.data : [];
      setAllBookings(bookings);
      console.log(`Loaded ${bookings.length} bookings`);
    } catch (error: any) {
      console.error("Error loading bookings:", error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          "Failed to load bookings";
      
      if (error.code !== "ERR_NETWORK" && !error.message?.includes("Network Error")) {
        if (error.response?.status === 403) {
          showToast("Admin access to bookings endpoint denied.", "error");
        } else if (error.response?.status === 401) {
          showToast("Authentication failed. Please log in again.", "error");
        } else {
          showToast(errorMessage, "error");
        }
      } else {
        console.warn("Network error loading bookings. Backend may not be running.");
        showToast("Cannot connect to backend server. Please ensure it's running.", "error");
      }
      setAllBookings([]);
    } finally {
      setAllBookingsLoading(false);
    }
  };

  const handleBookingStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      await axios.patch(
        `/api/bookings/${bookingId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${auth?.token}` }
        }
      );
      showToast(`Booking ${newStatus} successfully`, "success");
      await loadAllBookings();
      if (selectedBooking?.id === bookingId) {
        setIsBookingDetailsOpen(false);
        setSelectedBooking(null);
      }
    } catch (error: any) {
      console.error("Error updating booking status:", error);
      showToast(error.response?.data?.detail || "Failed to update booking status", "error");
    }
  };

  // Dashboard Stats Loading
  const loadDashboardStats = async () => {
    if (dashboardLoading) return;
    if (!auth?.token) {
      setDashboardLoading(false);
      return;
    }
    
    setDashboardLoading(true);
    try {
      // Use direct API calls (removed problematic /api/admin/dashboard/stats endpoint)
      const [bookingsRes, usersRes, aircraftRes, flightsRes] = await Promise.all([
        axios.get("/api/bookings/", { 
          headers: { Authorization: `Bearer ${auth.token}` },
          timeout: 5000
        }).catch(() => ({ data: [] })),
        axios.get("/api/users/", { 
          headers: { Authorization: `Bearer ${auth.token}` },
          timeout: 5000
        }).catch(() => ({ data: [] })),
        axios.get("/api/aircraft/", { 
          headers: { Authorization: `Bearer ${auth.token}` },
          timeout: 5000
        }).catch(() => ({ data: [] })),
        axios.get("/api/flights/", { 
          headers: { Authorization: `Bearer ${auth.token}` },
          timeout: 5000
        }).catch(() => ({ data: [] }))
      ]);

        const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        const aircraft = Array.isArray(aircraftRes.data) ? aircraftRes.data : [];
        const flights = Array.isArray(flightsRes.data) ? flightsRes.data : [];

        const totalRevenue = bookings
          .filter((b: any) => b.status === "confirmed")
          .reduce((sum: number, b: any) => sum + (parseFloat(b.total_amount) || 0), 0);

        const todayBookings = bookings.filter((b: any) => {
          const bookingDate = b.booked_at ? new Date(b.booked_at).toDateString() : null;
          return bookingDate === new Date().toDateString();
        });

        const pendingBookings = bookings.filter((b: any) => b.status === "pending");
        const confirmedBookings = bookings.filter((b: any) => b.status === "confirmed");
        const cancelledBookings = bookings.filter((b: any) => b.status === "cancelled");

        const activeVendors = users.filter((u: any) => u.role === "vendor" && u.is_active).length;
        const activePassengers = users.filter((u: any) => u.role === "passenger" && u.is_active).length;

        const todayFlights = flights.filter((f: any) => {
          if (!f.departure_time) return false;
          const flightDate = new Date(f.departure_time).toDateString();
          return flightDate === new Date().toDateString();
        });

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toDateString();
        }).reverse();

        const revenueByDay = last7Days.map(date => {
          const dayBookings = bookings.filter((b: any) => {
            if (!b.booked_at || b.status !== "confirmed") return false;
            return new Date(b.booked_at).toDateString() === date;
          });
          return {
            date,
            revenue: dayBookings.reduce((sum: number, b: any) => sum + (parseFloat(b.total_amount) || 0), 0)
          };
        });

        setDashboardStats({
          totalBookings: bookings.length,
          todayBookings: todayBookings.length,
          pendingBookings: pendingBookings.length,
          confirmedBookings: confirmedBookings.length,
          cancelledBookings: cancelledBookings.length,
          totalRevenue,
          totalUsers: users.length,
          activeVendors,
          activePassengers,
          totalAircraft: aircraft.length,
          totalFlights: flights.length,
          todayFlights: todayFlights.length,
          revenueByDay,
          bookingStatusBreakdown: {
            pending: pendingBookings.length,
            confirmed: confirmedBookings.length,
            cancelled: cancelledBookings.length,
            refunded: bookings.filter((b: any) => b.status === "refunded").length
          }
        });
    } catch (error: any) {
      console.error("Error loading dashboard stats:", error);
      // Set empty stats on error
      setDashboardStats({
        totalBookings: 0,
        todayBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        totalUsers: 0,
        activeVendors: 0,
        activePassengers: 0,
        totalAircraft: 0,
        totalFlights: 0,
        todayFlights: 0,
        revenueByDay: [],
        bookingStatusBreakdown: {
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          refunded: 0
        }
      });
      showToast("Failed to load dashboard stats", "error");
    } finally {
      setDashboardLoading(false);
    }
  };


  // Notifications Loading
  const loadNotifications = async () => {
    if (notificationsLoading) return;
    if (!auth?.token) return;
    
    setNotificationsLoading(true);
    try {
      const response = await axios.get("/api/admin/notifications", {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n: any) => !n.read).length);
    } catch (error: any) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    const userIdToDelete = userToDelete.id;
    setDeleteConfirmOpen(false);
    
    // Immediately remove from UI (optimistic update)
    setAllUsers(prevUsers => prevUsers.filter(u => u.id !== userIdToDelete));
    setDeletingUserId(userIdToDelete);
    
    try {
      // Delete from database
      const response = await axios.delete(`/api/users/${userIdToDelete}`, {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });
      
      // Show success message
      showToast(response.data?.message || "Account deleted successfully", "success");
      
      // Verify deletion by reloading from server
      await loadAllUsers(false);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || "Failed to delete user. Please try again.";
      
      // If deletion failed, restore the user in the list
      await loadAllUsers(false);
      
      showToast(errorMessage, "error");
    } finally {
      setDeletingUserId(null);
      setUserToDelete(null);
    }
  };

  const handleVendorDeactivateClick = async (user: UserInfo) => {
    let vendor = vendorData[user.id];
    
    // If vendor data not loaded, try to fetch it
    if (!vendor || vendor.id === 0) {
      try {
        const vendorsResponse = await axios.get("/api/vendors/", {
          headers: { Authorization: `Bearer ${auth?.token}` }
        });
        const vendorInfo = vendorsResponse.data.find((v: any) => v.user_id === user.id);
        if (vendorInfo) {
          vendor = {
            id: vendorInfo.id,
            is_active: vendorInfo.is_active !== undefined ? vendorInfo.is_active : true,
            company_name: vendorInfo.company_name
          };
          // Update vendor data in state
          setVendorData(prev => ({
            ...prev,
            [user.id]: vendor!
          }));
        } else {
          // Vendor record doesn't exist - use user's status and create a placeholder
          vendor = {
            id: 0, // Will indicate no vendor record exists
            is_active: user.is_active,
            company_name: user.full_name || user.email
          };
          // Update vendor data in state
          setVendorData(prev => ({
            ...prev,
            [user.id]: vendor
          }));
        }
      } catch (error: any) {
        console.error("Error fetching vendor data:", error);
        // If we can't fetch vendor data, use user's status as fallback
        vendor = {
          id: 0,
          is_active: user.is_active,
          company_name: user.full_name || user.email
        };
        setVendorData(prev => ({
          ...prev,
          [user.id]: vendor
        }));
      }
    }

    // Set vendor to deactivate with current status
    setVendorToDeactivate({
      userId: user.id,
      vendorId: vendor.id,
      companyName: vendor.company_name || user.email,
      isActive: vendor.is_active
    });
    setDeactivateConfirmOpen(true);
  };

  const handleVendorDeactivateConfirm = async () => {
    if (!vendorToDeactivate) return;
    
    setDeactivateConfirmOpen(false);
    setProcessingVendorId(vendorToDeactivate.vendorId);
    
    try {
      // If vendor record doesn't exist (id === 0), update user status directly
      if (vendorToDeactivate.vendorId === 0) {
        const newStatus = !vendorToDeactivate.isActive;
        await axios.patch(`/api/users/${vendorToDeactivate.userId}/status?is_active=${newStatus}`, {}, {
          headers: { Authorization: `Bearer ${auth?.token}` }
        });
        
        showToast(
          newStatus ? "Vendor account activated successfully" : "Vendor account deactivated successfully",
          "success"
        );
        
        // Update vendor data in state
        setVendorData(prev => ({
          ...prev,
          [vendorToDeactivate.userId]: {
            ...prev[vendorToDeactivate.userId],
            is_active: newStatus
          }
        }));
      } else {
        // Vendor record exists, use vendor deactivate/activate endpoint
        const endpoint = vendorToDeactivate.isActive 
          ? `/api/vendors/${vendorToDeactivate.vendorId}/deactivate`
          : `/api/vendors/${vendorToDeactivate.vendorId}/activate`;
        
        const response = await axios.put(endpoint, {}, {
          headers: { Authorization: `Bearer ${auth?.token}` }
        });
        
        showToast(response.data?.message || (vendorToDeactivate.isActive ? "Vendor account deactivated successfully" : "Vendor account activated successfully"), "success");
        
        // Reload vendor data from server to get updated status
        try {
          const vendorsResponse = await axios.get("/api/vendors/", {
            headers: { Authorization: `Bearer ${auth?.token}` }
          });
          const vendors = vendorsResponse.data || [];
          const vendorInfo = vendors.find((v: any) => v.id === vendorToDeactivate.vendorId);
          
          if (vendorInfo) {
            // Update vendor data in state with fresh data from server
            setVendorData(prev => ({
              ...prev,
              [vendorToDeactivate.userId]: {
                id: vendorInfo.id,
                is_active: vendorInfo.is_active !== undefined ? vendorInfo.is_active : true,
                company_name: vendorInfo.company_name
              }
            }));
          }
        } catch (reloadError: any) {
          console.error("Error reloading vendor data:", reloadError);
          // Fallback: update local state optimistically
          setVendorData(prev => ({
            ...prev,
            [vendorToDeactivate.userId]: {
              ...prev[vendorToDeactivate.userId],
              is_active: !vendorToDeactivate.isActive
            }
          }));
        }
      }
      
      // Reload users to refresh status in user list
      await loadAllUsers(false);
    } catch (error: any) {
      console.error("Error updating vendor status:", error);
      let errorMessage = "Failed to update vendor status. Please try again.";
      
      if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
        errorMessage = "Cannot connect to server. Please make sure the backend is running on http://localhost:8000";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, "error");
    } finally {
      setProcessingVendorId(null);
      setVendorToDeactivate(null);
    }
  };

  // Filter users based on search, role, and status
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(userSearchQuery.toLowerCase()));
    const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter;
    
    // Status filter
    let matchesStatus = true;
    if (userStatusFilter !== "all") {
      // For vendors, check both user.is_active and vendor.is_active (both must match)
      if (user.role === "vendor") {
        const vendor = vendorData[user.id];
        // Use vendor status if available, otherwise fall back to user status
        const isActive = vendor?.is_active !== undefined ? vendor.is_active : user.is_active;
        // Also ensure user.is_active matches (since we update both)
        const finalStatus = isActive && user.is_active;
        
        if (userStatusFilter === "active") {
          matchesStatus = finalStatus;
        } else if (userStatusFilter === "inactive") {
          matchesStatus = !finalStatus;
        }
      } else {
        // For non-vendors, just check user.is_active
        if (userStatusFilter === "active") {
          matchesStatus = user.is_active;
        } else if (userStatusFilter === "inactive") {
          matchesStatus = !user.is_active;
        }
      }
    }
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (!auth || auth.role !== "admin") {
    return null;
  }

  const menuItems = [
    {
      id: "users" as AdminSection,
      label: "Manage Users",
      description: "Vendors & Passengers",
      icon: Users,
      badge: pendingVendors.length > 0 ? pendingVendors.length : undefined
    },
    {
      id: "aircraft" as AdminSection,
      label: "Manage Aircraft",
      description: "Planes",
      icon: Plane
    },
    {
      id: "flights" as AdminSection,
      label: "Manage Flights",
      description: "Schedules & Routes",
      icon: Calendar
    },
    {
      id: "bookings" as AdminSection,
      label: "Booking Management",
      description: "All Bookings",
      icon: Ticket
    },
    {
      id: "notifications" as AdminSection,
      label: "Notifications",
      description: "Alerts & Messages",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    {
      id: "api-keys" as AdminSection,
      label: "API Keys",
      description: "Manage API Keys",
      icon: Key
    },
    {
      id: "external-flights" as AdminSection,
      label: "External Flights",
      description: "AviationStack API",
      icon: Plane
    },
    {
      id: "profile" as AdminSection,
      label: "Profile Settings",
      description: "Account & Info",
      icon: Settings
    }
  ];

  const getSectionTitle = () => {
    const section = menuItems.find(item => item.id === activeSection);
    return section ? section.label : "Admin Portal";
  };

  const getSectionDescription = () => {
    const section = menuItems.find(item => item.id === activeSection);
    return section ? section.description : "";
  };

  return (
    <div className="min-h-screen bg-background flex h-screen overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
      <aside className="w-64 transition-all duration-300 bg-card border-r border-primary/20 overflow-hidden flex-shrink-0">
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading text-sm font-bold">Admin Portal</h2>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`group w-full flex items-start gap-3 p-3 rounded-lg transition-all duration-300 text-left transform ${
                    isActive
                      ? "bg-primary/10 border border-primary/20 text-primary scale-105 shadow-md shadow-primary/20 translate-x-1"
                      : "hover:bg-primary/5 text-muted-foreground hover:text-foreground hover:scale-105 hover:shadow-md hover:shadow-primary/10 hover:translate-x-1 active:scale-100"
                  }`}
                >
                  <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 transition-transform duration-300 ${isActive ? "text-primary scale-110" : "group-hover:scale-110"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-heading text-sm font-semibold">{item.label}</div>
                    <div className="font-body text-xs text-muted-foreground mt-0.5">{item.description}</div>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge className="bg-warning/10 text-warning text-xs ml-auto flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-primary/20">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {!sidebarOpen && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
              <div>
                  <h1 className="font-heading text-xl font-bold">{getSectionTitle()}</h1>
                  <p className="font-body text-xs text-muted-foreground">{getSectionDescription()}</p>
              </div>
            </div>
              {activeSection === "users" && pendingVendors.length > 0 && (
              <Badge className="bg-primary/10 text-primary">
                {pendingVendors.length} Pending
              </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            {/* Render content based on active section */}
            {activeSection === "dashboard" && (
              <>
                {dashboardLoading ? (
                  <Card className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
                  </Card>
                ) : dashboardStats ? (
                  <div className="space-y-6">
                    {/* Key Metrics Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card className="p-6 border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="rounded-lg bg-primary/10 p-3">
                            <Ticket className="h-6 w-6 text-primary" />
                          </div>
                          <Badge className="bg-accent/10 text-accent">
                            {dashboardStats.todayBookings} today
                          </Badge>
                        </div>
                        <h3 className="font-heading text-2xl font-bold mb-1">{dashboardStats.totalBookings}</h3>
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
                      </Card>

                      <Card className="p-6 border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="rounded-lg bg-green-100 p-3">
                            <DollarSign className="h-6 w-6 text-green-600" />
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {dashboardStats.confirmedBookings} confirmed
                          </Badge>
                        </div>
                        <h3 className="font-heading text-2xl font-bold mb-1">
                          ₹{dashboardStats.totalRevenue.toLocaleString("en-IN")}
                        </h3>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                      </Card>

                      <Card className="p-6 border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="rounded-lg bg-blue-100 p-3">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            {dashboardStats.activeVendors} vendors
                          </Badge>
                        </div>
                        <h3 className="font-heading text-2xl font-bold mb-1">{dashboardStats.totalUsers}</h3>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                      </Card>

                      <Card className="p-6 border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="rounded-lg bg-purple-100 p-3">
                            <Plane className="h-6 w-6 text-purple-600" />
                          </div>
                          <Badge className="bg-purple-100 text-purple-800">
                            {dashboardStats.todayFlights} today
                          </Badge>
                        </div>
                        <h3 className="font-heading text-2xl font-bold mb-1">{dashboardStats.totalFlights}</h3>
                        <p className="text-sm text-muted-foreground">Total Flights</p>
                      </Card>
                    </div>

                    {/* Status Overview */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Pending</p>
                            <p className="font-heading text-2xl font-bold text-warning">
                              {dashboardStats.pendingBookings}
                            </p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-warning opacity-50" />
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Confirmed</p>
                            <p className="font-heading text-2xl font-bold text-accent">
                              {dashboardStats.confirmedBookings}
                            </p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-accent opacity-50" />
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Cancelled</p>
                            <p className="font-heading text-2xl font-bold text-destructive">
                              {dashboardStats.cancelledBookings}
                            </p>
                          </div>
                          <XCircle className="h-8 w-8 text-destructive opacity-50" />
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Aircraft</p>
                            <p className="font-heading text-2xl font-bold text-primary">
                              {dashboardStats.totalAircraft}
                            </p>
                          </div>
                          <Plane className="h-8 w-8 text-primary opacity-50" />
                        </div>
                      </Card>
                    </div>

                    {/* Revenue Chart (Simple Bar Chart) */}
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading text-lg font-semibold">Revenue Trend (Last 7 Days)</h3>
                        <Button variant="outline" size="sm" onClick={loadDashboardStats}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                      <div className="h-64 flex items-end justify-between gap-2">
                        {dashboardStats.revenueByDay.map((day: any, index: number) => {
                          const maxRevenue = Math.max(...dashboardStats.revenueByDay.map((d: any) => d.revenue), 1);
                          const height = (day.revenue / maxRevenue) * 100;
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div className="w-full bg-primary/20 rounded-t-lg relative group cursor-pointer" style={{ height: `${height}%`, minHeight: '4px' }}>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                  ₹{day.revenue.toLocaleString("en-IN")}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2 text-center">
                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => setActiveSection("bookings")}>
                        <div className="flex items-center gap-4">
                          <div className="rounded-lg bg-primary/10 p-3">
                            <Ticket className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-heading font-semibold mb-1">Manage Bookings</h3>
                            <p className="text-sm text-muted-foreground">{dashboardStats.pendingBookings} pending review</p>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => setActiveSection("users")}>
                        <div className="flex items-center gap-4">
                          <div className="rounded-lg bg-blue-100 p-3">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-heading font-semibold mb-1">Manage Users</h3>
                            <p className="text-sm text-muted-foreground">{pendingVendors.length} pending applications</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h2 className="font-heading text-2xl font-bold mb-2">Dashboard Unavailable</h2>
                    <p className="text-muted-foreground">Unable to load dashboard data. Please try again.</p>
                    <Button onClick={loadDashboardStats} className="mt-4">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </Card>
                )}
              </>
            )}

            {activeSection === "users" && (
              <>
                <div className="mb-6">
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <h3 className="font-heading font-semibold mb-2">User Management Features</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Vendor Management:</h4>
                        <ul className="space-y-1 ml-4">
                          <li>• Approve/reject new vendor applications</li>
                          <li>• Verify submitted documents and aircraft details</li>
                          <li>• Activate/suspend vendor accounts</li>
                          <li>• Edit vendor profiles (contact info, fleet, etc.)</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Passenger Management:</h4>
                        <ul className="space-y-1 ml-4">
                          <li>• Search, view and edit passenger accounts</li>
                          <li>• Reset passwords</li>
                          <li>• Update profiles</li>
                          <li>• Disable or ban users as needed</li>
                          <li>• Review booking histories</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-primary/20">
                      <p className="text-xs text-muted-foreground">
                        <strong>Admin Roles:</strong> The system supports multiple admin roles/permissions (e.g. super-admin, support staff) 
                        so that privileges (user editing, financial operations, etc.) can be granted appropriately.
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-2 border-b border-primary/20">
                  <button
                    onClick={() => {
                      setUsersTab("all");
                      loadAllUsers();
                    }}
                    className={`px-4 py-2 font-heading text-sm font-semibold border-b-2 transition-colors ${
                      usersTab === "all"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Users
                    {allUsers.length > 0 && (
                      <Badge className="ml-2 bg-primary/10 text-primary text-xs">
                        {allUsers.length}
                      </Badge>
                    )}
                  </button>
                  <button
                    onClick={() => setUsersTab("pending")}
                    className={`px-4 py-2 font-heading text-sm font-semibold border-b-2 transition-colors ${
                      usersTab === "pending"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Pending Applications
                    {pendingVendors.length > 0 && (
                      <Badge className="ml-2 bg-warning/10 text-warning text-xs">
                        {pendingVendors.length}
                      </Badge>
                    )}
                  </button>
                </div>

                {/* All Users Tab */}
                {usersTab === "all" && (
                  <>
                    {/* Search and Filter */}
                    <div className="mb-6 grid gap-4 md:grid-cols-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search by email or name..."
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          className="pl-10 h-12"
                        />
                      </div>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <select
                          value={userRoleFilter}
                          onChange={(e) => setUserRoleFilter(e.target.value)}
                          className="w-full h-12 rounded-lg border border-input bg-background px-10 py-2 font-body text-sm"
                        >
                          <option value="all">All Roles</option>
                          <option value="passenger">Passengers</option>
                          <option value="vendor">Vendors</option>
                          <option value="admin">Admins</option>
                        </select>
                      </div>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <select
                          value={userStatusFilter}
                          onChange={(e) => setUserStatusFilter(e.target.value)}
                          className="w-full h-12 rounded-lg border border-input bg-background px-10 py-2 font-body text-sm"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <Button
                        onClick={() => loadAllUsers()}
                        disabled={usersLoading}
                        variant="outline"
                        className="h-12 gap-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${usersLoading ? "animate-spin" : ""}`} />
                        Refresh
              </Button>
            </div>

                    {/* Users Table */}
                    {usersLoading ? (
                      <Card className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading users...</p>
                      </Card>
                    ) : filteredUsers.length === 0 ? (
                      <Card className="p-12 text-center">
                        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h2 className="font-heading text-2xl font-bold mb-2">No Users Found</h2>
                        <p className="text-muted-foreground">
                          {userSearchQuery || userRoleFilter !== "all"
                            ? "Try adjusting your search or filter criteria."
                            : "No users have been created yet."}
                        </p>
                      </Card>
                    ) : (
                      <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-primary/5 border-b border-primary/20">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                                  User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                                  Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                                  Created
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                              {filteredUsers.map((user) => {
                                const handleEdit = () => {
                                  setEditingUser(user);
                                  setIsEditUserFormOpen(true);
                                };
                                
                                const handleDeleteClick = () => {
                                  setUserToDelete(user);
                                  setDeleteConfirmOpen(true);
                                };
                                
                                return (
                                  <tr key={user.id} className="hover:bg-primary/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div>
                                        <div className="font-heading font-semibold text-foreground">
                                          {user.full_name || "No name"}
                                        </div>
                                        <div className="font-body text-sm text-muted-foreground flex items-center gap-1">
                                          <Mail className="h-3 w-3" />
                                          {user.email}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <Badge
                                        className={
                                          user.role === "admin"
                                            ? "bg-primary/10 text-primary"
                                            : user.role === "vendor"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-green-100 text-green-800"
                                        }
                                      >
                                        {user.role.toUpperCase()}
                                      </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <Badge
                                        className={
                                          user.is_active
                                            ? "bg-accent/10 text-accent"
                                            : "bg-destructive/10 text-destructive"
                                        }
                                      >
                                        {user.is_active ? "Active" : "Inactive"}
                                      </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                      {user.created_at
                                        ? new Date(user.created_at).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric"
                                          })
                                        : "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
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
                                        {user.role === "vendor" && (
                                          (() => {
                                            const vendor = vendorData[user.id];
                                            // Use user.is_active as the primary source of truth since we update it when deactivating/activating
                                            const isVendorActive = user.is_active;
                                            const isProcessing = processingVendorId && vendor && processingVendorId === vendor.id;
                                            
                                            if (isProcessing) {
                                              return (
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  disabled
                                                  className="gap-1"
                                                >
                                                  <Loader2 className="h-3 w-3 animate-spin" />
                                                  Processing...
                                                </Button>
                                              );
                                            }
                                            
                                            // Show Deactivate button (RED) if vendor is active
                                            // Show Activate button (GREEN) if vendor is inactive
                                            return isVendorActive ? (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleVendorDeactivateClick(user)}
                                                className="text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition px-3 py-1 rounded-md flex items-center gap-1"
                                              >
                                                <XCircle className="h-3 w-3" />
                                                Deactivate Vendor
                                              </Button>
                                            ) : (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleVendorDeactivateClick(user)}
                                                className="text-green-600 border border-green-600 hover:bg-green-600 hover:text-white transition px-3 py-1 rounded-md flex items-center gap-1"
                                              >
                                                <CheckCircle className="h-3 w-3" />
                                                Activate Vendor
                                              </Button>
                                            );
                                          })()
                                        )}
                                        {user.role === "passenger" && (
                                          <>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                setViewingBookingsFor(user);
                                                setIsBookingsSheetOpen(true);
                                                loadUserBookings(user.id);
                                              }}
                                              className="gap-1"
                                            >
                                              <History className="h-3 w-3" />
                                              View Bookings
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={handleDeleteClick}
                                              disabled={deletingUserId === user.id}
                                              className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                              {deletingUserId === user.id ? (
                                                <>
                                                  <Loader2 className="h-3 w-3 animate-spin" />
                                                  Deleting...
                                                </>
                                              ) : (
                                                <>
                                                  <Trash2 className="h-3 w-3" />
                                                  Delete Account
                                                </>
                                              )}
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="px-6 py-4 border-t border-primary/20 bg-primary/5">
                          <p className="text-sm text-muted-foreground">
                            Showing {filteredUsers.length} of {allUsers.length} users
                          </p>
                        </div>
                      </Card>
                    )}
                  </>
                )}

                {/* Pending Applications Tab */}
                {usersTab === "pending" && (
                  <>
                    <div className="mb-6">
                      <h3 className="font-heading text-lg font-semibold mb-4">Pending Vendor Applications</h3>
                    </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading vendor applications...</p>
          </div>
        ) : pendingVendors.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4 opacity-50" />
            <h2 className="font-heading text-2xl font-bold mb-2">All Clear!</h2>
            <p className="text-muted-foreground">No pending vendor applications at this time.</p>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Vendor List */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-heading text-xl font-semibold">Pending Applications</h2>
                  <Badge className="bg-warning/10 text-warning">{pendingVendors.length}</Badge>
                </div>
                <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {pendingVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      onClick={() => setSelectedVendor(vendor)}
                      className={`rounded-lg border p-4 cursor-pointer transition-all ${
                        selectedVendor?.id === vendor.id
                          ? "border-primary bg-primary/10"
                          : "border-primary/20 bg-primary/5 hover:bg-primary/10"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-heading font-semibold">{vendor.company_name}</h3>
                        <Badge variant="secondary" className="bg-warning/10 text-warning">
                          Pending
                        </Badge>
                      </div>
                      {vendor.city && vendor.country && (
                        <p className="font-body text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {vendor.city}, {vendor.country}
                        </p>
                      )}
                      {vendor.license_number && (
                        <p className="font-body text-xs text-muted-foreground mt-1">
                          License: {vendor.license_number}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Vendor Details */}
            <div className="lg:col-span-2">
              {selectedVendor ? (
                <Card className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="font-heading text-2xl font-bold">{selectedVendor.company_name}</h2>
                        <p className="font-body text-sm text-muted-foreground mt-1">
                          Application submitted on {new Date(selectedVendor.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-warning/10 text-warning">Pending Review</Badge>
                    </div>
                  </div>

                  <div className="space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto">
                    {/* Company Information */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h3 className="font-heading text-lg font-semibold">Company Information</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="font-body text-sm text-muted-foreground">Travels Name / Company Name</p>
                          <p className="font-body font-medium">{selectedVendor.company_name}</p>
                        </div>
                        {selectedVendor.owner_name && (
                          <div>
                            <p className="font-body text-sm text-muted-foreground">Owner Name</p>
                            <p className="font-body font-medium">{selectedVendor.owner_name}</p>
                          </div>
                        )}
                        {selectedVendor.business_background && (
                          <div>
                            <p className="font-body text-sm text-muted-foreground">Business Background</p>
                            <p className="font-body font-medium">
                              {selectedVendor.business_background}
                              {selectedVendor.business_background === "Other" && selectedVendor.business_background_other && (
                                <span className="text-muted-foreground"> - {selectedVendor.business_background_other}</span>
                              )}
                            </p>
                          </div>
                        )}
                        {selectedVendor.license_number && (
                          <div>
                            <p className="font-body text-sm text-muted-foreground">License Number</p>
                            <p className="font-body font-medium">{selectedVendor.license_number}</p>
                          </div>
                        )}
                        {selectedVendor.business_registration_number && (
                          <div>
                            <p className="font-body text-sm text-muted-foreground">Business Registration</p>
                            <p className="font-body font-medium">{selectedVendor.business_registration_number}</p>
                          </div>
                        )}
                        {selectedVendor.tax_id && (
                          <div>
                            <p className="font-body text-sm text-muted-foreground">Tax ID / GST</p>
                            <p className="font-body font-medium">{selectedVendor.tax_id}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Phone className="h-5 w-5 text-primary" />
                        <h3 className="font-heading text-lg font-semibold">Contact Information</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {selectedVendor.contact_phone && (
                          <div>
                            <p className="font-body text-sm text-muted-foreground">Mobile</p>
                            <p className="font-body font-medium">{selectedVendor.contact_phone}</p>
                          </div>
                        )}
                        {selectedVendor.phone && (
                          <div>
                            <p className="font-body text-sm text-muted-foreground">Phone</p>
                            <p className="font-body font-medium">{selectedVendor.phone}</p>
                          </div>
                        )}
                        {selectedVendor.website && (
                          <div>
                            <p className="font-body text-sm text-muted-foreground">Website</p>
                            <a href={selectedVendor.website} target="_blank" rel="noopener noreferrer" className="font-body font-medium text-primary hover:underline flex items-center gap-1">
                              <Globe className="h-4 w-4" />
                              {selectedVendor.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Business Address */}
                    {(selectedVendor.business_address || selectedVendor.city) && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <MapPin className="h-5 w-5 text-primary" />
                          <h3 className="font-heading text-lg font-semibold">Business Address</h3>
                        </div>
                        <div className="space-y-2">
                          {selectedVendor.business_address && (
                            <p className="font-body font-medium">{selectedVendor.business_address}</p>
                          )}
                          <p className="font-body text-sm text-muted-foreground">
                            {[
                              selectedVendor.city,
                              selectedVendor.district,
                              selectedVendor.state,
                              selectedVendor.zip_code,
                              selectedVendor.country
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Contact Person */}
                    {(selectedVendor.contact_person_name || selectedVendor.contact_person_email) && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <User className="h-5 w-5 text-primary" />
                          <h3 className="font-heading text-lg font-semibold">Contact Person</h3>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {selectedVendor.contact_person_name && (
                            <div>
                              <p className="font-body text-sm text-muted-foreground">Name</p>
                              <p className="font-body font-medium">{selectedVendor.contact_person_name}</p>
                            </div>
                          )}
                          {selectedVendor.contact_person_designation && (
                            <div>
                              <p className="font-body text-sm text-muted-foreground">Designation</p>
                              <p className="font-body font-medium">{selectedVendor.contact_person_designation}</p>
                            </div>
                          )}
                          {selectedVendor.contact_person_email && (
                            <div className="md:col-span-2">
                              <p className="font-body text-sm text-muted-foreground">Email</p>
                              <p className="font-body font-medium">{selectedVendor.contact_person_email}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bank Details */}
                    {(selectedVendor.bank_name || selectedVendor.bank_account_number) && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <h3 className="font-heading text-lg font-semibold">Bank Account Details</h3>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {selectedVendor.bank_name && (
                            <div>
                              <p className="font-body text-sm text-muted-foreground">Bank Name</p>
                              <p className="font-body font-medium">{selectedVendor.bank_name}</p>
                            </div>
                          )}
                          {selectedVendor.account_holder_name && (
                            <div>
                              <p className="font-body text-sm text-muted-foreground">Account Holder</p>
                              <p className="font-body font-medium">{selectedVendor.account_holder_name}</p>
                            </div>
                          )}
                          {selectedVendor.bank_account_number && (
                            <div>
                              <p className="font-body text-sm text-muted-foreground">Account Number</p>
                              <p className="font-body font-medium font-mono">{selectedVendor.bank_account_number}</p>
                            </div>
                          )}
                          {selectedVendor.bank_ifsc && (
                            <div>
                              <p className="font-body text-sm text-muted-foreground">IFSC Code</p>
                              <p className="font-body font-medium font-mono">{selectedVendor.bank_ifsc}</p>
                            </div>
                          )}
                          {selectedVendor.bank_branch && (
                            <div className="md:col-span-2">
                              <p className="font-body text-sm text-muted-foreground">Branch</p>
                              <p className="font-body font-medium">{selectedVendor.bank_branch}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Business Details */}
                    {(selectedVendor.years_in_business || selectedVendor.number_of_aircraft || selectedVendor.description) && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="font-heading text-lg font-semibold">Business Details</h3>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {selectedVendor.years_in_business !== null && (
                            <div>
                              <p className="font-body text-sm text-muted-foreground">Years in Business</p>
                              <p className="font-body font-medium">{selectedVendor.years_in_business} years</p>
                            </div>
                          )}
                          {selectedVendor.number_of_aircraft !== null && (
                            <div>
                              <p className="font-body text-sm text-muted-foreground">Number of Aircraft</p>
                              <p className="font-body font-medium">{selectedVendor.number_of_aircraft} aircraft</p>
                            </div>
                          )}
                          {selectedVendor.description && (
                            <div className="md:col-span-2">
                              <p className="font-body text-sm text-muted-foreground mb-2">Description</p>
                              <p className="font-body text-sm bg-primary/5 p-3 rounded-lg">{selectedVendor.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Verification Section */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FileCheck className="h-5 w-5 text-primary" />
                        <h3 className="font-heading text-lg font-semibold">Verification Status</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 mb-4">
                        <div className="p-3 bg-primary/5 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Documents</p>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-warning/10 text-warning">Pending Review</Badge>
                          </div>
                        </div>
                        <div className="p-3 bg-primary/5 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Aircraft Details</p>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-warning/10 text-warning">Pending Review</Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Document Viewing Section */}
                      <div className="mb-4">
                        <h4 className="font-heading font-semibold text-foreground mb-3">Uploaded Documents</h4>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="p-3 border border-primary/20 rounded-lg bg-background">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Certificate of Incorporation</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const url = `/api/vendors/${selectedVendor.id}/documents/certificate_of_incorporation`;
                                    const response = await axios.get(url, {
                                      headers: { Authorization: `Bearer ${auth?.token}` },
                                      responseType: 'blob'
                                    });
                                    const blob = new Blob([response.data]);
                                    const fileUrl = window.URL.createObjectURL(blob);
                                    window.open(fileUrl, '_blank');
                                  } catch (error: any) {
                                    showToast(error.response?.data?.detail || "Failed to load document", "error");
                                  }
                                }}
                                className="h-7 text-xs gap-1"
                                disabled={!selectedVendor.certificate_of_incorporation_path}
                              >
                                <Eye className="h-3 w-3" />
                                View Document
                              </Button>
                            </div>
                          </div>
                          
                          <div className="p-3 border border-primary/20 rounded-lg bg-background">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">GST Certificate</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const url = `/api/vendors/${selectedVendor.id}/documents/gst_certificate`;
                                    const response = await axios.get(url, {
                                      headers: { Authorization: `Bearer ${auth?.token}` },
                                      responseType: 'blob'
                                    });
                                    const blob = new Blob([response.data]);
                                    const fileUrl = window.URL.createObjectURL(blob);
                                    window.open(fileUrl, '_blank');
                                  } catch (error: any) {
                                    showToast(error.response?.data?.detail || "Failed to load document", "error");
                                  }
                                }}
                                className="h-7 text-xs gap-1"
                                disabled={!selectedVendor.gst_certificate_path}
                              >
                                <Eye className="h-3 w-3" />
                                View Document
                              </Button>
                            </div>
                          </div>
                          
                          <div className="p-3 border border-primary/20 rounded-lg bg-background">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Owner KYC Document</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const url = `/api/vendors/${selectedVendor.id}/documents/owner_kyc`;
                                    const response = await axios.get(url, {
                                      headers: { Authorization: `Bearer ${auth?.token}` },
                                      responseType: 'blob'
                                    });
                                    const blob = new Blob([response.data]);
                                    const fileUrl = window.URL.createObjectURL(blob);
                                    window.open(fileUrl, '_blank');
                                  } catch (error: any) {
                                    showToast(error.response?.data?.detail || "Failed to load document", "error");
                                  }
                                }}
                                className="h-7 text-xs gap-1"
                                disabled={!selectedVendor.owner_kyc_document_path}
                              >
                                <Eye className="h-3 w-3" />
                                View Document
                              </Button>
                            </div>
                          </div>
                          
                          <div className="p-3 border border-primary/20 rounded-lg bg-background">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Owner KYC Address Proof</span>
                                <Badge variant="secondary" className="text-xs">Optional</Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const url = `/api/vendors/${selectedVendor.id}/documents/owner_kyc_address`;
                                    const response = await axios.get(url, {
                                      headers: { Authorization: `Bearer ${auth?.token}` },
                                      responseType: 'blob'
                                    });
                                    const blob = new Blob([response.data]);
                                    const fileUrl = window.URL.createObjectURL(blob);
                                    window.open(fileUrl, '_blank');
                                  } catch (error: any) {
                                    showToast(error.response?.data?.detail || "Failed to load document", "error");
                                  }
                                }}
                                className="h-7 text-xs gap-1"
                                disabled={!selectedVendor.owner_kyc_address_proof_path}
                              >
                                <Eye className="h-3 w-3" />
                                View Document
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <label className="font-body text-sm font-medium text-foreground mb-2 block">
                        Verification Notes (Optional)
                      </label>
                      <textarea
                        value={verificationNotes[selectedVendor.id] || ""}
                        onChange={(e) => setVerificationNotes(prev => ({ ...prev, [selectedVendor.id]: e.target.value }))}
                        placeholder="Add verification notes about documents, aircraft, or other details..."
                        className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 font-body text-sm"
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Use this section to verify submitted documents (license, registration, tax ID) and aircraft details before approval.
                      </p>
                    </div>
                  </div>

                  {/* Approval Actions */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="mb-4">
                      <label className="font-body text-sm font-medium text-foreground mb-2 block">
                        Approval Notes (Optional)
                      </label>
                      <textarea
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder="Add notes about this application..."
                        className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 font-body text-sm"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleApproval(selectedVendor.id, "approved")}
                        disabled={processing === selectedVendor.id}
                        className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 h-12"
                      >
                        {processing === selectedVendor.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Approve Application
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleApproval(selectedVendor.id, "rejected")}
                        disabled={processing === selectedVendor.id}
                        className="flex-1 h-12"
                      >
                        {processing === selectedVendor.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Application
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h2 className="font-heading text-xl font-bold mb-2">Select a Vendor</h2>
                  <p className="text-muted-foreground">Choose a vendor application from the list to view details and take action.</p>
                </Card>
              )}
            </div>
          </div>
        )}
                  </>
                )}
              </>
            )}

            {activeSection === "aircraft" && (
              <>
                <div className="mb-6">
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <h3 className="font-heading font-semibold mb-2">Aircraft Management Features</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Aircraft Operations:</h4>
                        <ul className="space-y-1 ml-4">
                          <li>• View all aircraft added by vendors</li>
                      <li>• Add or edit plane records (model, capacity, tail number, etc.)</li>
                      <li>• Approve new planes added by vendors</li>
                      <li>• Deactivate lost or retired aircraft</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Data Management:</h4>
                        <ul className="space-y-1 ml-4">
                      <li>• Maintain accurate plane data for flight listings</li>
                          <li>• View aircraft details and specifications</li>
                          <li>• Search and filter aircraft by vendor or model</li>
                          <li>• Monitor aircraft inventory across all vendors</li>
                    </ul>
                  </div>
                </div>
              </Card>
                </div>

                {/* Search and Filter */}
                <div className="mb-6 grid gap-4 md:grid-cols-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by model, registration, or vendor..."
                      value={aircraftSearchQuery}
                      onChange={(e) => setAircraftSearchQuery(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                  <Button
                    onClick={() => loadAllAircraft()}
                    disabled={aircraftLoading}
                    variant="outline"
                    className="h-12 gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${aircraftLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>

                {/* Aircraft Table */}
                {aircraftLoading ? (
                  <Card className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading aircraft...</p>
                  </Card>
                ) : allAircraft.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Plane className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h2 className="font-heading text-2xl font-bold mb-2">No Aircraft Found</h2>
                    <p className="text-muted-foreground">
                      {aircraftSearchQuery
                        ? "Try adjusting your search criteria."
                        : "No aircraft have been registered yet."}
                    </p>
                  </Card>
                ) : (
                  <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-primary/5 border-b border-primary/20">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                              Aircraft
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                              Vendor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                              Model
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                              Registration
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                              Capacity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/10">
                          {allAircraft
                            .filter((aircraft) => {
                              if (!aircraftSearchQuery) return true;
                              const query = aircraftSearchQuery.toLowerCase();
                              return (
                                aircraft.model?.toLowerCase().includes(query) ||
                                aircraft.registration_number?.toLowerCase().includes(query) ||
                                aircraft.aircraft_name?.toLowerCase().includes(query) ||
                                aircraft.manufacturer?.toLowerCase().includes(query)
                              );
                            })
                            .map((aircraft) => (
                              <tr key={aircraft.id} className="hover:bg-primary/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="font-heading font-semibold text-foreground">
                                      {aircraft.aircraft_name || aircraft.model || "Unnamed Aircraft"}
                                    </div>
                                    {aircraft.manufacturer && (
                                      <div className="font-body text-sm text-muted-foreground">
                                        {aircraft.manufacturer}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-body text-sm">
                                    {vendorNames[aircraft.vendor_id] || `Vendor #${aircraft.vendor_id || "N/A"}`}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-body font-medium">{aircraft.model || "N/A"}</div>
                                  {aircraft.model_number && (
                                    <div className="font-body text-xs text-muted-foreground">
                                      {aircraft.model_number}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge className="bg-primary/10 text-primary font-mono">
                                    {aircraft.registration_number || "N/A"}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-body text-sm">
                                    {aircraft.seat_capacity || 0} seats
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedAircraft(aircraft);
                                        setIsAircraftSheetOpen(true);
                                      }}
                                      className="gap-1"
                                    >
                                      <Eye className="h-3 w-3" />
                                      View Details
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedAircraft(aircraft);
                                        setIsAircraftSheetOpen(true);
                                      }}
                                      className="gap-1"
                                    >
                                      <Edit className="h-3 w-3" />
                                      Edit
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-6 py-4 border-t border-primary/20 bg-primary/5">
                      <p className="text-sm text-muted-foreground">
                        Showing {allAircraft.filter((a) => {
                          if (!aircraftSearchQuery) return true;
                          const query = aircraftSearchQuery.toLowerCase();
                          return (
                            a.model?.toLowerCase().includes(query) ||
                            a.registration_number?.toLowerCase().includes(query) ||
                            a.aircraft_name?.toLowerCase().includes(query) ||
                            a.manufacturer?.toLowerCase().includes(query)
                          );
                        }).length} of {allAircraft.length} aircraft
                      </p>
                    </div>
                  </Card>
                )}
              </>
            )}

            {activeSection === "flights" && (
              <AdminFlightsManagement />
            )}


            {activeSection === "notifications" && (
              <>
                <div className="mb-6">
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-heading font-semibold mb-2">Notification Center</h3>
                        <p className="text-sm text-muted-foreground">
                          Manage system alerts, booking notifications, and important updates.
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <Badge className="bg-warning/10 text-warning">
                          {unreadCount} Unread
                        </Badge>
                      )}
                    </div>
                  </Card>
                </div>

                {notificationsLoading ? (
                  <Card className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading notifications...</p>
                  </Card>
                ) : notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <Card key={notification.id} className={`p-4 ${!notification.read ? "border-primary/40 bg-primary/5" : ""}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={
                                notification.type === "success" ? "bg-green-100 text-green-800" :
                                notification.type === "warning" ? "bg-warning/10 text-warning" :
                                notification.type === "error" ? "bg-destructive/10 text-destructive" :
                                "bg-primary/10 text-primary"
                              }>
                                {notification.type.toUpperCase()}
                              </Badge>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                              )}
                            </div>
                            <h4 className="font-heading font-semibold mb-1">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = notifications.map(n => 
                                n.id === notification.id ? { ...n, read: true } : n
                              );
                              setNotifications(updated);
                              setUnreadCount(updated.filter(n => !n.read).length);
                            }}
                          >
                            Mark Read
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h2 className="font-heading text-2xl font-bold mb-2">No Notifications</h2>
                    <p className="text-muted-foreground">You're all caught up! No new notifications.</p>
                  </Card>
                )}
              </>
            )}

            {activeSection === "bookings" && (
              <>
                <div className="mb-6">
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <h3 className="font-heading font-semibold mb-2">Booking Management Features</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Booking Operations:</h4>
                        <ul className="space-y-1 ml-4">
                      <li>• Search and manage all bookings</li>
                      <li>• Filter bookings by status, date, vendor or passenger</li>
                      <li>• Confirm, cancel or modify bookings</li>
                      <li>• Handle special cases (manual seat assignments, oversold flights)</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">System Management:</h4>
                        <ul className="space-y-1 ml-4">
                      <li>• Enforce rules like waiting lists or rebooking</li>
                      <li>• Process booking change or cancellation requests</li>
                      <li>• Update seat counts system-wide</li>
                          <li>• Monitor booking trends and patterns</li>
                    </ul>
                  </div>
                </div>
              </Card>
                </div>

                {/* Search and Filter */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by passenger, flight, or booking ID..."
                      value={bookingSearchQuery}
                      onChange={(e) => setBookingSearchQuery(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      value={bookingStatusFilter}
                      onChange={(e) => setBookingStatusFilter(e.target.value)}
                      className="w-full h-12 rounded-lg border border-input bg-background px-10 py-2 font-body text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      placeholder="Filter by date..."
                      value={bookingDateFilter}
                      onChange={(e) => setBookingDateFilter(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                  <Button
                    onClick={() => loadAllBookings()}
                    disabled={allBookingsLoading}
                    variant="outline"
                    className="h-12 gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${allBookingsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>

                {/* Bookings Table */}
                {allBookingsLoading ? (
                  <Card className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading bookings...</p>
                  </Card>
                ) : allBookings.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h2 className="font-heading text-2xl font-bold mb-2">No Bookings Found</h2>
                    <p className="text-muted-foreground">
                      {bookingSearchQuery || bookingStatusFilter !== "all" || bookingDateFilter
                        ? "Try adjusting your search or filter criteria."
                        : "No bookings have been made yet."}
                    </p>
                  </Card>
                ) : (
                  <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-primary/5 border-b border-primary/20">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                              Booking ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                              Passenger
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                              Flight
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/10">
                          {allBookings
                            .filter((booking) => {
                              // Search filter
                              if (bookingSearchQuery) {
                                const query = bookingSearchQuery.toLowerCase();
                                const matchesSearch = 
                                  booking.id?.toString().includes(query) ||
                                  booking.passenger_name?.toLowerCase().includes(query) ||
                                  booking.passenger_email?.toLowerCase().includes(query) ||
                                  booking.flight?.origin?.toLowerCase().includes(query) ||
                                  booking.flight?.destination?.toLowerCase().includes(query) ||
                                  booking.flight?.flight_number?.toLowerCase().includes(query);
                                if (!matchesSearch) return false;
                              }
                              
                              // Status filter
                              if (bookingStatusFilter !== "all") {
                                if (booking.status?.toLowerCase() !== bookingStatusFilter.toLowerCase()) {
                                  return false;
                                }
                              }
                              
                              // Date filter
                              if (bookingDateFilter) {
                                const bookingDate = booking.flight?.departure_time 
                                  ? new Date(booking.flight.departure_time).toISOString().split('T')[0]
                                  : booking.booked_at 
                                  ? new Date(booking.booked_at).toISOString().split('T')[0]
                                  : null;
                                if (bookingDate !== bookingDateFilter) {
                                  return false;
                                }
                              }
                              
                              return true;
                            })
                            .map((booking) => (
                              <tr key={booking.id} className="hover:bg-primary/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-mono text-sm font-medium">#{booking.id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="font-heading font-semibold text-foreground">
                                      {booking.passenger_name || "N/A"}
                                    </div>
                                    <div className="font-body text-sm text-muted-foreground flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {booking.passenger_email || "N/A"}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="font-heading font-semibold">
                                      {booking.flight?.origin || "N/A"} → {booking.flight?.destination || "N/A"}
                                    </div>
                                    <div className="font-body text-xs text-muted-foreground">
                                      {booking.flight?.flight_number || `Flight #${booking.flight_id}`}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm">
                                    {booking.flight?.departure_time
                                      ? new Date(booking.flight.departure_time).toLocaleString()
                                      : booking.booked_at
                                      ? new Date(booking.booked_at).toLocaleString()
                                      : "N/A"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-heading font-semibold">
                                    ₹{booking.total_amount?.toLocaleString("en-IN") || "0.00"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge
                                    className={
                                      booking.status === "confirmed"
                                        ? "bg-accent/10 text-accent"
                                        : booking.status === "cancelled"
                                        ? "bg-destructive/10 text-destructive"
                                        : booking.status === "refunded"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-warning/10 text-warning"
                                    }
                                  >
                                    {booking.status?.toUpperCase() || "PENDING"}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedBooking(booking);
                                        setIsBookingDetailsOpen(true);
                                      }}
                                      className="gap-1"
                                    >
                                      <Eye className="h-3 w-3" />
                                      View
                                    </Button>
                                    {booking.status === "pending" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBookingStatusUpdate(booking.id, "confirmed")}
                                        className="gap-1 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                                      >
                                        <CheckCircle className="h-3 w-3" />
                                        Confirm
                                      </Button>
                                    )}
                                    {booking.status !== "cancelled" && booking.status !== "refunded" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBookingStatusUpdate(booking.id, "cancelled")}
                                        className="gap-1 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                      >
                                        <XCircle className="h-3 w-3" />
                                        Cancel
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-6 py-4 border-t border-primary/20 bg-primary/5">
                      <p className="text-sm text-muted-foreground">
                        Showing {allBookings.filter((booking) => {
                          if (bookingSearchQuery) {
                            const query = bookingSearchQuery.toLowerCase();
                            const matchesSearch = 
                              booking.id?.toString().includes(query) ||
                              booking.passenger_name?.toLowerCase().includes(query) ||
                              booking.passenger_email?.toLowerCase().includes(query) ||
                              booking.flight?.origin?.toLowerCase().includes(query) ||
                              booking.flight?.destination?.toLowerCase().includes(query) ||
                              booking.flight?.flight_number?.toLowerCase().includes(query);
                            if (!matchesSearch) return false;
                          }
                          if (bookingStatusFilter !== "all") {
                            if (booking.status?.toLowerCase() !== bookingStatusFilter.toLowerCase()) return false;
                          }
                          if (bookingDateFilter) {
                            const bookingDate = booking.flight?.departure_time 
                              ? new Date(booking.flight.departure_time).toISOString().split('T')[0]
                              : booking.booked_at 
                              ? new Date(booking.booked_at).toISOString().split('T')[0]
                              : null;
                            if (bookingDate !== bookingDateFilter) return false;
                          }
                          return true;
                        }).length} of {allBookings.length} bookings
                      </p>
                    </div>
                  </Card>
                )}
              </>
            )}

            {activeSection === "api-keys" && (
              <ApiKeysManagement />
            )}

            {activeSection === "external-flights" && (
              <ExternalFlightsViewer />
            )}

            {activeSection === "profile" && (
              <div className="max-w-4xl mx-auto space-y-6">
                {profileLoading && !adminProfile ? (
                  <Card className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading profile...</p>
                  </Card>
                ) : (
                  <>
                    {/* Profile Header */}
                    <Card className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="rounded-full bg-primary/10 p-4">
                          <UserCircle className="h-12 w-12 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h2 className="font-heading text-2xl font-bold">
                            {adminProfile?.full_name || "Admin User"}
                          </h2>
                          <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <Mail className="h-4 w-4" />
                            {adminProfile?.email || auth?.email}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-primary/10 text-primary">
                              {adminProfile?.role?.toUpperCase() || "ADMIN"}
                            </Badge>
                            {adminProfile?.is_active !== false && (
                              <Badge className="bg-accent/10 text-accent">
                                Active
                              </Badge>
                            )}
                          </div>
                        </div>
                        {!isEditingProfile && (
                          <Button
                            onClick={() => setIsEditingProfile(true)}
                            variant="outline"
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit Profile
                          </Button>
                        )}
                      </div>
                    </Card>

                    {/* Profile Information */}
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-heading text-lg font-semibold">Basic Information</h3>
                      </div>

                      {profileSuccess && (
                        <div className="mb-4 rounded-lg border border-accent/50 bg-accent/10 p-3">
                          <p className="text-sm font-medium text-accent">{profileSuccess}</p>
                        </div>
                      )}

                      {profileError && (
                        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                          <p className="text-sm font-medium text-destructive">{profileError}</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="font-body text-sm font-medium text-foreground mb-2 block">
                            Full Name
                          </label>
                          {isEditingProfile ? (
                            <Input
                              type="text"
                              placeholder="Enter your full name"
                              value={profileFormData.full_name}
                              onChange={(e) =>
                                setProfileFormData({ ...profileFormData, full_name: e.target.value })
                              }
                              className="h-12 bg-background"
                            />
                          ) : (
                            <p className="font-body text-base p-3 bg-primary/5 rounded-lg">
                              {adminProfile?.full_name || "Not set"}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="font-body text-sm font-medium text-foreground mb-2 block">
                            Email Address
                          </label>
                          {isEditingProfile ? (
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              value={profileFormData.email}
                              onChange={(e) =>
                                setProfileFormData({ ...profileFormData, email: e.target.value })
                              }
                              className="h-12 bg-background"
                            />
                          ) : (
                            <p className="font-body text-base p-3 bg-primary/5 rounded-lg flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {adminProfile?.email || auth?.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="font-body text-sm font-medium text-foreground mb-2 block">
                            Role
                          </label>
                          <p className="font-body text-base p-3 bg-primary/5 rounded-lg">
                            <Badge className="bg-primary/10 text-primary">
                              {adminProfile?.role?.toUpperCase() || "ADMIN"}
                            </Badge>
                          </p>
                        </div>

                        <div>
                          <label className="font-body text-sm font-medium text-foreground mb-2 block">
                            Account Status
                          </label>
                          <p className="font-body text-base p-3 bg-primary/5 rounded-lg">
                            <Badge className={adminProfile?.is_active !== false ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}>
                              {adminProfile?.is_active !== false ? "Active" : "Inactive"}
                            </Badge>
                          </p>
                        </div>

                        {adminProfile?.created_at && (
                          <div>
                            <label className="font-body text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              Account Created
                            </label>
                            <p className="font-body text-base p-3 bg-primary/5 rounded-lg">
                              {new Date(adminProfile.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })}
                            </p>
                          </div>
                        )}

                        {isEditingProfile && (
                          <div className="flex gap-4 pt-4 border-t">
                            <Button
                              onClick={handleProfileUpdate}
                              disabled={profileLoading}
                              className="flex-1 gap-2"
                            >
                              {profileLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditingProfile(false);
                                setProfileFormData({
                                  full_name: adminProfile?.full_name || "",
                                  email: adminProfile?.email || auth?.email || ""
                                });
                                setProfileError(null);
                                setProfileSuccess(null);
                              }}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Form Sheet */}
      <Sheet open={isEditUserFormOpen} onOpenChange={setIsEditUserFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {editingUser && (
            <EditUserForm
              user={editingUser}
              onClose={() => {
                setIsEditUserFormOpen(false);
                setEditingUser(null);
              }}
              onSuccess={() => {
                loadAllUsers();
                setIsEditUserFormOpen(false);
                setEditingUser(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Account"
        description="Are you sure you want to permanently delete this account?"
      >
        <DialogContent>
          {userToDelete && (
            <div className="space-y-2">
              <p className="font-body text-sm text-foreground">
                This will permanently delete the account for:
              </p>
              <div className="p-3 bg-primary/5 rounded-lg">
                <p className="font-heading font-semibold text-foreground">
                  {userToDelete.full_name || "No name"}
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  {userToDelete.email}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-2">
                  Role: {userToDelete.role.toUpperCase()}
                </p>
              </div>
              <p className="font-body text-sm text-destructive mt-4">
                <strong>Warning:</strong> This action cannot be undone. All associated data (vendor profile, bookings, etc.) will be permanently deleted.
              </p>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDeleteConfirmOpen(false);
              setUserToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={deletingUserId !== null}
          >
            {deletingUserId !== null ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Vendor Deactivate Confirmation Dialog */}
      <Dialog
        open={deactivateConfirmOpen}
        onOpenChange={setDeactivateConfirmOpen}
        title={vendorToDeactivate?.isActive ? "Deactivate Vendor Account" : "Activate Vendor Account"}
        description={vendorToDeactivate?.isActive 
          ? "Are you sure you want to deactivate this vendor account?"
          : "Are you sure you want to activate this vendor account?"}
      >
        <DialogContent>
          {vendorToDeactivate && (
            <div className="space-y-2">
              <p className="font-body text-sm text-foreground">
                {vendorToDeactivate.isActive 
                  ? "This will deactivate the vendor account for:"
                  : "This will activate the vendor account for:"}
              </p>
              <div className="p-3 bg-primary/5 rounded-lg">
                <p className="font-heading font-semibold text-foreground">
                  {vendorToDeactivate.companyName}
                </p>
              </div>
              {vendorToDeactivate.isActive && (
                <p className="font-body text-sm text-orange-600 mt-4">
                  <strong>Note:</strong> Deactivated vendors will not be able to log in until their account is reactivated.
                </p>
              )}
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDeactivateConfirmOpen(false);
              setVendorToDeactivate(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant={vendorToDeactivate?.isActive ? "destructive" : "default"}
            onClick={handleVendorDeactivateConfirm}
            disabled={processingVendorId !== null}
          >
            {processingVendorId !== null ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              vendorToDeactivate?.isActive ? "Confirm Deactivate" : "Confirm Activate"
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Aircraft Details Sheet */}
      <Sheet open={isAircraftSheetOpen} onOpenChange={setIsAircraftSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          {selectedAircraft && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold">Aircraft Details</h2>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  {selectedAircraft.aircraft_name || selectedAircraft.model || "Aircraft"}
                </p>
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-heading text-lg font-semibold mb-4">Basic Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Aircraft Name</p>
                      <p className="font-medium">{selectedAircraft.aircraft_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Manufacturer</p>
                      <p className="font-medium">{selectedAircraft.manufacturer || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Model</p>
                      <p className="font-medium">{selectedAircraft.model || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Model Number</p>
                      <p className="font-medium">{selectedAircraft.model_number || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Registration Number</p>
                      <Badge className="bg-primary/10 text-primary font-mono">
                        {selectedAircraft.registration_number || "N/A"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Year of Manufacture</p>
                      <p className="font-medium">{selectedAircraft.year_of_manufacture || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Seat Capacity</p>
                      <p className="font-medium">{selectedAircraft.seat_capacity || 0} seats</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Luggage Load</p>
                      <p className="font-medium">{selectedAircraft.luggage_load_kg ? `${selectedAircraft.luggage_load_kg} kg` : "N/A"}</p>
                    </div>
                    {selectedAircraft.maximum_speed && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Maximum Speed</p>
                        <p className="font-medium">
                          {selectedAircraft.maximum_speed} {selectedAircraft.speed_unit || "km/h"}
                        </p>
                      </div>
                    )}
                    {selectedAircraft.range_km && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Range</p>
                        <p className="font-medium">{selectedAircraft.range_km} km</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Aircraft Images Gallery */}
                <Card className="p-6">
                  <h3 className="font-heading text-lg font-semibold mb-4">Aircraft Images</h3>
                  <AircraftGallery 
                    images={
                      selectedAircraft.aircraft_images && Array.isArray(selectedAircraft.aircraft_images)
                        ? selectedAircraft.aircraft_images
                        : []
                    }
                  />
                </Card>

                {selectedAircraft.amenities && (
                  <Card className="p-6">
                    <h3 className="font-heading text-lg font-semibold mb-4">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(selectedAircraft.amenities) && selectedAircraft.amenities.length > 0 ? (
                        selectedAircraft.amenities.map((amenity: string, index: number) => (
                          <Badge key={index} className="bg-accent/10 text-accent">
                            {amenity}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No amenities listed</p>
                      )}
                    </div>
                    <div className="mt-4 grid gap-2 md:grid-cols-2">
                      {selectedAircraft.wifi_available && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-accent" />
                          <span className="text-sm">Wi-Fi Available</span>
                        </div>
                      )}
                      {selectedAircraft.dining_service && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-accent" />
                          <span className="text-sm">Dining Service</span>
                        </div>
                      )}
                      {selectedAircraft.entertainment_system && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-accent" />
                          <span className="text-sm">Entertainment System</span>
                        </div>
                      )}
                      {selectedAircraft.pet_onboard_allowed && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-accent" />
                          <span className="text-sm">Pet Onboard Allowed</span>
                        </div>
                      )}
                      {selectedAircraft.air_conditioning && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-accent" />
                          <span className="text-sm">Air Conditioning</span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAircraftSheetOpen(false);
                      setSelectedAircraft(null);
                    }}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      // TODO: Implement edit functionality
                      showToast("Edit functionality coming soon", "info");
                    }}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Aircraft
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Booking Details Sheet */}
      <Sheet open={isBookingDetailsOpen} onOpenChange={setIsBookingDetailsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          {selectedBooking && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold">Booking Details</h2>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  Booking ID: #{selectedBooking.id}
                </p>
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-heading text-lg font-semibold mb-4">Passenger Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Name</p>
                      <p className="font-medium">{selectedBooking.passenger_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <p className="font-medium">{selectedBooking.passenger_email || "N/A"}</p>
                    </div>
                    {selectedBooking.passenger_phone && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Phone</p>
                        <p className="font-medium">{selectedBooking.passenger_phone}</p>
                      </div>
                    )}
                    {selectedBooking.emergency_contact_name && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Emergency Contact</p>
                        <p className="font-medium">
                          {selectedBooking.emergency_contact_name}
                          {selectedBooking.emergency_contact_phone && ` - ${selectedBooking.emergency_contact_phone}`}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-heading text-lg font-semibold mb-4">Flight Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Route</p>
                      <p className="font-heading font-semibold text-lg">
                        {selectedBooking.flight?.origin || "N/A"} → {selectedBooking.flight?.destination || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Flight Number</p>
                      <p className="font-medium">{selectedBooking.flight?.flight_number || `Flight #${selectedBooking.flight_id}`}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Departure</p>
                      <p className="font-medium">
                        {selectedBooking.flight?.departure_time
                          ? new Date(selectedBooking.flight.departure_time).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Arrival</p>
                      <p className="font-medium">
                        {selectedBooking.flight?.arrival_time
                          ? new Date(selectedBooking.flight.arrival_time).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Seat</p>
                      <p className="font-medium">
                        {selectedBooking.seat?.seat_number || (selectedBooking.is_full_charter ? "FULL CHARTER" : "AUTO-ASSIGNED")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Booking Type</p>
                      <Badge className={selectedBooking.is_full_charter ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}>
                        {selectedBooking.is_full_charter ? "Full Charter" : "Seat Booking"}
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-heading text-lg font-semibold mb-4">Booking Details</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <Badge
                        className={
                          selectedBooking.status === "confirmed"
                            ? "bg-accent/10 text-accent"
                            : selectedBooking.status === "cancelled"
                            ? "bg-destructive/10 text-destructive"
                            : selectedBooking.status === "refunded"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-warning/10 text-warning"
                        }
                      >
                        {selectedBooking.status?.toUpperCase() || "PENDING"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                      <p className="font-heading font-semibold text-lg">
                        ₹{selectedBooking.total_amount?.toLocaleString("en-IN") || "0.00"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Booked At</p>
                      <p className="font-medium">
                        {selectedBooking.booked_at
                          ? new Date(selectedBooking.booked_at).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  {selectedBooking.special_requests && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-1">Special Requests</p>
                      <p className="font-medium bg-primary/5 p-3 rounded-lg">{selectedBooking.special_requests}</p>
                    </div>
                  )}
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsBookingDetailsOpen(false);
                      setSelectedBooking(null);
                    }}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  {selectedBooking.status === "pending" && (
                    <Button
                      onClick={() => handleBookingStatusUpdate(selectedBooking.id, "confirmed")}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </Button>
                  )}
                  {selectedBooking.status !== "cancelled" && selectedBooking.status !== "refunded" && (
                    <Button
                      variant="destructive"
                      onClick={() => handleBookingStatusUpdate(selectedBooking.id, "cancelled")}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Booking History Sheet */}
      <Sheet open={isBookingsSheetOpen} onOpenChange={setIsBookingsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          {viewingBookingsFor && (
            <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-2xl font-bold">Booking History</h2>
                  <p className="font-body text-sm text-muted-foreground mt-1">
                    {viewingBookingsFor.full_name || "No name"} ({viewingBookingsFor.email})
                  </p>
              </div>

              {bookingsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading bookings...</p>
                </div>
              ) : userBookings.length === 0 ? (
                <Card className="p-12 text-center">
                  <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-heading text-xl font-bold mb-2">No Bookings Found</h3>
                  <p className="text-muted-foreground">This passenger has no booking history.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userBookings.map((booking: any) => (
                    <Card key={booking.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              className={
                                booking.status === "confirmed"
                                  ? "bg-accent/10 text-accent"
                                  : booking.status === "cancelled"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-warning/10 text-warning"
                              }
                            >
                              {booking.status?.toUpperCase() || "PENDING"}
                            </Badge>
                            {booking.is_full_charter && (
                              <Badge className="bg-primary/10 text-primary">Full Charter</Badge>
                            )}
                          </div>
                          <p className="font-heading font-semibold text-lg">
                            {booking.flight?.origin || "N/A"} → {booking.flight?.destination || "N/A"}
                          </p>
                        </div>
                        <p className="font-body text-sm text-muted-foreground">
                          ${booking.total_amount?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Flight Number</p>
                          <p className="font-medium">{booking.flight?.flight_number || `PJ-${booking.flight_id}`}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Seat</p>
                          <p className="font-medium">
                            {booking.seat?.seat_number || (booking.is_full_charter ? "CHARTER" : "N/A")}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Departure</p>
                          <p className="font-medium">
                            {booking.flight?.departure_time
                              ? new Date(booking.flight.departure_time).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Booked At</p>
                          <p className="font-medium">
                            {booking.booked_at ? new Date(booking.booked_at).toLocaleString() : "N/A"}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}