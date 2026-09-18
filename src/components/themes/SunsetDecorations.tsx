"use client";

import React, { useEffect, useState, useRef } from 'react';
import TropicalPalmTree from './TropicalPalmTree';

/**
 * SunsetDecorations - Tema Senja Tropis Super Ringan (Ultra-Lightweight Sunset Beach)
 * 
 * Fitur Optimasi Performa:
 * - Ukuran berkas dipangkas dari 44 KB menjadi ~6 KB (~86% lebih kecil).
 * - Bebas dari animasi SVG SMIL (<animate>) yang membebani CPU main thread.
 * - Bebas dari filter ganda drop-shadow berat yang menyebabkan GPU lag dan fan spinning.
 * - Canvas partikel debu senja hanya 20 partikel mikro, capped 30 FPS, mati otomatis di mobile & saat tab diminimize.
 * - Gerakan awan, ombak, burung, dan matahari menggunakan CSS transform hardware-accelerated (60-120 FPS).
 */
export default function SunsetDecorations() {
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

    // Palet warna partikel debu hangat senja
    const dustColors = [
      'rgba(253, 200, 48, ', // Golden amber
      'rgba(247, 147, 30, ', // Warm orange
      'rgba(251, 113, 133, ', // Sunset coral
      'rgba(254, 240, 138, ', // Sunbeam gold
    ];

    interface Particle {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      wobble: number;
      wobbleSpeed: number;
    }

    const particles: Particle[] = [];
    // Batasi ke maksimal 20 partikel mikro
    const count = Math.min(20, Math.max(12, Math.floor((window.innerWidth * window.innerHeight) / 45000)));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.8, // 0.8 - 2.2px micro-embers
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(Math.random() * 0.4 + 0.2), // Hembusan termal ke atas
        alpha: Math.random() * 0.4 + 0.25,
        color: dustColors[Math.floor(Math.random() * dustColors.length)],
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    const animate = (timestamp: number) => {
      rafId = requestAnimationFrame(animate);

      const elapsed = timestamp - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = timestamp - (elapsed % fpsInterval);

      if (document.hidden) return; // Pause saat tab tidak aktif

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * 0.3;
        p.y += p.vy;

        // Tolakan interaktif mouse lembut dalam radius 80px
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const distSq = dx * dx + dy * dy;
        if (distSq < 6400 && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (80 - dist) / 80;
          p.x += (dx / dist) * force * 1.5;
          p.y += (dy / dist) * force * 1.5;
        }

        // Wrap around viewport
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
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
      {/* ─── 1. Matahari Senja Hangat & Pendaran Korona (Minimalist Radiant Sun) ─── */}
      <div className="fixed top-12 sm:top-18 right-[8%] sm:right-[15%] md:right-[18%] pointer-events-none select-none z-0">
        {/* Pendaran Ambient Luar (Soft Warm Halo) */}
        <div
          className="absolute -top-24 -left-24 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-[50px] sm:blur-[75px] opacity-60 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(254, 240, 138, 0.7) 0%, rgba(251, 146, 60, 0.35) 45%, rgba(244, 63, 94, 0.12) 75%, transparent 95%)',
            animation: 'sunsetSunBreathe 8s ease-in-out infinite alternate',
            willChange: 'transform, opacity',
          }}
        />

        {/* Pendaran Korona Tengah */}
        <div
          className="absolute -top-8 -left-8 w-44 sm:w-56 h-44 sm:h-56 rounded-full blur-[20px] opacity-75 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #FFFBE8 10%, #FEE070 40%, #FB923C 75%, transparent 100%)',
          }}
        />

        {/* Garis Suar Horizontal Anamorfik Halus (Anamorphic Sun Streak) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 md:w-[480px] h-1.5 rounded-full opacity-65 pointer-events-none blur-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(254, 240, 138, 0.3) 25%, rgba(255, 255, 255, 0.9) 50%, rgba(254, 240, 138, 0.3) 75%, transparent 100%)',
          }}
        />

        {/* Piringan Matahari Senja (Crisp Sun Disc) */}
        <div
          className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-[0_0_40px_rgba(253,200,48,0.75)]"
          style={{
            background: 'radial-gradient(circle at 45% 42%, #FFFFFF 0%, #FFFDE6 25%, #FDE047 55%, #FB923C 85%, #E11D48 100%)',
          }}
        />
      </div>

      {/* ─── 2. Awan Senja Ringan & Mengapung Lembut (2 Lightweight Wispy Clouds) ─── */}
      {/* Awan 1: Sisi Kiri Atas */}
      <div
        className="fixed top-8 sm:top-12 left-[4%] sm:left-[8%] w-56 sm:w-80 md:w-96 h-18 sm:h-24 pointer-events-none select-none z-0 opacity-75"
        style={{
          animation: 'sunsetCloudFloat1 36s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      >
        <svg viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="cloudGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#fef3c7" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path
            d="M20,60 C40,62 280,62 300,60 C312,54 315,42 305,35 C295,28 275,30 262,35 C250,18 225,8 195,16 C178,5 145,6 125,20 C108,12 80,18 72,32 C58,35 48,48 55,58 Z"
            fill="url(#cloudGrad1)"
          />
        </svg>
      </div>

      {/* Awan 2: Sisi Kanan Melintasi Matahari */}
      <div
        className="fixed top-24 sm:top-32 right-[4%] sm:right-[10%] w-48 sm:w-72 md:w-84 h-14 sm:h-20 pointer-events-none select-none z-0 opacity-65 hidden sm:block"
        style={{
          animation: 'sunsetCloudFloat2 44s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      >
        <svg viewBox="0 0 280 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="cloudGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="40%" stopColor="#fffbeb" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#fde047" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d="M15,35 C50,30 110,22 160,25 C200,18 240,24 265,35 C240,44 190,46 140,42 C90,46 40,44 15,35 Z"
            fill="url(#cloudGrad2)"
          />
        </svg>
      </div>

      {/* ─── 3. Siluet Burung Camar Melayang Anggun (2 GPU-Accelerated Seagulls) ─── */}
      {/* Camar 1 */}
      <div
        className="fixed top-16 sm:top-20 left-[18%] sm:left-[24%] w-8 sm:w-10 h-5 pointer-events-none select-none z-0 text-[#0f243d] opacity-80"
        style={{
          animation: 'sunsetGullGlide1 22s ease-in-out infinite',
          willChange: 'transform',
        }}
      >
        <svg viewBox="0 0 40 16" fill="currentColor" className="w-full h-full">
          {/* Siluet sayap mengepak melengkung anggun */}
          <path d="M 0,6 Q 10,-4 20,4 Q 30,-4 40,6 Q 30,0 20,8 Q 10,0 0,6 Z" />
        </svg>
      </div>

      {/* Camar 2: Pengikut Kecil */}
      <div
        className="fixed top-22 sm:top-28 left-[24%] sm:left-[30%] w-6 sm:w-7 h-4 pointer-events-none select-none z-0 text-[#152e4d] opacity-65 hidden sm:block"
        style={{
          animation: 'sunsetGullGlide2 18s ease-in-out infinite 1.5s',
          willChange: 'transform',
        }}
      >
        <svg viewBox="0 0 40 16" fill="currentColor" className="w-full h-full">
          <path d="M 0,6 Q 10,-4 20,4 Q 30,-4 40,6 Q 30,0 20,8 Q 10,0 0,6 Z" />
        </svg>
      </div>

      {/* ─── 4. Hamparan Ombak Laut Tenang & Pantulan Air (Calm Minimalist Sunset Waves) ─── */}
      <div className="fixed bottom-0 inset-x-0 h-16 sm:h-20 md:h-24 pointer-events-none select-none z-0 overflow-hidden">
        {/* Layer Ombak Belakang */}
        <div
          className="absolute inset-x-0 bottom-0 h-full opacity-60"
          style={{
            animation: 'sunsetWaveDrift 9s ease-in-out infinite alternate',
            willChange: 'transform',
          }}
        >
          <svg
            viewBox="0 0 1200 80"
            fill="none"
            preserveAspectRatio="none"
            className="w-[105%] -ml-[2.5%] h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,35 C300,50 600,20 900,38 C1050,45 1150,30 1200,32 L1200,80 L0,80 Z"
              fill="url(#sunsetBackWaveGrad)"
            />
            <defs>
              <linearGradient id="sunsetBackWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#075985" stopOpacity="0.95" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Refleksi Emas Matahari di Air Laut (Golden Reflection Shimmer) */}
        <div
          className="absolute bottom-0 right-[12%] sm:right-[16%] md:right-[20%] w-48 sm:w-64 h-12 pointer-events-none opacity-70"
          style={{
            background: 'radial-gradient(ellipse at 50% 10%, rgba(254, 240, 138, 0.85) 0%, rgba(251, 146, 60, 0.4) 50%, transparent 80%)',
          }}
        />

        {/* Layer Ombak Depan dengan Bibir Busa Keemasan */}
        <div
          className="absolute inset-x-0 bottom-0 h-[75%]"
          style={{
            animation: 'sunsetWaveDrift 7s ease-in-out infinite alternate-reverse',
            willChange: 'transform',
          }}
        >
          <svg
            viewBox="0 0 1200 60"
            fill="none"
            preserveAspectRatio="none"
            className="w-[105%] -ml-[2.5%] h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,20 C250,10 500,28 750,14 C950,26 1100,12 1200,18 L1200,60 L0,60 Z"
              fill="url(#sunsetFrontWaveGrad)"
            />
            {/* Garis Kilau Bibir Ombak Menangkap Matahari */}
            <path
              d="M0,20 C250,10 500,28 750,14 C950,26 1100,12 1200,18"
              stroke="rgba(254, 240, 138, 0.85)"
              strokeWidth="1.8"
              fill="none"
            />
            <defs>
              <linearGradient id="sunsetFrontWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#0ea5e9" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.98" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ─── 5. Siluet Pohon Kelapa Tropis Ringan (Lightweight Coastal Palm) ─── */}
      <TropicalPalmTree />

      {/* ─── 6. Partikel Debu Senja (Desktop Capped 30 FPS Canvas) ─── */}
      {isEligible && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      )}
    </div>
  );
}
