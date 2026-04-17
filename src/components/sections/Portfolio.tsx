
"use client"

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useProjectStore } from '../ProjectStore';

export const Portfolio = () => {
  const { t } = useLanguage();
  const { projects } = useProjectStore();
  const [filter, setFilter] = useState<'all' | 'web' | 'ui' | 'backend'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'all' || p.type === filter;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.technologies.some(tech => tech.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const SkeletonCard = () => (
    <div className="rounded-3xl border bg-card animate-pulse overflow-hidden">
      <div className="aspect-video bg-muted"></div>
      <div className="p-6 space-y-3">
        <div className="h-6 w-2/3 bg-muted rounded"></div>
        <div className="h-4 w-full bg-muted rounded"></div>
        <div className="flex gap-2">
          <div className="h-6 w-12 bg-muted rounded-full"></div>
          <div className="h-6 w-12 bg-muted rounded-full"></div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="portfolio" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold font-headline">{t.navPortfolio}</h2>
            <p className="text-muted-foreground text-lg">Click any project to visit the live website.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t.searchPlaceholder} 
                className="pl-12 w-full sm:w-64 rounded-full h-11 border-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
              {(['all', 'web', 'ui', 'backend'] as const).map((cat) => (
                <Button 
                  key={cat}
                  variant={filter === cat ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full h-11 px-6 whitespace-nowrap"
                  onClick={() => setFilter(cat)}
                >
                  {cat === 'all' ? t.filterAll : cat === 'web' ? t.filterWeb : cat === 'ui' ? t.filterUI : t.filterBackend}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            filteredProjects.map((project) => (
              <a 
                key={project.id} 
                href={project.demoUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block group"
              >
                <Card className="overflow-hidden h-full hover:shadow-2xl transition-all duration-500 border-none bg-card shadow-lg rounded-[2.5rem] flex flex-col group-hover:-translate-y-2">
                  <div className="relative aspect-video overflow-hidden">
                    <Image 
                      src={project.imageUrl} 
                      alt={project.title} 
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 backdrop-blur-md text-black hover:bg-white uppercase text-[10px] tracking-widest font-bold px-3 py-1 rounded-full">{project.type}</Badge>
                    </div>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <ExternalLink className="h-5 w-5" />
                        {t.liveDemo}
                      </div>
                    </div>
                  </div>
                  <CardHeader className="pt-8">
                    <CardTitle className="text-2xl font-bold font-headline group-hover:text-primary transition-colors">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 px-6">
                    <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                      {project.shortDescription}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-[10px] font-bold rounded-lg px-2 py-0.5">{tech}</Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex justify-between items-center">
                    <span className="text-sm font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      {t.liveDemo} <ExternalLink className="h-4 w-4" />
                    </span>
                  </CardFooter>
                </Card>
              </a>
            ))
          )}
        </div>

        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-32 bg-muted/20 rounded-[3rem] border-2 border-dashed border-primary/20">
            <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <Search className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold font-headline mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms.</p>
            <Button variant="link" className="text-primary font-bold" onClick={() => {setSearch(''); setFilter('all');}}>Clear all filters</Button>
          </div>
        )}
      </div>
    </section>
  );
};
