"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

type SoundType = 'click' | 'toggle' | 'hover' | 'success' | 'modal' | 'tab';

interface AudioFXContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  play: (type: SoundType) => void;
}

const AudioFXContext = createContext<AudioFXContextType | undefined>(undefined);

export const AudioFXProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('karyapro-sound');
      if (saved !== null) {
        setSoundEnabled(saved === 'true');
      }
    } catch (e) {
      // Ignore if localStorage unavailable
    }
  }, []);

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {
          // Gracefully ignore autoplay policy block (prevents console warnings in Lighthouse)
        });
      }
      return audioCtxRef.current;
    } catch (e) {
      return null;
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('karyapro-sound', String(next));
      } catch (e) {}
      return next;
    });
  }, []);

  // Keyboard shortcut listener: Pressing 'M' toggles sound mute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.tagName === 'SELECT' ||
        target.closest('[role="dialog"]')
      ) {
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        toggleSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSound]);

  // Procedural Web Audio API sound synthesizer (0 KB audio assets)
  const play = useCallback(
    (type: SoundType) => {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      switch (type) {
        case 'click': {
          // Minimalist mechanical click (Linear style)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.04);
          break;
        }

        case 'toggle': {
          // Dual frequency tick for theme/mode toggle
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(640, now + 0.06);

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.07);
          break;
        }

        case 'hover': {
          // Ultra soft high-freq blip
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(820, now);

          gain.gain.setValueAtTime(0.02, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.025);
          break;
        }

        case 'tab': {
          // Subtle slide click
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.045);
          break;
        }

        case 'modal': {
          // Soft resonant pop
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(240, now);
          osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);

          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.09);
          break;
        }

        case 'success': {
          // Two-tone bell harmonic
          [880, 1320].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const delay = i * 0.07;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + delay);

            gain.gain.setValueAtTime(0.09, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.18);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + delay);
            osc.stop(now + delay + 0.19);
          });
          break;
        }
      }
    },
    [soundEnabled, getAudioContext]
  );

  return (
    <AudioFXContext.Provider value={{ soundEnabled, toggleSound, play }}>
      {children}
    </AudioFXContext.Provider>
  );
};

export const useAudioFX = () => {
  const context = useContext(AudioFXContext);
  if (!context) {
    // Return graceful no-op fallback if used outside provider
    return {
      soundEnabled: false,
      toggleSound: () => {},
      play: () => {},
    };
  }
  return context;
};
