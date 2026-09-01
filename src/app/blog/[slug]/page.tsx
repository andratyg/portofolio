/**
 * /blog/[slug] - Server Component dengan Dynamic SEO Metadata & ISR (300 detik).
 *
 * Mengambil artikel blog di server untuk menginjeksi Open Graph dan Twitter Card
 * yang akurat ke dalam HTML head (terbaca saat share ke WhatsApp, Twitter, LinkedIn).
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProjectStoreProvider } from '@/stores/ProjectStore';
import { fetchBlogBySlug, fetchProfile, fetchBlogs } from '@/lib/server-firebase';
import { BlogDetailClient } from '@/components/blog/BlogDetailClient';

const BASE_URL = 'https://www.naraandratyaga.my.id';
const FULL_NAME = 'Nara Andra Tyaga';
const DEFAULT_OG = `${BASE_URL}/og-image.png`;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── Dynamic Metadata Generator (Server-Side) ───────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);

  if (!blog) {
    return {
      title: 'Artikel Tidak Ditemukan',
      description: 'Artikel yang Anda cari mungkin telah dipindahkan atau tidak tersedia.',
    };
  }

  const title = blog.titleId || blog.titleEn || 'Artikel Blog';
  const description = blog.summaryId || blog.summaryEn || `Artikel oleh ${FULL_NAME}`;
  const ogImage = blog.coverImage || DEFAULT_OG;
  const url = `${BASE_URL}/blog/${slug}`;

  return {
    title,
    description,
    keywords: blog.tags || ['web development', 'Next.js', 'programming'],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${FULL_NAME}`,
      description,
      url,
      type: 'article',
      publishedTime: blog.publishedAt,
      modifiedTime: blog.updatedAt || blog.publishedAt,
      authors: [blog.author || FULL_NAME],
      tags: blog.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'id_ID',
      siteName: `${FULL_NAME} Portfolio`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${FULL_NAME}`,
      description,
      images: [ogImage],
    },
  };
}

// ISR: revalidasi background setiap 5 menit
export const revalidate = 300;

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [blog, profile] = await Promise.all([
    fetchBlogBySlug(slug),
    fetchProfile(),
  ]);

  if (!blog) {
    notFound();
  }

  const title = blog.titleId || blog.titleEn;
  const summary = blog.summaryId || blog.summaryEn;
  const ogImage = blog.coverImage || DEFAULT_OG;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: summary,
    image: [ogImage],
    datePublished: blog.publishedAt || new Date().toISOString(),
    dateModified: blog.updatedAt || blog.publishedAt || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: blog.author || profile?.name || FULL_NAME,
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: FULL_NAME,
      url: BASE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${slug}`,
    },
    keywords: (blog.tags || []).join(', '),
  };

  return (
    <ProjectStoreProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <main className="min-h-screen selection:bg-primary selection:text-primary-foreground flex flex-col justify-between">
        <Navbar />
        <BlogDetailClient 
          initialBlog={blog} 
          slug={slug} 
          initialProfile={profile || undefined} 
        />
        <Footer />
      </main>
    </ProjectStoreProvider>
  );
}
