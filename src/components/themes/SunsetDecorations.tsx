"use client";

import React, { useEffect, useState, useRef } from 'react';
import TropicalPalmTree from './TropicalPalmTree';

/**
 * Hardware-accelerated Seagull component using GPU CSS transforms instead of SMIL
 * Eliminates 100% of CPU path re-tessellation and layout calculations.
 */
function Seagull({
  flapDuration = '1.8s',
  className = '',
  style = {},
}: {
  flapDuration?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`pointer-events-none select-none ${className}`} style={style}>
      <svg viewBox="0 0 100 50" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        {/* Central streamlined body & tail */}
        <path d="M 48,25 L 50,34 L 52,25 Z" />
        {/* Left wing flapping smoothly via GPU matrix transform */}
        <g style={{ transformOrigin: '50px 24px', animation: `seagullWingFlapLeft ${flapDuration} ease-in-out infinite` }}>
          <path d="M 50,22 C 42,16 28,10 5,14 C 20,20 38,24 48,27 L 50,24 Z" />
        </g>
        {/* Right wing flapping smoothly via GPU matrix transform */}
        <g style={{ transformOrigin: '50px 24px', animation: `seagullWingFlapRight ${flapDuration} ease-in-out infinite` }}>
          <path d="M 50,22 C 58,16 72,10 95,14 C 80,20 62,24 52,27 L 50,24 Z" />
        </g>
      </svg>
    </div>
  );
}

