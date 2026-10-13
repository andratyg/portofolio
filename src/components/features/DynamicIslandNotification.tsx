"use client";

import React, { useState, useEffect, useRef } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Palette, Globe, Copy, Check, Terminal, Download, Sparkles, Bell } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeContext';

export interface DynamicIslandData {
  title: string;
  subtitle?: string;
  icon?: 'sound-on' | 'sound-off' | 'theme' | 'globe' | 'clipboard' | 'terminal' | 'download' | 'sparkles' | 'check';
  emoji?: string;
  duration?: number;
}

/**
 * Global helper to trigger Dynamic Island notifications from anywhere in the app
 */
export function notifyDynamicIsland(data: DynamicIslandData) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dynamic-island-notify', { detail: data }));
  }
}

export function DynamicIslandNotification() {
  const { theme } = useTheme();
  const [notification, setNotification] = useState<DynamicIslandData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleNotify = (e: Event) => {
      const customEvent = e as CustomEvent<DynamicIslandData>;
      if (!customEvent.detail) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      setNotification(customEvent.detail);

      const duration = customEvent.detail.duration || 3200;
      timerRef.current = setTimeout(() => {
        setNotification(null);
      }, duration);
    };

    window.addEventListener('dynamic-island-notify', handleNotify);
    return () => {
      window.removeEventListener('dynamic-island-notify', handleNotify);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Icon renderer
  const renderIcon = (iconName?: string, emoji?: string) => {
    if (emoji) {
      return <span className="text-base select-none leading-none">{emoji}</span>;
    }
    switch (iconName) {
      case 'sound-on':
        return <Volume2 className="h-4 w-4 text-emerald-400" />;
      case 'sound-off':
        return <VolumeX className="h-4 w-4 text-amber-400" />;
      case 'theme':
        return <Palette className="h-4 w-4 text-blue-400" />;
      case 'globe':
        return <Globe className="h-4 w-4 text-cyan-400" />;
      case 'clipboard':
        return <Copy className="h-4 w-4 text-indigo-400" />;
      case 'terminal':
        return <Terminal className="h-4 w-4 text-emerald-400" />;
      case 'download':
        return <Download className="h-4 w-4 text-sky-400" />;
      case 'check':
        return <Check className="h-4 w-4 text-emerald-400" />;
      case 'sparkles':
      default:
        return <Sparkles className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <div
      className="fixed top-16 sm:top-20 md:top-24 left-1/2 -translate-x-1/2 z-[999] pointer-events-none select-none"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {notification && (
          <motion.div
            key={notification.title + (notification.subtitle || '')}
            initial={{ scale: 0.85, opacity: 0, y: -20, filter: 'blur(8px)' }}
            animate={{ scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ scale: 0.9, opacity: 0, y: -16, filter: 'blur(6px)' }}
            transition={{
              type: "spring",
              stiffness: 460,
              damping: 30,
              mass: 0.75,
            }}
            onClick={() => setNotification(null)}
            className="pointer-events-auto cursor-pointer"
          >
            <div
              className="
                relative flex items-center gap-3 sm:gap-4 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full
                bg-black/92 backdrop-blur-3xl text-white border border-white/20
                shadow-[0_24px_60px_-15px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1.5px_1px_rgba(255,255,255,0.3)]
                min-w-[240px] sm:min-w-[280px] max-w-[92vw] sm:max-w-md
                transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]
              "
            >
              {/* Left Island Badge Icon */}
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/12 shrink-0 border border-white/20 shadow-inner">
                {renderIcon(notification.icon, notification.emoji)}
              </div>

              {/* Island Message Content */}
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <span className="text-xs sm:text-[13px] font-bold leading-tight text-white truncate">
                  {notification.title}
                </span>
                {notification.subtitle && (
                  <span className="text-[10px] sm:text-[11px] leading-tight text-slate-300 truncate mt-0.5">
                    {notification.subtitle}
                  </span>
                )}
              </div>

              {/* Right Activity Indicator (Equalizer wave or Live pill) */}
              <div className="flex items-center gap-1 shrink-0 pl-1">
                {notification.icon === 'sound-on' ? (
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-bounce" />
                    <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                ) : notification.icon === 'check' || notification.icon === 'clipboard' ? (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                ) : (
                  <span className="flex h-2 w-2 relative">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
