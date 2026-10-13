"use client";

import React, { useEffect, useState, useRef } from 'react';
import { m as motion } from 'framer-motion';

export default function NatalDecorations() {
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

    const particles: {x: number, y: number, r: number, vx: number, vy: number, opacity: number}[] = [];
    const count = Math.min(8, Math.floor(window.innerWidth * window.innerHeight / 80000));
    
    for(let i=0; i<count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: Math.random() * 0.8 + 0.4,
        opacity: Math.random() * 0.4 + 0.3
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
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
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

  // String Lights
  const StringLight = ({ left, color, delay }: { left: string; color: string; delay: number }) => (
    <motion.div
      className="absolute top-0 flex flex-col items-center pointer-events-none"
      style={{ left }}
      animate={!isEligible ? {} : { opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay, repeatType: 'reverse' as const }}  
    >
      <div className="w-0.5 h-6 bg-green-900/50" />
      <div className="w-2 h-2 bg-green-800 rounded-sm" />
      <div 
        className="w-4 h-6 rounded-full blur-[1px]"
        style={{ 
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`
        }} 
      />
    </motion.div>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* String Lights Wire */}
      <svg className="absolute top-0 left-0 w-full h-16 opacity-30 text-green-900" preserveAspectRatio="none" viewBox="0 0 100 10">
        <path fill="transparent" stroke="currentColor" strokeWidth="0.5" d="M0,0 Q10,10 20,0 T40,0 T60,0 T80,0 T100,0" />
      </svg>
      
      {/* Individual Lights */}
      <StringLight delay={0} left="10%" color="#ef4444" />
      <StringLight delay={0.5} left="20%" color="#eab308" />
      <StringLight delay={0.2} left="30%" color="#3b82f6" />
      <StringLight delay={0.8} left="40%" color="#22c55e" />
      <StringLight delay={0.1} left="50%" color="#ef4444" />
      <StringLight delay={0.6} left="60%" color="#eab308" />
      <StringLight delay={0.3} left="70%" color="#3b82f6" />
      <StringLight delay={0.9} left="80%" color="#22c55e" />
      <StringLight delay={0.4} left="90%" color="#ef4444" />
      
      {/* Snowfall (Canvas) */}
      {isEligible && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      )}
    </div>
  );
}
