
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../providers/LanguageContext';
import { useEditableContent } from '@/stores/ContentStore';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, Globe, Eye, ArrowRight, AlertCircle, CheckCircle2, Terminal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import Image from 'next/image';
import Link from 'next/link';
import { useProjectStore } from '@/stores/ProjectStore';
import { cn } from '@/lib/utils';
import { Project } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { m as motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['all', 'web', 'ui', 'backend'] as const;
const SORT_OPTIONS = ['newest', 'oldest', 'asc', 'desc'] as const;

interface PortfolioProps {
  /** Injected by Server Component page for SSR / ISR — makes data visible to crawlers. */
  initialProjects?: Project[];
}

export const Portfolio = ({ initialProjects }: PortfolioProps) => {
  const { t, language } = useLanguage();
  const { portfolioTitle, portfolioSubtitle } = useEditableContent(language);
  const { projects: storeProjects, isLoading: storeLoading, error } = useProjectStore();

  // Prefer live store data (admin / dynamic updates); fall back to SSR-injected initial data.
  // When initialProjects is provided, we never show skeleton on first paint.
  const projects = storeProjects.length > 0 ? storeProjects : (initialProjects ?? []);
  const isLoading = storeLoading && projects.length === 0;
  
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>('all');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]>('newest');
  const [search, setSearch] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { setIsVisible(true); }, []);

  // Extract all unique tech tags from projects
  const uniqueTechs = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => (p.technologies || []).forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [projects]);

  const processedProjects = useMemo(() => {
    const getTitle = (p: Project) => language === 'id' ? (p.titleId || p.titleEn || '') : (p.titleEn || p.titleId || '');
    
    const filtered = projects.filter(p => {
      const title = getTitle(p);
      const safeSearch = search.toLowerCase();
      const matchesFilter = filter === 'all' || p.type === filter;
      const matchesTech = selectedTech === 'all' || (p.technologies || []).includes(selectedTech);
      const matchesSearch = title.toLowerCase().includes(safeSearch) || (p.technologies || []).some(tech => tech.toLowerCase().includes(safeSearch));
      return matchesFilter && matchesTech && matchesSearch;
    });

    const sorted = [...filtered];

    switch (sortBy) {
      case 'asc':
        sorted.sort((a, b) => getTitle(a).localeCompare(getTitle(b)));
        break;
      case 'desc':
        sorted.sort((a, b) => getTitle(b).localeCompare(getTitle(a)));
        break;
      case 'oldest':
        sorted.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));
        break;
    }

    return sorted;
  }, [projects, language, search, filter, selectedTech, sortBy]);

  // ─── JSON-LD Structured Data for Projects (AI/SEO Optimization) ───────────
  const projectSchema = useMemo(() => {
    if (!projects || projects.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": projects.map((p, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "SoftwareApplication",
          "name": p.titleId || p.titleEn,
          "description": p.shortDescriptionId || p.shortDescriptionEn,
          "url": typeof p.demoUrl === 'string' && p.demoUrl.startsWith('http') ? p.demoUrl : undefined,
          "image": p.imageUrl,
          "applicationCategory": p.type,
          "operatingSystem": "Web",
          "keywords": (p.technologies || []).join(", "),
          "author": {
            "@type": "Person",
            "name": "Nara Andra Tyaga"
          }
        }
      }))
    };
  }, [projects]);

  return (
    <section id="portfolio" className="py-16 md:py-24 bg-background relative">
      {projectSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema) }}
        />
      )}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-10 md:mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-normal leading-tight text-foreground mb-4">{portfolioTitle}</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {portfolioSubtitle}
          </p>
        </div>

        {/* --- Filter & Search --- */}
        <div className="flex flex-col gap-4 mb-8 md:mb-12">
          <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 bg-card/50 p-1.5 sm:p-2 rounded-full border border-border/20 backdrop-blur-sm overflow-x-auto no-scrollbar relative">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={cn(
                  "relative capitalize rounded-full px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold transition-colors duration-300 shrink-0",
                  filter === category ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {filter === category && (
                  <motion.div
                    layoutId="portfolioActiveTab"
                    className="absolute inset-0 bg-primary rounded-full z-0 shadow-md"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{t.projectCategories[category]}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
            <div className="relative group flex-1">
              <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
              <Input 
                placeholder={t.portfolioSearchPlaceholder}
                className="pl-11 sm:pl-14 w-full rounded-full h-12 sm:h-14 bg-card/50 border-border/20 focus:ring-primary/50 backdrop-blur-sm" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            {/* Tech Filter Dropdown */}
            {uniqueTechs.length > 0 && (
              <Select value={selectedTech} onValueChange={(val) => setSelectedTech(val)}>
                <SelectTrigger aria-label="Filter Teknologi" className="w-full sm:w-auto h-12 sm:h-14 rounded-full bg-card/50 border-border/20 backdrop-blur-sm px-4 sm:px-5 font-bold text-sm text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground whitespace-nowrap">Tech:</span>
                    <SelectValue placeholder="Semua Tech" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-semibold text-sm">Semua Teknologi</SelectItem>
                  {uniqueTechs.map(tech => (
                    <SelectItem key={tech} value={tech} className="font-semibold text-sm">{tech}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as (typeof SORT_OPTIONS)[number])}>
              <SelectTrigger aria-label={`${t.sortBy} proyek`} className="w-full sm:w-auto h-12 sm:h-14 rounded-full bg-card/50 border-border/20 backdrop-blur-sm px-4 sm:px-5 font-bold text-sm text-left">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground whitespace-nowrap">{t.sortBy}:</span>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 font-bold text-xs uppercase tracking-widest text-muted-foreground">{t.sortBy}</div>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option} value={option} className="font-semibold text-sm">
                    {t.sortOptions[option as keyof typeof t.sortOptions]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* --- Projects Carousel --- */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{
            [...Array(6)].map((_, i) => <div key={i} className="h-96 bg-card/80 rounded-3xl animate-pulse"></div>)
          }</div>
        ) : error ? (
           <div className="text-center py-16"><p className='text-destructive'>{error}</p></div>
        ) : processedProjects.length > 0 ? (
          <div className="relative">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-3 sm:-ml-4 py-4">
                <AnimatePresence mode="popLayout">
                  {processedProjects.map((project, idx) => (
                    <CarouselItem key={project.id} className="pl-3 sm:pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3">
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.4, type: "spring" }}
                        className="h-full"
                      >
                        <ProjectCard project={project} index={idx} isVisible={isVisible} />
                      </motion.div>
                    </CarouselItem>
                  ))}
                </AnimatePresence>
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex -left-4 md:-left-6 h-10 w-10 sm:h-12 sm:w-12 bg-card/80 backdrop-blur-sm border-border/20 hover:bg-primary hover:text-primary-foreground" />
              <CarouselNext className="hidden sm:flex -right-4 md:-right-6 h-10 w-10 sm:h-12 sm:w-12 bg-card/80 backdrop-blur-sm border-border/20 hover:bg-primary hover:text-primary-foreground" />
            </Carousel>
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold mb-2">{t.noProjectsFound}</h3>
            <p className="text-muted-foreground">{t.noProjectsFoundHint}</p>
          </div>
        )}
      </div>
    </section>
  );
};

