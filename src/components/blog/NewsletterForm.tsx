"use client";

import React, { useState } from 'react';
import { Mail, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: "Email Tidak Valid",
        description: "Masukkan alamat email yang benar.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({
        title: "Berhasil Berlangganan! 🎉",
        description: "Terima kasih telah mendaftar buletin blog kami.",
      });
    }, 600);
  };

  return (
    <div className="p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 shadow-2xl relative overflow-hidden my-12">
      <div className="max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Mail className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="h-3 w-3" /> Buletin Pengembang
          </div>
          <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Dapatkan Artikel Terbaru Secara Gratis
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Berlangganan untuk menerima pembaruan tentang Next.js, React, TypeScript, dan dunia web development langsung ke masuk kotak surat Anda.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-500 text-sm font-bold flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5" />
            <span>Terima kasih! Alamat email Anda ({email}) telah terdaftar.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
            <Input
              type="email"
              placeholder="Masukkan alamat email Anda..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl h-12 bg-background border-border/80 text-sm focus:ring-primary"
              required
            />
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl h-12 px-6 font-black uppercase text-xs tracking-wider gap-2 shrink-0 shadow-lg"
            >
              <span>{loading ? 'Mengirim...' : 'Berlangganan'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
