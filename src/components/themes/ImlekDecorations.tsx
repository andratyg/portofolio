"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ImlekDecorations() {
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

  // Lantern component
  const Lantern = ({ delay, left, scale }: { delay: number; left: string; scale: number }) => (
    <motion.div
      className="absolute top-0 flex flex-col items-center z-0 origin-top pointer-events-none"
      style={{ left, transform: `scale(${scale})` }}
      animate={prefersReducedMotion ? {} : { rotate: [-3, 3, -3] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div className="w-0.5 h-12 bg-yellow-600/80" />
      <div className="w-16 h-20 bg-red-600 rounded-2xl border-4 border-yellow-500 shadow-xl shadow-red-900/50 flex items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 border-x border-yellow-500/30 rounded-full mx-2" />
         <div className="w-8 h-8 rounded-full bg-yellow-500/20 blur-md" />
      </div>
      <div className="w-6 h-2 bg-yellow-500" />
      <div className="w-full flex justify-center gap-0.5 mt-1">
         <div className="w-0.5 h-6 bg-red-500/80" />
         <div className="w-0.5 h-8 bg-red-500/80" />
         <div className="w-0.5 h-6 bg-red-500/80" />
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Cloud ornaments top corners */}
      <svg className="absolute top-0 left-0 w-32 md:w-64 opacity-20 text-yellow-500" viewBox="0 0 100 100">
        <path fill="currentColor" d="M0,0 L100,0 C100,20 80,40 50,40 C30,40 10,60 0,100 Z" />
      </svg>
      <svg className="absolute top-0 right-0 w-32 md:w-64 opacity-20 text-yellow-500" viewBox="0 0 100 100">
        <path fill="currentColor" d="M100,0 L0,0 C0,20 20,40 50,40 C70,40 90,60 100,100 Z" />
      </svg>
      
      {/* Lanterns */}
      <Lantern delay={0} left="10%" scale={0.8} />
      <Lantern delay={1.5} left="25%" scale={0.5} />
      <Lantern delay={0.5} left="85%" scale={0.9} />
      <Lantern delay={2} left="70%" scale={0.6} />

      {/* Gold Particles */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => {
            const left = `${Math.random() * 100}%`;
            const duration = 10 + Math.random() * 20;
            const delay = Math.random() * -20;
            const size = 3 + Math.random() * 5;
            
            return (
              <div
                key={i}
                className="absolute top-[-5%] bg-yellow-400 rounded-sm opacity-60"
                style={{
                  left,
                  width: size,
                  height: size * 1.5,
                  animation: `imlekFall ${duration}s linear ${delay}s infinite`,
                  boxShadow: '0 0 8px rgba(250, 204, 21, 0.6)',
                }}
              />
            );
          })}
          <style>{`
            @keyframes imlekFall {
              0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
              10% { opacity: 0.6; }
              90% { opacity: 0.6; }
              100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
