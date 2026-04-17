"use client"

import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import Image from 'next/image';

export const About = () => {
  const { t } = useLanguage();
  const { profile } = useProjectStore();

  return (
    <section id="about" className="py-24 bg-card overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-accent rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
            <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-background">
              <Image 
                src={profile.profileImageUrl} 
                alt={profile.name} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
          </div>
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wider uppercase">
              {t.aboutMeTitle}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-headline leading-tight">
              {profile.name} <br />
              <span className="text-primary">{profile.role}</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {profile.aboutText}
            </p>
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-primary/10">
              <div className="space-y-2">
                <h4 className="text-3xl font-bold font-headline text-primary">High Quality</h4>
                <p className="text-sm text-muted-foreground">Clean, maintainable, and efficient code is my top priority.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-bold font-headline text-accent">User Centric</h4>
                <p className="text-sm text-muted-foreground">Always designing with the end-user's experience in mind.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
