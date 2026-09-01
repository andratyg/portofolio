"use client";

import React, { useEffect, useState, useRef } from 'react';

export default function AstralDecorations() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    interface Star {
      x: number;
      y: number;
      size: number;
      alpha: number;
      alphaSpeed: number;
      color: string;
    }

    const stars: Star[] = [];
    const count = Math.min(60, Math.floor(window.innerWidth * window.innerHeight / 18000));
    
    for (let i = 0; i < count; i++) {
      const isGold = Math.random() > 0.4;
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.8 + 0.2,
        alphaSpeed: (Math.random() * 0.02 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
        color: isGold ? '255, 209, 102' : '76, 201, 240',
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(s => {
        s.alpha += s.alphaSpeed;
        if (s.alpha > 0.95 || s.alpha < 0.15) {
          s.alphaSpeed *= -1;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color}, ${s.alpha})`;
        ctx.shadowBlur = s.size > 2 ? 8 : 4;
        ctx.shadowColor = `rgba(${s.color}, 0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      rafId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />
    </div>
  );
}
