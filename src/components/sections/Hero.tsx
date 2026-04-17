"use client"

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from '../ui/button';
import { ArrowRight, Sparkles, Download, Code2, Globe2, Zap } from 'lucide-react';
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

  const featured = projects.filter(p => p.featured);
  const heroProject = featured.length > 0 ? featured[0] : projects[0];

  const heroTitle = language === 'id' ? profile.heroTitleId : (profile.heroTitleEn || profile.heroTitleId);
  const heroSubtitle = language === 'id' ? profile.heroSubtitleId : (profile.heroSubtitleEn || profile.heroSubtitleId);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden py-32 bg-background selection:bg-primary/30">
      {/* Advanced Aura blobs */}
      <div className="aura-blob top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/30 animate-pulse"></div>
      <div className="aura-blob bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/30 animate-pulse delay-1000"></div>
      <div className="aura-blob top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-primary/10 animate-spin-slow"></div>

      <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center relative z-10">
        <div className={cn(
          "lg:col-span-7 transition-all duration-1000 transform",
          isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
        )}>
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-xl shadow-primary/5 animate-bounce">
            <Zap className="h-4 w-4 fill-primary" />
            <span>{language === 'id' ? 'Sistem Aktif & Siap Berkolaborasi' : 'System Online & Ready for Deployment'}</span>
          </div>
          
          <h1 className="text-7xl md:text-8xl lg:text-[9rem] font-black font-headline leading-[0.85] mb-12 tracking-tighter">
            {heroTitle.split(' ').map((word, i) => (
              <span key={i} className={cn(
                "inline-block mr-4",
                i % 2 !== 0 ? 'text-primary' : 'text-foreground'
              )}>
                {word}
              </span>
            ))}
          </h1>
          
          <div className="flex items-center gap-6 mb-16">
            <div className="w-16 h-px bg-border"></div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-xl leading-relaxed font-medium">
              {heroSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-8 no-print">
            <Link href="#portfolio">
              <Button size="lg" className="h-20 px-12 rounded-[2rem] gap-4 group shadow-[0_20px_50px_rgba(var(--primary),0.3)] text-xl font-black uppercase tracking-widest bg-primary hover:scale-[1.02] active:scale-95 transition-all">
                {t.viewProjects}
                <ArrowRight className="h-6 w-6 group-hover:translate-x-3 transition-transform" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => window.print()}
              className="h-20 px-12 rounded-[2rem] border-primary/20 hover:bg-primary/5 text-xl font-black uppercase tracking-widest backdrop-blur-md gap-3 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Download className="h-6 w-6" />
              {language === 'id' ? 'Ekspor PDF' : 'Export PDF'}
            </Button>
          </div>
        </div>

        <div className={cn(
          "lg:col-span-5 transition-all duration-1000 delay-300 transform",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        )}>
          <div className="relative group p-6">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary via-accent to-primary rounded-[4rem] blur-3xl opacity-20 group-hover:opacity-40 transition duration-1000 animate-spin-slow"></div>
            <div className="relative glass-panel rounded-[3.5rem] overflow-hidden shadow-2xl aspect-[4/5] group-hover:-translate-y-4 transition-transform duration-700">
              {heroProject ? (
                <>
                  <Image 
                    src={heroProject.imageUrl} 
                    alt={language === 'id' ? heroProject.titleId : heroProject.titleEn} 
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-12 text-white">
                    <div className="w-fit mb-6 bg-primary/20 backdrop-blur-xl border border-primary/30 text-primary-foreground uppercase text-[10px] font-black tracking-[0.3em] px-5 py-2 rounded-full">{t.featuredProjects}</div>
                    <h3 className="text-4xl font-black mb-4 font-headline tracking-tighter leading-tight">
                      {language === 'id' ? heroProject.titleId : heroProject.titleEn}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {heroProject.technologies.slice(0, 3).map(tech => (
                        <div key={tech} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10">
                           <Code2 className="h-3.5 w-3.5 text-primary" />
                           {tech}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-12 text-center">
                   <Globe2 className="h-20 w-20 text-primary animate-pulse" />
                   <div className="space-y-2">
                     <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Awaiting Content</p>
                     <p className="text-muted-foreground text-sm font-medium">Please populate projects via admin dashboard to activate visual nodes.</p>
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