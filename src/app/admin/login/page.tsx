
"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { LogIn, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '26052010') {
      sessionStorage.setItem('karyapro-auth', 'true');
      router.push('/admin');
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid administrator credentials.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background patterns matching theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]"></div>

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors z-20">
        <ArrowLeft className="h-4 w-4" /> Back to Site
      </Link>
      
      <Card className="w-full max-w-md shadow-2xl rounded-[2.5rem] overflow-hidden border border-border bg-card/50 backdrop-blur-xl relative z-10">
        <CardHeader className="bg-primary text-primary-foreground py-8 text-center">
          <div className="mx-auto w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
             <LogIn className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-headline font-bold">Admin Portal</CardTitle>
          <p className="text-primary-foreground/70 text-xs mt-1">Authenticate to manage infrastructure</p>
        </CardHeader>
        <CardContent className="pt-8 px-8">
          <form id="login-form" onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Access Code</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="h-12 rounded-xl text-center text-xl tracking-[0.5em] bg-background/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="px-8 pb-10">
          <Button form="login-form" className="w-full h-12 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20">Authenticate</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
