
"use client"

import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import { Card, CardContent } from '../ui/card';
import { Quote, Star } from 'lucide-react';
import Image from 'next/image';

export const Testimonials = () => {
  const { t, language } = useLanguage();
  const { testimonials } = useProjectStore();

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/4 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-14 md:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-primary text-[10px] font-bold tracking-wider uppercase">
            <Star className="h-3 w-3 fill-primary" />
            Social Proof
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-headline tracking-tight">{t.testimonials}</h2>
          {/* Star row */}
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-primary text-primary" />
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto">
          {testimonials.map((test, idx) => {
            const role    = language === 'id' ? test.roleId    : (test.roleEn    || test.roleId);
            const content = language === 'id' ? test.contentId : (test.contentEn || test.contentId);
            const isValidAvatarUrl = test.avatarUrl && (test.avatarUrl.startsWith('http') || test.avatarUrl.startsWith('/'));

            return (
              <div
                key={test.id}
                className="glass-card glow-card p-6 sm:p-8 relative overflow-hidden group flex flex-col"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Decorative quote */}
                <Quote className="absolute -top-2 -right-2 h-24 w-24 text-primary/5 rotate-12 group-hover:text-primary/10 transition-colors duration-500" />

                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 flex-1 italic relative z-10">
                  &ldquo;{content}&rdquo;
                </p>

                <div className="section-divider mb-6" />

                {/* Author */}
                <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                  <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-primary/30 bg-muted flex items-center justify-center shrink-0 shadow-lg shadow-primary/10">
                    {isValidAvatarUrl ? (
                      <Image src={test.avatarUrl} alt={test.name} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-black bg-primary/10 text-lg">
                        {test.name ? test.name[0].toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base">{test.name}</h4>
                    <p className="text-xs text-primary font-semibold">{role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
