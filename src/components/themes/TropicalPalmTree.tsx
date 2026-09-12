"use client";

import React from 'react';

/**
 * TropicalPalmTree - Ultra-Lush Organic Tropical Coconut Palm (Pohon Kelapa Tropis Alami & Luwes)
 * 
 * Mastercrafted for ultimate organic fluidity and richness:
 * - Natural sweeping organic S-curve trunk leaning gracefully over the ocean
 * - Smooth cylindrical 3D trunk shading with warm sunset rim backlight
 * - Arched bark rings wrapping across trunk width with natural perspective
 * - Dual-tone 3D sculpted palm fronds with sunlit upper blades and cascading drooping teeth
 * - Zero criss-cross grid / zero stiffness: every frond flows with gravity and wind aerodynamics
 * - Tri-tier canopy volume: Deep jade background, vibrant emerald midground, sunlit lime foreground
 * - Plump 3D green coconuts with golden sun glints
 * - Root flare with beach dune grasses and broad tropical leaves
 */
export default function TropicalPalmTree() {
  return (
    <div
      className="fixed bottom-0 right-0 sm:right-1 w-64 sm:w-80 md:w-[390px] lg:w-[430px] h-84 sm:h-[430px] md:h-[490px] pointer-events-none select-none z-0"
      style={{
        transformOrigin: 'bottom right',
        animation: 'palmSwayGentle 9s ease-in-out infinite',
      }}
    >
      <svg
        viewBox="0 0 400 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Trunk Sunset Warm Bark Gradient */}
          <linearGradient id="trunkBarkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="18%" stopColor="#78350f" />
            <stop offset="60%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#1c0a02" />
          </linearGradient>

          {/* Trunk Golden Rim Glow on Sunset side (left curve) */}
          <linearGradient id="trunkRimGlow" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="80%" stopColor="#fde047" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0.95" />
          </linearGradient>

          {/* Deep Background Fronds (Dark Forest Jade) */}
          <linearGradient id="frondDeepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#065f46" />
            <stop offset="50%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          {/* Sunlit Upper Frond Blade (Warm Golden Lime to Emerald) */}
          <linearGradient id="frondUpperGrad" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#a3e635" />
            <stop offset="25%" stopColor="#4ade80" />
            <stop offset="60%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>

          {/* Shaded Lower Drooping Teeth (Rich Tropical Emerald to Jade) */}
          <linearGradient id="frondLowerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="35%" stopColor="#15803d" />
            <stop offset="70%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>

          {/* Tender Young Shoot Gradient (Pucuk Kelapa Muda) */}
          <linearGradient id="youngShootGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="40%" stopColor="#22c55e" />
            <stop offset="75%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#bef264" />
          </linearGradient>

          {/* Glowing Golden Spine Rim */}
          <linearGradient id="goldenSpineRim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#fde047" stopOpacity="0.85" />
            <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
          </linearGradient>

          {/* 3D Juicy Coconut Radial Gradient */}
          <radialGradient id="coconut3D" cx="30%" cy="25%" r="72%">
            <stop offset="0%" stopColor="#bef264" />
            <stop offset="20%" stopColor="#4ade80" />
            <stop offset="50%" stopColor="#16a34a" />
            <stop offset="80%" stopColor="#14532d" />
            <stop offset="100%" stopColor="#052e16" />
          </radialGradient>
        </defs>

        {/* ═══ 1. BEACH BASE & DUNE FOLIAGE ═══ */}
        {/* Sand root flare */}
        <path d="M 300,480 C 308,455 320,446 340,446 C 362,446 375,455 385,480 Z" fill="#261005" />
        {/* Beach grasses & broad fern blades */}
        <path d="M 285,480 Q 280,450 268,425 Q 280,452 295,480
                 M 298,480 Q 292,442 282,410 Q 296,446 308,480
                 M 312,480 Q 318,445 328,418 Q 324,452 318,480
                 M 345,480 Q 355,445 368,415 Q 360,452 352,480
                 M 365,480 Q 378,448 392,422 Q 380,456 372,480" fill="#14532d" />
        <path d="M 282,480 C 275,462 268,445 272,430 C 278,448 288,468 296,480 Z" fill="#16a34a" />
        <path d="M 355,480 C 364,460 376,444 382,432 C 378,452 368,470 362,480 Z" fill="#15803d" />
        <path d="M 298,480 Q 292,442 282,410 M 345,480 Q 355,445 368,415" stroke="rgba(253, 224, 71, 0.7)" strokeWidth="1.6" strokeLinecap="round" fill="none" />

        {/* ═══ 2. TIER A: DEEP BACKGROUND FRONDS (SHADOW & FULL SILHOUETTE VOLUME) ═══ */}
        <g opacity="0.95">
          <path d="M 218,148 C 145.9,73.7 85.1,63.0 25,80 C 84.8,42.2 162.2,93.2 218,148 Z" fill="url(#frondDeepGrad)" />
          <path d="M 216,152 C 123.6,110.7 61.9,118.8 5,138 C 54.0,96.2 129.2,122.2 216,152 Z" fill="url(#frondDeepGrad)" />
          <path d="M 216,156 C 134.6,187.7 85.2,225.4 35,280 C 63.5,214.6 116.1,181.1 216,156 Z" fill="url(#frondDeepGrad)" />
          <path d="M 222,148 C 289.3,76.6 345.0,68.0 385,82 C 345.1,47.2 272.1,71.1 222,148 Z" fill="url(#frondDeepGrad)" />
          <path d="M 224,152 C 295.7,125.8 352.4,133.6 395,155 C 363.4,111.8 293.0,131.0 224,152 Z" fill="url(#frondDeepGrad)" />
          <path d="M 224,156 C 289.5,202.1 339.4,240.0 375,290 C 362.9,231.0 311.5,226.5 224,156 Z" fill="url(#frondDeepGrad)" />
        </g>

        {/* ═══ 3. THE MAJESTIC SWEEPING TRUNK (LEANING ORGANICALLY TOWARD THE SEA) ═══ */}
        {/* Curved trunk body with natural organic taper */}
        <path d="M 315,480 C 280,380 240,270 216,150 L 234,150 C 265,270 315,380 365,480 Z" fill="url(#trunkBarkGrad)" />
        
        {/* Golden Sunset Rim Highlight on sunward (left) curve */}
        <path d="M 315,480 C 280,380 240,270 216,150" stroke="url(#trunkRimGlow)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        
        {/* Organic Curved Bark Rings (wrap with cylindrical perspective) */}
        <g>
          <path d="M 306.5,418.2 Q 330.8,421.7 355.1,418.2" stroke="rgba(20, 8, 3, 0.45)" strokeWidth="2.0" strokeLinecap="round" fill="none" />
            <path d="M 297.9,396.1 Q 321.3,399.6 344.8,396.1" stroke="rgba(20, 8, 3, 0.45)" strokeWidth="2.0" strokeLinecap="round" fill="none" />
            <path d="M 288.1,370.8 Q 310.4,374.3 332.7,370.8" stroke="rgba(20, 8, 3, 0.45)" strokeWidth="2.0" strokeLinecap="round" fill="none" />
            <path d="M 277.3,342.3 Q 298.1,345.8 318.9,342.3" stroke="rgba(20, 8, 3, 0.45)" strokeWidth="2.0" strokeLinecap="round" fill="none" />
            <path d="M 266.6,313.3 Q 285.7,316.8 304.8,313.3" stroke="rgba(20, 8, 3, 0.45)" strokeWidth="2.0" strokeLinecap="round" fill="none" />
            <path d="M 256.2,284.1 Q 273.5,287.6 290.7,284.1" stroke="rgba(20, 8, 3, 0.45)" strokeWidth="2.0" strokeLinecap="round" fill="none" />
            <path d="M 246.2,254.6 Q 261.5,258.1 276.8,254.6" stroke="rgba(20, 8, 3, 0.45)" strokeWidth="2.0" strokeLinecap="round" fill="none" />
            <path d="M 236.7,224.8 Q 249.9,228.3 263.2,224.8" stroke="rgba(20, 8, 3, 0.45)" strokeWidth="2.0" strokeLinecap="round" fill="none" />
            <path d="M 228.7,198.0 Q 240.0,201.5 251.4,198.0" stroke="rgba(20, 8, 3, 0.45)" strokeWidth="2.0" strokeLinecap="round" fill="none" />
            <path d="M 222.1,174.0 Q 231.7,177.5 241.4,174.0" stroke="rgba(20, 8, 3, 0.45)" strokeWidth="2.0" strokeLinecap="round" fill="none" />
        </g>

        {/* Fibrous Crown Collar Sheath at top of trunk */}
        <path d="M 212,154 C 218,162 232,164 238,152 C 234,142 216,142 212,154 Z" fill="#14532d" />
        <path d="M 215,148 C 220,154 230,156 235,146 C 230,138 219,138 215,148 Z" fill="#166534" />

        {/* ═══ 4. FRESH PLUMP COCONUTS CLUSTER ═══ */}
        <g>
          <circle cx="210" cy="158" r="8.5" fill="url(#coconut3D)" />
          <circle cx="223" cy="160" r="9.0" fill="url(#coconut3D)" />
          <circle cx="234" cy="164" r="7.5" fill="url(#coconut3D)" />
          <circle cx="205" cy="168" r="7.5" fill="url(#coconut3D)" />
          <circle cx="217" cy="172" r="8.0" fill="url(#coconut3D)" />
          <circle cx="228" cy="174" r="7.0" fill="url(#coconut3D)" />
          <circle cx="218" cy="182" r="6.0" fill="url(#coconut3D)" />

          {/* Coconut golden sun glints */}
          <path d="M 206,154 A 6 6 0 0 1 212,158" stroke="#fef08a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M 218,156 A 6.5 6.5 0 0 1 224,160" stroke="#fef08a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M 202,165 A 5 5 0 0 1 206,169" stroke="#86efac" strokeWidth="1.0" fill="none" strokeLinecap="round" />
          <path d="M 214,168 A 5.5 5.5 0 0 1 218,172" stroke="#fef08a" strokeWidth="1.0" fill="none" strokeLinecap="round" />
        </g>

        {/* ═══ 5. TIER B: MAIN MIDGROUND DUAL-TONE SCULPTED FRONDS (LUXURIOUS 3D VOLUME) ═══ */}
        {/* Animated Left Group */}
        <g
          style={{
            transformOrigin: '218px 150px',
            animation: 'palmFrondRustleLeft 7.8s ease-in-out infinite alternate',
          }}
        >
          {/* Main NW High Arch */}
          <path d="M 218,148 L 201.9,122.6 L 185.4,102.1 L 168.5,86.0 L 151.2,74.2 L 133.5,66.1 L 115.5,61.6 L 97.1,60.3 L 78.4,61.8 L 59.3,65.8 L 40.0,72.0 Q 38.7,71.0 37.3,70.1 Q 44.2,69.1 51.1,68 L 51.1,68 Q 50.8,64.8 47.8,62.3 Q 56.3,63.3 64.8,64 L 64.8,64 Q 63.4,59.6 59.2,55.4 Q 68.8,58.6 78.4,62 L 78.4,62 Q 76.6,55.6 72.1,49.9 Q 81.9,55.2 91.8,60 L 91.8,60 Q 90.5,53.3 86.5,46.2 Q 95.8,53.3 105.0,60 L 105.0,60 Q 105.1,52.8 102.6,44.9 Q 110.3,53.5 118.1,62 L 118.1,62 Q 120.2,54.4 119.8,46.3 Q 125.4,55.8 130.9,65 L 130.9,65 Q 135.5,58.5 137.5,50.8 Q 140.6,60.5 143.6,70 L 143.6,70 Q 150.5,64.9 154.8,58.3 Q 155.5,67.7 156.1,77 L 156.1,77 Q 164.7,73.7 170.8,68.6 Q 169.6,77.3 168.5,86 L 168.5,86 Q 177.9,84.6 184.9,81.1 Q 182.8,89.1 180.6,97 L 180.6,97 Q 190.0,97.5 196.9,95.5 Q 194.7,102.9 192.5,110 L 192.5,110 Q 200.8,112.4 206.8,111.6 Q 205.5,118.8 204.2,126 L 204.2,126 Q 210.7,129.2 214.9,129.1 Q 215.3,136.6 215.7,144 L 215.7,144 L 218,148 Z" fill="url(#frondLowerGrad)" />
          <path d="M 218,148 Q 204.7,133.1 195.4,125.0 Q 198.6,123.8 201.9,122.6 Q 186.6,112.0 175.5,106.9 Q 180.4,104.5 185.4,102.1 Q 168.9,95.7 156.7,93.7 Q 162.6,89.9 168.5,86.0 Q 151.8,83.6 139.5,84.5 Q 145.3,79.3 151.2,74.2 Q 135.2,75.0 123.7,78.1 Q 128.6,72.1 133.5,66.1 Q 118.8,69.2 108.6,73.8 Q 112.0,67.7 115.5,61.6 Q 102.1,66.0 93.3,71.1 Q 95.2,65.7 97.1,60.3 Q 84.7,65.2 77.0,70.0 Q 77.7,65.9 78.4,61.8 Q 66.5,66.7 59.3,70.8 Q 59.3,68.3 59.3,65.8 Q 47.4,70.4 40.2,73.6 Q 40.1,72.8 40.0,72.0 L 40,72 L 40.0,72.0 L 59.3,65.8 L 78.4,61.8 L 97.1,60.3 L 115.5,61.6 L 133.5,66.1 L 151.2,74.2 L 168.5,86.0 L 185.4,102.1 L 201.9,122.6 L 218.0,148.0 Z" fill="url(#frondUpperGrad)" />
          <path d="M 218,148 C 165,55 105,48 40,72" stroke="url(#goldenSpineRim)" strokeWidth="2.2" strokeLinecap="round" fill="none" />

          {/* Main West Sweeper (Horizontal ocean reach) */}
          <path d="M 216,152 L 192.3,139.5 L 169.7,130.0 L 148.1,123.4 L 127.2,119.4 L 107.0,117.9 L 87.3,118.6 L 67.9,121.4 L 48.6,126.0 L 29.4,132.3 L 10.0,140.0 Q 8.6,139.2 7.1,138.5 Q 13.8,137.1 20.4,136 L 20.4,136 Q 19.4,132.6 15.9,130.5 Q 24.6,130.7 33.2,131 L 33.2,131 Q 30.6,126.6 25.3,123.1 Q 35.7,124.9 46.0,127 L 46.0,127 Q 42.2,121.2 35.8,116.4 Q 47.3,119.9 58.9,123 L 58.9,123 Q 54.4,116.7 47.4,110.6 Q 59.6,115.6 71.7,121 L 71.7,121 Q 67.3,113.1 60.4,106.0 Q 72.5,112.4 84.7,119 L 84.7,119 Q 81.0,110.7 74.7,102.8 Q 86.2,110.4 97.7,118 L 97.7,118 Q 95.3,109.6 90.2,101.3 Q 100.6,109.7 111.0,118 L 111.0,118 Q 110.1,109.9 106.5,101.6 Q 115.5,110.4 124.5,119 L 124.5,119 Q 125.3,111.6 123.3,103.8 Q 130.8,112.5 138.2,121 L 138.2,121 Q 140.6,114.8 140.2,107.9 Q 146.2,116.2 152.3,124 L 152.3,124 Q 156.0,119.5 156.7,113.7 Q 161.8,121.3 166.8,129 L 166.8,129 Q 171.3,125.5 172.8,121.0 Q 177.2,127.8 181.6,135 L 181.6,135 Q 186.4,132.9 188.2,129.7 Q 192.6,135.7 196.9,142 L 196.9,142 Q 201.6,141.5 203.0,139.6 Q 207.9,144.9 212.8,150 L 212.8,150 L 216,152 Z" fill="url(#frondLowerGrad)" />
          <path d="M 216,152 Q 200.1,147.0 189.7,145.1 Q 192.1,142.8 194.4,140.5 Q 178.1,138.7 166.9,139.4 Q 170.3,135.4 173.7,131.5 Q 157.4,132.7 146.1,135.7 Q 150.0,130.3 153.9,124.9 Q 138.1,128.6 127.1,133.5 Q 130.9,127.0 134.7,120.6 Q 119.9,126.1 109.8,132.5 Q 112.9,125.4 116.1,118.3 Q 102.5,125.1 93.5,132.1 Q 95.7,125.0 98.0,117.9 Q 85.6,125.3 77.7,132.4 Q 78.9,125.9 80.2,119.4 Q 68.8,126.7 61.8,133.4 Q 62.2,127.9 62.6,122.4 Q 51.8,129.3 45.4,135.1 Q 45.2,131.1 45.1,127.0 Q 34.5,133.1 28.2,137.8 Q 27.9,135.3 27.6,132.9 Q 16.8,138.1 10.3,141.6 Q 10.2,140.8 10.0,140.0 L 10,140 L 10.0,140.0 L 29.4,132.3 L 48.6,126.0 L 67.9,121.4 L 87.3,118.6 L 107.0,117.9 L 127.2,119.4 L 148.1,123.4 L 169.7,130.0 L 192.3,139.5 L 216.0,152.0 Z" fill="url(#frondUpperGrad)" />
          <path d="M 216,152 C 135,105 75,112 10,140" stroke="url(#goldenSpineRim)" strokeWidth="2.4" strokeLinecap="round" fill="none" />

          {/* Main SW Graceful Drooper */}
          <path d="M 216,156 L 195.3,163.0 L 175.8,170.8 L 157.3,179.4 L 139.9,189.1 L 123.2,199.8 L 107.4,211.6 L 92.3,224.6 L 77.7,239.0 L 63.7,254.8 L 50.0,272.0 Q 47.8,272.1 45.6,272.2 Q 52.0,266.7 58.4,261 L 58.4,261 Q 55.1,258.7 49.8,258.8 Q 59.4,253.7 69.0,249 L 69.0,249 Q 63.0,245.9 54.9,245.7 Q 67.4,241.2 79.9,237 L 79.9,237 Q 71.7,233.8 61.2,233.1 Q 76.2,229.4 91.1,226 L 91.1,226 Q 81.4,222.3 69.3,221.0 Q 86.0,218.2 102.7,215 L 102.7,215 Q 92.1,211.5 79.2,209.5 Q 96.9,207.8 114.6,206 L 114.6,206 Q 104.0,201.5 91.0,198.9 Q 109.0,198.0 127.0,197 L 127.0,197 Q 117.1,192.3 104.7,189.2 Q 122.3,189.1 139.9,189 L 139.9,189 Q 131.3,184.1 120.1,180.6 Q 136.7,181.1 153.2,182 L 153.2,182 Q 146.5,176.7 137.0,173.2 Q 152.1,173.9 167.1,175 L 167.1,175 Q 162.5,170.2 155.0,167.0 Q 168.4,167.7 181.7,168 L 181.7,168 Q 179.3,164.5 174.0,162.0 Q 185.4,162.2 196.9,162 L 196.9,162 Q 196.8,159.6 193.6,157.9 Q 203.1,157.4 212.7,157 L 212.7,157 L 216,156 Z" fill="url(#frondLowerGrad)" />
          <path d="M 216,156 Q 201.9,163.3 193.7,168.7 Q 193.4,166.3 193.1,163.8 Q 180.4,173.0 173.3,180.1 Q 172.5,176.4 171.6,172.6 Q 160.5,183.3 154.6,191.7 Q 153.0,187.1 151.4,182.5 Q 141.8,194.3 137.1,203.3 Q 134.7,198.5 132.4,193.7 Q 124.0,205.9 120.3,215.1 Q 117.3,210.7 114.4,206.2 Q 106.8,218.5 103.6,227.5 Q 100.4,223.8 97.3,220.1 Q 89.9,232.4 86.6,240.9 Q 83.8,238.3 80.9,235.7 Q 73.1,247.9 69.2,255.9 Q 67.2,254.4 65.2,252.9 Q 56.4,265.2 51.4,272.9 Q 50.7,272.4 50.0,272.0 L 50,272 L 50.0,272.0 L 63.7,254.8 L 77.7,239.0 L 92.3,224.6 L 107.4,211.6 L 123.2,199.8 L 139.9,189.1 L 157.3,179.4 L 175.8,170.8 L 195.3,163.0 L 216.0,156.0 Z" fill="url(#frondUpperGrad)" />
          <path d="M 216,156 C 145,178 95,212 50,272" stroke="url(#goldenSpineRim)" strokeWidth="2.0" strokeLinecap="round" fill="none" />

          {/* Foreground West Overleaf */}
          <path d="M 218,154 L 205.3,156.8 L 193.1,160.3 L 181.4,164.5 L 170.0,169.6 L 159.1,175.5 L 148.6,182.2 L 138.4,189.8 L 128.6,198.3 L 119.2,207.7 L 110.0,218.0 Q 107.9,217.6 105.7,217.2 Q 111.9,213.0 118.1,209 L 118.1,209 Q 114.5,205.2 108.9,203.7 Q 118.7,201.0 128.6,198 L 128.6,198 Q 122.4,193.6 113.9,190.9 Q 126.7,189.9 139.5,189 L 139.5,189 Q 131.7,183.1 121.7,179.0 Q 136.3,179.8 150.9,181 L 150.9,181 Q 142.8,173.9 132.4,168.7 Q 147.6,171.1 162.7,173 L 162.7,173 Q 155.6,166.3 146.1,160.6 Q 160.6,163.9 175.0,167 L 175.0,167 Q 169.8,160.5 162.1,154.8 Q 175.0,158.5 187.9,162 L 187.9,162 Q 185.0,156.4 179.6,151.7 Q 190.4,154.8 201.2,158 L 201.2,158 Q 200.9,153.9 197.8,150.7 Q 206.5,152.6 215.1,155 L 215.1,155 L 218,154 Z" fill="url(#frondLowerGrad)" />
          <path d="M 218,154 Q 208.1,158.8 202.2,162.8 Q 202.2,160.2 202.2,157.6 Q 193.3,164.5 188.1,170.3 Q 187.7,166.3 187.2,162.3 Q 179.4,170.7 175.3,177.8 Q 174.0,173.0 172.8,168.3 Q 166.2,177.5 163.1,185.0 Q 161.1,180.3 159.1,175.5 Q 153.4,184.9 151.0,192.2 Q 148.5,188.1 146.0,184.0 Q 140.6,193.1 138.4,199.9 Q 136.0,196.9 133.5,193.9 Q 127.8,202.6 125.2,208.6 Q 123.3,206.9 121.5,205.2 Q 115.0,213.6 111.3,218.9 Q 110.7,218.5 110.0,218.0 L 110,218 L 110.0,218.0 L 119.2,207.7 L 128.6,198.3 L 138.4,189.8 L 148.6,182.2 L 159.1,175.5 L 170.0,169.6 L 181.4,164.5 L 193.1,160.3 L 205.3,156.8 L 218.0,154.0 Z" fill="url(#frondUpperGrad)" />
          <path d="M 218,154 C 175,162 140,182 110,218" stroke="url(#goldenSpineRim)" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* Young Center Shoot 1 (Pucuk Kelapa Muda) */}
          <path d="M 218,148 Q 212,65 204,18 Q 218,65 220,148 Z" fill="url(#youngShootGrad)" />
          <path d="M 218,148 Q 212,65 204,18" stroke="#fef08a" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </g>

        {/* Animated Right Group */}
        <g
          style={{
            transformOrigin: '222px 150px',
            animation: 'palmFrondRustleRight 8.6s ease-in-out infinite alternate',
          }}
        >
          {/* Main NE High Arch */}
          <path d="M 222,148 L 237.9,123.9 L 253.9,104.4 L 269.8,89.0 L 285.5,77.5 L 300.9,69.5 L 315.9,64.8 L 330.4,63.0 L 344.3,63.8 L 357.6,66.9 L 370.0,72.0 Q 371.5,71.1 373.1,70.3 Q 368.0,69.6 363.0,69 L 363.0,69 Q 364.6,65.7 368.0,63.3 Q 360.9,64.6 353.9,66 L 353.9,66 Q 356.4,61.2 360.8,57.1 Q 352.6,60.4 344.3,64 L 344.3,64 Q 346.8,57.8 351.2,52.0 Q 342.8,57.5 334.5,63 L 334.5,63 Q 335.9,55.9 339.3,48.8 Q 331.8,56.1 324.3,63 L 324.3,63 Q 323.8,55.9 325.5,48.1 Q 319.6,56.7 313.8,65 L 313.8,65 Q 311.0,57.9 310.3,50.1 Q 306.7,59.3 303.0,69 L 303.0,69 Q 297.8,62.2 294.8,54.9 Q 293.4,64.3 292.1,74 L 292.1,74 Q 284.8,68.7 279.6,62.5 Q 280.3,71.4 281.0,80 L 281.0,80 Q 272.2,77.2 265.5,72.4 Q 267.7,80.7 269.8,89 L 269.8,89 Q 260.3,87.7 253.0,84.3 Q 255.7,92.0 258.5,100 L 258.5,100 Q 249.2,100.0 242.2,98.0 Q 244.6,105.1 247.1,112 L 247.1,112 Q 238.9,114.1 233.0,113.2 Q 234.3,120.2 235.7,127 L 235.7,127 Q 229.3,130.1 225.2,129.9 Q 224.7,137.1 224.3,144 L 224.3,144 L 222,148 Z" fill="url(#frondLowerGrad)" />
          <path d="M 222,148 Q 235.2,134.0 244.4,126.4 Q 241.2,125.2 237.9,123.9 Q 252.9,113.9 263.8,109.2 Q 258.9,106.8 253.9,104.4 Q 269.8,98.3 281.7,96.5 Q 275.7,92.8 269.8,89.0 Q 285.7,86.6 297.7,87.5 Q 291.6,82.5 285.5,77.5 Q 300.4,78.2 311.5,81.2 Q 306.2,75.3 300.9,69.5 Q 314.1,72.4 323.6,76.8 Q 319.7,70.8 315.9,64.8 Q 327.1,68.9 334.7,73.8 Q 332.6,68.4 330.4,63.0 Q 339.8,67.5 345.7,72.0 Q 345.0,67.9 344.3,63.8 Q 352.5,68.1 357.3,71.8 Q 357.4,69.3 357.6,66.9 Q 365.2,70.8 369.6,73.5 Q 369.8,72.8 370.0,72.0 L 370,72 L 370.0,72.0 L 357.6,66.9 L 344.3,63.8 L 330.4,63.0 L 315.9,64.8 L 300.9,69.5 L 285.5,77.5 L 269.8,89.0 L 253.9,104.4 L 237.9,123.9 L 222.0,148.0 Z" fill="url(#frondUpperGrad)" />
          <path d="M 222,148 C 275,60 330,52 370,72" stroke="url(#goldenSpineRim)" strokeWidth="2.2" strokeLinecap="round" fill="none" />

          {/* Main East Sweeper */}
          <path d="M 224,152 L 242.1,142.3 L 259.8,135.2 L 277.2,130.7 L 294.1,128.4 L 310.5,128.4 L 326.5,130.3 L 341.9,134.1 L 356.8,139.6 L 371.2,146.6 L 385.0,155.0 Q 386.8,154.4 388.5,153.9 Q 383.1,152.1 377.7,150 L 377.7,150 Q 380.2,147.6 384.5,146.0 Q 376.4,145.5 368.4,145 L 368.4,145 Q 372.8,141.2 379.2,138.3 Q 369.0,139.4 358.8,140 L 358.8,140 Q 364.7,135.4 372.5,131.1 Q 360.7,133.8 348.9,136 L 348.9,136 Q 355.5,130.2 364.1,124.7 Q 351.5,128.9 338.9,133 L 338.9,133 Q 345.4,125.9 354.1,119.2 Q 341.3,125.0 328.5,131 L 328.5,131 Q 334.4,122.7 342.4,115.1 Q 330.2,122.1 318.0,129 L 318.0,129 Q 322.6,120.6 329.4,112.5 Q 318.3,120.3 307.3,128 L 307.3,128 Q 310.2,119.9 315.3,111.6 Q 305.8,120.0 296.3,128 L 296.3,128 Q 297.3,120.5 300.6,112.6 Q 292.8,121.0 285.1,129 L 285.1,129 Q 284.3,122.5 285.7,115.4 Q 279.7,123.4 273.7,131 L 273.7,131 Q 271.4,125.9 271.3,119.9 Q 266.7,127.2 262.2,134 L 262.2,134 Q 258.7,130.6 257.5,126.0 Q 254.0,132.3 250.4,139 L 250.4,139 Q 246.4,136.4 244.8,133.2 Q 241.7,138.6 238.5,144 L 238.5,144 Q 234.6,143.4 233.1,141.6 Q 229.8,146.1 226.4,151 L 226.4,151 L 224,152 Z" fill="url(#frondLowerGrad)" />
          <path d="M 224,152 Q 236.6,148.6 245.1,147.7 Q 242.8,145.4 240.5,143.1 Q 253.9,142.7 263.2,144.2 Q 259.9,140.3 256.7,136.3 Q 270.2,138.8 279.7,142.6 Q 276.1,137.1 272.5,131.7 Q 285.5,136.5 294.6,142.1 Q 291.3,135.5 288.0,129.0 Q 300.0,135.5 308.1,142.4 Q 305.6,135.3 303.1,128.1 Q 313.8,135.7 320.7,143.1 Q 319.3,136.1 317.8,129.0 Q 327.2,136.9 332.9,144.3 Q 332.5,137.9 332.1,131.5 Q 340.4,139.2 345.2,146.0 Q 345.6,140.7 346.0,135.5 Q 353.6,142.5 357.8,148.4 Q 358.6,144.6 359.5,140.8 Q 366.8,147.0 370.8,151.8 Q 371.6,149.6 372.5,147.3 Q 380.0,152.8 384.3,156.4 Q 384.6,155.7 385.0,155.0 L 385,155 L 385.0,155.0 L 371.2,146.6 L 356.8,139.6 L 341.9,134.1 L 326.5,130.3 L 310.5,128.4 L 294.1,128.4 L 277.2,130.7 L 259.8,135.2 L 242.1,142.3 L 224.0,152.0 Z" fill="url(#frondUpperGrad)" />
          <path d="M 224,152 C 285,115 340,125 385,155" stroke="url(#goldenSpineRim)" strokeWidth="2.4" strokeLinecap="round" fill="none" />

          {/* Main SE Graceful Drooper */}
          <path d="M 224,156 L 241.8,166.8 L 258.7,177.7 L 274.6,188.9 L 289.6,200.4 L 303.6,212.2 L 316.7,224.7 L 328.9,237.8 L 340.2,251.6 L 350.5,266.3 L 360.0,282.0 Q 362.3,282.4 364.6,282.8 Q 359.5,277.5 354.3,272 L 354.3,272 Q 358.4,270.5 364.1,271.2 Q 355.4,265.9 346.7,261 L 346.7,261 Q 353.7,258.9 362.3,259.5 Q 350.4,254.5 338.5,249 L 338.5,249 Q 347.9,247.6 359.0,247.9 Q 344.4,243.3 329.8,239 L 329.8,239 Q 340.9,236.5 353.8,236.3 Q 337.2,232.5 320.6,229 L 320.6,229 Q 332.6,225.9 346.6,225.1 Q 328.7,222.0 310.8,219 L 310.8,219 Q 323.0,215.6 337.3,214.2 Q 318.9,211.8 300.5,209 L 300.5,209 Q 312.2,205.7 326.0,203.9 Q 307.8,202.1 289.6,200 L 289.6,200 Q 300.1,196.4 312.9,194.2 Q 295.5,192.9 278.1,191 L 278.1,191 Q 286.9,187.5 298.1,185.2 Q 282.1,184.0 266.2,183 L 266.2,183 Q 272.8,179.0 281.8,176.9 Q 267.7,175.6 253.6,174 L 253.6,174 Q 257.7,170.9 264.5,169.2 Q 252.5,167.6 240.5,166 L 240.5,166 Q 242.0,163.1 246.2,162.0 Q 236.5,159.8 226.8,158 L 226.8,158 L 224,156 Z" fill="url(#frondLowerGrad)" />
          <path d="M 224,156 Q 235.4,165.7 241.7,172.3 Q 242.7,170.2 243.7,168.0 Q 253.6,178.9 258.6,186.8 Q 260.5,183.5 262.3,180.2 Q 270.6,192.0 274.4,200.7 Q 277.1,196.7 279.7,192.7 Q 286.6,204.9 289.2,214.0 Q 292.6,209.8 295.9,205.6 Q 301.6,217.9 303.4,226.9 Q 307.2,223.0 311.0,219.1 Q 315.9,231.1 317.3,239.6 Q 321.1,236.5 325.0,233.3 Q 329.7,244.9 331.0,252.8 Q 334.4,250.6 337.8,248.5 Q 342.8,259.7 344.8,266.9 Q 347.1,265.8 349.4,264.6 Q 355.3,275.7 358.3,282.6 Q 359.2,282.3 360.0,282.0 L 360,282 L 360.0,282.0 L 350.5,266.3 L 340.2,251.6 L 328.9,237.8 L 316.7,224.7 L 303.6,212.2 L 289.6,200.4 L 274.6,188.9 L 258.7,177.7 L 241.8,166.8 L 224.0,156.0 Z" fill="url(#frondUpperGrad)" />
          <path d="M 224,156 C 285,192 330,228 360,282" stroke="url(#goldenSpineRim)" strokeWidth="2.0" strokeLinecap="round" fill="none" />

          {/* Foreground East Overleaf */}
          <path d="M 224,154 L 233.3,157.7 L 242.5,162.0 L 251.7,167.1 L 260.8,172.9 L 269.9,179.4 L 278.9,186.5 L 288.0,194.4 L 297.0,202.9 L 306.0,212.1 L 315.0,222.0 Q 317.1,221.6 319.2,221.1 Q 313.1,217.2 307.0,213 L 307.0,213 Q 310.7,209.7 316.4,208.3 Q 306.7,205.6 297.0,203 L 297.0,203 Q 303.6,198.5 312.3,196.0 Q 299.6,194.8 287.0,193 L 287.0,193 Q 295.6,188.2 306.2,184.6 Q 291.5,184.8 276.9,185 L 276.9,185 Q 286.3,178.9 297.6,174.5 Q 282.2,175.8 266.8,177 L 266.8,177 Q 275.7,170.8 286.5,166.0 Q 271.6,168.1 256.7,170 L 256.7,170 Q 263.9,164.2 273.1,159.4 Q 259.8,161.8 246.6,164 L 246.6,164 Q 251.3,159.0 258.1,154.9 Q 247.2,157.0 236.3,159 L 236.3,159 Q 238.3,155.3 242.2,152.4 Q 234.2,153.6 226.1,155 L 226.1,155 L 224,154 Z" fill="url(#frondLowerGrad)" />
          <path d="M 224,154 Q 230.7,159.3 234.4,163.6 Q 235.0,161.1 235.6,158.7 Q 241.4,165.9 244.4,171.8 Q 245.7,168.1 247.1,164.5 Q 252.0,173.0 254.1,179.9 Q 256.3,175.7 258.5,171.4 Q 262.8,180.6 264.2,187.9 Q 267.1,183.7 269.9,179.4 Q 273.9,188.7 275.1,195.9 Q 278.2,192.2 281.2,188.4 Q 285.5,197.5 287.1,204.2 Q 289.8,201.4 292.5,198.6 Q 297.7,207.2 300.0,213.1 Q 301.9,211.4 303.7,209.8 Q 310.1,217.9 313.7,223.0 Q 314.4,222.5 315.0,222.0 L 315,222 L 315.0,222.0 L 306.0,212.1 L 297.0,202.9 L 288.0,194.4 L 278.9,186.5 L 269.9,179.4 L 260.8,172.9 L 251.7,167.1 L 242.5,162.0 L 233.3,157.7 L 224.0,154.0 Z" fill="url(#frondUpperGrad)" />
          <path d="M 224,154 C 255,165 285,188 315,222" stroke="url(#goldenSpineRim)" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* Young Center Shoot 2 */}
          <path d="M 220,148 Q 228,60 234,14 Q 224,62 218,148 Z" fill="url(#youngShootGrad)" />
          <path d="M 220,148 Q 228,60 234,14" stroke="#fef08a" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </div>
  );
}
