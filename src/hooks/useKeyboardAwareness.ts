import { useState, useEffect, useCallback, useRef } from "react";

export interface KeyboardState {
  keyboardHeight: number;
  isKeyboardOpen: boolean;
  scrollToFocusedElement: (element?: HTMLElement | null) => void;
  searchContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function useKeyboardAwareness(): KeyboardState {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const resizeTimerRef = useRef<any>(null);

  const scrollToFocusedElement = useCallback((element?: HTMLElement | null) => {
    const target = element || searchContainerRef.current;
    if (!target) return;

    // Small delay to let Android browser window.visualViewport update after keyboard animation
    setTimeout(() => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }, 150);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkViewport = () => {
      if (!window.visualViewport) {
        // Fallback for older browsers
        return;
      }

      const visualHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      const offsetTop = window.visualViewport.offsetTop || 0;
      
      // Calculate true keyboard height using visual viewport metrics
      const diff = windowHeight - (visualHeight + offsetTop);

      if (diff > 120) {
        setKeyboardHeight(Math.round(diff));
        setIsKeyboardOpen(true);
        // Ensure active element is scrolled into view when keyboard opens
        if (document.activeElement instanceof HTMLElement) {
          scrollToFocusedElement(document.activeElement);
        }
      } else {
        setKeyboardHeight(0);
        setIsKeyboardOpen(false);
      }
    };

    const handleResize = () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
      resizeTimerRef.current = setTimeout(checkViewport, 50);
    };

    const handleScroll = () => {
      checkViewport();
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Initial check
    checkViewport();

    return () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [scrollToFocusedElement]);

  return {
    keyboardHeight,
    isKeyboardOpen,
    scrollToFocusedElement,
    searchContainerRef,
  };
}
