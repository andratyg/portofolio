"use client"

import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import { Card, CardContent } from '../ui/card';
import { Briefcase, ShieldCheck, Activity, BarChart3, Terminal } from 'lucide-react';

export const Stats = () => {
  const { t } = useLanguage();
  const { stats } = useProjectStore();

  const statsData = [
    { 
      label: t.statsCompleted, 
      value: stats.completedProjects, 
      icon: Briefcase, 
      color: 'text-primary', 
      bg: 'bg-primary/10',
      tag: 'Units Deployed'
    },
    { 
      label: t.statsExperience, 
      value: stats.yearsExperience, 
      icon: Activity, 
      color: 'text-primary', 
      bg: 'bg-primary/10',
      tag: 'Industry Tenure'
    },
    { 
      label: t.statsTechnologies, 
      value: stats.techMastered, 
      icon: Terminal, 
      color: 'text-primary', 
      bg: 'bg-primary/10',
      tag: 'System Stack'
    },
    { 
      label: 'Client Satisfaction', 
      value: stats.clientSatisfaction, 
      icon: ShieldCheck, 
      color: 'text-primary', 
      bg: 'bg-primary/10',
      tag: 'Uptime SLA'
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-muted/30 border-y border-border/50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statsData.map((stat, i) => (
            <div key={i} className="group relative">
               <div className="absolute -inset-2 bg-primary/5 rounded-[2rem] sm:rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg"></div>
               <div className="relative h-full border border-border/50 bg-card/50 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-xl hover:border-primary/50 transition-all duration-500">
                  <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <BarChart3 className={stat.color + " h-8 w-8 sm:h-12 sm:w-12"} />
                  </div>
                  <div className="p-5 sm:p-8">
                    <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500`}>
                      <stat.icon className="h-4 w-4 sm:h-6 sm:w-6" />
                    </div>
                    <div className="space-y-1">
                       <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground">{stat.tag}</p>
                       <div className="text-2xl sm:text-4xl font-black  tracking-normal flex items-end gap-1 text-foreground">
                          {stat.value}
                          {stat.label.includes('Satisfaction') && <span className="text-base sm:text-xl text-primary">%</span>}
                       </div>
                       <p className="text-[10px] sm:text-xs font-bold text-muted-foreground pt-1 sm:pt-3">{stat.label}</p>
                    </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
