import { useState } from "react";
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp,
  Send
} from "lucide-react";

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

  const faqs = [
    {
      question: "How do I book a flight on 24AV?",
      answer: "Simply enter your departure and destination cities, select your travel dates, and click 'Search Flights'. Browse through available options and complete your booking in just a few clicks."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets. All transactions are secured with bank-grade encryption."
    },
    {
      question: "How do I cancel my booking?",
      answer: "You can cancel your booking through the 'My Bookings' section. Cancellation policies vary by airline and fare type. Please check the terms before booking."
    },
    {
      question: "When will I receive my refund?",
      answer: "Refunds are typically processed within 5-7 business days after cancellation approval. The amount will be credited to your original payment method."
    },
    {
      question: "Can I modify my booking?",
      answer: "Yes, you can modify your booking through the 'My Bookings' section. Modification policies and fees vary by airline and fare type."
    },
    {
      question: "How will I receive my ticket?",
      answer: "You will receive your e-ticket via email and SMS immediately after booking confirmation. You can also access it anytime from your 'My Bookings' section."
    },
    {
      question: "Is it safe to book online?",
      answer: "Absolutely! We use industry-standard SSL encryption and secure payment gateways to protect your personal and financial information. Your data is safe with us."
    },
    {
      question: "What if I miss my flight?",
      answer: "If you miss your flight, please contact our support team immediately. Depending on the airline's policy, you may be able to rebook for a fee."
    }
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
            Help & Support
          </h1>
        </ScrollAnimate>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* FAQ Section */}
            <ScrollAnimate type="fade-in" threshold={0.2}>
              <Card className="border border-gray-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 font-heading text-2xl font-bold text-blue-800">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                      <button
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        className="flex w-full items-center justify-between text-left transition-colors hover:text-blue-800"
                      >
                        <h3 className="font-heading text-base font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </h3>
                        {openFaq === index ? (
                          <ChevronUp className="h-5 w-5 text-blue-800 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {openFaq === index && (
                        <p className="mt-3 font-body text-sm text-gray-600 animate-fade-in">
                          {faq.answer}
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
                  Contact Us
                </h2>
                {formSubmitted && (
                  <div className="mb-6 rounded-lg border border-green-500 bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-700">
                      Thank you! Your message has been sent. We'll get back to you soon.
                    </p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-body text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 border-gray-300 focus:border-blue-800 focus:ring-blue-800"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-body text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 border-gray-300 focus:border-blue-800 focus:ring-blue-800"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-body text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <textarea
                      placeholder="How can we help you?"
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
                    Send Message
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
                  Quick Contact
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <Phone className="h-6 w-6 text-blue-800" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-gray-900">+91 90000 00000</p>
                      <p className="font-body text-sm text-gray-600">24/7 Support</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <Mail className="h-6 w-6 text-blue-800" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-gray-900">support@24av.com</p>
                      <p className="font-body text-sm text-gray-600">Response in 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <MessageCircle className="h-6 w-6 text-blue-800" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-gray-900">Live Chat</p>
                      <p className="font-body text-sm text-gray-600">Available 9 AM - 9 PM</p>
                    </div>
                  </div>
                </div>
              </Card>
            </ScrollAnimate>

            {/* Need Urgent Help */}
            <ScrollAnimate type="slide-left" threshold={0.2} delay={300}>
              <Card className="border-0 bg-gradient-to-br from-blue-800 to-blue-900 p-6 shadow-lg">
                <h2 className="mb-3 font-heading text-xl font-bold text-white">
                  Need Urgent Help?
                </h2>
                <p className="mb-6 font-body text-sm text-white/90">
                  Our support team is available 24/7 to assist you with any travel emergencies
                </p>
                <Button
                  variant="outline"
                  className="w-full border-white bg-white text-blue-800 hover:bg-gray-100"
                  onClick={() => window.location.href = "tel:+919000000000"}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now
                </Button>
              </Card>
            </ScrollAnimate>
          </div>
        </div>
      </div>
    </div>
  );
}

