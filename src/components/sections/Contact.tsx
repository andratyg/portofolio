
"use client"

import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Send, MessageSquare, Linkedin, ExternalLink, Github, Instagram, Video, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Contact = () => {
  const { t } = useLanguage();
  const { profile } = useProjectStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    
    // Basic Client-Side Validation
    if (!email.includes('@')) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. I will get back to you soon.",
      });
      form.reset();
    }, 1500);
  };

  const socialLinks = [
    { 
      id: 'wa', 
      label: t.waLink, 
      value: profile.whatsapp, 
      url: `https://wa.me/${profile.whatsapp}`, 
      icon: MessageSquare, 
      color: 'bg-green-500',
      active: !!profile.whatsapp
    },
    { 
      id: 'li', 
      label: t.liLink, 
      value: profile.linkedin?.replace('https://', ''), 
      url: profile.linkedin, 
      icon: Linkedin, 
      color: 'bg-blue-600',
      active: !!profile.linkedin
    },
    { 
      id: 'ig', 
      label: 'Instagram', 
      value: profile.instagram?.split('/').pop(), 
      url: profile.instagram, 
      icon: Instagram, 
      color: 'bg-pink-600',
      active: !!profile.instagram
    },
    { 
      id: 'gh', 
      label: 'GitHub', 
      value: profile.github?.split('/').pop(), 
      url: profile.github, 
      icon: Github, 
      color: 'bg-slate-800',
      active: !!profile.github
    },
    { 
      id: 'tt', 
      label: 'TikTok', 
      value: profile.tiktok?.split('/').pop(), 
      url: profile.tiktok, 
      icon: Video, 
      color: 'bg-black',
      active: !!profile.tiktok
    },
  ].filter(link => link.active);

  return (
    <section id="contact" className="py-24 bg-primary text-primary-foreground overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-6">{t.contactMe}</h2>
            <p className="text-xl text-primary-foreground/80 mb-12 max-w-md">
              Have a project in mind or just want to say hello? Let's connect and build something amazing.
            </p>

            <div className="space-y-6">
              {socialLinks.map((link) => (
                <a 
                  key={link.id}
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={`Contact me via ${link.label}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10 group no-print"
                >
                  <div className={`p-3 ${link.color} rounded-xl shadow-lg`}>
                    <link.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{link.label}</p>
                    <p className="text-sm text-primary-foreground/70 truncate max-w-[200px]">{link.value}</p>
                  </div>
                  <ExternalLink className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
              
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg">Email</p>
                  <p className="text-sm text-primary-foreground/70">admin@karyapro.app</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background rounded-[3rem] p-10 shadow-2xl text-foreground no-print">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.contactName}</label>
                  <Input id="name" required name="name" placeholder="Jane Doe" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.contactEmail}</label>
                  <Input id="email" required type="email" name="email" placeholder="jane@example.com" className="h-12 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.contactMessage}</label>
                <Textarea id="message" required name="message" placeholder="Tell me about your project..." className="min-h-[150px] rounded-xl" />
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 rounded-xl text-lg font-bold gap-2 bg-primary text-primary-foreground hover:scale-[0.98] transition-all"
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
