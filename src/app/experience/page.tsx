/**
 * /experience - Server Component dengan ISR (revalidate 300 detik / 5 menit).
 *
 * Data perjalanan karir diambil di SERVER saat render, sehingga HTML awal sudah
 * berisi timeline lengkap — terlihat oleh crawler, Googlebot, dan AI indexers.
 */

import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Timeline } from '@/components/sections/Timeline';
import { Contact } from '@/components/sections/Contact';
import { ProjectStoreProvider } from '@/stores/ProjectStore';
import { fetchExperiences } from '@/lib/server-firebase';
import { Footer } from '@/components/layout/Footer';
import { Experience } from '@/lib/types';

const BASE_URL = 'https://www.naraandratyaga.my.id';
const FULL_NAME = 'Nara Andra Tyaga';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

// ─── SEO Metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Perjalanan Karir & Pendidikan',
  description:
    'Jejak perjalanan karir dan pendidikan Nara Andra Tyaga — riwayat pengalaman kerja, magang, organisasi, dan pencapaian akademis di bidang web development, PPLG, dan teknologi modern.',
  keywords: [
    'pengalaman kerja Nara Andra Tyaga',
    'karir web developer',
    'riwayat pendidikan',
    'SMK Wikrama Bogor PPLG',
    'magang developer',
    'perjalanan karir programmer',
    'career timeline developer Indonesia',
  ],
  alternates: {
    canonical: `${BASE_URL}/experience`,
  },
  openGraph: {
    title: `Perjalanan Karir & Pendidikan | ${FULL_NAME}`,
    description:
      'Lihat riwayat perjalanan karir dan pendidikan Nara Andra Tyaga — pengalaman kerja, magang, organisasi, dan pencapaian akademis di bidang web development.',
    url: `${BASE_URL}/experience`,
    type: 'profile',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `Perjalanan Karir ${FULL_NAME}`,
      },
    ],
    locale: 'id_ID',
    siteName: `${FULL_NAME} Portfolio`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Perjalanan Karir & Pendidikan | ${FULL_NAME}`,
    description:
      'Riwayat pengalaman kerja, magang, dan pendidikan Nara Andra Tyaga di bidang web development dan teknologi.',
    images: [OG_IMAGE],
  },
  other: {
    'geo.region': 'ID-JB',
    'geo.placename': 'Bogor, Jawa Barat, Indonesia',
  },
};

// ISR: revalidasi di background setiap 5 menit.
export const revalidate = 300;

// ─── JSON-LD Generator ───────────────────────────────────────────────────────
function generateExperienceJsonLd(experiences: Experience[]) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: `Perjalanan Karir ${FULL_NAME}`,
      description: 'Riwayat pengalaman kerja, pendidikan, dan pencapaian karir.',
      url: `${BASE_URL}/experience`,
      mainEntity: {
        '@type': 'Person',
        name: FULL_NAME,
        url: BASE_URL,
        hasOccupation: experiences.map((exp) => ({
          '@type': 'Occupation',
          name: exp.titleId || exp.titleEn,
          description: exp.descriptionId || exp.descriptionEn,
          occupationLocation: {
            '@type': 'Organization',
            name: exp.company,
          },
          estimatedSalary: undefined,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Career Timeline',
      numberOfItems: experiences.length,
      itemListElement: experiences.map((exp, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'OrganizationRole',
          roleName: exp.titleId || exp.titleEn,
          description: exp.descriptionId || exp.descriptionEn,
          startDate: exp.year,
          memberOf: {
            '@type': 'Organization',
            name: exp.company,
          },
        },
      })),
    },
  ];
}

// ─── Page Component ──────────────────────────────────────────────────────────
export default async function ExperiencePage() {
  const initialExperiences = await fetchExperiences();
  const jsonLd = generateExperienceJsonLd(initialExperiences);

  return (
    <ProjectStoreProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-20">
          <Timeline initialExperiences={initialExperiences} />
          <Contact />
        </div>
        <Footer />
      </main>
    </ProjectStoreProvider>
  );
}
