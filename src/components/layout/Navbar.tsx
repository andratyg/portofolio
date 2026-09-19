
"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { m as motion } from 'framer-motion';
import { useLanguage } from '@/components/providers/LanguageContext';
import { useTheme, themes, THEME_CONFIGS, Theme } from '@/components/providers/ThemeContext';
import { Button } from '@/components/ui/button';
import { Globe, Palette, LogIn, Menu, X, ChevronDown, Search, Sparkles, Check, Volume2, VolumeX } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAudioFX } from '@/components/providers/AudioFXContext';
import { useProjectStore } from '@/stores/ProjectStore';
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

  const navItems = [
    { label: t.navHome, href: '/' },
    { label: t.navPortfolio, href: '#portfolio' },
    { label: t.navJourney, href: '/experience' },
    { label: t.navBlog, href: '/blog' },
    { label: t.navContact, href: '/contact' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b transition-transform duration-700 ease-in-out",
      isVisible ? "translate-y-0" : "-translate-y-full"
    )}>
      <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <motion.a 
            href="/" 
            onClick={handleLogoClick}
            className="text-3xl font-black text-primary cursor-pointer tracking-normal"
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.95, rotate: 10, y: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            NAT
          </motion.a>
          
          <div className="hidden md:flex gap-8 relative">
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
                    "relative text-xs font-bold uppercase tracking-[0.16em] transition-colors duration-200 py-2",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 right-0 h-0.5 bg-primary transition-all duration-300 pointer-events-none",
                      isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                    )}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Spotlight Search / Command Palette Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl h-9 px-3 text-xs text-muted-foreground hover:text-foreground border-border/60 glass-card hover:border-primary/40 transition-all"
            aria-label="Buka Pencarian Cepat"
          >
            <Search className="h-3.5 w-3.5 text-primary" />
            <span className="hidden xl:inline text-[11px] font-medium">Cari...</span>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground border border-border/60">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* Mobile search trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            className="rounded-xl sm:hidden h-9 w-9 text-muted-foreground hover:text-primary"
            aria-label="Buka Pencarian Cepat"
          >
            <Search className="h-4 w-4" />
          </Button>

          <div className="hidden sm:flex items-center gap-2">
            {/* Sound FX Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl relative"
              onClick={() => {
                toggleSound();
                if (!soundEnabled) {
                  setTimeout(() => play('success'), 50);
                }
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
                <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Change language">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-sm p-2">
                <DropdownMenuItem 
                  onSelect={() => { play('click'); setLanguage('en'); }} 
                  onClick={() => { play('click'); setLanguage('en'); }} 
                  className="rounded-xl font-bold uppercase text-xs tracking-wider px-4 py-2.5 cursor-pointer"
                >
                  English {language === 'en' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={() => { play('click'); setLanguage('id'); }} 
                  onClick={() => { play('click'); setLanguage('id'); }} 
                  className="rounded-xl font-bold uppercase text-xs tracking-wider px-4 py-2.5 cursor-pointer"
                >
                  Indonesia {language === 'id' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-xl gap-2 font-bold uppercase text-xs tracking-wider px-4 hover:bg-primary/10" aria-label="Change theme">
                  <Palette className="h-4 w-4 text-primary" />
                  <span className="hidden lg:inline">{THEME_CONFIGS[theme]?.name[language] || theme}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-[85vh] overflow-y-auto p-3.5 rounded-3xl border border-border/80 shadow-2xl bg-card/95 backdrop-blur-xl space-y-3 no-scrollbar">
                {/* Header */}
                <div className="flex items-center justify-between px-2 pt-1 pb-0.5 border-b border-border/40">
                  <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-primary" />
                    {language === 'id' ? 'Tema Tampilan' : 'Appearance'}
                  </span>
                  {isAutoTheme && (
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Auto Mode
                    </span>
                  )}
                </div>

                {/* Standard Themes */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2 mb-1.5">
                    {language === 'id' ? 'Koleksi Standar' : 'Standard Collection'}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['light', 'dark'] as Theme[]).map((tName) => {
                      const cfg = THEME_CONFIGS[tName];
                      const isCurrent = theme === tName;
                      return (
                        <DropdownMenuItem
                          key={tName}
                          onClick={() => { play('toggle'); setTheme(tName, true); }}
                          className={cn(
                            "rounded-2xl p-2.5 cursor-pointer transition-all outline-none border flex flex-col items-start gap-1.5",
                            isCurrent
                              ? "bg-primary/15 border-primary/40 text-primary font-bold shadow-sm"
                              : "hover:bg-muted/60 border-transparent text-foreground"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center -space-x-1 p-0.5 rounded-full bg-background/80 border border-border/60">
                              <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: cfg.colors.bg }} />
                              <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: cfg.colors.primary }} />
                              <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: cfg.colors.accent }} />
                            </div>
                            {isCurrent && <Check className="h-3.5 w-3.5 text-primary" />}
                          </div>
                          <div className="text-left w-full">
                            <p className="text-xs font-bold leading-none">{cfg.name[language]}</p>
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{cfg.description[language]}</p>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                </div>

                {/* Modern Aesthetic Themes */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2 mb-1.5">
                    {language === 'id' ? 'Koleksi Estetika Modern' : 'Modern Aesthetics'}
                  </p>
                  <div className="space-y-1.5">
                    {(['catppuccin', 'sunset', 'liquid'] as Theme[]).map((tName) => {
                      const cfg = THEME_CONFIGS[tName];
                      const isCurrent = theme === tName;
                      return (
                        <DropdownMenuItem
                          key={tName}
                          onClick={() => { play('toggle'); setTheme(tName, true); }}
                          className={cn(
                            "rounded-2xl p-2.5 cursor-pointer transition-all outline-none border flex items-center justify-between gap-2.5",
                            isCurrent
                              ? "bg-primary/15 border-primary/40 text-primary font-bold shadow-sm"
                              : "hover:bg-muted/60 border-transparent text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex items-center -space-x-1 p-0.5 rounded-full bg-background/80 border border-border/60 shrink-0">
                              <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: cfg.colors.bg }} />
                              <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: cfg.colors.primary }} />
                              <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: cfg.colors.accent }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold leading-none flex items-center gap-1.5 truncate">
                                <span>{cfg.name[language]}</span>
                                {cfg.emoji && <span className="text-xs">{cfg.emoji}</span>}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{cfg.description[language]}</p>
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
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2 mb-1.5">
                    {language === 'id' ? 'Edisi Musiman & Hari Raya' : 'Seasonal & Holidays'}
                  </p>
                  <div className="space-y-1.5">
                    {(['ramadan', 'imlek', 'natal'] as Theme[]).map((tName) => {
                      const cfg = THEME_CONFIGS[tName];
                      const isCurrent = theme === tName;
                      return (
                        <DropdownMenuItem
                          key={tName}
                          onClick={() => { play('toggle'); setTheme(tName, true); }}
                          className={cn(
                            "rounded-2xl p-2.5 cursor-pointer transition-all outline-none border flex items-center justify-between gap-2.5",
                            isCurrent
                              ? "bg-primary/15 border-primary/40 text-primary font-bold shadow-sm"
                              : "hover:bg-muted/60 border-transparent text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex items-center -space-x-1 p-0.5 rounded-full bg-background/80 border border-border/60 shrink-0">
                              <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: cfg.colors.bg }} />
                              <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: cfg.colors.primary }} />
                              <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: cfg.colors.accent }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold leading-none flex items-center gap-1.5 truncate">
                                <span>{cfg.name[language]}</span>
                                {cfg.emoji && <span className="text-xs">{cfg.emoji}</span>}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{cfg.description[language]}</p>
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
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer border border-border/50" 
                  onClick={(e) => {
                    e.preventDefault();
                    setAutoTheme(!isAutoTheme);
                  }}
                >
                  <div className="flex flex-col pr-2">
                    <span className="text-xs text-foreground font-bold flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      {language === 'id' ? 'Auto-Detect Cerdas' : 'Smart Auto-Detect'}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
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
        <div className="md:hidden bg-background/95 backdrop-blur-sm border-b animate-in slide-in-from-top duration-500 overflow-hidden rounded-b-[2rem] sm:rounded-b-[3rem] shadow-2xl">
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
               <Button variant="ghost" size="icon" onClick={() => { play('click'); setLanguage(language === 'id' ? 'en' : 'id'); }} className="rounded-xl h-12 w-12 sm:h-14 sm:w-14 bg-muted/50" aria-label="Toggle language">
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

               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 sm:h-14 sm:w-14 bg-muted/50" aria-label="Toggle theme">
                    <Palette className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 sm:w-80 max-h-[75vh] overflow-y-auto p-3.5 rounded-3xl border border-border/80 shadow-2xl bg-card/95 backdrop-blur-xl space-y-2.5 no-scrollbar">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
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
                            setTheme(tName, true);
                            setIsMobileMenuOpen(false);
                          }}
                          className={cn(
                            "rounded-2xl p-2.5 cursor-pointer transition-all border flex flex-col items-start gap-1.5",
                            isCurrent 
                              ? "bg-primary/15 border-primary/40 text-primary font-bold" 
                              : "hover:bg-muted/60 border-transparent text-foreground"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center -space-x-1 p-0.5 rounded-full bg-background/80 border border-border/60">
                              <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: cfg.colors.bg }} />
                              <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: cfg.colors.primary }} />
                              <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: cfg.colors.accent }} />
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
