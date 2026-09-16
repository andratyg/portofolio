"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Terminal, 
  Zap, 
  Sparkles, 
  Globe, 
  ExternalLink, 
  ZoomIn, 
  Monitor, 
  ImageIcon, 
  X 
} from 'lucide-react';
import { Project } from '@/lib/types';
import { useLanguage } from '@/components/providers/LanguageContext';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/>
    </svg>
  );
}

interface ProjectDetailClientProps {
  project: Project;
  otherProjects: Project[];
}

export function ProjectDetailClient({ project, otherProjects }: ProjectDetailClientProps) {
  const { language, t } = useLanguage();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [demoMode, setDemoMode] = useState<'image' | 'embed'>('image');
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Lock body scroll and listen to Escape key when lightbox is open
  useEffect(() => {
    if (!lightboxOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen]);

  // Dynamic localized project fields
  const title = language === 'id' 
    ? (project.titleId || project.titleEn || 'Proyek Portofolio') 
    : (project.titleEn || project.titleId || 'Portfolio Project');

  const description = language === 'id'
    ? (project.shortDescriptionId || project.shortDescriptionEn || '')
    : (project.shortDescriptionEn || project.shortDescriptionId || '');

  const problem = language === 'id'
    ? (project.problemId || project.problemEn)
    : (project.problemEn || project.problemId);

  const solution = language === 'id'
    ? (project.solutionId || project.solutionEn)
    : (project.solutionEn || project.solutionId);

  const hasDemoUrl = typeof project.demoUrl === 'string' && project.demoUrl.trim().startsWith('http');
  const fallbackImage = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80';
  const src = project.imageUrl || fallbackImage;

  return (
    <article className="pt-28 pb-20 md:pt-36 md:pb-28 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        
        {/* Localized Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: language === 'id' ? 'Proyek' : 'Projects', href: '/projects' },
            { label: title || t.caseStudy },
          ]}
        />

        <div className="flex items-center justify-between mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {language === 'id' ? 'Semua Proyek' : 'All Projects'}
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

        {/* Main Project Hero Media with Lightbox & Embed */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-[2.5rem] overflow-hidden bg-muted border border-border/80 shadow-2xl mb-12 group">
          
          {/* Toggle bar — only show if demo URL exists */}
          {hasDemoUrl && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl">
              <button
                type="button"
                onClick={() => setDemoMode('image')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase transition-all ${
                  demoMode === 'image'
                    ? 'bg-white text-black shadow'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <ImageIcon className="h-3 w-3" />
                {t.preview}
              </button>
              <button
                type="button"
                onClick={() => { setDemoMode('embed'); setIframeLoaded(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase transition-all ${
                  demoMode === 'embed'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Monitor className="h-3 w-3" />
                {t.liveDemo}
              </button>
            </div>
          )}

          {demoMode === 'image' || !hasDemoUrl ? (
            /* Screenshot / image mode */
            <>
              <Image
                src={src}
                alt={title}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 95vw, 1000px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Zoom button */}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
                title={t.zoomImage}
                aria-label={t.zoomImage}
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              {/* Live Demo & GitHub button overlay */}
              <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t.sourceCode}
                  >
                    <Button variant="secondary" className="rounded-full font-black uppercase text-xs tracking-wider gap-2 px-5 h-12 shadow-2xl bg-black/60 text-white border border-white/20 hover:bg-black hover:border-white/40 backdrop-blur-md transition-all">
                      <GitHubIcon className="h-4 w-4" /> {t.sourceCode}
                    </Button>
                  </a>
                )}
                {hasDemoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="rounded-2xl font-black uppercase text-xs tracking-wider gap-2 px-6 h-12 shadow-2xl bg-white text-black hover:bg-primary hover:text-primary-foreground transition-all">
                      <Globe className="h-4 w-4" /> {t.visitLiveDemo} <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
              </div>
            </>
          ) : (
            /* Embedded iframe mode */
            <div className="w-full h-full relative">
              {!iframeLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted z-10 p-6 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t.loadingDemo}</p>
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    {t.openInNewTab} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
              <iframe
                src={project.demoUrl}
                title={`Live Demo: ${title}`}
                className="w-full h-full border-0"
                onLoad={() => setIframeLoaded(true)}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
              {/* Bottom status bar with demo URL and external link button */}
              <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between p-2 px-4 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-xs text-white/80 pointer-events-auto">
                <span className="truncate max-w-[200px] sm:max-w-md font-mono text-[11px] text-white/70">
                  {project.demoUrl}
                </span>
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:text-primary-foreground font-bold transition-colors ml-2 shrink-0 bg-primary/20 hover:bg-primary px-3 py-1 rounded-lg"
                >
                  <span>{t.openInNewTab}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Lightbox Modal */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
              aria-label={t.close}
            >
              <X className="h-6 w-6" />
            </button>
            <div
              className="relative max-w-5xl w-full max-h-[88vh] rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={src}
                alt={title}
                width={1200}
                height={630}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
        )}

        {/* Deep-Dive Case Study Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Technical Challenge */}
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-card border border-border shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              {t.technicalChallengeProblems}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-medium">
              {problem || t.challengeFallback}
            </p>
          </div>

          {/* Strategic Solution */}
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-card border border-border shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              {t.solutionArchitecture}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-medium">
              {solution || t.solutionFallback}
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
              <h3 className="font-black text-lg uppercase tracking-tight">{t.systemStack}</h3>
              <p className="text-xs text-muted-foreground">{t.systemStackDesc}</p>
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
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">{t.interestedInSimilar}</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {t.interestedInSimilarDesc}
            </p>
          </div>
          <Link href="/contact">
            <Button className="rounded-2xl font-black uppercase text-xs tracking-wider px-8 h-14 shadow-xl shadow-primary/20">
              {t.contactNow} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Other Projects */}
        {otherProjects.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tight">{t.otherProjectsTitle}</h3>
              <Link href="/projects" className="text-xs font-black uppercase text-primary hover:underline flex items-center gap-1">
                {t.viewAllProjects} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {otherProjects.map((op) => {
                const opTitle = language === 'id' 
                  ? (op.titleId || op.titleEn) 
                  : (op.titleEn || op.titleId);
                const opDesc = language === 'id'
                  ? (op.shortDescriptionId || op.shortDescriptionEn)
                  : (op.shortDescriptionEn || op.shortDescriptionId);

                return (
                  <Card key={op.id} className="rounded-2xl bg-card border border-border hover:border-primary/40 transition-all group overflow-hidden">
                    <Link href={`/projects/${op.id}`} className="block p-6 space-y-3">
                      <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                        {op.type} App
                      </span>
                      <h4 className="font-black uppercase text-base group-hover:text-primary transition-colors line-clamp-1">
                        {opTitle}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {opDesc}
                      </p>
                    </Link>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </article>
  );
}
