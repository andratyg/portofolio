"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// ─── Badge Definitions ─────────────────────────────────────────────────────────
export interface BadgeDefinition {
  id: string;
  emoji: string;
  name: { id: string; en: string };
  description: { id: string; en: string };
  hint: { id: string; en: string };
  category: 'exploration' | 'interaction' | 'secret' | 'mastery';
}

export interface UnlockedBadge {
  badgeId: string;
  unlockedAt: string; // ISO date string
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'theme-chameleon',
    emoji: '🎨',
    name: { id: 'Theme Chameleon', en: 'Theme Chameleon' },
    description: { id: 'Mengganti tema minimal 3 kali berbeda', en: 'Changed to at least 3 different themes' },
    hint: { id: 'Coba jelajahi berbagai tema tampilan!', en: 'Try exploring different visual themes!' },
    category: 'exploration',
  },
  {
    id: 'deep-inspector',
    emoji: '🔍',
    name: { id: 'Deep Inspector', en: 'Deep Inspector' },
    description: { id: 'Membuka dan membaca detail proyek', en: 'Opened and read a project detail page' },
    hint: { id: 'Buka halaman detail salah satu proyek.', en: 'Open the detail page of any project.' },
    category: 'exploration',
  },
  {
    id: 'midnight-coder',
    emoji: '☕',
    name: { id: 'Midnight Coder', en: 'Midnight Coder' },
    description: { id: 'Berkunjung di waktu malam (00:00-04:00) atau pilih tema Cappuccino Mocha', en: 'Visited at night (00:00-04:00) or used Cappuccino Mocha theme' },
    hint: { id: 'Kunjungi saat larut malam atau nikmati aroma tema Cappuccino Mocha.', en: 'Visit late at night or enjoy Cappuccino Mocha theme.' },
    category: 'secret',
  },
  {
    id: 'audiophile',
    emoji: '⚡',
    name: { id: 'Audiophile', en: 'Audiophile' },
    description: { id: 'Mengaktifkan efek suara antarmuka', en: 'Enabled the UI sound effects' },
    hint: { id: 'Nyalakan efek suara UI di navbar!', en: 'Enable UI sound effects in the navbar!' },
    category: 'interaction',
  },
  {
    id: 'cli-hacker',
    emoji: '💻',
    name: { id: 'CLI Hacker', en: 'CLI Hacker' },
    description: { id: 'Menjalankan perintah CLI di Command Palette', en: 'Ran a CLI command in the Command Palette' },
    hint: { id: 'Buka Command Palette (⌘K) dan masuk ke mode Terminal.', en: 'Open Command Palette (⌘K) and switch to Terminal mode.' },
    category: 'interaction',
  },
  {
    id: 'talent-scout',
    emoji: '📄',
    name: { id: 'Talent Scout', en: 'Talent Scout' },
    description: { id: 'Mengunduh CV atau menyalin email kontak', en: 'Downloaded CV or copied contact email' },
    hint: { id: 'Unduh CV atau salin alamat email di halaman Kontak.', en: 'Download CV or copy email address on the Contact page.' },
    category: 'interaction',
  },
  {
    id: 'credential-verifier',
    emoji: '📜',
    name: { id: 'Credential Verifier', en: 'Credential Verifier' },
    description: { id: 'Membuka sertifikat dan melihat dokumen validasi', en: 'Opened certificates and viewed validation documents' },
    hint: { id: 'Buka halaman Sertifikat dan lihat salah satu kredensial.', en: 'Open Certificates page and view a credential.' },
    category: 'exploration',
  },
  {
    id: 'polyglot',
    emoji: '🌐',
    name: { id: 'Polyglot', en: 'Polyglot' },
    description: { id: 'Mengganti bahasa website antara ID dan EN', en: 'Switched website language between ID and EN' },
    hint: { id: 'Ganti bahasa website ke English atau Indonesia.', en: 'Switch website language to Indonesian or English.' },
    category: 'interaction',
  },
  {
    id: 'master-explorer',
    emoji: '👑',
    name: { id: 'Master Explorer', en: 'Master Explorer' },
    description: { id: 'Membuka 5 atau lebih lencana lainnya', en: 'Unlocked 5 or more other badges' },
    hint: { id: 'Kumpulkan 5 lencana lainnya untuk membuka ini!', en: 'Collect 5 other badges to unlock this one!' },
    category: 'mastery',
  },
];

