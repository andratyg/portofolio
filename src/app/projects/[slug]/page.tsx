/**
 * /projects/[slug] - Server Component untuk Deep-Dive Studi Kasus Proyek Mandiri.
 *
 * Menyajikan halaman studi kasus teknis lengkap dengan dynamic generateMetadata,
 * JSON-LD Schema.org SoftwareApplication, arsitektur solusi, dan tautan live demo.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProjectStoreProvider } from '@/stores/ProjectStore';
import { fetchProjectByIdOrSlug, fetchProjects } from '@/lib/server-firebase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, Globe, ExternalLink, AlertCircle, 
  CheckCircle2, Terminal, Sparkles, Layers, ArrowRight, Zap 
} from 'lucide-react';

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
      'portfolio project',
      ...(project.technologies || []),
      'Next.js case study',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} — Studi Kasus | ${FULL_NAME}`,
      description,
      url,
      type: 'website',
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

  const title = project.titleId || project.titleEn;
  const description = project.shortDescriptionId || project.shortDescriptionEn;
  const problem = project.problemId || project.problemEn;
  const solution = project.solutionId || project.solutionEn;
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

        <article className="pt-28 pb-20 md:pt-36 md:pb-28 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            
            {/* Back to projects */}
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Semua Proyek
              </Link>

              {project.impactStats && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-black uppercase tracking-wider">
                  <Zap className="h-3.5 w-3.5" />
                  {project.impactStats}
                </div>
              )}
            </div>

            {/* Header / Title */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-xl">
                  {project.type.toUpperCase()} APP
                </Badge>
                {project.featured && (
                  <Badge variant="outline" className="border-primary/40 text-primary font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-xl flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> FEATURED
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-tight">
                {title}
              </h1>

              {description && (
                <p className="text-muted-foreground text-base sm:text-xl max-w-3xl leading-relaxed font-medium">
                  {description}
                </p>
              )}
            </div>

            {/* Main Project Hero Media */}
            <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-[2.5rem] overflow-hidden bg-muted border border-border/80 shadow-2xl mb-12 group">
              <Image
                src={project.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'}
                alt={title}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 95vw, 1000px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {hasDemoUrl && (
                <div className="absolute bottom-6 right-6 z-10">
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="rounded-2xl font-black uppercase text-xs tracking-wider gap-2 px-6 h-12 shadow-2xl bg-white text-black hover:bg-primary hover:text-primary-foreground transition-all">
                      <Globe className="h-4 w-4" /> Kunjungi Live Demo <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              )}
            </div>

            {/* Deep-Dive Case Study Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Technical Challenge */}
              <div className="p-8 sm:p-10 rounded-[2.5rem] bg-card border border-border shadow-xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  Tantangan & Masalah
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-medium">
                  {problem || 'Tantangan dalam proyek ini meliputi skalabilitas performa, efisiensi arsitektur, dan kemudahan antarmuka bagi pengguna.'}
                </p>
              </div>

              {/* Strategic Solution */}
              <div className="p-8 sm:p-10 rounded-[2.5rem] bg-card border border-border shadow-xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  Solusi & Arsitektur
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-medium">
                  {solution || 'Membangun arsitektur modular yang responsif, mengoptimalkan pengambilan data, serta menyusun alur pengguna yang intuitif dan cepat.'}
                </p>
              </div>
            </div>

            {/* System Stack */}
            <div className="p-8 sm:p-10 rounded-[2.5rem] bg-card border border-border shadow-xl space-y-6 mb-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Terminal className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg uppercase tracking-tight">System Stack & Teknologi</h3>
                  <p className="text-xs text-muted-foreground">Framework, pustaka, dan layanan backend yang digunakan</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {(project.technologies || []).map((tech) => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="px-4 py-2 rounded-xl border-primary/20 text-xs font-bold bg-primary/5 text-foreground hover:border-primary/40 transition-colors"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Bottom CTA / Collaborate */}
            <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-br from-primary/15 via-card to-card border border-primary/20 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 mb-20 text-center sm:text-left">
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Tertarik Membangun Solusi Serupa?</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Mari berdiskusi mengenai proyek perangkat lunak Anda dan wujudkan ide digital yang berdampak.
                </p>
              </div>
              <Link href="/contact">
                <Button className="rounded-2xl font-black uppercase text-xs tracking-wider px-8 h-14 shadow-xl shadow-primary/20">
                  Hubungi Sekarang <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Other Projects */}
            {otherProjects.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black uppercase tracking-tight">Karya Lainnya</h3>
                  <Link href="/projects" className="text-xs font-black uppercase text-primary hover:underline flex items-center gap-1">
                    Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {otherProjects.map((op) => (
                    <Card key={op.id} className="rounded-2xl bg-card border border-border hover:border-primary/40 transition-all group overflow-hidden">
                      <Link href={`/projects/${op.id}`} className="block p-6 space-y-3">
                        <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                          {op.type} App
                        </span>
                        <h4 className="font-black uppercase text-base group-hover:text-primary transition-colors line-clamp-1">
                          {op.titleId || op.titleEn}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {op.shortDescriptionId || op.shortDescriptionEn}
                        </p>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          </div>
        </article>

        <Footer />
      </main>
    </ProjectStoreProvider>
  );
}
