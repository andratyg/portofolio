"use client"

import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import { Briefcase, ShieldCheck, Activity, Terminal } from 'lucide-react';
import { ParticleCanvas } from '../ui/ParticleCanvas';

import { motion, useInView, useSpring, useTransform } from 'framer-motion';

// Count-up animation using Framer Motion
function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const spring = useSpring(0, { bounce: 0, duration: 2000 });
  const display = useTransform(spring, (current) => Math.floor(current));

  useEffect(() => {
    if (isInView) spring.set(value);
  }, [isInView, spring, value]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

type StatItem = {
  label: string;
  value: number;
  suffix: string;
  icon: React.ElementType;
  description: string;
  size: 'large' | 'small';
};

const StatCard = ({ stat, delay }: { stat: StatItem; delay: number }) => {
  const Icon = stat.icon;

  if (stat.size === 'large') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay }}
        className="glass-card glow-card p-8 sm:p-10 flex flex-col justify-between h-full relative overflow-hidden group"
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
        <div className="relative z-10">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300"
          >
            <Icon className="h-7 w-7 text-primary" />
          </motion.div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-3">{stat.label}</p>
          <div className="flex items-end gap-1 mb-3">
            <span className="text-7xl sm:text-8xl font-black font-headline tracking-tight leading-none text-foreground tabular-nums">
              <AnimatedCounter value={stat.value} />
            </span>
            <span className="text-3xl font-black text-primary mb-2">{stat.suffix}</span>
          </div>
          <p className="text-sm text-muted-foreground">{stat.description}</p>
        </div>
        {/* Watermark */}
        <div className="absolute bottom-4 right-4 text-[7rem] font-black text-foreground/[0.025] leading-none select-none pointer-events-none tabular-nums">
          {stat.value}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className="glass-card glow-card p-6 flex flex-col justify-between relative overflow-hidden group"
    >
      <div className="flex items-start justify-between mb-4">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: -5 }}
          className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300"
        >
          <Icon className="h-5 w-5 text-primary" />
        </motion.div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">{stat.label}</span>
      </div>
      <div>
        <div className="flex items-end gap-0.5 mb-1">
          <span className="text-4xl font-black font-headline tracking-tight text-foreground tabular-nums">
            <AnimatedCounter value={stat.value} />
          </span>
          <span className="text-xl font-black text-primary mb-1">{stat.suffix}</span>
        </div>
        <p className="text-xs text-muted-foreground">{stat.description}</p>
      </div>
    </motion.div>
  );
};

export const Stats = () => {
  const { t } = useLanguage();
  const { stats } = useProjectStore();

  const statsData: StatItem[] = [
    { label: t.statsCompleted,    value: parseInt(String(stats.completedProjects), 10) || 0,  suffix: '+', icon: Briefcase,    description: 'Proyek selesai dan terpublikasi', size: 'large' },
    { label: t.statsExperience,   value: parseInt(String(stats.yearsExperience), 10) || 0,    suffix: '+', icon: Activity,     description: 'Tahun pengalaman aktif',          size: 'small' },
    { label: t.statsTechnologies, value: parseInt(String(stats.techMastered), 10) || 0,       suffix: '+', icon: Terminal,     description: 'Teknologi dikuasai',              size: 'small' },
    { label: 'Kepuasan Klien',    value: parseInt(String(stats.clientSatisfaction), 10) || 100, suffix: '%', icon: ShieldCheck,  description: 'Tingkat kepuasan client',         size: 'small' },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <ParticleCanvas density={12000} className="opacity-80" />
      <div className="section-divider absolute top-0 left-0 right-0 z-10" />
      <div className="section-divider absolute bottom-0 left-0 right-0 z-10" />
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* First stat = large, spanning 2 rows on lg */}
          {statsData.map((stat, idx) => (
            <div key={idx} className={idx === 0 ? "col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
              <StatCard stat={stat} delay={idx * 0.15} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
