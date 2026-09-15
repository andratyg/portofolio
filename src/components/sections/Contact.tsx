
"use client"

import React, { useState } from 'react';
import { useLanguage } from '../providers/LanguageContext';
import { useProjectStore } from '@/stores/ProjectStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Send, Linkedin, ExternalLink, Github, Instagram, Mail, Loader2 } from 'lucide-react';
import { TikTokIcon } from '@/components/icons/TikTokIcon';

// Inline WhatsApp SVG — replaces react-icons/fa (441 KiB bundle) with zero overhead
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
import { m as motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export const Contact = () => {
  const { t } = useLanguage();
  const { profile } = useProjectStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
    
    const honey = (form.elements.namedItem('_honey') as HTMLInputElement)?.value;

    if (honey) {
      // Bot detected, fake success
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        form.reset();
        setTimeout(() => setIsSuccess(false), 3000);
      }, 1000);
      return;
    }

    if (!email.includes('@')) {
      alert("Invalid Email");
      return;
    }

    setIsSubmitting(true);
    setIsSuccess(false);
    try {
      const { collection, addDoc, initializeFirestore, getFirestore } = await import('firebase/firestore');
      const { initializeFirebase } = await import('@/firebase');
      const services = initializeFirebase();
      let db;
      try {
        db = initializeFirestore(services.firebaseApp, { experimentalAutoDetectLongPolling: true });
      } catch {
        db = getFirestore(services.firebaseApp);
      }
      await addDoc(collection(db, 'messages'), {
        name,
        email,
        message,
        createdAt: new Date().toISOString()
      });
      setIsSuccess(true);
      form.reset();
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      alert("Transmission Failed. Node error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { id: 'wa', label: t.waLink, value: profile.whatsapp, url: `https://wa.me/${profile.whatsapp}`, icon: WhatsAppIcon, color: 'bg-green-500', active: !!profile.whatsapp },
    { id: 'li', label: t.liLink, value: profile.linkedin?.replace('https://', ''), url: profile.linkedin, icon: Linkedin, color: 'bg-blue-600', active: !!profile.linkedin },
    { id: 'ig', label: 'Instagram', value: profile.instagram?.split('/').pop() || 'Instagram', url: profile.instagram, icon: Instagram, color: 'bg-pink-600', active: !!profile.instagram },
    { id: 'gh', label: 'GitHub', value: profile.github?.split('/').pop() || 'GitHub', url: profile.github, icon: Github, color: 'bg-slate-800', active: !!profile.github },
    { id: 'tt', label: 'TikTok', value: profile.tiktok?.split('/').pop() || 'TikTok', url: profile.tiktok, icon: TikTokIcon, color: 'bg-black border border-zinc-800', active: !!profile.tiktok },
  ].filter(link => link.active);

  return (
    <section id="contact" className="py-16 md:py-24 bg-primary text-primary-foreground overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/2"></div>
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start overflow-hidden">
          <div className="min-w-0">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">{t.contactMe}</h2>
            <p className="text-base sm:text-xl text-primary-foreground/80 mb-8 sm:mb-12 max-w-prose break-words">
              {t.contactSubtitle || "Hubungi saya untuk mendiskusikan peluang kerja sama atau proyek impian Anda."}
            </p>
            <div className="space-y-3 sm:space-y-6">
              {socialLinks.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white/10 border border-white/10 group no-print min-w-0
                              hover:bg-white/20 hover:border-white/20 hover:-translate-y-0.5
                              transition-[background-color,border-color,transform] duration-300 ease-out"
                >
                  <div className={`p-2 sm:p-3 ${link.color} rounded-xl shadow-lg shrink-0`}><link.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" /></div>
                  <div className="flex-1 min-w-0 overflow-hidden"><p className="font-bold text-sm sm:text-lg">{link.label}</p><p className="text-xs sm:text-sm text-primary-foreground/70 truncate">{link.value}</p></div>
                  <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0" />
                </a>
              ))}
              <a href={`mailto:${profile.email || 'admin@karyapro.app'}`}
                 className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 group
                            hover:bg-white/20 hover:border-white/20 hover:-translate-y-0.5
                            transition-[background-color,border-color,transform] duration-300 ease-out"
              >
                <div className="p-2 sm:p-3 bg-white/10 rounded-xl shrink-0"><Mail className="h-5 w-5 sm:h-6 sm:w-6 text-white" /></div>
                <div className="flex-1 min-w-0"><p className="font-bold text-sm sm:text-lg">{t.emailLink || 'Email'}</p><p className="text-xs sm:text-sm text-primary-foreground/70 truncate">{profile.email || 'admin@karyapro.app'}</p></div>
                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0" />
              </a>
            </div>
          </div>
          <div className="bg-background rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl text-foreground no-print">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <input type="text" name="_honey" style={{ display: 'none' }} className="hidden" tabIndex={-1} autoComplete="off" />
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="relative group">
                  <Input id="name" required name="name" placeholder="User Alpha" className="h-12 sm:h-14 rounded-xl peer placeholder-transparent bg-transparent border-2 border-border/50 focus:border-primary pt-4" />
                  <label htmlFor="name" className="absolute left-4 top-4 sm:top-5 text-sm text-muted-foreground transition-all duration-300 peer-focus:-translate-y-3 sm:peer-focus:-translate-y-4 peer-focus:text-xs peer-focus:font-bold peer-focus:text-primary peer-autofill:-translate-y-3 sm:peer-autofill:-translate-y-4 peer-autofill:text-xs peer-autofill:font-bold peer-autofill:text-primary peer-[:not(:placeholder-shown)]:-translate-y-3 sm:peer-[:not(:placeholder-shown)]:-translate-y-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold cursor-text">
                    {t.contactName}
                  </label>
                </div>
                <div className="relative group">
                  <Input id="email" required type="email" name="email" placeholder="alpha@network.com" className="h-12 sm:h-14 rounded-xl peer placeholder-transparent bg-transparent border-2 border-border/50 focus:border-primary pt-4" />
                  <label htmlFor="email" className="absolute left-4 top-4 sm:top-5 text-sm text-muted-foreground transition-all duration-300 peer-focus:-translate-y-3 sm:peer-focus:-translate-y-4 peer-focus:text-xs peer-focus:font-bold peer-focus:text-primary peer-autofill:-translate-y-3 sm:peer-autofill:-translate-y-4 peer-autofill:text-xs peer-autofill:font-bold peer-autofill:text-primary peer-[:not(:placeholder-shown)]:-translate-y-3 sm:peer-[:not(:placeholder-shown)]:-translate-y-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold cursor-text">
                    {t.contactEmail}
                  </label>
                </div>
              </div>
              <div className="relative group">
                <Textarea id="message" required name="message" placeholder="Input payload..." className="min-h-[120px] sm:min-h-[150px] rounded-xl peer placeholder-transparent bg-transparent border-2 border-border/50 focus:border-primary pt-6" />
                <label htmlFor="message" className="absolute left-4 top-4 sm:top-5 text-sm text-muted-foreground transition-all duration-300 peer-focus:-translate-y-2 sm:peer-focus:-translate-y-3 peer-focus:text-xs peer-focus:font-bold peer-focus:text-primary peer-autofill:-translate-y-2 sm:peer-autofill:-translate-y-3 peer-autofill:text-xs peer-autofill:font-bold peer-autofill:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 sm:peer-[:not(:placeholder-shown)]:-translate-y-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold cursor-text">
                  {t.contactMessage}
                </label>
              </div>
              <Button type="submit" className={cn("w-full h-12 sm:h-14 rounded-2xl text-base sm:text-lg font-bold bg-primary text-primary-foreground relative overflow-hidden group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300", isSuccess && "bg-green-500 hover:bg-green-600")} disabled={isSubmitting || isSuccess}>
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.div key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </motion.div>
                  ) : isSuccess ? (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center justify-center gap-2">
                      <span>Message Sent!</span>
                    </motion.div>
                  ) : (
                    <motion.div key="default" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center justify-center gap-2">
                      <span className="relative">{t.sendMessage}</span>
                      <Send className="relative h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
