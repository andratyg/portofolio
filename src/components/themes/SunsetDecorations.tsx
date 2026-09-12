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

    const count = Math.min(50, Math.floor((window.innerWidth * window.innerHeight) / 24000));

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

    const animate = (timestamp: number) => {
      rafId = requestAnimationFrame(animate);

      const elapsed = timestamp - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = timestamp - (elapsed % fpsInterval);

      if (document.hidden) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

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

      {/* ─── 2. Awan Senja Melayang (Soft White Sun-Kissed Beach Clouds) ─── */}
      {/* Cloud 1 - Upper Left */}
      <div
        className="fixed top-8 -left-10 w-64 sm:w-96 h-24 pointer-events-none opacity-50 select-none z-0"
        style={{ animation: 'cloudDrift1 28s ease-in-out infinite alternate' }}
      >
        <svg viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M20,60 Q50,30 90,45 Q130,20 180,35 Q220,15 260,38 Q290,48 310,60 Q270,72 170,70 Q70,72 20,60 Z"
            fill="url(#cloudGrad1)"
          />
          <defs>
            <linearGradient id="cloudGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#fff3e0" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Cloud 2 - Center Mid Sky */}
      <div
        className="fixed top-24 right-1/4 w-72 sm:w-[420px] h-28 pointer-events-none opacity-45 select-none z-0"
        style={{ animation: 'cloudDrift2 34s ease-in-out infinite alternate' }}
      >
        <svg viewBox="0 0 360 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M30,65 Q70,35 120,50 Q170,25 230,40 Q280,20 330,52 Q350,65 340,75 Q270,85 180,82 Q90,85 30,65 Z"
            fill="url(#cloudGrad2)"
          />
          <defs>
            <linearGradient id="cloudGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#fed7aa" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fdba74" stopOpacity="0.35" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ─── 3. Matahari Senja Utama (Glorious Setting Sunset Sun) ─── */}
      <div className="fixed top-16 sm:top-24 md:top-28 right-[6%] sm:right-[14%] md:right-[18%] pointer-events-none select-none z-0">
        {/* Outermost huge atmospheric diffusion aura */}
        <div
          className="absolute -top-36 -left-36 w-[360px] sm:w-[500px] md:w-[600px] h-[360px] sm:h-[500px] md:h-[600px] rounded-full blur-[110px] opacity-50 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(253, 200, 48, 0.55) 0%, rgba(247, 147, 30, 0.38) 45%, rgba(220, 73, 77, 0.18) 70%, transparent 85%)',
          }}
        />

        {/* Middle radiant sunset corona */}
        <div
          className="absolute -top-12 -left-12 w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 rounded-full blur-[32px] opacity-75 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #FFF2B2 0%, #FDC830 35%, #F7931E 70%, transparent 90%)',
          }}
        />

        {/* Horizontal sunbeam flare */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[460px] md:w-[560px] h-2 rounded-full opacity-65 pointer-events-none blur-[1.5px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(253, 200, 48, 0.25) 20%, rgba(255, 255, 255, 0.85) 50%, rgba(253, 200, 48, 0.25) 80%, transparent 100%)',
          }}
        />

        {/* Brilliant Inner Sun Disc */}
        <div
          className="relative w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF4CC 22%, #FDC830 52%, #F7931E 80%, #F7526B 100%)',
            boxShadow: '0 0 50px rgba(253, 200, 48, 0.85), 0 0 100px rgba(247, 147, 30, 0.55), 0 0 160px rgba(247, 82, 107, 0.35)',
          }}
        />
      </div>

      {/* ─── 4. Siluet Burung Camar Terbang (Flying Seagulls) ─── */}
      <div
        className="fixed top-20 sm:top-24 left-[10%] sm:left-[20%] w-28 sm:w-36 h-16 pointer-events-none select-none z-0 text-[#10243e] opacity-75"
        style={{
          animation: 'seagullGlide 12s ease-in-out infinite alternate',
        }}
      >
        <svg viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Seagull 1 (Leader) */}
          <path
            d="M50,15 C58,8 68,10 74,18 C80,10 90,8 98,15 C88,14 80,20 74,25 C68,20 60,14 50,15 Z"
            fill="currentColor"
          />
          {/* Seagull 2 (Follower - smaller) */}
          <path
            d="M10,28 C16,22 24,24 28,30 C32,24 40,22 46,28 C39,27 33,32 28,36 C23,32 17,27 10,28 Z"
            fill="currentColor"
            opacity="0.8"
          />
          {/* Seagull 3 (Distant) */}
          <path
            d="M85,38 C90,34 96,35 99,40 C102,35 108,34 113,38 C108,37 103,41 99,44 C95,41 90,37 85,38 Z"
            fill="currentColor"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* ─── 5. Hamparan Air Laut Senja Alami & Deburan Ombak (Natural Luminous Sunset Ocean & Shoreline) ─── */}
      <div className="fixed bottom-0 inset-x-0 h-16 sm:h-20 md:h-24 lg:h-28 pointer-events-none select-none z-0 overflow-hidden">
        {/* Layer A: Base Sea Water Horizon & Atmospheric Coastal Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-full">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Deep ocean body with soft gentle slope */}
            <path
              d="M0,26 C360,34 720,16 1080,22 C1260,14 1380,20 1440,18 L1440,100 L0,100 Z"
              fill="url(#deepOceanSunsetGrad)"
            />
            {/* Horizon rim catching warm sunset amber glow under the sun disc */}
            <path
              d="M0,26 C360,34 720,16 1080,22 C1260,14 1380,20 1440,18"
              stroke="url(#horizonSunsetGlowGrad)"
              strokeWidth="1.5"
              fill="none"
            />
            <defs>
              <linearGradient id="deepOceanSunsetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                <stop offset="35%" stopColor="#0369a1" stopOpacity="0.88" />
                <stop offset="70%" stopColor="#0891b2" stopOpacity="0.94" />
                <stop offset="100%" stopColor="#0f766e" stopOpacity="0.98" />
              </linearGradient>
              <linearGradient id="horizonSunsetGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.5" />
                <stop offset="75%" stopColor="#fbbf24" stopOpacity="0.85" />
                <stop offset="88%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.5" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Layer B: Natural Sunlight Glitter Reflection on Water (Jalan Pantulan Cahaya Matahari di Laut) */}
        <div
          className="absolute bottom-1 right-[8%] sm:right-[13%] md:right-[16%] w-48 sm:w-64 md:w-76 h-14 sm:h-18 md:h-22 pointer-events-none"
          style={{ animation: 'oceanGlintShimmer 4.5s ease-in-out infinite alternate' }}
        >
          {/* Soft golden shimmer haze directly underneath the setting sun */}
          <div
            className="absolute inset-0 blur-md opacity-60"
            style={{
              background: 'radial-gradient(ellipse at 50% 20%, rgba(254, 240, 138, 0.7) 0%, rgba(251, 191, 36, 0.4) 45%, rgba(245, 158, 11, 0.1) 75%, transparent 100%)',
            }}
          />
          {/* Organic perspective ripple glints */}
          <svg viewBox="0 0 280 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative">
            {/* Distant delicate ripples */}
            <path d="M105,8 C120,6 145,9 165,7 C180,9 190,7 200,8" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
            <path d="M115,15 C130,13 155,16 175,14 C185,16 195,14 205,15" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
            
            {/* Midground glistening ripples */}
            <path d="M80,24 C110,21 145,26 185,23 C205,26 220,24 235,25" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
            <path d="M95,33 C125,30 160,35 195,32 C215,35 230,33 245,34" stroke="#fef08a" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
            
            {/* Near-distance expanding sparkles */}
            <path d="M50,44 C90,40 140,46 190,42 C220,46 245,43 260,45" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
            <path d="M70,54 C105,50 150,56 200,52 C225,56 245,53 255,55" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
            
            {/* Foreground wide warm ripples */}
            <path d="M30,65 C80,60 140,67 205,62 C235,66 260,63 275,65" stroke="#fef08a" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
          </svg>
        </div>

        {/* Layer C: Rolling Middle Ocean Wave (Ombak Laut Tengah) */}
        <div
          className="absolute inset-x-0 bottom-2 sm:bottom-3 h-[72%]"
          style={{ animation: 'oceanWaveSlow 8.5s ease-in-out infinite alternate' }}
        >
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            preserveAspectRatio="none"
            className="w-[106%] -ml-[3%] h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,32 C260,44 540,20 800,34 C1060,48 1280,18 1440,26 L1440,80 L0,80 Z"
              fill="url(#midOceanWaveGrad)"
            />
            {/* Soft, continuous wave crest */}
            <path
              d="M0,32 C260,44 540,20 800,34 C1060,48 1280,18 1440,26"
              stroke="rgba(224, 242, 254, 0.7)"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
            <defs>
              <linearGradient id="midOceanWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#0284c7" stopOpacity="0.88" />
                <stop offset="75%" stopColor="#0369a1" stopOpacity="0.94" />
                <stop offset="100%" stopColor="#0891b2" stopOpacity="0.97" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Layer D: Near Shore Cresting Wave with Translucent Turquoise & Soft Organic Foam (Ombak Mendekati Pantai) */}
        <div
          className="absolute inset-x-0 bottom-1 sm:bottom-2 h-[55%]"
          style={{ animation: 'oceanWaveFast 6.8s ease-in-out infinite alternate' }}
        >
          <svg
            viewBox="0 0 1440 65"
            fill="none"
            preserveAspectRatio="none"
            className="w-[106%] -ml-[3%] h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,26 C300,16 560,34 840,20 C1120,34 1320,14 1440,22 L1440,65 L0,65 Z"
              fill="url(#nearShoreTurquoiseGrad)"
            />
            {/* Soft white wave crest line */}
            <path
              d="M0,26 C300,16 560,34 840,20 C1120,34 1320,14 1440,22"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(2, 132, 199, 0.3))' }}
            />
            {/* Subtle translucent froth curl under crest */}
            <path
              d="M0,27 C300,17 560,35 840,21 C1120,35 1320,15 1440,23"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <defs>
              <linearGradient id="nearShoreTurquoiseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.82" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.94" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Layer E: Shoreline Surf (Buih Air Laut Lembut Menyapu Pasir) */}
        <div
          className="absolute inset-x-0 bottom-0.5 sm:bottom-1 h-[38%]"
          style={{ animation: 'oceanWaveSlow 5.5s ease-in-out infinite alternate 0.8s' }}
        >
          <svg
            viewBox="0 0 1440 45"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Translucent shallow shoreline wash */}
            <path
              d="M0,18 C340,26 680,12 1020,20 C1220,14 1360,22 1440,16 L1440,45 L0,45 Z"
              fill="url(#shallowShoreSurfGrad)"
            />
            {/* Soft continuous frothy surf edge line */}
            <path
              d="M0,18 C340,26 680,12 1020,20 C1220,14 1360,22 1440,16"
              stroke="rgba(255, 255, 255, 0.82)"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
            <defs>
              <linearGradient id="shallowShoreSurfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.65" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.82" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Layer F: Warm Sun-Kissed Golden Sand Beach Dunes (Bibir Pantai Pasir Emas) */}
        <div className="absolute inset-x-0 bottom-0 h-[22%]">
          <svg
            viewBox="0 0 1440 32"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Warm golden sand dunes */}
            <path
              d="M0,14 C260,8 580,18 880,10 C1140,16 1320,8 1440,12 L1440,32 L0,32 Z"
              fill="url(#warmBeachSandGrad)"
            />
            {/* Wet glossy sand sheen reflecting sea water & sunlight */}
            <path
              d="M0,14 C260,8 580,18 880,10 C1140,16 1320,8 1440,12"
              stroke="rgba(254, 240, 138, 0.45)"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />
            <defs>
              <linearGradient id="warmBeachSandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#df9b56" stopOpacity="0.78" />
                <stop offset="30%" stopColor="#bd7432" stopOpacity="0.88" />
                <stop offset="65%" stopColor="#8c4d1c" stopOpacity="0.94" />
                <stop offset="100%" stopColor="#54270a" stopOpacity="0.98" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ─── 6. Siluet Pohon Kelapa Tropis Alami & Berkarakter (Realistic Tropical Silhouette Palm Trees) ─── */}
      <div
        className="fixed bottom-0 right-0 sm:right-2 w-56 sm:w-76 md:w-96 h-84 sm:h-[440px] md:h-[500px] pointer-events-none select-none z-0"
        style={{
          transformOrigin: 'bottom right',
          animation: 'palmSwayGentle 8.5s ease-in-out infinite',
        }}
      >
        <svg
          viewBox="0 0 340 440"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* --- MAIN PALM TREE --- */}
          {/* Main Curved Trunk - Deep charcoal silhouette with warm sunset rim */}
          <path
            d="M320,440 C300,340 265,240 195,155 C190,149 186,155 190,161 C255,245 288,340 305,440 Z"
            fill="#10081d"
          />
          {/* Trunk golden rim highlight */}
          <path
            d="M320,440 C300,340 265,240 195,155"
            stroke="rgba(247, 147, 30, 0.4)"
            strokeWidth="1.2"
            fill="none"
          />

          {/* Coconut Cluster beneath crown */}
          <circle cx="196" cy="162" r="7" fill="#0d0618" />
          <circle cx="189" cy="166" r="6.5" fill="#0b0515" />
          <circle cx="202" cy="167" r="6" fill="#120920" />

          {/* Crown Fronds (Detailed Feathered Silhouette) */}
          {/* Frond 1: Arching High Left */}
          <path
            d="M195,155 C165,115 125,90 60,82 C105,98 150,125 192,157 Z"
            fill="#0f071c"
          />
          <path
            d="M60,82 C75,80 90,83 105,92 M80,84 C95,88 110,96 125,107 M100,92 C118,98 135,110 150,124"
            stroke="#0f071c"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Frond 2: Arching Top Center */}
          <path
            d="M195,155 C180,95 148,45 88,25 C122,50 160,95 194,156 Z"
            fill="#130a24"
          />
          <path
            d="M88,25 C102,32 118,45 130,60 M110,40 C125,52 140,70 152,88 M130,58 C145,74 160,95 170,118"
            stroke="#130a24"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Frond 3: Arching Top Right */}
          <path
            d="M195,155 C235,100 280,75 335,78 C290,102 245,130 197,156 Z"
            fill="#10081d"
          />
          <path
            d="M335,78 C315,86 295,100 280,115 M310,88 C292,100 275,116 260,132 M280,105 C265,118 250,135 235,148"
            stroke="#10081d"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Frond 4: Sweeping Far Left */}
          <path
            d="M195,155 C145,145 90,158 35,190 C85,178 140,168 193,157 Z"
            fill="#0d0618"
          />
          <path
            d="M35,190 C55,180 75,175 98,172 M55,182 C78,174 100,170 125,168 M80,175 C105,170 130,167 155,165"
            stroke="#0d0618"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Frond 5: Drooping Low Left */}
          <path
            d="M195,155 C160,185 118,220 70,265 C110,230 155,195 194,158 Z"
            fill="#120921"
          />
          <path
            d="M70,265 C92,245 115,225 140,205 M95,240 C118,220 140,200 162,185"
            stroke="#120921"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Frond 6: Drooping Far Right */}
          <path
            d="M195,155 C250,165 295,195 330,240 C295,205 250,178 196,157 Z"
            fill="#10081e"
          />
          <path
            d="M330,240 C308,218 285,198 260,182 M305,220 C285,200 262,185 240,172"
            stroke="#10081e"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* --- SECONDARY COMPANION PALM TREE (LEANING SMALLER PALM) --- */}
          {/* Secondary Curved Trunk */}
          <path
            d="M340,440 C325,360 295,295 245,235 C241,230 238,235 241,239 C282,295 312,360 326,440 Z"
            fill="#0b0514"
          />
          <circle cx="246" cy="238" r="5" fill="#080410" />
          <circle cx="241" cy="242" r="4.5" fill="#0a0512" />

          {/* Secondary Fronds */}
          <path
            d="M245,235 C205,205 160,195 115,208 C155,215 198,225 243,237 Z"
            fill="#0a0412"
          />
          <path
            d="M245,235 C278,200 315,188 340,195 C310,210 278,225 244,237 Z"
            fill="#0d0618"
          />
          <path
            d="M245,235 C220,265 185,295 145,325 C180,295 215,265 244,238 Z"
            fill="#090410"
          />
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
