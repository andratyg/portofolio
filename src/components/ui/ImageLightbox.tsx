"use client";

import React, { useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';
import Image from 'next/image';

interface ImageLightboxProps {
  isOpen: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}

export function ImageLightbox({ isOpen, src, alt, onClose }: ImageLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
        aria-label="Tutup"
      >
        <X className="h-6 w-6" />
      </button>

      <div
        className="relative max-w-5xl max-h-[85vh] w-full h-full rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt || 'Project Preview'}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>
    </div>
  );
}

export function LightboxTrigger({ src, alt, children }: { src: string; alt: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="cursor-zoom-in relative group"
        title="Klik untuk memperbesar gambar"
      >
        {children}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
          <div className="p-3 rounded-full bg-black/60 text-white shadow-lg">
            <ZoomIn className="h-5 w-5" />
          </div>
        </div>
      </div>
      <ImageLightbox isOpen={isOpen} src={src} alt={alt} onClose={() => setIsOpen(false)} />
    </>
  );
}
