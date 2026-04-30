
"use client";

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ScrollProgressButton = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight > 0) {
        const scrollProgress = Math.min(scrollTop / docHeight, 1);
        setProgress(scrollProgress);
      }
      
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAtBottom = progress >= 1;
  const circumference = 2 * Math.PI * 20; // 2 * pi * radius (22-2)
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={cn(
        'fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full shadow-lg border-border/10 flex items-center justify-center transition-all duration-300 ease-in-out',
        'hover:scale-110 active:scale-95',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none',
        {
          'bg-primary': isAtBottom, // Blue background when at bottom
          'bg-card/80 backdrop-blur-sm border': !isAtBottom, // Default card background
        }
      )}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* SVG Container - Always present */}
        <svg
          className="absolute inset-0 transform -rotate-90"
          width="64" 
          height="64"
          viewBox="0 0 44 44"
        >
          {/* Background Circle - Hidden when at bottom */}
          <circle
            cx="22" cy="22" r="20"
            strokeWidth="3"
            className="stroke-border/30 transition-opacity"
            style={{ opacity: isAtBottom ? 0 : 1 }}
            fill="none"
          />
          {/* Foreground (Progress) Circle - Always Blue, with a smoother transition */}
          <circle
            cx="22" cy="22" r="20"
            strokeWidth="3"
            className="stroke-primary transition-stroke-dashoffset duration-500 ease-linear"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Arrow Icon - Always Visible, color changes */}
        <ArrowUp 
          className={cn(
            'h-8 w-8 transition-colors duration-300',
            {
              'text-white': isAtBottom,   // White when at bottom
              'text-primary': !isAtBottom, // Blue when scrolling
            }
          )} 
        />
      </div>
    </button>
  );
};
