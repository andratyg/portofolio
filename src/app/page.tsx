
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
        
        <footer className="relative pt-12 pb-8 overflow-hidden">
          <div className="section-divider absolute top-0 left-0 right-0" />
          {/* Background subtle glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/3 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center gap-6">
              {/* Logo mark */}
              <div className="flex items-center gap-2.5 glass-card px-5 py-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-[9px] font-black">N</div>
                <span className="text-sm font-bold">Nara Andra Tyaga</span>
              </div>
              {/* Copyright */}
              <p className="text-xs text-muted-foreground/60 text-center">
                {t.footerCopyright}
              </p>
              {/* Tech stack */}
              <div className="flex flex-wrap justify-center gap-2">
                {['Next.js 15', 'React', 'TypeScript', 'Tailwind CSS', 'Firebase'].map(tech => (
                  <span key={tech} className="text-[9px] font-semibold px-2.5 py-1 rounded-full border border-border/30 text-muted-foreground/50 hover:text-primary hover:border-primary/30 transition-colors cursor-default">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </ProjectStoreProvider>
  );
}
