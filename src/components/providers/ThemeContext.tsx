"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'catppuccin' | 'sunset' | 'liquid' | 'ramadan' | 'imlek' | 'natal';
export type ThemeCategory = 'standard' | 'modern' | 'seasonal';

export interface ThemeConfig {
  id: Theme;
  name: {
    id: string;
    en: string;
  };
  category: ThemeCategory;
  description: {
    id: string;
    en: string;
  };
  colors: {
    bg: string;
    primary: string;
    accent: string;
  };
  emoji?: string;
}

export const THEME_CONFIGS: Record<Theme, ThemeConfig> = {
  light: {
    id: 'light',
    name: { id: 'Terang', en: 'Light' },
    category: 'standard',
    description: { id: 'Bersih, kontras tinggi & cerah', en: 'Clean, high-contrast & bright' },
    colors: {
      bg: '#f8fafc',
      primary: '#0284c7',
      accent: '#38bdf8',
    },
  },
  dark: {
    id: 'dark',
    name: { id: 'Gelap', en: 'Dark' },
    category: 'standard',
    description: { id: 'Slate elegan & ramah di mata', en: 'Elegant slate & easy on the eyes' },
    colors: {
      bg: '#0b0f19',
      primary: '#3b82f6',
      accent: '#60a5fa',
    },
  },
  ramadan: {
    id: 'ramadan',
    name: { id: 'Ramadan', en: 'Ramadan' },
    category: 'seasonal',
    description: { id: 'Emerald tenang & emas berkilau', en: 'Serene emerald & gleaming gold' },
    colors: {
      bg: '#064e3b',
      primary: '#eab308',
      accent: '#fde047',
    },
    emoji: '🌙',
  },
  imlek: {
    id: 'imlek',
    name: { id: 'Imlek', en: 'Lunar New Year' },
    category: 'seasonal',
    description: { id: 'Merah oriental & emas kemakmuran', en: 'Oriental crimson & golden prosperity' },
    colors: {
      bg: '#7f1d1d',
      primary: '#eab308',
      accent: '#facc15',
    },
    emoji: '🏮',
  },
  natal: {
    id: 'natal',
    name: { id: 'Natal', en: 'Christmas & Winter' },
    category: 'seasonal',
    description: { id: 'Midnight navy & merah bersalju', en: 'Midnight navy & festive crimson snow' },
    colors: {
      bg: '#0c2340',
      primary: '#dc2626',
      accent: '#e2e8f0',
    },
    emoji: '🎄',
  },
  catppuccin: {
    id: 'catppuccin',
    name: { id: 'Cappuccino Mocha', en: 'Cappuccino Mocha' },
    category: 'modern',
    description: { id: 'Ivory parchment hangat, susu krim lembut & espresso roasted', en: 'Warm ivory parchment, creamy steamed milk & roasted espresso' },
    colors: {
      bg: '#fdf8f0',
      primary: '#b34d0e',
      accent: '#cd611e',
    },
    emoji: '☕',
  },
  sunset: {
    id: 'sunset',
    name: { id: 'Sunset Beach', en: 'Sunset Beach' },
    category: 'modern',
    description: { id: 'Langit biru muda, koral senja, matahari terbenam & deburan ombak pantai', en: 'Light sky blue, warm sunset coral, golden sun & sea breeze' },
    colors: {
      bg: '#4ca8e8',
      primary: '#F77F00',
      accent: '#FDC830',
    },
    emoji: '🌅',
  },
  liquid: {
    id: 'liquid',
    name: { id: 'Liquid Glass', en: 'Liquid Glass' },
    category: 'modern',
    description: { id: 'Kaca Apple VisionOS & fisika anti-gravitasi', en: 'Apple VisionOS frosted glass & zero-G physics' },
    colors: {
      bg: '#020617',
      primary: '#06b6d4',
      accent: '#8b5cf6',
    },
    emoji: '🫧',
  },
};

export const themes: Theme[] = ['light', 'dark', 'catppuccin', 'sunset', 'liquid', 'ramadan', 'imlek', 'natal'];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme, manual?: boolean) => void;
  themes: Theme[];
  themeConfigs: Record<Theme, ThemeConfig>;
  isAutoTheme: boolean;
  setAutoTheme: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isAutoTheme, setIsAutoTheme] = useState<boolean>(true);

  // Helper to determine seasonal or system OS theme
  const getAutoTheme = useCallback((): Theme => {
    const month = new Date().getMonth();
    if (month === 11) return 'natal'; // Dec
    if (month === 0 || month === 1) return 'imlek'; // Jan, Feb
    if (month === 2 || month === 3) return 'ramadan'; // Mar, Apr (approximate)

    // Outside seasonal months: automatically respect system/OS dark mode preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }, []);

  useEffect(() => {
    // 1. Theme Initialization
    const autoDisabled = localStorage.getItem('karyapro-theme-autodisabled') === 'true';
    setIsAutoTheme(!autoDisabled);

    let activeTheme: Theme;
    if (!autoDisabled) {
      activeTheme = getAutoTheme();
    } else {
      const savedTheme = localStorage.getItem('karyapro-theme') as Theme;
      activeTheme = savedTheme && themes.includes(savedTheme) ? savedTheme : 'light';
    }

    setThemeState(activeTheme);
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [getAutoTheme]);

  // System OS media query listener when auto-theme is enabled
  useEffect(() => {
    if (!isAutoTheme || typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (isAutoTheme) {
        const newTheme = getAutoTheme();
        setThemeState(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [isAutoTheme, getAutoTheme]);

  // 2. Dynamic Favicon Injection with clean emojis
  useEffect(() => {
    const emoji = THEME_CONFIGS[theme]?.emoji;
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;

    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    if (emoji) {
      link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`;
    } else {
      link.href = '/favicon.ico';
    }
  }, [theme]);

  const setTheme = (newTheme: Theme, manual = false) => {
    const applyTheme = () => {
      setThemeState(newTheme);
      localStorage.setItem('karyapro-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);

      if (manual) {
        setIsAutoTheme(false);
        localStorage.setItem('karyapro-theme-autodisabled', 'true');
      }

      if (typeof window !== 'undefined' && newTheme === 'catppuccin') {
        window.dispatchEvent(new CustomEvent('unlock-achievement', { detail: 'midnight-coder' }));
      }
    };

    if (typeof document !== 'undefined' && document.startViewTransition) {
      document.startViewTransition(() => applyTheme());
    } else {
      applyTheme();
    }
  };

  const setAutoTheme = (value: boolean) => {
    setIsAutoTheme(value);
    if (value) {
      localStorage.removeItem('karyapro-theme-autodisabled');
      setTheme(getAutoTheme(), false);
    } else {
      localStorage.setItem('karyapro-theme-autodisabled', 'true');
    }
  };

  // Keyboard shortcut listener: Pressing 'D' toggles light/dark mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore combination shortcuts like Ctrl+D (bookmark), Cmd+D, Alt+D
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Don't trigger when user is typing in form inputs, textareas, or editable elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.tagName === 'SELECT' ||
        target.closest('[role="dialog"]') ||
        target.closest('input') ||
        target.closest('textarea')
      ) {
        return;
      }
      if (e.key === 'd' || e.key === 'D') {
        // Toggle between dark and light
        setTheme(theme === 'dark' ? 'light' : 'dark', true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes, themeConfigs: THEME_CONFIGS, isAutoTheme, setAutoTheme }}>
      <div className="theme-transition min-h-screen">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
