import * as React from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Dialog({ open, onOpenChange, title, description, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog */}
      <Card className="relative z-50 w-full max-w-md mx-4 p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
            {description && (
              <p className="font-body text-sm text-muted-foreground mt-2">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </Card>
    </div>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
}

export function DialogContent({ children }: DialogContentProps) {
  return <div className="mt-4">{children}</div>;
}

interface DialogFooterProps {
  children: React.ReactNode;
}

export function DialogFooter({ children }: DialogFooterProps) {
  return <div className="flex gap-3 justify-end mt-6">{children}</div>;
}

