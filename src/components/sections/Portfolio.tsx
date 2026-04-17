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
  const { t, language } = useLanguage();
  const { projects } = useProjectStore();
  const [filter, setFilter] = useState<'all' | 'web' | 'ui' | 'backend'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredProjects = projects.filter(p => {
    const title = language === 'id' ? p.titleId : (p.titleEn || p.titleId);
    const matchesFilter = filter === 'all' || p.type === filter;
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                          p.technologies.some(tech => tech.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <section id="portfolio" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold font-headline">{t.navPortfolio}</h2>
            <p className="text-muted-foreground text-lg">{language === 'id' ? 'Klik proyek untuk melihat website.' : 'Click any project to visit the live website.'}</p>
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
          {filteredProjects.map((project) => (
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
                    alt={language === 'id' ? project.titleId : project.titleEn} 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 backdrop-blur-md text-black hover:bg-white uppercase text-[10px] tracking-widest font-bold px-3 py-1 rounded-full">{project.type}</Badge>
                  </div>
                </div>
                <CardHeader className="pt-8">
                  <CardTitle className="text-2xl font-bold font-headline group-hover:text-primary transition-colors">
                    {language === 'id' ? project.titleId : (project.titleEn || project.titleId)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 px-6">
                  <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                    {language === 'id' ? project.shortDescriptionId : (project.shortDescriptionEn || project.shortDescriptionId)}
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
          ))}
        </div>
      </div>
    </section>
  );
};
