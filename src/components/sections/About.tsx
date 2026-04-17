
"use client"

import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import Image from 'next/image';

export const About = () => {
  const { t, language } = useLanguage();
  const { profile } = useProjectStore();

  const role = language === 'id' ? profile.roleId : (profile.roleEn || profile.roleId);
  const aboutText = language === 'id' ? profile.aboutMeId : (profile.aboutMeEn || profile.aboutMeId);

  // Robust URL validation for next/image to prevent 'Invalid URL' errors
  const isValidUrl = (url: any) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    return trimmed.startsWith('http') || trimmed.startsWith('/') || trimmed.startsWith('data:');
  };

  const profileImage = isValidUrl(profile.profilePictureUrl) 
    ? profile.profilePictureUrl 
    : "https://picsum.photos/seed/karyapro-profile/600/800";

  return (
    <section id="about" className="py-20 bg-card overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-accent rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
            <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-background">
              <Image 
                src={profileImage} 
                alt={profile.name} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={false}
              />
            </div>
          </div>
          <div className="space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-wider uppercase">
              {t.aboutMeTitle}
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-headline leading-tight">
              {profile.name} <br />
              <span className="text-primary">{role}</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {aboutText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
