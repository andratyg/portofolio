'use client';

/**
 * ============================================================================
 * ShortLinkPreviewClient.tsx
 * ============================================================================
 * Cyberpunk / System themed Interstitial Preview Page.
 * 
 * KLAIM KEAMANAN: IMPLEMENTASI OPSI B
 * ----------------------------------------------------------------------------
 * Pendekatan yang dipilih adalah OPSI B (Netral & Informatif):
 * Halaman preview ini secara transparan menampilkan URL tujuan lengkap, hitung
 * mundur otomatis, tombol fast-forward manual, dan tombol pembatalan TANPA klaim
 * palsu/tidak terverifikasi seperti "Diverifikasi 100% Aman / Bebas Malware" 
 * karena belum terhubung ke Google Safe Browsing API.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import {
  ExternalLink,
  ArrowRight,
  Home,
  Copy,
  Check,
  Pause,
  Play,
  Globe,
  Terminal,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { ShortLink } from '@/lib/types';

interface ShortLinkPreviewClientProps {
  shortLink: ShortLink;
}

const COUNTDOWN_SECONDS = 3;

export function ShortLinkPreviewClient({ shortLink }: { shortLink: ShortLink }) {
  const [timeLeft, setTimeLeft] = useState<number>(COUNTDOWN_SECONDS);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Jika link dinonaktifkan (isActive: false), tampilkan status deactivated
  if (!shortLink.isActive) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.12),rgba(255,255,255,0))]" />
        
        <m.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-xl relative z-10"
        >
          <div className="relative rounded-2xl border border-destructive/30 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 bg-destructive/10 border-b border-destructive/20 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-destructive">
                <Terminal className="w-4 h-4" />
                <span className="font-semibold tracking-wider">SYSTEM // LINK_DEACTIVATED</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                <span className="text-muted-foreground font-mono">NON-AKTIF</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 text-center sm:text-left">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-destructive/10 text-destructive border border-destructive/20 mb-1">
                  <span>/l/{shortLink.slug}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
                  Tautan Sedang Dinonaktifkan
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Tautan short link ini telah dinonaktifkan oleh pemilik portofolio dan tidak menerima akses pengalihan saat ini.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-[0.98] transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span>Kembali ke Beranda</span>
                </Link>
              </div>
            </div>

            <div className="px-6 py-3 bg-muted/20 border-t border-border/40 text-[11px] font-mono text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
              <span>PORTFOLIO_NODE // NARA ANDRA TYAGA</span>
              <span className="text-destructive/80 font-mono">ACCESS RESTRICTED</span>
            </div>
          </div>
        </m.div>
      </div>
    );
  }

  // Fungsi untuk redirect langsung ke URL tujuan
  const handleProceed = () => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    window.location.href = shortLink.originalUrl;
  };

  // Copy original URL ke clipboard
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shortLink.originalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy URL:', e);
    }
  };

  // Logika Countdown Timer
  useEffect(() => {
    if (isPaused || isHovered || isRedirecting) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsRedirecting(true);
          window.location.href = shortLink.originalUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isHovered, isRedirecting, shortLink.originalUrl]);

  // Parsing hostname untuk display yang mudah dibaca
  let targetHostname = '';
  try {
    const parsed = new URL(shortLink.originalUrl);
    targetHostname = parsed.hostname;
  } catch {
    targetHostname = shortLink.originalUrl;
  }

  // Hitung persentase progres countdown
  const progressPercentage = ((COUNTDOWN_SECONDS - timeLeft) / COUNTDOWN_SECONDS) * 100;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-background">
      {/* Background Cyberpunk Grid & Glow Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]" />
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <m.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-xl relative z-10"
      >
        {/* Main Terminal Card */}
        <div className="relative rounded-2xl border border-primary/20 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden">

          {/* Cyberpunk Top Status Bar */}
          <div className="px-5 py-3.5 bg-primary/5 border-b border-primary/10 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-primary">
              <Terminal className="w-4 h-4 animate-pulse" />
              <span className="font-semibold tracking-wider">SYSTEM // LINK_GATEWAY</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-muted-foreground font-mono">ACTIVE_ROUTE</span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 space-y-6">

            {/* Header Title / Slug Info */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-primary/10 text-primary border border-primary/20 mb-1">
                <span>/l/{shortLink.slug}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
                {shortLink.title ? shortLink.title : 'Mengarahkan ke Tautan Eksternal'}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Sistem redirect resmi portofolio Nara Andra Tyaga
              </p>
            </div>

            {/* Destination URL Box (High Visibility & Monospace) */}
            <div
              className="space-y-2"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  DESTINATION TARGET ({targetHostname})
                </span>
                {isHovered && !isRedirecting && (
                  <span className="text-amber-500 dark:text-amber-400 text-[11px] font-sans flex items-center gap-1 animate-pulse">
                    <Pause className="w-3 h-3" /> Timer Dijeda
                  </span>
                )}
              </div>

              <div className="relative group rounded-xl border border-primary/20 bg-background/80 p-3.5 sm:p-4 transition-all duration-200 hover:border-primary/50 focus-within:border-primary">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 font-mono text-xs sm:text-sm text-foreground/90 break-all leading-relaxed select-all">
                    {shortLink.originalUrl}
                  </div>
                  <button
                    onClick={handleCopyUrl}
                    type="button"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors shrink-0"
                    title="Salin URL tujuan"
                    aria-label="Salin URL tujuan"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* OPSI B: Informasi & Transparansi Keamanan Netral */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 flex items-start gap-3 text-xs text-muted-foreground">
              <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-foreground/90">
                  Verifikasi Alamat Sebelum Melanjutkan
                </p>
                <p className="leading-relaxed">
                  Tautan ini akan mengalihkan Anda ke situs pihak ketiga di luar domain ini. Pastikan alamat URL di atas sesuai dengan yang Anda tuju.
                </p>
              </div>
            </div>

            {/* Real-time Countdown & Progress HUD */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-foreground font-medium">
                    {isRedirecting
                      ? 'MEMPROSES PENGALIHAN...'
                      : `PENGALIHAN OTOMATIS DALAM ${timeLeft}s`}
                  </span>
                </div>

                {!isRedirecting && (
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors font-sans"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-3 h-3 text-emerald-500" /> Lanjutkan Timer
                      </>
                    ) : (
                      <>
                        <Pause className="w-3 h-3 text-amber-500" /> Jeda Timer
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Progress Bar Line */}
              <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-300 ease-linear rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Action Buttons (Lanjutkan vs Batal) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleProceed}
                disabled={isRedirecting}
                type="button"
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-75 cursor-pointer"
              >
                {isRedirecting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Mengarahkan...</span>
                  </>
                ) : (
                  <>
                    <span>Lanjutkan ke Tujuan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Batal</span>
              </Link>
            </div>

          </div>

          {/* Terminal Footer Info */}
          <div className="px-6 py-3 bg-muted/20 border-t border-border/40 text-[11px] font-mono text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
            <span>PORTFOLIO_NODE // NARA ANDRA TYAGA</span>
            <span className="text-primary/80">SECURE PROTOCOL INTERSTITIAL</span>
          </div>

        </div>
      </m.div>
    </div>
  );
}
