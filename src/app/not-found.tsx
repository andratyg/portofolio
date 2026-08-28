import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Terminal,
  AlertTriangle,
  Home,
  FolderGit2,
  BookOpen,
  Mail,
  Compass,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: '404 - Halaman Tidak Ditemukan | Nara Andra Tyaga',
  description: 'Halaman yang Anda tuju tidak ditemukan atau telah dipindahkan.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-background select-none">
      {/* Ambient Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_120%,rgba(168,85,247,0.12),rgba(255,255,255,0))] pointer-events-none" />

      {/* Cyber Grid Subtle Lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="w-full max-w-xl relative z-10 my-auto">
        <div className="relative rounded-2xl sm:rounded-3xl border border-border/70 bg-card/90 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-300">
          
          {/* Top System Terminal Header */}
          <div className="px-5 py-3.5 bg-muted/30 border-b border-border/50 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-primary font-semibold tracking-wider">
              <Terminal className="w-4 h-4 text-primary animate-pulse" />
              <span>SYSTEM // 404_ROUTE_NOT_FOUND</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-muted-foreground text-[11px] hidden sm:inline">UNRESOLVED</span>
            </div>
          </div>

          {/* Main Card Content */}
          <div className="p-6 sm:p-8 space-y-6 text-center">
            
            {/* Visual 404 Display */}
            <div className="space-y-3">
              <div className="relative inline-block">
                <span className="text-7xl sm:text-8xl font-black font-mono tracking-tighter bg-gradient-to-b from-foreground via-foreground/80 to-muted-foreground/30 bg-clip-text text-transparent select-none drop-shadow-sm">
                  404
                </span>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-xs" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-destructive/10 text-destructive border border-destructive/20 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ERROR: URL_RESOURCE_MISSING</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
                  Halaman Tidak Ditemukan
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto mt-1.5">
                  Tautan atau rute yang Anda tuju tidak tersedia, telah dipindahkan, atau mengalami kesalahan pengetikan alamat URL.
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-1">
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-[0.99] transition-all group"
              >
                <Home className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                <span>Kembali ke Beranda Utama</span>
                <ArrowRight className="w-4 h-4 ml-0.5 opacity-70 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Quick Navigation Destination Grid */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider text-left pl-1">
                Navigasi Cepat Alternatif
              </p>
              <div className="grid grid-cols-2 gap-2 text-left">
                <Link
                  href="/projects"
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border/40 hover:border-border transition-all text-xs font-medium text-foreground group"
                >
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <FolderGit2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold truncate">Proyek Portofolio</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">/projects</div>
                  </div>
                </Link>

                <Link
                  href="/blog"
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border/40 hover:border-border transition-all text-xs font-medium text-foreground group"
                >
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold truncate">Artikel & Blog</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">/blog</div>
                  </div>
                </Link>

                <Link
                  href="/experience"
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border/40 hover:border-border transition-all text-xs font-medium text-foreground group"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold truncate">Perjalanan Karir</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">/experience</div>
                  </div>
                </Link>

                <Link
                  href="/contact"
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border/40 hover:border-border transition-all text-xs font-medium text-foreground group"
                >
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold truncate">Hubungi Saya</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">/contact</div>
                  </div>
                </Link>
              </div>
            </div>

          </div>

          {/* Bottom System Terminal Footer */}
          <div className="px-6 py-3 bg-muted/20 border-t border-border/40 text-[11px] font-mono text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
            <span>PORTFOLIO_NODE // NARA ANDRA TYAGA</span>
            <span className="text-primary/90 font-medium">HTTP 404 · NOINDEX</span>
          </div>

        </div>
      </div>
    </div>
  );
}
