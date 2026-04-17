
"use client"

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, ExternalLink, Award } from 'lucide-react';
import Image from 'next/image';
import { useProjectStore } from '../ProjectStore';
import { Project } from '@/lib/types';

export const Portfolio = () => {
  const { t } = useLanguage();
  const { projects } = useProjectStore();
  const [filter, setFilter] = useState<'all' | 'web' | 'ui' | 'backend'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'all' || p.type === filter;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.technologies.some(tech => tech.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const SkeletonCard = () => (
    <div className="rounded-2xl border bg-card animate-pulse">
      <div className="aspect-video bg-muted rounded-t-2xl"></div>
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
    <section id="portfolio" className="py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-bold font-headline mb-2">{t.navPortfolio}</h2>
            <p className="text-muted-foreground">{t.featuredProjects}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t.searchPlaceholder} 
                className="pl-10 w-full sm:w-64 rounded-full"
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
                  className="rounded-full whitespace-nowrap"
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
            Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            filteredProjects.map((project) => (
              <a 
                key={project.id} 
                href={project.demoUrl || '#'} 
                target={project.demoUrl ? "_blank" : "_self"} 
                rel="noopener noreferrer"
                className="block group"
              >
                <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 border-none bg-card/50 backdrop-blur-sm shadow-md flex flex-col">
                  <div className="relative aspect-video overflow-hidden">
                    <Image 
                      src={project.imageUrl} 
                      alt={project.title} 
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-md uppercase text-[10px] tracking-widest">{project.type}</Badge>
                    </div>
                    {project.demoUrl && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white text-black px-4 py-2 rounded-full font-bold flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          {t.liveDemo}
                        </div>
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {project.shortDescription}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-[10px]">{tech}</Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-[10px]">+{project.technologies.length - 3}</Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between items-center text-xs text-muted-foreground font-medium">
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-accent" />
                      {t.certificates}: {project.certificates?.length || 0}
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform">{project.demoUrl ? t.liveDemo : t.details} →</span>
                  </CardFooter>
                </Card>
              </a>
            ))
          )}
        </div>

        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
            <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium">No projects found matching your search.</h3>
            <Button variant="link" onClick={() => {setSearch(''); setFilter('all');}}>Clear filters</Button>
          </div>
        )}
      </div>
    </section>
  );
};
