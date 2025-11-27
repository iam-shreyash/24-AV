import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

type Step = {
  number: number;
  label: string;
};

type StepperProps = {
  steps: Step[];
  currentStep: number;
  className?: string;
};

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    isActive
                      ? "bg-blue-800 border-blue-800 text-white"
                      : isCompleted
                        ? "bg-blue-100 border-blue-800 text-blue-800"
                        : "bg-white border-gray-300 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="font-heading font-semibold">{step.number}</span>
                  )}
                </div>
                {/* Step Label */}
                <span
                  className={cn(
                    "mt-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-blue-800 font-semibold"
                      : isCompleted
                        ? "text-gray-700"
                        : "text-gray-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 transition-colors",
                    isCompleted ? "bg-blue-800" : "bg-gray-300"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


