"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Section 2.3 — Page transition wrapper.
 * Pure CSS opacity + translateY animation on mount. No framer-motion dependency.
 */

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = "" }: PageTransitionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger on next frame so the initial styles are painted first
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 250ms ease-out, transform 250ms ease-out",
      }}
    >
      {children}
    </div>
  );
}
