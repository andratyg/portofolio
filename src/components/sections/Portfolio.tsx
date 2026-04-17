"use client"

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, ExternalLink, Zap } from 'lucide-react';
import Image from 'next/image';
import { useProjectStore } from '../ProjectStore';
import { cn } from '@/lib/utils';

export const Portfolio = () => {
  const { t, language } = useLanguage();
  const { projects } = useProjectStore();
  const [filter, setFilter] = useState<'all' | 'web' | 'ui' | 'backend'>('all');
  const [search, setSearch] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const filteredProjects = projects.filter(p => {
    const title = language === 'id' ? (p.titleId || "") : (p.titleEn || p.titleId || "");
    const safeSearch = (search || "").toLowerCase();
    const matchesFilter = filter === 'all' || p.type === filter;
    const matchesSearch = title.toLowerCase().includes(safeSearch) || 
                          (p.technologies || []).some(tech => (tech || "").toLowerCase().includes(safeSearch));
    return matchesFilter && matchesSearch;
  });

  return (
    <section id="portfolio" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header Section matching reference image */}
        <div className="mb-24">
          <Badge className="mb-10 bg-primary/10 text-primary border-primary/20 px-6 py-2 rounded-full font-black uppercase tracking-widest text-[11px]">
            {language === 'id' ? 'PROYEK WEBSITE' : 'WEBSITE PROJECTS'}
          </Badge>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
            <div className="max-w-4xl">
              <h2 className="text-7xl md:text-8xl lg:text-9xl font-black font-headline tracking-tighter leading-[0.9] mb-10 text-foreground">
                {language === 'id' ? (
                  <>Karya<br />Pilihan<br />Saya</>
                ) : (
                  <>My<br />Selected<br />Works</>
                )}
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-xl font-medium">
                {language === 'id' ? 'Eksplorasi solusi digital yang menggabungkan estetika dan performa tinggi.' : 'Exploring digital solutions that combine aesthetics and high performance.'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder={language === 'id' ? 'Cari proyek...' : 'Search projects...'} 
                  className="pl-14 w-full sm:w-80 rounded-[1.5rem] h-14 bg-card border-border shadow-xl shadow-black/5 focus:ring-2 focus:ring-primary/20 text-base font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar py-2">
                {(['all', 'web', 'ui', 'backend'] as const).map((cat) => (
                  <Button 
                    key={cat}
                    variant={filter === cat ? 'default' : 'secondary'}
                    className={cn(
                      "rounded-full h-14 px-6 whitespace-nowrap font-bold text-sm transition-all",
                      filter === cat ? "shadow-xl shadow-primary/20" : "bg-muted/50 hover:bg-muted"
                    )}
                    onClick={() => setFilter(cat)}
                  >
                    {cat === 'all' ? t.filterAll : cat === 'web' ? t.filterWeb : cat === 'ui' ? t.filterUI : t.filterBackend}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProjects.map((project, idx) => (
            <a 
              key={project.id} 
              href={project.demoUrl || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                "block group transition-all duration-700",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <Card className="glow-effect overflow-hidden h-full border-border bg-card shadow-2xl shadow-black/5 rounded-[2.5rem] flex flex-col group-hover:-translate-y-3 transition-all duration-500">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image 
                    src={project.imageUrl || `https://picsum.photos/seed/${project.id}/800/600`} 
                    alt={language === 'id' ? project.titleId : project.titleEn} 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-xl p-4 rounded-full border border-white/30 text-white shadow-2xl">
                       <Zap className="h-6 w-6 fill-white" />
                    </div>
                  </div>
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-background/95 backdrop-blur-md text-foreground uppercase text-[9px] tracking-widest font-black px-4 py-1.5 rounded-full border border-border shadow-lg">{project.type}</Badge>
                  </div>
                </div>
                <CardHeader className="pt-8 px-8">
                  <CardTitle className="text-2xl font-black font-headline group-hover:text-primary transition-colors leading-tight">
                    {language === 'id' ? project.titleId : (project.titleEn || project.titleId)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 px-8 pb-6">
                  <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-6 text-sm font-medium">
                    {language === 'id' ? project.shortDescriptionId : (project.shortDescriptionEn || project.shortDescriptionId)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(project.technologies || []).map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-[9px] font-black uppercase tracking-wider rounded-lg px-2.5 py-1 bg-muted/60 border-none">{tech}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="px-8 pb-10 flex justify-between items-center border-t border-border/50 pt-6 mt-auto">
                  <span className="text-[10px] font-black text-primary flex items-center gap-2 group-hover:gap-4 transition-all uppercase tracking-widest">
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
