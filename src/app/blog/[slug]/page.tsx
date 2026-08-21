"use client"

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProjectStoreProvider, useProjectStore } from '@/stores/ProjectStore';
import { useLanguage } from '@/components/providers/LanguageContext';
import { 
  ArrowLeft, Clock, Calendar, User, Share2, Tag, 
  BookOpen, Check, ArrowRight, Sparkles 
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

function BlogDetailContent() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { language, t } = useLanguage();
  const { blogs, profile, isLoading } = useProjectStore();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const blog = useMemo(() => {
    if (!slug) return null;
    return blogs.find(b => b.slug === slug || b.id === slug) || null;
  }, [blogs, slug]);

  const relatedBlogs = useMemo(() => {
    if (!blog) return [];
    return blogs
      .filter(b => b.id !== blog.id)
      .slice(0, 3);
  }, [blogs, blog]);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'id' ? (blog?.titleId || blog?.titleEn) : (blog?.titleEn || blog?.titleId),
          text: language === 'id' ? (blog?.summaryId || blog?.summaryEn) : (blog?.summaryEn || blog?.summaryId),
          url: url,
        });
      } catch (err) {
        // Fallback to clipboard
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: language === 'id' ? "Tautan Disalin!" : "Link Copied!",
      description: language === 'id' ? "Tautan artikel berhasil disalin ke papan klip." : "Article link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
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
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
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
        <Footer />
      </div>
    );
  }

  const title = language === 'id' ? (blog.titleId || blog.titleEn) : (blog.titleEn || blog.titleId);
  const summary = language === 'id' ? (blog.summaryId || blog.summaryEn) : (blog.summaryEn || blog.summaryId);
  const content = language === 'id' ? (blog.contentId || blog.contentEn) : (blog.contentEn || blog.contentId);
  const formattedDate = new Date(blog.publishedAt || Date.now()).toLocaleDateString(
    language === 'id' ? 'id-ID' : 'en-US', 
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: summary,
    image: blog.coverImage ? [blog.coverImage] : ['https://www.naraandratyaga.my.id/og-image.png'],
    datePublished: blog.publishedAt || new Date().toISOString(),
    dateModified: blog.updatedAt || blog.publishedAt || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: blog.author || profile.name || 'Nara Andra Tyaga',
      url: 'https://www.naraandratyaga.my.id',
    },
    publisher: {
      '@type': 'Person',
      name: 'Nara Andra Tyaga',
      url: 'https://www.naraandratyaga.my.id',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.naraandratyaga.my.id/blog/${slug}`,
    },
    keywords: (blog.tags || []).join(', '),
  };

  return (
    <div className="min-h-screen selection:bg-primary selection:text-primary-foreground flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div>
        <Navbar />

        {/* Ambient Glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-[150px]" />
        </div>

        <article className="pt-28 pb-16 md:pt-36 md:pb-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            
            {/* Navigation back */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <Link 
                href="/blog" 
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                {t.backToBlog}
              </Link>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare}
                className="rounded-xl font-black uppercase text-[10px] tracking-wider gap-2 glass-card hover:border-primary/40"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Share2 className="h-3.5 w-3.5" />}
                <span>{copied ? (language === 'id' ? 'Disalin' : 'Copied') : t.shareArticle}</span>
              </Button>
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
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">{profile.roleEn || 'Developer'}</p>
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
                <img src={blog.coverImage} alt={title} className="w-full h-full object-cover" />
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

            {/* Main Content */}
            <div className="prose prose-invert max-w-none space-y-6 text-foreground/90 leading-relaxed text-base sm:text-lg">
              {content.split('\n\n').map((paragraph, index) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                // Simple Heading detection (e.g. ### or ##)
                if (trimmed.startsWith('### ')) {
                  return <h3 key={index} className="text-xl sm:text-2xl font-black uppercase text-foreground mt-8 mb-4 tracking-tight">{trimmed.replace('### ', '')}</h3>;
                }
                if (trimmed.startsWith('## ')) {
                  return <h2 key={index} className="text-2xl sm:text-3xl font-black uppercase text-foreground mt-10 mb-4 tracking-tight border-b border-border/40 pb-2">{trimmed.replace('## ', '')}</h2>;
                }
                if (trimmed.startsWith('# ')) {
                  return <h1 key={index} className="text-3xl sm:text-4xl font-black uppercase text-foreground mt-12 mb-6 tracking-tight">{trimmed.replace('# ', '')}</h1>;
                }

                // Code block detection
                if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
                  const lines = trimmed.slice(3, -3).trim().split('\n');
                  const firstLine = lines[0];
                  const code = lines.slice(1).join('\n') || lines.join('\n');
                  return (
                    <pre key={index} className="p-6 rounded-2xl bg-[#0d1117] border border-border/80 overflow-x-auto text-xs sm:text-sm font-mono my-6 text-cyan-300">
                      <code>{trimmed.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '')}</code>
                    </pre>
                  );
                }

                // Bullet point lists
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

            {/* Author Footer Card */}
            <div className="mt-16 p-8 rounded-[2.5rem] bg-card border border-border shadow-xl flex flex-col sm:flex-row items-center gap-6">
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
                  <Link href="/#contact">
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
      </div>

      <Footer />
    </div>
  );
}

export default function BlogDetailPage() {
  return (
    <ProjectStoreProvider>
      <BlogDetailContent />
    </ProjectStoreProvider>
  );
}
