"use client";

import React, { useEffect, useState, useRef } from 'react';

export default function CoffeeDecorations() {
  const [isEligible, setIsEligible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile =
      window.innerWidth < 768 ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(max-width: 768px)').matches;
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
    const fpsInterval = 1000 / 30; // 30 FPS cap
    let isScrolling = false;
    let scrollTimer: ReturnType<typeof setTimeout>;

    const pauseCanvas = () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    };
    const resumeCanvas = () => {
      if (!rafId) rafId = requestAnimationFrame(animate);
    };

    const onScroll = () => {
      if (!isScrolling) pauseCanvas();
      isScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling = false;
        resumeCanvas();
      }, 150);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // ~25 warm micro-particles (cinnamon, caramel & roasted coffee bean specks)
    const dustColors = [
      'rgba(179, 77, 14, ',   // Golden caramel crema
      'rgba(95, 63, 39, ',    // Deep cocoa espresso
      'rgba(205, 97, 30, ',   // Spiced cinnamon
      'rgba(160, 95, 40, ',   // Warm hazelnut mocha
    ];

    interface DustParticle {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      baseColor: string;
      alpha: number;
      wobbleOffset: number;
      wobbleSpeed: number;
    }

    const particles: DustParticle[] = [];
    const count = Math.min(10, Math.max(6, Math.floor(window.innerWidth * window.innerHeight / 80000)));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.3 + 0.7, // 0.7 - 2.0px micro-particles
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(Math.random() * 0.35 + 0.2), // Slow upward vertical drift
        baseColor: dustColors[Math.floor(Math.random() * dustColors.length)],
        alpha: Math.random() * 0.35 + 0.2,
        wobbleOffset: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.008,
      });
    }

    const animate = (timestamp: number) => {
      rafId = requestAnimationFrame(animate);

      if (document.hidden) return;

      const elapsed = timestamp - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = timestamp - (elapsed % fpsInterval);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.wobbleOffset += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobbleOffset) * 0.18;
        p.y += p.vy;

        // Wrap around vertically
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -15) p.x = canvas.width + 15;
        if (p.x > canvas.width + 15) p.x = -15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.baseColor}${p.alpha})`;
        ctx.fill();
      });
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(scrollTimer);
    };
  }, [isEligible]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* 1. Warm Bokeh Ambient Light: Soft amber/caramel glow (Hardware-Accelerated Pure Radial Gradient) */}
      <div
        className="absolute top-0 left-1/4 -translate-y-1/2 w-[500px] h-[400px] rounded-full opacity-30 pointer-events-none select-none transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(circle, rgba(200, 155, 110, 0.22) 0%, rgba(160, 110, 70, 0.08) 45%, transparent 70%)',
        }}
      />

      {/* 2. Watermark Latte Art Rosette: Elegant fine-line SVG watermark on the left side */}
      <div className="fixed top-1/4 -left-10 md:left-4 w-52 md:w-72 h-auto text-[#b34d0e] opacity-[0.07] pointer-events-none select-none z-0">
        <svg
          viewBox="0 0 200 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Central stem */}
          <path
            d="M100,230 C100,160 100,60 100,15"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Top heart pour */}
          <path
            d="M100,15 C95,5 82,8 82,18 C82,27 100,40 100,40 C100,40 118,27 118,18 C118,8 105,5 100,15 Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Rosette tiers / leaves along stem */}
          <path d="M100,45 C80,42 65,52 68,62 C70,70 100,75 100,75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M100,45 C120,42 135,52 132,62 C130,70 100,75 100,75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />

          <path d="M100,78 C75,74 58,86 62,98 C65,108 100,112 100,112" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M100,78 C125,74 142,86 138,98 C135,108 100,112 100,112" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />

          <path d="M100,116 C70,110 50,124 55,138 C59,150 100,154 100,154" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M100,116 C130,110 150,124 145,138 C141,150 100,154 100,154" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />

          <path d="M100,158 C65,150 42,168 48,184 C53,198 100,202 100,202" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M100,158 C135,150 158,168 152,184 C147,198 100,202 100,202" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </div>

      {/* 3. Kepulan Uap SVG: Minimalist subtle rising coffee steam wisps at bottom */}
      <div
        className="fixed bottom-0 left-6 md:left-14 w-28 md:w-36 h-40 text-[#b34d0e] opacity-25 pointer-events-none select-none z-0"
        style={{
          animation: 'steamFlow 9s ease-in-out infinite alternate',
        }}
      >
        <svg
          viewBox="0 0 100 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Steam ribbon 1 */}
          <path
            d="M35,160 C30,130 50,105 38,75 C28,50 48,25 40,0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="opacity-70"
          />
          {/* Steam ribbon 2 */}
          <path
            d="M55,160 C65,135 48,110 58,80 C68,52 50,28 60,0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="opacity-50"
          />
          {/* Steam ribbon 3 */}
          <path
            d="M75,160 C70,140 85,120 76,95 C68,70 82,45 74,15"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="opacity-40"
          />
        </svg>
      </div>

      {/* 4. Canvas Partikel Cinnamon Dust: Desktop only, 30 FPS capped */}
      {isEligible && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      )}
    </div>
  );
}
