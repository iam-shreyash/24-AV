import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, User, DollarSign, Download, RefreshCw, Bell, BellOff } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Badge } from "../ui/badge";
import { extractMessage } from "../../lib/extractMessage";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

type Booking = {
  id: number;
  flight_id: number;
  passenger_id: number;
  seat_id: number | null;
  total_amount: number;
  status: "pending" | "confirmed" | "cancelled" | "refunded";
  booked_at: string;
  passenger_name: string | null;
  passenger_email: string | null;
  passenger_phone: string | null;
  flight?: {
    id: number;
    origin: string;
    destination: string;
    departure_time: string;
    arrival_time: string;
    flight_number?: string;
  };
  seat?: {
    id: number;
    seat_number: string;
    class_type: string;
  };
};

type Notification = {
  id: number;
  vendor_id: number;
  booking_id: number;
  notification_type: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
  booking: Booking | null;
};

export default function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/vendors/recent-bookings", {
        params: { limit: 50 }
      });
      setBookings(response.data);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      
      if (error.response?.status === 403) {
        setError('You do not have permission to view these bookings.');
      } else if (error.response?.status !== 401) { // 401 is handled by interceptor
        setError('Failed to fetch bookings. Please try again later.');
      }
      
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await api.get("/vendors/notifications", {
        params: { unread_only: false, limit: 20 }
      });
      setNotifications(response.data);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      
      if (error.response?.status !== 401) { // 401 is handled by interceptor
        console.error('Notification fetch error details:', {
          status: error.response?.status,
          data: error.response?.data
        });
      }
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markNotificationRead = async (notificationId: number) => {
    try {
      await api.patch(`/vendors/notifications/${notificationId}/read`);
      
      // Optimistically update the UI
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      // Show error to user if needed
      const errorMessage = extractMessage(error.response?.data?.message || error.message) || 
                          "Failed to mark notification as read";
      console.error(errorMessage);
    }
  };

  const handleDownloadTicket = async (bookingId: number) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/ticket`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf,text/html' 
        }
      });

      const contentType = response.headers['content-type'];
      

      // If it's already a PDF, download it directly
      if (contentType === 'application/pdf') {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `boarding-pass-${bookingId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return;
      }

      // If it's HTML, convert to PDF using html2canvas + jsPDF
      if (contentType === 'text/html' || contentType?.includes('html')) {
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
        } finally {
          document.body.removeChild(container);
        }
        return;
      }

      alert("Invalid response format");
    } catch (error: any) {
      console.error("Error downloading ticket:", error);
      const raw = error.response?.data?.detail || error.response?.data?.message || error.message || "Failed to download ticket";
      const errorMessage = extractMessage(raw) || "Failed to download ticket";
      console.error(errorMessage);
      alert(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "refunded":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchNotifications();

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      fetchBookings();
      fetchNotifications();
    }, 30000);
    setPollingInterval(interval);

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header with Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recent Bookings</h2>
          <p className="text-muted-foreground mt-1">
            View and manage recent flight bookings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchBookings();
              fetchNotifications();
            }}
            disabled={loading || notificationsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(loading || notificationsLoading) ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              {unreadCount > 0 ? (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4 mr-2" />
                  Notifications
                </>
              )}
            </Button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="divide-y">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 cursor-pointer hover:bg-muted ${
                          !notif.is_read ? "bg-blue-50 dark:bg-blue-950/20" : ""
                        }`}
                        onClick={() => {
                          if (!notif.is_read) {
                            markNotificationRead(notif.id);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notif.message || "New booking"}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(notif.created_at)} at {formatTime(notif.created_at)}
                            </p>
                            {notif.booking && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Amount: ${notif.booking.total_amount.toFixed(2)}
                              </p>
                            )}
                          </div>
                          {!notif.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No bookings found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* Passenger Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">
                          {booking.passenger_name || "Unknown Passenger"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.passenger_email || "No email"}
                        </p>
                        {booking.passenger_phone && (
                          <p className="text-sm text-muted-foreground">
                            {booking.passenger_phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Flight Details */}
                  {booking.flight && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {booking.flight.origin} → {booking.flight.destination}
                          </p>
                          <p className="text-xs text-muted-foreground">Route</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {formatDate(booking.flight.departure_time)}
                          </p>
                          <p className="text-xs text-muted-foreground">Date</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {formatTime(booking.flight.departure_time)} - {formatTime(booking.flight.arrival_time)}
                          </p>
                          <p className="text-xs text-muted-foreground">Time</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="flex items-center gap-6 pt-2 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Seat</p>
                      <p className="font-medium">
                        {booking.seat?.seat_number || "CHARTER"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {booking.total_amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Booked At</p>
                      <p className="font-medium">
                        {formatDate(booking.booked_at)} {formatTime(booking.booked_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-6 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadTicket(booking.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Ticket
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

