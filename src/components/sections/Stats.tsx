"use client"

import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import { Card, CardContent } from '../ui/card';
import { Briefcase, Code, Terminal, Users } from 'lucide-react';

export const Stats = () => {
  const { t } = useLanguage();
  const { stats } = useProjectStore();

  const statsData = [
    { label: t.statsCompleted, value: stats.completedProjects, icon: Briefcase, color: 'text-primary' },
    { label: t.statsExperience, value: stats.yearsExperience, icon: Users, color: 'text-green-500' },
    { label: t.statsTechnologies, value: stats.techMastered, icon: Terminal, color: 'text-accent' },
    { label: 'Client Satisfaction', value: stats.clientSatisfaction, icon: Code, color: 'text-pink-500' },
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsData.map((stat, i) => (
            <Card key={i} className="border-none shadow-none bg-transparent group">
              <CardContent className="flex flex-col items-center p-6">
                <div className={`p-4 rounded-2xl bg-white dark:bg-card mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold font-headline mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground text-center font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
