
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
    <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden py-16 md:py-24 bg-background selection:bg-primary/30">
      <div className="container mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        <div className={cn(
          "lg:col-span-7 transition-all duration-1000 transform",
          isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
        )}>
          <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-xl shadow-primary/5 max-w-full overflow-hidden">
            <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-primary shrink-0" />
            <span className="truncate">{language === 'id' ? 'Sistem Aktif & Siap Berkolaborasi' : 'System Online & Ready for Deployment'}</span>
          </div>
          
          <div className="mb-4 sm:mb-6">
            <span className="text-xl sm:text-2xl md:text-3xl font-black text-foreground/80 tracking-tight block">
              {profile.name || "Portfolio Owner"}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[7rem] xl:text-[7.5rem] font-black leading-[0.9] mb-6 sm:mb-10 tracking-normal">
            {heroTitle.split(' ').map((word, i) => (
              <span key={i} className={cn(
                "inline-block mr-2 sm:mr-3",
                i % 2 !== 0 ? 'text-primary' : 'text-foreground'
              )}>
                {word}
              </span>
            ))}
          </h1>
          
          <div className="flex items-start gap-4 sm:gap-5 mb-8 sm:mb-12">
            <div className="w-8 sm:w-12 h-px bg-border mt-3 shrink-0"></div>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-prose leading-relaxed font-medium">
              {heroSubtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 no-print">
            <Link href="#portfolio" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-10 rounded-2xl gap-3 group shadow-2xl shadow-primary/20 text-white text-sm sm:text-lg font-black uppercase tracking-widest bg-primary hover:scale-[1.02] active:scale-95 transition-all">
                {t.viewProjects}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => window.print()}
              className="w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-10 rounded-2xl border-primary/20 hover:bg-primary/5 text-sm sm:text-lg font-black uppercase tracking-widest backdrop-blur-md gap-3 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              {language === 'id' ? 'Ekspor PDF' : 'Export PDF'}
            </Button>
          </div>
        </div>

        <div className={cn(
          "lg:col-span-5 transition-all duration-1000 delay-300 transform order-first lg:order-last",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        )}>
          <div className="relative group p-2 sm:p-4 max-w-xs sm:max-w-sm mx-auto lg:max-w-none">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary via-accent to-primary rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 animate-spin-slow"></div>
            <div className="relative glass-panel rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5] group-hover:-translate-y-3 transition-transform duration-700 border-primary/10">
              {featuredProject && isValidImageUrl(featuredProject.imageUrl) ? (
                <>
                  <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-1000">
                    <Image 
                      src={featuredProject.imageUrl} 
                      alt={language === 'id' ? featuredProject.titleId : featuredProject.titleEn} 
                      fill
                      priority
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 40vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-5 sm:p-8 text-white">
                    <div className="w-fit mb-3 bg-primary backdrop-blur-xl border border-primary text-primary-foreground text-xs font-semibold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">Proyek Unggulan</div>
                    <h2 className="text-xl sm:text-3xl font-black mb-2 sm:mb-3 tracking-normal leading-tight">
                      {language === 'id' ? featuredProject.titleId : featuredProject.titleEn}
                    </h2>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {featuredProject.technologies.slice(0, 3).map(tech => (
                        <div key={tech} className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-xl px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/10">
                           <Code2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                           {tech}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center bg-muted/20">
                   <Globe2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary animate-pulse" />
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
