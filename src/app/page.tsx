
"use client"

import dynamic from 'next/dynamic';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/sections/Hero';
import { ProjectStoreProvider } from '@/components/ProjectStore';
import { useLanguage } from '@/components/LanguageContext';

// Lazy Loading Components
const About = dynamic(() => import('@/components/sections/About').then(mod => mod.About));
const Stats = dynamic(() => import('@/components/sections/Stats').then(mod => mod.Stats));
const Portfolio = dynamic(() => import('@/components/sections/Portfolio').then(mod => mod.Portfolio));
const Certificates = dynamic(() => import('@/components/sections/Certificates').then(mod => mod.Certificates));
const Timeline = dynamic(() => import('@/components/sections/Timeline').then(mod => mod.Timeline));
const Testimonials = dynamic(() => import('@/components/sections/Testimonials').then(mod => mod.Testimonials));
const Contact = dynamic(() => import('@/components/sections/Contact').then(mod => mod.Contact));

export default function Home() {
  const { t } = useLanguage();

  return (
    <ProjectStoreProvider>
      <main className="min-h-screen selection:bg-primary selection:text-primary-foreground">
        {/* Above the fold content - Loaded Immediately */}
        <Navbar />
        <Hero />

        {/* Below the fold content - Loaded on scroll */}
        <About />
        <Stats />
        <div className="space-y-12">
          <Portfolio />
          <Certificates />
        </div>
        <Timeline />
        <Testimonials />
        <Contact />
        
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
