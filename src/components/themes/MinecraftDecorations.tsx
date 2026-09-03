"use client";

import React, { useEffect, useState, useRef } from 'react';

export default function MinecraftDecorations() {
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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize, { passive: true });
    resize();

    // --- Falling Voxel Dust ---
    interface VoxelDust {
      x: number;
      y: number;
      size: number;
      vy: number;
      vx: number;
      rotation: number;
      rotSpeed: number;
      opacity: number;
      color: string;
    }

    const particles: VoxelDust[] = [];
    const count = Math.min(24, Math.floor(window.innerWidth * window.innerHeight / 40000));
    const voxelColors = [
      '#5D8C3F', // Grass green
      '#8B6914', // Dirt brown
      '#6B6B6B', // Stone gray
      '#4FC3F7', // Diamond blue
      '#3E7A28', // Dark leaf green
      '#FF5722', // Redstone orange
    ];
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 4,
        vy: Math.random() * 0.6 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        rotation: Math.random() * Math.PI * 0.5,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.35 + 0.25,
        color: voxelColors[Math.floor(Math.random() * voxelColors.length)],
      });
    }

    // --- Iconic Minecraft Characters & Items ---
    // Types: 'steve', 'creeper', 'enderman', 'pickaxe', 'sword'
    type IconicType = 'steve' | 'creeper' | 'enderman' | 'pickaxe' | 'sword';

    interface IconicEntity {
      x: number;
      y: number;
      baseY: number;
      size: number;
      type: IconicType;
      vx: number;
      vy: number;
      floatPhase: number;
      floatSpeed: number;
      opacity: number;
    }

    const iconics: IconicEntity[] = [];
    const entityTypes: IconicType[] = ['creeper', 'steve', 'enderman', 'pickaxe', 'sword'];
    const entityCount = Math.min(6, Math.max(4, Math.floor(canvas.width / 280)));

    for (let i = 0; i < entityCount; i++) {
      const startY = Math.random() * (canvas.height * 0.75) + 60;
      iconics.push({
        x: (canvas.width / (entityCount + 1)) * (i + 1) + (Math.random() - 0.5) * 60,
        y: startY,
        baseY: startY,
        size: Math.random() * 8 + 32, // 32-40px clearly recognizable
        type: entityTypes[i % entityTypes.length],
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        floatPhase: Math.random() * Math.PI * 2,
        floatSpeed: Math.random() * 0.02 + 0.01,
        opacity: Math.random() * 0.12 + 0.18, // 0.18 - 0.30 opacity for crisp yet subtle visibility
      });
    }

    // Draw Steve Head (Blocky 8x8 pixels)
    const drawSteveHead = (x: number, y: number, size: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      const px = size / 8;

      // Skin base
      ctx.fillStyle = '#C68662';
      ctx.fillRect(-size / 2, -size / 2, size, size);

      // Hair (Dark brown top & sides)
      ctx.fillStyle = '#4A3222';
      ctx.fillRect(-size / 2, -size / 2, size, px * 2); // Top hair
      ctx.fillRect(-size / 2, -size / 2 + px * 2, px, px * 2); // Left sideburn
      ctx.fillRect(size / 2 - px, -size / 2 + px * 2, px, px * 2); // Right sideburn
      ctx.fillRect(-size / 2 + px * 2, -size / 2 + px * 2, px * 4, px); // Forehead bang

      // Eyes (White outer, purple/blue inner pupil)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-size / 2 + px, -size / 2 + px * 4, px * 2, px); // Left eye white
      ctx.fillRect(size / 2 - px * 3, -size / 2 + px * 4, px * 2, px); // Right eye white
      ctx.fillStyle = '#3F4DA0';
      ctx.fillRect(-size / 2 + px * 2, -size / 2 + px * 4, px, px); // Left pupil
      ctx.fillRect(size / 2 - px * 2, -size / 2 + px * 4, px, px); // Right pupil

      // Nose / Mouth (Beard)
      ctx.fillStyle = '#8A583A';
      ctx.fillRect(-size / 2 + px * 3, -size / 2 + px * 5, px * 2, px); // Nose
      ctx.fillStyle = '#3F2516';
      ctx.fillRect(-size / 2 + px * 2, -size / 2 + px * 6, px * 4, px); // Beard / mouth

      // Border outline for voxel look
      ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.4})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(-size / 2, -size / 2, size, size);

      ctx.restore();
    };

    // Draw Creeper Face (8x8 pixel grid on grass green block)
    const drawCreeperFace = (x: number, y: number, size: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      const px = size / 8;

      // Green block head base
      ctx.fillStyle = '#4CA638';
      ctx.fillRect(-size / 2, -size / 2, size, size);

      // Distinctive Black Creeper mouth & eye markings
      ctx.fillStyle = '#1A1A1A';
      // Left eye (2x2)
      ctx.fillRect(-size / 2 + px, -size / 2 + px * 2, px * 2, px * 2);
      // Right eye (2x2)
      ctx.fillRect(size / 2 - px * 3, -size / 2 + px * 2, px * 2, px * 2);
      // Top bridge of mouth (2x1)
      ctx.fillRect(-size / 2 + px * 3, -size / 2 + px * 4, px * 2, px);
      // Middle mouth (4x2)
      ctx.fillRect(-size / 2 + px * 2, -size / 2 + px * 5, px * 4, px * 2);
      // Bottom outer chin drops (1x2 on each side)
      ctx.fillRect(-size / 2 + px * 2, -size / 2 + px * 7, px, px);
      ctx.fillRect(size / 2 - px * 3, -size / 2 + px * 7, px, px);

      // Border outline
      ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.4})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(-size / 2, -size / 2, size, size);

      ctx.restore();
    };

    // Draw Enderman Head (Deep black head with glowing purple slit eyes)
    const drawEnderman = (x: number, y: number, size: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      const px = size / 8;

      // Charcoal black head
      ctx.fillStyle = '#0F0F14';
      ctx.fillRect(-size / 2, -size / 2, size, size);

      // Glowing Purple Eyes (2px wide, 1px tall)
      ctx.fillStyle = '#D946EF'; // Bright violet/purple
      ctx.shadowColor = '#D946EF';
      ctx.shadowBlur = 8;
      ctx.fillRect(-size / 2 + px, -size / 2 + px * 4, px * 2.5, px);
      ctx.fillRect(size / 2 - px * 3.5, -size / 2 + px * 4, px * 2.5, px);

      // Eye center lighter
      ctx.fillStyle = '#F5D0FE';
      ctx.fillRect(-size / 2 + px * 1.5, -size / 2 + px * 4, px, px);
      ctx.fillRect(size / 2 - px * 2.5, -size / 2 + px * 4, px, px);
      ctx.shadowBlur = 0;

      // Outer outline
      ctx.strokeStyle = `rgba(217, 70, 239, ${alpha * 0.4})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(-size / 2, -size / 2, size, size);

      ctx.restore();
    };

    // Draw Diamond Pickaxe
    const drawPickaxe = (x: number, y: number, size: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      const px = size / 9;

      // Handle (diagonal wooden shaft)
      ctx.fillStyle = '#8B6914';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(-size / 2 + px * (i + 1), size / 2 - px * (i + 3), px, px);
      }

      // Diamond Head (Arced top cyan block)
      ctx.fillStyle = '#4FC3F7';
      ctx.shadowColor = '#4FC3F7';
      ctx.shadowBlur = 4;
      ctx.fillRect(size / 2 - px * 5, -size / 2 + px, px * 2, px);
      ctx.fillRect(size / 2 - px * 4, -size / 2, px * 3, px);
      ctx.fillRect(size / 2 - px * 2, -size / 2 + px, px * 2, px);
      ctx.fillRect(size / 2 - px, -size / 2 + px * 2, px, px * 2);
      ctx.fillRect(-size / 2 + px * 3, -size / 2 + px * 2, px, px * 2);
      ctx.shadowBlur = 0;

      ctx.restore();
    };

    // Draw Diamond Sword
    const drawSword = (x: number, y: number, size: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      const px = size / 10;

      // Diamond Blade (diagonal steps)
      ctx.fillStyle = '#4FC3F7';
      ctx.shadowColor = '#4FC3F7';
      ctx.shadowBlur = 5;
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(-size / 2 + px * (i + 3), -size / 2 + px * (6 - i), px * 1.5, px * 1.5);
      }
      ctx.shadowBlur = 0;

      // Guard
      ctx.fillStyle = '#8B6914';
      ctx.fillRect(-size / 2 + px * 2, size / 2 - px * 4, px * 3, px);
      ctx.fillRect(-size / 2 + px * 4, size / 2 - px * 4, px, px * 3);

      // Pommel / Handle
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(-size / 2 + px * 2, size / 2 - px * 3, px * 1.5, px * 1.5);
      ctx.fillRect(-size / 2 + px, size / 2 - px * 2, px * 1.5, px * 1.5);

      ctx.restore();
    };

    const drawVoxelDust = (p: VoxelDust) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);

      // Highlight edge (top-left)
      ctx.fillStyle = `rgba(255, 255, 255, 0.25)`;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.2);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size * 0.2, p.size);

      // Shadow edge (bottom-right)
      ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
      ctx.fillRect(-p.size / 2, p.size / 2 - p.size * 0.2, p.size, p.size * 0.2);
      ctx.fillRect(p.size / 2 - p.size * 0.2, -p.size / 2, p.size * 0.2, p.size);

      ctx.restore();
    };

    const animate = (timestamp: number) => {
      rafId = requestAnimationFrame(animate);

      const elapsed = timestamp - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = timestamp - (elapsed % fpsInterval);

      if (document.hidden) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Iconic Minecraft Entities
      iconics.forEach(item => {
        item.floatPhase += item.floatSpeed;
        item.x += item.vx;
        item.y = item.baseY + Math.sin(item.floatPhase) * 12;

        // Wrap around horizontally
        if (item.x > canvas.width + 40) item.x = -40;
        if (item.x < -40) item.x = canvas.width + 40;

        switch (item.type) {
          case 'steve':
            drawSteveHead(item.x, item.y, item.size, item.opacity);
            break;
          case 'creeper':
            drawCreeperFace(item.x, item.y, item.size, item.opacity);
            break;
          case 'enderman':
            drawEnderman(item.x, item.y, item.size, item.opacity);
            break;
          case 'pickaxe':
            drawPickaxe(item.x, item.y, item.size, item.opacity);
            break;
          case 'sword':
            drawSword(item.x, item.y, item.size, item.opacity);
            break;
        }
      });

      // 2. Draw Falling Voxel Dust
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.rotSpeed;
        
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.x < -20) p.x = canvas.width + 20;

        drawVoxelDust(p);
      });
    };
    
    rafId = requestAnimationFrame(animate);

    return () => {
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
