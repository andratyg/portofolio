"use client";

import React, { useEffect, useState, useRef } from 'react';

export default function SakuraDecorations() {
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
    const fpsInterval = 1000 / 30; // Cap to 30 FPS for ultra-low CPU

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

    interface Petal {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      swing: number;
      swingSpeed: number;
      flip: number;
      flipSpeed: number;
      color: string;
      colorGrad: string;
    }

    const petals: Petal[] = [];
    const count = Math.min(32, Math.floor(window.innerWidth * window.innerHeight / 32000));
    const petalColors = [
      { base: '255, 140, 175', grad: '255, 200, 220' }, // Vibrant Sakura
      { base: '255, 110, 155', grad: '255, 180, 205' }, // Deep Rose Pink
      { base: '255, 175, 195', grad: '255, 230, 240' }, // Pale Blossom
      { base: '250, 160, 185', grad: '255, 215, 230' }, // Soft Twilight Petal
    ];
    
    for (let i = 0; i < count; i++) {
      const col = petalColors[i % petalColors.length];
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 8 + 6,
        vx: Math.random() * 0.7 + 0.3,
        vy: Math.random() * 1.1 + 0.7,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.025,
        opacity: Math.random() * 0.4 + 0.45,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.025 + 0.015,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: Math.random() * 0.03 + 0.02,
        color: col.base,
        colorGrad: col.grad,
      });
    }

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      // Realistic 3D tumbling by scaling along the local axis
      const flipScale = Math.cos(p.flip);
      ctx.scale(1, Math.max(0.15, Math.abs(flipScale)));

      const grad = ctx.createLinearGradient(0, -p.size, 0, p.size);
      grad.addColorStop(0, `rgba(${p.colorGrad}, ${p.opacity})`);
      grad.addColorStop(1, `rgba(${p.color}, ${p.opacity * 0.85})`);
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      // Left curve with subtle notch
      ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.6, p.size * 0.9, p.size * 0.4, 0, p.size);
      // Right curve
      ctx.bezierCurveTo(-p.size * 0.9, p.size * 0.4, -p.size * 0.8, -p.size * 0.6, 0, -p.size);
      ctx.fill();

      // Subtle translucent vein line
      ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity * 0.35})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.8);
      ctx.lineTo(0, p.size * 0.6);
      ctx.stroke();

      ctx.restore();
    };

    const animate = (timestamp: number) => {
      rafId = requestAnimationFrame(animate);

      const elapsed = timestamp - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = timestamp - (elapsed % fpsInterval);

      if (document.hidden) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      petals.forEach(p => {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          const force = (100 - dist) / 100;
          p.x -= (dx / dist) * force * 2;
          p.y -= (dy / dist) * force * 2;
        }

        p.swing += p.swingSpeed;
        p.flip += p.flipSpeed;
        p.x += p.vx + Math.sin(p.swing) * 0.9;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        
        if (p.y > canvas.height + 25) {
          p.y = -25;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 25) p.x = -25;
        if (p.x < -25) p.x = canvas.width + 25;

        drawPetal(p);
      });
    };
    
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, [isEligible]);

  if (!isEligible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />
    </div>
  );
}
