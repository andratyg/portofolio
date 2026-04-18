"use client"

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, ExternalLink, Zap, Share2, AlertCircle, ArrowRight, CheckCircle2, Terminal, Activity, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import Image from 'next/image';
import { useProjectStore } from '../ProjectStore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/lib/types';

export const Portfolio = () => {
  const { t, language } = useLanguage();
  const { projects, isLoading, error } = useProjectStore();
  const [filter, setFilter] = useState<'all' | 'web' | 'ui' | 'backend'>('all');
  const [search, setSearch] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => { setIsVisible(true); }, []);

  const filteredProjects = projects.filter(p => {
    const title = language === 'id' ? (p.titleId || "") : (p.titleEn || p.titleId || "");
    const safeSearch = (search || "").toLowerCase();
    const matchesFilter = filter === 'all' || p.type === filter;
    const matchesSearch = title.toLowerCase().includes(safeSearch) || (p.technologies || []).some(tech => (tech || "").toLowerCase().includes(safeSearch));
    return matchesFilter && matchesSearch;
  });

  return (
    <section id="portfolio" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="mb-20">
          <div className={cn("inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em] mb-10 shadow-xl transition-all duration-1000", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}><div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div><span>SELECTED INFRASTRUCTURE</span></div>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
            <h2 className="text-5xl md:text-6xl lg:text-[6.5rem] font-black font-headline tracking-tighter leading-[0.9] text-foreground">Engineering<br />Digital Impact</h2>
            <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar py-1"><div className="relative group flex-1 sm:flex-none"><Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" /><Input placeholder="Scan units..." className="pl-12 w-full sm:w-72 rounded-full h-14 bg-card" value={search} onChange={(e) => setSearch(e.target.value)} /></div></div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProjects.map((project, idx) => (
            <ProjectCard key={project.id} project={project} index={idx} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProjectCard = ({ project, index, isVisible }: { project: Project, index: number, isVisible: boolean }) => {
  const { language } = useLanguage();
  const title = language === 'id' ? project.titleId : project.titleEn;
  const description = language === 'id' ? project.shortDescriptionId : project.shortDescriptionEn;

  return (
    <div className={cn("group transition-all duration-1000", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16")} style={{ transitionDelay: `${index * 100}ms` }}>
      <Dialog>
        <DialogTrigger asChild>
          <div className="cursor-pointer group h-full">
            <Card className="overflow-hidden h-full border-border/50 bg-card/60 backdrop-blur-xl rounded-[2.5rem] flex flex-col group-hover:-translate-y-2 transition-all duration-500">
              <div className="relative aspect-[16/10] bg-muted"><Image src={project.imageUrl || `https://placehold.co/800x500?text=${title}`} alt={title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" /></div>
              <CardContent className="pt-6 px-7 pb-4 flex-1">
                <h4 className="text-xl font-black font-headline mb-3 group-hover:text-primary transition-colors">{title}</h4>
                <p className="text-muted-foreground line-clamp-2 text-sm font-medium">{description}</p>
              </CardContent>
              <CardFooter className="px-7 pb-7 flex justify-between items-center pt-4 border-t border-border/10">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">View Specs <ArrowRight className="h-3 w-3" /></span>
                {project.impactStats && <Badge variant="secondary" className="text-[8px] font-black uppercase px-3 py-1 bg-primary/10 text-primary border-none">{project.impactStats}</Badge>}
              </CardFooter>
            </Card>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] h-[85vh] p-0 rounded-[3rem] overflow-hidden border-none shadow-2xl bg-background flex flex-col">
           <div className="relative h-[40%] shrink-0 bg-muted">
              <Image src={project.imageUrl} alt={title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
              <div className="absolute bottom-8 left-10 right-10 flex flex-col justify-end gap-3">
                 <div className="flex gap-2"><Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full">{project.type}</Badge></div>
                 <DialogTitle className="text-3xl md:text-4xl font-black font-headline text-white tracking-tighter leading-tight">{title}</DialogTitle>
              </div>
           </div>
           <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
              <section className="space-y-4">
                 <h3 className="text-xl font-black font-headline uppercase flex items-center gap-3"><AlertCircle className="h-5 w-5 text-destructive" /> Technical Challenge</h3>
                 <DialogDescription className="text-muted-foreground text-base leading-relaxed font-medium">{project.problemId || project.problemEn}</DialogDescription>
              </section>
              <section className="space-y-4">
                 <h3 className="text-xl font-black font-headline uppercase flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Strategic Solution</h3>
                 <p className="text-muted-foreground text-base leading-relaxed font-medium">{project.solutionId || project.solutionEn}</p>
              </section>
              <section className="space-y-4">
                 <h3 className="text-lg font-black font-headline uppercase flex items-center gap-2"><Terminal className="h-4 w-4 text-primary" /> System Stack</h3>
                 <div className="flex flex-wrap gap-2">{(project.technologies || []).map(t => <Badge key={t} variant="outline" className="px-3 py-1.5 rounded-xl border-primary/20 text-[10px] font-black uppercase">{t}</Badge>)}</div>
              </section>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};