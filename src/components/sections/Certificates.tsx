"use client"

import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import { Card, CardContent } from '../ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Award, Calendar, ShieldCheck, Info } from 'lucide-react';
import Image from 'next/image';
import { Certificate } from '@/lib/types';
import { Badge } from '../ui/badge';

export const Certificates = () => {
  const { t, language } = useLanguage();
  const { certificates } = useProjectStore();

  if (certificates.length === 0) return null;

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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer group h-full">
          <Card className="h-full overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-card rounded-[2.5rem] group-hover:-translate-y-2">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <Image src={cert.imageUrl} alt={title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
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
      
      <DialogContent className="sm:max-w-[700px] rounded-[3rem] overflow-hidden border-none p-0 shadow-2xl">
        <div className="relative aspect-video w-full bg-muted">
          <Image src={cert.imageUrl} alt={title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-6 left-8 text-white">
             <Badge className="bg-accent text-white mb-2">{cert.issuer}</Badge>
             <DialogTitle className="text-3xl font-bold font-headline leading-tight">{title}</DialogTitle>
          </div>
        </div>
        <div className="p-10">
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="space-y-1 p-5 bg-muted/40 rounded-3xl">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{t.certIssuer}</p>
              <p className="font-bold text-lg">{cert.issuer}</p>
            </div>
            <div className="space-y-1 p-5 bg-muted/40 rounded-3xl">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{t.certYear}</p>
              <p className="font-bold text-lg">{cert.year}</p>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-lg font-bold mb-2">{t.certFullDesc}</h4>
            <p className="text-muted-foreground leading-relaxed text-base">{fullDesc}</p>
            <div className="p-6 bg-accent/5 border border-accent/10 rounded-3xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">{t.certValidity}</p>
                <p className="font-bold text-lg">{cert.validUntil}</p>
              </div>
              <Award className="h-10 w-10 text-accent/20" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
