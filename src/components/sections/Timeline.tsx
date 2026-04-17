"use client"

import React from 'react';
import { useLanguage } from '../LanguageContext';
import { timeline } from '@/lib/data';

export const Timeline = () => {
  const { t } = useLanguage();

  return (
    <section id="journey" className="py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-headline mb-4">{t.careerJourney}</h2>
            <div className="w-20 h-1.5 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {timeline.map((exp, index) => (
              <div key={exp.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-in slide-in-from-bottom duration-700 delay-${index * 100}`}>
                {/* Icon Circle */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                </div>

                {/* Content */}
                <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{exp.year}</span>
                  </div>
                  <h3 className="text-xl font-bold font-headline">{exp.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium mb-3">{exp.company}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
