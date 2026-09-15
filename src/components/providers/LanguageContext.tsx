"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default language is Indonesian ('id')
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('karyapro-lang') as Language;
      if (savedLang === 'en' || savedLang === 'id') {
        setLanguageState(savedLang);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = savedLang;
        }
        return;
      }

      // Check browser preferred language if no explicit setting saved
      if (typeof navigator !== 'undefined' && navigator.language) {
        const browserLang = navigator.language.slice(0, 2).toLowerCase();
        if (browserLang === 'en') {
          setLanguageState('en');
          if (typeof document !== 'undefined') {
            document.documentElement.lang = 'en';
          }
          return;
        }
      }

      if (typeof document !== 'undefined') {
        document.documentElement.lang = 'id';
      }
    } catch {
      // Safe fallback if localStorage is restricted (e.g., incognito)
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('karyapro-lang', lang);
    } catch {
      // Ignore if localStorage unavailable
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  const t = translations[language] || translations.id;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
