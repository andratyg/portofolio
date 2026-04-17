"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'emerald' | 'sunset' | 'royal' | 'cyber' | 'slate' | 'amber' | 'rose' | 'forest';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes: Theme[] = ['light', 'dark', 'emerald', 'sunset', 'royal', 'cyber', 'slate', 'amber', 'rose', 'forest'];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('karyapro-theme') as Theme;
    if (savedTheme && themes.includes(savedTheme)) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('karyapro-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
