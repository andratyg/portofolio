
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
        // This calculation ensures the progress is linear from 0 to 1
        const scrollProgress = scrollTop / docHeight;
        setProgress(scrollProgress);
      }
      
      setIsVisible(scrollTop > 300);
    };

    // We add a listener for load and resize to handle dynamic content
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll); // Recalculate on resize
    window.addEventListener('load', handleScroll); // Recalculate when page is fully loaded

    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('load', handleScroll);
    };
  }, []);

  const isAtBottom = progress >= 1;
  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1)); // Cap progress at 1 for the SVG

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={cn(
        'fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full shadow-lg border-border/10 flex items-center justify-center transition-all duration-300 ease-in-out',
        'hover:scale-110 active:scale-95',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none',
        {
          'bg-primary': isAtBottom,
          'bg-card/80 backdrop-blur-sm border': !isAtBottom,
        }
      )}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
          className="absolute inset-0 transform -rotate-90"
          width="64" 
          height="64"
          viewBox="0 0 44 44"
        >
          <circle
            cx="22" cy="22" r="20"
            strokeWidth="3"
            className="stroke-border/30 transition-opacity"
            style={{ opacity: isAtBottom ? 0 : 1 }}
            fill="none"
          />
          {/* The ring now updates without CSS transition for direct mapping */}
          <circle
            cx="22" cy="22" r="20"
            strokeWidth="3"
            className="stroke-primary"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <ArrowUp 
          className={cn(
            'h-8 w-8 transition-colors duration-300',
            {
              'text-white': isAtBottom,
              'text-primary': !isAtBottom,
            }
          )} 
        />
      </div>
    </button>
  );
};
