/**
 * /certificates - Server Component dengan ISR (revalidate 300 detik / 5 menit).
 *
 * Data sertifikat diambil di SERVER saat render, sehingga HTML awal sudah berisi
 * daftar lengkap sertifikat — terlihat oleh crawler, Googlebot, dan AI indexers.
 */

import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Certificates } from '@/components/sections/Certificates';
import { Contact } from '@/components/sections/Contact';
import { ProjectStoreProvider } from '@/stores/ProjectStore';
import { fetchCertificates } from '@/lib/server-firebase';
import { Footer } from '@/components/layout/Footer';
import { Certificate } from '@/lib/types';

const BASE_URL = 'https://www.naraandratyaga.my.id';
const FULL_NAME = 'Nara Andra Tyaga';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

// ─── SEO Metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Sertifikat & Pencapaian',
  description:
    'Koleksi lengkap sertifikat dan pencapaian resmi Nara Andra Tyaga di bidang web development, cloud computing, UI/UX design, dan teknologi — dari Dicoding, Google, AWS, dan platform terpercaya lainnya.',
  keywords: [
    'sertifikat Nara Andra Tyaga',
    'sertifikasi web developer',
    'Dicoding certificate',
    'Google developer certification',
    'AWS cloud certificate',
    'pencapaian developer Indonesia',
    'portfolio sertifikat PPLG',
    'credential verification',
  ],
  alternates: {
    canonical: `${BASE_URL}/certificates`,
  },
  openGraph: {
    title: `Sertifikat & Pencapaian | ${FULL_NAME}`,
    description:
      'Lihat koleksi sertifikat dan pencapaian resmi Nara Andra Tyaga dalam web development, cloud computing, UI/UX, dan teknologi modern.',
    url: `${BASE_URL}/certificates`,
    type: 'profile',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `Sertifikat & Pencapaian ${FULL_NAME}`,
      },
    ],
    locale: 'id_ID',
    siteName: `${FULL_NAME} Portfolio`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Sertifikat & Pencapaian | ${FULL_NAME}`,
    description:
      'Koleksi sertifikat resmi Nara Andra Tyaga — Dicoding, Google, AWS, dan lembaga teknologi terpercaya.',
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
function generateCertificatesJsonLd(certificates: Certificate[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Sertifikat & Pencapaian ${FULL_NAME}`,
    description: 'Koleksi lengkap sertifikat dan kredensial profesional yang telah divalidasi.',
    url: `${BASE_URL}/certificates`,
    numberOfItems: certificates.length,
    itemListElement: certificates.map((c, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'EducationalOccupationalCredential',
        name: c.titleId || c.titleEn,
        description: c.shortDescriptionId || c.shortDescriptionEn || undefined,
        credentialCategory: 'Certificate',
        recognizedBy: {
          '@type': 'Organization',
          name: c.issuer,
        },
        dateCreated: c.year,
        validUntil: c.validUntil || undefined,
        url:
          typeof c.credentialUrl === 'string' && c.credentialUrl.startsWith('http')
            ? c.credentialUrl
            : undefined,
        image: c.imageUrl || undefined,
      },
    })),
  };
}

// ─── Page Component ──────────────────────────────────────────────────────────
export default async function CertificatesPage() {
  const initialCertificates = await fetchCertificates();
  const jsonLd = generateCertificatesJsonLd(initialCertificates);

  return (
    <ProjectStoreProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-20">
          <Certificates initialCertificates={initialCertificates} />
          <Contact />
        </div>
        <Footer />
      </main>
    </ProjectStoreProvider>
  );
}
