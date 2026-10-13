"use client"

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/providers/ThemeContext';

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
    const isHoverable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isHoverable && !isReducedMotion) setIsDesktop(true);
  }, []);

  // Step 2: attach listeners once DOM elements exist (isDesktop triggers re-render → refs are populated)
  useEffect(() => {
    if (!isDesktop) return;

    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let raf: number = 0;
    let isDirty = false; // Only animate ring when mouse has moved
    let isScrolling = false;
    let scrollTimer: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling = false;
      }, 90);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isDirty = true;

      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        cursor.style.opacity = '1';
        ring.style.opacity = '1';
      }

      // Dot follows instantly
      cursor.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;

      // Restart ring RAF if it was stopped
      if (!raf) {
        raf = requestAnimationFrame(animateRing);
      }
    };

    // Ring follows with smooth lag — stops itself when settled
    const animateRing = () => {
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      ringX += dx * 0.15;
      ringY += dy * 0.15;

      const isLiquid = theme === 'liquid';
      const size = isHoveringRef.current ? (isLiquid ? 54 : 60) : (isLiquid ? 34 : 40);
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      
      if (isLiquid) {
        ring.style.backgroundColor = isHoveringRef.current ? 'rgba(255, 255, 255, 0.72)' : 'rgba(255, 255, 255, 0.42)';
        // Avoid GPU framebuffer re-sampling on every moving frame:
        ring.style.backdropFilter = 'none';
        (ring.style as any).webkitBackdropFilter = 'none';
        ring.style.borderColor = 'rgba(255, 255, 255, 0.95)';
        ring.style.boxShadow = isHoveringRef.current
          ? '0 8px 25px rgba(0, 122, 255, 0.28), inset 0 1.5px 1px white'
          : '0 4px 14px rgba(0, 122, 255, 0.16), inset 0 1px 1px white';
      } else {
        ring.style.backgroundColor = 'transparent';
        ring.style.backdropFilter = 'none';
        (ring.style as any).webkitBackdropFilter = 'none';
        ring.style.boxShadow = 'none';
        ring.style.borderColor = isHoveringRef.current
          ? 'rgba(255,255,255,0.8)'
          : 'rgba(255,255,255,0.5)';
      }
      ring.style.transform = `translate(${ringX - size / 2}px, ${ringY - size / 2}px)`;

      // Stop RAF when ring has caught up (within 0.5px)
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && !isDirty) {
        raf = 0;
        return;
      }
      isDirty = false;
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
    let particlesRaf: number = 0;
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
        window.addEventListener('resize', resizeCanvas, { passive: true });
        
        // Spawn particles based on theme
        const spawnParticles = (x: number, y: number) => {
          if (theme === 'light' || theme === 'dark') return; // No particles
          if (particles.length >= 18) return; // Keep total active particles light
          
          let color = '';
          let maxLife = 35;
          let vyBoost = 0;

          if (theme === 'imlek') {
            color = `rgba(255, 215, 0, ${Math.random()})`;
            maxLife = 26;
          } else if (theme === 'ramadan') {
            color = `rgba(158, 255, 158, ${Math.random()})`;
            maxLife = 36;
          } else if (theme === 'natal') {
            color = `rgba(255, 255, 255, ${Math.random()})`;
            maxLife = 36;
          } else if (theme === 'catppuccin') {
            color = Math.random() > 0.4
              ? `rgba(179, 77, 14, ${Math.random() * 0.75 + 0.25})`
              : `rgba(95, 63, 39, ${Math.random() * 0.65 + 0.25})`;
            maxLife = 28;
            vyBoost = -0.4;
          } else if (theme === 'sunset') {
            const sunsetColors = [
              `rgba(247, 147, 30, ${Math.random() * 0.75 + 0.25})`,
              `rgba(253, 200, 48, ${Math.random() * 0.75 + 0.25})`,
              `rgba(247, 82, 107, ${Math.random() * 0.65 + 0.25})`,
            ];
            color = sunsetColors[Math.floor(Math.random() * sunsetColors.length)];
            maxLife = 30;
            vyBoost = -0.35;
          } else if (theme === 'liquid') {
            const liquidColors = [
              `rgba(0, 122, 255, ${Math.random() * 0.70 + 0.30})`,
              `rgba(88, 86, 214, ${Math.random() * 0.65 + 0.25})`,
              `rgba(255, 45, 85, ${Math.random() * 0.55 + 0.25})`,
              `rgba(0, 199, 190, ${Math.random() * 0.60 + 0.25})`,
            ];
            color = liquidColors[Math.floor(Math.random() * liquidColors.length)];
            maxLife = 28;
            vyBoost = -0.3;
          } else {
            return;
          }
          
          // Spawn 1 micro particle per movement
          particles.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * (theme === 'imlek' ? 3 : 1.5),
            vy: (Math.random() - 0.5) * 1.5 + (theme === 'natal' ? 0.8 : vyBoost),
            life: 1,
            maxLife,
            size: (theme === 'catppuccin' || theme === 'sunset') ? Math.random() * 1.4 + 0.8 : Math.random() * 1.6 + 0.8,
            color
          });

          // Kick off RAF loop only when particles exist
          if (!particlesRaf) {
            particlesRaf = requestAnimationFrame(animateParticles);
          }
        };

        let lastSpawnX = -100;
        let lastSpawnY = -100;

        const onCanvasMouseMove = (e: MouseEvent) => {
          if (isScrolling) return; // Skip spawning during active scrolling to free CPU

          const dx = e.clientX - lastSpawnX;
          const dy = e.clientY - lastSpawnY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Only spawn if mouse moved at least 8px to prevent clumping
          if (dist > 8) {
            spawnParticles(e.clientX, e.clientY);
            lastSpawnX = e.clientX;
            lastSpawnY = e.clientY;
          }
        };

        window.addEventListener('mousemove', onCanvasMouseMove, { passive: true });

        // Animation Loop — strictly runs only when active particles exist
        const animateParticles = () => {
          if (document.hidden) {
            particlesRaf = requestAnimationFrame(animateParticles);
            return;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (particles.length === 0) {
            particlesRaf = 0; // STOP RAF completely! No idle CPU/GPU consumption!
            return;
          }

          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life++;
            
            if (theme === 'imlek') {
              p.vy += 0.04;
            } else if (theme === 'ramadan') {
              p.vy -= 0.02;
              p.x += Math.sin(p.life * 0.1) * 0.4;
            } else if (theme === 'catppuccin') {
              p.vy -= 0.03;
              p.x += Math.cos(p.life * 0.08) * 0.25;
            } else if (theme === 'sunset') {
              p.vy -= 0.025;
              p.x += Math.sin(p.life * 0.08) * 0.3;
            } else if (theme === 'liquid') {
              p.vy -= 0.02;
              p.x += Math.sin(p.life * 0.06) * 0.25;
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
        
        return () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mousemove', onCanvasMouseMove);
          window.removeEventListener('scroll', onScroll);
          document.removeEventListener('mouseover', onMouseOver);
          document.removeEventListener('mouseout', onMouseOut);
          window.removeEventListener('resize', resizeCanvas);
          if (raf) cancelAnimationFrame(raf);
          if (particlesRaf) cancelAnimationFrame(particlesRaf);
          clearTimeout(scrollTimer);
        };
      }
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(scrollTimer);
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
        className={`fixed top-0 left-0 z-[9999] pointer-events-none ${theme === 'liquid' ? '' : 'mix-blend-difference'}`}
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: theme === 'liquid' ? '#007AFF' : 'white',
          boxShadow: theme === 'liquid' ? '0 0 10px rgba(0, 122, 255, 0.8), 0 0 2px white' : 'none',
          opacity: 0,
          transform: 'translate(-100px, -100px)',
          transition: 'opacity 0.3s ease',
          willChange: 'transform',
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 z-[9998] pointer-events-none ${theme === 'liquid' ? '' : 'mix-blend-difference'}`}
        style={{
          width: theme === 'liquid' ? 34 : 40,
          height: theme === 'liquid' ? 34 : 40,
          borderRadius: '50%',
          border: theme === 'liquid' ? '1.5px solid rgba(0, 122, 255, 0.65)' : '1.5px solid rgba(255,255,255,0.5)',
          backgroundColor: theme === 'liquid' ? 'rgba(255, 255, 255, 0.20)' : 'transparent',
          boxShadow: theme === 'liquid' ? '0 0 14px rgba(0, 122, 255, 0.22), inset 0 0 0 1px rgba(255, 255, 255, 0.85)' : 'none',
          backdropFilter: theme === 'liquid' ? 'blur(3px)' : 'none',
          WebkitBackdropFilter: theme === 'liquid' ? 'blur(3px)' : 'none',
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
