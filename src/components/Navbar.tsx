"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { useTheme, themes } from './ThemeContext';
import { Button } from './ui/button';
import { Globe, Palette, LogIn, Menu, X, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [logoClicks, setLogoClicks] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogoClick = () => {
    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);
    if (newClicks === 5) {
      toast({
        title: "Easter Egg Found! 🎉",
        description: "You've unlocked a secret greeting! Have a creative day!",
      });
      setLogoClicks(0);
    }
  };

  const navItems = [
    { label: t.navHome, href: '/' },
    { label: t.navPortfolio, href: '#portfolio' },
    { label: t.navJourney, href: '#journey' },
    { label: t.navContact, href: '#contact' },
  ];

  const getThemeColor = (tName: string) => {
    switch(tName) {
      case 'emerald': return 'bg-emerald-500';
      case 'sunset': return 'bg-orange-500';
      case 'royal': return 'bg-purple-600';
      case 'cyber': return 'bg-cyan-400';
      case 'amber': return 'bg-amber-500';
      case 'ramadan': return 'bg-green-700';
      case 'imlek': return 'bg-red-600';
      case 'natal': return 'bg-red-500';
      case 'dark': return 'bg-slate-900';
      default: return 'bg-slate-200';
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-3xl border-b transition-transform duration-700 ease-in-out",
      isVisible ? "translate-y-0" : "-translate-y-full"
    )}>
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link 
            href="/" 
            onClick={handleLogoClick}
            className="text-3xl font-black font-headline text-primary hover:scale-110 transition-transform cursor-pointer tracking-tighter"
          >
            NAT
          </Link>
          
          <div className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href}
                className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl">
                <DropdownMenuItem onClick={() => setLanguage('en')} className="rounded-xl font-bold">English {language === 'en' && '✓'}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('id')} className="rounded-xl font-bold">Indonesia {language === 'id' && '✓'}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Switcher - OP GRID EDITION */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest px-4">
                  <Palette className="h-4 w-4" />
                  <span className="hidden lg:inline">{theme}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="grid grid-cols-2 gap-2 w-72 p-3 rounded-[2rem] border-none shadow-2xl bg-card/95 backdrop-blur-2xl">
                {themes.map((tName) => (
                  <DropdownMenuItem 
                    key={tName} 
                    onClick={() => setTheme(tName)}
                    className={cn(
                      "capitalize rounded-2xl gap-3 p-3 transition-all",
                      theme === tName ? "bg-primary text-primary-foreground font-black" : "hover:bg-muted"
                    )}
                  >
                    <div className={cn("w-6 h-6 rounded-full shadow-inner border border-white/20 shrink-0", getThemeColor(tName))} />
                    <span className="text-[10px] font-black uppercase tracking-widest truncate">{tName}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Link href="/admin/login">
            <Button variant="outline" size="sm" className="hidden md:flex gap-2 rounded-2xl border-primary/20 hover:bg-primary/10 h-10 px-6 text-[10px] font-black uppercase tracking-widest">
              <LogIn className="h-4 w-4" />
              {t.navAdmin}
            </Button>
          </Link>

          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-2xl border-b animate-in slide-in-from-top duration-500 overflow-hidden rounded-b-[3rem] shadow-2xl">
          <div className="flex flex-col p-8 gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-black font-headline uppercase tracking-tight p-2 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-4 py-4 border-t border-border/10">
               <Button variant="ghost" size="icon" onClick={() => setLanguage(language === 'id' ? 'en' : 'id')} className="rounded-xl h-14 w-14 bg-muted/50">
                  <Globe className="h-6 w-6" />
               </Button>
               <Link href="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                <Button className="w-full h-14 rounded-2xl gap-3 font-black uppercase tracking-widest">
                  <LogIn className="h-5 w-5" />
                  {t.navAdmin}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};