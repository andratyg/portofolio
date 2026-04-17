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
  Mail, Instagram, Github, Linkedin, Video
} from 'lucide-react';
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
    backupData, restoreData,
    isLoading: storeLoading
  } = useProjectStore();
  
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isTranslating, setIsTranslating] = useState<string | null>(null);
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
    titleId: '', titleEn: '', shortDescriptionId: '', shortDescriptionEn: '',
    fullDescriptionId: '', fullDescriptionEn: '', year: '', issuer: '', validUntil: '', imageUrl: ''
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

  if (isUserLoading || storeLoading || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Initializing Command Center</p>
        </div>
      </div>
    );
  }

  if (user && !adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-xl rounded-[2.5rem] p-10 text-center space-y-8">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
          <h2 className="text-3xl font-black font-headline">Access Denied</h2>
          <p className="text-muted-foreground">Account {user.email} is not in the system registry.</p>
          <div className="p-6 bg-muted rounded-3xl text-left text-xs space-y-4">
            <p className="font-bold text-primary">To Fix:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Copy UID: <code className="bg-background px-2 py-1 rounded select-all">{user.uid}</code></li>
              <li>Go to Firebase Console &rarr; Firestore.</li>
              <li>Add to <code className="font-bold">admins</code> collection with field <code className="text-primary">role: "super"</code>.</li>
            </ol>
          </div>
          <Button onClick={() => signOut(auth)} variant="outline" className="w-full h-12 rounded-2xl">Sign Out</Button>
        </Card>
      </div>
    );
  }

  const handleAutoTranslateProfile = async () => {
    setIsTranslating('profile');
    try {
      const idFields = ['roleId', 'aboutMeId', 'heroTitleId', 'heroSubtitleId'];
      const enFields = ['roleEn', 'aboutMeEn', 'heroTitleEn', 'heroSubtitleEn'];
      
      const updatedProfile = { ...profileFormData };
      for (let i = 0; i < idFields.length; i++) {
        const idVal = (profileFormData as any)[idFields[i]];
        if (idVal) {
          const res = await translateContent({ text: idVal, targetLang: 'en' });
          (updatedProfile as any)[enFields[i]] = res.translatedText;
        }
      }
      setProfileFormData(updatedProfile);
      toast({ title: "Translation Complete", description: "Profile English fields updated." });
    } catch (e) {
      toast({ variant: "destructive", title: "Translation Failed", description: "AI service error." });
    } finally {
      setIsTranslating(null);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileFormData);
    toast({ title: "Profile Deployed", description: "Changes synced with Cloud registry." });
  };

  const submitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.titleId) return;
    addProject({ ...projectForm, id: Date.now().toString(), technologies: projectForm.technologies.split(',').map(s => s.trim()) } as any);
    setProjectForm({ titleId: '', titleEn: '', type: 'web', shortDescriptionId: '', shortDescriptionEn: '', fullDescriptionId: '', fullDescriptionEn: '', technologies: '', imageUrl: '', demoUrl: '', featured: false });
    toast({ title: "Unit Deployed", description: "Project added to cloud storage." });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 relative">
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground py-2 px-6 flex items-center justify-center gap-2 sticky top-0 z-[60]">
          <WifiOff className="h-4 w-4" />
          <span className="text-xs font-black uppercase tracking-widest">Offline Mode</span>
        </div>
      )}

      <header className="bg-background/80 backdrop-blur-xl border-b border-border h-16 sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-xl h-9 w-9 border border-border">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
             <LayoutDashboard className="h-4 w-4 text-primary" />
             <h1 className="text-sm font-black font-headline uppercase tracking-tight">KaryaPro Admin</h1>
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
                <Award className="h-4 w-4" /> <span className="hidden sm:inline">Certs</span>
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
                    <CardTitle className="font-black font-headline text-xl">Identity Protocol</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Manage your professional persona</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={handleAutoTranslateProfile} disabled={isTranslating === 'profile'} className="rounded-xl gap-2 h-10 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
                    {isTranslating === 'profile' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                    AI Translate All
                  </Button>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleUpdateProfile} className="space-y-12">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Display Name</label>
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

                    {/* Hero Section */}
                    <div className="space-y-6">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                          <Sparkles className="h-3 w-3" /> Hero Display
                       </h3>
                       <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Hero Title (ID)</label>
                            <Input value={profileFormData.heroTitleId} onChange={e => setProfileFormData({...profileFormData, heroTitleId: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Hero Title (EN)</label>
                            <Input value={profileFormData.heroTitleEn} onChange={e => setProfileFormData({...profileFormData, heroTitleEn: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                          </div>
                       </div>
                       <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Hero Subtitle (ID)</label>
                            <Textarea value={profileFormData.heroSubtitleId} onChange={e => setProfileFormData({...profileFormData, heroSubtitleId: e.target.value})} className="rounded-xl bg-muted/30 h-24" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Hero Subtitle (EN)</label>
                            <Textarea value={profileFormData.heroSubtitleEn} onChange={e => setProfileFormData({...profileFormData, heroSubtitleEn: e.target.value})} className="rounded-xl bg-muted/30 h-24" />
                          </div>
                       </div>
                    </div>

                    {/* Social Media & Contact */}
                    <div className="space-y-6">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                          <Settings className="h-3 w-3" /> Connectivity
                       </h3>
                       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2"><Mail className="h-3 w-3" /> Public Email</label>
                            <Input value={profileFormData.email} onChange={e => setProfileFormData({...profileFormData, email: e.target.value})} className="h-11 rounded-xl bg-muted/30" placeholder="admin@karyapro.app" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2"><Briefcase className="h-3 w-3" /> WhatsApp</label>
                            <Input value={profileFormData.whatsapp} onChange={e => setProfileFormData({...profileFormData, whatsapp: e.target.value})} className="h-11 rounded-xl bg-muted/30" placeholder="62812..." />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2"><Linkedin className="h-3 w-3" /> LinkedIn URL</label>
                            <Input value={profileFormData.linkedin} onChange={e => setProfileFormData({...profileFormData, linkedin: e.target.value})} className="h-11 rounded-xl bg-muted/30" placeholder="https://linkedin.com/in/..." />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2"><Instagram className="h-3 w-3" /> Instagram URL</label>
                            <Input value={profileFormData.instagram} onChange={e => setProfileFormData({...profileFormData, instagram: e.target.value})} className="h-11 rounded-xl bg-muted/30" placeholder="https://instagram.com/..." />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2"><Video className="h-3 w-3" /> TikTok URL</label>
                            <Input value={profileFormData.tiktok} onChange={e => setProfileFormData({...profileFormData, tiktok: e.target.value})} className="h-11 rounded-xl bg-muted/30" placeholder="https://tiktok.com/@..." />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2"><Github className="h-3 w-3" /> GitHub URL</label>
                            <Input value={profileFormData.github} onChange={e => setProfileFormData({...profileFormData, github: e.target.value})} className="h-11 rounded-xl bg-muted/30" placeholder="https://github.com/..." />
                          </div>
                       </div>
                    </div>

                    <Button type="submit" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary shadow-xl shadow-primary/20">Confirm Profile Update</Button>
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
                    <CardTitle className="font-black font-headline text-xl">New Deployment</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Register new code unit</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={submitProject} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Name (ID)</label>
                        <Input required value={projectForm.titleId} onChange={e => setProjectForm({...projectForm, titleId: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Name (EN)</label>
                        <Input value={projectForm.titleEn} onChange={e => setProjectForm({...projectForm, titleEn: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Technologies</label>
                      <Input placeholder="Next.js, Tailwind, etc" value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} className="h-11 rounded-xl bg-muted/30" />
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[0.98] transition-all">Confirm Deployment</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-5 space-y-4">
               <h3 className="font-black text-[10px] uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <Laptop className="h-3 w-3 text-primary" /> Active Units ({projects.length})
              </h3>
              <div className="grid gap-3">
                {projects.map(p => (
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

          {/* System Tab */}
          <TabsContent value="system" className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
             <Card className="rounded-[2.5rem] shadow-xl border-border bg-card overflow-hidden">
              <CardHeader className="p-8 border-b border-border/50 bg-muted/20">
                <CardTitle className="flex items-center gap-3 text-xl font-black font-headline"><Settings className="text-primary h-5 w-5" /> Infrastructure Health</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Database recovery and maintenance</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={backupData} className="h-24 flex-col gap-3 rounded-[2rem] border-primary/20 hover:bg-primary/5 transition-all">
                    <Download className="h-6 w-6 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Backup Database</span>
                  </Button>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-24 flex-col gap-3 rounded-[2rem] border-accent/20 hover:bg-accent/5 transition-all">
                    <Upload className="h-6 w-6 text-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Restore System</span>
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
                    <h4 className="text-xs font-black uppercase tracking-widest">Security Warning</h4>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-600/80 font-medium">
                    Only <strong className="text-amber-700">Super Admins</strong> can delete records or perform system restores. Current Role: <span className="underline">{userRole}</span>.
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
