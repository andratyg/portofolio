"use client"

import React, { useEffect, useRef, useState } from 'react';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  fallback?: React.ReactNode;
  minHeight?: string | number;
}

export const AnimateOnScroll = ({ 
  children, 
  delay = 0.1,
  duration = 0.4,
  className,
  fallback = null,
  minHeight = '300px',
}: AnimateOnScrollProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion preference or instant SSR
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsNearViewport(true);
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          // Trigger smooth entry transition
          requestAnimationFrame(() => {
            setIsVisible(true);
          });
          observer.unobserve(el);
        }
      },
      { threshold: 0.01, rootMargin: '350px 0px 350px 0px' } // Pre-load 350px before entering viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        minHeight,
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${duration}s ease ${delay}s`,
      }}
    >
      {isNearViewport ? children : fallback}
    </div>
  );
};