const ProjectCard = ({ project, index, isVisible }: { project: Project, index: number, isVisible: boolean }) => {
  const { language, t } = useLanguage();
  
  const title = language === 'id' ? (project.titleId || project.titleEn) : (project.titleEn || project.titleId);
  const description = language === 'id' ? (project.shortDescriptionId || project.shortDescriptionEn) : (project.shortDescriptionEn || project.shortDescriptionId);
  const problem = language === 'id' ? (project.problemId || project.problemEn) : (project.problemEn || project.problemId);
  const solution = language === 'id' ? (project.solutionId || project.solutionEn) : (project.solutionEn || project.solutionId);

  const hasDemoUrl = typeof project.demoUrl === 'string' && project.demoUrl.trim().length > 5 && project.demoUrl.trim().startsWith('http');

  return (
    <div className={cn("group transition-[opacity,transform] duration-700 ease-out h-full", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16")} style={{ transitionDelay: `${index * 100}ms` }}>
      <Dialog>
        <DialogTrigger asChild>
          <button type="button" className="cursor-pointer group h-full w-full text-left">
            {/* interactive-card handles: border-radius, overflow-hidden, hover lift, glow — NO clipPath */}
            <Card className="interactive-card h-full border-border/20 bg-card/70 backdrop-blur-sm flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/10] bg-muted">
                  <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-muted">
                    <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-700 ease-out">
                      <Image
                        src={project.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}
                        alt={title || 'Project image'}
                        fill
                        loading="lazy"
                        className="object-cover"
                        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 48vw, 380px"
                        quality={75}
                      />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-400" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 scale-90 group-hover:scale-100 transition-transform duration-300">
                         <Eye className="h-6 w-6 text-white" />
                      </div>
                  </div>
                </div>
                <CardContent className="pt-8 px-5 sm:px-7 pb-4">
                  <h3 className="text-xl font-black mb-2.5 text-foreground group-hover:text-primary transition-colors duration-300 leading-snug">{title}</h3>
                  <p className="text-muted-foreground line-clamp-2 text-sm font-medium leading-relaxed">{description}</p>
                </CardContent>
              </div>
              <div className="flex-1" />
              <CardFooter className="px-7 pb-7 flex justify-between items-center pt-4 border-t border-border/10">
                <span className="text-xs font-black text-primary tracking-normal flex items-center gap-1.5 capitalize">{t.viewSpecs.toLowerCase()} <ArrowRight className="h-3 w-3 group-hover:translate-x-1.5 transition-transform duration-300" /></span>
                <div className="flex items-center gap-2">
                  {project.githubUrl && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); window.open(project.githubUrl, '_blank', 'noopener,noreferrer'); }}
                      className="p-1.5 rounded-full bg-muted/50 border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors shrink-0"
                      title="View source code on GitHub"
                      aria-label={`Source code of ${title}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                    </button>
                  )}
                  {project.impactStats && <div className="text-xs font-black px-3 py-1 bg-primary/10 text-primary rounded-full capitalize">{project.impactStats.toLowerCase()}</div>}
                </div>
              </CardFooter>
            </Card>
          </button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] sm:max-w-[800px] max-h-[95dvh] sm:h-[85vh] p-0 border border-border/30 shadow-2xl bg-card text-card-foreground flex flex-col rounded-[2rem] overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            <div className="relative h-64 sm:h-96 shrink-0 bg-muted overflow-hidden">
              <Image src={project.imageUrl || `https://placehold.co/800x500?text=${title}`} alt={title || 'Project Image'} fill className="object-cover" sizes="(max-width: 768px) 95vw, 750px" quality={75} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-4 sm:bottom-8 left-5 sm:left-10 right-5 sm:right-10">
                <div className="flex items-end justify-between gap-3 sm:gap-4">
                <div className='space-y-1 sm:space-y-2'>
                  <Badge className="bg-primary text-primary-foreground px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold">{t.projectCategories[project.type as keyof typeof t.projectCategories]}</Badge>
                  <DialogTitle className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-normal leading-tight">{title}</DialogTitle>
                </div>
                <div className="flex gap-2 shrink-0">
                  {project.githubUrl && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
                      }}
                      variant="secondary"
                      className="rounded-full h-12 w-12 sm:h-16 sm:w-16 p-0 shrink-0 gap-2 text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-110 hover:bg-primary hover:text-primary-foreground active:scale-95 transition-all bg-white/15 text-white border border-white/30 backdrop-blur-sm flex items-center justify-center"
                      title="View source code on GitHub"
                      aria-label={`Source code of ${title}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                    </Button>
                  )}
                  {hasDemoUrl && (
                  <Button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      window.open(project.demoUrl, '_blank', 'noopener,noreferrer');
                    }}
                    variant="secondary"
                    className="rounded-full h-12 w-12 sm:h-16 sm:w-16 p-0 shrink-0 gap-2 text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-110 hover:bg-primary hover:text-primary-foreground active:scale-95 transition-all bg-white text-black flex items-center justify-center"
                  >
                    <Globe className="h-6 w-6 sm:h-7 sm:w-7" />
                  </Button>
                )}
                </div>
                </div>
              </div>
            </div>
            <div className="p-5 sm:p-10 space-y-6 sm:space-y-12 bg-muted/40 min-h-[50vh]">
              <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-6 sm:p-8 rounded-[2rem] bg-card border border-border/20 shadow-md">
                    <h3 className="text-lg font-black uppercase flex items-center gap-3 mb-4 text-foreground"><AlertCircle className="h-5 w-5 text-destructive" /> {t.technicalChallenge}</h3>
                    <DialogDescription className="text-muted-foreground text-base leading-relaxed font-medium">{problem}</DialogDescription>
                  </div>
                  <div className="p-6 sm:p-8 rounded-[2rem] bg-card border border-border/20 shadow-md">
                    <h3 className="text-lg font-black uppercase flex items-center gap-3 mb-4 text-foreground"><CheckCircle2 className="h-5 w-5 text-primary" /> {t.strategicSolution}</h3>
                    <p className="text-muted-foreground text-base leading-relaxed font-medium">{solution}</p>
                  </div>
              </div>
              <div className="p-6 sm:p-8 rounded-[2rem] bg-card border border-border/20 shadow-md">
                <h3 className="text-lg font-black uppercase flex items-center gap-3 mb-6 text-foreground"><Terminal className="h-5 w-5 text-primary" /> {t.systemStack}</h3>
                <div className="flex flex-wrap gap-3">{(project.technologies || []).map(t => <Badge key={t} variant="outline" className="px-4 py-2 rounded-xl border-primary/20 text-sm font-semibold bg-primary/5 text-foreground">{t}</Badge>)}</div>
              </div>
              <div className="flex justify-end pt-4">
                <Link href={`/projects/${project.id}`} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto rounded-2xl font-black uppercase text-xs tracking-wider gap-2 px-8 h-12 shadow-lg shadow-primary/20">
                    {t.viewFullCaseStudy} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
