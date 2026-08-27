/**
 * /projects - Server Component dengan ISR (revalidate 300 detik / 5 menit).
 *
 * Data proyek diambil di SERVER saat render, sehingga HTML awal sudah berisi
 * daftar lengkap proyek — terlihat oleh crawler, Googlebot, dan AI indexers.
 */

import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Portfolio } from '@/components/sections/Portfolio';
import { Contact } from '@/components/sections/Contact';
import { ProjectStoreProvider } from '@/stores/ProjectStore';
import { fetchProjects } from '@/lib/server-firebase';
import { Footer } from '@/components/layout/Footer';
import { Project } from '@/lib/types';

const BASE_URL = 'https://www.naraandratyaga.my.id';
const FULL_NAME = 'Nara Andra Tyaga';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

// ─── SEO Metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Proyek & Portofolio',
  description:
    'Portofolio proyek web development Nara Andra Tyaga — aplikasi web modern menggunakan Next.js, React, TypeScript, Firebase, dan Tailwind CSS. Lihat studi kasus lengkap dengan masalah, solusi, dan teknologi yang digunakan.',
  keywords: [
    'proyek Nara Andra Tyaga',
    'portofolio web developer',
    'Next.js project portfolio',
    'React developer Indonesia',
    'studi kasus web development',
    'aplikasi web modern',
    'portfolio PPLG SMK Wikrama',
    'web app case study',
  ],
  alternates: {
    canonical: `${BASE_URL}/projects`,
  },
  openGraph: {
    title: `Proyek & Portofolio | ${FULL_NAME}`,
    description:
      'Lihat proyek web development Nara Andra Tyaga — studi kasus lengkap dengan teknologi modern: Next.js, React, TypeScript, Firebase.',
    url: `${BASE_URL}/projects`,
    type: 'profile',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `Proyek & Portofolio ${FULL_NAME}`,
      },
    ],
    locale: 'id_ID',
    siteName: `${FULL_NAME} Portfolio`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Proyek & Portofolio | ${FULL_NAME}`,
    description:
      'Portofolio proyek web development Nara Andra Tyaga — Next.js, React, TypeScript, Firebase.',
    images: [OG_IMAGE],
  },
  other: {
    'geo.region': 'ID-JB',
    'geo.placename': 'Bogor, Jawa Barat, Indonesia',
  },
};

// ISR: revalidasi halaman di background setiap 5 menit.
export const revalidate = 300;

// ─── JSON-LD Generator ───────────────────────────────────────────────────────
function generateProjectsJsonLd(projects: Project[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Proyek & Portofolio ${FULL_NAME}`,
    description: 'Koleksi proyek web development dengan studi kasus lengkap.',
    url: `${BASE_URL}/projects`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: projects.length,
      itemListElement: projects.map((p, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: p.titleId || p.titleEn,
          description: p.shortDescriptionId || p.shortDescriptionEn || undefined,
          url:
            typeof p.demoUrl === 'string' && p.demoUrl.startsWith('http')
              ? p.demoUrl
              : undefined,
          image: p.imageUrl || undefined,
          applicationCategory: p.type === 'web' ? 'WebApplication' : p.type === 'ui' ? 'DesignApplication' : 'DeveloperApplication',
          operatingSystem: 'Web',
          keywords: (p.technologies || []).join(', '),
          author: {
            '@type': 'Person',
            name: FULL_NAME,
            url: BASE_URL,
          },
        },
      })),
    },
  };
}

// ─── Page Component ──────────────────────────────────────────────────────────
export default async function ProjectsPage() {
  const initialProjects = await fetchProjects();
  const jsonLd = generateProjectsJsonLd(initialProjects);

  return (
    <ProjectStoreProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-20">
          <Portfolio initialProjects={initialProjects} />
          <Contact />
        </div>
        <Footer />
      </main>
    </ProjectStoreProvider>
  );
}
