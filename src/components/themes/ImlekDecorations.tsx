"use client";

import React, { useEffect, useState, useRef } from 'react';
import { m as motion } from 'framer-motion';

export default function ImlekDecorations() {
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
    window.addEventListener('resize', resize, { passive: true });
    resize();

    const particles: {x: number, y: number, size: number, vx: number, vy: number, angle: number, rotSpeed: number}[] = [];
    const count = Math.min(25, Math.floor(window.innerWidth * window.innerHeight / 25000));
    
    for(let i=0; i<count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: Math.random() * 1.2 + 0.8,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08
      });
    }

    const animate = (timestamp: number) => {
      rafId = requestAnimationFrame(animate);

      const elapsed = timestamp - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = timestamp - (elapsed % fpsInterval);

      if (document.hidden) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 100) {
          const force = (100 - dist) / 100;
          p.x -= (dx / dist) * force * 2;
          p.y -= (dy / dist) * force * 2;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.rotSpeed;
        
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.8)';
        ctx.fillRect(-p.size/2, -p.size, p.size, p.size * 2);
        ctx.restore();
      });
    };
    
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, [isEligible]);

  // Lantern component
  const Lantern = ({ delay, left, scale }: { delay: number; left: string; scale: number }) => (
    <motion.div
      className="absolute top-0 flex flex-col items-center z-0 origin-top pointer-events-none"
      style={{ left, transform: `scale(${scale})` }}
      animate={!isEligible ? {} : { rotate: [-3, 3, -3] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div className="w-0.5 h-12 bg-yellow-600/80" />
      <div className="w-16 h-20 bg-red-600 rounded-2xl border-4 border-yellow-500 shadow-xl shadow-red-900/50 flex items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 border-x border-yellow-500/30 rounded-full mx-2" />
         <div className="w-8 h-8 rounded-full bg-yellow-500/20 blur-md" />
      </div>
      <div className="w-6 h-2 bg-yellow-500" />
      <div className="w-full flex justify-center gap-0.5 mt-1">
         <div className="w-0.5 h-6 bg-red-500/80" />
         <div className="w-0.5 h-8 bg-red-500/80" />
         <div className="w-0.5 h-6 bg-red-500/80" />
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Cloud ornaments top corners */}
      <svg className="absolute top-0 left-0 w-32 md:w-64 opacity-20 text-yellow-500" viewBox="0 0 100 100">
        <path fill="currentColor" d="M0,0 L100,0 C100,20 80,40 50,40 C30,40 10,60 0,100 Z" />
      </svg>
      <svg className="absolute top-0 right-0 w-32 md:w-64 opacity-20 text-yellow-500" viewBox="0 0 100 100">
        <path fill="currentColor" d="M100,0 L0,0 C0,20 20,40 50,40 C70,40 90,60 100,100 Z" />
      </svg>
      
      {/* Lanterns */}
      <Lantern delay={0} left="10%" scale={0.8} />
      <Lantern delay={1.5} left="25%" scale={0.5} />
      <Lantern delay={0.5} left="85%" scale={0.9} />
      <Lantern delay={2} left="70%" scale={0.6} />

      {/* Gold Particles (Canvas) */}
      {isEligible && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      )}
    </div>
  );
}
