"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Globe, ExternalLink, X, ZoomIn, Monitor, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/>
    </svg>
  );
}

interface ProjectCaseStudyClientProps {
  imageUrl: string;
  title: string;
  demoUrl?: string;
  githubUrl?: string;
}

export function ProjectCaseStudyClient({ imageUrl, title, demoUrl, githubUrl }: ProjectCaseStudyClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [demoMode, setDemoMode] = useState<'image' | 'embed'>('image');
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Lock body scroll and listen to Escape key when lightbox is open
  React.useEffect(() => {
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

  const hasDemoUrl = typeof demoUrl === 'string' && demoUrl.trim().startsWith('http');
  const fallbackImage = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80';
  const src = imageUrl || fallbackImage;

  return (
    <>
      {/* Hero Media */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-[2.5rem] overflow-hidden bg-muted border border-border/80 shadow-2xl mb-12 group">

        {/* Toggle bar — only show if demo URL exists */}
        {hasDemoUrl && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl">
            <button
              onClick={() => setDemoMode('image')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase transition-all ${
                demoMode === 'image'
                  ? 'bg-white text-black shadow'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <ImageIcon className="h-3 w-3" />
              Preview
            </button>
            <button
              onClick={() => { setDemoMode('embed'); setIframeLoaded(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase transition-all ${
                demoMode === 'embed'
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Monitor className="h-3 w-3" />
              Live Demo
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
              onClick={() => setLightboxOpen(true)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
              title="Perbesar gambar"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            {/* Live Demo button overlay */}
            <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Lihat kode sumber di GitHub"
                >
                  <Button variant="secondary" className="rounded-full font-black uppercase text-xs tracking-wider gap-2 px-5 h-12 shadow-2xl bg-black/60 text-white border border-white/20 hover:bg-black hover:border-white/40 backdrop-blur-md transition-all">
                    <GitHubIcon className="h-4 w-4" /> Source Code
                  </Button>
                </a>
              )}
              {hasDemoUrl && (
                <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="rounded-2xl font-black uppercase text-xs tracking-wider gap-2 px-6 h-12 shadow-2xl bg-white text-black hover:bg-primary hover:text-primary-foreground transition-all">
                    <Globe className="h-4 w-4" /> Kunjungi Live Demo <ExternalLink className="h-3.5 w-3.5" />
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
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Memuat demo…</p>
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  Buka di tab baru <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
            <iframe
              src={demoUrl}
              title={`Live Demo: ${title}`}
              className="w-full h-full border-0"
              onLoad={() => setIframeLoaded(true)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
            {/* Bottom status bar with demo URL and external link button */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between p-2 px-4 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-xs text-white/80 pointer-events-auto">
              <span className="truncate max-w-[200px] sm:max-w-md font-mono text-[11px] text-white/70">
                {demoUrl}
              </span>
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:text-primary-foreground font-bold transition-colors ml-2 shrink-0 bg-primary/20 hover:bg-primary px-3 py-1 rounded-lg"
              >
                <span>Buka di tab baru</span>
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
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
            aria-label="Tutup"
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
    </>
  );
}
