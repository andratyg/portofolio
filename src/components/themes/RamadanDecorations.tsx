"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function RamadanDecorations() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Fanous (Ramadan Lantern)
  const Fanous = ({ delay, left, scale }: { delay: number; left: string; scale: number }) => (
    <motion.div
      className="absolute top-0 flex flex-col items-center z-0 origin-top pointer-events-none"
      style={{ left, transform: `scale(${scale})` }}
      animate={prefersReducedMotion ? {} : { opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div className="w-0.5 h-16 bg-yellow-600/60" />
      <div className="w-12 h-20 bg-emerald-900/40 backdrop-blur-sm rounded-t-full border-2 border-yellow-500/80 shadow-[0_0_15px_rgba(234,179,8,0.3)] flex items-center justify-center relative overflow-hidden">
         {/* Candle glow */}
         <motion.div 
           className="w-4 h-6 rounded-full bg-yellow-300 blur-md absolute bottom-2"
           animate={prefersReducedMotion ? {} : { opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9] }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: delay * 0.5 }}
         />
         <div className="absolute inset-0 border-x border-yellow-500/30 mx-3 rounded-t-full" />
      </div>
      <div className="w-16 h-3 bg-yellow-600/80 rounded-b-md" />
      <div className="w-6 h-4 bg-yellow-700/80 rounded-b-full mt-0.5" />
    </motion.div>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Crescent Moon background */}
      <svg className="absolute top-10 right-10 w-32 md:w-48 opacity-10 text-yellow-500" viewBox="0 0 100 100">
        <path fill="currentColor" d="M50 0A50 50 0 1 0 100 50 35 35 0 1 1 50 0Z" />
      </svg>
      
      {/* Lanterns */}
      <Fanous delay={0} left="15%" scale={0.8} />
      <Fanous delay={1} left="35%" scale={0.6} />
      <Fanous delay={0.5} left="80%" scale={1} />
      
      {/* Glowing Dust / Fireflies */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0">
          {Array.from({ length: 25 }).map((_, i) => {
            const left = `${Math.random() * 100}%`;
            const top = `${Math.random() * 100}%`;
            const duration = 5 + Math.random() * 10;
            const delay = Math.random() * -10;
            const size = 1 + Math.random() * 3;
            
            return (
              <div
                key={i}
                className="absolute bg-yellow-200 rounded-full"
                style={{
                  left,
                  top,
                  width: size,
                  height: size,
                  animation: `ramadanFloat ${duration}s ease-in-out ${delay}s infinite`,
                  boxShadow: '0 0 6px rgba(253, 224, 71, 0.8)',
                }}
              />
            );
          })}
          <style>{`
            @keyframes ramadanFloat {
              0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
              25% { transform: translate(10px, -20px) scale(1.2); opacity: 0.8; }
              50% { transform: translate(-5px, -40px) scale(0.8); opacity: 0.4; }
              75% { transform: translate(-15px, -15px) scale(1.1); opacity: 0.7; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
