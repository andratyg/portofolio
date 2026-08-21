
"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { LogIn, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const savedLockout = localStorage.getItem('admin_lockout_until');
    const savedAttempts = localStorage.getItem('admin_login_attempts');
    if (savedLockout) {
      const lockoutEnd = parseInt(savedLockout, 10);
      if (Date.now() < lockoutEnd) {
        setLockoutTime(lockoutEnd);
      } else {
        localStorage.removeItem('admin_lockout_until');
        localStorage.removeItem('admin_login_attempts');
      }
    } else if (savedAttempts) {
      setAttempts(parseInt(savedAttempts, 10));
    }
  }, []);

  useEffect(() => {
    if (lockoutTime) {
      const interval = setInterval(() => {
        if (Date.now() >= lockoutTime) {
          setLockoutTime(null);
          setAttempts(0);
          localStorage.removeItem('admin_lockout_until');
          localStorage.removeItem('admin_login_attempts');
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/admin');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || lockoutTime) return;

    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Mark admin session in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('is_admin', '1');
      }
      // Reset on success
      setAttempts(0);
      localStorage.removeItem('admin_login_attempts');
      localStorage.removeItem('admin_lockout_until');
      
      toast({
        title: "Selamat Datang Kembali",
        description: "Otentikasi administrator berhasil.",
      });
      router.push('/admin');
    } catch (error: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('admin_login_attempts', newAttempts.toString());
      
      if (newAttempts >= 5) {
        const lockUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
        setLockoutTime(lockUntil);
        localStorage.setItem('admin_lockout_until', lockUntil.toString());
        toast({
          variant: "destructive",
          title: "Akses Terkunci Sementara",
          description: "Terlalu banyak percobaan gagal. Silakan coba lagi dalam 5 menit.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Akses Ditolak",
          description: `Email atau kata sandi tidak valid. Sisa percobaan: ${5 - newAttempts}`,
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]"></div>

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors z-20">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Situs
      </Link>
      
      <Card className="w-full max-w-md shadow-2xl rounded-[2.5rem] overflow-hidden border border-border bg-card/50 backdrop-blur-sm relative z-10">
        <CardHeader className="bg-primary text-primary-foreground py-8 text-center">
          <div className="mx-auto w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
             <LogIn className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl  font-bold">PORTAL ADMIN</CardTitle>
          <p className="text-primary-foreground/70 text-xs mt-1">Masuk untuk mengelola infrastruktur portofolio</p>
        </CardHeader>
        <CardContent className="pt-8 px-8">
          <form id="login-form" onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Email Administrator</label>
              <Input 
                type="email" 
                placeholder="admin@nara-andra.app" 
                className="h-12 rounded-xl bg-background/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Kata Sandi</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="h-12 rounded-xl bg-background/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="px-8 pb-10">
          <Button 
            form="login-form" 
            className="w-full h-12 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20"
            disabled={isLoggingIn || lockoutTime !== null}
          >
            {isLoggingIn ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> MENGOTENTIKASI...</>
            ) : lockoutTime ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> TERKUNCI ({Math.ceil((lockoutTime - Date.now()) / 60000)}m)</>
            ) : (
              'OTORISASI AKSES'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
