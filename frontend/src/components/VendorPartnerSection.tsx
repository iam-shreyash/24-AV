import { ScrollAnimate } from "./ui/ScrollAnimate";
import { Card } from "./ui/card";
import { Plane, Calendar, Users as UsersIcon, Headphones } from "lucide-react";

const vendorPartnerFeatures = [
  {
    icon: Plane,
    title: "Flight Management",
    description: "Create, edit, and manage your flights effortlessly."
  },
  {
    icon: Calendar,
    title: "Seat Control",
    description: "Update seat availability and pricing anytime."
  },
  {
    icon: UsersIcon,
    title: "Aircraft Showcasing",
    description: "Upload aircraft photos to attract more bookings."
  },
  {
    icon: Headphones,
    title: "Direct Bookings Insight",
    description: "Track passengers and booking details in real time."
  }
];

export default function VendorPartnerSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <ScrollAnimate type="fade-in" threshold={0.2}>
          <div className="mb-12 text-center">
            <h2 className="font-heading text-4xl font-bold text-blue-800 md:text-5xl">Why Partner with 24AV?</h2>
            <p className="mt-4 font-body text-lg text-gray-600">Grow your aviation business with India's most trusted platform.</p>
          </div>
        </ScrollAnimate>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          {vendorPartnerFeatures.map((feature, idx) => (
            <ScrollAnimate key={idx} type="fade-in" delay={idx * 80}>
              <Card className="border border-gray-200 bg-white p-8 text-center rounded-xl shadow transition-shadow hover:shadow-lg">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                  <feature.icon className="h-10 w-10 text-blue-800" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="font-body text-gray-600">{feature.description}</p>
              </Card>
            </ScrollAnimate>
          ))}
        </div>
      </div>
    </section>
  );
}
