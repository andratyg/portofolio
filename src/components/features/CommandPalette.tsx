"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/stores/ProjectStore';
import { useLanguage } from '@/components/providers/LanguageContext';
import { useTheme, themes, THEME_CONFIGS, Theme } from '@/components/providers/ThemeContext';
import {
  Search, Globe, Palette, ArrowRight,
  BookOpen, Briefcase, Award, History, Mail, User,
  X, Download, Copy, Check, Volume2, VolumeX,
  Terminal, Trophy, Code2, Filter
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAudioFX } from '@/components/providers/AudioFXContext';
import { cn } from '@/lib/utils';

// ─── CLI Command Registry ─────────────────────────────────────────────────────
interface CLIResult {
  type: 'text' | 'table' | 'action' | 'error';
  content: string;
  rows?: string[][];
  headers?: string[];
}

const CLI_COMMANDS = [
  'help', '?', 'skills', 'sudo hire-me', 'matrix',
  'theme', 'cv', 'wa', 'whatsapp', 'badges', 'trophy',
  'clear', 'about', 'projects', 'whoami',
] as const;

// ─── Matrix Rain Effect ────────────────────────────────────────────────────────
function MatrixRainCanvas({ duration = 8000 }: { duration?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01234567890ABCDEF<>{}[];=+-*&^%$#@!';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array.from({ length: columns }, () => Math.random() * -100);

    let animId: number;
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0f0';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Random brightness variation
        const brightness = Math.random();
        if (brightness > 0.95) {
          ctx.fillStyle = '#fff';
        } else if (brightness > 0.7) {
          ctx.fillStyle = '#0f0';
        } else {
          ctx.fillStyle = '#003b00';
        }

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    const timeout = setTimeout(() => {
      cancelAnimationFrame(animId);
    }, duration);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(timeout);
    };
  }, [duration]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none transition-opacity duration-500"
      style={{ background: 'rgba(0,0,0,0.9)' }}
    />
  );
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [cliMode, setCliMode] = useState(false);
  const [cliHistory, setCliHistory] = useState<Array<{ cmd: string; result: CLIResult }>>([]);
  const [showMatrix, setShowMatrix] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const store = useProjectStore();
  const projects = store?.projects || [];
  const blogs = store?.blogs || [];
  const profile = store?.profile;
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { soundEnabled, toggleSound, play } = useAudioFX();
  const inputRef = useRef<HTMLInputElement>(null);
  const cliEndRef = useRef<HTMLDivElement>(null);

  // Toggle on Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setOpen((prev) => {
          const next = !prev;
          if (next) play('modal');
          return next;
        });
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    // Custom event listener so Navbar or other components can open CommandPalette
    const handleOpenCommandPalette = () => {
      play('modal');
      setOpen(true);
    };
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
      setCliMode(false);
      setCliHistory([]);
    }
  }, [open]);

  // Auto-scroll CLI history
  useEffect(() => {
    cliEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [cliHistory]);

  const handleNavigate = (url: string) => {
    play('click');
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
    play('success');
    navigator.clipboard.writeText('https://www.naraandratyaga.my.id');
    setCopiedLink(true);
    toast({
      title: language === 'id' ? 'Tautan Disalin!' : 'Link Copied!',
      description: 'https://www.naraandratyaga.my.id',
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadCv = useCallback(() => {
    play('click');
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
  }, [play, profile?.cvUrl, toast, language]);

  const handleSelectTheme = (tId: Theme) => {
    play('toggle');
    setTheme(tId, true);
    toast({
      title: language === 'id' ? 'Tema Diperbarui' : 'Theme Updated',
      description: `${language === 'id' ? 'Tema aktif:' : 'Active theme:'} ${THEME_CONFIGS[tId].name[language]}`,
    });
    setOpen(false);
  };

  // ─── CLI Command Executor ──────────────────────────────────────────────
  const executeCommand = useCallback((cmd: string): CLIResult => {
    const trimmed = cmd.trim().toLowerCase();

    if (trimmed === 'help' || trimmed === '?') {
      return {
        type: 'table',
        content: '📋 Available Commands:',
        headers: ['Command', 'Description'],
        rows: [
          ['help / ?', 'Show this cheat-sheet'],
          ['skills', 'Display tech stack & proficiency'],
          ['sudo hire-me', 'Open collaboration/contact form'],
          ['matrix', 'Trigger Matrix digital rain (8s)'],
          ['theme <name>', 'Switch theme (e.g., theme mocha, theme dark)'],
          ['cv', 'Download CV / Resume instantly'],
          ['wa / whatsapp', 'Open WhatsApp direct message'],
          ['about', 'About the developer'],
          ['projects', 'List all projects'],
          ['whoami', 'Who am I?'],
          ['clear', 'Clear terminal history'],
        ],
      };
    }

    if (trimmed === 'skills') {
      return {
        type: 'table',
        content: '⚡ Tech Stack & Skills:',
        headers: ['Technology', 'Level', 'Category'],
        rows: [
          ['Next.js / React', '████████░░ 85%', 'Frontend'],
          ['TypeScript', '███████░░░ 75%', 'Language'],
          ['Tailwind CSS', '████████░░ 80%', 'Styling'],
          ['Firebase', '███████░░░ 70%', 'Backend'],
          ['Framer Motion', '██████░░░░ 65%', 'Animation'],
          ['Figma / UI Design', '███████░░░ 72%', 'Design'],
          ['Git / GitHub', '████████░░ 80%', 'DevOps'],
          ['Node.js', '██████░░░░ 60%', 'Runtime'],
        ],
      };
    }

    if (trimmed === 'sudo hire-me') {
      return {
        type: 'action',
        content: '🤝 sudo: Opening collaboration channel...\n\n📧 Redirecting to contact page...\n✅ Access granted! Let\'s build something amazing together.',
      };
    }

    if (trimmed === 'matrix') {
      return {
        type: 'action',
        content: '🟢 Initiating Matrix digital rain...\n⚡ Rendering canvas overlay for 8 seconds...\n💊 Welcome to the Matrix, Neo.',
      };
    }

    if (trimmed.startsWith('theme')) {
      const parts = trimmed.split(/\s+/);
      if (parts.length < 2) {
        const themeList = themes.map(t => `  • ${t} (${THEME_CONFIGS[t].name[language] || THEME_CONFIGS[t].name.en}) ${theme === t ? '← active' : ''}`).join('\n');
        return {
          type: 'text',
          content: `🎨 Available themes:\n${themeList}\n\nUsage: theme <name> (e.g. theme mocha, theme dark)`,
        };
      }
      const rawTarget = parts.slice(1).join(' ').trim().toLowerCase();
      let targetTheme: Theme | undefined = undefined;
      if (themes.includes(rawTarget as Theme)) {
        targetTheme = rawTarget as Theme;
      } else if (['cappuccino', 'mocha', 'coffee', 'kopi', 'capucino', 'catpuccino', 'kopi-mocha'].includes(rawTarget)) {
        targetTheme = 'catppuccin';
      } else if (['sunset', 'senja', 'pantai', 'beach', 'sunset-beach', 'senja-pantai'].includes(rawTarget)) {
        targetTheme = 'sunset';
      } else if (['liquid', 'glass', 'kaca', 'visionos', 'apple', 'anti-gravity', 'antigravity', 'zero-g', 'frosted'].includes(rawTarget)) {
        targetTheme = 'liquid';
      }

      if (targetTheme) {
        setTheme(targetTheme, true);
        return {
          type: 'action',
          content: `🎨 Switching to theme: ${THEME_CONFIGS[targetTheme].name[language] || THEME_CONFIGS[targetTheme].name.en}\n✅ Theme applied successfully!`,
        };
      }
      return {
        type: 'error',
        content: `❌ Unknown theme: "${parts.slice(1).join(' ')}"\n\nAvailable: ${themes.join(', ')} (or shortcuts: mocha, coffee, kopi)`,
      };
    }

    if (trimmed === 'cv') {
      return {
        type: 'action',
        content: '📄 Downloading CV / Resume...\n✅ Opening document in new tab.',
      };
    }

    if (trimmed === 'wa' || trimmed === 'whatsapp') {
      return {
        type: 'action',
        content: '💬 Opening WhatsApp direct message...\n✅ Redirecting to wa.me...',
      };
    }

    if (trimmed === 'clear') {
      return { type: 'action', content: '__CLEAR__' };
    }

    if (trimmed === 'about') {
      return {
        type: 'text',
        content: `👤 Nara Andra Tyaga (Andra)\n📍 Bogor, Indonesia\n🏫 SMK Wikrama Bogor — PPLG\n💻 Web Developer & Student\n🌐 naraandratyaga.my.id\n\n"Building modern web experiences with passion and precision."`,
      };
    }

    if (trimmed === 'projects') {
      if (projects.length === 0) {
        return { type: 'text', content: '📁 No projects loaded yet. Visit the Projects page to explore.' };
      }
      const projectList = projects.slice(0, 8).map(p => {
        const title = language === 'id' ? (p.titleId || p.titleEn) : (p.titleEn || p.titleId);
        return `  📦 ${title} [${(p.technologies || []).slice(0, 3).join(', ')}]`;
      }).join('\n');
      return {
        type: 'text',
        content: `📁 Projects (${projects.length} total):\n${projectList}${projects.length > 8 ? '\n  ... and more' : ''}`,
      };
    }

    if (trimmed === 'whoami') {
      return {
        type: 'text',
        content: `$ whoami\nnara-andra-tyaga\n\n$ uname -a\nPortfolio/2.0 NextJS/15 TypeScript React Framer-Motion\n\n$ uptime\nActive since 2024 — Still building, still learning. 🚀`,
      };
    }

    return {
      type: 'error',
      content: `❌ Command not found: "${cmd}"\nType "help" or "?" for available commands.`,
    };
  }, [theme, themes, language, projects, profile]);

  const handleCliSubmit = useCallback(() => {
    if (!query.trim()) return;
    const cmd = query.trim();
    const result = executeCommand(cmd);

    play('click');

    // Handle special actions
    if (result.content === '__CLEAR__') {
      setCliHistory([]);
      setQuery('');
      return;
    }

    setCliHistory(prev => [...prev, { cmd, result }]);
    setQuery('');

    // Execute side effects for action commands
    const trimmed = cmd.toLowerCase().trim();
    if (trimmed === 'sudo hire-me') {
      setTimeout(() => { setOpen(false); router.push('/contact'); }, 1500);
    } else if (trimmed === 'matrix') {
      setShowMatrix(true);
      setTimeout(() => setShowMatrix(false), 8500);
    } else if (trimmed.startsWith('theme ')) {
      const targetTheme = trimmed.split(/\s+/).slice(1).join(' ') as Theme;
      if (themes.includes(targetTheme)) {
        setTimeout(() => {
          setTheme(targetTheme, true);
          play('toggle');
        }, 500);
      }
    } else if (trimmed === 'cv') {
      setTimeout(() => handleDownloadCv(), 800);
    } else if (trimmed === 'wa' || trimmed === 'whatsapp') {
      setTimeout(() => {
        window.open('https://wa.me/6285172254437', '_blank');
        setOpen(false);
      }, 800);
    }
  }, [query, executeCommand, play, router, handleDownloadCv, setTheme]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (cliMode && e.key === 'Enter') {
      e.preventDefault();
      handleCliSubmit();
    }
  }, [cliMode, handleCliSubmit]);

  const q = query.toLowerCase().trim();

  // Detect if user is typing a CLI command
  const isCliQuery = useMemo(() => {
    if (!q) return false;
    return CLI_COMMANDS.some(cmd => q.startsWith(cmd) || cmd.startsWith(q));
  }, [q]);

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

  // Themes Search Filter
  const filteredThemes = useMemo(() => {
    const themeList = Object.values(THEME_CONFIGS);
    const isThemeQuery = ['theme', 'tema', 'warna', 'color', 'mode', 'tampilan', 'gelap', 'terang', 'dark', 'light', 'ramadan', 'imlek', 'natal', 'catppuccin', 'mocha', 'cappuccino', 'coffee', 'kopi', 'amber', 'modern', 'sunset', 'beach', 'senja', 'pantai', 'liquid', 'glass', 'kaca', 'visionos', 'antigravity'].some(k => q.includes(k));
    if (!q) return themeList.slice(0, 6);
    if (isThemeQuery) return themeList;
    return themeList.filter(tItem => {
      const nameId = tItem.name.id.toLowerCase();
      const nameEn = tItem.name.en.toLowerCase();
      const idStr = tItem.id.toLowerCase();
      const category = tItem.category.toLowerCase();
      const desc = (language === 'id' ? tItem.description.id : tItem.description.en).toLowerCase();
      return nameId.includes(q) || nameEn.includes(q) || idStr.includes(q) || category.includes(q) || desc.includes(q);
    });
  }, [q, language]);

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

  // Tech filter quick actions
  const techFilters = ['React', 'Next.js', 'Laravel', 'TypeScript', 'Firebase', 'Tailwind'];
  const showTechFilters = !q || ['filter', 'teknologi', 'tech', 'stack'].some(k => q.includes(k));

  return (
    <>
      {/* Matrix Rain Overlay */}
      {showMatrix && <MatrixRainCanvas duration={8000} />}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-3xl gap-0">
          <DialogTitle className="sr-only">Command Palette Navigation</DialogTitle>
          <DialogDescription className="sr-only">Navigasi cepat dan pencarian instan portofolio</DialogDescription>

          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60 bg-muted/20">
            {cliMode ? (
              <Terminal className="h-5 w-5 text-green-500 shrink-0" />
            ) : (
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            )}
            {cliMode && (
              <span className="text-green-500 font-mono text-sm font-bold shrink-0">$</span>
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={cliMode
                ? 'Type a command... (help for list)'
                : (language === 'id' ? "Cari halaman, proyek, artikel, tema tampilan..." : "Search pages, projects, articles, theme appearance...")}
              className={cn(
                "w-full bg-transparent text-sm sm:text-base outline-none placeholder:text-muted-foreground font-medium",
                cliMode ? "font-mono text-green-400" : "text-foreground"
              )}
            />
            <div className="flex items-center gap-1.5 shrink-0">
              {/* CLI Mode Toggle */}
              <button
                onClick={() => {
                  setCliMode(!cliMode);
                  setQuery('');
                  play('click');
                }}
                className={cn(
                  "p-1.5 rounded-lg transition-all text-xs font-mono border",
                  cliMode
                    ? "bg-green-500/15 border-green-500/40 text-green-500"
                    : "bg-muted/50 border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
                )}
                title={cliMode ? 'Switch to Search mode' : 'Switch to CLI Terminal mode'}
              >
                <Terminal className="h-3.5 w-3.5" />
              </button>
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
          </div>

          {/* Results Container */}
          <div className="max-h-[60vh] overflow-y-auto p-3 sm:p-4 space-y-4 no-scrollbar">

            {/* ═══ CLI TERMINAL MODE ═══ */}
            {cliMode ? (
              <div className="space-y-3">
                {/* CLI Welcome Banner */}
                {cliHistory.length === 0 && (
                  <div className="font-mono text-xs space-y-1 p-3 rounded-xl bg-black/40 border border-green-500/20 text-green-400/80">
                    <p className="text-green-500 font-bold">┌─── NAT Portfolio Terminal v2.0 ───┐</p>
                    <p>│ Welcome to the interactive CLI!   │</p>
                    <p>│ Type <span className="text-green-300 font-bold">help</span> to see all commands.    │</p>
                    <p className="text-green-500 font-bold">└───────────────────────────────────┘</p>
                  </div>
                )}

                {/* CLI History */}
                {cliHistory.map((entry, i) => (
                  <div key={i} className="font-mono text-xs space-y-1.5">
                    {/* Command line */}
                    <div className="flex items-center gap-2 text-green-400">
                      <span className="text-green-600">$</span>
                      <span className="font-bold">{entry.cmd}</span>
                    </div>
                    {/* Result */}
                    <div className="pl-4 text-muted-foreground">
                      {entry.result.type === 'table' && entry.result.headers && entry.result.rows ? (
                        <div className="space-y-2">
                          <p className="text-foreground font-bold">{entry.result.content}</p>
                          <div className="overflow-x-auto rounded-lg border border-border/40">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-border/40 bg-muted/30">
                                  {entry.result.headers.map((h, hi) => (
                                    <th key={hi} className="text-left p-2 text-primary font-bold">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {entry.result.rows.map((row, ri) => (
                                  <tr key={ri} className="border-b border-border/20 hover:bg-muted/20">
                                    {row.map((cell, ci) => (
                                      <td key={ci} className="p-2 text-foreground/80">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <pre className={cn(
                          "whitespace-pre-wrap break-words leading-relaxed",
                          entry.result.type === 'error' ? 'text-red-400' : 'text-foreground/80'
                        )}>
                          {entry.result.content}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={cliEndRef} />

                {/* CLI Command Suggestions */}
                {isCliQuery && !cliHistory.some(h => h.cmd.toLowerCase() === q) && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {CLI_COMMANDS.filter(cmd => cmd.startsWith(q) && cmd !== q).slice(0, 5).map(cmd => (
                      <button
                        key={cmd}
                        onClick={() => {
                          setQuery(cmd);
                          inputRef.current?.focus();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-muted/50 border border-border/40 text-xs font-mono text-muted-foreground hover:text-green-400 hover:border-green-500/40 transition-all"
                      >
                        {cmd}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ═══ STANDARD SEARCH MODE ═══ */
              <>
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

                    <button
                      onClick={() => {
                        toggleSound();
                        if (!soundEnabled) {
                          setTimeout(() => play('success'), 50);
                        }
                        toast({
                          title: !soundEnabled ? (language === 'id' ? 'Suara UI Aktif' : 'UI Sound Enabled') : (language === 'id' ? 'Suara UI Dimatikan' : 'UI Sound Muted'),
                          description: language === 'id' ? 'Tekan M di keyboard untuk toggle cepat.' : 'Press M on your keyboard for quick toggle.',
                        });
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors text-left group w-full"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold leading-tight truncate">
                          {soundEnabled
                            ? (language === 'id' ? 'Matikan Suara UI (M)' : 'Mute UI Sound (M)')
                            : (language === 'id' ? 'Nyalakan Suara UI (M)' : 'Enable UI Sound (M)')}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {soundEnabled
                            ? (language === 'id' ? 'Efek audio sintetis Web Audio aktif' : 'Synthesized Web Audio FX active')
                            : (language === 'id' ? 'Efek audio saat ini dibisukan' : 'Audio effects currently muted')}
                        </p>
                      </div>
                    </button>

                    {/* CLI Terminal Mode Entry */}
                    <button
                      onClick={() => {
                        setCliMode(true);
                        setQuery('');
                        play('click');
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-green-500/10 hover:text-green-500 transition-colors text-left group w-full"
                    >
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 shrink-0 group-hover:bg-green-500 group-hover:text-white transition-colors">
                        <Terminal className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold leading-tight truncate">
                          {language === 'id' ? 'Buka Terminal CLI' : 'Open CLI Terminal'}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {language === 'id' ? 'Mode hacker: ketik perintah interaktif!' : 'Hacker mode: type interactive commands!'}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tech Filter Quick Actions */}
                {showTechFilters && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-1.5 flex items-center justify-between">
                      <span>{language === 'id' ? 'Filter Teknologi' : 'Tech Filter'}</span>
                      <Filter className="h-3 w-3 text-primary" />
                    </p>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {techFilters.map(tech => {
                        const matchCount = projects.filter(p =>
                          (p.technologies || []).some(t => t.toLowerCase().includes(tech.toLowerCase()))
                        ).length;
                        return (
                          <button
                            key={tech}
                            onClick={() => setQuery(tech.toLowerCase())}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 border border-border/40 text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/10 transition-all"
                          >
                            <Code2 className="h-3 w-3" />
                            {tech}
                            {matchCount > 0 && (
                              <span className="text-[9px] font-mono text-primary bg-primary/10 px-1.5 rounded-full">
                                {matchCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Themes Section */}
                {filteredThemes.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-1.5 flex items-center justify-between">
                      <span>{language === 'id' ? 'Tema & Tampilan' : 'Themes & Appearance'}</span>
                      <Palette className="h-3 w-3 text-primary" />
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {filteredThemes.map((tItem) => {
                        const isCurrent = theme === tItem.id;
                        return (
                          <button
                            key={tItem.id}
                            onClick={() => handleSelectTheme(tItem.id)}
                            className={cn(
                              "flex items-center justify-between p-2.5 rounded-xl transition-all text-left group w-full border",
                              isCurrent
                                ? "bg-primary/15 border-primary/40 text-primary"
                                : "hover:bg-muted/60 border-border/40 text-foreground"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* 3-Color Swatch Pill */}
                              <div className="flex items-center -space-x-1 p-0.5 rounded-full bg-background border border-border/60 shrink-0">
                                <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: tItem.colors.bg }} />
                                <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: tItem.colors.primary }} />
                                <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: tItem.colors.accent }} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold leading-tight truncate flex items-center gap-1.5">
                                  <span>{tItem.name[language]}</span>
                                  {tItem.emoji && <span className="text-xs">{tItem.emoji}</span>}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {tItem.description[language]}
                                </p>
                              </div>
                            </div>
                            {isCurrent ? (
                              <Badge variant="secondary" className="text-[9px] font-mono shrink-0 ml-2 bg-primary/20 text-primary border-none">
                                {language === 'id' ? 'Aktif' : 'Active'}
                              </Badge>
                            ) : (
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

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
              </>
            )}

          </div>

          {/* Footer info bar */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/30 text-[10px] text-muted-foreground font-medium">
            <div className="flex items-center gap-3">
              {cliMode ? (
                <>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-background border border-border/60 font-mono text-[9px]">↵</kbd> Run
                  </span>
                  <span className="flex items-center gap-1 text-green-500 font-bold">
                    <Terminal className="h-3 w-3" /> CLI Mode
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-background border border-border/60 font-mono text-[9px]">↵</kbd> Buka
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-background border border-border/60 font-mono text-[9px]">ESC</kbd> Tutup
                  </span>
                </>
              )}
            </div>
            <span className="font-bold text-primary">Nara Andra Tyaga</span>
          </div>

        </DialogContent>
      </Dialog>
    </>
  );
}
