"use client"

import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useProjectStore } from '../ProjectStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Send, MessageSquare, Linkedin, ExternalLink, Github, Instagram, Video, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const Contact = () => {
  const { t } = useLanguage();
  const { profile } = useProjectStore();
  const { toast } = useToast();
  const db = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
    
    if (!email.includes('@')) {
      toast({ variant: "destructive", title: "Invalid Email" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'messages'), {
        name,
        email,
        message,
        createdAt: new Date().toISOString()
      });
      toast({ title: "Message Sent!", description: "Transmission successful. I will respond soon." });
      form.reset();
    } catch (error) {
      toast({ variant: "destructive", title: "Transmission Failed", description: "Node error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { id: 'wa', label: t.waLink, value: profile.whatsapp, url: `https://wa.me/${profile.whatsapp}`, icon: MessageSquare, color: 'bg-green-500', active: !!profile.whatsapp },
    { id: 'li', label: t.liLink, value: profile.linkedin?.replace('https://', ''), url: profile.linkedin, icon: Linkedin, color: 'bg-blue-600', active: !!profile.linkedin },
    { id: 'ig', label: 'Instagram', value: profile.instagram?.split('/').pop() || 'Instagram', url: profile.instagram, icon: Instagram, color: 'bg-pink-600', active: !!profile.instagram },
    { id: 'gh', label: 'GitHub', value: profile.github?.split('/').pop() || 'GitHub', url: profile.github, icon: Github, color: 'bg-slate-800', active: !!profile.github },
    { id: 'tt', label: 'TikTok', value: profile.tiktok?.split('/').pop() || 'TikTok', url: profile.tiktok, icon: Video, color: 'bg-black', active: !!profile.tiktok },
  ].filter(link => link.active);

  return (
    <section id="contact" className="py-24 bg-primary text-primary-foreground overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/2"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-6">{t.contactMe}</h2>
            <p className="text-xl text-primary-foreground/80 mb-12 max-w-md">Initialize a new communication node. Let's build future-ready architecture together.</p>
            <div className="space-y-6">
              {socialLinks.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 group no-print">
                  <div className={`p-3 ${link.color} rounded-xl shadow-lg`}><link.icon className="h-6 w-6 text-white" /></div>
                  <div className="flex-1"><p className="font-bold text-lg">{link.label}</p><p className="text-sm text-primary-foreground/70 truncate">{link.value}</p></div>
                  <ExternalLink className="h-5 w-5 opacity-0 group-hover:opacity-100" />
                </a>
              ))}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="p-3 bg-white/10 rounded-xl"><Mail className="h-6 w-6 text-white" /></div>
                <div><p className="font-bold text-lg">Email Node</p><p className="text-sm text-primary-foreground/70">{profile.email || 'admin@karyapro.app'}</p></div>
              </div>
            </div>
          </div>
          <div className="bg-background rounded-[3rem] p-10 shadow-2xl text-foreground no-print">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.contactName}</label><Input id="name" required name="name" placeholder="User Alpha" className="h-12 rounded-xl" /></div>
                <div className="space-y-2"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.contactEmail}</label><Input id="email" required type="email" name="email" placeholder="alpha@network.com" className="h-12 rounded-xl" /></div>
              </div>
              <div className="space-y-2"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.contactMessage}</label><Textarea id="message" required name="message" placeholder="Input payload..." className="min-h-[150px] rounded-xl" /></div>
              <Button type="submit" className="w-full h-14 rounded-xl text-lg font-bold gap-2 bg-primary text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{t.sendMessage}<Send className="h-5 w-5" /></>}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};