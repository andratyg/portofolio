"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function NatalDecorations() {
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

  // String Lights
  const StringLight = ({ left, color, delay }: { left: string; color: string; delay: number }) => (
    <motion.div
      className="absolute top-0 flex flex-col items-center pointer-events-none"
      style={{ left }}
      animate={prefersReducedMotion ? {} : { opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div className="w-0.5 h-6 bg-green-900/50" />
      <div className="w-2 h-2 bg-green-800 rounded-sm" />
      <div 
        className="w-4 h-6 rounded-full blur-[1px]"
        style={{ 
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`
        }} 
      />
    </motion.div>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* String Lights Wire */}
      <svg className="absolute top-0 left-0 w-full h-16 opacity-30 text-green-900" preserveAspectRatio="none" viewBox="0 0 100 10">
        <path fill="transparent" stroke="currentColor" strokeWidth="0.5" d="M0,0 Q10,10 20,0 T40,0 T60,0 T80,0 T100,0" />
      </svg>
      
      {/* Individual Lights */}
      <StringLight delay={0} left="10%" color="#ef4444" />
      <StringLight delay={0.5} left="20%" color="#eab308" />
      <StringLight delay={0.2} left="30%" color="#3b82f6" />
      <StringLight delay={0.8} left="40%" color="#22c55e" />
      <StringLight delay={0.1} left="50%" color="#ef4444" />
      <StringLight delay={0.6} left="60%" color="#eab308" />
      <StringLight delay={0.3} left="70%" color="#3b82f6" />
      <StringLight delay={0.9} left="80%" color="#22c55e" />
      <StringLight delay={0.4} left="90%" color="#ef4444" />
      
      {/* Snowfall */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0">
          {Array.from({ length: 40 }).map((_, i) => {
            const left = `${Math.random() * 100}%`;
            const duration = 15 + Math.random() * 25;
            const delay = Math.random() * -25;
            const size = 2 + Math.random() * 6;
            const opacity = 0.3 + Math.random() * 0.7;
            
            return (
              <div
                key={i}
                className="absolute top-[-5%] bg-white rounded-full"
                style={{
                  left,
                  width: size,
                  height: size,
                  opacity,
                  animation: `snowFall ${duration}s linear ${delay}s infinite`,
                  boxShadow: '0 0 4px rgba(255,255,255,0.8)',
                }}
              />
            );
          })}
          <style>{`
            @keyframes snowFall {
              0% { transform: translateY(-10vh) translateX(0px); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(110vh) translateX(20px); opacity: 0; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
