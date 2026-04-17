"use client"

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore, ProjectStoreProvider } from '@/components/ProjectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Trash2, Sparkles, LogOut, ArrowLeft, Laptop, Award, Settings, 
  UserCircle, Languages, Loader2, Image as ImageIcon, Quote, 
  Briefcase, LayoutDashboard, History, ShieldAlert, CheckCircle2, 
  Download, Upload, HelpCircle, Info, Wifi, WifiOff, AlertTriangle, 
  Mail, Instagram, Github, Linkedin, Video, Send, Wand2, Type, FileText,
  UserPlus, Calendar
} from 'lucide-react';
import { translateContent } from '@/ai/flows/translate-content';
import { generateCertificateDescription } from '@/ai/flows/generate-certificate-description';
import { useToast } from '@/hooks/use-toast';
import { ProfileData, Project, Certificate, Testimonial, Experience } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';

function AdminContent() {
  const { 
    projects, addProject, deleteProject, 
    certificates, addCertificate, deleteCertificate,
    testimonials, addTestimonial, deleteTestimonial,
    experiences, addExperience, deleteExperience,
    profile, updateProfile,
    backupData, restoreData,
    isLoading: storeLoading
  } = useProjectStore();
  
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  
  const [isTranslating, setIsTranslating] = useState<string | null>(null);
  const [isAIThinking, setIsAIThinking] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      toast({ title: "Back Online", description: "Database synchronization resumed." });
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast({ variant: "destructive", title: "Offline Mode", description: "Local changes will be saved when reconnected." });
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const adminDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'admins', user.uid);
  }, [db, user]);

  const { data: adminData, isLoading: isAdminLoading } = useDoc(adminDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);

  const userRole = adminData?.role || 'editor';
  const isSuper = userRole === 'super';
  
  // Forms State
  const [projectForm, setProjectForm] = useState({
    titleId: '', titleEn: '', type: 'web' as 'web' | 'ui' | 'backend',
    shortDescriptionId: '', shortDescriptionEn: '', 
    fullDescriptionId: '', fullDescriptionEn: '',
    problemId: '', problemEn: '', solutionId: '', solutionEn: '',
    resultId: '', resultEn: '', impactStats: '',
    technologies: '', imageUrl: '', demoUrl: '', featured: false
  });

  const [certForm, setCertForm] = useState({
    titleId: '', titleEn: '', issuer: '', year: '', validUntil: '', imageUrl: '',
    shortDescriptionId: '', shortDescriptionEn: '', fullDescriptionId: '', fullDescriptionEn: ''
  });

  const [testForm, setTestForm] = useState({
    name: '', roleId: '', roleEn: '', contentId: '', contentEn: '', avatarUrl: ''
  });

  const [expForm, setExpForm] = useState({
    year: '', company: '', titleId: '', titleEn: '', descriptionId: '', descriptionEn: ''
  });

  const [profileFormData, setProfileFormData] = useState<ProfileData>(profile);

  useEffect(() => {
    if (profile) setProfileFormData(profile);
  }, [profile]);

  // AI Helpers
  const handleAITranslate = async (formType: string, data: any, setter: Function, direction: 'id-to-en' | 'en-to-id' = 'id-to-en') => {
    setIsTranslating(formType);
    try {
      const updated = { ...data };
      const sourceSuffix = direction === 'id-to-en' ? 'Id' : 'En';
      const targetSuffix = direction === 'id-to-en' ? 'En' : 'Id';
      const targetLang = direction === 'id-to-en' ? 'en' : 'id';
      
      const fieldsToTranslate = Object.keys(data).filter(key => key.endsWith(sourceSuffix));
      
      for (const sourceField of fieldsToTranslate) {
        const targetField = sourceField.replace(sourceSuffix, targetSuffix);
        if (data[sourceField]) {
          const res = await translateContent({ text: data[sourceField], targetLang });
          updated[targetField] = res.translatedText;
        }
      }
      setter(updated);
      toast({ 
        title: "AI Optimization Success", 
        description: direction === 'id-to-en' ? "English localization completed." : "Indonesian localization completed." 
      });
    } catch (e) {
      toast({ variant: "destructive", title: "AI Gateway Timeout", description: "Failed to communicate with LLM services." });
    } finally {
      setIsTranslating(null);
    }
  };

  const handleGenerateCertDesc = async () => {
    if (!certForm.titleId || !certForm.issuer) {
      toast({ variant: "destructive", title: "Incomplete Metadata", description: "Title and Issuer are required for AI generation." });
      return;
    }
    setIsAIThinking('cert');
    try {
      const res = await generateCertificateDescription({
        title: certForm.titleId,
        issuer: certForm.issuer,
        shortDescription: certForm.shortDescriptionId
      });
      setCertForm({ ...certForm, fullDescriptionId: res.descriptionSuggestion });
      toast({ title: "AI Analysis Complete", description: "Professional description generated." });
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to generate context-aware description." });
    } finally {
      setIsAIThinking(null);
    }
  };

  if (isUserLoading || storeLoading || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Establishing Cloud Link</p>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Verifying Admin Credentials</p>
          </div>
        </div>
      </div>
    );
  }

  if (user && !adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-xl rounded-[3rem] p-12 text-center space-y-10 shadow-2xl border-border/50">
          <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black font-headline tracking-tighter">Access Forbidden</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">Account <span className="text-foreground font-bold">{user.email}</span> is authenticated but lacks administrative authorization tokens.</p>
          </div>
          <div className="p-8 bg-muted/50 rounded-3xl text-left space-y-6 border border-border/50">
            <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">Required Protocol:</p>
            <ol className="text-xs text-muted-foreground space-y-3 list-decimal list-inside font-medium">
              <li>Copy User UID: <code className="bg-background px-3 py-1.5 rounded-lg text-primary font-bold border border-primary/20 select-all">{user.uid}</code></li>
              <li>Navigate to Firebase Console &rarr; Firestore.</li>
              <li>Register this UID as document ID in <code className="font-bold text-foreground">admins</code> collection.</li>
              <li>Set field <code className="text-primary font-bold">role: "super"</code>.</li>
            </ol>
          </div>
          <Button onClick={() => signOut(auth)} variant="outline" className="w-full h-14 rounded-2xl font-bold uppercase text-[10px] tracking-widest">Terminate Session</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 relative selection:bg-primary selection:text-primary-foreground">
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground py-2.5 px-6 flex items-center justify-center gap-2 sticky top-0 z-[60] shadow-lg animate-in slide-in-from-top duration-500">
          <WifiOff className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Network Interrupted - Offline Persistence Active</span>
        </div>
      )}

      <header className="bg-background/80 backdrop-blur-2xl border-b border-border/50 h-20 sticky top-0 z-50 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-2xl h-11 w-11 border border-border/50 hover:bg-muted/50">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-primary" />
             </div>
             <div>
                <h1 className="text-sm font-black font-headline uppercase tracking-tight">KaryaPro HQ</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="h-5 text-[8px] font-black uppercase bg-primary/5 text-primary border-primary/20 px-2">{userRole}</Badge>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">v2.5.0-Enterprise</span>
                </div>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="ghost" onClick={() => signOut(auth)} className="text-destructive hover:bg-destructive/10 rounded-2xl h-11 px-5 text-[10px] font-black uppercase tracking-widest gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <Tabs defaultValue="profile" className="space-y-16">
          <div className="flex justify-center sticky top-24 z-40">
            <TabsList className="h-16 bg-card/80 backdrop-blur-2xl border border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 w-full max-w-5xl overflow-x-auto no-scrollbar rounded-[2rem]">
              <TabsTrigger value="profile" className="rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] gap-3 px-6 h-full data-[state=active]:shadow-lg">
                <UserCircle className="h-4 w-4" /> <span className="hidden lg:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] gap-3 px-6 h-full data-[state=active]:shadow-lg">
                <Laptop className="h-4 w-4" /> <span className="hidden lg:inline">Projects</span>
              </TabsTrigger>
              <TabsTrigger value="certificates" className="rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] gap-3 px-6 h-full data-[state=active]:shadow-lg">
                <Award className="h-4 w-4" /> <span className="hidden lg:inline">Certs</span>
              </TabsTrigger>
              <TabsTrigger value="feedback" className="rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] gap-3 px-6 h-full data-[state=active]:shadow-lg">
                <Quote className="h-4 w-4" /> <span className="hidden lg:inline">Feedback</span>
              </TabsTrigger>
              <TabsTrigger value="journey" className="rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] gap-3 px-6 h-full data-[state=active]:shadow-lg">
                <History className="h-4 w-4" /> <span className="hidden lg:inline">Journey</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] gap-3 px-6 h-full data-[state=active]:shadow-lg">
                <Settings className="h-4 w-4" /> <span className="hidden lg:inline">System</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
             <Card className="rounded-[3rem] shadow-2xl border-border/50 overflow-hidden bg-card/50 backdrop-blur-xl">
                <CardHeader className="p-10 border-b border-border/50 bg-muted/20 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2">
                    <CardTitle className="font-black font-headline text-3xl tracking-tighter uppercase">Brand Identity</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">Modify global professional persona</CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => handleAITranslate('profile', profileFormData, setProfileFormData, 'id-to-en')} disabled={isTranslating === 'profile'} className="rounded-2xl gap-3 h-12 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5">
                      {isTranslating === 'profile' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                      ID &rarr; EN
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                  <form onSubmit={(e) => { e.preventDefault(); updateProfile(profileFormData); toast({ title: "Identity Updated", description: "Global profile records have been overwritten." }); }} className="space-y-12">
                    <div className="grid lg:grid-cols-3 gap-8">
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Legal Full Name</label>
                          <Input value={profileFormData.name} onChange={e => setProfileFormData({...profileFormData, name: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50 focus:ring-primary/20" />
                       </div>
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Professional Role (ID)</label>
                          <Input value={profileFormData.roleId} onChange={e => setProfileFormData({...profileFormData, roleId: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                       </div>
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Professional Role (EN)</label>
                          <Input value={profileFormData.roleEn} onChange={e => setProfileFormData({...profileFormData, roleEn: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Hero Title (ID)</label>
                          <Input value={profileFormData.heroTitleId} onChange={e => setProfileFormData({...profileFormData, heroTitleId: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                       </div>
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Hero Title (EN)</label>
                          <Input value={profileFormData.heroTitleEn} onChange={e => setProfileFormData({...profileFormData, heroTitleEn: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">About Me (ID)</label>
                          <Textarea value={profileFormData.aboutMeId} onChange={e => setProfileFormData({...profileFormData, aboutMeId: e.target.value})} className="h-40 rounded-3xl bg-background/50 border-border/50" />
                       </div>
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">About Me (EN)</label>
                          <Textarea value={profileFormData.aboutMeEn} onChange={e => setProfileFormData({...profileFormData, aboutMeEn: e.target.value})} className="h-40 rounded-3xl bg-background/50 border-border/50" />
                       </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Public Email</label>
                          <Input value={profileFormData.email} onChange={e => setProfileFormData({...profileFormData, email: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                       </div>
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">WhatsApp</label>
                          <Input value={profileFormData.whatsapp} onChange={e => setProfileFormData({...profileFormData, whatsapp: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                       </div>
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">LinkedIn URL</label>
                          <Input value={profileFormData.linkedin} onChange={e => setProfileFormData({...profileFormData, linkedin: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                       </div>
                    </div>

                    <Button type="submit" className="w-full h-16 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] bg-primary shadow-2xl shadow-primary/20 hover:scale-[0.99] transition-transform">Commit Identity State</Button>
                  </form>
                </CardContent>
             </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="xl:col-span-8">
               <Card className="rounded-[3rem] shadow-2xl border-border/50 bg-card/50 backdrop-blur-xl">
                <CardHeader className="p-10 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="font-black font-headline text-2xl uppercase tracking-tighter">Case Study Forge</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Deploy new professional deployment unit</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={() => handleAITranslate('project', projectForm, setProjectForm)} disabled={isTranslating === 'project'} className="rounded-2xl gap-3 h-12 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
                    {isTranslating === 'project' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                    AI Localize
                  </Button>
                </CardHeader>
                <CardContent className="p-10">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addProject({ ...projectForm, id: Date.now().toString(), technologies: projectForm.technologies.split(',').map(s => s.trim()) } as any);
                    setProjectForm({ 
                      titleId: '', titleEn: '', type: 'web', 
                      shortDescriptionId: '', shortDescriptionEn: '', 
                      fullDescriptionId: '', fullDescriptionEn: '',
                      problemId: '', problemEn: '', solutionId: '', solutionEn: '',
                      resultId: '', resultEn: '', impactStats: '',
                      technologies: '', imageUrl: '', demoUrl: '', featured: false 
                    });
                    toast({ title: "Deployment Executed", description: "Project case study pushed to production." });
                  }} className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Project Title (ID)</label>
                        <Input required value={projectForm.titleId} onChange={e => setProjectForm({...projectForm, titleId: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Project Title (EN)</label>
                        <Input value={projectForm.titleEn} onChange={e => setProjectForm({...projectForm, titleEn: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Problem Statement (ID)</label>
                          <Textarea value={projectForm.problemId} onChange={e => setProjectForm({...projectForm, problemId: e.target.value})} className="h-32 rounded-3xl bg-background/50 border-border/50" placeholder="What challenge was solved?" />
                       </div>
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Problem Statement (EN)</label>
                          <Textarea value={projectForm.problemEn} onChange={e => setProjectForm({...projectForm, problemEn: e.target.value})} className="h-32 rounded-3xl bg-background/50 border-border/50" />
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Technical Solution (ID)</label>
                          <Textarea value={projectForm.solutionId} onChange={e => setProjectForm({...projectForm, solutionId: e.target.value})} className="h-32 rounded-3xl bg-background/50 border-border/50" placeholder="How did you solve it?" />
                       </div>
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Technical Solution (EN)</label>
                          <Textarea value={projectForm.solutionEn} onChange={e => setProjectForm({...projectForm, solutionEn: e.target.value})} className="h-32 rounded-3xl bg-background/50 border-border/50" />
                       </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Key Technologies</label>
                          <Input placeholder="Next.js, Tailwind, etc" value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                       </div>
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Impact Stats</label>
                          <Input placeholder="99.9% Uptime / 10k Users" value={projectForm.impactStats} onChange={e => setProjectForm({...projectForm, impactStats: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                       </div>
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Image URL</label>
                          <Input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                       </div>
                    </div>

                    <Button type="submit" className="w-full h-16 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] bg-primary shadow-2xl shadow-primary/20">Finalize Deployment</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="xl:col-span-4 space-y-8">
               <h3 className="font-black text-[10px] uppercase tracking-[0.3em] px-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Laptop className="h-3 w-3 text-primary" />
                </div>
                Active Infrastructure ({projects.length})
              </h3>
              <div className="grid gap-4">
                {projects.length === 0 ? (
                  <div className="p-12 border-2 border-dashed border-border/50 rounded-[3rem] text-center space-y-4 bg-muted/10">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Empty Repository</p>
                      <p className="text-[9px] text-muted-foreground/60 uppercase font-bold tracking-widest">Awaiting first case study deployment.</p>
                    </div>
                  </div>
                ) : projects.map(p => (
                  <Card key={p.id} className="p-4 flex gap-5 items-center group bg-card/50 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all rounded-[1.5rem] shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden shrink-0 shadow-inner">
                      <img src={p.imageUrl || "https://placehold.co/100x100"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black truncate text-sm tracking-tight">{p.titleId}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="secondary" className="text-[8px] font-black uppercase h-5 px-2 bg-muted/80">{p.type}</Badge>
                        {p.featured && <Sparkles className="h-3 w-3 text-accent" />}
                      </div>
                    </div>
                    {isSuper && (
                      <Button variant="ghost" size="icon" onClick={() => { if(confirm("Confirm deletion of deployment unit?")) deleteProject(p.id) }} className="text-destructive hover:bg-destructive/10 h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="xl:col-span-8">
              <Card className="rounded-[3rem] shadow-2xl border-border/50 bg-card/50 backdrop-blur-xl">
                <CardHeader className="p-10 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="font-black font-headline text-2xl uppercase tracking-tighter">Credential Vault</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Authenticate new technical certification</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={() => handleAITranslate('certificate', certForm, setCertForm)} disabled={isTranslating === 'certificate'} className="rounded-2xl gap-3 h-12 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
                    {isTranslating === 'certificate' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                    AI Localize
                  </Button>
                </CardHeader>
                <CardContent className="p-10">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addCertificate({ ...certForm, id: Date.now().toString() } as any);
                    setCertForm({ titleId: '', titleEn: '', issuer: '', year: '', validUntil: '', imageUrl: '', shortDescriptionId: '', shortDescriptionEn: '', fullDescriptionId: '', fullDescriptionEn: '' });
                    toast({ title: "Credential Locked", description: "Certificate added to global records." });
                  }} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cert Title (ID)</label>
                        <Input required value={certForm.titleId} onChange={e => setCertForm({...certForm, titleId: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cert Title (EN)</label>
                        <Input value={certForm.titleEn} onChange={e => setCertForm({...certForm, titleEn: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Issuer Org</label>
                        <Input required value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Image URL</label>
                        <Input value={certForm.imageUrl} onChange={e => setCertForm({...certForm, imageUrl: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-8">
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Year Issued</label>
                          <Input value={certForm.year} onChange={e => setCertForm({...certForm, year: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                       </div>
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Valid Until</label>
                          <Input value={certForm.validUntil} onChange={e => setCertForm({...certForm, validUntil: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                       </div>
                       <div className="flex items-end pb-1">
                          <Button type="button" variant="outline" onClick={handleGenerateCertDesc} disabled={isAIThinking === 'cert'} className="w-full h-14 rounded-2xl gap-3 text-[10px] font-black uppercase tracking-widest border-accent/20 text-accent">
                             {isAIThinking === 'cert' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                             AI Write Desc
                          </Button>
                       </div>
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Description (ID)</label>
                        <Textarea value={certForm.fullDescriptionId} onChange={e => setCertForm({...certForm, fullDescriptionId: e.target.value})} className="h-32 rounded-3xl bg-background/50 border-border/50" />
                    </div>
                    <Button type="submit" className="w-full h-16 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] bg-primary shadow-2xl shadow-primary/20">Archive Credential</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="xl:col-span-4 space-y-8">
               <h3 className="font-black text-[10px] uppercase tracking-[0.3em] px-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="h-3 w-3 text-primary" />
                </div>
                Verified Certs ({certificates.length})
              </h3>
              <div className="grid gap-4">
                {certificates.map(c => (
                  <Card key={c.id} className="p-4 flex gap-5 items-center group bg-card/50 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all rounded-[1.5rem]">
                    <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0 shadow-inner">
                      <img src={c.imageUrl || "https://placehold.co/100x100"} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black truncate text-sm tracking-tight">{c.titleId}</h4>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{c.issuer}</p>
                    </div>
                    {isSuper && (
                      <Button variant="ghost" size="icon" onClick={() => deleteCertificate(c.id)} className="text-destructive hover:bg-destructive/10 h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="xl:col-span-8">
                <Card className="rounded-[3rem] shadow-2xl border-border/50 bg-card/50 backdrop-blur-xl">
                  <CardHeader className="p-10 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
                    <div className="space-y-2">
                      <CardTitle className="font-black font-headline text-2xl uppercase tracking-tighter">Social Proof Console</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Log client and collaborator testimonials</CardDescription>
                    </div>
                    <Button type="button" variant="outline" onClick={() => handleAITranslate('feedback', testForm, setTestForm)} disabled={isTranslating === 'feedback'} className="rounded-2xl gap-3 h-12 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
                      {isTranslating === 'feedback' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                      AI Localize
                    </Button>
                  </CardHeader>
                  <CardContent className="p-10">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      addTestimonial({ ...testForm, id: Date.now().toString() } as any);
                      setTestForm({ name: '', roleId: '', roleEn: '', contentId: '', contentEn: '', avatarUrl: '' });
                      toast({ title: "Feedback Archived", description: "Testimonial record has been pushed." });
                    }} className="space-y-8">
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2.5">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Author Name</label>
                             <Input required value={testForm.name} onChange={e => setTestForm({...testForm, name: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                          </div>
                          <div className="space-y-2.5">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avatar URL</label>
                             <Input value={testForm.avatarUrl} onChange={e => setTestForm({...testForm, avatarUrl: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                          </div>
                       </div>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2.5">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Author Role (ID)</label>
                             <Input required value={testForm.roleId} onChange={e => setTestForm({...testForm, roleId: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                          </div>
                          <div className="space-y-2.5">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Author Role (EN)</label>
                             <Input value={testForm.roleEn} onChange={e => setTestForm({...testForm, roleEn: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                          </div>
                       </div>
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Testimonial Content (ID)</label>
                          <Textarea required value={testForm.contentId} onChange={e => setTestForm({...testForm, contentId: e.target.value})} className="h-32 rounded-3xl bg-background/50 border-border/50" />
                       </div>
                       <Button type="submit" className="w-full h-16 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] bg-primary shadow-2xl shadow-primary/20">Commit Testimonial</Button>
                    </form>
                  </CardContent>
                </Card>
             </div>
             <div className="xl:col-span-4 space-y-8">
               <h3 className="font-black text-[10px] uppercase tracking-[0.3em] px-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Quote className="h-3 w-3 text-primary" />
                </div>
                Active Proof ({testimonials.length})
              </h3>
              <div className="grid gap-4">
                {testimonials.map(t => (
                  <Card key={t.id} className="p-4 flex gap-5 items-center group bg-card/50 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all rounded-[1.5rem]">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                      {t.avatarUrl ? <img src={t.avatarUrl} className="w-full h-full object-cover" /> : <UserCircle className="h-6 w-6 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black truncate text-sm tracking-tight">{t.name}</h4>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{t.roleId}</p>
                    </div>
                    {isSuper && (
                      <Button variant="ghost" size="icon" onClick={() => deleteTestimonial(t.id)} className="text-destructive hover:bg-destructive/10 h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Journey Tab */}
          <TabsContent value="journey" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="xl:col-span-8">
                <Card className="rounded-[3rem] shadow-2xl border-border/50 bg-card/50 backdrop-blur-xl">
                  <CardHeader className="p-10 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
                    <div className="space-y-2">
                      <CardTitle className="font-black font-headline text-2xl uppercase tracking-tighter">Timeline Architect</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Map professional and educational milestones</CardDescription>
                    </div>
                    <Button type="button" variant="outline" onClick={() => handleAITranslate('journey', expForm, setExpForm)} disabled={isTranslating === 'journey'} className="rounded-2xl gap-3 h-12 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
                      {isTranslating === 'journey' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                      AI Localize
                    </Button>
                  </CardHeader>
                  <CardContent className="p-10">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      addExperience({ ...expForm, id: Date.now().toString() } as any);
                      setExpForm({ year: '', company: '', titleId: '', titleEn: '', descriptionId: '', descriptionEn: '' });
                      toast({ title: "Milestone Pushed", description: "Journey timeline updated successfully." });
                    }} className="space-y-8">
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2.5">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timeline Span (e.g. 2021 - Present)</label>
                             <Input required value={expForm.year} onChange={e => setExpForm({...expForm, year: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                          </div>
                          <div className="space-y-2.5">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Org / Company</label>
                             <Input required value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                          </div>
                       </div>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2.5">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Milestone Title (ID)</label>
                             <Input required value={expForm.titleId} onChange={e => setExpForm({...expForm, titleId: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                          </div>
                          <div className="space-y-2.5">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Milestone Title (EN)</label>
                             <Input value={expForm.titleEn} onChange={e => setExpForm({...expForm, titleEn: e.target.value})} className="h-14 rounded-2xl bg-background/50 border-border/50" />
                          </div>
                       </div>
                       <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role Description (ID)</label>
                          <Textarea required value={expForm.descriptionId} onChange={e => setExpForm({...expForm, descriptionId: e.target.value})} className="h-32 rounded-3xl bg-background/50 border-border/50" />
                       </div>
                       <Button type="submit" className="w-full h-16 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] bg-primary shadow-2xl shadow-primary/20">Finalize Milestone</Button>
                    </form>
                  </CardContent>
                </Card>
             </div>
             <div className="xl:col-span-4 space-y-8">
               <h3 className="font-black text-[10px] uppercase tracking-[0.3em] px-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                  <History className="h-3 w-3 text-primary" />
                </div>
                Journey Logs ({experiences.length})
              </h3>
              <div className="grid gap-4">
                {experiences.map(exp => (
                  <Card key={exp.id} className="p-4 flex gap-5 items-center group bg-card/50 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all rounded-[1.5rem]">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black truncate text-sm tracking-tight">{exp.titleId}</h4>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{exp.year}</p>
                    </div>
                    {isSuper && (
                      <Button variant="ghost" size="icon" onClick={() => deleteExperience(exp.id)} className="text-destructive hover:bg-destructive/10 h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="max-w-4xl mx-auto space-y-12 animate-in fade-in">
             <Card className="rounded-[3rem] shadow-2xl border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden">
              <CardHeader className="p-10 border-b border-border/50 bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Settings className="text-primary h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black font-headline tracking-tighter uppercase">Enterprise Maintenance</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">Global recovery and system synchronization</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-12">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Data Integrity Ops</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" onClick={backupData} className="h-32 flex-col gap-4 rounded-[2.5rem] border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all shadow-sm">
                        <Download className="h-7 w-7 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Global Export</span>
                      </Button>
                      <Button variant="outline" onClick={() => { if(isSuper) fileInputRef.current?.click(); else toast({variant:"destructive", title:"Security Restriction", description:"Restore requires Super Admin clearance."}) }} className="h-32 flex-col gap-4 rounded-[2.5rem] border-accent/20 hover:bg-accent/5 hover:border-accent/40 transition-all shadow-sm">
                        <Upload className="h-7 w-7 text-accent" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">State Restore</span>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            const content = event.target?.result as string;
                            await restoreData(content);
                          };
                          reader.readAsText(file);
                        }} />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Security Audit</h4>
                    <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] space-y-6">
                      <div className="flex items-center gap-4 text-amber-600">
                        <ShieldAlert className="h-6 w-6" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Restricted Authorization</h4>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-700/80 font-bold uppercase tracking-wide">
                        Atomic operations (Delete/Restore) are strictly limited to <strong className="text-amber-800">Super Admin</strong> credentials. 
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-amber-500/20">
                        <span className="text-[8px] font-black uppercase tracking-widest text-amber-600">Current Role</span>
                        <Badge className="bg-amber-600 text-white font-black text-[9px] px-3">{userRole}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProjectStoreProvider>
      <AdminContent />
    </ProjectStoreProvider>
  );
}
