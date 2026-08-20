"use client"

import { Navbar } from '@/components/layout/Navbar';
import { Portfolio } from '@/components/sections/Portfolio';
import { Contact } from '@/components/sections/Contact';
import { ProjectStoreProvider } from '@/stores/ProjectStore';
import { useLanguage } from '@/components/providers/LanguageContext';

export default function ProjectsPage() {
  const { t } = useLanguage();

  return (
    <ProjectStoreProvider>
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-20">
          <Portfolio />
          <Contact />
        </div>
        <footer className="py-16 border-t bg-muted/20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {t.footerCopyright}
            </p>
          </div>
        </footer>
      </main>
    </ProjectStoreProvider>
  );
}
