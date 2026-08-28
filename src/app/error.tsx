"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Terminal, AlertOctagon, RotateCcw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log runtime exception
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-background select-none">
      {/* Ambient Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_120%,rgba(249,115,22,0.1),rgba(255,255,255,0))] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 my-auto">
        <div className="relative rounded-2xl sm:rounded-3xl border border-destructive/40 bg-card/90 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-300">
          
          {/* Top System Terminal Header */}
          <div className="px-5 py-3.5 bg-destructive/10 border-b border-destructive/20 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-destructive font-semibold tracking-wider">
              <Terminal className="w-4 h-4 text-destructive animate-pulse" />
              <span>SYSTEM // 500_RUNTIME_ERROR</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
              <span className="text-muted-foreground text-[11px] hidden sm:inline">EXCEPTION</span>
            </div>
          </div>

          {/* Main Card Content */}
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shadow-lg shadow-destructive/10">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
                Terjadi Kesalahan Sistem
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Sistem mengalami kegagalan tak terduga saat memproses halaman ini. Silakan coba muat ulang atau kembali ke beranda.
              </p>
            </div>

            {error?.message && (
              <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-left">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
                  Detail Kesalahan:
                </div>
                <div className="text-xs font-mono text-destructive/90 truncate">
                  {error.message}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                onClick={() => reset()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-wider shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Coba Muat Ulang</span>
              </button>

              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-muted/60 hover:bg-muted text-foreground border border-border/50 font-semibold text-xs uppercase tracking-wider active:scale-[0.98] transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
              </Link>
            </div>

          </div>

          {/* Bottom System Terminal Footer */}
          <div className="px-6 py-3 bg-muted/20 border-t border-border/40 text-[11px] font-mono text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
            <span>PORTFOLIO_NODE // NARA ANDRA TYAGA</span>
            <span className="text-destructive/80 font-mono">STATUS: FAULT_CONTAINED</span>
          </div>

        </div>
      </div>
    </div>
  );
}
