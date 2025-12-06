import { useState, useRef } from "react";
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
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import SearchBar from "./SearchBar";
import { getStoredAuth } from "../utils/getStoredAuth";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();
  const auth = getStoredAuth();
  const { t } = useTranslation();
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Hero Entrance Timeline
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".hero-bg", {
      scale: 1.1,
      opacity: 0,
      duration: 1.5,
    })
      .from(".hero-badge", {
        y: 20,
        opacity: 0,
        duration: 0.8
      }, "-=1")
      .from(".hero-title", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.7)"
      }, "-=0.6")
      .from(".hero-subtitle", {
        y: 30,
        opacity: 0,
        duration: 0.8
      }, "-=0.6")
      .from(".hero-search", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.4");

    // 2. Sections ScrollTrigger
    const sections = gsap.utils.toArray<HTMLElement>(".reveal-section");
    sections.forEach((section) => {
      gsap.fromTo(section,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // 3. Staggered Benefits Cards
    gsap.fromTo(".benefit-card",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".benefits-grid",
          start: "top 85%",
        }
      }
    );

  }, { scope: container });

  const benefits = [
    {
      icon: Clock,
      title: t("home.benefits.instantConfirmation.title"),
      description: t("home.benefits.instantConfirmation.description"),
    },
    {
      icon: Lock,
      title: t("home.benefits.securePayments.title"),
      description: t("home.benefits.securePayments.description"),
    },
    {
      icon: Gift,
      title: t("home.benefits.exclusiveDeals.title"),
      description: t("home.benefits.exclusiveDeals.description"),
    },
    {
      icon: FolderOpen,
      title: t("home.benefits.easyManagement.title"),
      description: t("home.benefits.easyManagement.description"),
    },
    {
      icon: Mail,
      title: t("home.benefits.travelUpdates.title"),
      description: t("home.benefits.travelUpdates.description"),
    },
    {
      icon: UsersIcon,
      title: t("home.benefits.groupBookings.title"),
      description: t("home.benefits.groupBookings.description"),
    },
    {
      icon: Bell,
      title: t("home.benefits.priceAlerts.title"),
      description: t("home.benefits.priceAlerts.description"),
    },
  ];

  const vendorTools = [
    {
      icon: Lock,
      title: t("home.vendorTools.securePayments.title"),
      description: t("home.vendorTools.securePayments.description"),
    },
    {
      icon: Bell,
      title: t("home.vendorTools.businessAnalytics.title"),
      description: t("home.vendorTools.businessAnalytics.description"),
    },
    {
      icon: FolderOpen,
      title: t("home.vendorTools.documentVault.title"),
      description: t("home.vendorTools.documentVault.description"),
    },
    {
      icon: Clock,
      title: t("home.vendorTools.easyDashboard.title"),
      description: t("home.vendorTools.easyDashboard.description"),
    },
  ];

  const faqs = [
    {
      question: t("home.faq.items.howToBook.question"),
      answer: t("home.faq.items.howToBook.answer"),
    },
    {
      question: t("home.faq.items.paymentMethods.question"),
      answer: t("home.faq.items.paymentMethods.answer"),
    },
    {
      question: t("home.faq.items.modifyBooking.question"),
      answer: t("home.faq.items.modifyBooking.answer"),
    },
    {
      question: t("home.faq.items.receiveTicket.question"),
      answer: t("home.faq.items.receiveTicket.answer"),
    },
    {
      question: t("home.faq.items.isSafe.question"),
      answer: t("home.faq.items.isSafe.answer"),
    },
  ];

  const activeBenefits = auth?.userRole === "vendor" ? vendorTools : benefits;

  return (
    <div ref={container} className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 pb-20 pt-8">
        {/* Jet Background Image with Low Opacity */}
        <div className="absolute inset-0 z-[1] hero-bg origin-center">
          <img
            src="/jet-background.png"
            alt="Private Jet"
            className="h-full w-full object-cover object-right opacity-[0.60]"
            onError={(e) => {
              console.error("Failed to load jet background image");
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Overlay to ensure text readability - reduced opacity to show jet */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800/85 via-blue-900/85 to-slate-900/85 z-[2]"></div>

        <div className="container relative z-10 mx-auto px-4 pt-12">
          <div className="mb-8 text-center">
            <div className="hero-badge mx-auto mb-4 flex w-fit items-center gap-2">
              <Badge className="bg-white/20 text-white backdrop-blur-sm border-white/30">
                <Plane className="h-4 w-4" />
                {t("home.hero.badge")}
              </Badge>
            </div>

            <h1 className="hero-title font-heading text-5xl font-bold text-white md:text-6xl lg:text-7xl">
              {auth?.userRole === "vendor"
                ? t("home.hero.titleVendor")
                : t("home.hero.title")}
            </h1>
            <p className="hero-subtitle mt-4 font-body text-xl text-white/90 md:text-2xl">
              {auth?.userRole === "vendor"
                ? t("home.hero.subtitleVendor")
                : t("home.hero.subtitle")}
            </p>
          </div>

          <div className="hero-search mt-8">
            {auth?.userRole !== "vendor" && <SearchBar />}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="reveal-section py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-4xl font-bold text-blue-800 md:text-5xl">
              {auth?.userRole === "vendor"
                ? t("home.sections.vendorToolsTitle")
                : t("home.sections.benefitsTitle")}
            </h2>
            <p className="mt-4 font-body text-lg text-gray-600">
              {auth?.userRole === "vendor"
                ? t("home.sections.vendorToolsSubtitle")
                : t("home.sections.benefitsSubtitle")}
            </p>
          </div>

          <div className="benefits-grid grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {activeBenefits.map((item, index) => (
              <Card key={index} className="benefit-card border border-gray-200 bg-white p-8 text-center rounded-xl shadow-sm hover:shadow-md transition-shadow h-full flex flex-col will-change-transform">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  <item.icon className="h-7 w-7 text-blue-800" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="font-body text-sm text-gray-600 flex-grow">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="reveal-section py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-4xl font-bold text-blue-800 md:text-5xl">
              {t("home.faq.title")}
            </h2>
            <p className="mt-4 font-body text-lg text-gray-600">
              {t("home.faq.subtitle")}
            </p>
          </div>

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
                  <div className={`grid transition-all duration-300 ease-in-out ${openFaq === index ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <p className="font-body text-gray-600">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="outline" className="border-blue-800 text-blue-800 hover:bg-blue-50">
                {t("home.faq.viewAll")}
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
