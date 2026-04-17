
"use client"

import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Stats } from '@/components/sections/Stats';
import { Portfolio } from '@/components/sections/Portfolio';
import { Timeline } from '@/components/sections/Timeline';
import { Testimonials } from '@/components/sections/Testimonials';
import { Contact } from '@/components/sections/Contact';
import { ProjectStoreProvider } from '@/components/ProjectStore';
import { useLanguage } from '@/components/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <ProjectStoreProvider>
      <main className="min-h-screen selection:bg-primary selection:text-primary-foreground">
        <Navbar />
        <Hero />
        <About />
        <Stats />
        <Portfolio />
        <Timeline />
        <Testimonials />
        <Contact />
        <footer className="py-12 border-t bg-muted/20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t.footerCopyright}
            </p>
          </div>
        </footer>
      </main>
    </ProjectStoreProvider>
  );
}
