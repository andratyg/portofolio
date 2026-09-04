"use client"

import React, { useMemo } from 'react';
import { useLanguage } from '../providers/LanguageContext';
import { useProjectStore } from '@/stores/ProjectStore';
import { cn } from '@/lib/utils';
import { TechSkill } from '@/lib/types';
import { m as motion } from 'framer-motion';

const defaultTechStack: TechSkill[] = [
  { id: 'nextjs', name: 'Next.js', icon: '▲', level: 0, color: 'from-white to-gray-400', category: 'Daily Driver' },
  { id: 'react', name: 'React', icon: '⚛', level: 0, color: 'from-cyan-400 to-blue-500', category: 'Daily Driver' },
  { id: 'typescript', name: 'TypeScript', icon: 'TS', level: 0, color: 'from-blue-400 to-blue-600', category: 'Daily Driver' },
  { id: 'tailwindcss', name: 'Tailwind CSS', icon: '🎨', level: 0, color: 'from-teal-400 to-cyan-500', category: 'Daily Driver' },
  { id: 'firebase', name: 'Firebase', icon: '🔥', level: 0, color: 'from-amber-400 to-orange-500', category: 'Daily Driver' },
  { id: 'javascript', name: 'JavaScript', icon: 'JS', level: 0, color: 'from-yellow-400 to-yellow-500', category: 'Working Knowledge' },
  { id: 'nodejs', name: 'Node.js', icon: '🟢', level: 0, color: 'from-green-400 to-emerald-600', category: 'Working Knowledge' },
  { id: 'htmlcss', name: 'HTML & CSS', icon: '🌐', level: 0, color: 'from-orange-400 to-red-500', category: 'Working Knowledge' },
  { id: 'git', name: 'Git & GitHub', icon: '⌘', level: 0, color: 'from-red-400 to-orange-500', category: 'Tools & Ecosystem' },
  { id: 'figma', name: 'Figma', icon: '✦', level: 0, color: 'from-purple-400 to-pink-500', category: 'Tools & Ecosystem' },
  { id: 'vercel', name: 'Vercel', icon: '▲', level: 0, color: 'from-gray-300 to-gray-500', category: 'Tools & Ecosystem' },
  { id: 'framermotion', name: 'Framer Motion', icon: '✨', level: 0, color: 'from-pink-400 to-purple-500', category: 'Tools & Ecosystem' },
];

const categoryOrder = ['Daily Driver', 'Working Knowledge', 'Tools & Ecosystem'];

function categoryLabel(category: string, language: string) {
  if (language !== 'id') return category;
  if (category === 'Daily Driver') return 'Teknologi Utama';
  if (category === 'Working Knowledge') return 'Pengalaman Praktis';
  return 'Tools & Ekosistem';
}

function SkillBadge({ tech, index }: { tech: TechSkill; index: number }) {
  const gradient = tech.color && (tech.color.includes('from-') || tech.color.includes('bg-'));
  const isImageIcon = tech.icon && (tech.icon.startsWith('http') || tech.icon.startsWith('/'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -3, scale: 1.02 }}
      className="glass-card flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3.5 transition-colors hover:border-primary/40"
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black shadow-sm',
          gradient ? `bg-gradient-to-br ${tech.color}` : ''
        )}
        style={gradient ? undefined : { background: tech.color || 'var(--primary)' }}
      >
        {isImageIcon ? (
          <img src={tech.icon} alt="" width="24" height="24" loading="lazy" className="h-6 w-6 object-contain" />
        ) : (
          <span className="text-foreground">{tech.icon}</span>
        )}
      </div>
      <span className="min-w-0 truncate text-sm font-bold">{tech.name}</span>
    </motion.div>
  );
}

export const TechStack = () => {
  const { language } = useLanguage();
  const { techSkills } = useProjectStore();
  const skills = techSkills.length > 0 ? techSkills : defaultTechStack;

  const groupedSkills = useMemo(() => {
    return categoryOrder.map((category) => ({
      category,
      skills: skills.filter((skill) => skill.category === category),
    })).filter((group) => group.skills.length > 0);
  }, [skills]);

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="section-divider absolute inset-x-0 top-0" />
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-10 space-y-4 text-center md:mb-16">
          <div className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            <span>⚡</span> Tech Arsenal
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {language === 'id' ? 'Teknologi yang Saya Gunakan' : 'Technologies I Use'}
          </h2>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
            {language === 'id'
              ? 'Dikelompokkan berdasarkan pengalaman praktik dan penggunaan dalam proyek, bukan persentase subjektif.'
              : 'Grouped by practical experience and project usage, not subjective percentages.'}
          </p>
        </div>

        <div className="mx-auto max-w-5xl space-y-10">
          {groupedSkills.map(({ category, skills: categorySkills }) => (
            <section key={category} aria-label={categoryLabel(category, language)}>
              <div className="mb-4 flex items-center gap-3">
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-primary">
                  {categoryLabel(category, language)}
                </h3>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categorySkills.map((tech, index) => (
                  <SkillBadge key={tech.id} tech={tech} index={index} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
};
