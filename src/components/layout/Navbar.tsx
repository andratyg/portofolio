
"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { m as motion } from 'framer-motion';
import { useLanguage } from '@/components/providers/LanguageContext';
import { useTheme, themes, THEME_CONFIGS, Theme } from '@/components/providers/ThemeContext';
import { Button } from '@/components/ui/button';
import { Globe, Palette, LogIn, Menu, X, ChevronDown, Search, Sparkles, Check, Volume2, VolumeX, Terminal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAudioFX } from '@/components/providers/AudioFXContext';
import { useProjectStore } from '@/stores/ProjectStore';
import { notifyDynamicIsland } from '@/components/features/DynamicIslandNotification';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

let globalLogoClicks = 0;
let clickTimeout: NodeJS.Timeout;

const MotionLink = motion.create(Link);

export const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme, isAutoTheme, setAutoTheme } = useTheme();
  const { soundEnabled, toggleSound, play } = useAudioFX();
  const { toast } = useToast();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('/');

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY < 10) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
          
          setLastScrollY(currentScrollY);

          // ScrollSpy logic for home page sections
          if (window.location.pathname === '/') {
            const sections = ['portfolio', 'journey', 'contact'];
            let current = '/';
            for (const section of sections) {
              const element = document.getElementById(section);
              if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom >= 150) {
                  // Map section id to nav href
                  if (section === 'journey') current = '/experience';
                  else if (section === 'contact') current = '/contact';
                  else current = `#${section}`;
                }
              }
            }
            setActiveSection(current);
          } else if (window.location.pathname.startsWith('/blog')) {
            setActiveSection('/blog');
          } else {
            setActiveSection(window.location.pathname);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/blog')) {
        setActiveSection('/blog');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    globalLogoClicks += 1;
    
    if (globalLogoClicks === 5) {
      clearTimeout(clickTimeout);
      globalLogoClicks = 0;
      toast({
        title: "Admin Portal",
        description: "Redirecting...",
      });
      router.push('/admin/login');
    } else {
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        const clicks = globalLogoClicks;
        globalLogoClicks = 0;
        if (clicks > 0 && clicks < 5) {
          if (window.location.pathname !== '/') {
            router.push('/');
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }, 350);
    }
  };

  /**
   * Handles nav link clicks.
   * - Links starting with '#': smooth scroll on homepage; navigate to dedicated page otherwise.
   * - Links to /experience: smooth scroll to #journey on homepage; navigate to /experience from other pages.
   * - Links to /contact: smooth scroll to #contact on homepage; navigate to /contact from other pages.
   * - Other links: navigate normally.
   */
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    const isHomePage = typeof window !== 'undefined' && window.location.pathname === '/';

    // Map dedicated routes to their homepage anchor equivalents
    const anchorMap: Record<string, string> = {
      '/experience': 'journey',
      '/contact': 'contact',
    };

    if (anchorMap[href]) {
      if (isHomePage) {
        // On homepage: smooth scroll to the anchor instead of navigating
        e.preventDefault();
        const element = document.getElementById(anchorMap[href]);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        return;
      }
      // On other pages: let Next.js navigate to the dedicated route (href)
      if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      return;
    }

    if (href.startsWith('#')) {
      if (!isHomePage) {
        e.preventDefault();
        router.push('/' + href);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        return;
      }
      e.preventDefault();
      const elementId = href.substring(1);
      const element = document.getElementById(elementId);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    } else {
      if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    }
  };

  const handleThemeSelect = (tName: Theme) => {
    play('toggle');
    setTheme(tName, true);
    notifyDynamicIsland({
      title: `Tema: ${THEME_CONFIGS[tName]?.name[language] || tName}`,
      subtitle: THEME_CONFIGS[tName]?.description[language] || "Tema tampilan diperbarui",
      icon: "theme",
      emoji: THEME_CONFIGS[tName]?.emoji,
    });
  };

  const navItems = [
    { label: t.navHome, href: '/' },
    { label: t.navPortfolio, href: '#portfolio' },
    { label: t.navJourney, href: '/experience' },
    { label: t.navBlog, href: '/blog' },
    { label: t.navContact, href: '/contact' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
      theme === 'liquid'
        ? "pt-2 sm:pt-3.5 px-3 sm:px-6 pointer-events-none"
        : "bg-background/90 backdrop-blur-md border-b",
      isVisible ? "translate-y-0" : "-translate-y-full"
    )}>
      <div className={cn(
        "container mx-auto flex items-center justify-between transition-all duration-500",
        theme === 'liquid'
          ? "max-w-6xl xl:max-w-7xl h-14 sm:h-16 px-4 sm:px-6 rounded-full bg-white/85 backdrop-blur-3xl border border-white/95 shadow-[0_16px_40px_-10px_rgba(15,23,42,0.10),0_0_0_1px_rgba(0,122,255,0.12),inset_0_1.5px_1px_rgba(255,255,255,1),inset_0_-1px_2px_rgba(0,0,0,0.03)] pointer-events-auto"
          : "px-4 sm:px-6 h-16 sm:h-20"
      )}>
        <div className="flex items-center gap-3 sm:gap-6 lg:gap-8 min-w-0">
          <div className="flex items-center gap-3 shrink-0">
            <motion.a 
              href="/" 
              onClick={handleLogoClick}
              className="text-2xl sm:text-3xl font-black text-primary cursor-pointer tracking-normal"
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.95, rotate: 10, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              NAT
            </motion.a>
          </div>
          
          <div className="hidden md:flex gap-1.5 lg:gap-3 items-center relative">
            {navItems.map((item) => {
              const isActive = activeSection === item.href;
              return (
                <Link 
                  key={item.label} 
                  href={item.href}
                  onClick={(e) => {
                    play('tab');
                    handleSmoothScroll(e, item.href);
                  }}
                  onMouseEnter={() => play('hover')}
                  className={cn(
                    "relative text-xs font-bold uppercase transition-all duration-200",
                    theme === 'liquid'
                      ? isActive
                        ? "px-3 py-1.5 rounded-full bg-white/95 text-primary shadow-[0_2px_8px_rgba(0,122,255,0.15),inset_0_1px_0.5px_white] tracking-[0.1em]"
                        : "px-3 py-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white/40 tracking-[0.1em]"
                      : cn(
                          "tracking-[0.16em] py-2",
                          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )
                  )}
                >
                  {item.label}
                  {theme !== 'liquid' && (
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 right-0 h-0.5 bg-primary transition-all duration-300 pointer-events-none",
                        isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                      )}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Developer CLI Terminal Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              play('tab');
              window.dispatchEvent(new CustomEvent('open-dev-terminal'));
            }}
            className={cn(
              "hidden sm:inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 text-xs transition-all shrink-0",
              theme === 'liquid'
                ? "rounded-full bg-white/70 hover:bg-white text-slate-700 border-white/80 shadow-[0_2px_8px_rgba(0,122,255,0.08),inset_0_1px_0.5px_white]"
                : "rounded-xl text-muted-foreground hover:text-emerald-400 border-border/60 glass-card hover:border-emerald-500/40"
            )}
            title="Buka Developer Terminal (`)"
            aria-label="Buka Developer Terminal"
          >
            <Terminal className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="hidden xl:inline text-[11px] font-mono font-bold">CLI</span>
            <kbd className={cn(
              "hidden 2xl:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border",
              theme === 'liquid' ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-muted text-muted-foreground border-border/60"
            )}>
              `
            </kbd>
          </Button>

          {/* Spotlight Search / Command Palette Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            className={cn(
              "hidden sm:inline-flex items-center gap-2 h-9 px-2.5 sm:px-3 text-xs transition-all shrink-0",
              theme === 'liquid'
                ? "rounded-full bg-white/70 hover:bg-white text-slate-700 border-white/80 shadow-[0_2px_8px_rgba(0,122,255,0.08),inset_0_1px_0.5px_white]"
                : "rounded-xl text-muted-foreground hover:text-foreground border-border/60 glass-card hover:border-primary/40"
            )}
            aria-label="Buka Pencarian Cepat"
          >
            <Search className="h-3.5 w-3.5 text-primary" />
            <span className="hidden xl:inline text-[11px] font-medium">Cari...</span>
            <kbd className={cn(
              "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono border",
              theme === 'liquid' ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-muted text-muted-foreground border-border/60"
            )}>
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* Mobile search trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            className={cn(
              "rounded-xl sm:hidden h-9 w-9 text-muted-foreground hover:text-primary shrink-0",
              theme === 'liquid' && "rounded-full bg-white/70 text-slate-700"
            )}
            aria-label="Buka Pencarian Cepat"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Mobile CLI trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              play('tab');
              window.dispatchEvent(new CustomEvent('open-dev-terminal'));
            }}
            className={cn(
              "rounded-xl sm:hidden h-9 w-9 text-muted-foreground hover:text-emerald-400 shrink-0",
              theme === 'liquid' && "rounded-full bg-white/70 text-slate-700"
            )}
            aria-label="Buka Developer Terminal"
            title="Developer Terminal"
          >
            <Terminal className="h-4 w-4 text-emerald-500" />
          </Button>

          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            {/* Sound FX Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 shrink-0 relative transition-all",
                theme === 'liquid'
                  ? "rounded-full bg-white/70 hover:bg-white text-slate-700 border border-white/80 shadow-[0_2px_8px_rgba(0,122,255,0.08),inset_0_1px_0.5px_white]"
                  : "rounded-xl"
              )}
              onClick={() => {
                toggleSound();
                if (!soundEnabled) {
                  setTimeout(() => play('success'), 50);
                }
                notifyDynamicIsland({
                  title: !soundEnabled ? "Audio FX: Aktif" : "Audio FX: Mode Hening",
                  subtitle: !soundEnabled ? "Efek audio interaktif dinyalakan" : "Efek audio interaktif dimatikan",
                  icon: !soundEnabled ? "sound-on" : "sound-off",
                });
              }}
              title={soundEnabled ? (language === 'id' ? 'Matikan Suara UI (M)' : 'Mute UI Sound (M)') : (language === 'id' ? 'Nyalakan Suara UI (M)' : 'Unmute UI Sound (M)')}
              aria-label={soundEnabled ? 'Mute sound FX' : 'Unmute sound FX'}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-primary" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground opacity-60" />
              )}
            </Button>

            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-9 w-9 shrink-0 transition-all",
                    theme === 'liquid'
                      ? "rounded-full bg-white/70 hover:bg-white text-slate-700 border border-white/80 shadow-[0_2px_8px_rgba(0,122,255,0.08),inset_0_1px_0.5px_white]"
                      : "rounded-xl"
                  )} 
                  aria-label="Change language"
                >
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className={cn(
                  "rounded-2xl p-2 z-50",
                  theme === 'liquid'
                    ? "bg-white/95 backdrop-blur-2xl border border-white/90 shadow-[0_16px_40px_-10px_rgba(15,23,42,0.15)] text-slate-900"
                    : "border-none shadow-2xl bg-card/95 backdrop-blur-sm"
                )}
              >
                <DropdownMenuItem 
                  onSelect={() => {
                    play('click');
                    setLanguage('en');
                    notifyDynamicIsland({
                      title: "English Selected",
                      subtitle: "Interface language updated",
                      icon: "globe",
                    });
                  }} 
                  onClick={() => {
                    play('click');
                    setLanguage('en');
                    notifyDynamicIsland({
                      title: "English Selected",
                      subtitle: "Interface language updated",
                      icon: "globe",
                    });
                  }} 
                  className={cn(
                    "rounded-xl font-bold uppercase text-xs tracking-wider px-4 py-2.5 cursor-pointer",
                    theme === 'liquid' ? "hover:bg-slate-100 text-slate-800" : ""
                  )}
                >
                  English {language === 'en' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={() => {
                    play('click');
                    setLanguage('id');
                    notifyDynamicIsland({
                      title: "Bahasa Indonesia",
                      subtitle: "Bahasa antarmuka diperbarui",
                      icon: "globe",
                    });
                  }} 
                  onClick={() => {
                    play('click');
                    setLanguage('id');
                    notifyDynamicIsland({
                      title: "Bahasa Indonesia",
                      subtitle: "Bahasa antarmuka diperbarui",
                      icon: "globe",
                    });
                  }} 
                  className={cn(
                    "rounded-xl font-bold uppercase text-xs tracking-wider px-4 py-2.5 cursor-pointer",
                    theme === 'liquid' ? "hover:bg-slate-100 text-slate-800" : ""
                  )}
                >
                  Indonesia {language === 'id' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "shrink-0 gap-1.5 sm:gap-2 font-semibold text-xs tracking-tight transition-all",
                    theme === 'liquid'
                      ? "h-9 rounded-full px-2.5 sm:px-3 bg-white/75 hover:bg-white text-slate-800 border border-white/90 shadow-[0_2px_8px_rgba(0,122,255,0.10),inset_0_1px_0.5px_white]"
                      : "h-9 rounded-xl px-2.5 sm:px-3 hover:bg-primary/10 text-foreground"
                  )} 
                  aria-label="Change theme"
                >
                  <Palette className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="flex items-center gap-1 shrink-0">
                    <span className="w-2 h-2 rounded-full ring-1 ring-black/15 shadow-xs" style={{ backgroundColor: THEME_CONFIGS[theme]?.colors.primary }} />
                    <span className="w-2 h-2 rounded-full ring-1 ring-black/15 shadow-xs" style={{ backgroundColor: THEME_CONFIGS[theme]?.colors.accent }} />
                  </span>
                  <span className="hidden xl:inline max-w-[100px] truncate font-bold">
                    {THEME_CONFIGS[theme]?.name[language] || theme}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className={cn(
                  "w-80 max-h-[85vh] overflow-y-auto p-3.5 rounded-3xl border shadow-2xl space-y-3 no-scrollbar z-50",
                  theme === 'liquid'
                    ? "bg-white/95 backdrop-blur-2xl border-white/90 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.18),0_0_0_1px_rgba(0,122,255,0.08),inset_0_1.5px_1px_white] text-slate-900"
                    : "border-border/80 bg-card/95 backdrop-blur-xl text-card-foreground"
                )}
              >
                {/* Header */}
                <div className={cn(
                  "flex items-center justify-between px-2 pt-1 pb-1.5 border-b",
                  theme === 'liquid' ? "border-slate-200/60" : "border-border/40"
                )}>
                  <span className={cn(
                    "text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5",
                    theme === 'liquid' ? "text-slate-600" : "text-muted-foreground"
                  )}>
                    <Palette className="h-3.5 w-3.5 text-primary" />
                    {language === 'id' ? 'Tema Tampilan' : 'Appearance'}
                  </span>
                  {isAutoTheme && (
                    <span className={cn(
                      "text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border",
                      theme === 'liquid' 
                        ? "bg-blue-50 text-blue-600 border-blue-200" 
                        : "bg-primary/10 text-primary border-primary/20"
                    )}>
                      Auto Mode
                    </span>
                  )}
                </div>

                {/* Standard Themes */}
                <div>
                  <p className={cn(
                    "text-[11px] font-bold uppercase tracking-wider px-2 mb-1.5",
                    theme === 'liquid' ? "text-slate-500" : "text-muted-foreground/80"
                  )}>
                    {language === 'id' ? 'Koleksi Standar' : 'Standard Collection'}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['light', 'dark'] as Theme[]).map((tName) => {
                      const cfg = THEME_CONFIGS[tName];
                      const isCurrent = theme === tName;
                      return (
                        <DropdownMenuItem
                          key={tName}
                          onClick={() => handleThemeSelect(tName)}
                          className={cn(
                            "rounded-2xl p-2.5 cursor-pointer transition-all outline-none border flex flex-col items-start gap-1.5",
                            isCurrent
                              ? theme === 'liquid'
                                ? "bg-blue-50/90 border-blue-200/90 text-blue-600 font-bold shadow-xs"
                                : "bg-primary/15 border-primary/40 text-primary font-bold shadow-sm"
                              : theme === 'liquid'
                                ? "hover:bg-slate-100/70 border-transparent text-slate-800"
                                : "hover:bg-muted/60 border-transparent text-foreground"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className={cn(
                              "flex items-center gap-1 px-1.5 py-0.5 rounded-full border shrink-0",
                              theme === 'liquid' ? "bg-slate-100/80 border-slate-200/80" : "bg-background/80 border-border/60"
                            )}>
                              <span className="w-2 h-2 rounded-full ring-1 ring-black/15 shadow-xs" style={{ backgroundColor: cfg.colors.bg }} />
                              <span className="w-2 h-2 rounded-full ring-1 ring-black/15 shadow-xs" style={{ backgroundColor: cfg.colors.primary }} />
                              <span className="w-2 h-2 rounded-full ring-1 ring-black/15 shadow-xs" style={{ backgroundColor: cfg.colors.accent }} />
                            </div>
                            {isCurrent && <Check className="h-3.5 w-3.5 text-primary" />}
                          </div>
                          <div className="text-left w-full">
                            <p className="text-xs font-bold leading-none">{cfg.name[language]}</p>
                            <p className={cn(
                              "text-[10px] line-clamp-1 mt-0.5",
                              theme === 'liquid' ? "text-slate-500" : "text-muted-foreground"
                            )}>{cfg.description[language]}</p>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                </div>

                {/* Modern Aesthetic Themes */}
                <div>
                  <p className={cn(
                    "text-[11px] font-bold uppercase tracking-wider px-2 mb-1.5",
                    theme === 'liquid' ? "text-slate-500" : "text-muted-foreground/80"
                  )}>
                    {language === 'id' ? 'Koleksi Estetika Modern' : 'Modern Aesthetics'}
                  </p>
                  <div className="space-y-1.5">
                    {(['catppuccin', 'sunset', 'liquid'] as Theme[]).map((tName) => {
                      const cfg = THEME_CONFIGS[tName];
                      const isCurrent = theme === tName;
                      return (
                        <DropdownMenuItem
                          key={tName}
                          onClick={() => handleThemeSelect(tName)}
                          className={cn(
                            "rounded-2xl p-2.5 cursor-pointer transition-all outline-none border flex items-center justify-between gap-2.5",
                            isCurrent
                              ? theme === 'liquid'
                                ? "bg-blue-50/90 border-blue-200/90 text-blue-600 font-bold shadow-xs"
                                : "bg-primary/15 border-primary/40 text-primary font-bold shadow-sm"
                              : theme === 'liquid'
                                ? "hover:bg-slate-100/70 border-transparent text-slate-800"
                                : "hover:bg-muted/60 border-transparent text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={cn(
                              "flex items-center gap-1 px-1.5 py-0.5 rounded-full border shrink-0",
                              theme === 'liquid' ? "bg-slate-100/80 border-slate-200/80" : "bg-background/80 border-border/60"
                            )}>
                              <span className="w-2 h-2 rounded-full ring-1 ring-black/15 shadow-xs" style={{ backgroundColor: cfg.colors.bg }} />
                              <span className="w-2 h-2 rounded-full ring-1 ring-black/15 shadow-xs" style={{ backgroundColor: cfg.colors.primary }} />
                              <span className="w-2 h-2 rounded-full ring-1 ring-black/15 shadow-xs" style={{ backgroundColor: cfg.colors.accent }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold leading-none flex items-center gap-1.5 truncate">
                                <span>{cfg.name[language]}</span>
                                {cfg.emoji && <span className="text-xs">{cfg.emoji}</span>}
                              </p>
                              <p className={cn(
                                "text-[10px] truncate mt-0.5",
                                theme === 'liquid' ? "text-slate-500" : "text-muted-foreground"
                              )}>{cfg.description[language]}</p>
                            </div>
                          </div>
                          {isCurrent && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                </div>

                {/* Seasonal Themes */}
                <div>
                  <p className={cn(
                    "text-[11px] font-bold uppercase tracking-wider px-2 mb-1.5",
                    theme === 'liquid' ? "text-slate-500" : "text-muted-foreground/80"
                  )}>
                    {language === 'id' ? 'Edisi Musiman & Hari Raya' : 'Seasonal & Holidays'}
                  </p>
                  <div className="space-y-1.5">
                    {(['ramadan', 'imlek', 'natal'] as Theme[]).map((tName) => {
                      const cfg = THEME_CONFIGS[tName];
                      const isCurrent = theme === tName;
                      return (
                        <DropdownMenuItem
                          key={tName}
                          onClick={() => handleThemeSelect(tName)}
                          className={cn(
                            "rounded-2xl p-2.5 cursor-pointer transition-all outline-none border flex items-center justify-between gap-2.5",
                            isCurrent
                              ? theme === 'liquid'
                                ? "bg-blue-50/90 border-blue-200/90 text-blue-600 font-bold shadow-xs"
                                : "bg-primary/15 border-primary/40 text-primary font-bold shadow-sm"
                              : theme === 'liquid'
                                ? "hover:bg-slate-100/70 border-transparent text-slate-800"
                                : "hover:bg-muted/60 border-transparent text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={cn(
                              "flex items-center gap-1 px-1.5 py-0.5 rounded-full border shrink-0",
                              theme === 'liquid' ? "bg-slate-100/80 border-slate-200/80" : "bg-background/80 border-border/60"
                            )}>
                              <span className="w-2 h-2 rounded-full ring-1 ring-black/15 shadow-xs" style={{ backgroundColor: cfg.colors.bg }} />
                              <span className="w-2 h-2 rounded-full ring-1 ring-black/15 shadow-xs" style={{ backgroundColor: cfg.colors.primary }} />
                              <span className="w-2 h-2 rounded-full ring-1 ring-black/15 shadow-xs" style={{ backgroundColor: cfg.colors.accent }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold leading-none flex items-center gap-1.5 truncate">
                                <span>{cfg.name[language]}</span>
                                {cfg.emoji && <span className="text-xs">{cfg.emoji}</span>}
                              </p>
                              <p className={cn(
                                "text-[10px] truncate mt-0.5",
                                theme === 'liquid' ? "text-slate-500" : "text-muted-foreground"
                              )}>{cfg.description[language]}</p>
                            </div>
                          </div>
                          {isCurrent && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                </div>

                {/* Auto-Detect Switch */}
                <div 
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-2xl transition-colors cursor-pointer border",
                    theme === 'liquid'
                      ? "bg-slate-100/60 hover:bg-slate-100/90 border-slate-200/70 text-slate-800"
                      : "bg-muted/40 hover:bg-muted/70 border-border/50 text-foreground"
                  )} 
                  onClick={(e) => {
                    e.preventDefault();
                    setAutoTheme(!isAutoTheme);
                  }}
                >
                  <div className="flex flex-col pr-2">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      {language === 'id' ? 'Auto-Detect Cerdas' : 'Smart Auto-Detect'}
                    </span>
                    <span className={cn(
                      "text-[10px]",
                      theme === 'liquid' ? "text-slate-500" : "text-muted-foreground"
                    )}>
                      {language === 'id' ? 'Sesuaikan musiman & mode gelap OS' : 'Match seasonal events & OS dark mode'}
                    </span>
                  </div>
                  <div className={cn(
                    "w-9 h-5 rounded-full transition-colors relative shrink-0",
                    isAutoTheme ? "bg-primary" : "bg-muted-foreground/30"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-background shadow-md transition-all",
                      isAutoTheme ? "left-[18px]" : "left-0.5"
                    )} />
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={cn(
          "md:hidden animate-in slide-in-from-top duration-500 overflow-hidden shadow-2xl pointer-events-auto",
          theme === 'liquid'
            ? "mx-auto max-w-md mt-2 rounded-[2rem] bg-white/95 backdrop-blur-2xl border border-white/90 ring-1 ring-blue-400/30 shadow-2xl"
            : "bg-background/95 backdrop-blur-sm border-b rounded-b-[2rem] sm:rounded-b-[3rem]"
        )}>
          <div className="flex flex-col p-6 sm:p-8 gap-4 sm:gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href}
                onClick={(e) => { play('tab'); handleSmoothScroll(e, item.href); }}
                className="text-xl sm:text-2xl font-black uppercase tracking-tight p-2 hover:text-primary transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 sm:gap-4 py-4 border-t border-border/10 flex-wrap">
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={() => { 
                   play('click'); 
                   const nextLang = language === 'id' ? 'en' : 'id';
                   setLanguage(nextLang); 
                   notifyDynamicIsland({
                     title: nextLang === 'id' ? "Bahasa Indonesia" : "English Selected",
                     subtitle: nextLang === 'id' ? "Bahasa antarmuka diperbarui" : "Interface language updated",
                     icon: "globe",
                   });
                 }} 
                 className="rounded-xl h-12 w-12 sm:h-14 sm:w-14 bg-muted/50" 
                 aria-label="Toggle language"
               >
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
               </Button>

               <Button
                 variant="ghost"
                 size="icon"
                 onClick={() => {
                   toggleSound();
                   if (!soundEnabled) {
                     setTimeout(() => play('success'), 50);
                   }
                   notifyDynamicIsland({
                     title: !soundEnabled ? "Audio FX: Aktif" : "Audio FX: Mode Hening",
                     subtitle: !soundEnabled ? "Efek audio interaktif dinyalakan" : "Efek audio interaktif dimatikan",
                     icon: !soundEnabled ? "sound-on" : "sound-off",
                   });
                 }}
                 className="rounded-xl h-12 w-12 sm:h-14 sm:w-14 bg-muted/50"
                 aria-label={soundEnabled ? 'Mute sound FX' : 'Unmute sound FX'}
               >
                 {soundEnabled ? (
                   <Volume2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                 ) : (
                   <VolumeX className="h-5 w-5 sm:h-6 sm:w-6 opacity-60" />
                 )}
               </Button>

               <Button
                 variant="ghost"
                 size="icon"
                 onClick={() => {
                   play('tab');
                   setIsMobileMenuOpen(false);
                   window.dispatchEvent(new CustomEvent('open-dev-terminal'));
                 }}
                 className="rounded-xl h-12 w-12 sm:h-14 sm:w-14 bg-muted/50 text-emerald-500"
                 aria-label="Buka Developer Terminal"
                 title="Developer Terminal"
               >
                 <Terminal className="h-5 w-5 sm:h-6 sm:w-6" />
               </Button>

               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 sm:h-14 sm:w-14 bg-muted/50" aria-label="Toggle theme">
                    <Palette className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className={cn(
                    "w-72 sm:w-80 max-h-[75vh] overflow-y-auto p-3.5 rounded-3xl border shadow-2xl space-y-2.5 no-scrollbar z-50",
                    theme === 'liquid'
                      ? "bg-white/95 backdrop-blur-2xl border-white/90 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.18),0_0_0_1px_rgba(0,122,255,0.08),inset_0_1.5px_1px_white] text-slate-900"
                      : "border-border/80 bg-card/95 backdrop-blur-xl text-card-foreground"
                  )}
                >
                  <p className={cn(
                    "text-xs font-bold uppercase tracking-wider px-2",
                    theme === 'liquid' ? "text-slate-500" : "text-muted-foreground"
                  )}>
                    {language === 'id' ? 'Pilih Tema' : 'Select Theme'}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {themes.map((tName) => {
                      const cfg = THEME_CONFIGS[tName];
                      const isCurrent = theme === tName;
                      return (
                        <DropdownMenuItem 
                          key={tName} 
                          onClick={() => {
                            handleThemeSelect(tName);
                            setIsMobileMenuOpen(false);
                          }}
                          className={cn(
                            "rounded-2xl p-2.5 cursor-pointer transition-all border flex flex-col items-start gap-1.5",
                            isCurrent 
                              ? theme === 'liquid'
                                ? "bg-blue-50/90 border-blue-200/90 text-blue-600 font-bold shadow-xs"
                                : "bg-primary/15 border-primary/40 text-primary font-bold shadow-sm"
                              : theme === 'liquid'
                                ? "hover:bg-slate-100/70 border-transparent text-slate-800"
                                : "hover:bg-muted/60 border-transparent text-foreground"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className={cn(
                              "flex items-center gap-1 px-1.5 py-0.5 rounded-full border shrink-0",
                              theme === 'liquid' ? "bg-slate-100/80 border-slate-200/80" : "bg-background/80 border-border/60"
                            )}>
                              <span className="w-2 h-2 rounded-full ring-1 ring-black/15 shadow-xs" style={{ backgroundColor: cfg.colors.bg }} />
                              <span className="w-2 h-2 rounded-full ring-1 ring-black/15 shadow-xs" style={{ backgroundColor: cfg.colors.primary }} />
                              <span className="w-2 h-2 rounded-full ring-1 ring-black/15 shadow-xs" style={{ backgroundColor: cfg.colors.accent }} />
                            </div>
                            {cfg.emoji ? <span className="text-xs">{cfg.emoji}</span> : (isCurrent && <Check className="h-3.5 w-3.5 text-primary" />)}
                          </div>
                          <span className="text-xs font-bold leading-tight truncate">{cfg.name[language]}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
