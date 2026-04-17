
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
    <section id="portfolio" className="py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="mb-24">
          <div className={cn(
            "inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-xl shadow-primary/5 transition-all duration-1000",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span>{language === 'id' ? 'KARYA PILIHAN' : 'SELECTED INFRASTRUCTURE'}</span>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-16">
            <div className="max-w-5xl">
              <h2 className="text-7xl md:text-8xl lg:text-[10rem] font-black font-headline tracking-tighter leading-[0.85] mb-12 text-foreground">
                {language === 'id' ? (
                  <>Protokol<br />Solusi<br />Digital</>
                ) : (
                  <>Engineering<br />Digital<br />Impact</>
                )}
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl font-medium">
                {language === 'id' ? 'Eksplorasi teknis mendalam tentang bagaimana arsitektur kode menjawab tantangan bisnis.' : 'Deep technical exploration of how code architecture addresses enterprise business challenges.'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto no-print">
              <div className="relative w-full sm:w-auto group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder={language === 'id' ? 'Cari unit...' : 'Search units...'} 
                  className="pl-16 w-full sm:w-80 rounded-[2rem] h-16 bg-card border-border/50 shadow-2xl shadow-black/5 focus:ring-4 focus:ring-primary/10 text-base font-bold transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar py-2">
                {(['all', 'web', 'ui', 'backend'] as const).map((cat) => (
                  <Button 
                    key={cat}
                    variant={filter === cat ? 'default' : 'secondary'}
                    className={cn(
                      "rounded-full h-16 px-8 whitespace-nowrap font-black uppercase text-[10px] tracking-widest transition-all",
                      filter === cat ? "shadow-2xl shadow-primary/20 scale-105" : "bg-muted/30 border-border/50 hover:bg-muted"
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-6">
                <div className="aspect-[4/3] rounded-[3rem] skeleton-shimmer"></div>
                <div className="h-8 w-3/4 rounded-xl skeleton-shimmer"></div>
                <div className="h-20 w-full rounded-2xl skeleton-shimmer"></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="py-32 flex flex-col items-center gap-8 text-center animate-in fade-in zoom-in duration-700">
            <div className="p-8 rounded-[3rem] bg-destructive/10 text-destructive border border-destructive/20 shadow-2xl">
              <AlertCircle className="h-16 w-16" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black font-headline">Node Connection Failure</h3>
              <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Unable to fetch infrastructure data from Cloud Services.</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
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
  const problem = language === 'id' ? project.problemId : project.problemEn;
  const solution = language === 'id' ? project.solutionId : project.solutionEn;
  const result = language === 'id' ? project.resultId : project.resultEn;

  // Safe URL Fallback
  const safeImageUrl = project.imageUrl && project.imageUrl.startsWith('http') 
    ? project.imageUrl 
    : `https://placehold.co/800x600?text=${encodeURIComponent(title || 'Project')}`;

  return (
    <div 
      className={cn(
        "group transition-all duration-1000",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <Dialog>
        <DialogTrigger asChild>
          <div className="cursor-pointer group">
            <Card className="glow-effect overflow-hidden h-full border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/5 rounded-[3rem] flex flex-col group-hover:-translate-y-4 transition-all duration-700">
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
                
                <div className="absolute top-8 left-8">
                  <Badge className="bg-background/95 backdrop-blur-md text-foreground uppercase text-[9px] tracking-[0.2em] font-black px-5 py-2 rounded-full border border-border shadow-2xl">{project.type}</Badge>
                </div>
                
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">{project.impactStats || 'Professional Deployment'}</p>
                      <h4 className="text-xl font-black text-white font-headline tracking-tight">{title}</h4>
                   </div>
                   <div className="w-10 h-10 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                      <ArrowRight className="h-5 w-5" />
                   </div>
                </div>
              </div>
              <CardContent className="pt-8 px-10 pb-6 flex-1">
                <p className="text-muted-foreground leading-relaxed line-clamp-2 mb-8 text-sm font-medium">
                  {description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(project.technologies || []).slice(0, 4).map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-[9px] font-black uppercase tracking-wider rounded-lg px-3 py-1.5 bg-muted/80 border-none">{tech}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="px-10 pb-10 flex justify-between items-center pt-6 border-t border-border/10">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] group-hover:gap-4 flex items-center gap-2 transition-all">
                  Analyze Case Study <ExternalLink className="h-4 w-4" />
                </span>
              </CardFooter>
            </Card>
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[1000px] h-[90vh] p-0 rounded-[3rem] overflow-hidden border-none shadow-2xl bg-card">
          <div className="flex flex-col h-full">
            <div className="relative h-2/5 shrink-0">
               <Image src={safeImageUrl} alt={title || "Project"} fill className="object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
               <div className="absolute bottom-10 left-12 right-12 flex justify-between items-end">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Badge className="bg-primary text-primary-foreground font-black px-4">{project.type}</Badge>
                      <Badge className="bg-accent/20 text-accent border-accent/30 font-black px-4">{project.impactStats || 'Performance Verified'}</Badge>
                    </div>
                    <DialogTitle className="text-5xl lg:text-6xl font-black font-headline text-white tracking-tighter leading-tight">{title}</DialogTitle>
                  </div>
                  <div className="flex gap-4 no-print">
                    <Button variant="outline" size="icon" onClick={(e) => handleShare(e, project)} className="rounded-2xl h-14 w-14 bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20">
                      <Share2 className="h-6 w-6" />
                    </Button>
                    <a href={project.demoUrl} target="_blank" rel="noopener">
                      <Button className="rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest gap-3 shadow-2xl shadow-primary/20">
                        Launch System <Zap className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-12">
               <div className="grid lg:grid-cols-12 gap-16">
                  <div className="lg:col-span-8 space-y-16">
                     <section className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                              <AlertCircle className="h-5 w-5 text-destructive" />
                           </div>
                           <h3 className="text-2xl font-black font-headline uppercase tracking-tight">The Core Challenge</h3>
                        </div>
                        <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                           {problem || 'Understanding and addressing specific technical bottlenecks was critical for this deployment. The challenge involved optimizing architecture to meet high-performance requirements while maintaining scalability.'}
                        </p>
                     </section>

                     <section className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                           </div>
                           <h3 className="text-2xl font-black font-headline uppercase tracking-tight">Strategic Implementation</h3>
                        </div>
                        <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                           {solution || 'Leveraged modern full-stack methodologies to build a resilient and modular system. Focused on state management optimization and efficient data fetching to ensure a seamless user experience across all breakpoints.'}
                        </p>
                     </section>

                     <section className="space-y-6">
                        <h3 className="text-2xl font-black font-headline uppercase tracking-tight">Technical Decision Logs</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                           {(project.technologies || []).map(tech => (
                             <div key={tech} className="p-5 rounded-[2rem] bg-muted/30 border border-border/50 flex items-center gap-4">
                               <div className="w-3 h-3 rounded-full bg-primary/40"></div>
                               <span className="font-bold text-sm tracking-tight">{tech}</span>
                             </div>
                           ))}
                        </div>
                     </section>
                  </div>

                  <div className="lg:col-span-4 space-y-12">
                     <div className="p-8 rounded-[3rem] bg-card border-2 border-primary/20 shadow-2xl shadow-primary/5 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                           Verified Impact <Zap className="h-3 w-3" />
                        </h4>
                        <div className="space-y-2">
                           <p className="text-5xl font-black font-headline tracking-tighter">{project.impactStats?.split(' ')[0] || '100%'}</p>
                           <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{project.impactStats?.split(' ').slice(1).join(' ') || 'Optimization Rate'}</p>
                        </div>
                        <div className="pt-6 border-t border-border/50">
                           <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                              "The architectural decisions made for this unit directly contributed to improved performance benchmarks and user retention metrics."
                           </p>
                        </div>
                     </div>

                     <div className="space-y-6 p-8 rounded-[3rem] bg-muted/20 border border-border/50">
                        <h4 className="text-xs font-black uppercase tracking-widest">Metadata</h4>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Deployed At</span>
                              <span className="text-xs font-bold">{new Date(project.updatedAt || Date.now()).toLocaleDateString()}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Scale</span>
                              <span className="text-xs font-bold uppercase tracking-widest">Enterprise</span>
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
