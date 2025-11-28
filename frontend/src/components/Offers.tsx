import { useNavigate } from "react-router-dom";
import { Bookmark, Calendar, Gift } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ScrollAnimate } from "./ui/ScrollAnimate";

type Offer = {
  id: number;
  categoryKey: string;
  titleKey: string;
  descriptionKey: string;
  promoCode: string;
  validityKey: string;
  icon: typeof Gift;
};

export default function Offers() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const offers: Offer[] = [
    {
      id: 1,
      categoryKey: "offers.items.first.category",
      titleKey: "offers.items.first.title",
      descriptionKey: "offers.items.first.description",
      promoCode: "WELCOME500",
      validityKey: "offers.items.first.validity",
      icon: Gift
    },
    {
      id: 2,
      categoryKey: "offers.items.seasonal.category",
      titleKey: "offers.items.seasonal.title",
      descriptionKey: "offers.items.seasonal.description",
      promoCode: "FESTIVE20",
      validityKey: "offers.items.seasonal.validity",
      icon: Gift
    },
    {
      id: 3,
      categoryKey: "offers.items.weekend.category",
      titleKey: "offers.items.weekend.title",
      descriptionKey: "offers.items.weekend.description",
      promoCode: "WEEKEND10",
      validityKey: "offers.items.weekend.validity",
      icon: Gift
    },
    {
      id: 4,
      categoryKey: "offers.items.group.category",
      titleKey: "offers.items.group.title",
      descriptionKey: "offers.items.group.description",
      promoCode: "GROUP15",
      validityKey: "offers.items.group.validity",
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
              {t("offers.title")}
            </h1>
            <p className="font-body text-lg text-gray-600">
              {t("offers.subtitle")}
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
                    {t(offer.categoryKey)}
                  </Badge>
                </div>

                {/* Offer Title */}
                <h3 className="mb-3 font-heading text-xl font-bold text-gray-900">
                  {t(offer.titleKey)}
                </h3>

                {/* Description */}
                <p className="mb-4 font-body text-sm text-gray-600">
                  {t(offer.descriptionKey)}
                </p>

                {/* Promo Code */}
                <div className="mb-4">
                  <label className="mb-2 block font-body text-xs font-medium text-gray-700">
                    {t("offers.promoCodeLabel")}
                  </label>
                  <div 
                    className="flex cursor-pointer items-center justify-between rounded-md border-2 border-dashed border-blue-200 bg-blue-50 px-4 py-3 transition-all duration-300 hover:border-blue-400 hover:bg-blue-100 hover:scale-105 hover:shadow-md"
                    onClick={() => handleCopyCode(offer.promoCode)}
                  >
                    <span className="font-heading text-base font-bold text-blue-800">
                      {offer.promoCode}
                    </span>
                    <span className="font-body text-xs text-blue-800">{t("offers.clickToCopy")}</span>
                  </div>
                </div>

                {/* Validity */}
                <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="font-body">{t(offer.validityKey)}</span>
                </div>

                {/* Book Now Button */}
                <Button
                  onClick={() => handleBookNow(offer)}
                  className="w-full bg-blue-800 text-white hover:bg-blue-900"
                >
                  {t("offers.bookNow")}
                </Button>
              </Card>
            </ScrollAnimate>
          ))}
        </div>
      </div>
    </div>
  );
}

