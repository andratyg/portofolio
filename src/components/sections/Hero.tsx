"use client"

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from '../ui/button';
import { ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { initialProjects } from '@/lib/data';
import Image from 'next/image';

export const Hero = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const featured = initialProjects.filter(p => p.featured);

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden py-20">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
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
              <Button size="lg" className="h-12 px-8 rounded-full gap-2 group">
                {t.viewProjects}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button variant="outline" size="lg" className="h-12 px-8 rounded-full">
                {t.navContact}
              </Button>
            </Link>
          </div>
        </div>

        <div className={`grid gap-4 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-card rounded-2xl overflow-hidden shadow-2xl border aspect-[16/9]">
              <Image 
                src={featured[0].imageUrl} 
                alt={featured[0].title} 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                data-ai-hint="finance analytics"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                <span className="text-xs uppercase tracking-widest text-primary font-bold mb-2">{t.featuredProjects}</span>
                <h3 className="text-2xl font-bold mb-2">{featured[0].title}</h3>
                <p className="text-sm text-gray-300 line-clamp-2">{featured[0].shortDescription}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {featured.slice(1, 3).map((proj) => (
              <div key={proj.id} className="relative aspect-[4/3] rounded-2xl overflow-hidden border shadow-lg group">
                <Image 
                  src={proj.imageUrl} 
                  alt={proj.title} 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  data-ai-hint="ecommerce website"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="secondary" size="sm" className="rounded-full">View</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute -z-10 top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -z-10 bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700"></div>
    </section>
  );
};
