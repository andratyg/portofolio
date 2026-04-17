
"use client"

import React, { useEffect, useState } from 'react';
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
  Briefcase, LayoutDashboard, Github, Instagram, Linkedin, 
  MessageSquare, Video, History, ShieldAlert, CheckCircle2, ChevronRight, ExternalLink
} from 'lucide-react';
import { generatePortfolioDescriptionSuggestion } from '@/ai/flows/generate-portfolio-description-suggestion';
import { generateCertificateDescription } from '@/ai/flows/generate-certificate-description';
import { translateContent } from '@/ai/flows/translate-content';
import { useToast } from '@/hooks/use-toast';
import { ProfileData } from '@/lib/types';
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
    stats, updateStats,
    profile, updateProfile,
    isLoading: storeLoading
  } = useProjectStore();
  
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTabsVisible, setIsTabsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Check if current user is an authorized admin in Firestore
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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 120) {
        setIsTabsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsTabsVisible(false);
      } else {
        setIsTabsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  const [projectForm, setProjectForm] = useState({
    titleId: '', titleEn: '',
    type: 'web' as 'web' | 'ui' | 'backend',
    shortDescriptionId: '', shortDescriptionEn: '',
    fullDescriptionId: '', fullDescriptionEn: '',
    technologies: '',
    imageUrl: '',
    demoUrl: ''
  });

  const [certForm, setCertForm] = useState({
    titleId: '', titleEn: '',
    shortDescriptionId: '', shortDescriptionEn: '',
    fullDescriptionId: '', fullDescriptionEn: '',
    year: '', issuer: '', validUntil: '', imageUrl: ''
  });

  const [testForm, setTestForm] = useState({
    name: '',
    roleId: '', roleEn: '',
    contentId: '', contentEn: '',
    avatarUrl: ''
  });

  const [expForm, setExpForm] = useState({
    year: '',
    company: '',
    titleId: '', titleEn: '',
    descriptionId: '', descriptionEn: ''
  });

  const [statsData, setStatsData] = useState(stats);
  const [profileData, setProfileData] = useState<ProfileData>(profile);

  useEffect(() => {
    if (stats) setStatsData(stats);
    if (profile) setProfileData(profile);
  }, [stats, profile]);

  if (isUserLoading || storeLoading || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Synchronizing Cloud Data</p>
        </div>
      </div>
    );
  }

  // If logged in but not an authorized admin
  if (user && !adminData && !isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-xl rounded-[2.5rem] border-none shadow-2xl bg-card/50 backdrop-blur-xl p-10 text-center space-y-8">
          <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black font-headline">Unauthorized Account</h2>
            <p className="text-muted-foreground text-sm">
              Your account (<strong>{user.email}</strong>) is authenticated but not authorized as an administrator in the database.
            </p>
          </div>
          <div className="p-6 bg-muted/30 rounded-3xl text-left space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Required Action:</p>
            <ol className="text-xs text-muted-foreground space-y-3 list-decimal list-inside">
              <li>
                Copy your UID: <code className="bg-background px-2 py-1 rounded text-primary font-bold select-all">{user.uid}</code>
              </li>
              <li>
                Go to <span className="font-bold text-foreground">Firebase Console</span> &rarr; <span className="font-bold text-foreground">Firestore</span>.
              </li>
              <li>
                Add this UID as a <span className="font-bold">Document ID</span> in the <code className="font-bold text-foreground">admins</code> collection.
              </li>
            </ol>
          </div>
          <Button onClick={() => signOut(auth)} variant="outline" className="w-full h-12 rounded-2xl gap-2 font-bold">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </Card>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };

  const translateSingleField = async (text: string, callback: (val: string) => void) => {
    if (!text) return;
    try {
      const result = await translateContent({ text, targetLang: 'en' });
      callback(result.translatedText);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTranslateProject = async () => {
    if (!projectForm.titleId && !projectForm.shortDescriptionId && !projectForm.fullDescriptionId) {
      toast({ title: "Isi konten Indonesia terlebih dahulu", variant: "destructive" });
      return;
    }
    setIsTranslating(true);
    try {
      if (projectForm.titleId) await translateSingleField(projectForm.titleId, (v) => setProjectForm(p => ({...p, titleEn: v})));
      if (projectForm.shortDescriptionId) await translateSingleField(projectForm.shortDescriptionId, (v) => setProjectForm(p => ({...p, shortDescriptionEn: v})));
      if (projectForm.fullDescriptionId) await translateSingleField(projectForm.fullDescriptionId, (v) => setProjectForm(p => ({...p, fullDescriptionEn: v})));
      toast({ title: "Proyek berhasil diterjemahkan" });
    } catch (e) {
      toast({ title: "Gagal menerjemahkan", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const submitProject = (e: React.FormEvent) => {
    e.preventDefault();
    addProject({
      ...projectForm,
      id: Date.now().toString(),
      technologies: projectForm.technologies.split(',').map(s => s.trim()),
    } as any);
    toast({ title: "Proyek Ditambahkan ke Cloud" });
    setProjectForm({ titleId: '', titleEn: '', type: 'web', shortDescriptionId: '', shortDescriptionEn: '', fullDescriptionId: '', fullDescriptionEn: '', technologies: '', imageUrl: '', demoUrl: '' });
  };

  const submitCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    addCertificate({ ...certForm, id: Date.now().toString() });
    toast({ title: "Sertifikat Ditambahkan ke Cloud" });
    setCertForm({ titleId: '', titleEn: '', shortDescriptionId: '', shortDescriptionEn: '', fullDescriptionId: '', fullDescriptionEn: '', year: '', issuer: '', validUntil: '', imageUrl: '' });
  };

  const submitTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    addTestimonial({ ...testForm, id: Date.now().toString() });
    toast({ title: "Testimoni Ditambahkan ke Cloud" });
    setTestForm({ name: '', roleId: '', roleEn: '', contentId: '', contentEn: '', avatarUrl: '' });
  };

  const submitExperience = (e: React.FormEvent) => {
    e.preventDefault();
    addExperience({ ...expForm, id: Date.now().toString() });
    toast({ title: "Riwayat Karir Ditambahkan ke Cloud" });
    setExpForm({ year: '', company: '', titleId: '', titleEn: '', descriptionId: '', descriptionEn: '' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Header Admin yang Lebih Ramping */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-border h-16 sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-xl h-9 w-9 border border-border">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
               <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black font-headline tracking-tight uppercase leading-none">Management</h1>
              <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-1">Infrastructure Control</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 mr-4 bg-muted/50 px-3 py-1.5 rounded-xl border border-border">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{user?.email}</span>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-destructive hover:bg-destructive/10 rounded-xl gap-2 px-3 h-9 text-xs font-bold">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="projects" className="space-y-8">
          {/* Smart Tab Navigation */}
          <div className={cn(
            "flex justify-center sticky top-20 z-40 transition-all duration-500",
            isTabsVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"
          )}>
            <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-muted/80 backdrop-blur-xl border border-border shadow-xl p-1 w-full max-w-3xl overflow-x-auto no-scrollbar">
              <TabsTrigger value="projects" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-full gap-2">
                <Laptop className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Projects</span>
              </TabsTrigger>
              <TabsTrigger value="certificates" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-full gap-2">
                <Award className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Certs</span>
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-full gap-2">
                <MessageSquare className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Feedback</span>
              </TabsTrigger>
              <TabsTrigger value="journey" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-full gap-2">
                <History className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Journey</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-full gap-2">
                <Settings className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-full gap-2">
                <UserCircle className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="projects" className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Form Input Proyek */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="rounded-[2rem] shadow-lg border border-border bg-card overflow-hidden">
                <CardHeader className="p-6 border-b border-border/50 bg-muted/20">
                  <div className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-lg font-black font-headline"><Plus className="text-primary h-4 w-4" /> New Unit</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Register a new deployment</CardDescription>
                    </div>
                    <Button type="button" variant="outline" onClick={handleTranslateProject} disabled={isTranslating} className="rounded-xl gap-2 h-9 px-4 text-xs font-bold border-primary/20 text-primary hover:bg-primary/10">
                      {isTranslating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                      Translate All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={submitProject} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Project Name (ID)</label>
                        <Input required value={projectForm.titleId} onChange={e => setProjectForm({...projectForm, titleId: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-border focus:ring-primary/20" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Project Name (EN)</label>
                        <Input value={projectForm.titleEn} onChange={e => setProjectForm({...projectForm, titleEn: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-border focus:ring-primary/20" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Project Details (ID)</label>
                        <Textarea required placeholder="Describe the unit..." value={projectForm.fullDescriptionId} onChange={e => setProjectForm({...projectForm, fullDescriptionId: e.target.value})} className="min-h-[120px] rounded-xl bg-muted/30 border-border text-sm resize-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Project Details (EN)</label>
                        <Textarea placeholder="Translated details..." value={projectForm.fullDescriptionEn} onChange={e => setProjectForm({...projectForm, fullDescriptionEn: e.target.value})} className="min-h-[120px] rounded-xl bg-muted/30 border-border text-sm resize-none" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Deployment Class</label>
                        <select className="w-full h-11 rounded-xl border border-border bg-muted/30 px-3 text-xs font-bold focus:ring-2 focus:ring-primary/20" value={projectForm.type} onChange={e => setProjectForm({...projectForm, type: e.target.value as any})}>
                          <option value="web">Web Application</option>
                          <option value="ui">UI/UX Prototype</option>
                          <option value="backend">Backend Service</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Tech Stack (CSV)</label>
                        <Input placeholder="Next.js, TS, Firebase..." value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-border" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Visual Asset URL</label>
                        <Input placeholder="https://..." value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-border" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Live Endpoint</label>
                        <Input placeholder="https://..." value={projectForm.demoUrl} onChange={e => setProjectForm({...projectForm, demoUrl: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-border" />
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 bg-primary hover:scale-[0.99] transition-transform">Initialize Deployment</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            {/* Daftar Koleksi Proyek */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2 text-foreground">
                    <Laptop className="h-3 w-3 text-primary" /> Cloud Storage
                  </h3>
                  <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">Active deployments</p>
                </div>
                <Badge className="rounded-lg bg-muted text-muted-foreground font-black text-[10px] px-3 py-1">{projects.length} UNITS</Badge>
              </div>
              
              <div className="grid gap-4">
                {projects.length === 0 ? (
                  <div className="py-12 text-center bg-muted/20 rounded-[2rem] border-2 border-dashed border-border">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No active units</p>
                  </div>
                ) : projects.map(p => (
                  <Card key={p.id} className="p-4 flex gap-4 items-center group bg-card border-border hover:border-primary/50 hover:shadow-xl transition-all rounded-2xl shadow-sm overflow-hidden">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted border border-border">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <ImageIcon className="w-5 h-5 m-auto text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-sm mb-1">{p.titleId}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[8px] font-black uppercase h-5 bg-muted/50 border-none">{p.type}</Badge>
                        <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 className="h-2 w-2 text-green-500" /> Active
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="ghost" size="icon" onClick={() => deleteProject(p.id)} className="text-destructive hover:bg-destructive/10 h-9 w-9 rounded-xl shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => p.demoUrl && window.open(p.demoUrl, '_blank')} className="text-muted-foreground hover:bg-muted h-9 w-9 rounded-xl shrink-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="max-w-2xl mx-auto animate-in fade-in duration-500">
             <Card className="rounded-[2.5rem] shadow-xl border border-border bg-card overflow-hidden">
              <CardHeader className="p-8 border-b border-border bg-muted/20">
                <CardTitle className="flex items-center gap-3 text-lg font-black font-headline tracking-tighter"><Settings className="text-primary h-5 w-5" /> Analytics Engine</CardTitle>
                <CardDescription className="text-[10px] uppercase font-black tracking-widest">Update global performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Total Deployments</label>
                    <Input value={statsData.completedProjects} onChange={e => setStatsData({...statsData, completedProjects: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-border font-black text-center text-lg" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Experience Years</label>
                    <Input value={statsData.yearsExperience} onChange={e => setStatsData({...statsData, yearsExperience: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-border font-black text-center text-lg" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Tech Mastered</label>
                    <Input value={statsData.techMastered} onChange={e => setStatsData({...statsData, techMastered: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-border font-black text-center text-lg" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Client Satisfaction</label>
                    <Input value={statsData.clientSatisfaction} onChange={e => setStatsData({...statsData, clientSatisfaction: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-border font-black text-center text-lg" />
                  </div>
                </div>
                <Button onClick={() => {updateStats(statsData); toast({title: "Firestore Synced"});}} className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-[0.2em] bg-foreground text-background hover:bg-foreground/90 shadow-xl transition-all">Propagate Core Metrics</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="max-w-3xl mx-auto animate-in fade-in duration-500">
             <Card className="rounded-[2.5rem] shadow-xl border border-border bg-card overflow-hidden">
              <CardHeader className="p-8 border-b border-border bg-muted/20">
                <CardTitle className="flex items-center gap-3 text-lg font-black font-headline tracking-tighter"><UserCircle className="text-primary h-5 w-5" /> Brand Identity</CardTitle>
                <CardDescription className="text-[10px] uppercase font-black tracking-widest">Manage public profile metadata</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Full Identity</label>
                    <Input placeholder="Public Name" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-border font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Primary Role (ID)</label>
                    <Input placeholder="Role Name" value={profileData.roleId} onChange={e => setProfileData({...profileData, roleId: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-border font-bold" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Biography (ID)</label>
                  <Textarea placeholder="Tell your story..." value={profileData.aboutTextId} onChange={e => setProfileData({...profileData, aboutTextId: e.target.value})} className="min-h-[120px] rounded-xl bg-muted/30 border-border text-sm resize-none" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Communication (WA)</label>
                    <Input placeholder="628..." value={profileData.whatsapp} onChange={e => setProfileData({...profileData, whatsapp: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-border" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Github Endpoint</label>
                    <Input placeholder="https://github.com/..." value={profileData.github} onChange={e => setProfileData({...profileData, github: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-border" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">LinkedIn Profile</label>
                    <Input placeholder="https://linkedin.com/in/..." value={profileData.linkedin} onChange={e => setProfileData({...profileData, linkedin: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-border" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">TikTok Feed</label>
                    <Input placeholder="https://tiktok.com/@..." value={profileData.tiktok} onChange={e => setProfileData({...profileData, tiktok: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-border" />
                  </div>
                </div>

                <Button onClick={() => {updateProfile(profileData); toast({title: "Identity Synced"});}} className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl transition-all">Update Cloud Identity</Button>
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
