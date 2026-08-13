
"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from './LanguageContext';
import { useTheme, themes } from './ThemeContext';
import { Button } from './ui/button';
import { Globe, Palette, LogIn, Menu, X, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useProjectStore } from './ProjectStore';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const MotionLink = motion.create(Link);

export const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme, isAutoTheme, setAutoTheme } = useTheme();
  const { toast } = useToast();
  const { user } = useUser();
  const { messages } = useProjectStore();
  const router = useRouter();
  // Only show notification badge if user is authenticated (admin logged in)
  const unreadCount = user ? messages.length : 0;
  const [logoClicks, setLogoClicks] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('/');

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

      // ScrollSpy logic
      const sections = ['portfolio', 'journey', 'contact'];
      let current = '/';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            current = `#${section}`;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogoClick = () => {
    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);
    if (newClicks === 5) {
      toast({
        title: "Admin Portal",
        description: "Redirecting...",
      });
      setLogoClicks(0);
      router.push('/admin/login');
    }
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const elementId = href.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Close mobile menu on click
      if(isMobileMenuOpen) setIsMobileMenuOpen(false);
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
      case 'dark': return 'bg-[#1a1c23]';
      case 'ramadan': return 'bg-[#15803d]';
      case 'imlek': return 'bg-[#dc2626]';
      case 'natal': return 'bg-[#ef4444]';
      default: return 'bg-[#f1f5f9]';
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-3xl border-b transition-transform duration-700 ease-in-out",
      isVisible ? "translate-y-0" : "-translate-y-full"
    )}>
      <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <MotionLink 
            href="/" 
            onClick={handleLogoClick}
            className="text-3xl font-black  text-primary cursor-pointer tracking-normal"
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.95, rotate: 10, y: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            NAT
          </MotionLink>
          
          <div className="hidden md:flex gap-8 relative">
            {navItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className={cn(
                  "relative text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-200 py-2",
                  activeSection === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                {activeSection === item.href && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-2xl p-2">
                <DropdownMenuItem onClick={() => setLanguage('en')} className="rounded-xl font-black uppercase text-[10px] tracking-widest px-4 py-2.5">English {language === 'en' && '✓'}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('id')} className="rounded-xl font-black uppercase text-[10px] tracking-widest px-4 py-2.5">Indonesia {language === 'id' && '✓'}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest px-4 hover:bg-primary/10">
                  <Palette className="h-4 w-4" />
                  <span className="hidden lg:inline">{theme}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="grid grid-cols-2 gap-1 w-80 p-4 rounded-[2.5rem] border-none shadow-2xl bg-[#0a0b0e]/95 backdrop-blur-2xl">
                {themes.map((tName) => (
                  <DropdownMenuItem 
                    key={tName} 
                    onClick={() => setTheme(tName, true)}
                    className={cn(
                      "capitalize rounded-[1.5rem] gap-4 p-3.5 cursor-pointer transition-[background-color,color,box-shadow] duration-200 outline-none focus:outline-none focus:ring-0",
                      theme === tName 
                        ? "bg-[#3b82f6] text-white font-black shadow-lg shadow-blue-500/20 focus:bg-[#3b82f6] focus:text-white" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white"
                    )}
                  >
                    <div className={cn("w-7 h-7 rounded-full shadow-inner border border-white/10 shrink-0", getThemeColor(tName))} />
                    <span className="text-[11px] font-black uppercase tracking-[0.15em] truncate">{tName}</span>
                    {theme === tName && <span className="ml-auto opacity-70">✓</span>}
                  </DropdownMenuItem>
                ))}
                
                <div className="my-2 border-t border-white/10 col-span-2" />
                
                <div className="col-span-2 flex items-center justify-between p-3.5 rounded-[1.5rem] hover:bg-white/5 transition-colors cursor-pointer outline-none select-none" onClick={(e) => {
                  e.preventDefault();
                  setAutoTheme(!isAutoTheme);
                }}>
                  <div className="flex flex-col">
                    <span className="text-sm text-white font-semibold">Auto-Detect</span>
                    <span className="text-[10px] text-muted-foreground">Sesuaikan tema dengan bulan</span>
                  </div>
                  <div className={cn(
                    "w-10 h-5 rounded-full transition-colors relative",
                    isAutoTheme ? "bg-primary" : "bg-white/10"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                      isAutoTheme ? "left-[22px]" : "left-1"
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
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-2xl border-b animate-in slide-in-from-top duration-500 overflow-hidden rounded-b-[2rem] sm:rounded-b-[3rem] shadow-2xl">
          <div className="flex flex-col p-6 sm:p-8 gap-4 sm:gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className="text-xl sm:text-2xl font-black uppercase tracking-tight p-2 hover:text-primary transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 sm:gap-4 py-4 border-t border-border/10 flex-wrap">
               <Button variant="ghost" size="icon" onClick={() => setLanguage(language === 'id' ? 'en' : 'id')} className="rounded-xl h-12 w-12 sm:h-14 sm:w-14 bg-muted/50">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
               </Button>

               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 sm:h-14 sm:w-14 bg-muted/50">
                    <Palette className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="grid grid-cols-2 gap-1 w-72 sm:w-80 p-3 sm:p-4 rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-2xl bg-[#0a0b0e]/95 backdrop-blur-2xl">
                  {themes.map((tName) => (
                    <DropdownMenuItem 
                      key={tName} 
                      onClick={() => {
                        setTheme(tName);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "capitalize rounded-[1.5rem] gap-3 p-3 cursor-pointer transition-[background-color,color,box-shadow] duration-200",
                        theme === tName 
                          ? "bg-[#3b82f6] text-white font-black shadow-lg shadow-blue-500/20" 
                          : "hover:bg-white/5 text-muted-foreground hover:text-white"
                      )}
                    >
                      <div className={cn("w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-inner border border-white/10 shrink-0", getThemeColor(tName))} />
                      <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] truncate">{tName}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>


            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
