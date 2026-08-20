"use client";

import React, { useEffect, useState, useRef } from 'react';
import { m as motion } from 'framer-motion';

export default function RamadanDecorations() {
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
    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const particles: {x: number, y: number, size: number, baseX: number, baseY: number, speed: number, angle: number}[] = [];
    const count = Math.min(30, Math.floor(window.innerWidth * window.innerHeight / 20000));
    
    for(let i=0; i<count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseX: Math.random() * canvas.width,
        baseY: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.02 + 0.01,
        angle: Math.random() * Math.PI * 2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        // Natural floating movement
        p.angle += p.speed;
        p.baseX += Math.sin(p.angle) * 0.5;
        p.baseY -= Math.cos(p.angle) * 0.5;

        // Wrap around screen
        if (p.baseY < -50) p.baseY = canvas.height + 50;
        if (p.baseY > canvas.height + 50) p.baseY = -50;
        if (p.baseX < -50) p.baseX = canvas.width + 50;
        if (p.baseX > canvas.width + 50) p.baseX = -50;

        // Spring back to base position
        p.x += (p.baseX - p.x) * 0.05;
        p.y += (p.baseY - p.y) * 0.05;

        // Repulsion logic (mouse repel)
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.x -= (dx / dist) * force * 5;
          p.y -= (dy / dist) * force * 5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(253, 224, 71, ${0.4 + Math.sin(p.angle * 2) * 0.3})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(253, 224, 71, 0.8)';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      rafId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  // Fanous (Ramadan Lantern)
  const Fanous = ({ delay, left, scale }: { delay: number; left: string; scale: number }) => (
    <motion.div
      className="absolute top-0 flex flex-col items-center z-0 origin-top pointer-events-none"
      style={{ left, transform: `scale(${scale})` }}
      animate={prefersReducedMotion ? {} : { opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div className="w-0.5 h-16 bg-yellow-600/60" />
      <div className="w-12 h-20 bg-emerald-900/40 backdrop-blur-sm rounded-t-full border-2 border-yellow-500/80 shadow-[0_0_15px_rgba(234,179,8,0.3)] flex items-center justify-center relative overflow-hidden">
         {/* Candle glow */}
         <motion.div 
           className="w-4 h-6 rounded-full bg-yellow-300 blur-md absolute bottom-2"
           animate={prefersReducedMotion ? {} : { opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9] }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: delay * 0.5 }}
         />
         <div className="absolute inset-0 border-x border-yellow-500/30 mx-3 rounded-t-full" />
      </div>
      <div className="w-16 h-3 bg-yellow-600/80 rounded-b-md" />
      <div className="w-6 h-4 bg-yellow-700/80 rounded-b-full mt-0.5" />
    </motion.div>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Crescent Moon background */}
      <svg className="absolute top-10 right-10 w-32 md:w-48 opacity-10 text-yellow-500" viewBox="0 0 100 100">
        <path fill="currentColor" d="M50 0A50 50 0 1 0 100 50 35 35 0 1 1 50 0Z" />
      </svg>
      
      {/* Lanterns */}
      <Fanous delay={0} left="15%" scale={0.8} />
      <Fanous delay={1} left="35%" scale={0.6} />
      <Fanous delay={0.5} left="80%" scale={1} />
      
      {/* Glowing Dust / Fireflies (Canvas) */}
      {!prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      )}
    </div>
  );
}
