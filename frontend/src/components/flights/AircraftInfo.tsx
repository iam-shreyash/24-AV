import { Plane } from "lucide-react";

type AircraftInfoProps = {
  flightName?: string | null;
  manufacturer?: string | null;
  model?: string | null;
};

export default function AircraftInfo({
  flightName,
  manufacturer,
  model,
}: AircraftInfoProps) {
  return (
    <div className="rounded-lg border border-muted bg-muted/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Plane className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          {flightName && (
            <h3 className="font-heading text-lg font-semibold text-foreground">
              {flightName}
            </h3>
          )}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {manufacturer && (
              <span className="font-medium">{manufacturer}</span>
            )}
            {manufacturer && model && (
              <span className="text-muted-foreground/50">•</span>
            )}
            {model && <span>{model}</span>}
          </div>
          {!flightName && !manufacturer && !model && (
            <p className="text-sm text-muted-foreground">
              Aircraft details not available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

