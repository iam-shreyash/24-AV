import { ArrowRight, Plane, Users } from "lucide-react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export interface FlightCardProps {
  from: string;
  to: string;
  date: string;
  time: string;
  operator: string;
  planeModel: string;
  availableSeats: number;
  price: number;
  isEmptyLeg?: boolean;
}

export default function FlightCard({
  from,
  to,
  date,
  time,
  operator,
  planeModel,
  availableSeats,
  price,
  isEmptyLeg = true
}: FlightCardProps) {
  return (
    <Card className="group border-l-4 border-l-primary/50 bg-gradient-to-r from-card to-card/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-l-primary hover:shadow-2xl">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="animate-pulse bg-accent text-accent-foreground shadow-md">
              {isEmptyLeg ? "Empty-Leg Flight" : "Full Flight"}
            </Badge>
            {availableSeats <= 3 && (
              <Badge variant="destructive" className="bg-warning text-white shadow-md">
                Only {availableSeats} seats left!
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="font-heading text-2xl font-bold">{from}</div>
              <div className="text-sm text-muted-foreground">{time}</div>
            </div>
            <div className="flex flex-1 flex-col items-center">
              <ArrowRight className="h-6 w-6 text-primary" />
              <div className="mt-1 text-xs text-muted-foreground">Direct</div>
            </div>
            <div className="text-center">
              <div className="font-heading text-2xl font-bold">{to}</div>
              <div className="text-sm text-muted-foreground">{date}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Plane className="h-4 w-4" />
              <span>{planeModel}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{availableSeats} seats available</span>
            </div>
            <div className="text-sm font-medium">Operator: {operator}</div>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between border-l pl-6 md:min-w-[200px]">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Starting from</div>
            <div className="font-heading text-3xl font-bold text-primary">
              Rs. {price.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-muted-foreground">per seat</div>
            <div className="mt-1 text-xs font-medium text-accent">Save 60%</div>
          </div>

          <Button
            size="lg"
            className="w-full bg-accent text-accent-foreground shadow-lg transition-all hover:scale-105 hover:bg-accent/90 hover:shadow-xl"
          >
            View Details &rarr;
          </Button>
        </div>
      </div>
    </Card>
  );
}


