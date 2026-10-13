"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Home, Briefcase, Compass, BookOpen, Mail, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAudioFX } from '@/components/providers/AudioFXContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FluidRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

interface DockItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  href: string;
  gradient: string;
  shadowColor: string;
  isAction?: boolean;
}

// ─── Dock Configuration ────────────────────────────────────────────────────────

const DOCK_ITEMS: DockItem[] = [
  {
    id: 'dock-home',
    label: 'Beranda',
    icon: Home,
    href: '#hero',
    gradient: 'linear-gradient(145deg, #1E90FF 0%, #007AFF 50%, #0051C3 100%)',
    shadowColor: 'rgba(0, 122, 255, 0.45)',
  },
  {
    id: 'dock-projects',
    label: 'Proyek',
    icon: Briefcase,
    href: '#portfolio',
    gradient: 'linear-gradient(145deg, #7B79F7 0%, #5856D6 50%, #3634A3 100%)',
    shadowColor: 'rgba(88, 86, 214, 0.45)',
  },
  {
    id: 'dock-journey',
    label: 'Perjalanan',
    icon: Compass,
    href: '#journey',
    gradient: 'linear-gradient(145deg, #FFAC33 0%, #FF9500 50%, #CC7700 100%)',
    shadowColor: 'rgba(255, 149, 0, 0.45)',
  },
  {
    id: 'dock-blog',
    label: 'Blog',
    icon: BookOpen,
    href: '/blog',
    gradient: 'linear-gradient(145deg, #4CD964 0%, #34C759 50%, #248A3D 100%)',
    shadowColor: 'rgba(52, 199, 89, 0.45)',
  },
  {
    id: 'dock-contact',
    label: 'Kontak',
    icon: Mail,
    href: '#contact',
    gradient: 'linear-gradient(145deg, #2DD4CF 0%, #00C7BE 50%, #008580 100%)',
    shadowColor: 'rgba(0, 199, 190, 0.45)',
  },
  {
    id: 'dock-spotlight',
    label: 'Spotlight',
    icon: Search,
    href: 'spotlight',
    gradient: 'linear-gradient(145deg, #8E9BAA 0%, #6B7280 50%, #4B5563 100%)',
    shadowColor: 'rgba(107, 114, 128, 0.45)',
    isAction: true,
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * LiquidGlassDecorations — Authentic Apple iPhone OS Liquid Glass System
 *
 * 1. Living Molten Glass Canvas: undulating translucent ribbon streams with
 *    specular highlights, optical caustics, and interactive ripples.
 * 2. iPhone Glass Dock: floating squircle frosted-glass dock with macOS-style
 *    magnification hover, spring click physics, active indicators, Home Bar.
 * 3. Performance: 30 FPS cap, scroll-yield, tab-visibility pause.
 */
export default function LiquidGlassDecorations() {
  const [mounted, setMounted] = useState(false);
  const [activeItem, setActiveItem] = useState('dock-home');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [dockVisible, setDockVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const { play } = useAudioFX();
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Mount ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Active section tracker via scroll ─────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    const updateActive = () => {
      // Auto-dim dock while scrolling
      setDockVisible(false);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => setDockVisible(true), 400);

      const scrollPos = window.scrollY + window.innerHeight * 0.4;
      const sectionMap = [
        { id: 'dock-home', elemId: 'hero' },
        { id: 'dock-projects', elemId: 'portfolio' },
        { id: 'dock-journey', elemId: 'journey' },
        { id: 'dock-contact', elemId: 'contact' },
      ];

      for (let i = sectionMap.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionMap[i].elemId);
        if (el && el.offsetTop <= scrollPos) {
          setActiveItem(sectionMap[i].id);
          break;
        }
      }

      if (window.location.pathname.startsWith('/blog')) {
        setActiveItem('dock-blog');
      }
    };

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
    return () => {
      window.removeEventListener('scroll', updateActive);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [mounted]);

  // ── Dock Click Handler ─────────────────────────────────────────────────────
  const handleDockClick = useCallback((item: DockItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    play('tab');
    setPressedId(item.id);
    setTimeout(() => setPressedId(null), 350);

    if (item.isAction) {
      window.dispatchEvent(new CustomEvent('open-command-palette'));
      return;
    }

    if (item.href.startsWith('#')) {
      const targetId = item.href.substring(1);
      if (window.location.pathname !== '/') {
        router.push('/' + item.href);
      } else {
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      setActiveItem(item.id);
    } else {
      router.push(item.href);
      setActiveItem(item.id);
    }
  }, [play, router]);

  // ── Icon magnification scale (macOS dock magnification physics) ─────────────
  const getScale = useCallback((idx: number): number => {
    if (hoveredIndex === null) return 1;
    const dist = Math.abs(idx - hoveredIndex);
    if (dist === 0) return 1.45;
    if (dist === 1) return 1.22;
    if (dist === 2) return 1.08;
    return 1;
  }, [hoveredIndex]);

  // ── Canvas: Molten Liquid Glass Streams ─────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let rafId: number;
    let lastTime = 0;
    const fpsInterval = 1000 / 30;
    const ripples: FluidRipple[] = [];
    let lastRippleTime = 0;
    let isScrolling = false;
    let scrollTimer: ReturnType<typeof setTimeout>;

    const handleClick = (e: MouseEvent) => {
      // Subtle liquid glass touch ripple
      for (let k = 0; k < 2; k++) {
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 8 + k * 14,
          maxRadius: 110 + Math.random() * 30,
          opacity: 0.38 - k * 0.14,
          speed: 4 + k * 1.5,
        });
      }
      if (!rafId && !isScrolling) {
        rafId = requestAnimationFrame(render);
      }
    };

    const onScroll = () => {
      if (!isScrolling) {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      }
      isScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling = false;
        if (ripples.length > 0 && !rafId) {
          rafId = requestAnimationFrame(render);
        }
      }, 150);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    resize();

    const render = (ts: number) => {
      if (document.hidden || isScrolling) {
        rafId = 0;
        return;
      }

      const elapsed = ts - lastTime;
      if (elapsed < fpsInterval) {
        rafId = requestAnimationFrame(render);
        return;
      }
      lastTime = ts - (elapsed % fpsInterval);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (ripples.length === 0) {
        rafId = 0; // Stop RAF completely when no ripples exist — 0% idle CPU
        return;
      }

      // ── Fluid ripples ───────────────────────────────────────────────────────
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.opacity *= 0.945;
        if (r.radius > r.maxRadius || r.opacity < 0.01) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        // Blue refraction rim
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,122,255,${r.opacity * 0.35})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        // White specular ring
        ctx.beginPath();
        ctx.arc(r.x, r.y, Math.max(0, r.radius - 2), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${r.opacity * 0.70})`;
        ctx.lineWidth = 1.0;
        ctx.stroke();
        // Violet dispersion
        ctx.beginPath();
        ctx.arc(r.x, r.y, Math.max(0, r.radius - 4.5), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(88,86,214,${r.opacity * 0.20})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      }

      if (ripples.length > 0) {
        rafId = requestAnimationFrame(render);
      } else {
        rafId = 0;
      }
    };

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(scrollTimer);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      {/* ── 1. Molten Liquid Glass Canvas ─────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[1]"
        aria-hidden="true"
      />

      {/* ── 2. iPhone Liquid Glass Dock ───────────────────────────────── */}
      <nav
        aria-label="Navigation Dock"
        role="navigation"
        style={{
          position: 'fixed',
          bottom: '18px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          pointerEvents: 'auto',
          opacity: dockVisible ? 1 : 0.28,
          transition: 'opacity 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>

          {/* ── Dock Glass Pill ─────────────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '6px',
              padding: '10px 14px 10px 14px',
              borderRadius: '28px',
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(36px) saturate(220%) brightness(108%)',
              WebkitBackdropFilter: 'blur(36px) saturate(220%) brightness(108%)',
              border: '1.4px solid rgba(255, 255, 255, 0.95)',
              boxShadow: [
                '0 24px 60px -12px rgba(0, 82, 204, 0.20)',
                '0 8px 24px -4px rgba(15, 23, 42, 0.10)',
                '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
                'inset 0 2px 1px 0 rgba(255, 255, 255, 1.0)',
                'inset 0 -1px 2px 0 rgba(0, 122, 255, 0.08)',
              ].join(', '),
            }}
          >
            {DOCK_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              const isPressed = pressedId === item.id;
              const scale = getScale(idx);

              return (
                <div
                  key={item.id}
                  style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  {/* Tooltip */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      bottom: `calc(100% + ${8 + (scale - 1) * 44}px)`,
                      left: '50%',
                      transform: `translateX(-50%) scale(${hoveredIndex === idx ? 1 : 0.85})`,
                      opacity: hoveredIndex === idx ? 1 : 0,
                      transition: 'opacity 0.18s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1), bottom 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.01em',
                      color: '#1C1C1E',
                      background: 'rgba(255,255,255,0.92)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.98)',
                      boxShadow: '0 4px 16px -2px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,1)',
                    }}
                  >
                    {item.label}
                    {/* Tooltip arrow */}
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        bottom: '-5px',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        width: '10px',
                        height: '10px',
                        background: 'rgba(255,255,255,0.92)',
                        borderRight: '1px solid rgba(255,255,255,0.98)',
                        borderBottom: '1px solid rgba(255,255,255,0.98)',
                      }}
                    />
                  </div>

                  {/* App Tile Button */}
                  <button
                    type="button"
                    id={item.id}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={(e) => handleDockClick(item, e)}
                    onMouseEnter={() => {
                      setHoveredIndex(idx);
                      play('hover');
                    }}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onTouchStart={() => setPressedId(item.id)}
                    onTouchEnd={() => setTimeout(() => setPressedId(null), 300)}
                    style={{
                      position: 'relative',
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      background: item.gradient,
                      boxShadow: isActive
                        ? `0 0 0 2.5px rgba(255,255,255,0.9), 0 10px 28px -6px ${item.shadowColor}, inset 0 1.5px 1px rgba(255,255,255,0.70), inset 0 -1px 2px rgba(0,0,0,0.22)`
                        : `0 8px 20px -6px ${item.shadowColor}, inset 0 1.5px 1px rgba(255,255,255,0.65), inset 0 -1px 2px rgba(0,0,0,0.18)`,
                      transform: `scale(${isPressed ? 0.88 : scale}) translateY(${isPressed ? 2 : -(scale - 1) * 8}px)`,
                      transition: isPressed
                        ? 'transform 0.08s cubic-bezier(0.4,0,0.6,1), box-shadow 0.08s ease'
                        : 'transform 0.32s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s cubic-bezier(0.34,1.56,0.64,1)',
                      outline: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {/* Glass specular top gloss */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'inherit',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.08) 55%, transparent 100%)',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Bottom bevel shadow */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'inherit',
                        background: 'linear-gradient(0deg, rgba(0,0,0,0.18) 0%, transparent 40%)',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* App Icon */}
                    <Icon size={22} strokeWidth={2.0} color="white" />

                    {/* Active dot indicator */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          bottom: '-9px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: 'rgba(30,30,30,0.75)',
                          boxShadow: '0 0 6px rgba(255,255,255,0.6)',
                          transition: 'opacity 0.2s ease',
                        }}
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* iPhone Home Bar */}
          <div
            aria-hidden="true"
            style={{
              width: '134px',
              height: '5px',
              borderRadius: '100px',
              background: 'rgba(30, 30, 30, 0.22)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              transition: 'opacity 0.3s ease',
            }}
          />
        </div>
      </nav>
    </>
  );
}
