"use client";

import React, { useEffect, useState, useRef } from 'react';
import { m as motion } from 'framer-motion';

export default function NatalDecorations() {
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

    const particles: {x: number, y: number, r: number, vx: number, vy: number, opacity: number}[] = [];
    const count = Math.min(100, Math.floor(window.innerWidth * window.innerHeight / 12000));
    
    for(let i=0; i<count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.5 + 0.3
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        // Repulsion logic (mouse repel)
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.x -= (dx / dist) * force * 3;
          p.y -= (dy / dist) * force * 3;
        }

        p.x += p.vx;
        p.y += p.vy;
        
        // Reset if out of bounds
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(255,255,255,0.8)';
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

  // String Lights
  const StringLight = ({ left, color, delay }: { left: string; color: string; delay: number }) => (
    <motion.div
      className="absolute top-0 flex flex-col items-center pointer-events-none"
      style={{ left }}
      animate={prefersReducedMotion ? {} : { opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay }}
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
      {!prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      )}
    </div>
  );
}
