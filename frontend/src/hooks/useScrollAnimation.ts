import { useEffect, useRef, useState } from "react";

type AnimationType = "fade-in" | "slide-left" | "slide-right" | "scale-in";

interface UseScrollAnimationOptions {
  type?: AnimationType;
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  triggerOnce?: boolean;
}

export function useScrollAnimation({
  type = "fade-in",
  threshold = 0.1,
  rootMargin = "0px",
  delay = 0,
  triggerOnce = false
}: UseScrollAnimationOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, delay, triggerOnce]);

  const animationClass = `scroll-${type} ${isVisible ? "visible" : ""}`;

  return { ref: elementRef, className: animationClass, isVisible };
}












