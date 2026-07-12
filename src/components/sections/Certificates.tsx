"use client"

import React, { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { Award, Eye, Landmark, Info, Loader2, AlertCircle, FileText, ExternalLink, Search, ChevronDown, Check } from 'lucide-react';
import Image from 'next/image';
import { Certificate } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useEditableContent } from '../ContentStore';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

export const Certificates = () => {
  const { t, language } = useLanguage();
  const { certificates, isLoading, error } = useProjectStore();
  const { certificatesTitle, certificatesSubtitle } = useEditableContent(language);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssuers, setSelectedIssuers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  const issuers = useMemo(() => 
    Array.from(new Set(certificates.map(c => c.issuer))), 
    [certificates]
  );

  const filteredCertificates = useMemo(() => {
    let filtered = certificates;

    if (searchTerm) {
      filtered = filtered.filter(cert => 
        (cert.titleId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cert.titleEn?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedIssuers.length > 0) {
      filtered = filtered.filter(cert => selectedIssuers.includes(cert.issuer));
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return parseInt(a.year) - parseInt(b.year);
        case 'asc':
          return (language === 'id' ? a.titleId : a.titleEn).localeCompare(language === 'id' ? b.titleId : b.titleEn);
        case 'desc':
          return (language === 'id' ? b.titleId : b.titleEn).localeCompare(language === 'id' ? a.titleId : a.titleEn);
        case 'newest':
        default:
          return parseInt(b.year) - parseInt(a.year);
      }
    });
  }, [certificates, searchTerm, selectedIssuers, sortBy, language]);

  const certificatePages = useMemo(() => {
    const pageSize = 6; // 2x3 grid
    const pages = [];
    for (let i = 0; i < filteredCertificates.length; i += pageSize) {
        pages.push(filteredCertificates.slice(i, i + pageSize));
    }
    return pages;
  }, [filteredCertificates]);

  const handleIssuerToggle = (issuer: string) => {
    setSelectedIssuers(prev => 
      prev.includes(issuer) ? prev.filter(i => i !== issuer) : [...prev, issuer]
    );
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center space-y-4 min-h-[400px]">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Menyingkronkan Kredensial...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center space-y-4 min-h-[400px]">
      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <p className="text-sm font-bold text-muted-foreground uppercase">Gagal memuat validasi kredensial.</p>
    </div>
  );

  return (
    <section id="certificates" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 md:mb-12 space-y-4">
          <Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full font-bold tracking-wider">{certificatesTitle}</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold ">{certificatesSubtitle}</h2>
        </div>

        <div className="max-w-6xl mx-auto bg-card/50 backdrop-blur-lg border p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] shadow-lg mb-8 sm:mb-12 flex flex-col gap-3 sm:gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input 
              placeholder={t.searchCertificates}
              className="h-12 sm:h-14 rounded-xl sm:rounded-2xl pl-10 sm:pl-12 bg-background/50 border-none w-full text-sm sm:text-base"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 sm:gap-4 w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 sm:h-14 rounded-xl sm:rounded-2xl px-3 sm:px-6 flex-1 justify-between gap-1 sm:gap-2 border-dashed bg-transparent">
                  <span className="text-muted-foreground font-bold text-[10px] sm:text-xs truncate">{t.filterByIssuer} ({selectedIssuers.length})</span>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Lembaga Penerbit</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {issuers.map(issuer => (
                  <DropdownMenuCheckboxItem
                    key={issuer}
                    checked={selectedIssuers.includes(issuer)}
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => handleIssuerToggle(issuer)}
                  >
                    {issuer}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-11 sm:h-14 rounded-xl sm:rounded-2xl px-3 sm:px-6 flex-1 sm:w-[180px] bg-transparent border-dashed">
                <SelectValue placeholder={t.sortBy} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t.sortOptions.newest}</SelectItem>
                <SelectItem value="oldest">{t.sortOptions.oldest}</SelectItem>
                <SelectItem value="asc">{t.sortOptions.asc}</SelectItem>
                <SelectItem value="desc">{t.sortOptions.desc}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredCertificates.length > 0 ? (
          <div className="relative px-0 sm:px-10">
            <Carousel
              plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
              opts={{ loop: true }}
              className="max-w-6xl mx-auto"
            >
              <CarouselContent>
                {certificatePages.map((page, index) => (
                  <CarouselItem key={index}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                      {page.map((cert) => (
                        <CertificateCard key={cert.id} cert={cert} />
                      ))}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex -left-2 sm:-left-10 top-1/2 -translate-y-1/2" />
              <CarouselNext className="hidden sm:flex -right-2 sm:-right-10 top-1/2 -translate-y-1/2" />
            </Carousel>
          </div>
        ) : (
          <div className="text-center py-20">
            <Info className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold ">{t.noCertificatesFound}</h3>
            <p className="text-muted-foreground mt-2">{t.noCertificatesFoundHint}</p>
          </div>
        )}
      </div>
    </section>
  );
};

const CertificateCard = ({ cert }: { cert: Certificate }) => {
  const { language } = useLanguage();
  const title = language === 'id' ? cert.titleId : cert.titleEn;
  const shortDesc = language === 'id' ? cert.shortDescriptionId : cert.shortDescriptionEn;

  const hasImage = typeof cert.imageUrl === 'string' && cert.imageUrl.trim().startsWith('http');
  const hasCredentialUrl = typeof cert.credentialUrl === 'string' && cert.credentialUrl.trim().length > 5 && cert.credentialUrl.trim().startsWith('http');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer group h-full py-4">
          {/* interactive-card: proper border-radius + overflow-hidden hover, NO clipPath */}
          <Card className="interactive-card h-full shadow-lg bg-card flex flex-col">
            <div className="relative aspect-[4/3] bg-muted">
              {hasImage ? (
                <div className="card-image-zoom">
                  <Image 
                    src={cert.imageUrl!}
                    alt={title}
                    fill 
                    className="object-cover" 
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex flex-col items-center justify-center gap-3">
                  <Landmark className="h-12 w-12 text-primary/30" />
                </div>
              )}
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-white/90 backdrop-blur-md text-primary font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-sm">
                  {cert.year}
                </Badge>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-400 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-full p-4 scale-75 group-hover:scale-100 transition-transform duration-400 ease-out">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></div>
                <span className="text-xs font-black text-accent tracking-wide capitalize">{cert.issuer.toLowerCase()}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">{title}</h3>
              <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed mb-6 font-medium">{shortDesc}</p>
            </CardContent>
          </Card>
        </div>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[95dvh] sm:h-[85vh] p-0 border-none shadow-2xl flex flex-col bg-background rounded-[2rem] overflow-hidden">
        <div className="bg-card border-b p-5 sm:p-8 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
           <div className="space-y-1">
             <Badge className="bg-primary text-primary-foreground text-xs font-black px-3 capitalize">{cert.issuer.toLowerCase()}</Badge>
             <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-black  tracking-normal">{title}</DialogTitle>
           </div>
           {hasCredentialUrl && (
             <Button 
               onClick={() => window.open(cert.credentialUrl, '_blank', 'noopener,noreferrer')}
               className="rounded-2xl h-12 gap-2 font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all bg-primary text-primary-foreground"
             >
               Buka Dokumen Asli <ExternalLink className="h-3 w-3" />
             </Button>
           )}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-10 space-y-6 sm:space-y-10 no-scrollbar">
           {hasImage ? (
              <div className="relative aspect-video rounded-[2rem] overflow-hidden border shadow-2xl bg-muted">
                 <Image 
                  src={cert.imageUrl!}
                  alt={title} 
                  fill 
                  className="object-contain" 
                 />
              </div>
           ) : (
             <div className="aspect-video rounded-[2rem] bg-muted/20 border-dashed border flex flex-col items-center justify-center text-muted-foreground">
               <Info className="h-12 w-12 opacity-20" />
               <p className="text-xs font-bold italic mt-4">Visual dokumen tidak tersedia.</p>
             </div>
           )}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-6 rounded-3xl border shadow-sm text-center">
                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Tahun Terbit</p>
                <p className="text-sm font-black">{cert.year}</p>
              </div>
              <div className="bg-card p-6 rounded-3xl border shadow-sm text-center">
                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Masa Berlaku</p>
                <p className="text-sm font-black">{cert.validUntil || 'Seumur Hidup'}</p>
              </div>
              <div className="bg-card p-6 rounded-3xl border shadow-sm text-center col-span-2">
                <p className="text-xs font-black text-muted-foreground uppercase mb-1">Status Verifikasi</p>
                <p className="text-sm font-black text-primary">Validasi Industri Terkonfirmasi</p>
              </div>
           </div>
           <section className="bg-card p-8 rounded-[2.5rem] border shadow-sm space-y-6">
              <h4 className="text-lg font-black  uppercase tracking-tight flex items-center gap-3">
                <Award className="h-5 w-5 text-primary" /> Narasi Validasi Kredensial
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
