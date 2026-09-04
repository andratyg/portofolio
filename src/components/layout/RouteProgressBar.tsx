"use client";

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAudioFX } from '@/components/providers/AudioFXContext';

export function RouteProgressBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const { play } = useAudioFX();
  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    // Play subtle navigation feedback and flash progress bar
    play('tab');
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname, play]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent overflow-hidden pointer-events-none">
      <div className="h-full bg-gradient-to-r from-primary via-accent to-primary animate-[route-progress_0.4s_ease-in-out_forwards]" />
      <style jsx>{`
        @keyframes route-progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(-20%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  );
}
