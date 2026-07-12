
"use client"

import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import { Briefcase, ShieldCheck, Activity, Terminal } from 'lucide-react';

// Count-up animation hook
function useCountUp(target: number, duration = 1500, trigger: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, trigger]);
  return count;
}

type StatItem = {
  label: string;
  value: number;
  suffix: string;
  icon: React.ElementType;
  description: string;
  size: 'large' | 'small';
};

const StatCard = ({ stat, trigger }: { stat: StatItem; trigger: boolean }) => {
  const count = useCountUp(stat.value, 1800, trigger);
  const Icon = stat.icon;

  if (stat.size === 'large') {
    return (
      <div className="glass-card glow-card p-8 sm:p-10 flex flex-col justify-between h-full relative overflow-hidden group">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-3">{stat.label}</p>
          <div className="flex items-end gap-1 mb-3">
            <span className="text-7xl sm:text-8xl font-black font-headline tracking-tight leading-none text-foreground tabular-nums">
              {count}
            </span>
            <span className="text-3xl font-black text-primary mb-2">{stat.suffix}</span>
          </div>
          <p className="text-sm text-muted-foreground">{stat.description}</p>
        </div>
        {/* Watermark */}
        <div className="absolute bottom-4 right-4 text-[7rem] font-black text-foreground/[0.025] leading-none select-none pointer-events-none tabular-nums">
          {stat.value}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card glow-card p-6 flex flex-col justify-between relative overflow-hidden group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">{stat.label}</span>
      </div>
      <div>
        <div className="flex items-end gap-0.5 mb-1">
          <span className="text-4xl font-black font-headline tracking-tight text-foreground tabular-nums">{count}</span>
          <span className="text-xl font-black text-primary mb-1">{stat.suffix}</span>
        </div>
        <p className="text-xs text-muted-foreground">{stat.description}</p>
      </div>
    </div>
  );
};

export const Stats = () => {
  const { t } = useLanguage();
  const { stats } = useProjectStore();
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const statsData: StatItem[] = [
    { label: t.statsCompleted,    value: parseInt(String(stats.completedProjects), 10) || 0,  suffix: '+', icon: Briefcase,    description: 'Proyek selesai dan terpublikasi', size: 'large' },
    { label: t.statsExperience,   value: parseInt(String(stats.yearsExperience), 10) || 0,    suffix: '+', icon: Activity,     description: 'Tahun pengalaman aktif',          size: 'small' },
    { label: t.statsTechnologies, value: parseInt(String(stats.techMastered), 10) || 0,       suffix: '+', icon: Terminal,     description: 'Teknologi dikuasai',              size: 'small' },
    { label: 'Kepuasan Klien',    value: parseInt(String(stats.clientSatisfaction), 10) || 100, suffix: '%', icon: ShieldCheck,  description: 'Tingkat kepuasan client',         size: 'small' },
  ];

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="section-divider absolute bottom-0 left-0 right-0" />
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* First stat = large, spanning 2 rows on lg */}
          <div className="col-span-2 lg:col-span-1 lg:row-span-1">
            <StatCard stat={statsData[0]} trigger={triggered} />
          </div>
          {statsData.slice(1).map((stat) => (
            <div key={stat.label}>
              <StatCard stat={stat} trigger={triggered} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
