"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Globe, ExternalLink, X, ZoomIn, Monitor, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectCaseStudyClientProps {
  imageUrl: string;
  title: string;
  demoUrl?: string;
}

export function ProjectCaseStudyClient({ imageUrl, title, demoUrl }: ProjectCaseStudyClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [demoMode, setDemoMode] = useState<'image' | 'embed'>('image');
  const [iframeLoaded, setIframeLoaded] = useState(false);

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
            {hasDemoUrl && (
              <div className="absolute bottom-6 right-6 z-10">
                <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="rounded-2xl font-black uppercase text-xs tracking-wider gap-2 px-6 h-12 shadow-2xl bg-white text-black hover:bg-primary hover:text-primary-foreground transition-all">
                    <Globe className="h-4 w-4" /> Kunjungi Live Demo <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            )}
          </>
        ) : (
          /* Embedded iframe mode */
          <div className="w-full h-full relative">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted z-10">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Memuat demo…</p>
              </div>
            )}
            <iframe
              src={demoUrl}
              title={`Live Demo: ${title}`}
              className="w-full h-full border-0"
              onLoad={() => setIframeLoaded(true)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
            {/* Open in new tab button */}
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-16 right-4 z-20 p-2.5 rounded-full bg-black/50 text-white hover:bg-primary transition-all"
              title="Buka di tab baru"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
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
