import { ReactNode } from "react";
import { useScrollAnimation, type AnimationType } from "../../hooks/useScrollAnimation";
import { cn } from "../../lib/utils";

interface ScrollAnimateProps {
  children: ReactNode;
  type?: AnimationType;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  triggerOnce?: boolean;
}

export function ScrollAnimate({
  children,
  type = "fade-in",
  className,
  threshold = 0.1,
  rootMargin = "0px",
  delay = 0,
  triggerOnce = true
}: ScrollAnimateProps) {
  const { ref, className: animationClass } = useScrollAnimation({
    type,
    threshold,
    rootMargin,
    delay,
    triggerOnce
  });

  return (
    <div ref={ref} className={cn(animationClass, className)}>
      {children}
    </div>
  );
}












