
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
  MessageSquare, Video, History, ShieldAlert, CheckCircle2, ChevronRight, ExternalLink, Calendar
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
  
  // Forms State
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

  const handleTranslateAll = async (type: 'project' | 'cert' | 'test' | 'journey') => {
    setIsTranslating(true);
    try {
      if (type === 'project') {
        if (projectForm.titleId) await translateSingleField(projectForm.titleId, (v) => setProjectForm(p => ({...p, titleEn: v})));
        if (projectForm.shortDescriptionId) await translateSingleField(projectForm.shortDescriptionId, (v) => setProjectForm(p => ({...p, shortDescriptionEn: v})));
        if (projectForm.fullDescriptionId) await translateSingleField(projectForm.fullDescriptionId, (v) => setProjectForm(p => ({...p, fullDescriptionEn: v})));
      } else if (type === 'cert') {
        if (certForm.titleId) await translateSingleField(certForm.titleId, (v) => setCertForm(p => ({...p, titleEn: v})));
        if (certForm.shortDescriptionId) await translateSingleField(certForm.shortDescriptionId, (v) => setCertForm(p => ({...p, shortDescriptionEn: v})));
        if (certForm.fullDescriptionId) await translateSingleField(certForm.fullDescriptionId, (v) => setCertForm(p => ({...p, fullDescriptionEn: v})));
      } else if (type === 'test') {
        if (testForm.roleId) await translateSingleField(testForm.roleId, (v) => setTestForm(p => ({...p, roleEn: v})));
        if (testForm.contentId) await translateSingleField(testForm.contentId, (v) => setTestForm(p => ({...p, contentEn: v})));
      } else if (type === 'journey') {
        if (expForm.titleId) await translateSingleField(expForm.titleId, (v) => setExpForm(p => ({...p, titleEn: v})));
        if (expForm.descriptionId) await translateSingleField(expForm.descriptionId, (v) => setExpForm(p => ({...p, descriptionEn: v})));
      }
      toast({ title: "Translation Complete" });
    } catch (e) {
      toast({ title: "Translation Failed", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAIComposeCert = async () => {
    if (!certForm.titleId || !certForm.issuer) {
      toast({ title: "Isi Nama Sertifikat & Penerbit terlebih dahulu", variant: "destructive" });
      return;
    }
    setIsAIThinking(true);
    try {
      const result = await generateCertificateDescription({
        title: certForm.titleId,
        issuer: certForm.issuer,
        shortDescription: certForm.shortDescriptionId
      });
      setCertForm(p => ({...p, fullDescriptionId: result.descriptionSuggestion}));
      toast({ title: "AI Berhasil Menulis Deskripsi" });
    } catch (e) {
      toast({ title: "AI Gagal Menulis", variant: "destructive" });
    } finally {
      setIsAIThinking(false);
    }
  };

  const submitProject = (e: React.FormEvent) => {
    e.preventDefault();
    addProject({
      ...projectForm,
      id: Date.now().toString(),
      technologies: projectForm.technologies.split(',').map(s => s.trim()),
    } as any);
    toast({ title: "Proyek Ditambahkan" });
    setProjectForm({ titleId: '', titleEn: '', type: 'web', shortDescriptionId: '', shortDescriptionEn: '', fullDescriptionId: '', fullDescriptionEn: '', technologies: '', imageUrl: '', demoUrl: '' });
  };

  const submitCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    addCertificate({ ...certForm, id: Date.now().toString() });
    toast({ title: "Sertifikat Ditambahkan" });
    setCertForm({ titleId: '', titleEn: '', shortDescriptionId: '', shortDescriptionEn: '', fullDescriptionId: '', fullDescriptionEn: '', year: '', issuer: '', validUntil: '', imageUrl: '' });
  };

  const submitTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    addTestimonial({ ...testForm, id: Date.now().toString() });
    toast({ title: "Testimoni Ditambahkan" });
    setTestForm({ name: '', roleId: '', roleEn: '', contentId: '', contentEn: '', avatarUrl: '' });
  };

  const submitExperience = (e: React.FormEvent) => {
    e.preventDefault();
    addExperience({ ...expForm, id: Date.now().toString() });
    toast({ title: "Riwayat Perjalanan Ditambahkan" });
    setExpForm({ year: '', company: '', titleId: '', titleEn: '', descriptionId: '', descriptionEn: '' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 pb-24">
      {/* Header Admin */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-border h-16 sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-xl h-9 w-9 border border-border">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
               <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-black font-headline tracking-tight uppercase leading-none">Command Center</h1>
              <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-1">v2.4.0 Active</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="hidden sm:flex rounded-lg px-3 py-1 text-[10px] font-bold gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            {user?.email}
          </Badge>
          <Button variant="ghost" onClick={handleLogout} className="text-destructive hover:bg-destructive/10 rounded-xl gap-2 h-9 px-3 text-xs font-bold">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="projects" className="space-y-12">
          {/* Navigasi Tab */}
          <div className={cn(
            "flex justify-center sticky top-20 z-40 transition-all duration-500",
            isTabsVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"
          )}>
            <TabsList className="inline-flex h-14 items-center justify-center rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-2xl p-1.5 w-full max-w-3xl overflow-x-auto no-scrollbar">
              <TabsTrigger value="projects" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-full gap-2">
                <Laptop className="h-4 w-4" /> <span className="hidden sm:inline">Projects</span>
              </TabsTrigger>
              <TabsTrigger value="certificates" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-full gap-2">
                <Award className="h-4 w-4" /> <span className="hidden sm:inline">Certs</span>
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-full gap-2">
                <MessageSquare className="h-4 w-4" /> <span className="hidden sm:inline">Feedback</span>
              </TabsTrigger>
              <TabsTrigger value="journey" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-full gap-2">
                <History className="h-4 w-4" /> <span className="hidden sm:inline">Journey</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-full gap-2">
                <Settings className="h-4 w-4" /> <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-full gap-2">
                <UserCircle className="h-4 w-4" /> <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content: Projects */}
          <TabsContent value="projects" className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="lg:col-span-7 space-y-6">
              <Card className="rounded-[2.5rem] shadow-xl border-border">
                <CardHeader className="p-8 border-b border-border/50 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-black font-headline text-xl">New Deployment</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Initialize new project unit</CardDescription>
                    </div>
                    <Button type="button" variant="outline" onClick={() => handleTranslateAll('project')} disabled={isTranslating} className="rounded-xl gap-2 h-10 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
                      {isTranslating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                      Translate All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={submitProject} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Project Name (ID)</label>
                        <Input required value={projectForm.titleId} onChange={e => setProjectForm({...projectForm, titleId: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Project Name (EN)</label>
                        <Input value={projectForm.titleEn} onChange={e => setProjectForm({...projectForm, titleEn: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Unit Specification (ID)</label>
                      <Textarea required value={projectForm.fullDescriptionId} onChange={e => setProjectForm({...projectForm, fullDescriptionId: e.target.value})} className="min-h-[120px] rounded-xl bg-muted/30" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Asset URL</label>
                        <Input placeholder="https://..." value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Live Endpoint</label>
                        <Input placeholder="https://..." value={projectForm.demoUrl} onChange={e => setProjectForm({...projectForm, demoUrl: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground">Confirm Deployment</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <Laptop className="h-3 w-3 text-primary" /> Active Units ({projects.length})
              </h3>
              <div className="grid gap-4">
                {projects.map(p => (
                  <Card key={p.id} className="p-4 flex gap-4 items-center group bg-card border-border hover:border-primary/50 transition-all rounded-2xl">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-muted">
                      <img src={p.imageUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-sm">{p.titleId}</h4>
                      <Badge variant="secondary" className="text-[8px] font-black uppercase h-5 mt-1">{p.type}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteProject(p.id)} className="text-destructive hover:bg-destructive/10 h-9 w-9 rounded-xl">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tab Content: Certificates */}
          <TabsContent value="certificates" className="grid lg:grid-cols-12 gap-8 animate-in fade-in">
             <div className="lg:col-span-7 space-y-6">
              <Card className="rounded-[2.5rem] shadow-xl border-border">
                <CardHeader className="p-8 border-b border-border/50 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-black font-headline text-xl">Issue Certificate</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Register official credentials</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={handleAIComposeCert} disabled={isAIThinking} className="rounded-xl gap-2 h-10 text-[10px] font-black uppercase tracking-widest border-accent/20 text-accent">
                        {isAIThinking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        AI Write
                      </Button>
                      <Button type="button" variant="outline" onClick={() => handleTranslateAll('cert')} disabled={isTranslating} className="rounded-xl gap-2 h-10 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
                        {isTranslating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                        Translate
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={submitCertificate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Cert Title (ID)</label>
                        <Input required value={certForm.titleId} onChange={e => setCertForm({...certForm, titleId: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Issuer Name</label>
                        <Input required value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Description (ID)</label>
                      <Textarea required value={certForm.fullDescriptionId} onChange={e => setCertForm({...certForm, fullDescriptionId: e.target.value})} className="min-h-[100px] rounded-xl bg-muted/30" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                       <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Issue Year</label>
                        <Input placeholder="2024" value={certForm.year} onChange={e => setCertForm({...certForm, year: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Valid Until</label>
                        <Input placeholder="Lifetime / 2026" value={certForm.validUntil} onChange={e => setCertForm({...certForm, validUntil: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Asset URL</label>
                        <Input placeholder="https://..." value={certForm.imageUrl} onChange={e => setCertForm({...certForm, imageUrl: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-accent text-accent-foreground">Validate Credential</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <Award className="h-3 w-3 text-accent" /> Valid Credentials ({certificates.length})
              </h3>
              <div className="grid gap-4">
                {certificates.map(c => (
                  <Card key={c.id} className="p-4 flex gap-4 items-center group bg-card border-border hover:border-accent/50 transition-all rounded-2xl">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-muted">
                      <img src={c.imageUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-sm">{c.titleId}</h4>
                      <p className="text-[8px] text-muted-foreground font-black uppercase mt-1">{c.issuer} &bull; {c.year}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteCertificate(c.id)} className="text-destructive hover:bg-destructive/10 h-9 w-9 rounded-xl">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tab Content: Testimonials (Feedback) */}
          <TabsContent value="testimonials" className="grid lg:grid-cols-12 gap-8 animate-in fade-in">
             <div className="lg:col-span-7 space-y-6">
              <Card className="rounded-[2.5rem] shadow-xl border-border">
                <CardHeader className="p-8 border-b border-border/50 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-black font-headline text-xl">Client Feedback</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Manage public testimonials</CardDescription>
                    </div>
                    <Button type="button" variant="outline" onClick={() => handleTranslateAll('test')} disabled={isTranslating} className="rounded-xl gap-2 h-10 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
                      <Languages className="h-3 w-3" /> Translate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={submitTestimonial} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Author Name</label>
                        <Input required value={testForm.name} onChange={e => setTestForm({...testForm, name: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Avatar URL</label>
                        <Input value={testForm.avatarUrl} onChange={e => setTestForm({...testForm, avatarUrl: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Professional Role (ID)</label>
                        <Input required value={testForm.roleId} onChange={e => setTestForm({...testForm, roleId: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Testimonial Content (ID)</label>
                      <Textarea required value={testForm.contentId} onChange={e => setTestForm({...testForm, contentId: e.target.value})} className="min-h-[120px] rounded-xl bg-muted/30" />
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground">Archive Feedback</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <Quote className="h-3 w-3 text-primary" /> Archived Feedbacks ({testimonials.length})
              </h3>
              <div className="grid gap-4">
                {testimonials.map(t => (
                  <Card key={t.id} className="p-4 flex gap-4 items-center group bg-card border-border hover:border-primary/50 transition-all rounded-2xl">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-muted border border-border">
                      <img src={t.avatarUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-sm">{t.name}</h4>
                      <p className="text-[9px] text-muted-foreground font-medium truncate">{t.roleId}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteTestimonial(t.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tab Content: Journey (Experiences) */}
          <TabsContent value="journey" className="grid lg:grid-cols-12 gap-8 animate-in fade-in">
             <div className="lg:col-span-7 space-y-6">
              <Card className="rounded-[2.5rem] shadow-xl border-border">
                <CardHeader className="p-8 border-b border-border/50 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-black font-headline text-xl">Career Journey</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Log professional milestones</CardDescription>
                    </div>
                    <Button type="button" variant="outline" onClick={() => handleTranslateAll('journey')} disabled={isTranslating} className="rounded-xl gap-2 h-10 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
                      <Languages className="h-3 w-3" /> Translate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={submitExperience} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Period (e.g. 2023 - Now)</label>
                        <Input required value={expForm.year} onChange={e => setExpForm({...expForm, year: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Organization / Company</label>
                        <Input required value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Professional Title (ID)</label>
                        <Input required value={expForm.titleId} onChange={e => setExpForm({...expForm, titleId: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Key Responsibilities (ID)</label>
                      <Textarea required value={expForm.descriptionId} onChange={e => setExpForm({...expForm, descriptionId: e.target.value})} className="min-h-[120px] rounded-xl bg-muted/30" />
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground">Log Milestone</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <History className="h-3 w-3 text-primary" /> Timeline Feed ({experiences.length})
              </h3>
              <div className="grid gap-4">
                {experiences.map(e => (
                  <Card key={e.id} className="p-4 flex gap-4 items-center group bg-card border-border hover:border-primary/50 transition-all rounded-2xl">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Briefcase className="h-4 w-4 text-primary/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-sm">{e.titleId}</h4>
                      <p className="text-[9px] text-muted-foreground font-black uppercase">{e.company} &bull; {e.year}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteExperience(e.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tab Content: Stats */}
          <TabsContent value="stats" className="max-w-2xl mx-auto animate-in fade-in">
             <Card className="rounded-[2.5rem] shadow-xl border-border bg-card">
              <CardHeader className="p-8 border-b border-border/50 bg-muted/20">
                <CardTitle className="flex items-center gap-3 text-xl font-black font-headline"><Settings className="text-primary h-5 w-5" /> Analytics Propagator</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Update global performance counters</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Completed Units</label>
                    <Input value={statsData.completedProjects} onChange={e => setStatsData({...statsData, completedProjects: e.target.value})} className="h-12 rounded-xl bg-muted/30 text-center font-black text-lg" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Dev Cycle Years</label>
                    <Input value={statsData.yearsExperience} onChange={e => setStatsData({...statsData, yearsExperience: e.target.value})} className="h-12 rounded-xl bg-muted/30 text-center font-black text-lg" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Frameworks Mastered</label>
                    <Input value={statsData.techMastered} onChange={e => setStatsData({...statsData, techMastered: e.target.value})} className="h-12 rounded-xl bg-muted/30 text-center font-black text-lg" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Satisfaction Rate</label>
                    <Input value={statsData.clientSatisfaction} onChange={e => setStatsData({...statsData, clientSatisfaction: e.target.value})} className="h-12 rounded-xl bg-muted/30 text-center font-black text-lg" />
                  </div>
                </div>
                <Button onClick={() => {updateStats(statsData); toast({title: "Metrics Synced"});}} className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-foreground text-background">Propagate Core Metrics</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Content: Profile */}
          <TabsContent value="profile" className="max-w-3xl mx-auto animate-in fade-in">
             <Card className="rounded-[2.5rem] shadow-xl border-border bg-card">
              <CardHeader className="p-8 border-b border-border/50 bg-muted/20">
                <CardTitle className="flex items-center gap-3 text-xl font-black font-headline"><UserCircle className="text-primary h-5 w-5" /> Brand Identity</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Modify public profile metadata</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Full Name</label>
                    <Input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="h-11 rounded-xl bg-muted/30 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Current Role (ID)</label>
                    <Input value={profileData.roleId} onChange={e => setProfileData({...profileData, roleId: e.target.value})} className="h-11 rounded-xl bg-muted/30 font-bold" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Biography (ID)</label>
                  <Textarea value={profileData.aboutTextId} onChange={e => setProfileData({...profileData, aboutTextId: e.target.value})} className="min-h-[120px] rounded-xl bg-muted/30 text-sm resize-none" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">WhatsApp</label>
                    <Input placeholder="628..." value={profileData.whatsapp} onChange={e => setProfileData({...profileData, whatsapp: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">LinkedIn URL</label>
                    <Input value={profileData.linkedin} onChange={e => setProfileData({...profileData, linkedin: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                  </div>
                </div>

                <Button onClick={() => {updateProfile(profileData); toast({title: "Identity Synced"});}} className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground">Update Cloud Identity</Button>
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
