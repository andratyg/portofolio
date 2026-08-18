import dynamic from 'next/dynamic';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/sections/Hero';
import { ProjectStoreProvider } from '@/components/ProjectStore';
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';
import { Footer } from '@/components/Footer';

// --- Skeleton Loaders ---
import { AboutSkeleton } from '@/components/skeletons/AboutSkeleton';
import { StatsSkeleton } from '@/components/skeletons/StatsSkeleton';
import { PortfolioSkeleton } from '@/components/skeletons/PortfolioSkeleton';
import { CertificatesSkeleton } from '@/components/skeletons/CertificatesSkeleton';
import { TimelineSkeleton } from '@/components/skeletons/TimelineSkeleton';
import { TestimonialsSkeleton } from '@/components/skeletons/TestimonialsSkeleton';
import { ContactSkeleton } from '@/components/skeletons/ContactSkeleton';
import { TechStackSkeleton } from '@/components/skeletons/TechStackSkeleton';

// --- Lazy Loaded Components ---
const About = dynamic(() => import('@/components/sections/About').then(mod => mod.About), {
  loading: () => <AboutSkeleton />,
});
const Stats = dynamic(() => import('@/components/sections/Stats').then(mod => mod.Stats), {
  loading: () => <StatsSkeleton />,
});
const TechStack = dynamic(() => import('@/components/sections/TechStack').then(mod => mod.TechStack), {
  loading: () => <TechStackSkeleton />,
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

// Fetch featured project image for LCP optimization
async function getFeaturedProjectImageUrl() {
  try {
    const res = await fetch(
      'https://firestore.googleapis.com/v1/projects/studio-6743233958-ba96d/databases/(default)/documents/projects',
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const featured = data.documents?.find((doc: any) => doc.fields?.featured?.booleanValue === true);
    return featured?.fields?.imageUrl?.stringValue || null;
  } catch (error) {
    return null;
  }
}

export default async function Home() {
  const featuredImageUrl = await getFeaturedProjectImageUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        name: 'Nara Andra Tyaga',
        jobTitle: 'Full-Stack Developer & UI/UX Designer',
        url: 'https://naraandratyaga.my.id',
        sameAs: [
          'https://linkedin.com/in/nara-andra-tyaga',
          'https://github.com/naradev',
          'https://instagram.com/nara.dev'
        ]
      },
      {
        '@type': 'WebSite',
        name: 'Nara Andra Tyaga - Portfolio',
        url: 'https://naraandratyaga.my.id'
      }
    ]
  };

  return (
    <>
      {featuredImageUrl && (
        <link rel="preload" as="image" href={featuredImageUrl} fetchPriority="high" />
      )}
      <ProjectStoreProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <main className="min-h-screen selection:bg-primary selection:text-primary-foreground">
          {/* --- Above the fold (loaded immediately) --- */}
          <Navbar />
          <SectionErrorBoundary sectionName="Hero">
            <Hero />
          </SectionErrorBoundary>

          {/* --- Below the fold (lazy loaded with skeletons & animations) --- */}
          <SectionErrorBoundary sectionName="About">
            <AnimateOnScroll>
              <About />
            </AnimateOnScroll>
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="Stats">
            <AnimateOnScroll>
              <Stats />
            </AnimateOnScroll>
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="Tech Stack">
            <AnimateOnScroll>
              <TechStack />
            </AnimateOnScroll>
          </SectionErrorBoundary>

          <div className="space-y-12">
            <SectionErrorBoundary sectionName="Portfolio">
              <AnimateOnScroll>
                <Portfolio />
              </AnimateOnScroll>
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Certificates">
              <AnimateOnScroll>
                <Certificates />
              </AnimateOnScroll>
            </SectionErrorBoundary>
          </div>

          <SectionErrorBoundary sectionName="Timeline">
            <AnimateOnScroll>
              <Timeline />
            </AnimateOnScroll>
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="Testimonials">
            <AnimateOnScroll>
              <Testimonials />
            </AnimateOnScroll>
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="Contact">
            <AnimateOnScroll>
              <Contact />
            </AnimateOnScroll>
          </SectionErrorBoundary>
          
          <Footer />
        </main>
      </ProjectStoreProvider>
    </>
  );
}
