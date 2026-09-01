"use client";

import React, { useEffect, useState, useRef } from 'react';

export default function AstralDecorations() {
  const [isEligible, setIsEligible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isMobile && !prefersReducedMotion) {
      setIsEligible(true);
    }
  }, []);

  useEffect(() => {
    if (!isEligible) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let lastTime = 0;
    const fpsInterval = 1000 / 30; // 30 FPS cap for minimal power consumption

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize, { passive: true });
    resize();

    interface Star {
      x: number;
      y: number;
      size: number;
      alpha: number;
      alphaSpeed: number;
      color: string;
      isCross: boolean;
      rot: number;
      rotSpeed: number;
    }

    const stars: Star[] = [];
    const count = Math.min(50, Math.floor(window.innerWidth * window.innerHeight / 24000));
    
    for (let i = 0; i < count; i++) {
      const isGold = Math.random() > 0.45;
      const isCross = Math.random() > 0.65; // 35% are 4-point sparkling stars
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: isCross ? Math.random() * 5 + 4 : Math.random() * 2 + 1,
        alpha: Math.random() * 0.7 + 0.2,
        alphaSpeed: (Math.random() * 0.02 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
        color: isGold ? '255, 209, 60' : '42, 209, 255',
        isCross,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.01,
      });
    }

    const drawCrossStar = (s: Star) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.fillStyle = `rgba(${s.color}, ${s.alpha})`;

      // 4-point star diamond path
      ctx.beginPath();
      const r = s.size;
      const inner = r * 0.2;
      ctx.moveTo(0, -r);
      ctx.lineTo(inner, -inner);
      ctx.lineTo(r, 0);
      ctx.lineTo(inner, inner);
      ctx.lineTo(0, r);
      ctx.lineTo(-inner, inner);
      ctx.lineTo(-r, 0);
      ctx.lineTo(-inner, -inner);
      ctx.closePath();
      ctx.fill();

      // Soft center glowing core
      ctx.beginPath();
      ctx.arc(0, 0, inner, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * 0.9})`;
      ctx.fill();

      ctx.restore();
    };

    const animate = (timestamp: number) => {
      rafId = requestAnimationFrame(animate);

      const elapsed = timestamp - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = timestamp - (elapsed % fpsInterval);

      if (document.hidden) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(s => {
        s.alpha += s.alphaSpeed;
        if (s.alpha > 0.95 || s.alpha < 0.1) {
          s.alphaSpeed *= -1;
        }
        s.rot += s.rotSpeed;

        if (s.isCross) {
          drawCrossStar(s);
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${s.color}, ${s.alpha})`;
          ctx.fill();
        }
      });
    };
    
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, [isEligible]);

  if (!isEligible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />
    </div>
  );
}
