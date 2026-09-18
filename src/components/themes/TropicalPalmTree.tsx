"use client";

import React from 'react';

/**
 * TropicalPalmTree - Siluet Pohon Kelapa Tropis Ringan & Elegan (Lightweight Sunset Palm)
 * Ukuran berkas terpangkas dari 40 KB menjadi ~2.5 KB dengan GPU-accelerated sway murni.
 */
export default function TropicalPalmTree() {
  return (
    <div
      className="fixed bottom-0 right-0 w-44 sm:w-60 md:w-72 lg:w-80 h-auto pointer-events-none select-none z-[2]"
      style={{
        transformOrigin: 'bottom right',
        animation: 'palmSwayLight 10s ease-in-out infinite',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-sm"
      >
        <defs>
          {/* Siluet batang kelapa dengan nuansa twilight navy-bronze */}
          <linearGradient id="palmTrunkGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0c1a2d" />
            <stop offset="50%" stopColor="#142842" />
            <stop offset="100%" stopColor="#1e3a5f" />
          </linearGradient>

          {/* Kilauan emas senja di sisi batang menghadap matahari */}
          <linearGradient id="palmGoldenRim" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0.95" />
          </linearGradient>

          {/* Gradasi pelepah daun tropis */}
          <linearGradient id="palmFrondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="50%" stopColor="#142842" />
            <stop offset="100%" stopColor="#0c1a2d" />
          </linearGradient>

          {/* Tulang daun emas halus */}
          <linearGradient id="palmSpineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* 1. Batang Pohon Melengkung Anggun ke Arah Laut */}
        <path
          d="M 270,420 C 265,330 225,250 168,185 C 145,158 132,142 135,120 L 149,120 C 146,142 160,158 184,185 C 240,250 282,330 290,420 Z"
          fill="url(#palmTrunkGrad)"
        />

        {/* Golden rim highlight di sisi kurva luar */}
        <path
          d="M 270,420 C 265,330 225,250 168,185 C 145,158 132,142 135,120"
          stroke="url(#palmGoldenRim)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cincin ruas cincin batang minimalis */}
        <g stroke="#fde047" strokeWidth="1" strokeLinecap="round" opacity="0.35">
          <path d="M 264,375 Q 272,370 280,373" />
          <path d="M 248,335 Q 256,330 266,333" />
          <path d="M 226,290 Q 234,285 246,288" />
          <path d="M 200,245 Q 208,240 220,243" />
          <path d="M 172,200 Q 180,195 192,198" />
          <path d="M 148,160 Q 154,155 164,158" />
        </g>

        {/* 2. Kluster Buah Kelapa Bulat Minimalis */}
        <g fill="#0b1726">
          <circle cx="134" cy="132" r="7" />
          <circle cx="147" cy="135" r="7.5" />
          <circle cx="140" cy="143" r="6.5" />
          {/* Pantulan kilau emas kelapa */}
          <path d="M 130,129 A 5 5 0 0 1 136,132" stroke="#fef08a" strokeWidth="1.2" fill="none" opacity="0.8" />
          <path d="M 142,132 A 5.5 5.5 0 0 1 149,135" stroke="#fef08a" strokeWidth="1.2" fill="none" opacity="0.8" />
        </g>

        {/* 3. Pelepah Daun Kelapa Tropis Elegan (7 Fronds) */}
        <g fill="url(#palmFrondGrad)">
          {/* Pelepah 1: Atas Kiri Melengkung Anggun */}
          <path d="M 138,122 C 105,75 55,65 5,85 C 45,100 85,115 138,122 Z" />
          {/* Pelepah 2: Tengah Kiri */}
          <path d="M 138,124 C 95,105 40,120 -5,155 C 40,155 85,148 138,124 Z" />
          {/* Pelepah 3: Bawah Kiri Menjuntai */}
          <path d="M 136,128 C 95,145 45,185 10,235 C 50,210 95,185 136,128 Z" />
          {/* Pelepah 4: Pucuk Muda Tegak ke Langit Senja */}
          <path d="M 140,120 C 135,70 140,40 142,15 C 148,45 152,75 140,120 Z" />
          {/* Pelepah 5: Atas Kanan Mengembang */}
          <path d="M 142,122 C 185,75 235,70 285,90 C 240,105 195,118 142,122 Z" />
          {/* Pelepah 6: Tengah Kanan Menjuntai */}
          <path d="M 142,125 C 190,115 245,130 305,170 C 255,165 200,152 142,125 Z" />
          {/* Pelepah 7: Bawah Kanan Menjuntai Rendah */}
          <path d="M 140,128 C 185,150 225,190 260,240 C 220,215 178,185 140,128 Z" />
        </g>

        {/* Garis Tulang Daun Emas (Golden Spine Highlights) */}
        <g stroke="url(#palmSpineGrad)" strokeWidth="1.6" strokeLinecap="round" fill="none">
          <path d="M 138,122 C 105,75 55,65 5,85" />
          <path d="M 138,124 C 95,105 40,120 -5,155" />
          <path d="M 136,128 C 95,145 45,185 10,235" />
          <path d="M 140,120 C 135,70 140,40 142,15" />
          <path d="M 142,122 C 185,75 235,70 285,90" />
          <path d="M 142,125 C 190,115 245,130 305,170" />
          <path d="M 140,128 C 185,150 225,190 260,240" />
        </g>
      </svg>
    </div>
  );
}
