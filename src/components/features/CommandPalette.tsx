"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/stores/ProjectStore';
import { useLanguage } from '@/components/providers/LanguageContext';
import { useTheme, themes } from '@/components/providers/ThemeContext';
import { 
  Search, FileText, Globe, Palette, ArrowRight, 
  BookOpen, Briefcase, Award, History, Mail, User, 
  Sparkles, ExternalLink, X, Command, Download, Copy, Check
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const store = useProjectStore();
  const projects = store?.projects || [];
  const blogs = store?.blogs || [];
  const profile = store?.profile;
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle on Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    // Custom event listener so Navbar or other components can open CommandPalette
    const handleOpenCommandPalette = () => setOpen(true);
    window.addEventListener('open-command-palette', handleOpenCommandPalette);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-command-palette', handleOpenCommandPalette);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  const handleNavigate = (url: string) => {
    setOpen(false);
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (url.startsWith('#')) {
      if (window.location.pathname !== '/') {
        router.push(`/${url}`);
      } else {
        const el = document.getElementById(url.replace('#', ''));
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(url);
    }
  };

  const handleCopyPortfolioUrl = () => {
    navigator.clipboard.writeText('https://www.naraandratyaga.my.id');
    setCopiedLink(true);
    toast({
      title: language === 'id' ? 'Tautan Disalin!' : 'Link Copied!',
      description: 'https://www.naraandratyaga.my.id',
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadCv = () => {
    if (profile?.cvUrl) {
      window.open(profile.cvUrl, '_blank');
      setOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: language === 'id' ? 'CV Belum Tersedia' : 'CV Not Available',
        description: language === 'id' ? 'Dokumen resume sedang diperbarui.' : 'Resume document is being updated.',
      });
    }
  };

  const q = query.toLowerCase().trim();

  // Navigation Items
  const navItems = [
    { label: language === 'id' ? 'Beranda' : 'Home', href: '/', icon: Globe, section: 'Navigasi' },
    { label: language === 'id' ? 'Semua Proyek' : 'Projects', href: '/projects', icon: Briefcase, section: 'Navigasi' },
    { label: language === 'id' ? 'Perjalanan Karir' : 'Career Timeline', href: '/experience', icon: History, section: 'Navigasi' },
    { label: language === 'id' ? 'Sertifikat & Kredensial' : 'Certificates', href: '/certificates', icon: Award, section: 'Navigasi' },
    { label: language === 'id' ? 'Blog & Insights' : 'Blog & Insights', href: '/blog', icon: BookOpen, section: 'Navigasi' },
    { label: language === 'id' ? 'Tentang Saya' : 'About Me', href: '/about', icon: User, section: 'Navigasi' },
    { label: language === 'id' ? 'Hubungi Saya' : 'Contact Me', href: '/contact', icon: Mail, section: 'Navigasi' },
  ].filter(item => !q || item.label.toLowerCase().includes(q));

  // Projects Search
  const filteredProjects = useMemo(() => {
    if (!q) return projects.slice(0, 4);
    return projects.filter(p => {
      const title = language === 'id' ? (p.titleId || p.titleEn) : (p.titleEn || p.titleId);
      const desc = language === 'id' ? (p.shortDescriptionId || p.shortDescriptionEn) : (p.shortDescriptionEn || p.shortDescriptionId);
      return (
        title.toLowerCase().includes(q) ||
        (desc && desc.toLowerCase().includes(q)) ||
        (p.technologies || []).some(t => t.toLowerCase().includes(q))
      );
    }).slice(0, 4);
  }, [projects, q, language]);

  // Blogs Search
  const filteredBlogs = useMemo(() => {
    if (!q) return blogs.slice(0, 3);
    return blogs.filter(b => {
      const title = language === 'id' ? (b.titleId || b.titleEn) : (b.titleEn || b.titleId);
      const summary = language === 'id' ? (b.summaryId || b.summaryEn) : (b.summaryEn || b.summaryId);
      return (
        title.toLowerCase().includes(q) ||
        (summary && summary.toLowerCase().includes(q)) ||
        (b.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }).slice(0, 3);
  }, [blogs, q, language]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-3xl gap-0">
        <DialogTitle className="sr-only">Command Palette Navigation</DialogTitle>
        <DialogDescription className="sr-only">Navigasi cepat dan pencarian instan portofolio</DialogDescription>
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60 bg-muted/20">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'id' ? "Cari halaman, proyek, artikel, atau aksi..." : "Search pages, projects, articles, or actions..."}
            className="w-full bg-transparent text-sm sm:text-base outline-none text-foreground placeholder:text-muted-foreground font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted text-[10px] font-mono text-muted-foreground border border-border/60 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 sm:p-4 space-y-4 no-scrollbar">
          
          {/* Quick Actions */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-1.5">
              {language === 'id' ? 'Aksi Cepat' : 'Quick Actions'}
            </p>
            <div className="grid sm:grid-cols-2 gap-1.5">
              <button
                onClick={handleDownloadCv}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors text-left group w-full"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Download className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold leading-tight truncate">
                    {language === 'id' ? 'Unduh Resume / CV' : 'Download CV / Resume'}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {profile?.cvFileName || 'CV_Nara_Andra_Tyaga.pdf'}
                  </p>
                </div>
              </button>

              <button
                onClick={handleCopyPortfolioUrl}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors text-left group w-full"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {copiedLink ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold leading-tight truncate">
                    {copiedLink ? (language === 'id' ? 'Tautan Disalin!' : 'Link Copied!') : (language === 'id' ? 'Salin Tautan Portofolio' : 'Copy Portfolio URL')}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    naraandratyaga.my.id
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Navigation Section */}
          {navItems.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-1.5">
                {language === 'id' ? 'Halaman & Menu' : 'Pages & Navigation'}
              </p>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavigate(item.href)}
                    className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold">{item.label}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects Results */}
          {filteredProjects.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-1.5">
                {language === 'id' ? 'Studi Kasus Proyek' : 'Project Case Studies'}
              </p>
              <div className="space-y-1">
                {filteredProjects.map((p) => {
                  const pTitle = language === 'id' ? (p.titleId || p.titleEn) : (p.titleEn || p.titleId);
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleNavigate(`/projects/${p.id}`)}
                      className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{pTitle}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{(p.technologies || []).slice(0, 3).join(', ')}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-mono shrink-0 ml-2">
                        {p.type}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Blog Articles */}
          {filteredBlogs.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-1.5">
                {language === 'id' ? 'Artikel Blog' : 'Blog Articles'}
              </p>
              <div className="space-y-1">
                {filteredBlogs.map((b) => {
                  const bTitle = language === 'id' ? (b.titleId || b.titleEn) : (b.titleEn || b.titleId);
                  return (
                    <button
                      key={b.id}
                      onClick={() => handleNavigate(`/blog/${b.slug}`)}
                      className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{bTitle}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{b.readingTime || '3 min read'}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/30 text-[10px] text-muted-foreground font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border/60 font-mono text-[9px]">↵</kbd> Buka
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border/60 font-mono text-[9px]">ESC</kbd> Tutup
            </span>
          </div>
          <span className="font-bold text-primary">Nara Andra Tyaga</span>
        </div>

      </DialogContent>
    </Dialog>
  );
}
