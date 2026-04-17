
"use client"

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Search, 
  ExternalLink, 
  Zap, 
  Share2, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2,
  Terminal,
  Activity,
  Globe
} from 'lucide-react';
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
              <h2 className="text-5xl md:text-6xl lg:text-[6.5rem] font-black font-headline tracking-tighter leading-[0.9] mb-10 text-foreground">
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
                  className="pl-12 w-full sm:w-72 rounded-full h-14 bg-card border-border/50 shadow-2xl focus:ring-4 focus:ring-primary/10 text-sm font-bold transition-all relative z-0"
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
                <div className="flex items-center gap-4">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    Case Study <ExternalLink className="h-3 w-3" />
                  </span>
                  {project.demoUrl && (
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-accent uppercase tracking-[0.2em]">
                      <Globe className="h-3 w-3" /> Live
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[1000px] h-[90vh] p-0 rounded-[3rem] overflow-hidden border-none shadow-2xl bg-card flex flex-col">
          <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
            <div className="relative h-[45%] shrink-0">
               <Image src={safeImageUrl} alt={title || "Project"} fill className="object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
               
               <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl h-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl flex items-center px-4 gap-4 no-print">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-lg h-6 flex items-center justify-center">
                    <p className="text-[9px] text-white/50 font-medium truncate px-4">{project.demoUrl || 'https://nat.app/case-study'}</p>
                  </div>
               </div>

               <div className="absolute bottom-10 left-12 right-12 flex flex-col md:flex-row justify-between items-end gap-6">
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-primary text-primary-foreground font-black px-4 py-1.5 rounded-full shadow-xl">{project.type}</Badge>
                      <Badge className="bg-accent/20 text-accent border-accent/30 font-black px-4 py-1.5 rounded-full backdrop-blur-xl">{project.impactStats || 'Verified Deployment'}</Badge>
                    </div>
                    <DialogTitle className="text-4xl md:text-6xl font-black font-headline text-white tracking-tighter leading-tight drop-shadow-2xl">
                      {title}
                    </DialogTitle>
                  </div>
                  <div className="flex gap-3 no-print">
                    <Button variant="outline" size="icon" onClick={(e) => handleShare(e, project)} className="rounded-2xl h-14 w-14 bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 shadow-2xl transition-all">
                      <Share2 className="h-6 w-6" />
                    </Button>
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noopener">
                        <Button className="rounded-2xl h-14 px-8 font-black uppercase text-[10px] tracking-widest gap-2 shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
                          Launch Prototype <Zap className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-12 bg-background/50">
               <div className="grid lg:grid-cols-12 gap-16">
                  <div className="lg:col-span-8 space-y-16">
                     <section className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
                              <AlertCircle className="h-6 w-6 text-destructive" />
                           </div>
                           <h3 className="text-2xl font-black font-headline uppercase tracking-tight">Technical Bottleneck</h3>
                        </div>
                        <DialogDescription className="text-muted-foreground text-lg leading-relaxed font-medium">
                           {project.problemId || project.problemEn || 'Detailed challenge narrative pending data synchronization...'}
                        </DialogDescription>
                     </section>

                     <section className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                              <CheckCircle2 className="h-6 w-6 text-primary" />
                           </div>
                           <h3 className="text-2xl font-black font-headline uppercase tracking-tight">Engineered Solution</h3>
                        </div>
                        <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                           {project.solutionId || project.solutionEn || 'Strategic implementation details pending...'}
                        </p>
                     </section>

                     <section className="space-y-6">
                        <h3 className="text-xl font-black font-headline uppercase tracking-tight flex items-center gap-2">
                          <Terminal className="h-5 w-5 text-primary" /> Deployment Architecture
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                           {(project.technologies || []).map(tech => (
                             <div key={tech} className="p-5 rounded-3xl bg-muted/30 border border-border/50 flex items-center gap-4 group hover:bg-primary/5 transition-all">
                               <div className="w-3 h-3 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></div>
                               <span className="font-bold text-xs tracking-tight uppercase">{tech}</span>
                             </div>
                           ))}
                        </div>
                     </section>
                  </div>

                  <div className="lg:col-span-4 space-y-12">
                     <div className="p-8 rounded-[3rem] bg-card border border-primary/20 shadow-2xl space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-2">
                           System Outcome <Activity className="h-4 w-4" />
                        </h4>
                        <div className="space-y-1">
                           <p className="text-5xl font-black font-headline tracking-tighter text-foreground">{project.impactStats?.split(' ')[0] || '100%'}</p>
                           <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">{project.impactStats?.split(' ').slice(1).join(' ') || 'Optimization Rate'}</p>
                        </div>
                        <div className="pt-6 border-t border-border/50">
                           <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                              "The integration of modern architectural patterns resulted in measurable performance gains and systemic stability."
                           </p>
                        </div>
                     </div>

                     <div className="space-y-6 p-8 rounded-[3rem] bg-muted/20 border border-border/50">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unit Metadata</h4>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center pb-4 border-b border-border/20">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Initial Push</span>
                              <span className="text-xs font-black">{new Date(project.updatedAt || Date.now()).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Scale Type</span>
                              <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest px-3 border-primary/30">Enterprise OP</Badge>
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
