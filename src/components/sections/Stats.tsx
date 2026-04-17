"use client"

import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import { Card, CardContent } from '../ui/card';
import { Briefcase, Code, Terminal, Users, Cpu, ShieldCheck, Activity, BarChart3 } from 'lucide-react';

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
      color: 'text-green-500', 
      bg: 'bg-green-500/10',
      tag: 'Industry Tenure'
    },
    { 
      label: t.statsTechnologies, 
      value: stats.techMastered, 
      icon: Terminal, 
      color: 'text-accent', 
      bg: 'bg-accent/10',
      tag: 'System Stack'
    },
    { 
      label: 'Client Satisfaction', 
      value: stats.clientSatisfaction, 
      icon: ShieldCheck, 
      color: 'text-pink-500', 
      bg: 'bg-pink-500/10',
      tag: 'Uptime SLA'
    },
  ];

  return (
    <section className="py-24 bg-card/30 border-y border-border/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
      </div>
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsData.map((stat, i) => (
            <div key={i} className="group relative">
               <div className="absolute -inset-2 bg-gradient-to-br from-white/5 to-white/10 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
               <Card className="relative h-full border border-border/50 bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl hover:border-primary/50 transition-all duration-500">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity">
                    <BarChart3 className={stat.color + " h-16 w-16"} />
                  </div>
                  <CardContent className="p-10">
                    <div className={`w-16 h-16 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                      <stat.icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{stat.tag}</p>
                       <div className="text-5xl font-black font-headline tracking-tighter flex items-end gap-1">
                          {stat.value}
                          {stat.label.includes('Satisfaction') && <span className="text-2xl text-primary">%</span>}
                       </div>
                       <p className="text-sm font-bold text-muted-foreground pt-4">{stat.label}</p>
                    </div>
                  </CardContent>
               </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};