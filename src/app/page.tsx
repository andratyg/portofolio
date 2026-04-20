
"use client"

import dynamic from 'next/dynamic';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/sections/Hero';
import { ProjectStoreProvider } from '@/components/ProjectStore';
import { useLanguage } from '@/components/LanguageContext';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

// --- Skeleton Loaders ---
import { AboutSkeleton } from '@/components/skeletons/AboutSkeleton';
import { StatsSkeleton } from '@/components/skeletons/StatsSkeleton';
import { PortfolioSkeleton } from '@/components/skeletons/PortfolioSkeleton';
import { CertificatesSkeleton } from '@/components/skeletons/CertificatesSkeleton';
import { TimelineSkeleton } from '@/components/skeletons/TimelineSkeleton';
import { TestimonialsSkeleton } from '@/components/skeletons/TestimonialsSkeleton';
import { ContactSkeleton } from '@/components/skeletons/ContactSkeleton';

// --- Lazy Loaded Components ---
const About = dynamic(() => import('@/components/sections/About').then(mod => mod.About), {
  loading: () => <AboutSkeleton />,
});
const Stats = dynamic(() => import('@/components/sections/Stats').then(mod => mod.Stats), {
  loading: () => <StatsSkeleton />,
});
const Portfolio = dynamic(() => import('@/components/sections/Portfolio').then(mod => mod.Portfolio), {
  loading: () => <PortfolioSkeleton />,
});
const Certificates = dynamic(() => import('@/components/sections/Certificates').then(mod => mod.Certificates), {
  loading: () => <CertificatesSkeleton />,
});
const Timeline = dynamic(() => import('@/components/sections/Timeline').then(mod => mod.Timeline), {
  loading: () => <TimelineSkeleton />,
});
const Testimonials = dynamic(() => import('@/components/sections/Testimonials').then(mod => mod.Testimonials), {
  loading: () => <TestimonialsSkeleton />,
});
const Contact = dynamic(() => import('@/components/sections/Contact').then(mod => mod.Contact), {
  loading: () => <ContactSkeleton />,
});


export default function Home() {
  const { t } = useLanguage();

  return (
    <ProjectStoreProvider>
      <main className="min-h-screen selection:bg-primary selection:text-primary-foreground">
        {/* --- Above the fold (loaded immediately) --- */}
        <Navbar />
        <Hero />

        {/* --- Below the fold (lazy loaded with skeletons & animations) --- */}
        <AnimateOnScroll>
          <About />
        </AnimateOnScroll>
        <AnimateOnScroll>
          <Stats />
        </AnimateOnScroll>
        <div className="space-y-12">
          <AnimateOnScroll>
            <Portfolio />
          </AnimateOnScroll>
          <AnimateOnScroll>
            <Certificates />
          </AnimateOnScroll>
        </div>
        <AnimateOnScroll>
          <Timeline />
        </AnimateOnScroll>
        <AnimateOnScroll>
          <Testimonials />
        </AnimateOnScroll>
        <AnimateOnScroll>
          <Contact />
        </AnimateOnScroll>
        
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
