import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/sections/Hero';
import { ProjectStoreProvider } from '@/stores/ProjectStore';
import { SectionErrorBoundary } from '@/components/utils/SectionErrorBoundary';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';
import { Footer } from '@/components/layout/Footer';

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

// Fetch featured project for LCP optimization — with tight timeout to not block render
async function getFeaturedProject() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s max
    const res = await fetch(
      'https://firestore.googleapis.com/v1/projects/studio-6743233958-ba96d/databases/(default)/documents/projects',
      { next: { revalidate: 3600 }, signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    let doc = data.documents?.find((doc: any) => doc.fields?.featured?.booleanValue === true);
    if (!doc && data.documents?.length > 0) {
      doc = data.documents[0]; // Fallback to first project
    }
    if (!doc) return null;
    
    return {
      imageUrl: doc.fields?.imageUrl?.stringValue || '',
      titleId: doc.fields?.titleId?.stringValue || '',
      titleEn: doc.fields?.titleEn?.stringValue || '',
      technologies: doc.fields?.technologies?.arrayValue?.values?.map((v: any) => v.stringValue) || [],
    };
  } catch (error) {
    return null;
  }
}

export default async function Home() {
  const featuredProject = await getFeaturedProject();

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
    <ProjectStoreProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* LCP image preload — tells browser to fetch hero image ASAP */}
      {featuredProject?.imageUrl && (
        <link
          rel="preload"
          as="image"
          href={`/_next/image?url=${encodeURIComponent(featuredProject.imageUrl)}&w=640&q=75`}
          fetchPriority="high"
        />
      )}
      <main className="min-h-screen selection:bg-primary selection:text-primary-foreground">
        {/* --- Above the fold (loaded immediately) --- */}
        <Navbar />
        <SectionErrorBoundary sectionName="Hero">
          <Hero initialFeaturedProject={featuredProject} />
        </SectionErrorBoundary>

          {/* --- Below the fold (lazy loaded with skeletons & animations) --- */}
          <SectionErrorBoundary sectionName="About">
            <AnimateOnScroll fallback={<AboutSkeleton />} minHeight="500px">
              <About />
            </AnimateOnScroll>
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="Stats">
            <AnimateOnScroll fallback={<StatsSkeleton />} minHeight="300px">
              <Stats />
            </AnimateOnScroll>
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="Tech Stack">
            <AnimateOnScroll fallback={<TechStackSkeleton />} minHeight="400px">
              <TechStack />
            </AnimateOnScroll>
          </SectionErrorBoundary>

          <div className="space-y-12">
            <SectionErrorBoundary sectionName="Portfolio">
              <AnimateOnScroll fallback={<PortfolioSkeleton />} minHeight="600px">
                <Portfolio />
              </AnimateOnScroll>
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Certificates">
              <AnimateOnScroll fallback={<CertificatesSkeleton />} minHeight="600px">
                <Certificates />
              </AnimateOnScroll>
            </SectionErrorBoundary>
          </div>

          <SectionErrorBoundary sectionName="Timeline">
            <AnimateOnScroll fallback={<TimelineSkeleton />} minHeight="500px">
              <Timeline />
            </AnimateOnScroll>
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="Testimonials">
            <AnimateOnScroll fallback={<TestimonialsSkeleton />} minHeight="400px">
              <Testimonials />
            </AnimateOnScroll>
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="Contact">
            <AnimateOnScroll fallback={<ContactSkeleton />} minHeight="500px">
              <Contact />
            </AnimateOnScroll>
          </SectionErrorBoundary>
          
          <Footer />
        </main>
      </ProjectStoreProvider>
  );
}
