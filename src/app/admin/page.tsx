
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
  UserPlus, Calendar, Zap, BarChart3, Terminal, Activity
} from 'lucide-react';
import { translateContent } from '@/ai/flows/translate-content';
import { generateCertificateDescription } from '@/ai/flows/generate-certificate-description';
import { generatePortfolioDescriptionSuggestion } from '@/ai/flows/generate-portfolio-description-suggestion';
import { useToast } from '@/hooks/use-toast';
import { ProfileData, Project, Certificate, Testimonial, Experience, PortfolioStats } from '@/lib/types';
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
    stats, updateStats,
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
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
  const [statsFormData, setStatsFormData] = useState<PortfolioStats>(stats);

  useEffect(() => {
    if (profile) setProfileFormData(profile);
  }, [profile]);

  useEffect(() => {
    if (stats) setStatsFormData(stats);
  }, [stats]);

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
      toast({ title: "AI Sync Successful", description: "All fields localized." });
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to translate content." });
    } finally {
      setIsTranslating(null);
    }
  };

  const handleGenerateCertDesc = async () => {
    if (!certForm.titleId || !certForm.issuer) {
      toast({ variant: "destructive", title: "Missing Data", description: "Title and Issuer are needed for AI." });
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
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to generate description." });
    } finally {
      setIsAIThinking(null);
    }
  };

  const handleGenerateProjectSuggestion = async () => {
    if (!projectForm.titleId) {
      toast({ variant: "destructive", title: "Missing Title", description: "Title is needed for AI suggestion." });
      return;
    }
    setIsAIThinking('project');
    try {
      const res = await generatePortfolioDescriptionSuggestion({
        title: projectForm.titleId,
        projectType: projectForm.type,
        technologiesUsed: projectForm.technologies.split(',').map(s => s.trim()),
        problemSolved: projectForm.problemId
      });
      setProjectForm({ ...projectForm, shortDescriptionId: res.descriptionSuggestion });
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to generate suggestion." });
    } finally {
      setIsAIThinking(null);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileFormData);
    updateStats(statsFormData);
    toast({ title: "Global Records Synced", description: "Profile and metrics updated." });
  };

  if (isUserLoading || storeLoading || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (user && !adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-lg rounded-[2.5rem] p-10 text-center space-y-8 shadow-2xl border-destructive/20">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
          <div className="space-y-2">
            <h2 className="text-3xl font-black font-headline uppercase">Access Restricted</h2>
            <p className="text-muted-foreground text-sm">UID: <code className="bg-muted px-2 py-1 rounded select-all font-bold">{user.uid}</code></p>
            <p className="text-xs text-muted-foreground italic mt-4">Please register this UID in Firestore under 'admins' collection with role 'super'.</p>
          </div>
          <Button onClick={() => signOut(auth)} variant="destructive" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest">Logout</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 relative selection:bg-primary/30">
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground py-2 px-6 flex items-center justify-center gap-2 sticky top-0 z-[60]">
          <WifiOff className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Offline System Active</span>
        </div>
      )}

      {/* Sticky Header */}
      <header className={cn(
        "bg-background/80 backdrop-blur-2xl border-b h-20 sticky top-0 z-50 flex items-center justify-between px-8 transition-transform duration-500",
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-xl h-10 w-10 border">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xs font-black font-headline uppercase tracking-widest flex items-center gap-2">
              NAT Control Panel
              <Badge variant="outline" className="h-5 text-[8px] bg-primary/10 text-primary border-primary/20">{userRole}</Badge>
            </h1>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => signOut(auth)} className="text-destructive hover:bg-destructive/10 rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest gap-2">
          <LogOut className="h-4 w-4" /> Exit
        </Button>
      </header>

      <div className="container mx-auto px-6 py-12">
        <Tabs defaultValue="profile" className="space-y-12">
          <div className={cn(
            "flex justify-center sticky z-40 transition-all duration-500",
            isHeaderVisible ? "top-24" : "top-4"
          )}>
            <TabsList className="h-16 bg-card/80 backdrop-blur-2xl border shadow-2xl p-2 rounded-[2rem] w-full max-w-4xl overflow-x-auto no-scrollbar">
              <TabsTrigger value="profile" className="rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 px-6 h-full"><UserCircle className="h-4 w-4" /> Profile</TabsTrigger>
              <TabsTrigger value="projects" className="rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 px-6 h-full"><Laptop className="h-4 w-4" /> Projects</TabsTrigger>
              <TabsTrigger value="certificates" className="rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 px-6 h-full"><Award className="h-4 w-4" /> Certs</TabsTrigger>
              <TabsTrigger value="feedback" className="rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 px-6 h-full"><Quote className="h-4 w-4" /> Feedback</TabsTrigger>
              <TabsTrigger value="journey" className="rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 px-6 h-full"><History className="h-4 w-4" /> Journey</TabsTrigger>
              <TabsTrigger value="system" className="rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 px-6 h-full"><Settings className="h-4 w-4" /> System</TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-8 duration-500">
             <Card className="rounded-[3rem] shadow-2xl border-none bg-card/50 backdrop-blur-xl">
                <CardHeader className="p-10 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-black font-headline text-3xl uppercase tracking-tighter">Global Identity</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.2em] mt-1">Configure Public Branding & Strategic Metrics</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={() => handleAITranslate('profile', profileFormData, setProfileFormData)} disabled={isTranslating === 'profile'} className="rounded-2xl gap-3 h-12 text-[10px] font-black uppercase tracking-widest">
                    {isTranslating === 'profile' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                    AI Translate All
                  </Button>
                </CardHeader>
                <CardContent className="p-10">
                  <form onSubmit={handleProfileSubmit} className="space-y-16">
                    {/* Identity Info */}
                    <div className="space-y-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3"><UserCircle className="h-4 w-4" /> Core Identity</h3>
                      <div className="grid lg:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</label>
                            <Input value={profileFormData.name} onChange={e => setProfileFormData({...profileFormData, name: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role (ID)</label>
                            <Input value={profileFormData.roleId} onChange={e => setProfileFormData({...profileFormData, roleId: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role (EN)</label>
                            <Input value={profileFormData.roleEn} onChange={e => setProfileFormData({...profileFormData, roleEn: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                        </div>
                      </div>
                    </div>

                    {/* Strategic Metrics (Stats) */}
                    <div className="space-y-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3"><BarChart3 className="h-4 w-4" /> Strategic Metrics (OP Stats)</h3>
                      <div className="grid lg:grid-cols-4 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Briefcase className="h-3 w-3" /> Units Deployed</label>
                            <Input value={statsFormData.completedProjects} onChange={e => setStatsFormData({...statsFormData, completedProjects: e.target.value})} className="h-14 rounded-2xl bg-background/50" placeholder="e.g. 15" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Activity className="h-3 w-3" /> Industry Tenure (Years)</label>
                            <Input value={statsFormData.yearsExperience} onChange={e => setStatsFormData({...statsFormData, yearsExperience: e.target.value})} className="h-14 rounded-2xl bg-background/50" placeholder="e.g. 5" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Terminal className="h-3 w-3" /> System Stack Count</label>
                            <Input value={statsFormData.techMastered} onChange={e => setStatsFormData({...statsFormData, techMastered: e.target.value})} className="h-14 rounded-2xl bg-background/50" placeholder="e.g. 24" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> Uptime SLA / Satisfaction</label>
                            <Input value={statsFormData.clientSatisfaction} onChange={e => setStatsFormData({...statsFormData, clientSatisfaction: e.target.value})} className="h-14 rounded-2xl bg-background/50" placeholder="e.g. 99.9%" />
                        </div>
                      </div>
                    </div>

                    {/* Hero & About */}
                    <div className="space-y-12">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3"><Type className="h-4 w-4" /> Visual Narrative</h3>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hero Title (ID)</label>
                            <Input value={profileFormData.heroTitleId} onChange={e => setProfileFormData({...profileFormData, heroTitleId: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hero Title (EN)</label>
                            <Input value={profileFormData.heroTitleEn} onChange={e => setProfileFormData({...profileFormData, heroTitleEn: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hero Subtitle (ID)</label>
                            <Textarea value={profileFormData.heroSubtitleId} onChange={e => setProfileFormData({...profileFormData, heroSubtitleId: e.target.value})} className="h-24 rounded-2xl bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hero Subtitle (EN)</label>
                            <Textarea value={profileFormData.heroSubtitleEn} onChange={e => setProfileFormData({...profileFormData, heroSubtitleEn: e.target.value})} className="h-24 rounded-2xl bg-background/50" />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">About Me (ID)</label>
                            <Textarea value={profileFormData.aboutMeId} onChange={e => setProfileFormData({...profileFormData, aboutMeId: e.target.value})} className="h-40 rounded-3xl bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">About Me (EN)</label>
                            <Textarea value={profileFormData.aboutMeEn} onChange={e => setProfileFormData({...profileFormData, aboutMeEn: e.target.value})} className="h-40 rounded-3xl bg-background/50" />
                        </div>
                      </div>
                    </div>

                    {/* Social & Meta */}
                    <div className="space-y-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3"><Zap className="h-4 w-4" /> Connectivity & Media</h3>
                      <div className="grid lg:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Public Email</label>
                            <Input value={profileFormData.email} onChange={e => setProfileFormData({...profileFormData, email: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">WA Number</label>
                            <Input value={profileFormData.whatsapp} onChange={e => setProfileFormData({...profileFormData, whatsapp: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">LinkedIn URL</label>
                            <Input value={profileFormData.linkedin} onChange={e => setProfileFormData({...profileFormData, linkedin: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Instagram URL</label>
                            <Input value={profileFormData.instagram} onChange={e => setProfileFormData({...profileFormData, instagram: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">GitHub URL</label>
                            <Input value={profileFormData.github} onChange={e => setProfileFormData({...profileFormData, github: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profile Picture URL</label>
                            <Input value={profileFormData.profilePictureUrl} onChange={e => setProfileFormData({...profileFormData, profilePictureUrl: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-20 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.4em] bg-primary shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all">Sync Global Node & Metrics</Button>
                  </form>
                </CardContent>
             </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="xl:col-span-8">
               <Card className="rounded-[3rem] shadow-2xl border-none bg-card/50 backdrop-blur-xl">
                <CardHeader className="p-10 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-black font-headline text-2xl uppercase tracking-tighter">Case Study Deployment</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Publish New Professional Infrastructure</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleGenerateProjectSuggestion} disabled={isAIThinking === 'project'} className="rounded-2xl gap-3 h-12 text-[10px] font-black uppercase tracking-widest">
                      {isAIThinking === 'project' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      AI Suggest
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleAITranslate('project', projectForm, setProjectForm)} disabled={isTranslating === 'project'} className="rounded-2xl gap-3 h-12 text-[10px] font-black uppercase tracking-widest">
                      {isTranslating === 'project' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                      AI Translate
                    </Button>
                  </div>
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
                    toast({ title: "Project Deployed", description: "Case study added to live cluster." });
                  }} className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Title (ID)</label>
                        <Input required value={projectForm.titleId} onChange={e => setProjectForm({...projectForm, titleId: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Title (EN)</label>
                        <Input value={projectForm.titleEn} onChange={e => setProjectForm({...projectForm, titleEn: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Summary (ID)</label>
                        <Textarea value={projectForm.shortDescriptionId} onChange={e => setProjectForm({...projectForm, shortDescriptionId: e.target.value})} className="h-24 rounded-2xl bg-background/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Summary (EN)</label>
                        <Textarea value={projectForm.shortDescriptionEn} onChange={e => setProjectForm({...projectForm, shortDescriptionEn: e.target.value})} className="h-24 rounded-2xl bg-background/50" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">The Problem (ID)</label>
                          <Textarea value={projectForm.problemId} onChange={e => setProjectForm({...projectForm, problemId: e.target.value})} className="h-32 rounded-3xl bg-background/50" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px) font-black uppercase tracking-widest text-muted-foreground px-1">The Solution (ID)</label>
                          <Textarea value={projectForm.solutionId} onChange={e => setProjectForm({...projectForm, solutionId: e.target.value})} className="h-32 rounded-3xl bg-background/50" />
                       </div>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Stack (CSV)</label>
                          <Input placeholder="Next.js, Tailwind" value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Media URL</label>
                          <Input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Impact Stats</label>
                          <Input placeholder="99.9% Performance" value={projectForm.impactStats} onChange={e => setProjectForm({...projectForm, impactStats: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                       </div>
                    </div>
                    <Button type="submit" className="w-full h-16 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] bg-primary shadow-2xl shadow-primary/20">Commit Deployment</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="xl:col-span-4 space-y-8">
               <h3 className="font-black text-[10px] uppercase tracking-[0.3em] px-4 flex items-center gap-3"><Laptop className="h-4 w-4" /> Live Repositories ({projects.length})</h3>
              <div className="grid gap-4">
                {projects.map(p => (
                  <Card key={p.id} className="p-4 flex gap-5 items-center group bg-card/50 backdrop-blur-md border-none hover:bg-muted/50 transition-all rounded-[1.5rem] shadow-xl">
                    <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden shrink-0">
                      <img src={p.imageUrl && p.imageUrl.startsWith('http') ? p.imageUrl : "https://placehold.co/100x100?text=Project"} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black truncate text-sm tracking-tight">{p.titleId}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[8px] font-black uppercase h-5 px-2">{p.type}</Badge>
                        {p.featured && <Sparkles className="h-3 w-3 text-accent" />}
                      </div>
                    </div>
                    {isSuper && (
                      <Button variant="ghost" size="icon" onClick={() => deleteProject(p.id)} className="text-destructive hover:bg-destructive/10 h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="xl:col-span-8">
              <Card className="rounded-[3rem] shadow-2xl border-none bg-card/50 backdrop-blur-xl">
                <CardHeader className="p-10 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-black font-headline text-2xl uppercase tracking-tighter">Credential Vault</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Archive Specialized Technical Validations</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleGenerateCertDesc} disabled={isAIThinking === 'cert'} className="rounded-2xl gap-3 h-12 text-[10px] font-black uppercase tracking-widest">
                      {isAIThinking === 'cert' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      AI Suggest
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleAITranslate('certificate', certForm, setCertForm)} disabled={isTranslating === 'certificate'} className="rounded-2xl gap-3 h-12 text-[10px] font-black uppercase tracking-widest">
                      {isTranslating === 'certificate' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                      AI Translate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addCertificate({ ...certForm, id: Date.now().toString() } as any);
                    setCertForm({ titleId: '', titleEn: '', issuer: '', year: '', validUntil: '', imageUrl: '', shortDescriptionId: '', shortDescriptionEn: '', fullDescriptionId: '', fullDescriptionEn: '' });
                    toast({ title: "Credential Locked", description: "Certificate added to global vault." });
                  }} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title (ID)</label>
                        <Input required value={certForm.titleId} onChange={e => setCertForm({...certForm, titleId: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title (EN)</label>
                        <Input value={certForm.titleEn} onChange={e => setCertForm({...certForm, titleEn: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Issuer Org</label>
                        <Input required value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Media URL</label>
                        <Input value={certForm.imageUrl} onChange={e => setCertForm({...certForm, imageUrl: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Narrative (ID)</label>
                        <Textarea value={certForm.fullDescriptionId} onChange={e => setCertForm({...certForm, fullDescriptionId: e.target.value})} className="h-32 rounded-3xl bg-background/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Narrative (EN)</label>
                        <Textarea value={certForm.fullDescriptionEn} onChange={e => setCertForm({...certForm, fullDescriptionEn: e.target.value})} className="h-32 rounded-3xl bg-background/50" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-16 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] bg-primary shadow-2xl shadow-primary/20">Finalize Credential</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="xl:col-span-4 space-y-8">
               <h3 className="font-black text-[10px] uppercase tracking-[0.3em] px-4 flex items-center gap-3"><Award className="h-4 w-4" /> Active Validations ({certificates.length})</h3>
              <div className="grid gap-4">
                {certificates.map(c => (
                  <Card key={c.id} className="p-4 flex gap-5 items-center group bg-card/50 backdrop-blur-md border-none hover:bg-muted/50 transition-all rounded-[1.5rem] shadow-xl">
                    <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
                      <img src={c.imageUrl && c.imageUrl.startsWith('http') ? c.imageUrl : "https://placehold.co/100x100?text=Cert"} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black truncate text-sm tracking-tight">{c.titleId}</h4>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{c.issuer}</p>
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
          <TabsContent value="feedback" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div className="xl:col-span-8">
                <Card className="rounded-[3rem] shadow-2xl border-none bg-card/50 backdrop-blur-xl">
                  <CardHeader className="p-10 border-b flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="font-black font-headline text-2xl uppercase tracking-tighter">Impact Logs</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Archive Client & Partner Testimonials</CardDescription>
                    </div>
                    <Button type="button" variant="outline" onClick={() => handleAITranslate('feedback', testForm, setTestForm)} disabled={isTranslating === 'feedback'} className="rounded-2xl gap-3 h-12 text-[10px] font-black uppercase tracking-widest">
                      {isTranslating === 'feedback' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                      AI Translate
                    </Button>
                  </CardHeader>
                  <CardContent className="p-10">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      addTestimonial({ ...testForm, id: Date.now().toString() } as any);
                      setTestForm({ name: '', roleId: '', roleEn: '', contentId: '', contentEn: '', avatarUrl: '' });
                      toast({ title: "Feedback Archived", description: "Proof added to social grid." });
                    }} className="space-y-8">
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Author</label>
                             <Input required value={testForm.name} onChange={e => setTestForm({...testForm, name: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avatar URL</label>
                             <Input value={testForm.avatarUrl} onChange={e => setTestForm({...testForm, avatarUrl: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                          </div>
                       </div>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role (ID)</label>
                             <Input required value={testForm.roleId} onChange={e => setTestForm({...testForm, roleId: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role (EN)</label>
                             <Input value={testForm.roleEn} onChange={e => setTestForm({...testForm, roleEn: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                          </div>
                       </div>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Proof (ID)</label>
                             <Textarea required value={testForm.contentId} onChange={e => setTestForm({...testForm, contentId: e.target.value})} className="h-32 rounded-3xl bg-background/50" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Proof (EN)</label>
                             <Textarea value={testForm.contentEn} onChange={e => setTestForm({...testForm, contentEn: e.target.value})} className="h-32 rounded-3xl bg-background/50" />
                          </div>
                       </div>
                       <Button type="submit" className="w-full h-16 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] bg-primary shadow-2xl shadow-primary/20">Commit Proof</Button>
                    </form>
                  </CardContent>
                </Card>
             </div>
             <div className="xl:col-span-4 space-y-8">
               <h3 className="font-black text-[10px] uppercase tracking-[0.3em] px-4 flex items-center gap-3"><Quote className="h-4 w-4" /> Proof Records ({testimonials.length})</h3>
              <div className="grid gap-4">
                {testimonials.map(t => (
                  <Card key={t.id} className="p-4 flex gap-5 items-center group bg-card/50 backdrop-blur-md border-none hover:bg-muted/50 transition-all rounded-[1.5rem] shadow-xl">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                      {t.avatarUrl && t.avatarUrl.startsWith('http') ? <img src={t.avatarUrl} className="w-full h-full object-cover" /> : <UserCircle className="h-6 w-6 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black truncate text-sm tracking-tight">{t.name}</h4>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{t.roleId}</p>
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
          <TabsContent value="journey" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div className="xl:col-span-8">
                <Card className="rounded-[3rem] shadow-2xl border-none bg-card/50 backdrop-blur-xl">
                  <CardHeader className="p-10 border-b flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="font-black font-headline text-2xl uppercase tracking-tighter">Timeline Evolution</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Map Professional & Academic Milestones</CardDescription>
                    </div>
                    <Button type="button" variant="outline" onClick={() => handleAITranslate('journey', expForm, setExpForm)} disabled={isTranslating === 'journey'} className="rounded-2xl gap-3 h-12 text-[10px] font-black uppercase tracking-widest">
                      {isTranslating === 'journey' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                      AI Translate
                    </Button>
                  </CardHeader>
                  <CardContent className="p-10">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      addExperience({ ...expForm, id: Date.now().toString() } as any);
                      setExpForm({ year: '', company: '', titleId: '', titleEn: '', descriptionId: '', descriptionEn: '' });
                      toast({ title: "Timeline Pushed", description: "Experience record updated." });
                    }} className="space-y-8">
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time Period</label>
                             <Input required value={expForm.year} onChange={e => setExpForm({...expForm, year: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entity</label>
                             <Input required value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                          </div>
                       </div>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title (ID)</label>
                             <Input required value={expForm.titleId} onChange={e => setExpForm({...expForm, titleId: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title (EN)</label>
                             <Input value={expForm.titleEn} onChange={e => setExpForm({...expForm, titleEn: e.target.value})} className="h-14 rounded-2xl bg-background/50" />
                          </div>
                       </div>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Narrative (ID)</label>
                             <Textarea required value={expForm.descriptionId} onChange={e => setExpForm({...expForm, descriptionId: e.target.value})} className="h-32 rounded-3xl bg-background/50" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Narrative (EN)</label>
                             <Textarea value={expForm.descriptionEn} onChange={e => setExpForm({...expForm, descriptionEn: e.target.value})} className="h-32 rounded-3xl bg-background/50" />
                          </div>
                       </div>
                       <Button type="submit" className="w-full h-16 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] bg-primary shadow-2xl shadow-primary/20">Finalize Milestone</Button>
                    </form>
                  </CardContent>
                </Card>
             </div>
             <div className="xl:col-span-4 space-y-8">
               <h3 className="font-black text-[10px] uppercase tracking-[0.3em] px-4 flex items-center gap-3"><History className="h-4 w-4" /> Career Progression ({experiences.length})</h3>
              <div className="grid gap-4">
                {experiences.map(exp => (
                  <Card key={exp.id} className="p-4 flex gap-5 items-center group bg-card/50 backdrop-blur-md border-none hover:bg-muted/50 transition-all rounded-[1.5rem] shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black truncate text-sm tracking-tight">{exp.titleId}</h4>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{exp.year}</p>
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
             <Card className="rounded-[3rem] shadow-2xl border-none bg-card/50 backdrop-blur-xl overflow-hidden">
              <CardHeader className="p-10 border-b">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Settings className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black font-headline tracking-tighter uppercase">Enterprise Maintenance</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Manage Global Data Persistence & Recovery</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-12">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Data Operations</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" onClick={backupData} className="h-32 flex-col gap-4 rounded-[2.5rem] border-primary/20 hover:bg-primary/5 transition-all">
                        <Download className="h-7 w-7 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Export JSON</span>
                      </Button>
                      <Button variant="outline" onClick={() => { if(isSuper) fileInputRef.current?.click(); else toast({variant:"destructive", title:"Security Error", description:"Super Admin required."}) }} className="h-32 flex-col gap-4 rounded-[2.5rem] border-accent/20 hover:bg-accent/5 transition-all">
                        <Upload className="h-7 w-7 text-accent" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Restore State</span>
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
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Security Audit</h4>
                    <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] space-y-6">
                      <div className="flex items-center gap-4 text-amber-600">
                        <ShieldAlert className="h-6 w-6" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Active Access</h4>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-700/80 font-bold uppercase tracking-wide">
                        Atomic operations are restricted to <strong className="text-amber-800">Super Admin</strong> role to prevent data loss.
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-amber-500/10">
                        <span className="text-[8px] font-black uppercase tracking-widest text-amber-600">Status</span>
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
