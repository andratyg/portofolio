"use client";

import React, { useEffect, useState, useRef } from 'react';

export default function LiquidGlassDecorations() {
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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize, { passive: true });
    resize();

    // ── Ambient Mesh Blobs ──────────────────────────────────────────────
    // 3 large radial gradient blobs that orbit slowly around different centers
    const blobs = [
      {
        cx: 0.25, cy: 0.3, // orbit center (relative to canvas)
        radius: 320,
        color: [6, 182, 212],   // cyan-500
        opacity: 0.12,
        orbitRadius: 80,
        speed: 0.0003,
        angle: 0,
      },
      {
        cx: 0.7, cy: 0.2,
        radius: 380,
        color: [124, 58, 237],  // violet-600
        opacity: 0.10,
        orbitRadius: 100,
        speed: 0.00025,
        angle: Math.PI * 0.7,
      },
      {
        cx: 0.5, cy: 0.75,
        radius: 350,
        color: [99, 102, 241],  // indigo-500
        opacity: 0.09,
        orbitRadius: 90,
        speed: 0.00035,
        angle: Math.PI * 1.4,
      },
    ];

    // ── Floating Dust Particles ─────────────────────────────────────────
    interface DustParticle {
      x: number; y: number;
      vx: number; vy: number;
      size: number;
      opacity: number;
      color: number[]; // RGB
    }

    const dustParticles: DustParticle[] = [];
    const dustColors = [
      [6, 182, 212],   // cyan
      [139, 92, 246],  // violet
      [99, 102, 241],  // indigo
      [255, 255, 255], // white
    ];

    for (let i = 0; i < 22; i++) {
      dustParticles.push({
        x: Math.random() * (canvas.width || 1920),
        y: Math.random() * (canvas.height || 1080),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.8 + 0.5,
        opacity: Math.random() * 0.2 + 0.08,
        color: dustColors[Math.floor(Math.random() * dustColors.length)],
      });
    }

    // ── Render Loop ─────────────────────────────────────────────────────
    const render = (timestamp: number) => {
      rafId = requestAnimationFrame(render);

      // FPS throttle
      const elapsed = timestamp - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = timestamp - (elapsed % fpsInterval);

      // Pause when tab inactive
      if (document.hidden) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Draw ambient blobs
      for (const blob of blobs) {
        blob.angle += blob.speed;
        const bx = blob.cx * w + Math.cos(blob.angle) * blob.orbitRadius;
        const by = blob.cy * h + Math.sin(blob.angle) * blob.orbitRadius;

        const gradient = ctx.createRadialGradient(bx, by, 0, bx, by, blob.radius);
        gradient.addColorStop(0, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, ${blob.opacity})`);
        gradient.addColorStop(0.5, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, ${blob.opacity * 0.4})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(bx - blob.radius, by - blob.radius, blob.radius * 2, blob.radius * 2);
      }

      // Draw floating dust
      for (const p of dustParticles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.opacity})`;
        ctx.fill();
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, [isEligible]);

  if (!isEligible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
      style={{ opacity: 0.85 }}
    />
  );
}
