"use client"

import { Navbar } from '@/components/Navbar';
import { Portfolio } from '@/components/sections/Portfolio';
import { Contact } from '@/components/sections/Contact';
import { ProjectStoreProvider } from '@/components/ProjectStore';
import { useLanguage } from '@/components/LanguageContext';
import { Stats } from '@/components/sections/Stats';
import { Timeline } from '@/components/sections/Timeline';

export default function ProjectsPage() {
  const { t } = useLanguage();

  return (
    <ProjectStoreProvider>
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-20">
          <Portfolio />
          <Stats />
          <Timeline />
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