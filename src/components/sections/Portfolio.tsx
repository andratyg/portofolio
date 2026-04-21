
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../LanguageContext';
import { useEditableContent } from '../ContentStore';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, Globe, Eye, ArrowRight, AlertCircle, CheckCircle2, Terminal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import Image from 'next/image';
import { useProjectStore } from '../ProjectStore';
import { cn } from '@/lib/utils';
import { Project } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const CATEGORIES = ['all', 'web', 'ui', 'backend'] as const;
const SORT_OPTIONS = ['newest', 'oldest', 'asc', 'desc'] as const;
const PROJECTS_PER_PAGE = 6;

export const Portfolio = () => {
  const { t, language } = useLanguage();
  const { portfolioTitle, portfolioSubtitle } = useEditableContent(language);
  const { projects, isLoading, error } = useProjectStore();
  
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>('all');
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]>('newest');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PROJECTS_PER_PAGE);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { setIsVisible(true); }, []);

  const processedProjects = useMemo(() => {
    const getTitle = (p: Project) => language === 'id' ? (p.titleId || p.titleEn || '') : (p.titleEn || p.titleId || '');
    
    const filtered = projects.filter(p => {
      const title = getTitle(p);
      const safeSearch = search.toLowerCase();
      const matchesFilter = filter === 'all' || p.type === filter;
      const matchesSearch = title.toLowerCase().includes(safeSearch) || (p.technologies || []).some(tech => tech.toLowerCase().includes(safeSearch));
      return matchesFilter && matchesSearch;
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
  }, [projects, language, search, filter, sortBy]);

  const visibleProjects = useMemo(() => {
    return processedProjects.slice(0, visibleCount);
  }, [processedProjects, visibleCount]);

  const handleFilterChange = (newFilter: (typeof CATEGORIES)[number]) => {
    setFilter(newFilter);
    setVisibleCount(PROJECTS_PER_PAGE);
  };

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + PROJECTS_PER_PAGE);
  };

  return (
    <section id="portfolio" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black font-headline tracking-tighter leading-tight text-foreground mb-4">{portfolioTitle}</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {portfolioSubtitle}
          </p>
        </div>

        {/* --- Filter & Search --- */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-12">
          <div className="flex items-center justify-center flex-wrap gap-2 bg-card/50 p-2 rounded-full border border-border/20 backdrop-blur-sm">
            {CATEGORIES.map(category => (
              <Button
                key={category}
                variant={filter === category ? 'default' : 'ghost'}
                onClick={() => handleFilterChange(category)}
                className="capitalize rounded-full px-6 py-2 text-sm font-bold transition-all duration-300"
              >
                {t.projectCategories[category]}
              </Button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative group flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
              <Input 
                placeholder={t.portfolioSearchPlaceholder}
                className="pl-14 w-full min-w-[300px] rounded-full h-14 bg-card/50 border-border/20 focus:ring-primary/50 backdrop-blur-sm" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as (typeof SORT_OPTIONS)[number])}>
              <SelectTrigger className="w-full sm:w-auto h-14 rounded-full bg-card/50 border-border/20 backdrop-blur-sm px-5 font-bold text-sm text-left">
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

        {/* --- Projects Grid --- */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{
            [...Array(6)].map((_, i) => <div key={i} className="h-96 bg-card/80 rounded-3xl animate-pulse"></div>)
          }</div>
        ) : error ? (
           <div className="text-center py-16"><p className='text-destructive'>{error}</p></div>
        ) : visibleProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {visibleProjects.map((project, idx) => (
              <ProjectCard key={project.id} project={project} index={idx} isVisible={isVisible} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold mb-2">{t.noProjectsFound}</h3>
            <p className="text-muted-foreground">{t.noProjectsFoundHint}</p>
          </div>
        )}

        {/* --- Load More Button --- */}
        {visibleCount < processedProjects.length && (
          <div className="mt-16 text-center">
            <Button onClick={handleLoadMore} size="lg" className="rounded-full font-bold text-lg px-10 py-7 group">
              {t.loadMore}
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
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
    <div className={cn("group transition-all duration-1000 h-full", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16")} style={{ transitionDelay: `${index * 100}ms` }}>
      <Dialog>
        <DialogTrigger asChild>
          <div className="cursor-pointer group h-full">
            <Card className="overflow-hidden h-full border-border/20 bg-card/60 backdrop-blur-xl rounded-[2.5rem] flex flex-col group-hover:-translate-y-3 group-hover:shadow-2xl group-hover:shadow-primary/10 transition-all duration-500 ease-in-out">
              <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                <Image src={project.imageUrl || `https://placehold.co/800x500?text=${title}`} alt={title || 'Project Image'} fill className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                       <Eye className="h-6 w-6 text-white" />
                    </div>
                </div>
              </div>
              <CardContent className="pt-6 px-5 sm:px-7 pb-4 flex-1">
                <h4 className="text-xl font-black font-headline mb-3 text-foreground group-hover:text-primary transition-colors">{title}</h4>
                <p className="text-muted-foreground line-clamp-2 text-sm font-medium">{description}</p>
              </CardContent>
              <CardFooter className="px-7 pb-7 flex justify-between items-center pt-4 border-t border-border/10">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">{t.viewSpecs} <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" /></span>
                {project.impactStats && <Badge variant="secondary" className="text-[8px] font-black uppercase px-3 py-1 bg-primary/10 text-primary border-none">{project.impactStats}</Badge>}
              </CardFooter>
            </Card>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] h-[85vh] p-0 rounded-[3rem] overflow-hidden border-none shadow-2xl bg-background flex flex-col">
          <div className="relative h-[40%] shrink-0 bg-muted">
            <Image src={project.imageUrl || `https://placehold.co/800x500?text=${title}`} alt={title || 'Project Image'} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div className="absolute bottom-8 left-10 right-10">
              <div className="flex items-end justify-between gap-4">
                <div className='space-y-2'>
                  <Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold">{t.projectCategories[project.type as keyof typeof t.projectCategories]}</Badge>
                  <DialogTitle className="text-3xl md:text-4xl font-black font-headline text-white tracking-tighter leading-tight">{title}</DialogTitle>
                </div>
                {hasDemoUrl && (
                  <Button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      window.open(project.demoUrl, '_blank', 'noopener,noreferrer');
                    }}
                    variant="secondary"
                    className="rounded-full h-16 w-16 p-0 shrink-0 gap-2 text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-110 hover:bg-primary hover:text-primary-foreground active:scale-95 transition-all bg-white text-black flex items-center justify-center"
                  >
                    <Globe className="h-7 w-7" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar bg-muted/20">
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-8 rounded-[2rem] bg-card border-none shadow-sm">
                  <h3 className="text-lg font-black font-headline uppercase flex items-center gap-3 mb-4"><AlertCircle className="h-5 w-5 text-destructive" /> {t.technicalChallenge}</h3>
                  <DialogDescription className="text-muted-foreground text-base leading-relaxed font-medium">{problem}</DialogDescription>
                </Card>
                <Card className="p-8 rounded-[2rem] bg-card border-none shadow-sm">
                  <h3 className="text-lg font-black font-headline uppercase flex items-center gap-3 mb-4"><CheckCircle2 className="h-5 w-5 text-primary" /> {t.strategicSolution}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed font-medium">{solution}</p>
                </Card>
            </div>
            <Card className="p-8 rounded-[2rem] bg-card border-none shadow-sm">
              <h3 className="text-lg font-black font-headline uppercase flex items-center gap-3 mb-6"><Terminal className="h-5 w-5 text-primary" /> {t.systemStack}</h3>
              <div className="flex flex-wrap gap-3">{(project.technologies || []).map(t => <Badge key={t} variant="outline" className="px-4 py-2 rounded-xl border-primary/20 text-sm font-semibold bg-primary/5">{t}</Badge>)}</div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
