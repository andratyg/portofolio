"use client";

import React from 'react';
import { m as motion } from 'framer-motion';
import { useAchievements } from '@/components/providers/AchievementContext';
import { useAudioFX } from '@/components/providers/AudioFXContext';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AchievementFloatingTrigger() {
  const { progress, setModalOpen } = useAchievements();
  const { play } = useAudioFX();

  return (
    <motion.button
      onClick={() => {
        play('click');
        setModalOpen(true);
      }}
      className={cn(
        "fixed bottom-24 right-4 sm:bottom-8 sm:right-6 z-40",
        "flex items-center gap-2 px-4 py-2.5 rounded-2xl",
        "bg-card/90 backdrop-blur-xl border border-border/60 shadow-lg",
        "hover:shadow-xl hover:border-primary/40 hover:bg-card",
        "transition-all duration-300 group cursor-pointer"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 2, duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="Achievement Gallery"
      aria-label={`${progress.unlocked} of ${progress.total} badges unlocked. Click to view achievements.`}
    >
      <Trophy className="h-4 w-4 text-primary group-hover:text-primary transition-colors" />
      <span className="text-xs font-bold text-foreground">
        {progress.unlocked}/{progress.total}
      </span>

      {/* Progress ring indicator */}
      <div className="relative w-5 h-5">
        <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
          <circle
            cx="10" cy="10" r="8"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="2"
          />
          <circle
            cx="10" cy="10" r="8"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${(progress.percentage / 100) * 50.27} 50.27`}
            className="transition-all duration-700 ease-out"
          />
        </svg>
      </div>

    </motion.button>
  );
}
