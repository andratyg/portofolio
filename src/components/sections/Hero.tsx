
"use client"

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from '../ui/button';
import { ArrowRight, Zap, Download, Code2, Globe2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useProjectStore } from '../ProjectStore';
import { cn } from '@/lib/utils';

export const Hero = () => {
  const { t, language } = useLanguage();
  const { projects, profile } = useProjectStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const featuredProject = projects.find(p => p.featured);

  const heroTitle = language === 'id' ? profile.heroTitleId : (profile.heroTitleEn || profile.heroTitleId) ?? '';
  const heroSubtitle = language === 'id' ? profile.heroSubtitleId : (profile.heroSubtitleEn || profile.heroSubtitleId) ?? '';

  const isValidImageUrl = (url: string) => {
    return url && (url.startsWith('http') || url.startsWith('/'));
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden py-24 bg-background selection:bg-primary/30">
      <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className={cn(
          "lg:col-span-7 transition-all duration-1000 transform",
          isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
        )}>
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em] mb-8 shadow-xl shadow-primary/5">
            <Zap className="h-3.5 w-3.5 fill-primary" />
            <span>{language === 'id' ? 'Sistem Aktif & Siap Berkolaborasi' : 'System Online & Ready for Deployment'}</span>
          </div>
          
          <div className="mb-6">
            <span className="text-2xl md:text-3xl font-black font-headline text-foreground/80 tracking-tight block">
              {profile.name || "Portfolio Owner"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-[7.5rem] font-black font-headline leading-[0.9] mb-10 tracking-tighter">
            {heroTitle.split(' ').map((word, i) => (
              <span key={i} className={cn(
                "inline-block mr-3",
                i % 2 !== 0 ? 'text-primary' : 'text-foreground'
              )}>
                {word}
              </span>
            ))}
          </h1>
          
          <div className="flex items-center gap-5 mb-12">
            <div className="w-12 h-px bg-border"></div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed font-medium">
              {heroSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-6 no-print">
            <Link href="#portfolio">
              <Button size="lg" className="h-16 px-10 rounded-2xl gap-3 group shadow-2xl shadow-primary/20 text-lg font-black uppercase tracking-widest bg-primary hover:scale-[1.02] active:scale-95 transition-all">
                {t.viewProjects}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => window.print()}
              className="h-16 px-10 rounded-2xl border-primary/20 hover:bg-primary/5 text-lg font-black uppercase tracking-widest backdrop-blur-md gap-3 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Download className="h-5 w-5" />
              {language === 'id' ? 'Ekspor PDF' : 'Export PDF'}
            </Button>
          </div>
        </div>

        <div className={cn(
          "lg:col-span-5 transition-all duration-1000 delay-300 transform",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        )}>
          <div className="relative group p-4">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary via-accent to-primary rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 animate-spin-slow"></div>
            <div className="relative glass-panel rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5] group-hover:-translate-y-3 transition-transform duration-700 border-primary/10">
              {featuredProject && isValidImageUrl(featuredProject.imageUrl) ? (
                <>
                  <Image 
                    src={featuredProject.imageUrl} 
                    alt={language === 'id' ? featuredProject.titleId : featuredProject.titleEn} 
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 text-white">
                    <div className="w-fit mb-4 bg-primary/20 backdrop-blur-xl border border-primary/30 text-primary-foreground uppercase text-[8px] font-black tracking-[0.3em] px-4 py-1.5 rounded-full">PROYEK UNGGULAN</div>
                    <h3 className="text-3xl font-black mb-3 font-headline tracking-tighter leading-tight">
                      {language === 'id' ? featuredProject.titleId : featuredProject.titleEn}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {featuredProject.technologies.slice(0, 3).map(tech => (
                        <div key={tech} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-xl px-3 py-1.5 rounded-lg border border-white/10">
                           <Code2 className="h-3 w-3 text-primary" />
                           {tech}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center bg-muted/20">
                   <Globe2 className="h-16 w-16 text-primary animate-pulse" />
                   <div className="space-y-1">
                     <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">SYSTEM NODE ACTIVE</p>
                     <p className="text-muted-foreground text-xs font-medium">Awaiting visual synchronization.</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
