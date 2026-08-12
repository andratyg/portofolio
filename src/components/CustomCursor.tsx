"use client"

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeContext';

export const CustomCursor = () => {
  const { theme } = useTheme();
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const hasMovedRef = useRef(false);
  const isHoveringRef = useRef(false);

  // Step 1: detect pointer device (only toggles visibility, no ref access)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (mql.matches) setIsDesktop(true);
  }, []);

  // Step 2: attach listeners once DOM elements exist (isDesktop triggers re-render → refs are populated)
  useEffect(() => {
    if (!isDesktop) return;

    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let raf: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        cursor.style.opacity = '1';
        ring.style.opacity = '1';
      }

      // Dot follows instantly
      cursor.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    };

    // Ring follows with smooth lag
    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      const scale = isHoveringRef.current ? 1.8 : 1;
      const size = isHoveringRef.current ? 60 : 40;
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.borderColor = isHoveringRef.current
        ? 'rgba(255,255,255,0.8)'
        : 'rgba(255,255,255,0.5)';
      ring.style.transform = `translate(${ringX - size / 2}px, ${ringY - size / 2}px) scale(${scale})`;
      raf = requestAnimationFrame(animateRing);
    };

    // Track hover on interactive elements via delegation
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, textarea, select, [data-cursor-hover]')) {
        isHoveringRef.current = true;
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.relatedTarget as HTMLElement | null;
      if (!target || !target.closest('a, button, [role="button"], input, textarea, select, [data-cursor-hover]')) {
        isHoveringRef.current = false;
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });
    raf = requestAnimationFrame(animateRing);
    
    // --- CANVAS PARTICLES LOGIC ---
    let particlesRaf: number;
    let particles: {x: number, y: number, vx: number, vy: number, life: number, maxLife: number, size: number, color: string}[] = [];
    const canvas = canvasRef.current;
    
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const resizeCanvas = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Spawn particles based on theme
        const spawnParticles = (x: number, y: number) => {
          if (theme === 'light' || theme === 'dark') return; // No particles
          
          let color = '';
          if (theme === 'imlek') color = `rgba(255, 215, 0, ${Math.random()})`; // Gold sparks
          else if (theme === 'ramadan') color = `rgba(158, 255, 158, ${Math.random()})`; // Green/Gold glow
          else if (theme === 'natal') color = `rgba(255, 255, 255, ${Math.random()})`; // White snow
          
          // Spawn 1-2 particles per frame when moving
          for (let i = 0; i < (Math.random() > 0.5 ? 1 : 2); i++) {
            particles.push({
              x: x + (Math.random() - 0.5) * 10,
              y: y + (Math.random() - 0.5) * 10,
              vx: (Math.random() - 0.5) * (theme === 'imlek' ? 4 : 2),
              vy: (Math.random() - 0.5) * 2 + (theme === 'natal' ? 1 : 0), // Snow falls down slightly
              life: 1,
              maxLife: theme === 'imlek' ? 30 : 50,
              size: Math.random() * (theme === 'imlek' ? 2 : 3) + 1,
              color
            });
          }
        };

        let lastSpawnX = -100;
        let lastSpawnY = -100;

        const animateParticles = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Spawn if mouse moved sufficiently to avoid clumping
          const dist = Math.hypot(mouseX - lastSpawnX, mouseY - lastSpawnY);
          if (dist > 5 && (theme === 'imlek' || theme === 'ramadan' || theme === 'natal')) {
            spawnParticles(mouseX, mouseY);
            lastSpawnX = mouseX;
            lastSpawnY = mouseY;
          }

          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life++;
            
            if (theme === 'imlek') {
              p.vy += 0.05; // Gravity for sparks
            } else if (theme === 'ramadan') {
              p.vy -= 0.02; // Float up for magic glow
              p.x += Math.sin(p.life * 0.1) * 0.5;
            }

            const opacity = 1 - (p.life / p.maxLife);
            if (opacity <= 0) {
              particles.splice(i, 1);
              continue;
            }

            ctx.globalAlpha = opacity;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          particlesRaf = requestAnimationFrame(animateParticles);
        };
        animateParticles();
        
        return () => {
          window.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseover', onMouseOver);
          document.removeEventListener('mouseout', onMouseOut);
          window.removeEventListener('resize', resizeCanvas);
          cancelAnimationFrame(raf);
          cancelAnimationFrame(particlesRaf);
        };
      }
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      cancelAnimationFrame(raf);
    };
  }, [isDesktop, theme]);

  if (!isDesktop) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9997]"
      />
      {/* Dot — hidden until mouse has moved */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'white',
          opacity: 0,
          transform: 'translate(-100px, -100px)',
          transition: 'opacity 0.3s ease',
          willChange: 'transform',
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9998] pointer-events-none mix-blend-difference"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.5)',
          opacity: 0,
          transform: 'translate(-100px, -100px)',
          transition: 'opacity 0.3s ease, border-color 0.3s ease',
          willChange: 'transform',
        }}
      />
      {/* Hide default cursor via CSS */}
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          *, *::before, *::after { cursor: none !important; }
        }
      `}</style>
    </>
  );
};
