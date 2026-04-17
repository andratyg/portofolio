
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
  Mail, Instagram, Github, Linkedin, Video, Send, Wand2
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
    shortDescriptionId: '', shortDescriptionEn: '', fullDescriptionId: '', fullDescriptionEn: '',
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
  const handleAITranslate = async (formType: string, data: any, setter: Function) => {
    setIsTranslating(formType);
    try {
      const updated = { ...data };
      const fieldsToTranslate = Object.keys(data).filter(key => key.endsWith('Id'));
      
      for (const idField of fieldsToTranslate) {
        const enField = idField.replace('Id', 'En');
        if (data[idField] && updated.hasOwnProperty(enField)) {
          const res = await translateContent({ text: data[idField], targetLang: 'en' });
          updated[enField] = res.translatedText;
        }
      }
      setter(updated);
      toast({ title: "AI Translation Success", description: "English fields updated automatically." });
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to translate content." });
    } finally {
      setIsTranslating(null);
    }
  };

  const handleGenerateCertDesc = async () => {
    if (!certForm.titleId || !certForm.issuer) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please enter Title and Issuer first." });
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
      toast({ title: "AI Generation Complete", description: "New full description generated." });
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to generate description." });
    } finally {
      setIsAIThinking(null);
    }
  };

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

  if (user && !adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-xl rounded-[2.5rem] p-10 text-center space-y-8">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
          <h2 className="text-3xl font-black font-headline">Unauthorized</h2>
          <p className="text-muted-foreground">Account {user.email} is not authorized for write access.</p>
          <div className="p-6 bg-muted rounded-3xl text-left text-xs space-y-4">
            <p className="font-bold text-primary">Next Steps:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Copy UID: <code className="bg-background px-2 py-1 rounded select-all">{user.uid}</code></li>
              <li>Go to Firebase &rarr; Firestore &rarr; <code className="font-bold">admins</code> collection.</li>
              <li>Add document with ID <code className="text-primary">{user.uid}</code> and field <code className="text-primary">role: "super"</code>.</li>
            </ol>
          </div>
          <Button onClick={() => signOut(auth)} variant="outline" className="w-full h-12 rounded-2xl">Return to Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 relative">
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground py-2 px-6 flex items-center justify-center gap-2 sticky top-0 z-[60]">
          <WifiOff className="h-4 w-4" />
          <span className="text-xs font-black uppercase tracking-widest">Network Interrupted - Offline Mode</span>
        </div>
      )}

      <header className="bg-background/80 backdrop-blur-xl border-b border-border h-16 sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-xl h-9 w-9 border border-border">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
             <LayoutDashboard className="h-4 w-4 text-primary" />
             <h1 className="text-sm font-black font-headline uppercase tracking-tight">KaryaPro Dashboard</h1>
             <Badge variant="outline" className="h-5 text-[8px] font-black uppercase bg-primary/5 text-primary border-primary/20">{userRole}</Badge>
          </div>
        </div>
        <Button variant="ghost" onClick={() => signOut(auth)} className="text-destructive hover:bg-destructive/10 rounded-xl h-9 px-3 text-xs font-bold gap-2">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="profile" className="space-y-12">
          <div className="flex justify-center sticky top-20 z-40">
            <TabsList className="h-14 bg-card/80 backdrop-blur-xl border border-border shadow-2xl p-1.5 w-full max-w-5xl overflow-x-auto no-scrollbar rounded-2xl">
              <TabsTrigger value="profile" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2">
                <UserCircle className="h-4 w-4" /> <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2">
                <Laptop className="h-4 w-4" /> <span className="hidden sm:inline">Projects</span>
              </TabsTrigger>
              <TabsTrigger value="certificates" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2">
                <Award className="h-4 w-4" /> <span className="hidden sm:inline">Certificates</span>
              </TabsTrigger>
              <TabsTrigger value="feedback" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2">
                <Quote className="h-4 w-4" /> <span className="hidden sm:inline">Feedback</span>
              </TabsTrigger>
              <TabsTrigger value="journey" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2">
                <History className="h-4 w-4" /> <span className="hidden sm:inline">Journey</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2">
                <Settings className="h-4 w-4" /> <span className="hidden sm:inline">System</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-4">
             <Card className="rounded-[2.5rem] shadow-xl border-border overflow-hidden">
                <CardHeader className="p-8 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-black font-headline text-xl uppercase">Identity Management</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Configure your professional persona</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={() => handleAITranslate('profile', profileFormData, setProfileFormData)} disabled={isTranslating === 'profile'} className="rounded-xl gap-2 h-10 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
                    {isTranslating === 'profile' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                    AI Translate Profile
                  </Button>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={(e) => { e.preventDefault(); updateProfile(profileFormData); toast({ title: "Profile Updated" }); }} className="space-y-8">
                    <div className="grid md:grid-cols-3 gap-6">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Full Name</label>
                          <Input value={profileFormData.name} onChange={e => setProfileFormData({...profileFormData, name: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Role (ID)</label>
                          <Input value={profileFormData.roleId} onChange={e => setProfileFormData({...profileFormData, roleId: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Role (EN)</label>
                          <Input value={profileFormData.roleEn} onChange={e => setProfileFormData({...profileFormData, roleEn: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                       </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">About Me (ID)</label>
                          <Textarea value={profileFormData.aboutMeId} onChange={e => setProfileFormData({...profileFormData, aboutMeId: e.target.value})} className="h-32 rounded-xl bg-muted/30" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">About Me (EN)</label>
                          <Textarea value={profileFormData.aboutMeEn} onChange={e => setProfileFormData({...profileFormData, aboutMeEn: e.target.value})} className="h-32 rounded-xl bg-muted/30" />
                       </div>
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary shadow-xl shadow-primary/20">Commit Profile Changes</Button>
                  </form>
                </CardContent>
             </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="lg:col-span-7">
               <Card className="rounded-[2.5rem] shadow-xl border-border">
                <CardHeader className="p-8 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-black font-headline text-xl uppercase">New Deployment</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Register new project unit</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={() => handleAITranslate('project', projectForm, setProjectForm)} disabled={isTranslating === 'project'} className="rounded-xl gap-2 h-10 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
                    {isTranslating === 'project' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                    AI Translate
                  </Button>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addProject({ ...projectForm, id: Date.now().toString(), technologies: projectForm.technologies.split(',').map(s => s.trim()) } as any);
                    setProjectForm({ titleId: '', titleEn: '', type: 'web', shortDescriptionId: '', shortDescriptionEn: '', fullDescriptionId: '', fullDescriptionEn: '', technologies: '', imageUrl: '', demoUrl: '', featured: false });
                    toast({ title: "Project Deployed" });
                  }} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Title (ID)</label>
                        <Input required value={projectForm.titleId} onChange={e => setProjectForm({...projectForm, titleId: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Title (EN)</label>
                        <Input value={projectForm.titleEn} onChange={e => setProjectForm({...projectForm, titleEn: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Short Description (ID)</label>
                        <Input value={projectForm.shortDescriptionId} onChange={e => setProjectForm({...projectForm, shortDescriptionId: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Short Description (EN)</label>
                        <Input value={projectForm.shortDescriptionEn} onChange={e => setProjectForm({...projectForm, shortDescriptionEn: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Technologies (Comma separated)</label>
                      <Input placeholder="Next.js, Tailwind, etc" value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Image URL</label>
                      <Input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="h-11 rounded-xl bg-muted/30" placeholder="https://..." />
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary shadow-xl shadow-primary/20">Confirm Deployment</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-5 space-y-4">
               <h3 className="font-black text-[10px] uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <Laptop className="h-3 w-3 text-primary" /> Active Projects ({projects.length})
              </h3>
              <div className="grid gap-3">
                {projects.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-border rounded-[2.5rem] text-center space-y-2">
                    <p className="text-xs font-bold text-muted-foreground">No Projects Detected</p>
                    <p className="text-[10px] text-muted-foreground/60">Start by deploying your first code unit.</p>
                  </div>
                ) : projects.map(p => (
                  <Card key={p.id} className="p-3 flex gap-4 items-center group bg-card border-border hover:border-primary/50 transition-all rounded-2xl shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0">
                      <img src={p.imageUrl || "https://placehold.co/100x100"} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-sm">{p.titleId}</h4>
                      <Badge variant="secondary" className="text-[8px] font-black uppercase h-4 px-1">{p.type}</Badge>
                    </div>
                    {isSuper && (
                      <Button variant="ghost" size="icon" onClick={() => deleteProject(p.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="lg:col-span-7">
               <Card className="rounded-[2.5rem] shadow-xl border-border">
                <CardHeader className="p-8 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-black font-headline text-xl uppercase">New Credential</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Register earned certification</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={() => handleAITranslate('cert', certForm, setCertForm)} disabled={isTranslating === 'cert'} className="rounded-xl gap-2 h-10 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
                    {isTranslating === 'cert' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                    AI Translate
                  </Button>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addCertificate({ ...certForm, id: Date.now().toString() } as any);
                    setCertForm({ titleId: '', titleEn: '', issuer: '', year: '', validUntil: '', imageUrl: '', shortDescriptionId: '', shortDescriptionEn: '', fullDescriptionId: '', fullDescriptionEn: '' });
                    toast({ title: "Credential Added" });
                  }} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Title (ID)</label>
                        <Input required value={certForm.titleId} onChange={e => setCertForm({...certForm, titleId: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Title (EN)</label>
                        <Input value={certForm.titleEn} onChange={e => setCertForm({...certForm, titleEn: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Issuer</label>
                        <Input value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Year</label>
                        <Input value={certForm.year} onChange={e => setCertForm({...certForm, year: e.target.value})} className="h-11 rounded-xl bg-muted/30" placeholder="2024" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Valid Until</label>
                        <Input value={certForm.validUntil} onChange={e => setCertForm({...certForm, validUntil: e.target.value})} className="h-11 rounded-xl bg-muted/30" placeholder="2026 / Lifetime" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Full Description (ID)</label>
                        <Button type="button" variant="ghost" onClick={handleGenerateCertDesc} disabled={isAIThinking === 'cert'} className="h-6 text-[8px] font-black uppercase gap-1 text-accent hover:text-accent/80">
                          {isAIThinking === 'cert' ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Sparkles className="h-2.5 w-2.5" />}
                          AI Suggest
                        </Button>
                      </div>
                      <Textarea value={certForm.fullDescriptionId} onChange={e => setCertForm({...certForm, fullDescriptionId: e.target.value})} className="h-24 rounded-xl bg-muted/30" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Full Description (EN)</label>
                      <Textarea value={certForm.fullDescriptionEn} onChange={e => setCertForm({...certForm, fullDescriptionEn: e.target.value})} className="h-24 rounded-xl bg-muted/30" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Image URL</label>
                      <Input value={certForm.imageUrl} onChange={e => setCertForm({...certForm, imageUrl: e.target.value})} className="h-11 rounded-xl bg-muted/30" placeholder="https://..." />
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary shadow-xl shadow-primary/20">Add Certificate</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-5 space-y-4">
               <h3 className="font-black text-[10px] uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <Award className="h-3 w-3 text-primary" /> Credentials ({certificates.length})
              </h3>
              <div className="grid gap-3">
                {certificates.map(c => (
                  <Card key={c.id} className="p-3 flex gap-4 items-center group bg-card border-border hover:border-primary/50 transition-all rounded-2xl shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0">
                      <img src={c.imageUrl || "https://placehold.co/100x100"} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-sm">{c.titleId}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium">{c.issuer}</p>
                    </div>
                    {isSuper && (
                      <Button variant="ghost" size="icon" onClick={() => deleteCertificate(c.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="lg:col-span-7">
               <Card className="rounded-[2.5rem] shadow-xl border-border">
                <CardHeader className="p-8 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-black font-headline text-xl uppercase">New Testimonial</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Register client feedback</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={() => handleAITranslate('feedback', testForm, setTestForm)} disabled={isTranslating === 'feedback'} className="rounded-xl gap-2 h-10 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
                    {isTranslating === 'feedback' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                    AI Translate
                  </Button>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addTestimonial({ ...testForm, id: Date.now().toString() } as any);
                    setTestForm({ name: '', roleId: '', roleEn: '', contentId: '', contentEn: '', avatarUrl: '' });
                    toast({ title: "Feedback Recorded" });
                  }} className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Author Name</label>
                      <Input required value={testForm.name} onChange={e => setTestForm({...testForm, name: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Author Title (ID)</label>
                        <Input required value={testForm.roleId} onChange={e => setTestForm({...testForm, roleId: e.target.value})} className="h-11 rounded-xl bg-muted/30" placeholder="CEO, TechCorp" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Author Title (EN)</label>
                        <Input value={testForm.roleEn} onChange={e => setTestForm({...testForm, roleEn: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Content (ID)</label>
                        <Textarea required value={testForm.contentId} onChange={e => setTestForm({...testForm, contentId: e.target.value})} className="h-24 rounded-xl bg-muted/30" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Content (EN)</label>
                        <Textarea value={testForm.contentEn} onChange={e => setTestForm({...testForm, contentEn: e.target.value})} className="h-24 rounded-xl bg-muted/30" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Avatar URL</label>
                      <Input value={testForm.avatarUrl} onChange={e => setTestForm({...testForm, avatarUrl: e.target.value})} className="h-11 rounded-xl bg-muted/30" placeholder="https://..." />
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary shadow-xl shadow-primary/20">Add Testimonial</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-5 space-y-4">
               <h3 className="font-black text-[10px] uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <Quote className="h-3 w-3 text-primary" /> Wall of Love ({testimonials.length})
              </h3>
              <div className="grid gap-3">
                {testimonials.map(t => (
                  <Card key={t.id} className="p-3 flex gap-4 items-center group bg-card border-border hover:border-primary/50 transition-all rounded-2xl shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                      <img src={t.avatarUrl || `https://picsum.photos/seed/${t.id}/100/100`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-sm">{t.name}</h4>
                      <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">{t.roleId}</p>
                    </div>
                    {isSuper && (
                      <Button variant="ghost" size="icon" onClick={() => deleteTestimonial(t.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Journey Tab */}
          <TabsContent value="journey" className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="lg:col-span-7">
               <Card className="rounded-[2.5rem] shadow-xl border-border">
                <CardHeader className="p-8 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-black font-headline text-xl uppercase">New Entry</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Register career milestone</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={() => handleAITranslate('journey', expForm, setExpForm)} disabled={isTranslating === 'journey'} className="rounded-xl gap-2 h-10 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
                    {isTranslating === 'journey' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                    AI Translate
                  </Button>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addExperience({ ...expForm, id: Date.now().toString() } as any);
                    setExpForm({ year: '', company: '', titleId: '', titleEn: '', descriptionId: '', descriptionEn: '' });
                    toast({ title: "Milestone Recorded" });
                  }} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Duration / Year</label>
                        <Input required value={expForm.year} onChange={e => setExpForm({...expForm, year: e.target.value})} className="h-11 rounded-xl bg-muted/30" placeholder="2022 - 2024" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Company / Institution</label>
                        <Input required value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Position (ID)</label>
                        <Input required value={expForm.titleId} onChange={e => setExpForm({...expForm, titleId: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Position (EN)</label>
                        <Input value={expForm.titleEn} onChange={e => setExpForm({...expForm, titleEn: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Description (ID)</label>
                        <Textarea required value={expForm.descriptionId} onChange={e => setExpForm({...expForm, descriptionId: e.target.value})} className="h-24 rounded-xl bg-muted/30" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Description (EN)</label>
                        <Textarea value={expForm.descriptionEn} onChange={e => setExpForm({...expForm, descriptionEn: e.target.value})} className="h-24 rounded-xl bg-muted/30" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary shadow-xl shadow-primary/20">Add Journey Entry</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-5 space-y-4">
               <h3 className="font-black text-[10px] uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <History className="h-3 w-3 text-primary" /> Career Path ({experiences.length})
              </h3>
              <div className="grid gap-3">
                {experiences.map(e => (
                  <Card key={e.id} className="p-4 group bg-card border-border hover:border-primary/50 transition-all rounded-2xl shadow-sm relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className="text-[8px] font-black uppercase h-4 px-2 mb-2">{e.year}</Badge>
                        <h4 className="font-bold text-sm leading-tight">{e.titleId}</h4>
                        <p className="text-[10px] text-muted-foreground font-medium mt-1">{e.company}</p>
                      </div>
                      {isSuper && (
                        <Button variant="ghost" size="icon" onClick={() => deleteExperience(e.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
             <Card className="rounded-[2.5rem] shadow-xl border-border bg-card overflow-hidden">
              <CardHeader className="p-8 border-b border-border/50 bg-muted/20">
                <CardTitle className="flex items-center gap-3 text-xl font-black font-headline"><Settings className="text-primary h-5 w-5" /> Maintenance Center</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Global system recovery and health</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={backupData} className="h-24 flex-col gap-3 rounded-[2rem] border-primary/20 hover:bg-primary/5 transition-all">
                    <Download className="h-6 w-6 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Global Backup</span>
                  </Button>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-24 flex-col gap-3 rounded-[2rem] border-accent/20 hover:bg-accent/5 transition-all">
                    <Upload className="h-6 w-6 text-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Restore Archive</span>
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

                <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3 text-amber-500">
                    <AlertTriangle className="h-5 w-5" />
                    <h4 className="text-xs font-black uppercase tracking-widest">Authority Alert</h4>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-600/80 font-medium">
                    Critical operations (Delete/Restore) require <strong className="text-amber-700">Super Admin</strong> privileges. Your current authorization level is <span className="underline font-bold uppercase">{userRole}</span>.
                  </p>
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
