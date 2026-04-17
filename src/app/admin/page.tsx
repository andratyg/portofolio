
"use client"

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore, ProjectStoreProvider } from '@/components/ProjectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Trash2, Sparkles, LogOut, ArrowLeft, Laptop, Award, Settings, 
  UserCircle, Loader2, Image as ImageIcon, Quote, 
  Briefcase, History, ShieldAlert, ShieldCheck, 
  Download, Upload, WifiOff, Edit3, Save, X,
  Activity, Terminal, Link as LinkIcon, FileUp, FileType, Zap, AlertCircle, 
  Instagram, Github, Linkedin, MessageSquare, Video, Globe2, Camera,
  GraduationCap, Milestone, Calendar
} from 'lucide-react';
import { translateContent } from '@/ai/flows/translate-content';
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
  const [isOnline, setIsOnline] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  // Edit States
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [editingJourneyId, setEditingJourneyId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) setIsHeaderVisible(true);
      else if (currentScrollY > lastScrollY) setIsHeaderVisible(false);
      else setIsHeaderVisible(true);
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
  
  // Forms Initial State
  const initialProjectState = {
    titleId: '', titleEn: '', type: 'web' as 'web' | 'ui' | 'backend',
    shortDescriptionId: '', shortDescriptionEn: '', 
    fullDescriptionId: '', fullDescriptionEn: '',
    problemId: '', problemEn: '', solutionId: '', solutionEn: '',
    resultId: '', resultEn: '', impactStats: '',
    technologies: '', imageUrl: '', demoUrl: '', featured: false
  };

  const initialCertState = {
    titleId: '', titleEn: '', issuer: '', year: '', validUntil: '', imageUrl: '',
    shortDescriptionId: '', shortDescriptionEn: '', fullDescriptionId: '', fullDescriptionEn: '',
    credentialUrl: ''
  };

  const initialJourneyState = {
    year: '', titleId: '', titleEn: '', company: '', descriptionId: '', descriptionEn: ''
  };

  const [projectForm, setProjectForm] = useState(initialProjectState);
  const [certForm, setCertForm] = useState(initialCertState);
  const [journeyForm, setJourneyForm] = useState(initialJourneyState);
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

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileFormData);
    updateStats(statsFormData);
    toast({ title: "Global Identity Synced", description: "Profile and metrics updated." });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File Too Large", description: "Maximum file size is 2MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setter(base64);
      toast({ title: "File Ready", description: "Document has been synced." });
    };
    reader.readAsDataURL(file);
  };

  // Start Edit Logic
  const startEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setProjectForm({
      ...p,
      technologies: p.technologies?.join(', ') || ''
    } as any);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const startEditCert = (c: Certificate) => {
    setEditingCertId(c.id);
    setCertForm({ ...c } as any);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const startEditJourney = (j: Experience) => {
    setEditingJourneyId(j.id);
    setJourneyForm({ ...j } as any);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProjectId(null);
    setEditingCertId(null);
    setEditingJourneyId(null);
    setProjectForm(initialProjectState);
    setCertForm(initialCertState);
    setJourneyForm(initialJourneyState);
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
            <h2 className="text-3xl font-black font-headline uppercase text-foreground">Access Restricted</h2>
            <p className="text-muted-foreground text-sm">UID: <code className="bg-muted px-2 py-1 rounded select-all font-bold">{user.uid}</code></p>
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

      <header className={cn(
        "bg-background/80 backdrop-blur-2xl border-b h-20 sticky top-0 z-50 flex items-center justify-between px-8 transition-transform duration-500",
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-xl h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xs font-black font-headline uppercase tracking-widest flex items-center gap-2 text-foreground">
              NAT CONTROL PANEL
              <Badge className="h-5 text-[8px] bg-primary text-primary-foreground font-black rounded-full px-2">{userRole.toUpperCase()}</Badge>
            </h1>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => signOut(auth)} className="text-foreground hover:bg-muted rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest gap-2">
          <LogOut className="h-4 w-4" /> EXIT
        </Button>
      </header>

      <div className="container mx-auto px-6 py-12">
        <Tabs defaultValue="profile" className="space-y-12">
          <div className={cn(
            "flex justify-center sticky z-40 transition-all duration-500",
            isHeaderVisible ? "top-24" : "top-4"
          )}>
            <TabsList className="h-20 bg-card backdrop-blur-2xl border border-border shadow-2xl p-2 rounded-[2.5rem] w-full max-w-5xl overflow-x-auto no-scrollbar flex justify-between gap-1">
              <TabsTrigger value="profile" className="rounded-[1.8rem] font-black uppercase text-[10px] tracking-[0.15em] gap-2 px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground transition-all"><UserCircle className="h-4 w-4" /> PROFILE</TabsTrigger>
              <TabsTrigger value="projects" className="rounded-[1.8rem] font-black uppercase text-[10px] tracking-[0.15em] gap-2 px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground transition-all"><Laptop className="h-4 w-4" /> PROJECTS</TabsTrigger>
              <TabsTrigger value="certificates" className="rounded-[1.8rem] font-black uppercase text-[10px] tracking-[0.15em] gap-2 px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground transition-all"><Award className="h-4 w-4" /> CERTS</TabsTrigger>
              <TabsTrigger value="journey" className="rounded-[1.8rem] font-black uppercase text-[10px] tracking-[0.15em] gap-2 px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground transition-all"><History className="h-4 w-4" /> JOURNEY</TabsTrigger>
              <TabsTrigger value="system" className="rounded-[1.8rem] font-black uppercase text-[10px] tracking-[0.15em] gap-2 px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground transition-all"><Settings className="h-4 w-4" /> SYSTEM</TabsTrigger>
            </TabsList>
          </div>

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-8 duration-500">
             <Card className="rounded-[2.5rem] shadow-none border-none bg-transparent">
                <CardContent className="p-0">
                  <form onSubmit={handleProfileSubmit} className="space-y-20">
                    <div className="space-y-12">
                      <div className="flex items-center gap-4 border-l-4 border-accent pl-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-accent">Visual Branding</h3>
                      </div>
                      <div className="grid lg:grid-cols-12 gap-10 items-start">
                        <div className="lg:col-span-4 space-y-6">
                           <div className="relative group w-full aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-muted border-4 border-background shadow-2xl">
                              <img 
                                src={profileFormData.profilePictureUrl || "https://picsum.photos/seed/karyapro-profile/600/800"} 
                                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" 
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="rounded-2xl h-14 bg-white/20 backdrop-blur-xl border-white/30 text-white gap-2"
                                    onClick={() => profileImageInputRef.current?.click()}
                                  >
                                    <Camera className="h-5 w-5" /> CHANGE PHOTO
                                 </Button>
                              </div>
                              <input 
                                type="file" 
                                ref={profileImageInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => handleFileUpload(e, (url) => setProfileFormData({...profileFormData, profilePictureUrl: url}))} 
                              />
                           </div>
                        </div>
                        <div className="lg:col-span-8 space-y-8">
                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Full Name</label>
                                  <Input value={profileFormData.name} onChange={e => setProfileFormData({...profileFormData, name: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none" />
                              </div>
                              <div className="space-y-3">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Email Node</label>
                                  <Input value={profileFormData.email} onChange={e => setProfileFormData({...profileFormData, email: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none" />
                              </div>
                           </div>
                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Role Title (ID)</label>
                                  <Input value={profileFormData.roleId} onChange={e => setProfileFormData({...profileFormData, roleId: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none" />
                              </div>
                              <div className="space-y-3">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Role Title (EN)</label>
                                  <Input value={profileFormData.roleEn} onChange={e => setProfileFormData({...profileFormData, roleEn: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none" />
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-12">
                      <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary">Narrative & Bio</h3>
                        <Button type="button" size="sm" onClick={() => handleAITranslate('profile', profileFormData, setProfileFormData)} disabled={isTranslating === 'profile'} className="ml-auto rounded-xl bg-primary/10 text-primary hover:bg-primary/20 h-10 px-4 text-[9px] font-black uppercase tracking-widest">
                           {isTranslating === 'profile' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 mr-2" />} AI SYNC LOCALES
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">About Me (ID)</label>
                            <Textarea value={profileFormData.aboutMeId} onChange={e => setProfileFormData({...profileFormData, aboutMeId: e.target.value})} className="h-40 rounded-[2rem] bg-muted/30 border-none p-6" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">About Me (EN)</label>
                            <Textarea value={profileFormData.aboutMeEn} onChange={e => setProfileFormData({...profileFormData, aboutMeEn: e.target.value})} className="h-40 rounded-[2rem] bg-muted/30 border-none p-6" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-12">
                      <div className="flex items-center gap-4 border-l-4 border-accent pl-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-accent">Strategic Metrics</h3>
                      </div>
                      <div className="grid lg:grid-cols-4 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" /> Deployed</label>
                            <Input value={statsFormData.completedProjects} onChange={e => setStatsFormData({...statsFormData, completedProjects: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none font-black text-lg" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Activity className="h-3.5 w-3.5" /> Experience</label>
                            <Input value={statsFormData.yearsExperience} onChange={e => setStatsFormData({...statsFormData, yearsExperience: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none font-black text-lg" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Terminal className="h-3.5 w-3.5" /> Stack Count</label>
                            <Input value={statsFormData.techMastered} onChange={e => setStatsFormData({...statsFormData, techMastered: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none font-black text-lg" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> Satisfaction</label>
                            <Input value={statsFormData.clientSatisfaction} onChange={e => setStatsFormData({...statsFormData, clientSatisfaction: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none font-black text-lg" />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground shadow-xl hover:scale-[1.01] transition-all">SYNC GLOBAL IDENTITY</Button>
                  </form>
                </CardContent>
             </Card>
          </TabsContent>

          {/* PROJECTS TAB */}
          <TabsContent value="projects" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="xl:col-span-8">
               <Card className="rounded-[2.5rem] shadow-none border-none bg-transparent">
                <CardHeader className="p-0 pb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <CardTitle className="font-black font-headline text-3xl uppercase tracking-tighter text-foreground">
                      {editingProjectId ? 'Edit Case Study' : 'Deploy Case Study'}
                    </CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground/80">
                      Archive Professional Technical Infrastructure
                    </CardDescription>
                  </div>
                  {editingProjectId && (
                    <Button variant="ghost" onClick={cancelEdit} className="rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest h-12">
                      <X className="h-4 w-4" /> Cancel Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addProject({ 
                      ...projectForm, 
                      id: editingProjectId || Date.now().toString(), 
                      technologies: projectForm.technologies?.split(',').map(s => s.trim()) || []
                    } as any);
                    setProjectForm(initialProjectState);
                    setEditingProjectId(null);
                    toast({ title: editingProjectId ? "Update Success" : "Deployment Success", description: "Case study synced to live node." });
                  }} className="space-y-12">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Title (ID)</label>
                        <Input required value={projectForm.titleId} onChange={e => setProjectForm({...projectForm, titleId: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Title (EN)</label>
                        <Input value={projectForm.titleEn} onChange={e => setProjectForm({...projectForm, titleEn: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none" />
                      </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Visual Architecture (Image)</label>
                        <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setProjectForm({...projectForm, imageUrl: url}))} className="h-16 rounded-2xl bg-muted/30 border-none cursor-pointer pt-5" />
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground shadow-xl">
                      {editingProjectId ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      {editingProjectId ? 'SAVE DEPLOYMENT' : 'COMMIT DEPLOYMENT'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="xl:col-span-4 space-y-8">
               <h3 className="font-black text-[11px] uppercase tracking-[0.4em] px-4 flex items-center gap-4 text-primary"><Laptop className="h-4 w-4" /> LIVE CLUSTER ({projects.length})</h3>
              <div className="grid gap-4">
                {projects.map(p => (
                  <Card key={p.id} className="p-5 flex gap-5 items-center group bg-card border-none hover:bg-muted/30 transition-all rounded-2xl shadow-sm overflow-hidden relative">
                    <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0 border border-border/50">
                      <img src={p.imageUrl || "https://placehold.co/100x100?text=Project"} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black truncate text-sm tracking-tight text-foreground">{p.titleId}</h4>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" size="icon" onClick={() => startEditProject(p)} className="text-primary hover:bg-primary/10 h-10 w-10 rounded-xl">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      {isSuper && (
                        <Button variant="ghost" size="icon" onClick={() => deleteProject(p.id)} className="text-destructive hover:bg-destructive/10 h-10 w-10 rounded-xl">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* CERTIFICATES TAB */}
          <TabsContent value="certificates" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="xl:col-span-8">
              <Card className="rounded-[2.5rem] shadow-none border-none bg-transparent">
                <CardHeader className="p-0 pb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <CardTitle className="font-black font-headline text-3xl uppercase tracking-tighter text-foreground">
                      {editingCertId ? 'Edit Credential' : 'Log Credential'}
                    </CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground/80">Specialized Technical Validation Archive</CardDescription>
                  </div>
                  {editingCertId && (
                    <Button variant="ghost" onClick={cancelEdit} className="rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest h-12">
                      <X className="h-4 w-4" /> Cancel Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addCertificate({ ...certForm, id: editingCertId || Date.now().toString() } as any);
                    setCertForm(initialCertState);
                    setEditingCertId(null);
                    toast({ title: editingCertId ? "Update Success" : "Credential Logged", description: "Certificate added to global vault." });
                  }} className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Title (ID)</label>
                        <Input required value={certForm.titleId} onChange={e => setCertForm({...certForm, titleId: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Issuer</label>
                        <Input required value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Year Obtained</label>
                        <Input required placeholder="2024" value={certForm.year} onChange={e => setCertForm({...certForm, year: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Valid Until</label>
                        <Input placeholder="Lifetime / 2026" value={certForm.validUntil} onChange={e => setCertForm({...certForm, validUntil: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Verification URL / PDF</label>
                          <Input value={certForm.credentialUrl} onChange={e => setCertForm({...certForm, credentialUrl: e.target.value})} placeholder="https://..." className="h-16 rounded-2xl bg-muted/30 border-none" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2"><FileUp className="h-3 w-3" /> Upload PDF Document</label>
                          <Input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, (url) => setCertForm({...certForm, credentialUrl: url}))} className="h-16 rounded-2xl bg-muted/30 border-none cursor-pointer pt-5" />
                       </div>
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground shadow-xl">
                      {editingCertId ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      {editingCertId ? 'SAVE CREDENTIAL' : 'LOCK CREDENTIAL'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="xl:col-span-4 space-y-8">
               <h3 className="font-black text-[11px] uppercase tracking-[0.4em] px-4 flex items-center gap-4 text-primary"><Award className="h-4 w-4" /> ACTIVE VALIDATIONS ({certificates.length})</h3>
              <div className="grid gap-4">
                {certificates.map(c => (
                  <Card key={c.id} className="p-5 flex gap-5 items-center group bg-card border-none hover:bg-muted/30 transition-all rounded-2xl shadow-sm overflow-hidden relative">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border/50">
                      <FileType className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black truncate text-sm tracking-tight text-foreground">{c.titleId}</h4>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{c.issuer} • {c.year}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" size="icon" onClick={() => startEditCert(c)} className="text-primary hover:bg-primary/10 h-10 w-10 rounded-xl">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      {isSuper && (
                        <Button variant="ghost" size="icon" onClick={() => deleteCertificate(c.id)} className="text-destructive hover:bg-destructive/10 h-10 w-10 rounded-xl">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* JOURNEY TAB */}
          <TabsContent value="journey" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="xl:col-span-8">
              <Card className="rounded-[2.5rem] shadow-none border-none bg-transparent">
                <CardHeader className="p-0 pb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <CardTitle className="font-black font-headline text-3xl uppercase tracking-tighter text-foreground">
                      {editingJourneyId ? 'Edit Journey Node' : 'Add Journey Node'}
                    </CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground/80">Professional Timeline & Milestones</CardDescription>
                  </div>
                  {editingJourneyId && (
                    <Button variant="ghost" onClick={cancelEdit} className="rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest h-12">
                      <X className="h-4 w-4" /> Cancel Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addExperience({ ...journeyForm, id: editingJourneyId || Date.now().toString() } as any);
                    setJourneyForm(initialJourneyState);
                    setEditingJourneyId(null);
                    toast({ title: editingJourneyId ? "Update Success" : "Node Added", description: "Journey timeline synchronized." });
                  }} className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Role Title (ID)</label>
                        <Input required value={journeyForm.titleId} onChange={e => setJourneyForm({...journeyForm, titleId: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Company / Institution</label>
                        <Input required value={journeyForm.company} onChange={e => setJourneyForm({...journeyForm, company: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Timeline (e.g. 2023 - Present)</label>
                        <Input required value={journeyForm.year} onChange={e => setJourneyForm({...journeyForm, year: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Role Title (EN)</label>
                        <Input value={journeyForm.titleEn} onChange={e => setJourneyForm({...journeyForm, titleEn: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Description (ID)</label>
                        <Textarea value={journeyForm.descriptionId} onChange={e => setJourneyForm({...journeyForm, descriptionId: e.target.value})} className="h-32 rounded-3xl bg-muted/30 border-none" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Description (EN)</label>
                        <Textarea value={journeyForm.descriptionEn} onChange={e => setJourneyForm({...journeyForm, descriptionEn: e.target.value})} className="h-32 rounded-3xl bg-muted/30 border-none" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground shadow-xl">
                      {editingJourneyId ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      {editingJourneyId ? 'SAVE NODE' : 'DEPLOY NODE'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="xl:col-span-4 space-y-8">
               <h3 className="font-black text-[11px] uppercase tracking-[0.4em] px-4 flex items-center gap-4 text-primary"><History className="h-4 w-4" /> CAREER PATH ({experiences.length})</h3>
              <div className="grid gap-4">
                {experiences.map(j => (
                  <Card key={j.id} className="p-5 flex gap-5 items-center group bg-card border-none hover:bg-muted/30 transition-all rounded-2xl shadow-sm overflow-hidden relative">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Milestone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black truncate text-sm tracking-tight text-foreground">{j.titleId}</h4>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{j.company} • {j.year}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" size="icon" onClick={() => startEditJourney(j)} className="text-primary hover:bg-primary/10 h-10 w-10 rounded-xl">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      {isSuper && (
                        <Button variant="ghost" size="icon" onClick={() => deleteExperience(j.id)} className="text-destructive hover:bg-destructive/10 h-10 w-10 rounded-xl">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* SYSTEM TAB */}
          <TabsContent value="system" className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
             <Card className="rounded-[2.5rem] shadow-none border-none bg-transparent">
              <CardHeader className="p-0 pb-10">
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-black font-headline tracking-tighter uppercase text-foreground">Maintenance</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground/80">Manage Global Data Persistence</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-12">
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary px-2">Data Operations</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <Button variant="outline" onClick={backupData} className="h-40 flex-col gap-5 rounded-[2.5rem] border-primary/20 hover:bg-primary/5 transition-all bg-card shadow-sm group">
                        <div className="p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform">
                          <Download className="h-8 w-8 text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Export JSON</span>
                      </Button>
                      <Button variant="outline" onClick={() => { if(isSuper) fileInputRef.current?.click(); else toast({variant:"destructive", title:"Security Error", description:"Super Admin required."}) }} className="h-40 flex-col gap-5 rounded-[2.5rem] border-accent/20 hover:bg-accent/5 transition-all bg-card shadow-sm group">
                        <div className="p-4 bg-accent/10 rounded-2xl group-hover:scale-110 transition-transform">
                          <Upload className="h-8 w-8 text-accent" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Restore State</span>
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
