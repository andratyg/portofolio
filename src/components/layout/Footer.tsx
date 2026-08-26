"use client"

import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageContext';
import { Github, Linkedin, Instagram, ArrowUp } from 'lucide-react';
import { TikTokIcon } from '@/components/icons/TikTokIcon';

export const Footer = () => {
  const { t, language } = useLanguage();

  const footerLinks = [
    { label: language === 'id' ? 'Beranda' : 'Home', href: '/' },
    { label: language === 'id' ? 'Portofolio' : 'Portfolio', href: '/projects' },
    { label: language === 'id' ? 'Sertifikat' : 'Certificates', href: '/certificates' },
    { label: language === 'id' ? 'Perjalanan' : 'Experience', href: '/experience' },
    { label: language === 'id' ? 'Blog' : 'Blog', href: '/blog' },
    { label: language === 'id' ? 'Kontak' : 'Contact', href: '/contact' },
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com/naradev', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/in/nara-andra-tyaga', label: 'LinkedIn' },
    { icon: Instagram, href: 'https://instagram.com/nara.dev', label: 'Instagram' },
    { icon: TikTokIcon, href: 'https://www.tiktok.com/@naradev', label: 'TikTok' },
  ];

  return (
    <footer className="relative pt-16 pb-8 overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      {/* Background subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/3 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid sm:grid-cols-3 gap-10 sm:gap-8 mb-12">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-[10px] font-black">N</div>
              <span className="text-lg font-black">Nara Andra Tyaga</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed max-w-xs">
              {language === 'id' 
                ? 'Membangun solusi digital yang modern, cepat, dan berdampak.'
                : 'Building modern, fast, and impactful digital solutions.'}
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/90">
              {language === 'id' ? 'Tautan Cepat' : 'Quick Links'}
            </h3>
            <nav className="flex flex-col gap-2">
              {footerLinks.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/90">
              {language === 'id' ? 'Ikuti Saya' : 'Follow Me'}
            </h3>
            <div className="flex gap-3">
              {socialLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                  aria-label={link.label}
                >
                  <link.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            {t.footerCopyright}
          </p>
          {/* Tech stack badges */}
          <div className="flex flex-wrap justify-center gap-2">
            {['Next.js 15', 'React', 'TypeScript', 'Tailwind CSS', 'Firebase'].map(tech => (
              <span key={tech} className="text-[8px] font-semibold px-2 py-0.5 rounded-full border border-border/40 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors cursor-default">
                {tech}
              </span>
            ))}
          </div>
          {/* Back to top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            aria-label="Back to top"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
