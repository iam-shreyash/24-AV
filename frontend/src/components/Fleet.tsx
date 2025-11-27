import { Plane, Sparkles, Users, Zap } from "lucide-react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

type Jet = {
  id: string;
  name: string;
  manufacturer: string;
  capacity: number;
  rangeNm: number;
  maxSpeed: number;
  imageUrl: string;
  description: string;
};

const jets: Jet[] = [
  {
    id: "cj3",
    name: "Citation CJ3+",
    manufacturer: "Cessna",
    capacity: 7,
    rangeNm: 2040,
    maxSpeed: 417,
    imageUrl:
      "https://images.pexels.com/photos/358220/pexels-photo-358220.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Light jet perfect for short to medium range flights with exceptional fuel efficiency."
  },
  {
    id: "g450",
    name: "Gulfstream G450",
    manufacturer: "Gulfstream",
    capacity: 14,
    rangeNm: 4350,
    maxSpeed: 516,
    imageUrl:
      "https://images.pexels.com/photos/46148/aircraft-jet-landing-cloud-46148.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Ultra-long range business jet offering unmatched comfort and performance."
  },
  {
    id: "legacy650",
    name: "Legacy 650E",
    manufacturer: "Embraer",
    capacity: 13,
    rangeNm: 3900,
    maxSpeed: 470,
    imageUrl:
      "https://images.pexels.com/photos/912050/pexels-photo-912050.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Large cabin jet with impressive range and spacious interior for extended flights."
  },
  {
    id: "g650",
    name: "Gulfstream G650",
    manufacturer: "Gulfstream",
    capacity: 19,
    rangeNm: 7000,
    maxSpeed: 516,
    imageUrl:
      "https://images.pexels.com/photos/261090/pexels-photo-261090.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Flagship ultra-long range jet with the longest range in business aviation."
  },
  {
    id: "global7500",
    name: "Global 7500",
    manufacturer: "Bombardier",
    capacity: 19,
    rangeNm: 7700,
    maxSpeed: 516,
    imageUrl:
      "https://images.pexels.com/photos/358220/pexels-photo-358220.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "World's longest range business jet with four living spaces and exceptional comfort."
  },
  {
    id: "challenger350",
    name: "Challenger 350",
    manufacturer: "Bombardier",
    capacity: 10,
    rangeNm: 3200,
    maxSpeed: 459,
    imageUrl:
      "https://images.pexels.com/photos/46148/aircraft-jet-landing-cloud-46148.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Super mid-size jet combining performance, comfort, and efficiency."
  },
  {
    id: "phenom300",
    name: "Phenom 300",
    manufacturer: "Embraer",
    capacity: 9,
    rangeNm: 1981,
    maxSpeed: 453,
    imageUrl:
      "https://images.pexels.com/photos/912050/pexels-photo-912050.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Light jet with the best performance in its class and modern avionics."
  },
  {
    id: "hawker4000",
    name: "Hawker 4000",
    manufacturer: "Hawker Beechcraft",
    capacity: 12,
    rangeNm: 3300,
    maxSpeed: 460,
    imageUrl:
      "https://images.pexels.com/photos/261090/pexels-photo-261090.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Super mid-size jet with composite construction for enhanced performance."
  }
];

export default function Fleet() {
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
          <div className="mb-12 text-center">
            <Badge className="mx-auto mb-4 flex w-fit items-center gap-2 bg-primary/10 text-primary shadow-lg">
              <Sparkles className="h-4 w-4" />
              Our Premium Fleet
            </Badge>
            <h1 className="font-heading text-4xl font-bold md:text-5xl">
              Explore Our
              <span className="mt-2 block bg-gradient-to-r from-primary via-[var(--primary-glow)] to-accent bg-clip-text text-transparent">
                Private Jet Fleet
              </span>
            </h1>
            <p className="mt-4 font-body text-lg text-muted-foreground">
              Discover our curated collection of luxury private jets, each offering unparalleled comfort and performance.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {jets.map((jet) => (
              <Card
                key={jet.id}
                className="group overflow-hidden border-2 bg-gradient-to-b from-card to-card/50 shadow-xl transition-all hover:-translate-y-2 hover:border-primary/20 hover:shadow-2xl"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  <img
                    src={jet.imageUrl}
                    alt={jet.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-accent text-accent-foreground shadow-lg">{jet.manufacturer}</Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-2xl font-bold text-foreground">{jet.name}</h3>
                  <p className="mt-2 font-body text-sm text-muted-foreground">{jet.description}</p>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-body text-xs text-muted-foreground">Capacity</p>
                        <p className="font-heading text-sm font-semibold">{jet.capacity} passengers</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-accent" />
                      <div>
                        <p className="font-body text-xs text-muted-foreground">Range</p>
                        <p className="font-heading text-sm font-semibold">{jet.rangeNm.toLocaleString()} nm</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-warning" />
                      <div>
                        <p className="font-body text-xs text-muted-foreground">Max Speed</p>
                        <p className="font-heading text-sm font-semibold">{jet.maxSpeed} kts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="w-full justify-center">
                        Available
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

