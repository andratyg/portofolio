"use client"
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ParticleCanvasProps {
  className?: string;
  density?: number; // default 10000
}

export const ParticleCanvas = ({ className, density = 10000 }: ParticleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particleRaf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    const count = Math.min(120, Math.floor(canvas.width * canvas.height / density));
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2 + 1, // bigger size
        opacity: Math.random() * 0.6 + 0.4, // higher base opacity
      });
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      
      // Only show particles in light and dark mode. Skip rendering in seasonal themes.
      if (currentTheme !== 'light' && currentTheme !== 'dark') {
        particleRaf = requestAnimationFrame(drawParticles);
        return;
      }

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
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) { // increased range
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const lineOpacity = 0.25 * (1 - dist / 140) * (isDarkTheme ? 1.8 : 1.2);
            ctx.strokeStyle = `rgba(${rgbArgs}, ${lineOpacity})`;
            ctx.lineWidth = isDarkTheme ? 1.0 : 0.8;
            ctx.stroke();
          }
        }
      });
      particleRaf = requestAnimationFrame(drawParticles);
    };
    drawParticles();

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
