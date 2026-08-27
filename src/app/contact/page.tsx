/**
 * /contact - Server Component untuk halaman kontak.
 *
 * Konten form dan social links di-render client-side (Firestore write-only),
 * tapi metadata SEO + JSON-LD ContactPage sudah ada di initial HTML.
 */

import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Contact } from '@/components/sections/Contact';
import { ProjectStoreProvider } from '@/stores/ProjectStore';
import { Footer } from '@/components/layout/Footer';

const BASE_URL = 'https://www.naraandratyaga.my.id';
const FULL_NAME = 'Nara Andra Tyaga';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

// ─── SEO Metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Hubungi Saya',
  description:
    'Hubungi Nara Andra Tyaga untuk diskusi kolaborasi, proyek web development, freelance, atau peluang kerja. Tersedia melalui WhatsApp, LinkedIn, Instagram, GitHub, TikTok, dan email.',
  keywords: [
    'kontak Nara Andra Tyaga',
    'hubungi web developer',
    'hire developer Indonesia',
    'freelance web developer Bogor',
    'kolaborasi proyek web',
    'contact developer',
    'jasa web development',
  ],
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
  openGraph: {
    title: `Hubungi Saya | ${FULL_NAME}`,
    description:
      'Ingin berkolaborasi atau punya proyek menarik? Hubungi Nara Andra Tyaga melalui form kontak atau kanal sosial yang tersedia.',
    url: `${BASE_URL}/contact`,
    type: 'website',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `Hubungi ${FULL_NAME}`,
      },
    ],
    locale: 'id_ID',
    siteName: `${FULL_NAME} Portfolio`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Hubungi Saya | ${FULL_NAME}`,
    description:
      'Hubungi Nara Andra Tyaga untuk kolaborasi, proyek web, atau peluang kerja — WhatsApp, LinkedIn, Instagram, GitHub, email.',
    images: [OG_IMAGE],
  },
  other: {
    'geo.region': 'ID-JB',
    'geo.placename': 'Bogor, Jawa Barat, Indonesia',
  },
};

// Konten statis — form write-only, tidak butuh ISR sering.
export const revalidate = 3600;

// ─── JSON-LD ContactPage ─────────────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: `Hubungi ${FULL_NAME}`,
  description:
    'Halaman kontak resmi Nara Andra Tyaga. Tersedia form pesan langsung dan tautan ke semua kanal sosial.',
  url: `${BASE_URL}/contact`,
  mainEntity: {
    '@type': 'Person',
    name: FULL_NAME,
    url: BASE_URL,
    email: 'admin@karyapro.app',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['Indonesian', 'English'],
        areaServed: 'ID',
      },
    ],
    sameAs: [
      'https://github.com/nara-andra-tyaga',
      'https://linkedin.com/in/nara-andra-tyaga',
      'https://instagram.com/nara.dev',
      'https://www.tiktok.com/@naradev',
    ],
  },
};

// ─── Page Component ──────────────────────────────────────────────────────────
export default function ContactPage() {
  return (
    <ProjectStoreProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-20">
          <Contact />
        </div>
        <Footer />
      </main>
    </ProjectStoreProvider>
  );
}
