"use client"

import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import { Card, CardContent } from '../ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Award, Calendar, ShieldCheck, Info } from 'lucide-react';
import Image from 'next/image';
import { Certificate } from '@/lib/types';

export const Certificates = () => {
  const { t } = useLanguage();
  const { certificates } = useProjectStore();

  if (certificates.length === 0) return null;

  return (
    <section id="certificates" className="py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-headline mb-4">{t.navCertificates}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A collection of professional certifications and recognitions I've earned throughout my career.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-12">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {certificates.map((cert) => (
                <CarouselItem key={cert.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <CertificateCard cert={cert} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

const CertificateCard = ({ cert }: { cert: Certificate }) => {
  const { t } = useLanguage();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer group h-full">
          <Card className="h-full overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-card rounded-3xl">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <Image 
                src={cert.imageUrl} 
                alt={cert.title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground p-2 rounded-xl shadow-lg">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold font-headline mb-2 group-hover:text-primary transition-colors line-clamp-1">{cert.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{cert.shortDescription}</p>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary/80">
                <ShieldCheck className="h-4 w-4" />
                <span>{cert.issuer}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] rounded-3xl overflow-hidden border-none p-0">
        <div className="relative aspect-video w-full bg-muted">
          <Image src={cert.imageUrl} alt={cert.title} fill className="object-cover" />
        </div>
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-bold font-headline text-primary">{cert.title}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{t.certIssuer}</p>
                <p className="font-bold">{cert.issuer}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-accent/10 rounded-xl text-accent">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{t.certYear}</p>
                <p className="font-bold">{cert.year}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
               <Info className="h-5 w-5 text-primary mt-1 shrink-0" />
               <div>
                 <h4 className="font-bold mb-1">{t.certFullDesc}</h4>
                 <p className="text-sm text-muted-foreground leading-relaxed">{cert.fullDescription}</p>
               </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-2xl">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{t.certValidity}</p>
              <p className="text-sm font-semibold">{cert.validUntil}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
