"use client"
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ParticleCanvasProps {
  className?: string;
  density?: number; // default 20000
}

export const ParticleCanvas = ({ className, density = 20000 }: ParticleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let particleRaf: number;
    let lastFrameTime = 0;
    const fpsInterval = 1000 / 30; // Cap to 30 FPS

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const isMobile = window.innerWidth < 640;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    const maxParticles = isMobile ? 15 : 45;
    const count = Math.min(maxParticles, Math.floor((canvas.width * canvas.height) / density));
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.4),
        vy: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.4),
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.2,
      });
    }

    const drawParticles = (timestamp: number) => {
      particleRaf = requestAnimationFrame(drawParticles);

      const elapsed = timestamp - lastFrameTime;
      if (elapsed < fpsInterval) return;
      lastFrameTime = timestamp - (elapsed % fpsInterval);

      if (document.hidden) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      if (currentTheme !== 'light' && currentTheme !== 'dark') return;

      const isDarkTheme = currentTheme === 'dark';
      const rgbArgs = isDarkTheme ? '255, 255, 255' : '34, 38, 42';

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgbArgs}, ${p.opacity * (isDarkTheme ? 1.0 : 0.8)})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 14400) { // 120 * 120
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${rgbArgs}, ${0.15 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        }
      });
    };

    particleRaf = requestAnimationFrame(drawParticles);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(particleRaf);
    };
  }, [density]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <canvas ref={canvasRef} className={cn("absolute inset-0 w-full h-full", className)} />
    </div>
  );
};
