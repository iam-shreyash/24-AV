import { useState } from "react";
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp,
  Send
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollAnimate } from "./ui/ScrollAnimate";

export default function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { t } = useTranslation();

  const faqKeys = [
    "bookFlight",
    "paymentMethods",
    "cancelBooking",
    "refundTimeline",
    "modifyBooking",
    "receiveTicket",
    "isSafe",
    "missedFlight"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    setFormSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <ScrollAnimate type="fade-in" threshold={0.2}>
          <h1 className="mb-8 font-heading text-4xl font-bold text-blue-800 md:text-5xl">
            {t("support.title")}
          </h1>
        </ScrollAnimate>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* FAQ Section */}
            <ScrollAnimate type="fade-in" threshold={0.2}>
              <Card className="border border-gray-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 font-heading text-2xl font-bold text-blue-800">
                  {t("support.faqTitle")}
                </h2>
                <div className="space-y-4">
                  {faqKeys.map((key, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                      <button
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        className="flex w-full items-center justify-between text-left transition-colors hover:text-blue-800"
                      >
                        <h3 className="font-heading text-base font-semibold text-gray-900 pr-4">
                          {t(`support.faq.${key}.question`)}
                        </h3>
                        {openFaq === index ? (
                          <ChevronUp className="h-5 w-5 text-blue-800 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {openFaq === index && (
                        <p className="mt-3 font-body text-sm text-gray-600 animate-fade-in">
                          {t(`support.faq.${key}.answer`)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </ScrollAnimate>

            {/* Contact Us Form */}
            <ScrollAnimate type="fade-in" threshold={0.2} delay={200}>
              <Card className="border border-gray-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 font-heading text-2xl font-bold text-blue-800">
                  {t("support.contactCard.title")}
                </h2>
                {formSubmitted && (
                  <div className="mb-6 rounded-lg border border-green-500 bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-700">
                      {t("support.contactCard.success")}
                    </p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-body text-sm font-medium text-gray-700">
                      {t("support.contactCard.nameLabel")}
                    </label>
                    <Input
                      type="text"
                      placeholder={t("support.contactCard.namePlaceholder")}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 border-gray-300 focus:border-blue-800 focus:ring-blue-800"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-body text-sm font-medium text-gray-700">
                      {t("support.contactCard.emailLabel")}
                    </label>
                    <Input
                      type="email"
                      placeholder={t("support.contactCard.emailPlaceholder")}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 border-gray-300 focus:border-blue-800 focus:ring-blue-800"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-body text-sm font-medium text-gray-700">
                      {t("support.contactCard.messageLabel")}
                    </label>
                    <textarea
                      placeholder={t("support.contactCard.messagePlaceholder")}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-body text-sm focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-800 text-white hover:bg-blue-900"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {t("support.contactCard.submit")}
                  </Button>
                </form>
              </Card>
            </ScrollAnimate>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Contact */}
            <ScrollAnimate type="slide-left" threshold={0.2} delay={100}>
              <Card className="border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-6 font-heading text-xl font-bold text-blue-800">
                  {t("support.quickContact.title")}
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <Phone className="h-6 w-6 text-blue-800" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-gray-900">{t("support.quickContact.phoneLabel")}</p>
                      <p className="font-body text-sm text-gray-600">{t("support.quickContact.phoneSubtitle")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <Mail className="h-6 w-6 text-blue-800" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-gray-900">{t("support.quickContact.emailLabel")}</p>
                      <p className="font-body text-sm text-gray-600">{t("support.quickContact.emailSubtitle")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <MessageCircle className="h-6 w-6 text-blue-800" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-gray-900">{t("support.quickContact.chatLabel")}</p>
                      <p className="font-body text-sm text-gray-600">{t("support.quickContact.chatSubtitle")}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </ScrollAnimate>

            {/* Need Urgent Help */}
            <ScrollAnimate type="slide-left" threshold={0.2} delay={300}>
              <Card className="border-0 bg-gradient-to-br from-blue-800 to-blue-900 p-6 shadow-lg">
                <h2 className="mb-3 font-heading text-xl font-bold text-white">
                  {t("support.urgentHelp.title")}
                </h2>
                <p className="mb-6 font-body text-sm text-white/90">
                  {t("support.urgentHelp.description")}
                </p>
                <Button
                  variant="outline"
                  className="w-full border-white bg-white text-blue-800 hover:bg-gray-100"
                  onClick={() => window.location.href = "tel:+919000000000"}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  {t("support.urgentHelp.callNow")}
                </Button>
              </Card>
            </ScrollAnimate>
          </div>
        </div>
      </div>
    </div>
  );
}

