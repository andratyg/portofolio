/**
 * /about - Server Component dengan ISR (revalidate 300 detik / 5 menit).
 *
 * Data profil & perjalanan karir diambil di SERVER saat render, sehingga HTML awal
 * sudah lengkap dan terbaca oleh crawler Googlebot, media previewer, dan AI indexers.
 */

import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { About } from '@/components/sections/About';
import { Timeline } from '@/components/sections/Timeline';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/layout/Footer';
import { ProjectStoreProvider } from '@/stores/ProjectStore';
import { fetchProfile, fetchExperiences } from '@/lib/server-firebase';
import { DEFAULT_PROFILE } from '@/lib/types';

const BASE_URL = 'https://www.naraandratyaga.my.id';
const FULL_NAME = 'Nara Andra Tyaga';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

// ─── SEO Metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Tentang Saya — Profil & Latar Belakang',
  description:
    'Kenali Nara Andra Tyaga (Andra) lebih dalam — perjalanan karir, latar belakang pendidikan di SMK Wikrama Bogor PPLG, keahlian teknis, dan filosofi rekayasa perangkat lunak modern.',
  keywords: [
    'tentang Nara Andra Tyaga',
    'profil Andra Tyaga',
    'biografi web developer',
    'SMK Wikrama Bogor PPLG',
    'latar belakang programmer',
    'developer Next.js Indonesia',
    'profil software engineer muda',
  ],
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
  openGraph: {
    title: `Tentang Saya — Profil & Latar Belakang | ${FULL_NAME}`,
    description:
      'Kenali Nara Andra Tyaga (Andra) lebih dalam — perjalanan karir, pendidikan di SMK Wikrama Bogor PPLG, dan portofolio teknologi.',
    url: `${BASE_URL}/about`,
    type: 'profile',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `Tentang ${FULL_NAME}`,
      },
    ],
    locale: 'id_ID',
    siteName: `${FULL_NAME} Portfolio`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Tentang Saya — Profil & Latar Belakang | ${FULL_NAME}`,
    description:
      'Profil lengkap Nara Andra Tyaga — Web Developer, UI/UX Designer, dan siswa SMK Wikrama Bogor.',
    images: [OG_IMAGE],
  },
  other: {
    'geo.region': 'ID-JB',
    'geo.placename': 'Bogor, Jawa Barat, Indonesia',
  },
};

// ISR: revalidasi halaman di background setiap 5 menit
export const revalidate = 300;

export default async function AboutPage() {
  const [profile, initialExperiences] = await Promise.all([
    fetchProfile(),
    fetchExperiences(),
  ]);

  const effectiveProfile = profile || DEFAULT_PROFILE;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `Tentang ${FULL_NAME}`,
    description: 'Profil lengkap dan latar belakang Nara Andra Tyaga.',
    url: `${BASE_URL}/about`,
    mainEntity: {
      '@type': 'Person',
      name: FULL_NAME,
      alternateName: ['Andra', 'Andra Tyaga', 'NAT'],
      jobTitle: effectiveProfile.roleEn || 'Full-Stack Web Developer',
      description: effectiveProfile.aboutMeId || effectiveProfile.aboutMeEn,
      url: BASE_URL,
      image: effectiveProfile.profilePictureUrl || OG_IMAGE,
      sameAs: [
        effectiveProfile.github,
        effectiveProfile.linkedin,
        effectiveProfile.instagram,
      ].filter(Boolean),
    },
  };

  return (
    <ProjectStoreProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen selection:bg-primary selection:text-primary-foreground">
        <Navbar />
        <div className="pt-20">
          <About />
          <Timeline initialExperiences={initialExperiences} />
          <Contact />
        </div>
        <Footer />
      </main>
    </ProjectStoreProvider>
  );
}
