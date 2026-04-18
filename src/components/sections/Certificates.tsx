
"use client"

import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import { Card, CardContent } from '../ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { Award, Eye, Landmark, Info, Loader2, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Certificate } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import Autoplay from "embla-carousel-autoplay";

export const Certificates = () => {
  const { t, language } = useLanguage();
  const { certificates, isLoading, error } = useProjectStore();

  // Konfigurasi Autoplay: Delay lebih lama (6 detik) agar tidak terlalu cepat
  const plugin = React.useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true })
  );

  if (isLoading) {
    return (
      <section id="certificates" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Menyingkronkan Kredensial...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="certificates" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-sm font-bold text-muted-foreground uppercase">Gagal memuat validasi kredensial.</p>
        </div>
      </section>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <section id="certificates" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center space-y-4">
          <Award className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            {language === 'id' ? 'Belum ada sertifikat yang terdaftar.' : 'No certificates registered yet.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="certificates" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <Badge className="bg-accent/10 text-accent border-accent/20 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">Kredensial</Badge>
          <h2 className="text-4xl md:text-5xl font-bold font-headline">{t.navCertificates}</h2>
        </div>
        <div className="max-w-6xl mx-auto px-12">
          <Carousel 
            // Duration ditingkatkan (80) agar transisi lebih lambat dan halus
            opts={{ align: "start", loop: true, skipSnaps: false, duration: 80 }} 
            plugins={[plugin.current]}
            className="w-full"
          >
            <CarouselContent className="-ml-6">
              {certificates.map((cert) => (
                <CarouselItem key={cert.id} className="pl-6 md:basis-1/2 lg:basis-1/3">
                  <CertificateCard cert={cert} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-16 h-12 w-12 hidden md:flex" />
            <CarouselNext className="-right-16 h-12 w-12 hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

const CertificateCard = ({ cert }: { cert: Certificate }) => {
  const { language } = useLanguage();
  const title = language === 'id' ? cert.titleId : cert.titleEn;
  const shortDesc = language === 'id' ? cert.shortDescriptionId : cert.shortDescriptionEn;

  const isValidUrl = (url: string) => {
    return url && (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:'));
  };

  const isPdf = cert.imageUrl && (cert.imageUrl.includes('application/pdf') || cert.imageUrl.toLowerCase().endsWith('.pdf'));

  const handleOpenOriginal = (url: string) => {
    if (!url) return;
    
    // Membuka tautan di tab baru secara langsung untuk performa instan
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer group h-full">
          <Card className="h-full overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-card rounded-[2.5rem] group-hover:-translate-y-2 flex flex-col">
            <div className="relative aspect-[4/3] bg-muted">
              {isValidUrl(cert.imageUrl) && !isPdf ? (
                <Image 
                  src={cert.imageUrl} 
                  alt={title} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-1000" 
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex flex-col items-center justify-center gap-3">
                  {isPdf ? <FileText className="h-16 w-16 text-primary" /> : <Landmark className="h-12 w-12 text-primary/30" />}
                  {isPdf && <p className="text-[10px] font-black uppercase text-primary tracking-widest">Dokumen PDF</p>}
                </div>
              )}
              <div className="absolute top-4 left-4">
                <Badge className="bg-white/90 backdrop-blur-md text-primary font-black text-[8px] uppercase px-3 py-1 rounded-full">
                  {cert.year}
                </Badge>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-full p-4">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <CardContent className="p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></div>
                <span className="text-[9px] font-black text-accent uppercase tracking-widest">{cert.issuer}</span>
              </div>
              <h3 className="text-xl font-bold font-headline mb-3 line-clamp-2 leading-tight">{title}</h3>
              <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed mb-6 font-medium">{shortDesc}</p>
            </CardContent>
          </Card>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] h-[85vh] rounded-[3rem] overflow-hidden border-none p-0 shadow-2xl flex flex-col bg-background">
        <div className="bg-card border-b p-8 shrink-0 flex items-center justify-between gap-6">
           <div className="space-y-1">
             <Badge className="bg-primary text-primary-foreground text-[8px] font-black uppercase px-3">{cert.issuer}</Badge>
             <DialogTitle className="text-2xl md:text-3xl font-black font-headline tracking-tighter">{title}</DialogTitle>
           </div>
           {(cert.credentialUrl || cert.imageUrl) && (
             <Button 
               onClick={() => handleOpenOriginal(cert.credentialUrl || cert.imageUrl || '')}
               className="rounded-2xl h-12 gap-2 font-black uppercase text-[10px] tracking-widest shadow-xl"
             >
               Buka Dokumen Asli <ExternalLink className="h-3 w-3" />
             </Button>
           )}
        </div>
        <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
           {isValidUrl(cert.imageUrl) ? (
             isPdf ? (
               <div className="w-full h-[500px] rounded-[2rem] overflow-hidden border shadow-2xl bg-muted">
                 <iframe src={cert.imageUrl} className="w-full h-full border-none" title={title}></iframe>
               </div>
             ) : (
               <div className="relative aspect-video rounded-[2rem] overflow-hidden border shadow-2xl bg-muted">
                 <Image 
                  src={cert.imageUrl} 
                  alt={title} 
                  fill 
                  className="object-contain" 
                  unoptimized={cert.imageUrl.startsWith('data:')}
                 />
               </div>
             )
           ) : (
             <div className="aspect-video rounded-[2rem] bg-muted/20 border-dashed border flex flex-col items-center justify-center text-muted-foreground">
               <Info className="h-12 w-12 opacity-20" />
               <p className="text-xs font-bold italic mt-4">Visual dokumen tersedia melalui tautan eksternal.</p>
             </div>
           )}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-6 rounded-3xl border shadow-sm text-center">
                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Tahun</p>
                <p className="text-sm font-black">{cert.year}</p>
              </div>
              <div className="bg-card p-6 rounded-3xl border shadow-sm text-center">
                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Validitas</p>
                <p className="text-sm font-black">{cert.validUntil}</p>
              </div>
              <div className="bg-card p-6 rounded-3xl border shadow-sm text-center col-span-2">
                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Status</p>
                <p className="text-sm font-black text-primary">Validasi Industri Aktif</p>
              </div>
           </div>
           <section className="bg-card p-8 rounded-[2.5rem] border shadow-sm space-y-6">
              <h4 className="text-lg font-black font-headline uppercase tracking-tight flex items-center gap-3">
                <Award className="h-5 w-5 text-primary" /> Narasi Validasi Lengkap
              </h4>
              <DialogDescription className="text-muted-foreground leading-relaxed text-base font-medium whitespace-pre-wrap">
                {language === 'id' ? cert.fullDescriptionId : (cert.fullDescriptionEn || cert.fullDescriptionId)}
              </DialogDescription>
           </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
