import { useState } from "react";
import { Input } from "../ui/input";
import { DollarSign } from "lucide-react";

type SeatButtonProps = {
  seatId: string;
  label: string;
  x: number;
  y: number;
  isSelected: boolean;
  price?: number;
  onToggle: (seatId: string) => void;
  onPriceChange: (seatId: string, price: number) => void;
};

export default function SeatButton({
  seatId,
  label,
  x,
  y,
  isSelected,
  price,
  onToggle,
  onPriceChange
}: SeatButtonProps) {
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [priceValue, setPriceValue] = useState(price?.toString() || "");

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const numPrice = parseFloat(priceValue);
    if (!isNaN(numPrice) && numPrice > 0) {
      onPriceChange(seatId, numPrice);
      setShowPriceInput(false);
    }
  };

  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)"
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(seatId)}
        className={`
          relative w-12 h-12 rounded-lg transition-all duration-200
          flex items-center justify-center text-xs font-semibold
          ${isSelected 
            ? "bg-primary/20 border-2 border-primary text-primary shadow-lg shadow-primary/30 scale-110" 
            : "bg-muted/50 border-2 border-muted-foreground/30 text-muted-foreground hover:bg-muted/70 hover:scale-105"
          }
        `}
        title={label}
      >
        {label.split(" ")[1]}
      </button>
      
      {isSelected && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-32 z-10">
          {showPriceInput ? (
            <form onSubmit={handlePriceSubmit} onClick={(e) => e.stopPropagation()}>
              <div className="bg-background border border-primary rounded-lg p-2 shadow-lg">
                <div className="flex items-center gap-1 mb-1">
                  <DollarSign className="h-3 w-3 text-primary" />
                  <Input
                    type="number"
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="h-7 text-xs px-2"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    type="submit"
                    className="flex-1 text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Set
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPriceInput(false);
                    }}
                    className="flex-1 text-xs bg-muted text-muted-foreground px-2 py-1 rounded hover:bg-muted/80"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-background border border-primary rounded-lg p-2 shadow-lg text-center">
              {price ? (
                <div>
                  <p className="text-xs font-semibold text-primary">${price.toFixed(2)}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPriceInput(true);
                    }}
                    className="text-xs text-muted-foreground hover:text-primary mt-1"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPriceInput(true);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Set Price
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}









