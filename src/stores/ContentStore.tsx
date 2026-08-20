"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { translations, Language } from '@/lib/translations';

// Define the shape of the content that can be edited.
interface EditableContent {
  portfolioTitleEn: string;
  portfolioTitleId: string;
  portfolioSubtitleEn: string;
  portfolioSubtitleId: string;
  certificatesTitleEn: string;
  certificatesTitleId: string;
  certificatesSubtitleEn: string;
  certificatesSubtitleId: string;
}

// Define the state and actions for the store.
interface ContentState extends EditableContent {
  setContent: (content: Partial<EditableContent>) => void;
}

// Get the initial default values from the translations file.
const defaultState: EditableContent = {
  portfolioTitleEn: translations.en.navPortfolio || 'Portfolio',
  portfolioTitleId: translations.id.navPortfolio || 'Portofolio',
  portfolioSubtitleEn: translations.en.portfolioSubtitle || '',
  portfolioSubtitleId: translations.id.portfolioSubtitle || '',
  certificatesTitleEn: translations.en.navCertificates || 'Certificates',
  certificatesTitleId: translations.id.navCertificates || 'Sertifikat',
  certificatesSubtitleEn: 'My professional certifications and accreditations.',
  certificatesSubtitleId: 'Sertifikasi dan akreditasi profesional saya.',
};

// Create the store with persistence.
export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      ...defaultState,
      setContent: (newContent) => set((state) => ({ ...state, ...newContent })),
    }),
    {
      name: 'editable-content-storage', // Name for the localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Hook to get content for the current language.
export const useEditableContent = (language: Language) => {
  const store = useContentStore();
  return {
    portfolioTitle: language === 'id' ? store.portfolioTitleId : store.portfolioTitleEn,
    portfolioSubtitle: language === 'id' ? store.portfolioSubtitleId : store.portfolioSubtitleEn,
    certificatesTitle: language === 'id' ? store.certificatesTitleId : store.certificatesTitleEn,
    certificatesSubtitle: language === 'id' ? store.certificatesSubtitleId : store.certificatesSubtitleEn,
  };
};
