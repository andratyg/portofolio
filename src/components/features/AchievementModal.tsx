"use client";

import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAchievements, BADGE_DEFINITIONS } from '@/components/providers/AchievementContext';
import { useLanguage } from '@/components/providers/LanguageContext';
import { useAudioFX } from '@/components/providers/AudioFXContext';
import { Trophy, Lock, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AchievementModal() {
  const { isModalOpen, setModalOpen, isBadgeUnlocked, getBadgeUnlockDate, progress, resetProgress } = useAchievements();
  const { language } = useLanguage();
  const { play } = useAudioFX();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => {
      setModalOpen(open);
      if (open) play('modal');
    }}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-3xl gap-0">
        <DialogTitle className="sr-only">Achievement Gallery</DialogTitle>
        <DialogDescription className="sr-only">Koleksi lencana pencapaian interaktif</DialogDescription>

        {/* Header */}
        <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight">
                  {language === 'id' ? 'Galeri Pencapaian' : 'Achievement Gallery'}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  {language === 'id'
                    ? `${progress.unlocked}/${progress.total} lencana terkumpul`
                    : `${progress.unlocked}/${progress.total} badges collected`}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                play('click');
                resetProgress();
              }}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title={language === 'id' ? 'Reset Semua Progress' : 'Reset All Progress'}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 relative h-2 bg-muted/60 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-right font-mono font-bold">
            {progress.percentage}%
          </p>
        </div>

        {/* Badge Grid */}
        <div className="max-h-[55vh] overflow-y-auto p-4 no-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {BADGE_DEFINITIONS.map((badge) => {
              const unlocked = isBadgeUnlocked(badge.id);
              const unlockDate = getBadgeUnlockDate(badge.id);

              return (
                <div
                  key={badge.id}
                  className={cn(
                    "relative rounded-2xl p-3.5 border transition-all group overflow-hidden",
                    unlocked
                      ? "bg-primary/5 border-primary/30 shadow-sm hover:shadow-md hover:shadow-primary/10"
                      : "bg-muted/20 border-border/40 opacity-60 hover:opacity-80"
                  )}
                >
                  {/* Glow effect for unlocked */}
                  {unlocked && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                  )}

                  <div className="relative flex items-start gap-3">
                    {/* Badge Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all",
                      unlocked
                        ? "bg-primary/15 shadow-sm"
                        : "bg-muted/40"
                    )}>
                      {unlocked ? (
                        <span className="text-xl">{badge.emoji}</span>
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground/50" />
                      )}
                    </div>

                    {/* Badge Info */}
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "text-xs font-bold leading-tight flex items-center gap-1.5",
                        unlocked ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {badge.name[language]}
                        {unlocked && <Sparkles className="h-3 w-3 text-primary" />}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        {unlocked
                          ? badge.description[language]
                          : badge.hint[language]}
                      </p>
                      {unlocked && unlockDate && (
                        <p className="text-[9px] text-primary/70 font-mono mt-1">
                          ✓ {formatDate(unlockDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-2 right-2">
                    <span className={cn(
                      "text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                      badge.category === 'mastery' ? "bg-yellow-500/15 text-yellow-500" :
                      badge.category === 'secret' ? "bg-purple-500/15 text-purple-500" :
                      badge.category === 'interaction' ? "bg-blue-500/15 text-blue-500" :
                      "bg-green-500/15 text-green-500"
                    )}>
                      {badge.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/30 text-[10px] text-muted-foreground font-medium">
          <span>
            {language === 'id'
              ? 'Jelajahi portofolio untuk membuka lencana!'
              : 'Explore the portfolio to unlock badges!'}
          </span>
          <span className="font-bold text-primary flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            {progress.unlocked}/{progress.total}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
