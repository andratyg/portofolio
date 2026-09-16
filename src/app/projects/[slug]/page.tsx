/**
 * /projects/[slug] - Server Component untuk Deep-Dive Studi Kasus Proyek Mandiri.
 *
 * Menyajikan halaman studi kasus teknis lengkap dengan dynamic generateMetadata,
 * JSON-LD Schema.org SoftwareApplication, dan hidrasi ke ProjectDetailClient
 * untuk dukungan bilingual dinamis (ID/EN) yang reaktif terhadap LanguageContext.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProjectStoreProvider } from '@/stores/ProjectStore';
import { fetchProjectByIdOrSlug, fetchProjects } from '@/lib/server-firebase';
import { ProjectDetailClient } from '@/components/features/ProjectDetailClient';

const BASE_URL = 'https://www.naraandratyaga.my.id';
const FULL_NAME = 'Nara Andra Tyaga';
const DEFAULT_OG = `${BASE_URL}/og-image.png`;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── Dynamic Metadata Generator (Server-Side) ───────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProjectByIdOrSlug(slug);

  if (!project) {
    return {
      title: 'Proyek Tidak Ditemukan',
      description: 'Studi kasus proyek yang Anda cari mungkin telah dipindahkan atau tidak tersedia.',
    };
  }

  const title = project.titleId || project.titleEn || 'Studi Kasus Proyek';
  const description =
    project.shortDescriptionId ||
    project.shortDescriptionEn ||
    `Studi kasus dan detail arsitektur teknis proyek ${title} oleh ${FULL_NAME}.`;

  const ogImage = project.imageUrl || DEFAULT_OG;
  const url = `${BASE_URL}/projects/${slug}`;

  return {
    title: `${title} — Studi Kasus Portofolio`,
    description,
    keywords: [
      title,
      'studi kasus web development',
      'Next.js portfolio case study',
      ...(project.technologies || []),
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} — Studi Kasus | ${FULL_NAME}`,
      description,
      url,
      type: 'article',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title} preview`,
        },
      ],
      locale: 'id_ID',
      siteName: `${FULL_NAME} Portfolio`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — Studi Kasus | ${FULL_NAME}`,
      description,
      images: [ogImage],
    },
  };
}

// ISR: revalidasi background setiap 5 menit
export const revalidate = 300;

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [project, allProjects] = await Promise.all([
    fetchProjectByIdOrSlug(slug),
    fetchProjects(),
  ]);

  if (!project) {
    notFound();
  }

  const title = project.titleId || project.titleEn || 'Studi Kasus Proyek';
  const description = project.shortDescriptionId || project.shortDescriptionEn || '';
  const hasDemoUrl = typeof project.demoUrl === 'string' && project.demoUrl.trim().startsWith('http');

  // Related projects
  const otherProjects = allProjects.filter((p) => p.id !== project.id).slice(0, 2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: title,
    description: description,
    image: project.imageUrl || DEFAULT_OG,
    url: hasDemoUrl ? project.demoUrl : `${BASE_URL}/projects/${slug}`,
    applicationCategory: project.type === 'web' ? 'WebApplication' : 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    keywords: (project.technologies || []).join(', '),
    author: {
      '@type': 'Person',
      name: FULL_NAME,
      url: BASE_URL,
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

        {/* Ambient background blur */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-[160px]" />
        </div>

        <ProjectDetailClient project={project} otherProjects={otherProjects} />

        <Footer />
      </main>
    </ProjectStoreProvider>
  );
}
