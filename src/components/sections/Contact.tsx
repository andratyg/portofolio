
"use client"

import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Send, MessageSquare, Linkedin, ExternalLink, Github, Instagram, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Contact = () => {
  const { t } = useLanguage();
  const { profile } = useProjectStore();
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
              {socialLinks.map((link) => (
                <a 
                  key={link.id}
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10 group"
                >
                  <div className={`p-3 ${link.color} rounded-xl shadow-lg`}>
                    <link.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{link.label}</p>
                    <p className="text-sm text-primary-foreground/70 truncate max-w-[200px]">{link.value}</p>
                  </div>
                  <ExternalLink className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
              
              {socialLinks.length === 0 && (
                <p className="italic text-primary-foreground/50">No social links configured in admin.</p>
              )}
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
