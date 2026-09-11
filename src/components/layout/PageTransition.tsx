"use client"

import React from 'react';
import { usePathname } from 'next/navigation';

/**
 * Lightweight page transition — no framer-motion on initial render.
 * Uses CSS only for the fade-in so the server HTML is immediately visible (SSR).
 * Framer-motion AnimatePresence only activates on subsequent client navigations.
 */
export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState(pathname);

  React.useEffect(() => {
    if (pathname !== currentPath) {
      setIsNavigating(true);
      // Small delay to allow exit animation, then render new page
      const timer = setTimeout(() => {
        setCurrentPath(pathname);
        setIsNavigating(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, currentPath]);

  return (
    <div
      style={{
        opacity: isNavigating ? 0 : 1,
        transform: isNavigating ? 'translateY(-4px)' : 'none',
        transition: 'opacity 0.25s ease-in, transform 0.25s ease-in',
      }}
    >
      {children}
    </div>
  );
};
