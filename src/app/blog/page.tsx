"use client"

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ProjectStoreProvider } from '@/stores/ProjectStore';
import { useLanguage } from '@/components/providers/LanguageContext';
import { FileText, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BlogPage() {
  const { language } = useLanguage();

  return (
    <ProjectStoreProvider>
      <main className="min-h-screen selection:bg-primary selection:text-primary-foreground">
        <Navbar />
        <section className="pt-28 pb-16 md:pt-36 md:pb-24">
          <div className="container mx-auto px-4 sm:px-6">
            {/* Back link */}
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" />
              {language === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
            </Link>

            {/* Header */}
            <div className="text-center mb-12 md:mb-20 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-primary text-[10px] font-bold tracking-wider uppercase">
                <FileText className="h-3 w-3" />
                Blog
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-headline tracking-tight">
                {language === 'id' ? 'Tulisan & Artikel' : 'Articles & Writing'}
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
                {language === 'id' 
                  ? 'Pemikiran, tutorial, dan insight seputar pengembangan web dan teknologi.'
                  : 'Thoughts, tutorials, and insights about web development and technology.'}
              </p>
            </div>

            {/* Coming soon state */}
            <div className="max-w-md mx-auto text-center">
              <div className="glass-card p-12 space-y-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">
                    {language === 'id' ? 'Segera Hadir' : 'Coming Soon'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'id' 
                      ? 'Artikel pertama sedang dalam proses penulisan. Nantikan ya!'
                      : 'The first article is being written. Stay tuned!'}
                  </p>
                </div>
                <Link href="/">
                  <Button variant="outline" className="rounded-2xl gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {language === 'id' ? 'Kembali' : 'Go Back'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </ProjectStoreProvider>
  );
}
