"use client";

import React, { useEffect, useState, useRef } from 'react';

export default function NarutoDecorations() {
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

    // --- Falling Konoha Autumn & Forest Leaves ---
    interface Leaf {
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
      colorDark: string;
    }

    const leaves: Leaf[] = [];
    const leafCount = Math.min(24, Math.floor(window.innerWidth * window.innerHeight / 40000));
    const leafColors = [
      { base: '34, 197, 94', dark: '22, 160, 74' },     // Konoha leaf green
      { base: '74, 222, 128', dark: '34, 197, 94' },     // Tender sprout green
      { base: '255, 107, 43', dark: '220, 80, 20' },     // Chakra orange
      { base: '255, 167, 38', dark: '239, 108, 0' },     // Warm amber leaf
    ];
    
    for (let i = 0; i < leafCount; i++) {
      const col = leafColors[i % leafColors.length];
      leaves.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 6 + 5,
        vx: Math.random() * 0.6 + 0.2,
        vy: Math.random() * 0.8 + 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.025,
        opacity: Math.random() * 0.35 + 0.3,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.02 + 0.012,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: Math.random() * 0.025 + 0.015,
        color: col.base,
        colorDark: col.dark,
      });
    }

    // --- Iconic Naruto Characters & Ninja Gear ---
    // Types: 'headband', 'kurama', 'shuriken', 'kunai', 'rasengan'
    type NarutoIconic = 'headband' | 'kurama' | 'shuriken' | 'kunai' | 'rasengan';

    interface FloatingNinjaIconic {
      x: number;
      baseY: number;
      size: number;
      type: NarutoIconic;
      vx: number;
      rot: number;
      rotSpeed: number;
      bobPhase: number;
      bobSpeed: number;
      opacity: number;
    }

    const iconics: FloatingNinjaIconic[] = [];
    const ninjaTypes: NarutoIconic[] = ['headband', 'kurama', 'shuriken', 'kunai', 'rasengan'];
    const ninjaCount = Math.min(6, Math.max(4, Math.floor(canvas.width / 260)));

    for (let i = 0; i < ninjaCount; i++) {
      const startY = Math.random() * (canvas.height * 0.72) + 70;
      iconics.push({
        x: (canvas.width / (ninjaCount + 1)) * (i + 1) + (Math.random() - 0.5) * 50,
        baseY: startY,
        size: Math.random() * 6 + 32, // 32-38px
        type: ninjaTypes[i % ninjaTypes.length],
        vx: (Math.random() - 0.5) * 0.2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        bobPhase: Math.random() * Math.PI * 2,
        bobSpeed: Math.random() * 0.02 + 0.012,
        opacity: Math.random() * 0.12 + 0.22, // 0.22 - 0.34
      });
    }

    // 1. Draw Naruto Konoha Headband (Metal plate with Leaf Village swirl)
    const drawHeadband = (x: number, y: number, size: number, alpha: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;

      const r = size / 2;

      // Dark Navy Cloth Strap
      ctx.fillStyle = '#1A237E';
      ctx.beginPath();
      ctx.rect(-r * 1.1, -r * 0.35, r * 2.2, r * 0.7);
      ctx.fill();

      // Curved cloth ends
      ctx.beginPath();
      ctx.arc(-r * 1.1, 0, r * 0.35, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(r * 1.1, 0, r * 0.35, Math.PI * 1.5, Math.PI * 0.5);
      ctx.fill();

      // Metal Forehead Protector (Silver plate with rivets)
      ctx.fillStyle = '#CFD8DC';
      ctx.strokeStyle = '#90A4AE';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-r * 0.75, -r * 0.28, r * 1.5, r * 0.56, 3);
      ctx.fill();
      ctx.stroke();

      // Metal Screws / Rivets (3 left, 3 right)
      ctx.fillStyle = '#607D8B';
      const rivets = [
        [-r * 0.65, -r * 0.16], [-r * 0.65, r * 0.16],
        [r * 0.65, -r * 0.16], [r * 0.65, r * 0.16]
      ];
      rivets.forEach(([rx, ry]) => {
        ctx.beginPath();
        ctx.arc(rx, ry, 1, 0, Math.PI * 2);
        ctx.fill();
      });

      // Konoha Leaf Symbol (Distinctive Leaf Spiral with arrow point)
      ctx.strokeStyle = '#263238';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      // Spiral
      ctx.arc(0, 0, r * 0.14, 0.4 * Math.PI, 2.2 * Math.PI);
      ctx.stroke();

      // Triangle leaf pointer
      ctx.fillStyle = '#263238';
      ctx.beginPath();
      ctx.moveTo(r * 0.12, -r * 0.14);
      ctx.lineTo(r * 0.24, -r * 0.22);
      ctx.lineTo(r * 0.08, -r * 0.22);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    // 2. Draw Kurama (Nine-Tails glowing red/orange fox eyes & whiskers)
    const drawKurama = (x: number, y: number, size: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;

      const r = size / 2;

      // Fiery Chakra Aura
      ctx.shadowColor = '#FF3D00';
      ctx.shadowBlur = 10;

      // Glowing Slit Fox Eyes
      ctx.fillStyle = '#FF3D00'; // Pure Kurama Chakra Red
      // Left Eye
      ctx.beginPath();
      ctx.moveTo(-r * 0.65, 0);
      ctx.quadraticCurveTo(-r * 0.35, -r * 0.35, -r * 0.15, -r * 0.05);
      ctx.quadraticCurveTo(-r * 0.35, r * 0.15, -r * 0.65, 0);
      ctx.fill();

      // Right Eye
      ctx.beginPath();
      ctx.moveTo(r * 0.65, 0);
      ctx.quadraticCurveTo(r * 0.35, -r * 0.35, r * 0.15, -r * 0.05);
      ctx.quadraticCurveTo(r * 0.35, r * 0.15, r * 0.65, 0);
      ctx.fill();

      // Inner Slit Pupils (Black vertical feline slit)
      ctx.fillStyle = '#1A0E05';
      ctx.fillRect(-r * 0.38, -r * 0.22, 2.5, r * 0.32);
      ctx.fillRect(r * 0.36, -r * 0.22, 2.5, r * 0.32);
      ctx.shadowBlur = 0;

      // 3 Naruto Whisker Marks on each side
      ctx.strokeStyle = '#FF6B2B';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const yOff = r * 0.25 + i * 4;
        // Left whiskers
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, yOff);
        ctx.lineTo(-r * 0.15, yOff + 2);
        ctx.stroke();
        // Right whiskers
        ctx.beginPath();
        ctx.moveTo(r * 0.5, yOff);
        ctx.lineTo(r * 0.15, yOff + 2);
        ctx.stroke();
      }

      ctx.restore();
    };

    // 3. Draw Rotating Shuriken (4-point curved throwing star)
    const drawShuriken = (x: number, y: number, size: number, alpha: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;

      const r = size / 2;

      // Shuriken blades (4 points with curved beveled edges)
      ctx.fillStyle = '#37474F'; // Ninja weapon steel
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        const tipX = Math.cos(a) * r * 0.95;
        const tipY = Math.sin(a) * r * 0.95;
        const edgeX = Math.cos(a + 0.35) * r * 0.35;
        const edgeY = Math.sin(a + 0.35) * r * 0.35;
        const innerX = Math.cos(a + Math.PI / 4) * r * 0.2;
        const innerY = Math.sin(a + Math.PI / 4) * r * 0.2;

        if (i === 0) ctx.moveTo(tipX, tipY);
        else ctx.lineTo(tipX, tipY);
        ctx.lineTo(edgeX, edgeY);
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.fill();

      // Blade Highlights
      ctx.strokeStyle = '#ECEFF1';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Center Ring Hole
      ctx.fillStyle = '#0a0a0f';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#90A4AE';
      ctx.stroke();

      ctx.restore();
    };

    // 4. Draw Ninja Kunai Knife
    const drawKunai = (x: number, y: number, size: number, alpha: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;

      const r = size / 2;

      // Diamond Blade
      ctx.fillStyle = '#455A64';
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.9); // Sharp tip
      ctx.lineTo(r * 0.3, -r * 0.2); // Right corner
      ctx.lineTo(0, 0); // Base center
      ctx.lineTo(-r * 0.3, -r * 0.2); // Left corner
      ctx.closePath();
      ctx.fill();

      // Blade Center Ridge
      ctx.strokeStyle = '#ECEFF1';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.9);
      ctx.lineTo(0, 0);
      ctx.stroke();

      // Handle (wrapped bandages)
      ctx.strokeStyle = '#EEEEEE';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, r * 0.55);
      ctx.stroke();

      // Circular Ring at pommel
      ctx.strokeStyle = '#455A64';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, r * 0.72, r * 0.16, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    };

    // 5. Draw Rasengan / Swirling Chakra Sphere
    const drawRasengan = (x: number, y: number, size: number, alpha: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;

      const r = size / 2;

      // Outer Glowing Sphere
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
      ctx.fill();

      // Swirling spiral lines (Cyan + White chakra)
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = i % 2 === 0 ? '#E0F7FA' : '#00E5FF';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        const startAngle = (i * Math.PI) / 2;
        for (let t = 0; t < 2.5; t += 0.15) {
          const rad = (t / 2.5) * r * 0.55;
          const ang = startAngle + t * 2.2;
          const px = Math.cos(ang) * rad;
          const py = Math.sin(ang) * rad;
          if (t === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Bright Core
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();
    };

    // Draw Autumn Leaf
    const drawLeaf = (l: Leaf) => {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rotation);
      const flipScale = Math.cos(l.flip);
      ctx.scale(1, Math.max(0.2, Math.abs(flipScale)));

      const grad = ctx.createLinearGradient(0, -l.size, 0, l.size);
      grad.addColorStop(0, `rgba(${l.color}, ${l.opacity})`);
      grad.addColorStop(1, `rgba(${l.colorDark}, ${l.opacity * 0.8})`);
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(0, -l.size);
      ctx.bezierCurveTo(l.size * 0.6, -l.size * 0.3, l.size * 0.6, l.size * 0.5, 0, l.size);
      ctx.bezierCurveTo(-l.size * 0.6, l.size * 0.5, -l.size * 0.6, -l.size * 0.3, 0, -l.size);
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 255, 255, ${l.opacity * 0.3})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -l.size * 0.7);
      ctx.lineTo(0, l.size * 0.7);
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
      
      // 1. Draw Iconic Naruto Characters & Ninja Artifacts
      iconics.forEach(item => {
        item.bobPhase += item.bobSpeed;
        item.rot += item.rotSpeed;
        item.x += item.vx;
        const currentY = item.baseY + Math.sin(item.bobPhase) * 12;

        // Wrap around horizontally
        if (item.x > canvas.width + 45) item.x = -45;
        if (item.x < -45) item.x = canvas.width + 45;

        switch (item.type) {
          case 'headband':
            drawHeadband(item.x, currentY, item.size, item.opacity, item.rot * 0.2);
            break;
          case 'kurama':
            drawKurama(item.x, currentY, item.size, item.opacity);
            break;
          case 'shuriken':
            drawShuriken(item.x, currentY, item.size, item.opacity, item.rot);
            break;
          case 'kunai':
            drawKunai(item.x, currentY, item.size, item.opacity, item.rot * 0.3);
            break;
          case 'rasengan':
            drawRasengan(item.x, currentY, item.size, item.opacity, item.rot * 1.5);
            break;
        }
      });

      // 2. Draw Falling Konoha Leaves
      leaves.forEach(l => {
        const dx = mouseX - l.x;
        const dy = mouseY - l.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          const force = (100 - dist) / 100;
          l.x -= (dx / dist) * force * 2;
          l.y -= (dy / dist) * force * 2;
        }

        l.swing += l.swingSpeed;
        l.flip += l.flipSpeed;
        l.x += l.vx + Math.sin(l.swing) * 0.8;
        l.y += l.vy;
        l.rotation += l.rotationSpeed;
        
        if (l.y > canvas.height + 25) {
          l.y = -25;
          l.x = Math.random() * canvas.width;
        }
        if (l.x > canvas.width + 25) l.x = -25;
        if (l.x < -25) l.x = canvas.width + 25;

        drawLeaf(l);
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
