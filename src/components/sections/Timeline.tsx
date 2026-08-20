"use client"

import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import { Badge } from '../ui/badge';
import { History, Briefcase, GraduationCap, Milestone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ParticleCanvas } from '../ui/ParticleCanvas';
import { m as motion, useScroll, useTransform } from 'framer-motion';

export const Timeline = () => {
  const { t, language } = useLanguage();
  const { experiences } = useProjectStore();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const getIcon = (type?: string) => {
    switch(type) {
      case 'Work': return Briefcase;
      case 'Education': return GraduationCap;
      default: return Milestone;
    }
  };

  return (
    <section ref={containerRef} id="journey" className="py-16 md:py-24 bg-muted/20 relative overflow-hidden">
      <ParticleCanvas density={12000} className="opacity-60" />
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-16 space-y-4">
            <Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full font-bold tracking-wider">Career Path</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold  mb-4">{t.careerJourney}</h2>
            <div className="w-20 h-1.5 bg-primary mx-auto rounded-full"></div>
          </div>

          {experiences.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground italic">
              No journey entries found.
            </div>
          ) : (
            <div className="relative space-y-8">
              {/* The Drawing Line */}
              <motion.div 
                className="absolute left-5 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary origin-top z-0 -translate-x-px md:-translate-x-1/2"
                style={{ scaleY: lineScale }}
              />
              {/* Faded background line for contrast */}
              <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-0.5 bg-border/40 z-[-1] -translate-x-px md:-translate-x-1/2" />

              {experiences.map((exp, index) => {
                const title = language === 'id' ? exp.titleId : (exp.titleEn || exp.titleId);
                const description = language === 'id' ? exp.descriptionId : (exp.descriptionEn || exp.descriptionId);
                
                return (
                  <motion.div 
                    key={exp.id} 
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                    className={cn(
                      "relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                    )}
                  >
                    {/* Icon Circle */}
                    <motion.div 
                      whileHover={{ scale: 1.2, rotate: 180 }}
                      className="flex items-center justify-center w-10 h-10 rounded-full border border-primary/30 bg-background shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"
                    >
                      <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                    </motion.div>

                    {/* Content */}
                    <div className="w-[calc(100%-3.5rem)] md:w-[45%] p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border bg-card shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 hover:-translate-y-1 transition-all duration-400 ease-out z-10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] sm:text-[10px] font-black text-primary bg-primary/10 px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-widest">{exp.year}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold ">{title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-2 sm:mb-3">{exp.company}</p>
                      <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">{description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
