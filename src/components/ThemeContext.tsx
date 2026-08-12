"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'ramadan' | 'imlek' | 'natal';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme, manual?: boolean) => void;
  themes: Theme[];
  isAutoTheme: boolean;
  setAutoTheme: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes: Theme[] = ['light', 'dark', 'ramadan', 'imlek', 'natal'];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isAutoTheme, setIsAutoTheme] = useState<boolean>(true);

  // Helper to determine seasonal theme
  const getSeasonalTheme = (): Theme => {
    const month = new Date().getMonth();
    if (month === 11) return 'natal'; // Dec
    if (month === 0 || month === 1) return 'imlek'; // Jan, Feb
    if (month === 2 || month === 3) return 'ramadan'; // Mar, Apr (approximate)
    return 'light'; // Default
  };

  useEffect(() => {
    // 1. Theme Initialization
    const autoDisabled = localStorage.getItem('karyapro-theme-autodisabled') === 'true';
    setIsAutoTheme(!autoDisabled);

    let activeTheme: Theme;
    if (!autoDisabled) {
      activeTheme = getSeasonalTheme();
    } else {
      const savedTheme = localStorage.getItem('karyapro-theme') as Theme;
      activeTheme = savedTheme && themes.includes(savedTheme) ? savedTheme : 'light';
    }
    
    setThemeState(activeTheme);
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, []);

  useEffect(() => {
    // 2. Dynamic Favicon Injection
    const faviconMap: Record<Theme, string> = {
      light: '', // Uses default if empty
      dark: '',
      imlek: '🏮',
      ramadan: '🌙',
      natal: '❄️'
    };
    
    const emoji = faviconMap[theme];
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    if (emoji) {
      // SVG emoji as favicon
      link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`;
    } else {
      link.href = '/favicon.ico'; // Fallback to default
    }
  }, [theme]);

  const setTheme = (newTheme: Theme, manual = false) => {
    const applyTheme = () => {
      setThemeState(newTheme);
      localStorage.setItem('karyapro-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // If user manually clicked a theme, disable auto-detect
      if (manual) {
        setIsAutoTheme(false);
        localStorage.setItem('karyapro-theme-autodisabled', 'true');
      }
    };

    // Use native View Transitions API for buttery smooth theme switching
    if (document.startViewTransition) {
      document.startViewTransition(() => applyTheme());
    } else {
      applyTheme();
    }
  };

  const setAutoTheme = (value: boolean) => {
    setIsAutoTheme(value);
    if (value) {
      localStorage.removeItem('karyapro-theme-autodisabled');
      setTheme(getSeasonalTheme(), false); // Re-evaluate and apply seasonal
    } else {
      localStorage.setItem('karyapro-theme-autodisabled', 'true');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes, isAutoTheme, setAutoTheme }}>
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
