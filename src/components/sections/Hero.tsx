
"use client"

import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from '../ui/button';
import { ArrowRight, Download, Code2, Globe2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useProjectStore } from '../ProjectStore';
import { cn } from '@/lib/utils';

export const Hero = () => {
  const { t, language } = useLanguage();
  const { projects, profile } = useProjectStore();
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Smooth tilt on the WRAPPER only — never on the rounded card itself
  const tiltRef = useRef({ x: 0, y: 0, raf: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 14;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;

      // Use RAF for butter-smooth 60fps updates without causing React re-renders
      cancelAnimationFrame(tiltRef.current.raf);
      tiltRef.current.raf = requestAnimationFrame(() => {
        tiltRef.current.x = x;
        tiltRef.current.y = y;

        // Apply directly to DOM — no setState, no re-render
        const orb1 = document.getElementById('hero-orb-1');
        const orb2 = document.getElementById('hero-orb-2');
        const tiltWrap = document.getElementById('hero-card-tilt');

        if (orb1) orb1.style.transform = `translate(${x * 0.6}px, ${y * 0.6}px)`;
        if (orb2) orb2.style.transform = `translate(${-x * 0.4}px, ${-y * 0.4}px)`;
        // Tilt the WRAPPER div (not the rounded card) — safe because wrapper has no overflow/border-radius
        if (tiltWrap) {
          tiltWrap.style.transform = `perspective(800px) rotateY(${x * 0.4}deg) rotateX(${-y * 0.25}deg)`;
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(tiltRef.current.raf);
    };
  }, []);

  const featuredProject = projects.find(p => p.featured);
  const heroTitle    = (language === 'id' ? profile.heroTitleId    : (profile.heroTitleEn    || profile.heroTitleId))    ?? '';
  const heroSubtitle = (language === 'id' ? profile.heroSubtitleId : (profile.heroSubtitleEn || profile.heroSubtitleId)) ?? '';
  const isValidImageUrl = (url: string) => url && (url.startsWith('http') || url.startsWith('/'));

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center bg-background selection:bg-primary/30 overflow-hidden">

      {/* ── Background: dot grid + orbs ─────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        {/* Orbs — tilt via direct DOM, no React re-render */}
        <div
          id="hero-orb-1"
          className="absolute top-[10%] left-[5%] w-[560px] h-[560px] bg-primary/8 rounded-full blur-[140px]"
          style={{ transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
        />
        <div
          id="hero-orb-2"
          className="absolute bottom-[5%] right-[0%] w-[420px] h-[420px] bg-primary/5 rounded-full blur-[120px]"
          style={{ transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
        />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center relative z-10 py-24 sm:py-32">

        {/* ── LEFT: Text content ──────────────────────────────────── */}
        <div className={cn(
          "lg:col-span-7 transition-[opacity,transform] duration-1000 ease-out",
          isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
        )}>
          {/* Status badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-card mb-7 max-w-full">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[11px] font-semibold text-foreground/70 truncate">
              {language === 'id' ? 'Aktif & Siap Berkolaborasi' : 'Available for Work'}
            </span>
          </div>

          {/* Name */}
          <p className="text-base sm:text-lg font-semibold text-muted-foreground mb-3 tracking-wide">
            {profile.name || "Nara Andra Tyaga"}
          </p>

          {/* Headline — staggered word reveal */}
          <h1 className="text-[clamp(2.8rem,7.5vw,7rem)] font-black leading-[0.9] mb-7 tracking-tight">
            {heroTitle.split(' ').map((word, i) => (
              <span
                key={i}
                className={cn(
                  "inline-block mr-[0.1em]",
                  "animate-in fade-in slide-in-from-bottom-6 duration-700",
                  i % 2 !== 0
                    ? 'bg-gradient-to-br from-primary via-primary to-primary/60 bg-clip-text text-transparent'
                    : 'text-foreground'
                )}
                style={{ animationDelay: `${150 + i * 90}ms`, animationFillMode: 'both' }}
              >
                {word}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <div className="flex items-start gap-4 mb-9 max-w-lg">
            <div className="w-[2px] self-stretch bg-gradient-to-b from-primary via-primary/40 to-transparent rounded-full shrink-0" />
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {heroSubtitle}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 no-print">
            <Link href="#portfolio" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 rounded-full gap-3 group relative overflow-hidden font-bold bg-primary text-primary-foreground
                           shadow-[0_0_32px_-6px_hsl(var(--primary)/0.5)]
                           hover:shadow-[0_0_48px_-4px_hsl(var(--primary)/0.65)]
                           hover:scale-[1.03] active:scale-[0.97]
                           transition-[transform,box-shadow] duration-300 ease-out"
              >
                <span className="absolute inset-0 bg-white/0 group-hover:bg-white/8 transition-colors duration-300 rounded-full" />
                <span className="relative">{t.viewProjects}</span>
                <ArrowRight className="relative h-4 w-4 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.print()}
              className="w-full sm:w-auto h-14 px-8 rounded-full font-semibold gap-3
                         border-border/40 hover:border-primary/50 hover:bg-primary/5
                         hover:scale-[1.03] active:scale-[0.97]
                         transition-[transform,border-color,background-color] duration-300 ease-out"
            >
              <Download className="h-4 w-4" />
              {language === 'id' ? 'Unduh CV' : 'Download CV'}
            </Button>
          </div>

          {/* Tech strip */}
          <div className="mt-12 flex items-center gap-3 text-xs text-muted-foreground/50">
            <div className="flex -space-x-2">
              {['bg-blue-500', 'bg-purple-500', 'bg-emerald-500'].map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full border-2 border-background ${c} flex items-center justify-center text-white text-[9px] font-bold`}>
                  {['N', 'A', 'T'][i]}
                </div>
              ))}
            </div>
            <span>Next.js · React · TypeScript · Firebase</span>
          </div>
        </div>

        {/* ── RIGHT: Project card ─────────────────────────────────── */}
        <div className={cn(
          "lg:col-span-5 transition-[opacity,transform] duration-1000 delay-300 ease-out order-first lg:order-last",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        )}>
          <div className="relative group max-w-[320px] sm:max-w-[380px] mx-auto lg:max-w-none">

            {/* Ambient glow — purely decorative, behind the card */}
            <div
              className="absolute -inset-6 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 rounded-[3rem] blur-3xl
                         opacity-40 group-hover:opacity-70 transition-opacity duration-700"
            />

            {/*
              TILT WRAPPER — this is the only element that receives 3D perspective transform.
              It has NO overflow: hidden, NO border-radius → so 3D rotation never causes
              the "boxy corners" bug. It just tilts freely in 3D space.
            */}
            <div
              id="hero-card-tilt"
              style={{ transition: 'transform 0.15s linear' }}
            >
              {/*
                VISUAL CARD — has overflow: hidden + border-radius.
                It NEVER receives a 3D transform. Only hover lift (translateY) is allowed here.
                This is the key fix: separate the 3D tilt from the rounded element.
              */}
              <div
                ref={cardRef}
                className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5]
                           group-hover:-translate-y-3
                           transition-transform duration-500 ease-out"
                style={{ isolation: 'isolate' }}
              >
                {featuredProject && isValidImageUrl(featuredProject.imageUrl) ? (
                  <>
                    {/* Image with smooth zoom on hover */}
                    <div className="absolute inset-0 group-hover:scale-[1.06] transition-transform ease-out" style={{ transitionDuration: '900ms' }}>
                      <Image
                        src={featuredProject.imageUrl}
                        alt={language === 'id' ? featuredProject.titleId : featuredProject.titleEn}
                        fill priority
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 40vw"
                        className="object-cover"
                      />
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                    {/* Card content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7 text-white">
                      <div className="w-fit mb-3 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-[9px] font-bold uppercase tracking-wider">
                        <Sparkles className="inline h-2.5 w-2.5 mr-1" />
                        Proyek Unggulan
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black mb-3 leading-tight">
                        {language === 'id' ? featuredProject.titleId : featuredProject.titleEn}
                      </h2>
                      <div className="flex flex-wrap gap-1.5">
                        {featuredProject.technologies.slice(0, 3).map(tech => (
                          <div key={tech} className="flex items-center gap-1.5 text-[9px] font-semibold bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                            <Code2 className="h-2.5 w-2.5 text-primary" />
                            {tech}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center bg-muted/10">
                    <Globe2 className="h-14 w-14 text-primary animate-pulse" />
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">System Online</p>
                      <p className="text-muted-foreground text-xs">Tambah proyek di Admin Dashboard</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ──────────────────────────────────────── */}
      <div className={cn(
        "absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2",
        "transition-[opacity,transform] duration-1000",
        isVisible ? "opacity-35 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <span className="text-[8px] uppercase tracking-[0.35em] text-muted-foreground">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-muted-foreground/60 to-transparent animate-pulse" />
      </div>
    </section>
  );
};
