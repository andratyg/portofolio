"use client"

import React from 'react';
import { useLanguage } from '../LanguageContext';
import { testimonials } from '@/lib/data';
import { Card, CardContent } from '../ui/card';
import { Quote } from 'lucide-react';
import Image from 'next/image';

export const Testimonials = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold font-headline text-center mb-16">{t.testimonials}</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((test) => (
            <Card key={test.id} className="border-none shadow-xl bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 relative overflow-hidden group">
              <Quote className="absolute -top-4 -right-4 h-24 w-24 text-primary/5 rotate-12 transition-transform group-hover:scale-125 duration-500" />
              <CardContent className="p-0 relative z-10">
                <p className="text-lg italic text-muted-foreground mb-8 leading-relaxed">
                  "{test.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary shadow-lg">
                    <Image src={test.avatarUrl} alt={test.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{test.name}</h4>
                    <p className="text-sm text-primary font-medium">{test.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
