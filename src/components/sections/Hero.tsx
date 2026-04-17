"use client"

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useProjectStore } from '../ProjectStore';

export const Hero = () => {
  const { t, language } = useLanguage();
  const { projects } = useProjectStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const featured = projects.filter(p => p.featured);
  // Fallback to first project if no featured project is set
  const heroProject = featured.length > 0 ? featured[0] : projects[0];

  if (!heroProject) return null;

  const title = language === 'id' ? heroProject.titleId : (heroProject.titleEn || heroProject.titleId);
  const shortDesc = language === 'id' ? heroProject.shortDescriptionId : (heroProject.shortDescriptionEn || heroProject.shortDescriptionId);

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden py-20 bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
            ✨ Available for New Projects
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-headline leading-tight mb-6">
            {t.heroTitle}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-lg">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="#portfolio">
              <Button size="lg" className="h-12 px-8 rounded-full gap-2 group shadow-lg shadow-primary/20">
                {t.viewProjects}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button variant="outline" size="lg" className="h-12 px-8 rounded-full border-primary/30 hover:bg-primary/5">
                {t.navContact}
              </Button>
            </Link>
          </div>
        </div>

        <div className={`grid gap-4 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-card rounded-2xl overflow-hidden shadow-2xl border border-border aspect-[16/9]">
              <Image 
                src={heroProject.imageUrl} 
                alt={title} 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                data-ai-hint="finance analytics"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                <span className="text-xs uppercase tracking-widest text-primary font-bold mb-2">{t.featuredProjects}</span>
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
                <p className="text-sm text-gray-300 line-clamp-2">{shortDesc}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {featured.slice(1, 3).map((proj) => {
              const pTitle = language === 'id' ? proj.titleId : (proj.titleEn || proj.titleId);
              return (
                <div key={proj.id} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-lg group">
                  <Image 
                    src={proj.imageUrl} 
                    alt={pTitle} 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    data-ai-hint="ecommerce website"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button variant="secondary" size="sm" className="rounded-full">View</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
    </section>
  );
};
