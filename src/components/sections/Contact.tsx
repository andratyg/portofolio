"use client"

import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Send, MessageSquare, Linkedin, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Contact = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. I will get back to you soon.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 bg-primary text-primary-foreground overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-6">{t.contactMe}</h2>
            <p className="text-xl text-primary-foreground/80 mb-12 max-w-md">
              Have a project in mind or just want to say hello? Let's connect and build something amazing.
            </p>

            <div className="space-y-6">
              <a 
                href="https://wa.me/1234567890" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10 group"
              >
                <div className="p-3 bg-green-500 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">{t.waLink}</p>
                  <p className="text-sm text-primary-foreground/70">+1 (234) 567-890</p>
                </div>
                <ExternalLink className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <a 
                href="https://linkedin.com/in/johndoe" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10 group"
              >
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Linkedin className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">{t.liLink}</p>
                  <p className="text-sm text-primary-foreground/70">linkedin.com/in/username</p>
                </div>
                <ExternalLink className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

          <div className="bg-background rounded-3xl p-8 shadow-2xl text-foreground">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">{t.contactName}</label>
                  <Input required placeholder="Jane Doe" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">{t.contactEmail}</label>
                  <Input required type="email" placeholder="jane@example.com" className="h-12 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">{t.contactMessage}</label>
                <Textarea required placeholder="Tell me about your project..." className="min-h-[150px] rounded-xl" />
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 rounded-xl text-lg font-bold gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? t.loading : (
                  <>
                    {t.sendMessage}
                    <Send className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
