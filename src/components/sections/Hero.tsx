"use client"

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from '../ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useProjectStore } from '../ProjectStore';

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
    <section className="relative min-h-[95vh] flex flex-col justify-center overflow-hidden py-24 bg-background">
      {/* Background Aura */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[160px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[160px] animate-pulse delay-700"></div>

      <div className="container mx-auto px-4 grid lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className={`lg:col-span-7 transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-8 animate-bounce shadow-xl shadow-primary/5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{language === 'id' ? 'Tersedia untuk Proyek Baru' : 'Available for New Projects'}</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black font-headline leading-[0.95] mb-8 tracking-tighter">
            {heroTitle.split(' ').map((word, i) => (
              <span key={i} className={i % 2 !== 0 ? 'text-primary' : ''}>
                {word}{' '}
              </span>
            ))}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-xl leading-relaxed font-medium">
            {heroSubtitle}
          </p>

          <div className="flex flex-wrap gap-6">
            <Link href="#portfolio">
              <Button size="lg" className="h-16 px-10 rounded-2xl gap-3 group shadow-2xl shadow-primary/30 text-lg font-bold">
                {t.viewProjects}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl border-primary/20 hover:bg-primary/5 text-lg font-bold backdrop-blur-sm">
                {t.navContact}
              </Button>
            </Link>
          </div>
        </div>

        <div className={`lg:col-span-5 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <div className="relative group p-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary via-accent to-primary rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 animate-spin-slow"></div>
            <div className="relative bg-card rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-white/10 aspect-[4/5]">
              {heroProject && (
                <>
                  <Image 
                    src={heroProject.imageUrl} 
                    alt="Featured" 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-10 text-white">
                    <Badge className="w-fit mb-4 bg-primary/20 backdrop-blur-md border-primary/30 text-primary-foreground uppercase text-[10px] font-black tracking-widest">{t.featuredProjects}</Badge>
                    <h3 className="text-3xl font-bold mb-3 font-headline leading-tight">
                      {language === 'id' ? heroProject.titleId : heroProject.titleEn}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {heroProject.technologies.slice(0, 3).map(tech => (
                        <span key={tech} className="text-[10px] font-bold bg-white/10 backdrop-blur-md px-2 py-1 rounded-md">{tech}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`px-3 py-1 rounded-full text-xs font-bold ${className}`}>
    {children}
  </div>
);
