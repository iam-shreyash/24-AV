import { useNavigate } from "react-router-dom";
import { Bookmark, Calendar, Gift } from "lucide-react";

import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ScrollAnimate } from "./ui/ScrollAnimate";

type Offer = {
  id: number;
  category: string;
  title: string;
  description: string;
  promoCode: string;
  validity: string;
  icon: typeof Gift;
};

export default function Offers() {
  const navigate = useNavigate();

  const offers: Offer[] = [
    {
      id: 1,
      category: "First Booking",
      title: "Flat ₹500 off on first booking",
      description: "Welcome aboard! Use code WELCOME500 on your first flight booking",
      promoCode: "WELCOME500",
      validity: "Valid till 31 Dec 2025",
      icon: Gift
    },
    {
      id: 2,
      category: "Seasonal",
      title: "Festive Sale - Up to 20% off",
      description: "Special discount on select domestic routes during festive season",
      promoCode: "FESTIVE20",
      validity: "Limited time offer",
      icon: Gift
    },
    {
      id: 3,
      category: "Recurring",
      title: "Weekend Special",
      description: "Extra 10% off on weekend bookings for travel within India",
      promoCode: "WEEKEND10",
      validity: "Every Friday to Sunday",
      icon: Gift
    },
    {
      id: 4,
      category: "Group",
      title: "Group Booking Discount",
      description: "Book for 4 or more passengers and save up to 15%",
      promoCode: "GROUP15",
      validity: "Ongoing offer",
      icon: Gift
    }
  ];

  const handleBookNow = (offer: Offer) => {
    // Navigate to search page with promo code
    navigate(`/search?promo=${offer.promoCode}`);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Title Section */}
        <ScrollAnimate type="fade-in" threshold={0.2}>
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-heading text-4xl font-bold text-gray-900 md:text-5xl">
              Offers & Discounts
            </h1>
            <p className="font-body text-lg text-gray-600">
              Save more on your next flight with our exclusive deals
            </p>
          </div>
        </ScrollAnimate>

        {/* Offers Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {offers.map((offer, index) => (
            <ScrollAnimate 
              key={offer.id} 
              type="scale-in" 
              delay={index * 100}
              threshold={0.1}
            >
              <Card className="group relative border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                {/* Bookmark Icon */}
                <button className="absolute right-4 top-4 rounded-full p-2 transition-all duration-300 hover:bg-gray-100 hover:scale-110 hover:rotate-12">
                  <Bookmark className="h-5 w-5 text-gray-400 transition-colors hover:text-blue-800" />
                </button>

                {/* Badge */}
                <div className="mb-4">
                  <Badge className="bg-blue-100 text-blue-800">
                    <offer.icon className="mr-1 h-3 w-3" />
                    {offer.category}
                  </Badge>
                </div>

                {/* Offer Title */}
                <h3 className="mb-3 font-heading text-xl font-bold text-gray-900">
                  {offer.title}
                </h3>

                {/* Description */}
                <p className="mb-4 font-body text-sm text-gray-600">
                  {offer.description}
                </p>

                {/* Promo Code */}
                <div className="mb-4">
                  <label className="mb-2 block font-body text-xs font-medium text-gray-700">
                    Promo Code
                  </label>
                  <div 
                    className="flex cursor-pointer items-center justify-between rounded-md border-2 border-dashed border-blue-200 bg-blue-50 px-4 py-3 transition-all duration-300 hover:border-blue-400 hover:bg-blue-100 hover:scale-105 hover:shadow-md"
                    onClick={() => handleCopyCode(offer.promoCode)}
                  >
                    <span className="font-heading text-base font-bold text-blue-800">
                      {offer.promoCode}
                    </span>
                    <span className="font-body text-xs text-blue-800">Click to copy</span>
                  </div>
                </div>

                {/* Validity */}
                <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="font-body">{offer.validity}</span>
                </div>

                {/* Book Now Button */}
                <Button
                  onClick={() => handleBookNow(offer)}
                  className="w-full bg-blue-800 text-white hover:bg-blue-900"
                >
                  Book Now
                </Button>
              </Card>
            </ScrollAnimate>
          ))}
        </div>
      </div>
    </div>
  );
}

