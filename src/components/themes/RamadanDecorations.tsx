"use client";

import React, { useEffect, useState, useRef } from 'react';
import { m as motion } from 'framer-motion';

export default function RamadanDecorations() {
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
    const fpsInterval = 1000 / 30; // 30 FPS cap


    let isScrolling = false;
    let scrollTimer: ReturnType<typeof setTimeout>;

    const pauseCanvas = () => { if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } };
    const resumeCanvas = () => { if (!rafId) rafId = requestAnimationFrame(animate); };

    const onScroll = () => {
      if (!isScrolling) pauseCanvas();
      isScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => { isScrolling = false; resumeCanvas(); }, 150);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize, { passive: true });
    resize();

    const particles: {x: number, y: number, size: number, baseX: number, baseY: number, speed: number, angle: number}[] = [];
    const count = Math.min(8, Math.floor(window.innerWidth * window.innerHeight / 80000));
    
    for(let i=0; i<count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseX: Math.random() * canvas.width,
        baseY: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.015 + 0.005,
        angle: Math.random() * Math.PI * 2
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
        // Simple float drift — no Math.sqrt, no spring-back
        p.angle += p.speed;
        p.x += Math.sin(p.angle) * 0.4;
        p.y -= Math.cos(p.angle) * 0.3;

        // Wrap
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;

        const alpha = 0.4 + Math.sin(p.angle * 2) * 0.25;
        // Soft outer halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(253, 224, 71, ${alpha * 0.20})`;
        ctx.fill();
        // Core ember
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(253, 224, 71, ${alpha})`;
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

  // Fanous (Ramadan Lantern)
  const Fanous = ({ delay, left, scale, className = "" }: { delay: number; left: string; scale: number; className?: string }) => (
    <motion.div
      className={`absolute top-0 flex flex-col items-center z-0 origin-top pointer-events-none ${className}`}
      style={{ left, transform: `scale(${scale})` }}
      animate={!isEligible ? {} : { opacity: [0.75, 1, 0.75] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay, repeatType: 'reverse' as const }}  
    >
      <div className="w-0.5 h-16 bg-yellow-600/60" />
      <div className="w-12 h-20 bg-emerald-900/40 backdrop-blur-sm rounded-t-full border-2 border-yellow-500/80 shadow-[0_0_15px_rgba(234,179,8,0.3)] flex items-center justify-center relative overflow-hidden">
         {/* Candle glow */}
         <motion.div 
           className="w-4 h-6 rounded-full bg-yellow-300 blur-md absolute bottom-2"
           animate={!isEligible ? {} : { opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9] }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: delay * 0.5 }}
         />
         <div className="absolute inset-0 border-x border-yellow-500/30 mx-3 rounded-t-full" />
      </div>
      <div className="w-16 h-3 bg-yellow-600/80 rounded-b-md" />
      <div className="w-6 h-4 bg-yellow-700/80 rounded-b-full mt-0.5" />
    </motion.div>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden" aria-hidden="true">
      {/* Crescent Moon background */}
      <svg className="absolute top-10 right-10 w-32 md:w-48 opacity-10 text-yellow-500" viewBox="0 0 100 100">
        <path fill="currentColor" d="M50 0A50 50 0 1 0 100 50 35 35 0 1 1 50 0Z" />
      </svg>
      
      {/* Lanterns */}
      <Fanous delay={0} left="12%" scale={0.75} />
      <Fanous delay={1} left="35%" scale={0.55} className="hidden sm:flex" />
      <Fanous delay={0.5} left="82%" scale={0.85} />
      
      {/* Glowing Dust / Fireflies (Canvas - Desktop Only, 30 FPS) */}
      {isEligible && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      )}
    </div>
  );
}
