/**
 * /blog - Server Component dengan ISR (revalidate 300 detik / 5 menit).
 *
 * Data artikel diambil di SERVER saat render, sehingga initial HTML sudah memuat
 * artikel blog lengkap untuk crawler Googlebot, AI Search, dan feed indexer.
 */

import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProjectStoreProvider } from '@/stores/ProjectStore';
import { fetchBlogs } from '@/lib/server-firebase';
import { BlogListClient } from '@/components/blog/BlogListClient';

const BASE_URL = 'https://www.naraandratyaga.my.id';
const FULL_NAME = 'Nara Andra Tyaga';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

// ─── SEO Metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Blog & Insights',
  description:
    'Kumpulan artikel, tutorial, dan insight teknologi seputar modern web development, Next.js, React, TypeScript, arsitektur frontend, dan pengalaman rekayasa perangkat lunak oleh Nara Andra Tyaga.',
  keywords: [
    'blog web development',
    'tutorial Next.js Indonesia',
    'artikel React TypeScript',
    'frontend engineer blog',
    'Nara Andra Tyaga blog',
    'catatan teknologi PPLG Wikrama',
    'rekayasa perangkat lunak modern',
  ],
  alternates: {
    canonical: `${BASE_URL}/blog`,
    types: {
      'application/rss+xml': `${BASE_URL}/feed.xml`,
    },
  },
  openGraph: {
    title: `Blog & Insights | ${FULL_NAME}`,
    description:
      'Artikel, panduan teknis, dan insight seputar Next.js, React, TypeScript, dan dunia rekayasa perangkat lunak oleh Nara Andra Tyaga.',
    url: `${BASE_URL}/blog`,
    type: 'website',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `Blog & Insights ${FULL_NAME}`,
      },
    ],
    locale: 'id_ID',
    siteName: `${FULL_NAME} Portfolio`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Blog & Insights | ${FULL_NAME}`,
    description:
      'Kumpulan artikel dan insight web development modern oleh Nara Andra Tyaga.',
    images: [OG_IMAGE],
  },
  other: {
    'geo.region': 'ID-JB',
    'geo.placename': 'Bogor, Jawa Barat, Indonesia',
  },
};

// ISR: revalidasi halaman di background setiap 5 menit
export const revalidate = 300;

export default async function BlogPage() {
  const initialBlogs = await fetchBlogs();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Blog & Insights ${FULL_NAME}`,
    description: 'Kumpulan artikel dan wawasan teknologi seputar web development.',
    url: `${BASE_URL}/blog`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: initialBlogs.length,
      itemListElement: initialBlogs.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'BlogPosting',
          headline: b.titleId || b.titleEn,
          description: b.summaryId || b.summaryEn,
          url: `${BASE_URL}/blog/${b.slug || b.id}`,
          image: b.coverImage || OG_IMAGE,
          datePublished: b.publishedAt,
          author: {
            '@type': 'Person',
            name: b.author || FULL_NAME,
          },
        },
      })),
    },
  };

  return (
    <ProjectStoreProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen selection:bg-primary selection:text-primary-foreground flex flex-col justify-between">
        <Navbar />
        <BlogListClient initialBlogs={initialBlogs} />
        <Footer />
      </main>
    </ProjectStoreProvider>
  );
}
