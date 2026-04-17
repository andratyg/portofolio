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
    // Conceptional Placeholder Authentication
    if (password === 'admin123') {
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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Site
      </Link>
      <Card className="w-full max-w-md shadow-2xl rounded-3xl overflow-hidden border-none">
        <CardHeader className="bg-primary text-primary-foreground py-10 text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
             <LogIn className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold">Admin Portal</CardTitle>
          <p className="text-primary-foreground/70 mt-2">Enter credentials to manage portfolio</p>
        </CardHeader>
        <CardContent className="pt-8 px-8">
          <form id="login-form" onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Access Code</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="h-12 rounded-xl text-center text-xl tracking-[0.5em]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="px-8 pb-10">
          <Button form="login-form" className="w-full h-12 rounded-xl text-lg font-bold">Authenticate</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
