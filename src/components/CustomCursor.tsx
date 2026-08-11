"use client"

import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    // Only show custom cursor on desktop with pointer (no touch)
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mql.matches) return;

    setIsVisible(true);

    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let raf: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasMoved) setHasMoved(true);
      // Dot follows instantly
      cursor.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    };

    // Ring follows with smooth lag
    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      const scale = isHovering ? 1.8 : 1;
      ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px) scale(${scale})`;
      raf = requestAnimationFrame(animateRing);
    };

    // Track hover on interactive elements via delegation
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, textarea, select, [data-cursor-hover]')) {
        setIsHovering(true);
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.relatedTarget as HTMLElement | null;
      if (!target || !target.closest('a, button, [role="button"], input, textarea, select, [data-cursor-hover]')) {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });
    raf = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      cancelAnimationFrame(raf);
    };
  }, [isHovering, hasMoved]);

  if (!isVisible) return null;

  return (
    <>
      {/* Dot — hidden until mouse has moved */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'white',
          opacity: hasMoved ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9998] pointer-events-none mix-blend-difference"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.5)',
          opacity: hasMoved ? 1 : 0,
          transition: 'opacity 0.3s ease, width 0.3s ease, height 0.3s ease, border-color 0.3s ease',
          ...(isHovering ? { 
            width: 60, 
            height: 60, 
            borderColor: 'rgba(255,255,255,0.8)',
          } : {}),
        }}
      />
      {/* Hide default cursor via CSS */}
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          *, *::before, *::after { cursor: none !important; }
        }
      `}</style>
    </>
  );
};
