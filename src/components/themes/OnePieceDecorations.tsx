"use client";

import React, { useEffect, useState, useRef } from 'react';

export default function OnePieceDecorations() {
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

    // --- Wave Ripples ---
    interface WaveRipple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
      speed: number;
    }

    const ripples: WaveRipple[] = [];
    const maxRipples = 5;
    let rippleTimer = 0;

    const spawnRipple = () => {
      if (ripples.length >= maxRipples) return;
      ripples.push({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.65 + Math.random() * canvas.height * 0.35,
        radius: 0,
        maxRadius: Math.random() * 80 + 50,
        opacity: 0.28,
        speed: Math.random() * 0.7 + 0.3,
      });
    };

    // --- Gold Treasure Sparkles ---
    interface GoldSparkle {
      x: number;
      y: number;
      size: number;
      alpha: number;
      alphaSpeed: number;
      rot: number;
      rotSpeed: number;
    }

    const sparkles: GoldSparkle[] = [];
    const sparkleCount = Math.min(16, Math.floor(window.innerWidth * window.innerHeight / 50000));
    
    for (let i = 0; i < sparkleCount; i++) {
      sparkles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 2,
        alpha: Math.random() * 0.6 + 0.2,
        alphaSpeed: (Math.random() * 0.02 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.015,
      });
    }

    // --- Iconic One Piece Artifacts & Characters ---
    // Types: 'strawhat', 'jollyroger', 'sunny', 'devilfruit', 'meat'
    type OnePieceIconic = 'strawhat' | 'jollyroger' | 'sunny' | 'devilfruit' | 'meat';

    interface FloatingIconic {
      x: number;
      baseY: number;
      size: number;
      type: OnePieceIconic;
      vx: number;
      bobPhase: number;
      bobSpeed: number;
      tilt: number;
      tiltSpeed: number;
      opacity: number;
    }

    const iconics: FloatingIconic[] = [];
    const iconicTypes: OnePieceIconic[] = ['strawhat', 'jollyroger', 'sunny', 'devilfruit', 'meat'];
    const count = Math.min(6, Math.max(4, Math.floor(canvas.width / 260)));

    for (let i = 0; i < count; i++) {
      const startY = Math.random() * (canvas.height * 0.7) + 80;
      iconics.push({
        x: (canvas.width / (count + 1)) * (i + 1) + (Math.random() - 0.5) * 60,
        baseY: startY,
        size: Math.random() * 6 + 32, // 32-38px
        type: iconicTypes[i % iconicTypes.length],
        vx: (Math.random() - 0.5) * 0.25,
        bobPhase: Math.random() * Math.PI * 2,
        bobSpeed: Math.random() * 0.025 + 0.015,
        tilt: (Math.random() - 0.5) * 0.2,
        tiltSpeed: (Math.random() - 0.5) * 0.01,
        opacity: Math.random() * 0.12 + 0.22, // 0.22 - 0.34
      });
    }

    // 1. Draw Luffy's Straw Hat (Topi Jerami)
    const drawStrawHat = (x: number, y: number, size: number, alpha: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;

      const r = size / 2;

      // Hat Dome (Yellow Straw)
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.15, r * 0.65, r * 0.6, 0, Math.PI, 0);
      ctx.fillStyle = '#FFCA28'; // Vibrant straw gold
      ctx.fill();

      // Red Band (Crimson Ribbon)
      ctx.beginPath();
      ctx.rect(-r * 0.62, -r * 0.25, r * 1.24, r * 0.28);
      ctx.fillStyle = '#E53935'; // Straw hat red band
      ctx.fill();

      // Hat Wide Brim (Curved ellipse)
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.05, r * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#FDD835';
      ctx.fill();
      ctx.strokeStyle = '#F57F17';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Subtle straw weave texture lines
      ctx.strokeStyle = `rgba(245, 127, 23, 0.4)`;
      ctx.beginPath();
      ctx.arc(0, -r * 0.25, r * 0.45, Math.PI * 0.9, Math.PI * 0.1, true);
      ctx.stroke();

      ctx.restore();
    };

    // 2. Draw Straw Hat Jolly Roger (Pirate Skull with Straw Hat & Crossed Bones)
    const drawJollyRoger = (x: number, y: number, size: number, alpha: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;

      const r = size / 2;

      // Crossed Bones behind
      ctx.strokeStyle = '#E0E0E0';
      ctx.lineWidth = r * 0.2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.85, -r * 0.85);
      ctx.lineTo(r * 0.85, r * 0.85);
      ctx.moveTo(r * 0.85, -r * 0.85);
      ctx.lineTo(-r * 0.85, r * 0.85);
      ctx.stroke();

      // Bone knobs on corners
      ctx.fillStyle = '#E0E0E0';
      const knobs = [
        [-r * 0.85, -r * 0.85], [r * 0.85, r * 0.85],
        [r * 0.85, -r * 0.85], [-r * 0.85, r * 0.85]
      ];
      knobs.forEach(([kx, ky]) => {
        ctx.beginPath();
        ctx.arc(kx, ky, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
      });

      // Skull Base (Round white)
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Mini Straw Hat on skull head
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.35, r * 0.65, r * 0.18, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#FFCA28';
      ctx.fill();
      // Red mini ribbon
      ctx.beginPath();
      ctx.rect(-r * 0.35, -r * 0.48, r * 0.7, r * 0.15);
      ctx.fillStyle = '#E53935';
      ctx.fill();
      // Mini dome
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.48, r * 0.35, r * 0.25, 0, Math.PI, 0);
      ctx.fillStyle = '#FFCA28';
      ctx.fill();

      // Skull Eye Sockets (Big black anime pirate eyes)
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(-r * 0.2, -r * 0.02, r * 0.14, 0, Math.PI * 2);
      ctx.arc(r * 0.2, -r * 0.02, r * 0.14, 0, Math.PI * 2);
      ctx.fill();

      // Skull Big Grinning Mouth (Luffy smile)
      ctx.beginPath();
      ctx.arc(0, r * 0.15, r * 0.25, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#212121';
      ctx.stroke();

      ctx.restore();
    };

    // 3. Draw Thousand Sunny Lion Figurehead
    const drawSunnyLion = (x: number, y: number, size: number, alpha: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;

      const r = size / 2;

      // Sun Petals / Lion Mane (12 triangular yellow rays)
      ctx.fillStyle = '#FFA000';
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI * 2) / 10;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * r * 0.4, Math.sin(angle) * r * 0.4);
        ctx.lineTo(Math.cos(angle + 0.18) * r * 0.95, Math.sin(angle + 0.18) * r * 0.95);
        ctx.lineTo(Math.cos(angle + 0.36) * r * 0.4, Math.sin(angle + 0.36) * r * 0.4);
        ctx.closePath();
        ctx.fill();
      }

      // Lion Face Center
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD54F';
      ctx.fill();

      // Cheerful Eyes
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(-r * 0.2, -r * 0.1, r * 0.08, 0, Math.PI * 2);
      ctx.arc(r * 0.2, -r * 0.1, r * 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Bone Cross Nose/Mouth
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, r * 0.12, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.arc(0, r * 0.08, r * 0.07, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // 4. Draw Gomu Gomu no Mi (Devil Fruit with Swirls)
    const drawDevilFruit = (x: number, y: number, size: number, alpha: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;

      const r = size / 2;

      // Green T-stem with curl
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.55);
      ctx.lineTo(0, -r * 0.85);
      ctx.bezierCurveTo(r * 0.3, -r * 1.05, r * 0.4, -r * 0.75, r * 0.2, -r * 0.85);
      ctx.stroke();

      // Purple melon body
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = '#7E57C2'; // Deep Gum-Gum violet
      ctx.fill();

      // Swirl Patterns on skin
      ctx.strokeStyle = '#B39DDB';
      ctx.lineWidth = 1.5;
      const swirls = [
        [-r * 0.25, -r * 0.2],
        [r * 0.25, -r * 0.15],
        [-r * 0.15, r * 0.25],
        [r * 0.2, r * 0.25],
      ];
      swirls.forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.16, 0, 1.6 * Math.PI);
        ctx.stroke();
      });

      ctx.restore();
    };

    // 5. Draw Luffy's Giant Meat on the Bone
    const drawMeatOnBone = (x: number, y: number, size: number, alpha: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;

      const r = size / 2;

      // Bone Stick passing through
      ctx.fillStyle = '#F5F5F5';
      ctx.beginPath();
      ctx.rect(-r * 0.8, -r * 0.12, r * 1.6, r * 0.24);
      ctx.fill();

      // Bone knobs on both ends
      [[-r * 0.8, -r * 0.1], [-r * 0.8, r * 0.1], [r * 0.8, -r * 0.1], [r * 0.8, r * 0.1]].forEach(([bx, by]) => {
        ctx.beginPath();
        ctx.arc(bx, by, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
      });

      // Giant Oval Roast Meat
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.6, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#8D6E63'; // Savory roast brown
      ctx.fill();

      // Grilled Meat Shading & Highlights
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.05, r * 0.5, r * 0.25, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#A1887F';
      ctx.fill();

      // Center bone hole
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Draw Cross Star for treasure sparkles
    const drawCrossStar = (x: number, y: number, size: number, alpha: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.beginPath();
      const r = size;
      const inner = r * 0.2;
      ctx.moveTo(0, -r);
      ctx.lineTo(inner, -inner);
      ctx.lineTo(r, 0);
      ctx.lineTo(inner, inner);
      ctx.lineTo(0, r);
      ctx.lineTo(-inner, inner);
      ctx.lineTo(-r, 0);
      ctx.lineTo(-inner, -inner);
      ctx.closePath();
      ctx.fill();
      // Center glow
      ctx.beginPath();
      ctx.arc(0, 0, inner, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
      ctx.fill();
      ctx.restore();
    };

    let compassAngle = 0;

    const animate = (timestamp: number) => {
      rafId = requestAnimationFrame(animate);

      const elapsed = timestamp - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = timestamp - (elapsed % fpsInterval);

      if (document.hidden) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Ripples
      rippleTimer++;
      if (rippleTimer > 55) {
        spawnRipple();
        rippleTimer = 0;
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.opacity = 0.25 * (1 - r.radius / r.maxRadius);
        
        if (r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(79, 195, 247, ${r.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 2. Gold Treasure Sparkles
      sparkles.forEach(s => {
        s.alpha += s.alphaSpeed;
        if (s.alpha > 0.85 || s.alpha < 0.1) s.alphaSpeed *= -1;
        s.rot += s.rotSpeed;
        drawCrossStar(s.x, s.y, s.size, s.alpha, s.rot);
      });

      // 3. Floating One Piece Iconic Characters & Artifacts
      iconics.forEach(item => {
        item.bobPhase += item.bobSpeed;
        item.tilt += item.tiltSpeed;
        item.x += item.vx;
        const currentY = item.baseY + Math.sin(item.bobPhase) * 14;

        // Wrap around horizontally
        if (item.x > canvas.width + 50) item.x = -50;
        if (item.x < -50) item.x = canvas.width + 50;

        switch (item.type) {
          case 'strawhat':
            drawStrawHat(item.x, currentY, item.size, item.opacity, item.tilt);
            break;
          case 'jollyroger':
            drawJollyRoger(item.x, currentY, item.size, item.opacity, item.tilt);
            break;
          case 'sunny':
            drawSunnyLion(item.x, currentY, item.size, item.opacity, item.tilt);
            break;
          case 'devilfruit':
            drawDevilFruit(item.x, currentY, item.size, item.opacity, item.tilt);
            break;
          case 'meat':
            drawMeatOnBone(item.x, currentY, item.size, item.opacity, item.tilt);
            break;
        }
      });

      // 4. Subtle Grand Line Nautical Compass (bottom-right)
      compassAngle += 0.003;
      const cx = canvas.width - 65;
      const cy = canvas.height - 65;
      const compassR = 26;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(compassAngle);
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1.2;

      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(i * Math.PI / 2) * compassR, Math.sin(i * Math.PI / 2) * compassR);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, compassR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, compassR * 0.35, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
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
