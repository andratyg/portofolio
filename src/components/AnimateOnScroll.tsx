
"use client"

import { useEffect, useRef } from 'react';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const AnimateOnScroll = ({ 
  children, 
  delay = 0.2,
  duration = 0.5,
  className,
}: AnimateOnScrollProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }

    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = `opacity ${duration}s ease ${delay}s, transform ${duration}s ease ${delay}s`;
    el.style.willChange = 'opacity, transform';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          // Clean up willChange after animation to free compositor resources
          setTimeout(() => { el.style.willChange = 'auto'; }, (duration + delay) * 1000 + 100);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
