"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { useTheme, themes } from './ThemeContext';
import { Button } from './ui/button';
import { Globe, Palette, LogIn, Menu, X } from 'lucide-react';
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
      "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b transition-transform duration-500 ease-in-out",
      isVisible ? "translate-y-0" : "-translate-y-full"
    )}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link 
            href="/" 
            onClick={handleLogoClick}
            className="text-2xl font-bold font-headline text-primary hover:scale-110 transition-transform cursor-pointer"
          >
            NAT
          </Link>
          
          <div className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>English {language === 'en' && '✓'}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('id')}>Indonesia {language === 'id' && '✓'}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Palette className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="grid grid-cols-2 gap-1 w-56 p-2">
              {themes.map((tName) => (
                <DropdownMenuItem 
                  key={tName} 
                  onClick={() => setTheme(tName)}
                  className={cn(
                    "capitalize rounded-xl gap-2",
                    theme === tName && "bg-primary/10 text-primary font-bold"
                  )}
                >
                  <div className={cn("w-4 h-4 rounded-full shadow-sm", getThemeColor(tName))} />
                  {tName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/admin/login">
            <Button variant="outline" size="sm" className="hidden md:flex gap-2">
              <LogIn className="h-4 w-4" />
              {t.navAdmin}
            </Button>
          </Link>

          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-4 gap-4">
            {navItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium p-2 hover:bg-muted rounded-md"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/admin/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <LogIn className="h-4 w-4" />
                {t.navAdmin}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
