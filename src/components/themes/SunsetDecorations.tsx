"use client";

import React, { useEffect, useState, useRef } from 'react';

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

    const count = Math.min(45, Math.floor((window.innerWidth * window.innerHeight) / 26000));

    for (let i = 0; i < count; i++) {
      const baseOpacity = Math.random() * 0.5 + 0.25;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.5 + 0.2), // Warm upward thermal drift
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

    const sparkleCount = Math.min(26, Math.floor(window.innerWidth / 50));
    for (let i = 0; i < sparkleCount; i++) {
      seaSparkles.push({
        x: Math.random() * canvas.width,
        y: canvas.height - Math.random() * 110 - 15,
        size: Math.random() * 2.2 + 1.2,
        speed: Math.random() * 0.035 + 0.02,
        phase: Math.random() * Math.PI * 2,
        baseAlpha: Math.random() * 0.45 + 0.4,
      });
    }

    const animate = (timestamp: number) => {
      rafId = requestAnimationFrame(animate);

      const elapsed = timestamp - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = timestamp - (elapsed % fpsInterval);

      if (document.hidden) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Atmosphere embers
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx + Math.sin(timestamp * 0.001 + p.floatOffset) * 0.3;
        p.y += p.vy;

        // Wrap around viewport
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        // Mouse repulsion
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && dist > 0) {
          const force = (100 - dist) / 100;
          p.x += (dx / dist) * force * 3;
          p.y += (dy / dist) * force * 3;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorPrefix}${p.opacity})`;
        ctx.fill();
      }

      // 2. Dynamic Golden Sun Glade Water Caustics (specular reflection lines under the sun)
      const gladeCenterX = canvas.width * 0.8;
      const gladeWidth = Math.min(380, canvas.width * 0.35);
      const gladeTopY = canvas.height - 110;
      const gladeHeight = 85;

      for (let j = 0; j < 8; j++) {
        const progress = j / 7;
        const yPos = gladeTopY + progress * gladeHeight;
        const widthAtY = (40 + progress * (gladeWidth - 40)) * (0.85 + Math.sin(timestamp * 0.002 + j) * 0.15);
        const waveShift = Math.sin(timestamp * 0.0025 + j * 0.9) * 12 + Math.cos(timestamp * 0.0018 + j * 0.5) * 6;
        const gladeAlpha = (0.22 + Math.sin(timestamp * 0.003 + j * 1.2) * 0.16) * (1 - progress * 0.3);

        const xStart = gladeCenterX - widthAtY * 0.5 + waveShift;
        const xEnd = gladeCenterX + widthAtY * 0.5 + waveShift;

        const grad = ctx.createLinearGradient(xStart, yPos, xEnd, yPos);
        grad.addColorStop(0, 'rgba(253, 224, 71, 0)');
        grad.addColorStop(0.3, `rgba(254, 240, 138, ${gladeAlpha * 0.75})`);
        grad.addColorStop(0.5, `rgba(255, 255, 255, ${gladeAlpha * 1.1})`);
        grad.addColorStop(0.7, `rgba(254, 240, 138, ${gladeAlpha * 0.75})`);
        grad.addColorStop(1, 'rgba(253, 224, 71, 0)');

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
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4 + progress * 0.8;
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
          const boost = distToMouse < 150 ? (150 - distToMouse) / 150 : 0;
          const finalAlpha = Math.min(1, alpha + boost * 0.55);
          const sz = s.size * (1 + boost * 0.7);

          ctx.save();
          ctx.translate(s.x, s.y);

          // 4-point diamond sparkle
          ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`;
          ctx.beginPath();
          ctx.moveTo(0, -sz * 2);
          ctx.lineTo(sz * 0.5, 0);
          ctx.lineTo(0, sz * 2);
          ctx.lineTo(-sz * 0.5, 0);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(-sz * 2, 0);
          ctx.lineTo(0, sz * 0.5);
          ctx.lineTo(sz * 2, 0);
          ctx.lineTo(0, -sz * 0.5);
          ctx.closePath();
          ctx.fill();

          // Golden sparkle halo
          ctx.beginPath();
          ctx.arc(0, 0, sz * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(254, 240, 138, ${finalAlpha * 0.45})`;
          ctx.fill();

          ctx.restore();
        }
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, [isEligible]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* ─── 1. Kilau Cahaya Senja di Langit Biru Muda (Daylight Shimmer Glints) ─── */}
      <div className="fixed top-3 left-1/4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff]" style={{ animation: 'starTwinkle 3.5s ease-in-out infinite' }} />
      <div className="fixed top-8 left-1/3 w-2 h-2 rounded-full bg-amber-100 shadow-[0_0_10px_#fff]" style={{ animation: 'starTwinkle 4.2s ease-in-out infinite 1.2s' }} />
      <div className="fixed top-5 left-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff]" style={{ animation: 'starTwinkle 3s ease-in-out infinite 0.7s' }} />
      <div className="fixed top-10 right-1/3 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#ffd166]" style={{ animation: 'starTwinkle 4.8s ease-in-out infinite 2s' }} />
      <div className="fixed top-6 right-1/4 w-1.5 h-1.5 rounded-full bg-amber-100 shadow-[0_0_8px_#fff]" style={{ animation: 'starTwinkle 3.8s ease-in-out infinite 1.6s' }} />

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
          filter: 'drop-shadow(0 0 14px rgba(253, 224, 71, 0.6))',
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
        className="fixed top-18 sm:top-24 left-[34%] sm:left-[40%] w-52 sm:w-76 md:w-92 h-20 sm:h-28 md:h-32 pointer-events-none select-none z-0"
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
        className="fixed top-40 sm:top-52 md:top-60 right-[1%] sm:right-[4%] w-60 sm:w-92 md:w-[420px] h-14 sm:h-18 pointer-events-none select-none z-0"
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

        {/* 2. Outermost Huge Atmospheric Sunset Bloom (Diffused Ambient Light) */}
        <div
          className="absolute -top-40 -left-40 w-[380px] sm:w-[540px] md:w-[660px] h-[380px] sm:h-[540px] md:h-[660px] rounded-full blur-[115px] opacity-65 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(254, 240, 138, 0.65) 0%, rgba(251, 191, 36, 0.45) 35%, rgba(249, 115, 22, 0.28) 60%, rgba(225, 29, 72, 0.12) 80%, transparent 92%)',
          }}
        />

        {/* 3. Middle Radiant Solar Corona with Living Breath Pulse */}
        <div
          className="absolute -top-16 -left-16 w-56 sm:w-76 md:w-96 h-56 sm:h-76 md:h-96 rounded-full blur-[36px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #FFFBE8 0%, #FEE070 30%, #FDB827 58%, #F77F1E 82%, transparent 95%)',
            animation: 'sunCoronaBreathe 7.5s ease-in-out infinite alternate',
          }}
        />

        {/* 4. Inner Chromosphere Golden Ring */}
        <div
          className="absolute -top-4 -left-4 w-36 h-36 sm:w-52 sm:h-52 md:w-64 md:h-64 rounded-full blur-[14px] opacity-85 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #FFFFFF 0%, #FFF3B0 45%, #F59E0B 80%, transparent 100%)',
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
          className="relative w-30 h-30 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full overflow-hidden"
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

      {/* ─── 4. Kawanan Burung Camar Mengepakkan Sayap & Melayang Anggun (Realistic Flapping & Soaring Seabirds) ─── */}
      {/* Burung Camar 1 - Pemimpin Kawanan (Leader Soaring Seagull) */}
      <div
        className="fixed top-14 sm:top-20 left-[8%] sm:left-[16%] w-10 sm:w-12 h-6 pointer-events-none select-none z-0 text-[#10243e] opacity-85"
        style={{ animation: 'seagullFlightLeader 24s ease-in-out infinite' }}
      >
        <svg viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          <path fill="currentColor">
            <animate
              attributeName="d"
              dur="1.8s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0; 0.3; 0.65; 0.9; 1"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              values="
                M 50,22 C 42,16 28,10 5,14 C 20,20 38,24 48,27 L 50,34 L 52,27 C 62,24 80,20 95,14 C 72,10 58,16 50,22 Z;
                M 50,18 C 40,12 24,22 5,38 C 22,30 38,22 48,23 L 50,30 L 52,23 C 62,22 78,30 95,38 C 76,22 60,12 50,18 Z;
                M 50,25 C 42,18 30,11 5,4 C 20,15 38,22 48,28 L 50,35 L 52,28 C 62,22 80,15 95,4 C 70,11 58,18 50,25 Z;
                M 50,22 C 42,16 28,10 5,14 C 20,20 38,24 48,27 L 50,34 L 52,27 C 62,24 80,20 95,14 C 72,10 58,16 50,22 Z;
                M 50,22 C 42,16 28,10 5,14 C 20,20 38,24 48,27 L 50,34 L 52,27 C 62,24 80,20 95,14 C 72,10 58,16 50,22 Z
              "
            />
          </path>
        </svg>
      </div>

      {/* Burung Camar 2 - Pengikut Sayap (Wingman Follower) */}
      <div
        className="fixed top-20 sm:top-28 left-[14%] sm:left-[22%] w-8 sm:w-9 h-5 pointer-events-none select-none z-0 text-[#142944] opacity-75"
        style={{ animation: 'seagullFlightFollower 20s ease-in-out infinite 1.5s' }}
      >
        <svg viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path fill="currentColor">
            <animate
              attributeName="d"
              dur="1.4s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0; 0.32; 0.68; 1"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              values="
                M 50,22 C 42,16 28,10 5,14 C 20,20 38,24 48,27 L 50,34 L 52,27 C 62,24 80,20 95,14 C 72,10 58,16 50,22 Z;
                M 50,18 C 40,12 24,22 5,38 C 22,30 38,22 48,23 L 50,30 L 52,23 C 62,22 78,30 95,38 C 76,22 60,12 50,18 Z;
                M 50,25 C 42,18 30,11 5,4 C 20,15 38,22 48,28 L 50,35 L 52,28 C 62,22 80,15 95,4 C 70,11 58,18 50,25 Z;
                M 50,22 C 42,16 28,10 5,14 C 20,20 38,24 48,27 L 50,34 L 52,27 C 62,24 80,20 95,14 C 72,10 58,16 50,22 Z
              "
            />
          </path>
        </svg>
      </div>

      {/* Burung Camar 3 - Melayang Tinggi di Dekat Awan (High Thermal Soarer) */}
      <div
        className="fixed top-10 sm:top-14 left-[35%] sm:left-[42%] w-6 sm:w-7 h-4 pointer-events-none select-none z-0 text-[#1a365d] opacity-60"
        style={{ animation: 'seagullFlightHigh 28s ease-in-out infinite 3s' }}
      >
        <svg viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path fill="currentColor">
            <animate
              attributeName="d"
              dur="1.2s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0; 0.35; 0.7; 1"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              values="
                M 50,22 C 42,16 28,10 5,14 C 20,20 38,24 48,27 L 50,34 L 52,27 C 62,24 80,20 95,14 C 72,10 58,16 50,22 Z;
                M 50,18 C 40,12 24,22 5,38 C 22,30 38,22 48,23 L 50,30 L 52,23 C 62,22 78,30 95,38 C 76,22 60,12 50,18 Z;
                M 50,25 C 42,18 30,11 5,4 C 20,15 38,22 48,28 L 50,35 L 52,28 C 62,22 80,15 95,4 C 70,11 58,18 50,25 Z;
                M 50,22 C 42,16 28,10 5,14 C 20,20 38,24 48,27 L 50,34 L 52,27 C 62,24 80,20 95,14 C 72,10 58,16 50,22 Z
              "
            />
          </path>
        </svg>
      </div>

      {/* Burung Camar 4 - Melayang Rendah di Horizon Laut (Horizon Coastline Skimmer) */}
      <div
        className="fixed top-24 sm:top-32 left-[55%] sm:left-[62%] w-5 sm:w-6 h-3.5 pointer-events-none select-none z-0 text-[#1e3a5f] opacity-50"
        style={{ animation: 'seagullFlightSkim 22s ease-in-out infinite 4.8s' }}
      >
        <svg viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path fill="currentColor">
            <animate
              attributeName="d"
              dur="1.6s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0; 0.3; 0.65; 1"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              values="
                M 50,22 C 42,16 28,10 5,14 C 20,20 38,24 48,27 L 50,34 L 52,27 C 62,24 80,20 95,14 C 72,10 58,16 50,22 Z;
                M 50,18 C 40,12 24,22 5,38 C 22,30 38,22 48,23 L 50,30 L 52,23 C 62,22 78,30 95,38 C 76,22 60,12 50,18 Z;
                M 50,25 C 42,18 30,11 5,4 C 20,15 38,22 48,28 L 50,35 L 52,28 C 62,22 80,15 95,4 C 70,11 58,18 50,25 Z;
                M 50,22 C 42,16 28,10 5,14 C 20,20 38,24 48,27 L 50,34 L 52,27 C 62,24 80,20 95,14 C 72,10 58,16 50,22 Z
              "
            />
          </path>
        </svg>
      </div>

      {/* ─── 5. Hamparan Air Laut Senja Mewah & Deburan Ombak Hidup (Artistic Volumetric Sunset Ocean & Surf) ─── */}
      <div className="fixed bottom-0 inset-x-0 h-24 sm:h-28 md:h-32 lg:h-36 pointer-events-none select-none z-0 overflow-hidden">
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
            className="absolute inset-0 blur-xl opacity-80"
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

      {/* ─── 6. Siluet Pohon Kelapa Tropis Alami & Berkarakter (Sculpted Tropical Coconut Palms with Pinnate Leaflets) ─── */}
      <div
        className="fixed bottom-0 right-0 sm:right-1 w-64 sm:w-80 md:w-[380px] lg:w-[420px] h-84 sm:h-[420px] md:h-[480px] pointer-events-none select-none z-0"
        style={{
          transformOrigin: 'bottom right',
          animation: 'palmSwayGentle 9s ease-in-out infinite',
        }}
      >
        <svg
          viewBox="0 0 350 440"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Main Foreground Trunk: Obsidian Charcoal with Sunset Amber Undertone */}
            <linearGradient id="palmHeroTrunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2e1333" />
              <stop offset="30%" stopColor="#1a0b22" />
              <stop offset="70%" stopColor="#100617" />
              <stop offset="100%" stopColor="#08020d" />
            </linearGradient>

            {/* Companion Background Trunk: Deeper Atmospheric Silhouette */}
            <linearGradient id="palmCompanionTrunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#220c29" />
              <stop offset="40%" stopColor="#13061a" />
              <stop offset="100%" stopColor="#06020c" />
            </linearGradient>

            {/* Golden Sunset Rim Lighting (Setting Sun Backlight Highlight) */}
            <linearGradient id="palmSunsetRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#fde047" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#fb923c" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.2" />
            </linearGradient>

            {/* Coconut 3D Spherical Radial Shading */}
            <radialGradient id="coconutShade3D" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#4a2254" />
              <stop offset="35%" stopColor="#260f33" />
              <stop offset="75%" stopColor="#110519" />
              <stop offset="100%" stopColor="#06010b" />
            </radialGradient>
          </defs>

          {/* ══════════ LAYER 1: BEACH DUNE GRASS & ROOT BASE ══════════ */}
          {/* Swollen Root Bases anchored into sand */}
          <path
            d="M288,440 C290,432 295,426 304,424 C314,424 322,428 332,440 Z"
            fill="#12051a"
          />
          <path
            d="M320,440 C322,434 328,428 336,426 C344,428 348,433 350,440 Z"
            fill="#0b0312"
          />

          {/* Delicate Beach Dune Grass Blades (Sea Oats / Rumput Pantai Tropis) */}
          <path
            d="
              M280,440 Q275,420 268,405 Q274,422 284,440
              M290,440 Q288,415 282,395 Q292,418 296,440
              M300,440 Q305,418 312,402 Q310,422 305,440
              M315,440 Q322,415 330,398 Q325,420 320,440
              M332,440 Q340,418 348,406 Q342,424 336,440
              M342,440 Q348,425 352,412 Q350,428 346,440
            "
            fill="#150720"
          />
          <path
            d="
              M282,440 Q278,422 272,408
              M292,440 Q290,418 285,398
              M317,440 Q324,417 332,400
            "
            stroke="rgba(251, 191, 36, 0.4)"
            strokeWidth="0.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* ══════════ LAYER 2: COMPANION PALM TREE (BACKGROUND) ══════════ */}
          {/* Secondary Curved Trunk */}
          <path
            d="M346,440 C336,375 312,305 278,238 C273,232 269,236 272,242 C304,308 326,376 333,440 Z"
            fill="url(#palmCompanionTrunkGrad)"
          />
          {/* Companion Trunk Rim */}
          <path
            d="M333,440 C326,376 304,308 272,242"
            stroke="rgba(247, 147, 30, 0.35)"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Companion Bark Rings */}
          <path
            d="
              M326,420 Q332,422 338,420
              M318,390 Q324,392 330,390
              M308,360 Q314,362 320,360
              M298,330 Q303,332 309,330
              M288,300 Q293,302 299,300
              M280,272 Q284,274 290,272
              M274,250 Q277,252 282,250
            "
            stroke="#0a0314"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Companion Coconuts Cluster */}
          <circle cx="274" cy="242" r="5.5" fill="url(#coconutShade3D)" />
          <circle cx="268" cy="246" r="5" fill="url(#coconutShade3D)" />
          <circle cx="276" cy="248" r="4.5" fill="url(#coconutShade3D)" />

          {/* Companion Fronds (Animated Subtle Sway) */}
          <g
            style={{
              transformOrigin: '272px 240px',
              animation: 'palmFrondRustleLeft 6.8s ease-in-out infinite alternate 0.8s',
            }}
          >
            {/* Frond C1: Arching Left */}
            <path d="M272,240 C238,208 198,200 155,212 C192,218 232,226 270,242 Z" fill="#0d0418" />
            <path
              d="
                M255,232 Q246,245 240,252 M242,226 Q232,240 225,248 M228,220 Q216,236 208,245
                M214,216 Q200,232 190,242 M200,213 Q185,229 174,239 M185,212 Q170,227 158,236
                M170,212 Q156,225 146,233 M155,212 Q144,222 136,228
              "
              stroke="#0d0418"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Frond C2: Arching Top */}
            <path d="M272,240 C262,185 245,152 225,138 C238,158 255,195 271,241 Z" fill="#11051f" />
            <path
              d="
                M265,225 Q252,228 244,232 M258,208 Q244,212 234,217 M250,190 Q234,196 224,202
                M242,172 Q226,179 216,186 M234,156 Q218,164 210,172 M225,138 Q214,148 208,156
              "
              stroke="#11051f"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Frond C3: Arching Right */}
            <path d="M272,240 C298,205 328,195 348,205 C325,218 298,230 273,242 Z" fill="#0b0314" />
            <path
              d="
                M285,230 Q296,242 304,250 M298,222 Q310,235 320,244 M312,214 Q326,228 335,238
                M326,208 Q338,220 345,230 M338,206 Q346,215 350,222
              "
              stroke="#0b0314"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Frond C4: Low Left Droop */}
            <path d="M272,242 C240,268 205,295 172,328 C202,298 238,272 271,244 Z" fill="#0e0419" />
            <path
              d="
                M258,256 Q245,270 236,282 M244,270 Q230,285 220,298 M228,285 Q212,302 202,316
                M212,300 Q196,318 186,332 M194,315 Q180,332 172,345 M175,328 Q165,342 160,352
              "
              stroke="#0e0419"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Frond C5: Low Right Droop */}
            <path d="M272,244 C296,270 322,296 345,325 C325,295 300,270 274,245 Z" fill="#0a0312" />
          </g>

          {/* ══════════ LAYER 3: MAIN MAJESTIC HERO PALM TREE ══════════ */}
          {/* Main Curved Trunk with Elegant Natural S-Curve */}
          <path
            d="M328,440 C324,410 318,375 304,325 C290,270 266,208 228,142 C222,136 217,141 221,148 C256,214 278,278 290,332 C302,382 305,415 307,440 Z"
            fill="url(#palmHeroTrunkGrad)"
          />

          {/* Golden Sunset Rim Backlight on Trunk (Catching Sunset Rays) */}
          <path
            d="M307,440 C305,415 302,382 290,332 C278,278 256,214 221,148"
            stroke="url(#palmSunsetRimGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Textured Trunk Bark Rings (Horizontal Ridges / Bekas Pelepah Kelapa) */}
          <g opacity="0.9">
            <path d="M298,425 Q308,428 318,425" stroke="#160621" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M294,402 Q304,405 314,402" stroke="#160621" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M290,380 Q299,383 309,380" stroke="#160621" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M285,358 Q294,361 303,358" stroke="#160621" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M279,335 Q287,338 296,335" stroke="#160621" strokeWidth="1.7" strokeLinecap="round" fill="none" />
            <path d="M273,312 Q280,315 289,312" stroke="#160621" strokeWidth="1.7" strokeLinecap="round" fill="none" />
            <path d="M266,288 Q273,291 281,288" stroke="#160621" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <path d="M258,264 Q265,267 273,264" stroke="#160621" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <path d="M250,238 Q256,241 264,238" stroke="#160621" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M241,212 Q247,215 254,212" stroke="#160621" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M233,186 Q238,189 245,186" stroke="#160621" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            <path d="M225,162 Q230,165 236,162" stroke="#160621" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          </g>

          {/* Coconut Cluster beneath Crown with 3D Spherical Volume */}
          <g>
            <circle cx="218" cy="154" r="7.5" fill="url(#coconutShade3D)" />
            <circle cx="228" cy="156" r="8" fill="url(#coconutShade3D)" />
            <circle cx="212" cy="163" r="7" fill="url(#coconutShade3D)" />
            <circle cx="223" cy="166" r="7.5" fill="url(#coconutShade3D)" />
            <circle cx="233" cy="163" r="6.5" fill="url(#coconutShade3D)" />
            <circle cx="218" cy="173" r="6" fill="url(#coconutShade3D)" />
            {/* Coconut Golden Specular Rim Glints */}
            <path d="M214,151 A 5 5 0 0 1 218,155" stroke="rgba(253, 224, 71, 0.4)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
            <path d="M224,153 A 5.5 5.5 0 0 1 229,157" stroke="rgba(253, 224, 71, 0.4)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
            <path d="M209,161 A 4.5 4.5 0 0 1 213,165" stroke="rgba(253, 224, 71, 0.35)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          </g>

          {/* ══════════ LAYER 4: SCULPTED VOLUMETRIC FRONDS ══════════ */}
          {/* GROUP A: Leftward & Top Fronds (Swaying in warm coastal breeze) */}
          <g
            style={{
              transformOrigin: '224px 145px',
              animation: 'palmFrondRustleLeft 7.8s ease-in-out infinite alternate',
            }}
          >
            {/* FROND 1: Upright Juvenile Center Pinnacle (Reaching high towards twilight zenith) */}
            <path
              d="M224,145 Q218,85 208,35 Q222,85 225,145 Z"
              fill="#180a26"
            />
            {/* Pinnate Feathered Leaflets along Frond 1 */}
            <path
              d="
                M222,130 Q212,120 200,115 M220,115 Q208,104 195,98 M218,100 Q204,88 190,82
                M215,85 Q200,72 186,66 M212,70 Q198,56 184,50 M210,55 Q198,42 185,38 M208,38 Q200,28 192,26
                M224,130 Q232,120 242,116 M223,115 Q234,104 245,99 M221,100 Q233,88 246,84
                M218,85 Q230,72 242,67 M215,70 Q228,56 240,52 M212,55 Q224,42 235,39
              "
              stroke="#180a26"
              strokeWidth="2.0"
              strokeLinecap="round"
            />
            {/* Frond 1 Spine Golden Rim */}
            <path d="M224,145 Q218,85 208,35" stroke="url(#palmSunsetRimGrad)" strokeWidth="1.2" strokeLinecap="round" fill="none" />

            {/* FROND 2: Arching High Left (Graceful arch towards the setting sun) */}
            <path
              d="M224,145 C190,92 150,72 95,78 C145,86 190,112 222,146 Z"
              fill="#1e0c2e"
            />
            {/* Dense Feathered Leaflets cascading from Frond 2 */}
            <path
              d="
                M215,134 Q205,150 196,158 M204,124 Q192,144 182,154 M192,115 Q178,138 166,150
                M180,107 Q164,132 150,146 M168,100 Q150,126 136,142 M156,94 Q136,120 122,136
                M144,89 Q124,115 108,130 M132,85 Q112,110 96,125 M120,82 Q100,105 85,119
                M108,80 Q88,100 74,113 M95,78 Q78,95 65,106
              "
              stroke="#13061f"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Upper Leaflets on Frond 2 */}
            <path
              d="
                M212,130 Q205,116 198,110 M200,120 Q190,104 180,97 M188,111 Q175,94 163,86
                M176,103 Q160,85 146,77 M164,96 Q146,78 130,70 M150,90 Q132,72 115,65
                M136,85 Q116,68 100,62 M122,82 Q102,66 88,62 M108,80 Q90,66 78,65
              "
              stroke="#1c0a2a"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Frond 2 Spine Golden Highlight */}
            <path d="M224,145 C190,92 150,72 95,78" stroke="url(#palmSunsetRimGrad)" strokeWidth="1.4" strokeLinecap="round" fill="none" />

            {/* FROND 4: Mid-Left Majestic Spreader (Wide Cascading Showpiece Frond) */}
            <path
              d="M220,148 C168,122 118,126 68,148 C118,140 172,136 218,150 Z"
              fill="#160822"
            />
            {/* Leaflets on Mid-Left Frond (Downward Cascading Comb) */}
            <path
              d="
                M210,145 Q198,168 190,178 M198,140 Q184,166 174,178 M186,136 Q170,165 158,180
                M174,133 Q156,164 142,181 M162,131 Q142,164 128,182 M150,130 Q128,164 114,182
                M138,131 Q116,165 102,182 M126,133 Q104,166 90,181 M114,136 Q92,167 78,180
                M102,139 Q80,167 68,178 M90,142 Q70,166 58,174 M78,145 Q60,163 50,169 M68,148 Q52,160 44,164
              "
              stroke="#11051b"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Upper Leaflets on Mid-Left Frond */}
            <path
              d="
                M208,143 Q200,128 192,122 M196,138 Q186,122 176,115 M184,134 Q172,117 160,110
                M172,131 Q158,114 144,106 M160,129 Q144,112 128,105 M148,129 Q130,111 114,105
                M136,130 Q118,113 102,108 M124,132 Q104,116 90,113 M112,135 Q92,120 80,119
                M100,138 Q82,125 72,127 M88,142 Q72,132 64,135
              "
              stroke="#190926"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
            {/* Frond 4 Spine Golden Highlight */}
            <path d="M220,148 C168,122 118,126 68,148" stroke="url(#palmSunsetRimGrad)" strokeWidth="1.4" strokeLinecap="round" fill="none" />

            {/* FROND 6: Low-Left Drooper (Cascading towards the Beach & Seafoam) */}
            <path
              d="M218,154 C175,182 140,215 105,255 C142,224 182,192 220,157 Z"
              fill="#13061f"
            />
            {/* Drooping Leaflets on Frond 6 */}
            <path
              d="
                M208,166 Q194,185 184,200 M196,178 Q180,200 168,216 M184,190 Q166,215 152,234
                M172,203 Q152,230 138,250 M158,216 Q138,245 124,266 M144,229 Q124,258 110,280
                M130,242 Q110,272 98,294 M116,252 Q98,282 86,304 M105,255 Q90,285 80,308
              "
              stroke="#10041a"
              strokeWidth="2.0"
              strokeLinecap="round"
            />
            <path
              d="
                M204,162 Q196,150 188,144 M192,172 Q182,160 172,152 M178,184 Q166,170 154,162
                M164,196 Q150,182 138,175 M150,210 Q134,195 122,188 M136,224 Q120,208 108,202
              "
              stroke="#160822"
              strokeWidth="1.7"
              strokeLinecap="round"
            />

            {/* FROND 8: Foreground Crown Filler (Adds 3D Volumetric Fullness) */}
            <path
              d="M220,152 C192,165 168,180 148,205 C172,185 198,170 222,154 Z"
              fill="#1a0b28"
            />
            <path
              d="
                M208,158 Q196,172 188,182 M196,166 Q182,182 172,194 M184,174 Q168,192 156,206
                M172,184 Q154,204 142,220 M158,195 Q140,216 128,232 M148,205 Q132,225 120,242
              "
              stroke="#140620"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
          </g>

          {/* GROUP B: Rightward & Background Fronds (Counter-Swaying in breeze) */}
          <g
            style={{
              transformOrigin: '226px 145px',
              animation: 'palmFrondRustleRight 8.6s ease-in-out infinite alternate',
            }}
          >
            {/* FROND 3: Arching High Right (Leaning toward screen edge) */}
            <path
              d="M226,145 C260,92 298,80 340,90 C300,102 260,120 224,146 Z"
              fill="#13061d"
            />
            {/* Frond 3 Leaflets */}
            <path
              d="
                M236,134 Q248,150 258,160 M248,124 Q262,142 274,154 M260,114 Q276,135 290,148
                M274,105 Q292,128 308,142 M288,98 Q308,122 324,136 M302,93 Q324,118 340,132
                M316,90 Q338,114 350,126 M330,89 Q348,110 354,120
              "
              stroke="#0f0417"
              strokeWidth="2.1"
              strokeLinecap="round"
            />
            <path
              d="
                M238,130 Q246,116 254,110 M250,118 Q260,104 270,97 M264,108 Q276,94 288,86
                M278,100 Q292,85 306,78 M294,94 Q310,78 324,72 M310,90 Q326,76 338,72
              "
              stroke="#170822"
              strokeWidth="1.7"
              strokeLinecap="round"
            />

            {/* FROND 5: Mid-Right Ocean Sweeper */}
            <path
              d="M226,150 C272,136 312,145 348,170 C312,158 270,154 224,152 Z"
              fill="#100419"
            />
            <path
              d="
                M238,148 Q250,168 260,178 M252,145 Q266,168 278,180 M266,142 Q282,168 296,182
                M280,141 Q298,168 314,183 M296,142 Q316,170 330,185 M312,145 Q332,172 344,186
                M328,152 Q346,175 352,186 M342,162 Q352,180 355,188
              "
              stroke="#0c0313"
              strokeWidth="2.1"
              strokeLinecap="round"
            />
            <path
              d="
                M238,144 Q248,128 256,122 M252,140 Q264,122 274,116 M266,138 Q280,119 292,112
                M280,137 Q296,118 310,112 M296,138 Q312,120 326,116 M312,142 Q328,126 340,123
              "
              stroke="#150720"
              strokeWidth="1.7"
              strokeLinecap="round"
            />

            {/* FROND 7: Low-Right Drooper */}
            <path
              d="M226,155 C268,190 298,228 328,272 C295,235 264,195 224,157 Z"
              fill="#0e0417"
            />
            <path
              d="
                M238,168 Q252,188 262,204 M250,180 Q266,204 278,222 M264,194 Q282,220 296,240
                M278,210 Q298,238 312,260 M292,226 Q312,256 324,280 M306,244 Q324,274 334,298
                M320,260 Q334,288 340,308 M328,272 Q340,296 344,314
              "
              stroke="#0a0211"
              strokeWidth="1.9"
              strokeLinecap="round"
            />

            {/* FROND 9: Rear Silhouette Depth Filler */}
            <path
              d="M224,142 C200,105 175,98 150,102 C178,105 204,120 226,144 Z"
              fill="#0d0417"
            />
            <path
              d="
                M216,134 Q204,146 195,154 M204,124 Q190,138 180,148 M192,116 Q176,132 165,142
                M178,110 Q160,126 148,138 M164,106 Q146,122 134,134 M150,102 Q134,118 122,130
              "
              stroke="#0b0313"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

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
