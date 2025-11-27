import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plane, 
  Calendar, 
  Headphones, 
  Clock, 
  Lock, 
  Gift, 
  FolderOpen, 
  Mail, 
  Users as UsersIcon, 
  Bell,
  ChevronDown,
  ChevronUp
} from "lucide-react";

import SearchBar from "./SearchBar";
import { getStoredAuth } from "./auth/Login";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollAnimate } from "./ui/ScrollAnimate";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();
  const auth = getStoredAuth();

  const whyChooseFeatures = [
    {
      icon: Plane,
      title: "Best Prices",
      description: "Compare and book flights at the most competitive rates across all airlines"
    },
    {
      icon: Calendar,
      title: "Flexible Booking",
      description: "Easy date changes and cancellations with transparent policies"
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Round-the-clock assistance for all your travel needs and queries"
    }
  ];

  const vendorPartnerFeatures = [
    // vendor partner features removed from shared Home
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Instant Confirmation",
      description: "Get booking confirmation instantly via email and SMS"
    },
    {
      icon: Lock,
      title: "Secure Payments",
      description: "Bank-grade encryption for all transactions"
    },
    {
      icon: Gift,
      title: "Exclusive Deals",
      description: "Special discounts and seasonal offers"
    },
    {
      icon: FolderOpen,
      title: "Easy Management",
      description: "Manage all bookings from one dashboard"
    },
    {
      icon: Mail,
      title: "Travel Updates",
      description: "Real-time notifications about your flights"
    },
    {
      icon: UsersIcon,
      title: "Group Bookings",
      description: "Special rates for group travel bookings"
    },
    {
      icon: Bell,
      title: "Price Alerts",
      description: "Get notified when prices drop on your routes"
    }
  ];

  const vendorTools = [
    {
      icon: Lock,
      title: "Secure Payments",
      description: "Fast payouts and encrypted transactions."
    },
    {
      icon: Bell,
      title: "Business Analytics",
      description: "View booking trends and performance insights."
    },
    {
      icon: FolderOpen,
      title: "Document Vault",
      description: "Upload and manage required verification documents."
    },
    {
      icon: Clock,
      title: "Easy Dashboard",
      description: "One centralized dashboard for all vendor operations."
    }
  ];

  const faqs = [
    {
      question: "How do I book a flight on 24AV?",
      answer: "Simply enter your departure and destination cities, select your travel dates, and click 'Search Flights'. Browse through available options and complete your booking in just a few clicks."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets. All transactions are secured with bank-grade encryption."
    },
    {
      question: "Can I cancel or modify my booking?",
      answer: "Yes, you can cancel or modify your booking through the 'My Bookings' section. Cancellation and modification policies vary by airline and fare type. Please check the terms before booking."
    },
    {
      question: "How will I receive my ticket?",
      answer: "You will receive your e-ticket via email and SMS immediately after booking confirmation. You can also access it anytime from your 'My Bookings' section."
    },
    {
      question: "Is it safe to book online?",
      answer: "Absolutely! We use industry-standard SSL encryption and secure payment gateways to protect your personal and financial information. Your data is safe with us."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 pb-20 pt-8">
        {/* Jet Background Image with Low Opacity */}
        <img 
          src="/jet-background.png"
          alt="Private Jet"
          className="absolute inset-0 h-full w-full object-cover object-right opacity-[0.60]"
          style={{ zIndex: 1 }}
          onError={(e) => {
            console.error("Failed to load jet background image");
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Overlay to ensure text readability - reduced opacity to show jet */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800/85 via-blue-900/85 to-slate-900/85 z-[2]"></div>
        <div className="container relative z-10 mx-auto px-4 pt-12">
          <ScrollAnimate type="fade-in" threshold={0.1} delay={0}>
            <div className="mb-8 text-center">
              <Badge className="mx-auto mb-4 flex w-fit items-center gap-2 bg-white/20 text-white backdrop-blur-sm border-white/30">
                <Plane className="h-4 w-4" />
                India's Premier Aviation Platform
              </Badge>
              <h1 className="font-heading text-5xl font-bold text-white md:text-6xl lg:text-7xl">
                {auth?.role === "vendor" 
                  ? "Welcome to the Vendor Dashboard"
                  : "Book Flights the 24AV Way"
                }
              </h1>
              <p className="mt-4 font-body text-xl text-white/90 md:text-2xl">
                {auth?.role === "vendor"
                  ? "Manage your flights, aircraft, and passengers with ease."
                  : "Fast search, simple checkout, unforgettable journeys"
                }
              </p>
            </div>
          </ScrollAnimate>

          <ScrollAnimate type="scale-in" threshold={0.3} delay={300}>
            <div className="mt-8">
              <SearchBar />
            </div>
          </ScrollAnimate>
        </div>
      </section>

      {/* 'Why Partner with 24AV' section removed from shared Home — vendor-only component renders this */}

      {/* Our Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <ScrollAnimate type="fade-in" threshold={0.2}>
            <div className="mb-12 text-center">
              <h2 className="font-heading text-4xl font-bold text-blue-800 md:text-5xl">
                {auth?.role === "vendor" ? "Vendor Tools" : "Our Benefits"}
              </h2>
              <p className="mt-4 font-body text-lg text-gray-600">
                {auth?.role === "vendor"
                  ? "Everything you need to manage your aviation operations."
                  : "Everything you need for a seamless travel experience"
                }
              </p>
            </div>
          </ScrollAnimate>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {(auth?.role === "vendor" ? vendorTools : benefits).map((item, index) => (
              <ScrollAnimate 
                key={index} 
                type="scale-in" 
                delay={index * 50}
                threshold={0.1}
              >
                <Card className="border border-gray-200 bg-white p-8 text-center rounded-xl shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                    <item.icon className="h-7 w-7 text-blue-800" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="font-body text-sm text-gray-600 flex-grow">{item.description}</p>
                </Card>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>

      {/* 'Why Partner with 24AV' section removed from passenger homepage per request. */}

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <ScrollAnimate type="fade-in" threshold={0.2}>
            <div className="mb-12 text-center">
              <h2 className="font-heading text-4xl font-bold text-blue-800 md:text-5xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 font-body text-lg text-gray-600">
                Quick answers to common questions about booking with 24AV
              </p>
            </div>
          </ScrollAnimate>
          <ScrollAnimate type="fade-in" threshold={0.2} delay={200}>
            <Card className="mx-auto max-w-4xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <h3 className="font-heading text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    {openFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-blue-800 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-blue-800 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <p className="mt-3 font-body text-gray-600">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="outline" className="border-blue-800 text-blue-800 hover:bg-blue-50">
                View All FAQs
              </Button>
            </div>
            </Card>
          </ScrollAnimate>
        </div>
      </section>
    </div>
  );
}
