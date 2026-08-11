"use client"

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export const SplashScreen = () => {
  const [phase, setPhase] = useState<'loading' | 'reveal' | 'done'>('loading');

  useEffect(() => {
    // Check if already shown this session
    if (sessionStorage.getItem('splash-shown')) {
      setPhase('done');
      return;
    }

    const timer1 = setTimeout(() => setPhase('reveal'), 1800);
    const timer2 = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem('splash-shown', 'true');
    }, 2600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[10000] flex items-center justify-center bg-background",
        "transition-all duration-700 ease-in-out",
        phase === 'reveal' && "opacity-0 scale-110"
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
      </div>

      {/* Logo */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated NAT logo */}
        <div
          className={cn(
            "relative transition-all duration-1000 ease-out",
            phase === 'loading' ? "scale-100 opacity-100" : "scale-150 opacity-0"
          )}
        >
          <div className="text-7xl sm:text-8xl font-black text-primary tracking-tight">
            {'NAT'.split('').map((char, i) => (
              <span
                key={i}
                className="inline-block animate-in fade-in slide-in-from-bottom-8 duration-500"
                style={{ animationDelay: `${i * 150 + 200}ms`, animationFillMode: 'both' }}
              >
                {char}
              </span>
            ))}
          </div>
          {/* Underline animation */}
          <div
            className="h-1 bg-gradient-to-r from-primary to-primary/40 rounded-full mt-2 transition-all duration-700 ease-out"
            style={{
              width: phase === 'loading' ? '100%' : '0%',
              transitionDelay: '500ms',
            }}
          />
        </div>

        {/* Loading bar */}
        <div
          className={cn(
            "w-40 h-0.5 bg-muted/30 rounded-full overflow-hidden transition-opacity duration-300",
            phase === 'reveal' && "opacity-0"
          )}
        >
          <div
            className="h-full bg-primary rounded-full"
            style={{
              animation: 'splash-fill 1.5s ease-in-out forwards',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes splash-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};
