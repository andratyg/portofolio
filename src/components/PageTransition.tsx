"use client"

import React from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={false}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
          },
        }}
        exit={{ 
          opacity: 0, 
          y: -8,
          transition: {
            duration: 0.25,
            ease: 'easeIn',
          },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
