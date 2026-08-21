"use client"

import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProjectStoreProvider, useProjectStore } from '@/stores/ProjectStore';
import { useLanguage } from '@/components/providers/LanguageContext';
import { 
  BookOpen, Clock, ArrowLeft, Search, Tag, Calendar, 
  ArrowRight, Sparkles, Newspaper, User, Filter, X 
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { m as motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BlogPost } from '@/lib/types';

function BlogListContent() {
  const { language, t } = useLanguage();
  const { blogs, isLoading } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Extract unique tags from all blogs
  const allTags = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach(b => {
      if (Array.isArray(b.tags)) {
        b.tags.forEach(tag => {
          if (tag && tag.trim()) set.add(tag.trim());
        });
      }
    });
    return Array.from(set);
  }, [blogs]);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter(b => {
      const title = language === 'id' ? (b.titleId || b.titleEn) : (b.titleEn || b.titleId);
      const summary = language === 'id' ? (b.summaryId || b.summaryEn) : (b.summaryEn || b.summaryId);
      const content = language === 'id' ? (b.contentId || b.contentEn) : (b.contentEn || b.contentId);
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = !query || 
        title.toLowerCase().includes(query) ||
        summary.toLowerCase().includes(query) ||
        content.toLowerCase().includes(query) ||
        (Array.isArray(b.tags) && b.tags.some(t => t.toLowerCase().includes(query)));

      const matchesTag = selectedTag === 'all' || 
        (Array.isArray(b.tags) && b.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    }).sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      return dateB - dateA;
    });
  }, [blogs, language, searchQuery, selectedTag]);

  // Featured article (first featured article or first article)
  const featuredBlog = useMemo(() => {
    if (searchQuery || selectedTag !== 'all') return null;
    return blogs.find(b => b.featured) || (blogs.length > 0 ? blogs[0] : null);
  }, [blogs, searchQuery, selectedTag]);

  const regularBlogs = useMemo(() => {
    if (!featuredBlog || searchQuery || selectedTag !== 'all') return filteredBlogs;
    return filteredBlogs.filter(b => b.id !== featuredBlog.id);
  }, [filteredBlogs, featuredBlog, searchQuery, selectedTag]);

  return (
    <div className="min-h-screen selection:bg-primary selection:text-primary-foreground flex flex-col justify-between">
      <div>
        <Navbar />
        
        {/* Background glow accents */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[140px]" />
          <div className="absolute top-96 right-10 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        <section className="pt-28 pb-16 md:pt-36 md:pb-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6">
            
            {/* Back link */}
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-10 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              {language === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
            </Link>

            {/* Header */}
            <div className="text-center mb-12 md:mb-16 space-y-4 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-primary text-[10px] font-black tracking-widest uppercase border border-primary/20 shadow-lg shadow-primary/5">
                <BookOpen className="h-3.5 w-3.5" />
                BLOG & INSIGHTS
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase">
                {t.blogTitle}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {t.blogSubtitle}
              </p>
            </div>

            {/* Search & Tag Filter Bar */}
            <div className="max-w-3xl mx-auto mb-14 space-y-6">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t.searchBlogPlaceholder}
                  className="h-14 sm:h-16 pl-14 pr-12 rounded-2xl bg-card/80 backdrop-blur-md border border-border shadow-xl text-sm sm:text-base transition-all focus:border-primary/50"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Tag Chips */}
              {allTags.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground shrink-0 mr-1 flex items-center gap-1">
                    <Filter className="h-3 w-3" /> Topik:
                  </span>
                  <button
                    onClick={() => setSelectedTag('all')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0",
                      selectedTag === 'all'
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-card/80 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                    )}
                  >
                    Semua ({blogs.length})
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0",
                        selectedTag === tag
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-card/80 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                      )}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Display */}
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-96 rounded-[2.5rem] bg-muted/20 animate-pulse border border-border/50" />
                ))}
              </div>
            ) : filteredBlogs.length === 0 ? (
              /* Empty state */
              <div className="max-w-md mx-auto text-center py-16">
                <div className="glass-card p-12 space-y-6 rounded-[2.5rem] border border-border">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase">
                      {searchQuery || selectedTag !== 'all' ? t.noBlogFound : (language === 'id' ? 'Belum Ada Artikel' : 'No Articles Yet')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery || selectedTag !== 'all'
                        ? t.noBlogFoundHint 
                        : (language === 'id' ? 'Artikel pertama sedang disiapkan. Pantau terus ya!' : 'The first articles are being prepared. Stay tuned!')}
                    </p>
                  </div>
                  {(searchQuery || selectedTag !== 'all') && (
                    <Button 
                      variant="outline" 
                      onClick={() => { setSearchQuery(''); setSelectedTag('all'); }} 
                      className="rounded-2xl font-black uppercase text-xs"
                    >
                      Reset Filter
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto space-y-12">
                
                {/* Spotlight / Featured Hero Post */}
                {featuredBlog && (
                  <div className="rounded-[2.5rem] overflow-hidden bg-card border border-border shadow-2xl group hover:border-primary/40 transition-all duration-300">
                    <div className="grid lg:grid-cols-12 gap-0">
                      <div className="lg:col-span-6 relative aspect-video lg:aspect-auto min-h-[280px] sm:min-h-[340px] bg-muted overflow-hidden">
                        {featuredBlog.coverImage ? (
                          <img 
                            src={featuredBlog.coverImage} 
                            alt={featuredBlog.titleId} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
                            <BookOpen className="h-20 w-20 text-primary/40" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 z-10 flex gap-2">
                          <Badge className="bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-xl shadow-lg flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> FEATURED
                          </Badge>
                        </div>
                      </div>

                      <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-bold">
                            <span className="flex items-center gap-1.5 text-primary">
                              <Clock className="h-3.5 w-3.5" />
                              {featuredBlog.readingTime || '3 min read'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(featuredBlog.publishedAt || Date.now()).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                            <Link href={`/blog/${featuredBlog.slug}`}>
                              {language === 'id' ? (featuredBlog.titleId || featuredBlog.titleEn) : (featuredBlog.titleEn || featuredBlog.titleId)}
                            </Link>
                          </h2>

                          <p className="text-muted-foreground text-sm sm:text-base line-clamp-3 leading-relaxed">
                            {language === 'id' ? (featuredBlog.summaryId || featuredBlog.summaryEn) : (featuredBlog.summaryEn || featuredBlog.summaryId)}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/60">
                          <div className="flex flex-wrap gap-1.5">
                            {featuredBlog.tags?.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg bg-muted text-muted-foreground">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <Link href={`/blog/${featuredBlog.slug}`}>
                            <Button className="rounded-xl font-black uppercase text-xs tracking-wider gap-2 w-full sm:w-auto shadow-lg shadow-primary/10">
                              {t.readArticle} <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Regular Articles Grid */}
                {regularBlogs.length > 0 && (
                  <div className="space-y-6">
                    {featuredBlog && !searchQuery && selectedTag === 'all' && (
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground px-2">
                        {language === 'id' ? 'Artikel Lainnya' : 'More Articles'}
                      </h3>
                    )}

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {regularBlogs.map(b => {
                        const title = language === 'id' ? (b.titleId || b.titleEn) : (b.titleEn || b.titleId);
                        const summary = language === 'id' ? (b.summaryId || b.summaryEn) : (b.summaryEn || b.summaryId);

                        return (
                          <Card 
                            key={b.id} 
                            className="rounded-[2rem] overflow-hidden bg-card border border-border shadow-xl hover:shadow-2xl hover:border-primary/40 transition-all duration-300 flex flex-col group"
                          >
                            <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                              {b.coverImage ? (
                                <img 
                                  src={b.coverImage} 
                                  alt={title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 to-muted">
                                  <BookOpen className="h-12 w-12 text-primary/30" />
                                </div>
                              )}
                              <div className="absolute top-3 right-3">
                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-background/80 backdrop-blur-md border border-border/50 text-foreground">
                                  {b.readingTime || '3 min'}
                                </span>
                              </div>
                            </div>

                            <CardContent className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(b.publishedAt || Date.now()).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                  {b.author && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate">{b.author}</span>
                                    </>
                                  )}
                                </div>

                                <h3 className="text-xl font-black uppercase tracking-tight leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                  <Link href={`/blog/${b.slug}`}>
                                    {title}
                                  </Link>
                                </h3>

                                <p className="text-muted-foreground text-xs sm:text-sm line-clamp-3 leading-relaxed">
                                  {summary}
                                </p>
                              </div>

                              <div className="space-y-4 pt-4 border-t border-border/40">
                                <div className="flex flex-wrap gap-1.5">
                                  {b.tags?.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>

                                <Link href={`/blog/${b.slug}`} className="block">
                                  <Button variant="ghost" className="w-full justify-between rounded-xl font-black uppercase text-xs tracking-wider group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    <span>{t.readArticle}</span>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default function BlogPage() {
  return (
    <ProjectStoreProvider>
      <BlogListContent />
    </ProjectStoreProvider>
  );
}
