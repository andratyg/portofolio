"use client"

import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../providers/LanguageContext';
import { useProjectStore } from '@/stores/ProjectStore';
import { cn } from '@/lib/utils';
import { TechSkill } from '@/lib/types';
import { m as motion, useInView, useSpring, useTransform } from 'framer-motion';

// Default tech stack — used as fallback when Firebase collection is empty
const defaultTechStack: TechSkill[] = [
  { id: 'nextjs', name: 'Next.js', icon: '▲', level: 90, color: 'from-white to-gray-400', category: 'Frontend' },
  { id: 'react', name: 'React', icon: '⚛', level: 92, color: 'from-cyan-400 to-blue-500', category: 'Frontend' },
  { id: 'typescript', name: 'TypeScript', icon: 'TS', level: 88, color: 'from-blue-400 to-blue-600', category: 'Frontend' },
  { id: 'javascript', name: 'JavaScript', icon: 'JS', level: 95, color: 'from-yellow-400 to-yellow-500', category: 'Frontend' },
  { id: 'tailwindcss', name: 'Tailwind CSS', icon: '🎨', level: 93, color: 'from-teal-400 to-cyan-500', category: 'Frontend' },
  { id: 'htmlcss', name: 'HTML/CSS', icon: '🌐', level: 97, color: 'from-orange-400 to-red-500', category: 'Frontend' },
  { id: 'firebase', name: 'Firebase', icon: '🔥', level: 85, color: 'from-amber-400 to-orange-500', category: 'Backend' },
  { id: 'nodejs', name: 'Node.js', icon: '🟢', level: 78, color: 'from-green-400 to-emerald-600', category: 'Backend' },
  { id: 'git', name: 'Git', icon: '📦', level: 82, color: 'from-red-400 to-orange-500', category: 'Tools' },
  { id: 'figma', name: 'Figma', icon: '🎯', level: 80, color: 'from-purple-400 to-pink-500', category: 'Design' },
  { id: 'framermotion', name: 'Framer Motion', icon: '✨', level: 83, color: 'from-pink-400 to-purple-500', category: 'Frontend' },
  { id: 'vercel', name: 'Vercel', icon: '◆', level: 88, color: 'from-gray-300 to-gray-500', category: 'Tools' },
];

function AnimatedProgressText({ value }: { value: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const spring = useSpring(0, { bounce: 0, duration: 1500 });
  const display = useTransform(spring, (current) => Math.floor(current));

  useEffect(() => {
    if (isInView) spring.set(value);
  }, [isInView, spring, value]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

const SkillCard = ({ tech, index }: { tech: TechSkill; index: number }) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 1 : -1 }}
      className={cn(
        "glass-card p-4 sm:p-5 group hover:border-primary/30 transition-all duration-300"
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div 
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-lg overflow-hidden",
            (tech.color && (tech.color.includes('from-') || tech.color.includes('bg-'))) 
              ? `bg-gradient-to-br ${tech.color}` 
              : ""
          )}
          style={!(tech.color && (tech.color.includes('from-') || tech.color.includes('bg-'))) ? { background: tech.color || 'var(--primary)' } : {}}
        >
          <span className="font-black text-base text-foreground flex items-center justify-center w-full h-full">
            {(tech.icon && (tech.icon.startsWith('http') || tech.icon.startsWith('/'))) ? (
              <img src={tech.icon} alt={tech.name} className="w-6 h-6 object-contain drop-shadow-md" />
            ) : (
              tech.icon
            )}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm truncate">{tech.name}</h3>
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">{tech.category}</span>
        </div>
        <span className="text-xs font-black text-primary tabular-nums">
          <AnimatedProgressText value={tech.level} />%
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: index * 0.05, ease: "easeOut" }}
          className="h-full rounded-full bg-primary origin-left"
          style={{ width: `${tech.level}%` }}
        />
      </div>
    </motion.div>
  );
};

export const TechStack = () => {
  const { language } = useLanguage();
  const { techSkills } = useProjectStore();

  // Use Firebase data if available, otherwise use defaults
  const skills = techSkills.length > 0 ? techSkills : defaultTechStack;

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-primary text-[10px] font-bold tracking-wider uppercase">
            <span>⚡</span>
            Tech Arsenal
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {language === 'id' ? 'Teknologi yang Dikuasai' : 'Technologies I Master'}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
            {language === 'id' 
              ? 'Stack teknologi yang saya gunakan untuk membangun solusi digital modern.'
              : 'The tech stack I use to build modern digital solutions.'}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {skills.map((tech, idx) => (
            <SkillCard key={tech.id} tech={tech} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};