export default function SunsetDecorations() {
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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Warm golden sunlight and sunset coral embers
    const dustColors = [
      'rgba(253, 200, 48, ', // Golden amber
      'rgba(247, 147, 30, ', // Radiant sunset orange
      'rgba(247, 82, 107, ', // Twilight coral
      'rgba(255, 222, 89, ', // Bright sunbeam
    ];

    const particles: {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      opacity: number;
      baseOpacity: number;
      colorPrefix: string;
      floatOffset: number;
    }[] = [];

    // Lightweight particle count (22 max) for silky smooth performance
    const count = Math.min(22, Math.max(12, Math.floor((window.innerWidth * window.innerHeight) / 45000)));

    for (let i = 0; i < count; i++) {
      const baseOpacity = Math.random() * 0.45 + 0.25;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.0 + 0.8,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(Math.random() * 0.45 + 0.2), // Warm upward thermal drift
        opacity: baseOpacity,
        baseOpacity,
        colorPrefix: dustColors[Math.floor(Math.random() * dustColors.length)],
        floatOffset: Math.random() * Math.PI * 2,
      });
    }

    // Specular sea water sparkles hovering over the ocean surface
    const seaSparkles: {
      x: number;
      y: number;
      size: number;
      speed: number;
      phase: number;
      baseAlpha: number;
    }[] = [];

    const sparkleCount = Math.min(16, Math.floor(window.innerWidth / 75));
    for (let i = 0; i < sparkleCount; i++) {
      seaSparkles.push({
        x: Math.random() * canvas.width,
        y: canvas.height - Math.random() * 110 - 15,
        size: Math.random() * 2.0 + 1.0,
        speed: Math.random() * 0.035 + 0.02,
        phase: Math.random() * Math.PI * 2,
        baseAlpha: Math.random() * 0.45 + 0.4,
      });
    }

    const animate = (timestamp: number) => {
      rafId = requestAnimationFrame(animate);

      if (document.hidden || isScrolling) return;

      const elapsed = timestamp - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = timestamp - (elapsed % fpsInterval);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // 1. Atmosphere embers
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx + Math.sin(timestamp * 0.001 + p.floatOffset) * 0.25;
        p.y += p.vy;

        // Wrap around viewport
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Mouse repulsion
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90 && dist > 0) {
          const force = (90 - dist) / 90;
          p.x += (dx / dist) * force * 2.5;
          p.y += (dy / dist) * force * 2.5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorPrefix}${p.opacity})`;
        ctx.fill();
      }

      // 2. Dynamic Golden Sun Glade Water Caustics (specular reflection lines under the sun)
      // Zero heap allocation: direct translucent strokes instead of re-instantiating 8 linear gradients per frame
      const gladeCenterX = width * 0.8;
      const gladeWidth = Math.min(380, width * 0.35);
      const gladeTopY = height - 110;
      const gladeHeight = 85;

      for (let j = 0; j < 7; j++) {
        const progress = j / 6;
        const yPos = gladeTopY + progress * gladeHeight;
        const widthAtY = (40 + progress * (gladeWidth - 40)) * (0.85 + Math.sin(timestamp * 0.002 + j) * 0.15);
        const waveShift = Math.sin(timestamp * 0.0025 + j * 0.9) * 12 + Math.cos(timestamp * 0.0018 + j * 0.5) * 6;
        const gladeAlpha = (0.22 + Math.sin(timestamp * 0.003 + j * 1.2) * 0.14) * (1 - progress * 0.3);

        const xStart = gladeCenterX - widthAtY * 0.5 + waveShift;
        const xEnd = gladeCenterX + widthAtY * 0.5 + waveShift;

        ctx.beginPath();
        ctx.moveTo(xStart, yPos);
        ctx.bezierCurveTo(
          gladeCenterX - widthAtY * 0.2 + waveShift,
          yPos - 2 + Math.sin(timestamp * 0.003 + j) * 1.5,
          gladeCenterX + widthAtY * 0.2 + waveShift,
          yPos + 2 - Math.sin(timestamp * 0.003 + j) * 1.5,
          xEnd,
          yPos
        );
        ctx.strokeStyle = `rgba(254, 240, 138, ${gladeAlpha})`;
        ctx.lineWidth = 1.3 + progress * 0.7;
        ctx.stroke();
      }

      // 3. Glistening sea water diamond sparkles
      for (let i = 0; i < seaSparkles.length; i++) {
        const s = seaSparkles[i];
        s.phase += s.speed;
        const alpha = Math.max(0, Math.sin(s.phase)) * s.baseAlpha;
        if (alpha > 0.05) {
          // Interactive glint brightening on mouse hover near bottom
          const distToMouse = Math.hypot(s.x - mouseX, s.y - mouseY);
          const boost = distToMouse < 140 ? (140 - distToMouse) / 140 : 0;
          const finalAlpha = Math.min(1, alpha + boost * 0.5);
          const sz = s.size * (1 + boost * 0.6);

          ctx.save();
          ctx.translate(s.x, s.y);

          // 4-point diamond sparkle
          ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`;
          ctx.beginPath();
          ctx.moveTo(0, -sz * 1.8);
          ctx.lineTo(sz * 0.5, 0);
          ctx.lineTo(0, sz * 1.8);
          ctx.lineTo(-sz * 0.5, 0);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(-sz * 1.8, 0);
          ctx.lineTo(0, sz * 0.5);
          ctx.lineTo(sz * 1.8, 0);
          ctx.lineTo(0, -sz * 0.5);
          ctx.closePath();
          ctx.fill();

          // Golden sparkle halo
          ctx.beginPath();
          ctx.arc(0, 0, sz * 1.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(254, 240, 138, ${finalAlpha * 0.4})`;
          ctx.fill();

          ctx.restore();
        }
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(scrollTimer);
    };
  }, [isEligible]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* ─── 1. Kilau Cahaya Senja di Langit Biru Muda (Daylight Shimmer Glints) ─── */}
      <div className="fixed top-3 left-1/4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff] hidden sm:block" style={{ animation: 'starTwinkle 3.5s ease-in-out infinite' }} />
      <div className="fixed top-8 left-1/3 w-2 h-2 rounded-full bg-amber-100 shadow-[0_0_10px_#fff] hidden sm:block" style={{ animation: 'starTwinkle 4.2s ease-in-out infinite 1.2s' }} />
      <div className="fixed top-5 left-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff] hidden sm:block" style={{ animation: 'starTwinkle 3s ease-in-out infinite 0.7s' }} />
      <div className="fixed top-10 right-1/3 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#ffd166] hidden sm:block" style={{ animation: 'starTwinkle 4.8s ease-in-out infinite 2s' }} />
      <div className="fixed top-6 right-1/4 w-1.5 h-1.5 rounded-full bg-amber-100 shadow-[0_0_8px_#fff] hidden sm:block" style={{ animation: 'starTwinkle 3.8s ease-in-out infinite 1.6s' }} />

      {/* ─── 2. Awan Senja Volumetrik Mengapung Alami (Sculpted Volumetric Sunset Clouds with Golden Lining) ─── */}
      {/* Cloud 1 - The Majestic Sovereign Cumulus (Upper Left High Sky) */}
      <div
        className="fixed top-4 sm:top-6 -left-6 sm:left-[3%] w-72 sm:w-[460px] md:w-[540px] h-28 sm:h-40 md:h-48 pointer-events-none select-none z-0"
        style={{ animation: 'cloudDriftMajestic 38s ease-in-out infinite alternate' }}
      >
        <svg viewBox="0 0 500 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-md">
          <defs>
            {/* Base Underbelly: Warm sunset peach-rose shadow */}
            <linearGradient id="cumulusUnderbellyGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="45%" stopColor="#fed7aa" stopOpacity="0.65" />
              <stop offset="85%" stopColor="#fb923c" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#f472b6" stopOpacity="0.4" />
            </linearGradient>

            {/* Mid Cumulus Body: Soft golden cream volume */}
            <linearGradient id="cumulusMidBodyGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#fef3c7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.6" />
            </linearGradient>

            {/* Top Crest Fluff: Pearly sunlight crests */}
            <linearGradient id="cumulusTopFluffGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
              <stop offset="70%" stopColor="#fffbeb" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Layer A: Warm Sunset Underbelly Base */}
          <path
            d="M35,115 C60,118 430,118 465,115 C480,108 485,92 470,80 C455,68 438,68 422,74 C412,52 380,36 342,44 C326,20 282,10 240,24 C212,6 160,8 124,35 C94,24 52,38 38,70 C22,76 8,94 18,112 C24,116 30,115 35,115 Z"
            fill="url(#cumulusUnderbellyGrad1)"
          />

          {/* Layer B: Volumetric Cumulus Puff Domes (Middle Body) */}
          <path
            d="M48,105 C80,108 410,108 445,105 C460,98 464,85 450,75 C438,65 422,66 408,71 C398,50 370,36 335,43 C320,22 280,14 240,26 C214,11 166,12 134,36 C106,27 68,39 55,68 C40,74 28,90 38,104 Z"
            fill="url(#cumulusMidBodyGrad1)"
          />

          {/* Layer C: Sunlit Fluffy Crest Highlights (Top Domes) */}
          <path
            d="M135,45 C155,20 200,16 235,30 C220,40 180,48 145,52 Z"
            fill="url(#cumulusTopFluffGrad1)"
          />
          <path
            d="M240,30 C275,18 315,25 332,48 C305,52 265,54 240,40 Z"
            fill="url(#cumulusTopFluffGrad1)"
          />
          <path
            d="M336,48 C365,42 392,54 402,72 C380,74 350,72 334,60 Z"
            fill="url(#cumulusTopFluffGrad1)"
          />
          <path
            d="M62,70 C74,48 105,38 128,48 C110,58 85,68 65,72 Z"
            fill="url(#cumulusTopFluffGrad1)"
          />

          {/* Golden Sunset Lining (Illuminated Bottom Rim) */}
          <path
            d="M35,115 C90,118 410,118 465,115"
            stroke="rgba(253, 224, 71, 0.65)"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Cloud 2 - The Sun-Bisecting Veil (Drifting Across the Setting Sun) */}
      <div
        className="fixed top-24 sm:top-32 md:top-36 right-[2%] sm:right-[8%] md:right-[12%] w-64 sm:w-[380px] md:w-[460px] h-18 sm:h-24 md:h-28 pointer-events-none select-none z-0"
        style={{
          animation: 'cloudDriftSunPass 42s ease-in-out infinite alternate',
        }}
      >
        <svg viewBox="0 0 440 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="sunPassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="25%" stopColor="#fffbeb" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#fed7aa" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="sunPassRim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#fef08a" stopOpacity="1" />
              <stop offset="75%" stopColor="#fde047" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Stratified cloud body bisecting the sun with golden glow */}
          <path
            d="M15,50 C55,46 110,34 165,38 C215,28 275,26 330,40 C370,34 410,44 428,50 C400,62 340,66 270,62 C200,68 120,66 60,62 C35,62 18,56 15,50 Z"
            fill="url(#sunPassGrad)"
          />

          {/* Soft secondary fluff bumps catching the sun's backlight */}
          <path
            d="M80,42 C115,26 155,25 185,38 C155,45 115,46 80,42 Z"
            fill="rgba(255, 255, 255, 0.7)"
          />
          <path
            d="M210,32 C245,18 285,20 315,36 C285,42 245,43 210,32 Z"
            fill="rgba(255, 255, 255, 0.75)"
          />

          {/* Blazing Golden Rim on Top & Bottom edges */}
          <path
            d="M20,50 C60,46 110,34 165,38 C215,28 275,26 330,40 C370,34 410,44 425,50"
            stroke="url(#sunPassRim)"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M35,56 C95,64 195,67 270,62 C340,65 395,60 415,52"
            stroke="rgba(253, 224, 71, 0.65)"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Cloud 3 - The Fluffy Sunset Puff (Center Mid-Sky) */}
      <div
        className="fixed top-18 sm:top-24 left-[34%] sm:left-[40%] w-52 sm:w-76 md:w-92 h-20 sm:h-28 md:h-32 pointer-events-none select-none z-0 hidden sm:block"
        style={{ animation: 'cloudDriftFloating 32s ease-in-out infinite alternate' }}
      >
        <svg viewBox="0 0 340 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-80 filter drop-shadow-sm">
          <defs>
            <linearGradient id="fluffyPuffGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
              <stop offset="45%" stopColor="#fef3c7" stopOpacity="0.8" />
              <stop offset="80%" stopColor="#fed7aa" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <path
            d="M25,82 C45,85 295,85 315,82 C328,76 332,64 320,54 C308,44 292,45 280,50 C270,34 246,22 218,28 C204,12 170,8 140,18 C120,8 82,10 58,28 C38,24 18,36 12,56 C6,68 12,78 25,82 Z"
            fill="url(#fluffyPuffGrad)"
          />
          {/* Top illuminated dome crests */}
          <path
            d="M145,22 C168,12 198,15 212,30 C192,36 165,38 145,26 Z"
            fill="rgba(255, 255, 255, 0.85)"
          />
          <path
            d="M65,32 C82,16 112,14 135,24 C115,32 90,36 68,34 Z"
            fill="rgba(255, 255, 255, 0.8)"
          />
          {/* Golden underbelly lining */}
          <path
            d="M25,82 C55,85 285,85 315,82"
            stroke="rgba(251, 191, 36, 0.6)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Cloud 4 - Horizon Wispy Cirrus Streamers (Lower Sky Over Ocean) */}
      <div
        className="fixed top-40 sm:top-52 md:top-60 right-[1%] sm:right-[4%] w-60 sm:w-92 md:w-[420px] h-14 sm:h-18 pointer-events-none select-none z-0 hidden sm:block"
        style={{ animation: 'cloudDriftWispy 46s ease-in-out infinite alternate' }}
      >
        <svg viewBox="0 0 380 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-65">
          <defs>
            <linearGradient id="cirrusWispyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="25%" stopColor="#fed7aa" stopOpacity="0.75" />
              <stop offset="55%" stopColor="#fef08a" stopOpacity="0.85" />
              <stop offset="85%" stopColor="#fdba74" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#f472b6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M10,32 C50,26 110,18 170,22 C230,16 290,14 345,24 C365,28 375,34 365,38 C325,44 265,42 205,38 C145,42 75,44 25,38 C12,36 5,34 10,32 Z"
            fill="url(#cirrusWispyGrad)"
          />
          <path
            d="M60,26 C120,20 220,18 310,24"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* ─── 3. Matahari Senja Utama & Sinar Crepuscular (Glorious Golden Sun with Godrays & Radiant Corona) ─── */}
      <div className="fixed top-14 sm:top-20 md:top-24 right-[6%] sm:right-[14%] md:right-[18%] pointer-events-none select-none z-0">
        {/* 1. Atmospheric Crepuscular God Rays (Berkas Sinar Matahari Keemasan) */}
        <div
          className="absolute -top-48 -left-48 w-[420px] sm:w-[580px] md:w-[700px] h-[420px] sm:h-[580px] md:h-[700px] pointer-events-none"
          style={{ animation: 'sunRaysCrepuscular 12s ease-in-out infinite alternate' }}
        >
          <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-60">
            <defs>
              <radialGradient id="godrayGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                <stop offset="25%" stopColor="#fef08a" stopOpacity="0.5" />
                <stop offset="55%" stopColor="#fbbf24" stopOpacity="0.25" />
                <stop offset="80%" stopColor="#f97316" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* 10 Fanning Crepuscular Sunbeams */}
            <path d="M300,300 L120,40 L165,25 Z" fill="url(#godrayGrad)" />
            <path d="M300,300 L240,15 L285,10 Z" fill="url(#godrayGrad)" />
            <path d="M300,300 L355,10 L400,20 Z" fill="url(#godrayGrad)" />
            <path d="M300,300 L470,45 L505,75 Z" fill="url(#godrayGrad)" />
            <path d="M300,300 L560,135 L585,175 Z" fill="url(#godrayGrad)" />
            <path d="M300,300 L590,250 L585,295 Z" fill="url(#godrayGrad)" />
            <path d="M300,300 L575,370 L545,415 Z" fill="url(#godrayGrad)" />
            <path d="M300,300 L470,490 L430,530 Z" fill="url(#godrayGrad)" />
            <path d="M300,300 L60,140 L40,185 Z" fill="url(#godrayGrad)" />
            <path d="M300,300 L35,260 L45,305 Z" fill="url(#godrayGrad)" />
          </svg>
        </div>

        {/* 2. Outermost Huge Atmospheric Sunset Bloom (Diffused Ambient Light — Hardware-Accelerated Pure Radial Gradient) */}
        <div
          className="absolute -top-40 -left-40 w-[260px] sm:w-[540px] md:w-[660px] h-[260px] sm:h-[540px] md:h-[660px] rounded-full opacity-70 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(254, 240, 138, 0.55) 0%, rgba(251, 191, 36, 0.35) 28%, rgba(249, 115, 22, 0.18) 50%, rgba(225, 29, 72, 0.08) 68%, transparent 85%)',
          }}
        />

        {/* 3. Middle Radiant Solar Corona with Living Breath Pulse */}
        <div
          className="absolute -top-16 -left-16 w-56 sm:w-76 md:w-96 h-56 sm:h-76 md:h-96 rounded-full opacity-90 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #FFFBE8 0%, #FEE070 25%, #FDB827 48%, rgba(247, 127, 30, 0.35) 72%, transparent 90%)',
            animation: 'sunCoronaBreathe 7.5s ease-in-out infinite alternate',
          }}
        />

        {/* 4. Inner Chromosphere Golden Ring */}
        <div
          className="absolute -top-4 -left-4 w-36 h-36 sm:w-52 sm:h-52 md:w-64 md:h-64 rounded-full opacity-85 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #FFFFFF 0%, #FFF3B0 40%, rgba(245, 158, 11, 0.4) 75%, transparent 100%)',
          }}
        />

        {/* 5. Horizontal Anamorphic Sun Flare Streak */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[520px] md:w-[640px] h-3 rounded-full opacity-70 pointer-events-none blur-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.2) 20%, rgba(255, 255, 255, 0.95) 50%, rgba(251, 191, 36, 0.2) 80%, transparent 100%)',
          }}
        />

        {/* 6. Brilliant Photosphere (The Setting Sun Disc) */}
        <div
          className="relative w-30 h-30 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full overflow-hidden sun-photosphere"
          style={{
            background: 'radial-gradient(circle at 45% 40%, #FFFFFF 0%, #FFFEE8 22%, #FEF08A 45%, #FDE047 65%, #FB923C 85%, #F43F5E 100%)',
            animation: 'sunAtmosphericPulse 8.5s ease-in-out infinite alternate',
          }}
        >
          {/* Subtle Solar Limb-Darkening & Atmospheric Heat Wave Ripple */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 50%, transparent 65%, rgba(249, 115, 22, 0.35) 88%, rgba(225, 29, 72, 0.5) 100%)',
            }}
          />

          {/* Center Specular Diamond Star Glint */}
          <div className="absolute top-[38%] left-[44%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white rounded-full blur-[0.5px] shadow-[0_0_8px_#fff]" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white rounded-full blur-[0.5px] shadow-[0_0_8px_#fff]" />
          </div>
        </div>
      </div>

      {/* ─── 4. Kawanan Burung Camar Mengepakkan Sayap & Melayang Anggun (Hardware-Accelerated Soaring Seabirds) ─── */}
      {/* Burung Camar 1 - Pemimpin Kawanan (Leader Soaring Seagull) */}
      <Seagull
        flapDuration="1.8s"
        className="fixed top-14 sm:top-20 left-[8%] sm:left-[16%] w-10 sm:w-12 h-6 z-0 text-[#10243e] opacity-85"
        style={{ animation: 'seagullFlightLeader 24s ease-in-out infinite' }}
      />

      {/* Burung Camar 2 - Pengikut Sayap (Wingman Follower) */}
      <Seagull
        flapDuration="1.4s"
        className="fixed top-20 sm:top-28 left-[14%] sm:left-[22%] w-8 sm:w-9 h-5 z-0 text-[#142944] opacity-75 sunset-seagull-mobile"
        style={{ animation: 'seagullFlightFollower 20s ease-in-out infinite 1.5s' }}
      />

      {/* Burung Camar 3 - Melayang Tinggi di Dekat Awan (High Thermal Soarer) */}
      <Seagull
        flapDuration="1.2s"
        className="fixed top-10 sm:top-14 left-[35%] sm:left-[42%] w-6 sm:w-7 h-4 z-0 text-[#1a365d] opacity-60 hidden sm:block"
        style={{ animation: 'seagullFlightHigh 28s ease-in-out infinite 3s' }}
      />

      {/* Burung Camar 4 - Melayang Rendah di Horizon Laut (Horizon Coastline Skimmer) */}
      <Seagull
        flapDuration="1.6s"
        className="fixed top-24 sm:top-32 left-[55%] sm:left-[62%] w-5 sm:w-6 h-3.5 z-0 text-[#1e3a5f] opacity-50 hidden sm:block"
        style={{ animation: 'seagullFlightSkim 22s ease-in-out infinite 4.8s' }}
      />

      {/* ─── 5. Hamparan Air Laut Senja Mewah & Deburan Ombak Hidup (Artistic Volumetric Sunset Ocean & Surf) ─── */}
      <div
        className="fixed bottom-0 inset-x-0 h-24 sm:h-28 md:h-32 lg:h-36 pointer-events-none select-none z-0 overflow-hidden sunset-ocean-container"
        style={{ transform: 'translateZ(0)', willChange: 'transform', contain: 'strict' }}
      >
        {/* Layer A: Atmospheric Sea Horizon Swell with Radiant Sun Flare */}
        <div className="absolute inset-x-0 bottom-0 h-full" style={{ animation: 'oceanSwellDeep 14s ease-in-out infinite' }}>
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            preserveAspectRatio="none"
            className="w-[106%] -ml-[3%] h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Deep ocean volumetric body */}
            <path
              d="M0,22 C260,34 560,16 880,24 C1140,12 1320,18 1440,14 L1440,120 L0,120 Z"
              fill="url(#deepOceanLuxuryGrad)"
            />
            {/* Radiant golden horizon flare catching the setting sun directly */}
            <path
              d="M0,22 C260,34 560,16 880,24 C1140,12 1320,18 1440,14"
              stroke="url(#horizonLuxuryGlowGrad)"
              strokeWidth="2.5"
              fill="none"
              style={{ filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.75))' }}
            />
            <defs>
              <linearGradient id="deepOceanLuxuryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.88" />
                <stop offset="25%" stopColor="#0369a1" stopOpacity="0.92" />
                <stop offset="55%" stopColor="#0891b2" stopOpacity="0.96" />
                <stop offset="85%" stopColor="#0f766e" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#134e4a" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="horizonLuxuryGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                <stop offset="45%" stopColor="#0ea5e9" stopOpacity="0.65" />
                <stop offset="68%" stopColor="#fef08a" stopOpacity="1" />
                <stop offset="80%" stopColor="#f59e0b" stopOpacity="1" />
                <stop offset="92%" stopColor="#f97316" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0.5" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Layer B: Magnificent Golden Sun Glade (Jalan Refleksi Emas Matahari di Permukaan Laut) */}
        <div
          className="absolute bottom-1 right-[7%] sm:right-[12%] md:right-[15%] w-72 sm:w-96 md:w-[460px] h-20 sm:h-24 md:h-28 pointer-events-none"
          style={{ animation: 'oceanGlintShimmer 4s ease-in-out infinite alternate' }}
        >
          {/* Luminous warm ambient golden bloom aura */}
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background: 'radial-gradient(ellipse at 50% 12%, rgba(255, 248, 180, 0.9) 0%, rgba(251, 191, 36, 0.6) 40%, rgba(245, 158, 11, 0.2) 72%, transparent 100%)',
            }}
          />
          {/* Perspective volumetric water ripple petals in true perspective */}
          <svg viewBox="0 0 360 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative">
            {/* Horizon distant fine ripples */}
            <path d="M140,5 Q170,2 200,5 Q170,8 140,5 Z" fill="#ffffff" opacity="0.95" />
            <path d="M120,10 Q160,7 210,10 Q160,13 120,10 Z" fill="#fef08a" opacity="0.92" />
            <path d="M100,16 Q150,13 230,16 Q150,19 100,16 Z" fill="#ffffff" opacity="0.9" />
            
            {/* Mid-distance undulating ripple petals */}
            <path d="M80,23 Q140,19 250,23 Q140,27 80,23 Z" fill="#fef08a" opacity="0.88" />
            <path d="M60,31 Q130,27 270,31 Q130,35 60,31 Z" fill="#fde047" opacity="0.85" />
            <path d="M45,40 Q130,35 295,40 Q130,45 45,40 Z" fill="#ffffff" opacity="0.88" />
            
            {/* Near-distance expanding ripples */}
            <path d="M30,50 Q130,44 320,50 Q130,56 30,50 Z" fill="#fef08a" opacity="0.82" />
            <path d="M20,61 Q130,54 340,61 Q130,67 20,61 Z" fill="#fde047" opacity="0.8" />
            <path d="M15,73 Q130,66 350,73 Q130,79 15,73 Z" fill="#ffffff" opacity="0.75" />
            
            {/* Foreground luscious ripples */}
            <path d="M25,84 Q140,78 345,84 Q140,89 25,84 Z" fill="#fef08a" opacity="0.7" />

            {/* Twinkling diamond stars on water surface */}
            <polygon points="175,7 177,11 181,11 178,14 179,18 175,15 171,18 172,14 169,11 173,11" fill="#ffffff" opacity="0.95" style={{ animation: 'sparkleTwinkle 2.8s ease-in-out infinite' }} />
            <polygon points="220,15 221,18 224,18 222,20 223,23 220,21 217,23 218,20 216,18 219,18" fill="#fef08a" opacity="0.9" style={{ animation: 'sparkleTwinkle 3.4s ease-in-out infinite 0.9s' }} />
            <polygon points="135,22 136,25 140,25 137,27 138,31 135,28 132,31 133,27 130,25 134,25" fill="#ffffff" opacity="0.92" style={{ animation: 'sparkleTwinkle 2.5s ease-in-out infinite 1.4s' }} />
            <polygon points="255,31 256,34 259,34 257,36 258,39 255,37 252,39 253,36 251,34 254,34" fill="#fde047" opacity="0.88" style={{ animation: 'sparkleTwinkle 3.1s ease-in-out infinite 0.5s' }} />
            <polygon points="190,42 191,45 195,45 192,47 193,51 190,48 187,51 188,47 185,45 189,45" fill="#ffffff" opacity="0.98" style={{ animation: 'sparkleTwinkle 2.2s ease-in-out infinite 1.8s' }} />
            <polygon points="115,52 116,55 119,55 117,57 118,60 115,58 112,60 113,57 111,55 114,55" fill="#fef08a" opacity="0.85" style={{ animation: 'sparkleTwinkle 3.6s ease-in-out infinite 1.1s' }} />
            <polygon points="280,63 281,66 284,66 282,68 283,71 280,69 277,71 278,68 276,66 279,66" fill="#ffffff" opacity="0.9" style={{ animation: 'sparkleTwinkle 2.7s ease-in-out infinite 0.7s' }} />
          </svg>
        </div>

        {/* Layer C: Rolling Middle Ocean Wave with Volumetric Shading & Sunlit Lip */}
        <div
          className="absolute inset-x-0 bottom-2 sm:bottom-3 h-[75%]"
          style={{ animation: 'oceanWaveRolling 9.5s ease-in-out infinite' }}
        >
          <svg
            viewBox="0 0 1440 90"
            fill="none"
            preserveAspectRatio="none"
            className="w-[106%] -ml-[3%] h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Main wave volumetric body */}
            <path
              d="M0,30 C240,44 500,20 760,34 C1040,48 1260,16 1440,26 L1440,90 L0,90 Z"
              fill="url(#midOceanWaveGrad)"
            />
            {/* Volumetric illuminated crest band (translucent water catching sunset backlight) */}
            <path
              d="M0,30 C240,44 500,20 760,34 C1040,48 1260,16 1440,26 L1440,32 C1260,22 1040,54 760,40 C500,26 240,50 0,36 Z"
              fill="url(#midCrestSunlitGrad)"
            />
            {/* Backlit golden crest highlight edge */}
            <path
              d="M0,30 C240,44 500,20 760,34 C1040,48 1260,16 1440,26"
              stroke="rgba(254, 240, 138, 0.75)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <defs>
              <linearGradient id="midOceanWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.88" />
                <stop offset="30%" stopColor="#0284c7" stopOpacity="0.92" />
                <stop offset="65%" stopColor="#0369a1" stopOpacity="0.96" />
                <stop offset="100%" stopColor="#0891b2" stopOpacity="0.98" />
              </linearGradient>
              <linearGradient id="midCrestSunlitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.6" />
                <stop offset="75%" stopColor="#fef08a" stopOpacity="0.85" />
                <stop offset="90%" stopColor="#fde047" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Layer D: Grand Breaking Surf with Sculpted Seafoam Lip (Deburan Ombak Menggulung Mewah & Busa Kristal) */}
        <div
          className="absolute inset-x-0 bottom-1 sm:bottom-2 h-[58%]"
          style={{ animation: 'oceanSurfSurge 7.5s ease-in-out infinite alternate' }}
        >
          <svg
            viewBox="0 0 1440 70"
            fill="none"
            preserveAspectRatio="none"
            className="w-[106%] -ml-[3%] h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Rising tropical aquamarine wave face */}
            <path
              d="M0,22 C280,10 540,34 820,16 C1100,34 1300,8 1440,18 L1440,70 L0,70 Z"
              fill="url(#nearShoreTurquoiseGrad)"
            />
            {/* Wave curl underbelly shadow (creates 3D volume underneath the curl) */}
            <path
              d="M0,25 C280,13 540,37 820,19 C1100,37 1300,11 1440,21 L1440,30 C1300,20 1100,46 820,28 C540,46 280,22 0,34 Z"
              fill="rgba(2, 132, 199, 0.45)"
            />
            {/* Volumetric sculpted white seafoam crest lip */}
            <path
              d="M0,22 C280,10 540,34 820,16 C1100,34 1300,8 1440,18 L1440,24 C1300,14 1100,40 820,22 C540,40 280,16 0,28 Z"
              fill="#ffffff"
              style={{ filter: 'drop-shadow(0 2px 6px rgba(2, 132, 199, 0.45))' }}
            />
            {/* Scalloped seafoam froth bubbles and droplets along the breaking crest */}
            <path
              d="M100,21 Q110,18 120,21 M250,15 Q260,12 270,15 M430,30 Q440,27 450,30 M650,22 Q660,19 670,22 M890,26 Q900,23 910,26 M1120,22 Q1130,19 1140,22 M1340,13 Q1350,10 1360,13"
              stroke="rgba(255, 255, 255, 0.95)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <defs>
              <linearGradient id="nearShoreTurquoiseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.88" />
                <stop offset="45%" stopColor="#06b6d4" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.98" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Layer E: Shoreline Surf with Frothy Seafoam Lace Wash (Buih Renda Ombak Menyapu Pasir) */}
        <div
          className="absolute inset-x-0 bottom-0.5 sm:bottom-1 h-[42%]"
          style={{ animation: 'oceanShoreWash 6.2s ease-in-out infinite' }}
        >
          <svg
            viewBox="0 0 1440 50"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Translucent shallow shoreline wash */}
            <path
              d="M0,16 C340,26 680,8 1020,20 C1220,12 1360,22 1440,14 L1440,50 L0,50 Z"
              fill="url(#shallowShoreSurfGrad)"
            />
            {/* Volumetric frothy lace wash band */}
            <path
              d="M0,16 C340,26 680,8 1020,20 C1220,12 1360,22 1440,14 L1440,19 C1360,27 1220,17 1020,25 C680,13 340,31 0,21 Z"
              fill="rgba(255, 255, 255, 0.9)"
            />
            {/* Organic froth micro-arcs and foam eyelets washing upon the sand */}
            <path d="M120,20 Q130,23 140,20 M280,24 Q290,27 300,24 M520,14 Q530,17 540,14 M780,16 Q790,19 800,16 M1060,20 Q1070,23 1080,20 M1280,18 Q1290,21 1300,18" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <defs>
              <linearGradient id="shallowShoreSurfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.75" />
                <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.82" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.92" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Layer F: Warm Sun-Kissed Golden Beach with Glossy Wet Sand Mirror Sheen (Bibir Pantai Pasir Emas Alami) */}
        <div className="absolute inset-x-0 bottom-0 h-[24%]">
          <svg
            viewBox="0 0 1440 35"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Warm golden sand beach dunes */}
            <path
              d="M0,12 C260,6 580,16 880,8 C1140,14 1320,6 1440,10 L1440,35 L0,35 Z"
              fill="url(#warmBeachSandGrad)"
            />
            {/* Glossy wet sand mirror sheen reflecting golden sunset light */}
            <path
              d="M0,12 C260,6 580,16 880,8 C1140,14 1320,6 1440,10 L1440,16 C1320,12 1140,20 880,14 C580,22 260,12 0,18 Z"
              fill="url(#wetSandReflectionGrad)"
            />
            <defs>
              <linearGradient id="warmBeachSandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e5a460" stopOpacity="0.88" />
                <stop offset="25%" stopColor="#ca813a" stopOpacity="0.94" />
                <stop offset="60%" stopColor="#964f1d" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#502409" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="wetSandReflectionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.55" />
                <stop offset="40%" stopColor="#fed7aa" stopOpacity="0.7" />
                <stop offset="70%" stopColor="#fde047" stopOpacity="0.85" />
                <stop offset="90%" stopColor="#fb923c" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#fde047" stopOpacity="0.45" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ─── 6. Siluet Pohon Kelapa Tropis Rimbun, Segar & Alami (Ultra-Lush Tropical Coconut Palms) ─── */}
      <TropicalPalmTree />


      {/* ─── 7. Partikel Debu Senja (Twilight Embers Canvas - Desktop 30 FPS) ─── */}
      {isEligible && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      )}
    </div>
  );
}
