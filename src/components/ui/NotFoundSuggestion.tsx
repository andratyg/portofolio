"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

interface RouteMatch {
  label: string;
  href: string;
  desc: string;
}

const KNOWN_ROUTES: RouteMatch[] = [
  { label: 'Proyek Portofolio', href: '/projects', desc: 'Studi kasus & hasil karya web development' },
  { label: 'Artikel & Blog', href: '/blog', desc: 'Panduan teknis, opini, dan catatan seputar koding' },
  { label: 'Perjalanan Karir', href: '/experience', desc: 'Pengalaman kerja & rekam jejak pendidikan' },
  { label: 'Sertifikat & Lisensi', href: '/certificates', desc: 'Daftar sertifikat keahlian & lisensi resmi' },
  { label: 'Tentang Saya', href: '/about', desc: 'Profil lengkap & keahlian teknis Nara Andra Tyaga' },
  { label: 'Hubungi Saya', href: '/contact', desc: 'Formulir pesan & media sosial resmi' },
  { label: 'Kebijakan Privasi', href: '/privacy', desc: 'Kebijakan privasi & perlindungan data' },
  { label: 'Syarat & Ketentuan', href: '/terms', desc: 'Aturan penggunaan situs' },
];

export function NotFoundSuggestion() {
  const [suggestion, setSuggestion] = useState<RouteMatch | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname.toLowerCase();

    // Match keywords against pathname
    let bestMatch: RouteMatch | null = null;
    let highestScore = 0;

    for (const route of KNOWN_ROUTES) {
      const routeKey = route.href.replace('/', '');
      if (path.includes(routeKey)) {
        bestMatch = route;
        break;
      }
      // Check partial match (e.g. /proj -> /projects, /exp -> /experience, /cert -> /certificates)
      if (routeKey.startsWith(path.slice(1, 4))) {
        bestMatch = route;
        break;
      }
    }

    setSuggestion(bestMatch);
  }, []);

  if (!suggestion) return null;

  return (
    <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-left space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-1.5 text-xs font-black uppercase text-primary tracking-wider">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Mungkin ini yang Anda cari?</span>
      </div>
      <Link
        href={suggestion.href}
        className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/60 hover:border-primary transition-all group"
      >
        <div>
          <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
            {suggestion.label}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">{suggestion.href} — {suggestion.desc}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
