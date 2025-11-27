import * as React from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { Card } from "./card";
import { Button } from "./button";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = React.useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Card
            key={toast.id}
            className={`p-4 min-w-[300px] shadow-lg border ${
              toast.type === "success"
                ? "bg-accent/10 border-accent/50"
                : toast.type === "error"
                ? "bg-destructive/10 border-destructive/50"
                : "bg-primary/10 border-primary/50"
            }`}
          >
            <div className="flex items-start gap-3">
              {toast.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              ) : toast.type === "error" ? (
                <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              ) : null}
              <p
                className={`flex-1 font-body text-sm ${
                  toast.type === "success"
                    ? "text-accent"
                    : toast.type === "error"
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                {toast.message}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 flex-shrink-0"
                onClick={() => removeToast(toast.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

