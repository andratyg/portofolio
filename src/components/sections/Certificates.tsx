"use client"

import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import { Card, CardContent } from '../ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Award, Calendar, ShieldCheck, Info, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
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
  const fullDesc = language === 'id' ? cert.fullDescriptionId : (cert.fullDescriptionEn || cert.fullDescriptionId);
  
  // Safe URL Fallback
  const safeImageUrl = cert.imageUrl && cert.imageUrl.startsWith('http') 
    ? cert.imageUrl 
    : `https://placehold.co/800x600?text=${encodeURIComponent(title || 'Certificate')}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer group h-full">
          <Card className="h-full overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-card rounded-[2.5rem] group-hover:-translate-y-2">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <Image 
                src={safeImageUrl} 
                alt={title || "Certificate"} 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold font-headline mb-3 group-hover:text-accent transition-colors line-clamp-2">{title}</h3>
              <p className="text-muted-foreground line-clamp-2 mb-6 text-sm leading-relaxed">{shortDesc}</p>
              <div className="flex items-center gap-3 text-sm font-bold text-accent">
                <ShieldCheck className="h-4 w-4" />
                <span>{cert.issuer}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[800px] h-[90vh] rounded-[3rem] overflow-hidden border-none p-0 shadow-2xl flex flex-col">
        <div className="relative aspect-video w-full bg-muted shrink-0">
          <Image src={safeImageUrl} alt={title || "Certificate"} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute bottom-6 left-8 right-8 text-white flex justify-between items-end">
             <div className="space-y-1">
               <Badge className="bg-accent text-white mb-2">{cert.issuer}</Badge>
               <DialogTitle className="text-3xl font-bold font-headline leading-tight">{title}</DialogTitle>
             </div>
             {cert.credentialUrl && (
               <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="no-print">
                 <Button className="rounded-2xl h-12 gap-2 bg-white text-black hover:bg-white/90 font-black uppercase text-[10px] tracking-widest shadow-2xl">
                   <CheckCircle2 className="h-4 w-4" /> Verify Credential
                 </Button>
               </a>
             )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-1 p-5 bg-muted/40 rounded-3xl text-center">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black mb-1">{t.certIssuer}</p>
              <p className="font-bold text-base">{cert.issuer}</p>
            </div>
            <div className="space-y-1 p-5 bg-muted/40 rounded-3xl text-center">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black mb-1">{t.certYear}</p>
              <p className="font-bold text-base">{cert.year}</p>
            </div>
            <div className="space-y-1 p-5 bg-muted/40 rounded-3xl text-center">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black mb-1">VALIDITY</p>
              <p className="font-bold text-base">{cert.validUntil}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
               </div>
               <h4 className="text-xl font-bold font-headline uppercase tracking-tight">{t.certFullDesc}</h4>
            </div>
            <p className="text-muted-foreground leading-relaxed text-base bg-muted/20 p-8 rounded-[2rem] border border-border/50">
              {fullDesc}
            </p>
          </div>

          {cert.credentialUrl && (
            <div className="p-8 bg-accent/5 border border-accent/20 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <p className="text-[10px] font-black text-accent uppercase tracking-widest">OFFICIAL AUTHENTICATION</p>
                <p className="text-sm font-medium text-muted-foreground">This certificate has been verified by the issuing authority and is permanently logged in the official credential vault.</p>
              </div>
              <div className="flex gap-4">
                <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="rounded-xl border-accent/20 hover:bg-accent/10 h-12 px-6 gap-2 text-xs font-bold">
                    <ExternalLink className="h-4 w-4" /> View Verification Page
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
