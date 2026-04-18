"use client"

import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import { Card, CardContent } from '../ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { Award, ShieldCheck, ExternalLink, FileText, CheckCircle2, Eye, Landmark, Info } from 'lucide-react';
import Image from 'next/image';
import { Certificate } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export const Certificates = () => {
  const { t, language } = useLanguage();
  const { certificates } = useProjectStore();

  if (!certificates || certificates.length === 0) return null;

  return (
    <section id="certificates" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-accent/20 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">Credentials</Badge>
          <h2 className="text-4xl md:text-5xl font-bold font-headline">{t.navCertificates}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            {language === 'id' ? 'Koleksi sertifikasi profesional yang memvalidasi keahlian teknis saya.' : 'A curated showcase of professional certifications validating my technical expertise.'}
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-12">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-6">
              {certificates.map((cert) => (
                <CarouselItem key={cert.id} className="pl-6 md:basis-1/2 lg:basis-1/3">
                  <CertificateCard cert={cert} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="-left-16 h-12 w-12" />
              <CarouselNext className="-right-16 h-12 w-12" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

const CertificateCard = ({ cert }: { cert: Certificate }) => {
  const { t, language } = useLanguage();
  const title = language === 'id' ? cert.titleId : (cert.titleEn || cert.titleId);
  const shortDesc = language === 'id' ? cert.shortDescriptionId : (cert.shortDescriptionEn || cert.shortDescriptionId);
  
  const hasImage = !!cert.imageUrl && (cert.imageUrl.startsWith('http') || cert.imageUrl.startsWith('data:image'));
  // Removed random picsum fallback to ensure only uploaded images are shown.
  // Using a neutral background if no image is provided.

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer group h-full">
          <Card className="h-full overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-card rounded-[2.5rem] group-hover:-translate-y-2 flex flex-col">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center">
              {hasImage ? (
                <Image 
                  src={cert.imageUrl} 
                  alt={title || "Certificate"} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex flex-col items-center justify-center text-center p-8">
                   <Landmark className="h-12 w-12 mb-4 text-primary opacity-30" />
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">{cert.issuer}</p>
                </div>
              )}
              <div className="absolute top-4 left-4 z-10">
                 <Badge className="bg-white/90 backdrop-blur-md text-primary font-black text-[8px] uppercase px-3 py-1 rounded-full border border-primary/20">{cert.year}</Badge>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                 <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-full p-4 scale-75 group-hover:scale-100 transition-all duration-500 shadow-2xl">
                    <Eye className="h-6 w-6 text-white" />
                 </div>
              </div>
            </div>
            <CardContent className="p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                 <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></div>
                 <span className="text-[9px] font-black text-accent uppercase tracking-widest">{cert.issuer}</span>
              </div>
              <h3 className="text-xl font-bold font-headline mb-3 group-hover:text-accent transition-colors line-clamp-2 leading-tight">{title}</h3>
              <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed mb-6 font-medium">
                 {shortDesc}
              </p>
              <div className="mt-auto pt-6 border-t border-border/10 flex justify-between items-center">
                 <div className="flex items-center gap-2 text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                    <ShieldCheck className="h-3 w-3" /> Professional
                 </div>
                 <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Specs →</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogTrigger>
      
      {/* Dialog Size set to 700px (Medium) */}
      <DialogContent className="sm:max-w-[700px] h-[85vh] rounded-[3rem] overflow-hidden border-none p-0 shadow-2xl flex flex-col">
        <div className="bg-card border-b p-8 shrink-0 flex items-center justify-between gap-6">
           <div className="space-y-1">
             <div className="flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground text-[8px] font-black uppercase px-3">{cert.issuer}</Badge>
                <div className="flex items-center gap-1 text-[8px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                   <CheckCircle2 className="h-3 w-3" /> VERIFIED
                </div>
             </div>
             <DialogTitle className="text-2xl md:text-3xl font-black font-headline tracking-tighter">{title}</DialogTitle>
           </div>
           {cert.credentialUrl && (
             <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="no-print">
               <Button className="rounded-2xl h-12 gap-2 bg-primary text-primary-foreground hover:scale-105 font-black uppercase text-[10px] tracking-widest shadow-xl transition-all">
                 <ExternalLink className="h-4 w-4" /> Open Original
               </Button>
             </a>
           )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-0 flex flex-col no-scrollbar bg-muted/30">
          <div className="p-8 space-y-10">
             {cert.credentialUrl && (cert.credentialUrl.startsWith('data:application/pdf') || cert.credentialUrl.includes('.pdf')) ? (
               <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                     <FileText className="h-4 w-4 text-primary" />
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Document Viewer</h4>
                  </div>
                  <div className="w-full aspect-[4/3] md:aspect-[16/11] rounded-[2rem] overflow-hidden border shadow-2xl bg-white relative">
                     <iframe 
                        src={`${cert.credentialUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                        className="w-full h-full border-none"
                        title="Certificate PDF Viewer"
                     />
                     <div className="absolute top-4 right-4 no-print">
                        <Badge variant="secondary" className="backdrop-blur-xl bg-white/50 border-white/50 text-[8px] font-black uppercase px-3 py-1">Secure Preview</Badge>
                     </div>
                  </div>
               </div>
             ) : hasImage ? (
               <div className="w-full relative aspect-video rounded-[2rem] overflow-hidden border shadow-2xl">
                  <Image src={cert.imageUrl!} alt={title || "Certificate"} fill className="object-cover" />
               </div>
             ) : (
               <div className="w-full aspect-video rounded-[2rem] bg-card border border-dashed flex flex-col items-center justify-center gap-4 text-muted-foreground">
                  <Info className="h-12 w-12 opacity-20" />
                  <p className="text-xs font-bold italic">Visual proof available via "Open Original" button.</p>
               </div>
             )}

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card p-6 rounded-3xl border shadow-sm text-center">
                   <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Year</p>
                   <p className="text-sm font-black">{cert.year}</p>
                </div>
                <div className="bg-card p-6 rounded-3xl border shadow-sm text-center">
                   <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Validity</p>
                   <p className="text-sm font-black">{cert.validUntil}</p>
                </div>
                <div className="bg-card p-6 rounded-3xl border shadow-sm text-center col-span-2">
                   <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                   <p className="text-sm font-black text-primary">Active Industry Validation</p>
                </div>
             </div>

             <div className="bg-card p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Award className="h-5 w-5 text-primary" />
                   </div>
                   <h4 className="text-lg font-black font-headline uppercase tracking-tight">Full Validation Narrative</h4>
                </div>
                <DialogDescription className="text-muted-foreground leading-relaxed text-base font-medium">
                  {cert.fullDescriptionId || cert.fullDescriptionEn || t.certFullDesc}
                </DialogDescription>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};