const STORAGE_KEY = 'nat-portfolio-achievements';

// ─── Context Type ──────────────────────────────────────────────────────────────
interface AchievementContextType {
  unlockedBadges: UnlockedBadge[];
  unlockBadge: (badgeId: string) => void;
  isBadgeUnlocked: (badgeId: string) => boolean;
  getBadgeUnlockDate: (badgeId: string) => string | null;
  progress: { unlocked: number; total: number; percentage: number };
  resetProgress: () => void;
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

// ─── Provider ──────────────────────────────────────────────────────────────────
export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unlockedBadges, setUnlockedBadges] = useState<UnlockedBadge[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UnlockedBadge[];
        setUnlockedBadges(parsed);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Persist to localStorage
  const persist = useCallback((badges: UnlockedBadge[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const isBadgeUnlocked = useCallback((badgeId: string) => {
    return unlockedBadges.some(b => b.badgeId === badgeId);
  }, [unlockedBadges]);

  const getBadgeUnlockDate = useCallback((badgeId: string) => {
    const badge = unlockedBadges.find(b => b.badgeId === badgeId);
    return badge?.unlockedAt || null;
  }, [unlockedBadges]);

  const unlockBadge = useCallback((badgeId: string) => {
    setUnlockedBadges(prev => {
      if (prev.some(b => b.badgeId === badgeId)) return prev;

      const newBadge: UnlockedBadge = {
        badgeId,
        unlockedAt: new Date().toISOString(),
      };
      const updated = [...prev, newBadge];
      persist(updated);

      // Show celebration toast
      const definition = BADGE_DEFINITIONS.find(d => d.id === badgeId);
      if (definition) {
        // Use setTimeout to avoid state update conflicts
        setTimeout(() => {
          toast({
            title: `${definition.emoji} Badge Unlocked!`,
            description: definition.name.en,
          });
        }, 100);
      }

      // Check if Master Explorer should be unlocked
      // (excluding master-explorer itself from count)
      const otherBadgesCount = updated.filter(b => b.badgeId !== 'master-explorer').length;
      if (otherBadgesCount >= 5 && !updated.some(b => b.badgeId === 'master-explorer')) {
        const masterBadge: UnlockedBadge = {
          badgeId: 'master-explorer',
          unlockedAt: new Date().toISOString(),
        };
        const withMaster = [...updated, masterBadge];
        persist(withMaster);

        setTimeout(() => {
          toast({
            title: '👑 Badge Unlocked!',
            description: 'Master Explorer — You\'ve unlocked 5+ badges!',
          });
        }, 2000);

        return withMaster;
      }

      return updated;
    });
  }, [persist, toast]);

  const progress = {
    unlocked: unlockedBadges.length,
    total: BADGE_DEFINITIONS.length,
    percentage: Math.round((unlockedBadges.length / BADGE_DEFINITIONS.length) * 100),
  };

  const resetProgress = useCallback(() => {
    setUnlockedBadges([]);
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: '🔄 Progress Reset',
      description: 'All badges have been reset. Start collecting again!',
    });
  }, [toast]);

  // Check midnight coder on mount (must be after unlockBadge declaration)
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 4) {
      const timer = setTimeout(() => {
        unlockBadge('midnight-coder');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [unlockBadge]);

  // Listen for open-achievement-modal & unlock-achievement custom events
  useEffect(() => {
    const modalHandler = () => setModalOpen(true);
    const unlockHandler = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        unlockBadge(customEvent.detail);
      }
    };

    window.addEventListener('open-achievement-modal', modalHandler);
    window.addEventListener('unlock-achievement', unlockHandler);

    return () => {
      window.removeEventListener('open-achievement-modal', modalHandler);
      window.removeEventListener('unlock-achievement', unlockHandler);
    };
  }, [unlockBadge]);

  return (
    <AchievementContext.Provider
      value={{
        unlockedBadges,
        unlockBadge,
        isBadgeUnlocked,
        getBadgeUnlockDate,
        progress,
        resetProgress,
        isModalOpen,
        setModalOpen,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) throw new Error('useAchievements must be used within AchievementProvider');
  return context;
};
