"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/ProjectStore';
import { useLanguage } from '@/components/providers/LanguageContext';
import { 
  ArrowLeft, Clock, Calendar, User, Share2, Tag, 
  BookOpen, Check, ArrowRight, Sparkles, Copy, 
  Linkedin, MessageCircle, Twitter
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BlogPost, ProfileData } from '@/lib/types';
import { m as motion, useScroll, useSpring } from 'framer-motion';

interface BlogDetailClientProps {
  initialBlog: BlogPost | null;
  slug: string;
  initialProfile?: ProfileData;
}

export function BlogDetailClient({ initialBlog, slug, initialProfile }: BlogDetailClientProps) {
  const { language, t } = useLanguage();
  const { blogs, profile: storeProfile, isLoading: storeLoading } = useProjectStore();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  // Scroll reading progress indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const profile = (storeProfile && storeProfile.name) ? storeProfile : (initialProfile || storeProfile);

  const blog = useMemo(() => {
    if (blogs && blogs.length > 0) {
      const found = blogs.find(b => b.slug === slug || b.id === slug);
      if (found) return found;
    }
    return initialBlog;
  }, [blogs, slug, initialBlog]);

  const relatedBlogs = useMemo(() => {
    if (!blog || !blogs || blogs.length === 0) return [];
    return blogs
      .filter(b => b.id !== blog.id && b.slug !== blog.slug)
      .slice(0, 3);
  }, [blogs, blog]);

  const title = language === 'id' ? (blog?.titleId || blog?.titleEn) : (blog?.titleEn || blog?.titleId);
  const summary = language === 'id' ? (blog?.summaryId || blog?.summaryEn) : (blog?.summaryEn || blog?.summaryId);
  const content = language === 'id' ? (blog?.contentId || blog?.contentEn) : (blog?.contentEn || blog?.contentId);
  const formattedDate = new Date(blog?.publishedAt || Date.now()).toLocaleDateString(
    language === 'id' ? 'id-ID' : 'en-US', 
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: language === 'id' ? "Tautan Disalin!" : "Link Copied!",
      description: language === 'id' ? "Tautan artikel berhasil disalin ke papan klip." : "Article link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    toast({
      title: language === 'id' ? "Kode Disalin!" : "Code Copied!",
      description: language === 'id' ? "Snippet kode disalin ke clipboard." : "Code snippet copied to clipboard.",
    });
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  if (!blog && !storeLoading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-md my-auto">
        <div className="glass-card p-12 rounded-[2.5rem] space-y-6 border border-border">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
            <BookOpen className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase">
              {language === 'id' ? 'Artikel Tidak Ditemukan' : 'Article Not Found'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {language === 'id' 
                ? 'Artikel yang Anda cari mungkin telah dipindahkan atau dihapus.'
                : 'The article you are looking for might have been moved or removed.'}
            </p>
          </div>
          <Link href="/blog">
            <Button className="rounded-xl font-black uppercase text-xs gap-2">
              <ArrowLeft className="h-4 w-4" /> {t.backToBlog}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-32 max-w-4xl space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded-xl" />
        <div className="h-12 w-3/4 bg-muted rounded-2xl" />
        <div className="h-64 w-full bg-muted rounded-3xl" />
        <div className="space-y-4">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-4/6 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://www.naraandratyaga.my.id/blog/${slug}`;

  return (
    <>
      {/* ── Reading Progress Bar ───────────────────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left shadow-md shadow-primary/50"
        style={{ scaleX }}
      />

      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-[150px]" />
      </div>

      <article className="pt-28 pb-16 md:pt-36 md:pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          
          {/* Navigation back & Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              {t.backToBlog}
            </Link>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyToClipboard(currentUrl)}
                className="rounded-xl font-black uppercase text-[10px] tracking-wider gap-2 glass-card hover:border-primary/40"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? (language === 'id' ? 'Disalin' : 'Copied') : (language === 'id' ? 'Salin Tautan' : 'Copy Link')}</span>
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {blog.tags?.map(tag => (
              <Badge 
                key={tag} 
                className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl"
              >
                #{tag}
              </Badge>
            ))}
            {blog.featured && (
              <Badge className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> FEATURED
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-tight mb-8">
            {title}
          </h1>

          {/* Author & Meta bar */}
          <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-y border-border/60 mb-10 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-black">
                {profile.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} alt={blog.author || profile.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-black text-foreground uppercase tracking-wide">{blog.author || profile.name}</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">{profile.roleEn || 'Full-Stack Developer'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-bold">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                {blog.readingTime || '3 min read'}
              </span>
            </div>
          </div>

          {/* Cover Image */}
          {blog.coverImage && (
            <div className="rounded-[2.5rem] overflow-hidden bg-muted aspect-video mb-12 border border-border/80 shadow-2xl">
              <img src={blog.coverImage} alt={title || 'Cover image'} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Summary Lead */}
          {summary && (
            <div className="p-6 sm:p-8 rounded-[2rem] bg-primary/5 border border-primary/15 mb-10">
              <p className="text-base sm:text-lg font-semibold text-foreground/90 leading-relaxed italic">
                "{summary}"
              </p>
            </div>
          )}

          {/* Main Content with enhanced parser */}
          <div className="prose prose-invert max-w-none space-y-6 text-foreground/90 leading-relaxed text-base sm:text-lg">
            {(content || '').split('\n\n').map((paragraph, index) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              // Headings
              if (trimmed.startsWith('### ')) {
                return <h3 key={index} className="text-xl sm:text-2xl font-black uppercase text-foreground mt-8 mb-4 tracking-tight">{trimmed.replace('### ', '')}</h3>;
              }
              if (trimmed.startsWith('## ')) {
                return <h2 key={index} className="text-2xl sm:text-3xl font-black uppercase text-foreground mt-10 mb-4 tracking-tight border-b border-border/40 pb-2">{trimmed.replace('## ', '')}</h2>;
              }
              if (trimmed.startsWith('# ')) {
                return <h1 key={index} className="text-3xl sm:text-4xl font-black uppercase text-foreground mt-12 mb-6 tracking-tight">{trimmed.replace('# ', '')}</h1>;
              }

              // Interactive Code Block with Copy Button
              if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
                const firstLineBreak = trimmed.indexOf('\n');
                const langMatch = trimmed.slice(3, firstLineBreak > 0 ? firstLineBreak : undefined).trim();
                const codeBody = trimmed.replace(/^```[a-zA-Z0-9_-]*\n?/, '').replace(/```$/, '').trim();

                return (
                  <div key={index} className="my-6 rounded-2xl overflow-hidden border border-border/80 bg-[#0d1117] shadow-xl">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-border/40 text-xs text-muted-foreground font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                        <span className="ml-2 font-bold uppercase tracking-wider text-[10px] text-cyan-400">
                          {langMatch || 'CODE'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(codeBody, index)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[10px] font-mono text-muted-foreground hover:text-white transition-colors"
                        title="Salin Kode"
                      >
                        {copiedCodeIdx === index ? (
                          <>
                            <Check className="h-3 w-3 text-green-400" />
                            <span className="text-green-400 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-5 overflow-x-auto text-xs sm:text-sm font-mono text-cyan-300 leading-relaxed">
                      <code>{codeBody}</code>
                    </pre>
                  </div>
                );
              }

              // Bullet points
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const items = trimmed.split('\n').map(l => l.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
                return (
                  <ul key={index} className="list-disc list-inside space-y-2 pl-2 my-4">
                    {items.map((item, i) => (
                      <li key={i} className="text-foreground/90">{item}</li>
                    ))}
                  </ul>
                );
              }

              return (
                <p key={index} className="text-foreground/80 leading-relaxed font-normal">
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Social Media Share Section */}
          <div className="mt-12 p-6 rounded-2xl bg-card border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary">
                {language === 'id' ? 'Suka dengan artikel ini?' : 'Enjoyed this article?'}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === 'id' ? 'Bagikan ke jejaring sosial Anda' : 'Share it with your network'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${currentUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Bagikan ke WhatsApp"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-600/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Bagikan ke LinkedIn"
              >
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title}`)}&url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Bagikan ke X"
              >
                <Twitter className="h-4 w-4" /> X
              </a>
            </div>
          </div>

          {/* Author Footer Card */}
          <div className="mt-12 p-8 rounded-[2.5rem] bg-card border border-border shadow-xl flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary/10 shrink-0 border-2 border-primary/20">
              {profile.profilePictureUrl ? (
                <img src={profile.profilePictureUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-primary m-auto mt-5" />
              )}
            </div>
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-black text-lg uppercase">{profile.name}</h3>
                  <p className="text-xs font-bold text-primary uppercase">{language === 'id' ? profile.roleId : profile.roleEn}</p>
                </div>
                <Link href="/contact">
                  <Button size="sm" className="rounded-xl font-black uppercase text-[10px] tracking-wider">
                    {language === 'id' ? 'Hubungi Saya' : 'Get in Touch'}
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {language === 'id' ? profile.aboutMeId : profile.aboutMeEn}
              </p>
            </div>
          </div>

          {/* Related Articles */}
          {relatedBlogs.length > 0 && (
            <div className="mt-20 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight">
                  {language === 'id' ? 'Artikel Terkait' : 'Related Articles'}
                </h3>
                <Link href="/blog" className="text-xs font-black uppercase text-primary hover:underline flex items-center gap-1">
                  {language === 'id' ? 'Lihat Semua' : 'View All'} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedBlogs.map(rb => {
                  const rTitle = language === 'id' ? (rb.titleId || rb.titleEn) : (rb.titleEn || rb.titleId);
                  return (
                    <Card key={rb.id} className="rounded-2xl bg-card border border-border hover:border-primary/40 transition-all group overflow-hidden">
                      <Link href={`/blog/${rb.slug}`} className="block p-5 space-y-3">
                        <span className="text-[9px] font-black uppercase text-primary tracking-wider">
                          {rb.tags?.[0] || 'Article'}
                        </span>
                        <h4 className="font-black uppercase text-sm group-hover:text-primary transition-colors line-clamp-2">
                          {rTitle}
                        </h4>
                        <span className="text-[10px] font-bold text-muted-foreground block">
                          {rb.readingTime || '3 min'}
                        </span>
                      </Link>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </article>
    </>
  );
}
