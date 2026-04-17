"use client"

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, ExternalLink, Zap, Share2, Loader2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
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

  const handleShare = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    const title = language === 'id' ? project.titleId : project.titleEn;
    if (navigator.share) {
      navigator.share({
        title,
        text: language === 'id' ? project.shortDescriptionId : project.shortDescriptionEn,
        url: project.demoUrl || window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(project.demoUrl || window.location.href);
      toast({ title: "Reference Copied", description: `Link to ${title} added to clipboard.` });
    }
  };

  return (
    <section id="portfolio" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="mb-20">
          <div className={cn(
            "inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em] mb-10 shadow-xl shadow-primary/5 transition-all duration-1000",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span>{language === 'id' ? 'KARYA PILIHAN' : 'SELECTED INFRASTRUCTURE'}</span>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
            <div className="max-w-4xl">
              <h2 className="text-5xl md:text-6xl lg:text-[8.5rem] font-black font-headline tracking-tighter leading-[0.9] mb-10 text-foreground">
                {language === 'id' ? (
                  <>Protokol<br />Solusi<br />Digital</>
                ) : (
                  <>Engineering<br />Digital<br />Impact</>
                )}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl font-medium">
                {language === 'id' ? 'Eksplorasi teknis mendalam tentang bagaimana arsitektur kode menjawab tantangan bisnis.' : 'Deep technical exploration of how code architecture addresses enterprise business challenges.'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto no-print">
              <div className="relative group flex-1 sm:flex-none">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                <Input 
                  placeholder={language === 'id' ? 'Cari unit...' : 'Search units...'} 
                  className="pl-12 w-full sm:w-72 rounded-full h-14 bg-card border-border/50 shadow-2xl shadow-black/5 focus:ring-4 focus:ring-primary/10 text-sm font-bold transition-all relative z-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 sm:py-0">
                {(['all', 'web', 'ui', 'backend'] as const).map((cat) => (
                  <Button 
                    key={cat}
                    variant={filter === cat ? 'default' : 'secondary'}
                    className={cn(
                      "rounded-full h-14 px-6 whitespace-nowrap font-black uppercase text-[9px] tracking-widest transition-all",
                      filter === cat ? "shadow-xl shadow-primary/30 scale-105" : "bg-muted/30 border-border/50 hover:bg-muted"
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

        {/* Loading / Error States */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/3] rounded-[2rem] skeleton-shimmer"></div>
                <div className="h-6 w-3/4 rounded-lg skeleton-shimmer"></div>
                <div className="h-16 w-full rounded-xl skeleton-shimmer"></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="py-24 flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in duration-700">
            <div className="p-6 rounded-[2rem] bg-destructive/10 text-destructive border border-destructive/20 shadow-2xl">
              <AlertCircle className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black font-headline">Node Connection Failure</h3>
              <p className="text-muted-foreground font-medium uppercase text-[9px] tracking-widest">Unable to fetch infrastructure data from Cloud Services.</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {!isLoading && !error && filteredProjects.map((project, idx) => (
            <ProjectCard key={project.id} project={project} index={idx} isVisible={isVisible} handleShare={handleShare} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProjectCard = ({ project, index, isVisible, handleShare }: { project: Project, index: number, isVisible: boolean, handleShare: any }) => {
  const { language, t } = useLanguage();
  const title = language === 'id' ? project.titleId : project.titleEn;
  const description = language === 'id' ? project.shortDescriptionId : project.shortDescriptionEn;

  // Safe URL Fallback
  const safeImageUrl = project.imageUrl && project.imageUrl.startsWith('http') 
    ? project.imageUrl 
    : `https://placehold.co/800x600?text=${encodeURIComponent(title || 'Project')}`;

  return (
    <div 
      className={cn(
        "group transition-all duration-1000",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Dialog>
        <DialogTrigger asChild>
          <div className="cursor-pointer group">
            <Card className="glow-effect overflow-hidden h-full border-border/50 bg-card/50 backdrop-blur-xl shadow-xl shadow-black/5 rounded-[2.5rem] flex flex-col group-hover:-translate-y-3 transition-all duration-700">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image 
                  src={safeImageUrl} 
                  alt={title || "Project"} 
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="absolute top-6 left-6">
                  <Badge className="bg-background/95 backdrop-blur-md text-foreground uppercase text-[8px] tracking-[0.2em] font-black px-4 py-1.5 rounded-full border border-border shadow-2xl">{project.type}</Badge>
                </div>
                
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">{project.impactStats || 'Professional Deployment'}</p>
                      <h4 className="text-lg font-black text-white font-headline tracking-tight">{title}</h4>
                   </div>
                   <div className="w-8 h-8 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                      <ArrowRight className="h-4 w-4" />
                   </div>
                </div>
              </div>
              <CardContent className="pt-6 px-8 pb-4 flex-1">
                <p className="text-muted-foreground leading-relaxed line-clamp-2 mb-6 text-sm font-medium">
                  {description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(project.technologies || []).slice(0, 4).map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-[8px] font-black uppercase tracking-wider rounded-lg px-2.5 py-1 bg-muted/80 border-none">{tech}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="px-8 pb-8 flex justify-between items-center pt-4 border-t border-border/10">
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] group-hover:gap-3 flex items-center gap-2 transition-all">
                  Analyze Case Study <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </CardFooter>
            </Card>
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[900px] h-[85vh] p-0 rounded-[2.5rem] overflow-hidden border-none shadow-2xl bg-card">
          <div className="flex flex-col h-full">
            <div className="relative h-[35%] shrink-0">
               <Image src={safeImageUrl} alt={title || "Project"} fill className="object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
               <div className="absolute bottom-8 left-10 right-10 flex justify-between items-end">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Badge className="bg-primary text-primary-foreground font-black px-3">{project.type}</Badge>
                      <Badge className="bg-accent/20 text-accent border-accent/30 font-black px-3">{project.impactStats || 'Performance Verified'}</Badge>
                    </div>
                    <DialogTitle className="text-4xl lg:text-5xl font-black font-headline text-white tracking-tighter leading-tight">{title}</DialogTitle>
                  </div>
                  <div className="flex gap-3 no-print">
                    <Button variant="outline" size="icon" onClick={(e) => handleShare(e, project)} className="rounded-xl h-12 w-12 bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20">
                      <Share2 className="h-5 w-5" />
                    </Button>
                    <a href={project.demoUrl} target="_blank" rel="noopener">
                      <Button className="rounded-xl h-12 px-6 font-black uppercase text-[10px] tracking-widest gap-2 shadow-2xl shadow-primary/20">
                        Launch System <Zap className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-10">
               <div className="grid lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8 space-y-12">
                     <section className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                              <AlertCircle className="h-4 w-4 text-destructive" />
                           </div>
                           <h3 className="text-xl font-black font-headline uppercase tracking-tight">The Core Challenge</h3>
                        </div>
                        <p className="text-muted-foreground text-base leading-relaxed font-medium">
                           {project.problemId || project.problemEn || 'Understanding and addressing specific technical bottlenecks was critical for this deployment. The challenge involved optimizing architecture to meet high-performance requirements while maintaining scalability.'}
                        </p>
                     </section>

                     <section className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                           </div>
                           <h3 className="text-xl font-black font-headline uppercase tracking-tight">Strategic Implementation</h3>
                        </div>
                        <p className="text-muted-foreground text-base leading-relaxed font-medium">
                           {project.solutionId || project.solutionEn || 'Leveraged modern full-stack methodologies to build a resilient and modular system. Focused on state management optimization and efficient data fetching to ensure a seamless user experience across all breakpoints.'}
                        </p>
                     </section>

                     <section className="space-y-4">
                        <h3 className="text-xl font-black font-headline uppercase tracking-tight">Technical Decision Logs</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                           {(project.technologies || []).map(tech => (
                             <div key={tech} className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex items-center gap-3">
                               <div className="w-2.5 h-2.5 rounded-full bg-primary/40"></div>
                               <span className="font-bold text-xs tracking-tight">{tech}</span>
                             </div>
                           ))}
                        </div>
                     </section>
                  </div>

                  <div className="lg:col-span-4 space-y-10">
                     <div className="p-6 rounded-[2rem] bg-card border-2 border-primary/20 shadow-xl shadow-primary/5 space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                           Verified Impact <Zap className="h-3 w-3" />
                        </h4>
                        <div className="space-y-1">
                           <p className="text-4xl font-black font-headline tracking-tighter">{project.impactStats?.split(' ')[0] || '100%'}</p>
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{project.impactStats?.split(' ').slice(1).join(' ') || 'Optimization Rate'}</p>
                        </div>
                        <div className="pt-4 border-t border-border/50">
                           <p className="text-[10px] font-medium text-muted-foreground leading-relaxed italic">
                              "The architectural decisions made for this unit directly contributed to improved performance benchmarks and user retention metrics."
                           </p>
                        </div>
                     </div>

                     <div className="space-y-4 p-6 rounded-[2rem] bg-muted/20 border border-border/50">
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Metadata</h4>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Deployed At</span>
                              <span className="text-[10px] font-bold">{new Date(project.updatedAt || Date.now()).toLocaleDateString()}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Scale</span>
                              <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
