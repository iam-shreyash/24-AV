import { useRef, useEffect, useState } from "react";
import SeatButton from "./SeatButton";
import seatLayoutData from "../../data/aircraft-layout.json";

type Seat = {
  seat_id: string;
  label: string;
  x: number;
  y: number;
  type: string;
};

type AircraftLayoutProps = {
  selectedSeats: string[];
  seatPrices: Record<string, number>;
  onSeatToggle: (seatId: string) => void;
  onPriceChange: (seatId: string, price: number) => void;
  defaultPrice?: number;
};

export default function AircraftLayout({
  selectedSeats,
  seatPrices,
  onSeatToggle,
  onPriceChange,
  defaultPrice
}: AircraftLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const seatLayout = seatLayoutData as Array<{seat_id: string; label: string; x: number; y: number; type: string}>;

  // Try to load the aircraft interior image
  // You can replace this path with your actual aircraft interior image
  useEffect(() => {
    const img = new Image();
    let timeoutId: NodeJS.Timeout;
    
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
      if (timeoutId) clearTimeout(timeoutId);
    };
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(false);
      if (timeoutId) clearTimeout(timeoutId);
    };
    
    // Placeholder path - replace with actual image path when available
    // For now, we'll use a gradient background as fallback
    img.src = "/aircraft-interior.png";
    
    // If image doesn't load within 1 second, use fallback
    timeoutId = setTimeout(() => {
      if (!imageLoaded) {
        setImageError(true);
      }
    }, 1000);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleSetAllPrices = () => {
    if (defaultPrice && defaultPrice > 0) {
      selectedSeats.forEach(seatId => {
        if (!seatPrices[seatId]) {
          onPriceChange(seatId, defaultPrice);
        }
      });
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="font-heading text-sm font-semibold mb-1">Select Seats to Sell</h4>
          <p className="text-xs text-muted-foreground">
            Click seats to select/deselect. Selected seats: <span className="font-semibold text-primary">{selectedSeats.length}</span>
          </p>
        </div>
        {defaultPrice && defaultPrice > 0 && selectedSeats.length > 0 && (
          <button
            type="button"
            onClick={handleSetAllPrices}
            className="text-xs text-primary hover:underline"
          >
            Set all to ${defaultPrice.toFixed(2)}
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative w-full bg-muted/20 rounded-lg overflow-hidden border-2 border-primary/20"
        style={{ 
          minHeight: "500px",
          backgroundImage: imageLoaded && !imageError 
            ? "url('/api/placeholder/aircraft-interior.png')" 
            : "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Fallback background pattern if image doesn't load */}
        {(!imageLoaded || imageError) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Aircraft Interior Layout</p>
                  <p className="text-xs text-muted-foreground">
                    {imageError ? "Image not found. Using default layout." : "Loading layout..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Render all seats */}
        {seatLayout.map((seat: Seat) => (
          <SeatButton
            key={seat.seat_id}
            seatId={seat.seat_id}
            label={seat.label}
            x={seat.x}
            y={seat.y}
            isSelected={selectedSeats.includes(seat.seat_id)}
            price={seatPrices[seat.seat_id]}
            onToggle={onSeatToggle}
            onPriceChange={onPriceChange}
          />
        ))}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm border border-primary/20 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/20 border-2 border-primary"></div>
              <span className="text-muted-foreground">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted/50 border-2 border-muted-foreground/30"></div>
              <span className="text-muted-foreground">Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

