
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Trash2, LogOut, ArrowLeft, Laptop, Award, Settings, 
  UserCircle, Loader2, Camera, Briefcase, History, ShieldAlert, 
  Download, Upload, WifiOff, Edit3, X, Mail, User, CheckCircle2, AlertCircle, 
  Terminal, Image as ImageIcon, Globe, Share2, BarChart3, Zap
} from 'lucide-react';
import { translateContent } from '@/ai/flows/translate-content';
import { useToast } from '@/hooks/use-toast';
import { ProfileData, Project, Certificate, Experience, PortfolioStats } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';

function AdminContent() {
  const { 
    projects, addProject, deleteProject, 
    certificates, addCertificate, deleteCertificate,
    experiences, addExperience, deleteExperience,
    messages, deleteMessage,
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
  
  const initialProjectState = {
    titleId: '', titleEn: '', type: 'web' as 'web' | 'ui' | 'backend',
    shortDescriptionId: '', shortDescriptionEn: '', 
    fullDescriptionId: '', fullDescriptionEn: '',
    problemId: '', problemEn: '', solutionId: '', solutionEn: '',
    impactStats: '', technologies: '', imageUrl: '', demoUrl: '', featured: false
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

  useEffect(() => { if (profile) setProfileFormData(profile); }, [profile]);
  useEffect(() => { if (stats) setStatsFormData(stats); }, [stats]);

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
      toast({ title: "Sinkronisasi AI Berhasil" });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Sinkronisasi AI" });
    } finally {
      setIsTranslating(null);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileFormData);
    updateStats(statsFormData);
    toast({ title: "Profil Berhasil Diperbarui" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Berkas Terlalu Besar (Maks 10MB)" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => setter(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const startEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setProjectForm({ 
      ...p, 
      technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : (p.technologies || '') 
    } as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditCert = (c: Certificate) => {
    setEditingCertId(c.id);
    setCertForm({ ...c });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditJourney = (e: Experience) => {
    setEditingJourneyId(e.id);
    setJourneyForm({ ...e });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProjectId(null); setEditingCertId(null); setEditingJourneyId(null);
    setProjectForm(initialProjectState); setCertForm(initialCertState); setJourneyForm(initialJourneyState);
  };

  if (isUserLoading || storeLoading || isAdminLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (user && !adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-lg rounded-[2.5rem] p-10 text-center space-y-8 shadow-2xl border-destructive/20">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
          <h2 className="text-3xl font-black font-headline uppercase">Akses Dibatasi</h2>
          <p className="text-muted-foreground text-sm">Email Anda belum terdaftar sebagai administrator sistem resmi.</p>
          <Button onClick={() => signOut(auth)} variant="destructive" className="w-full h-14 rounded-2xl font-black uppercase">Keluar Sesi</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 relative selection:bg-primary/30">
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground py-2 px-6 flex items-center justify-center gap-2 sticky top-0 z-[60]">
          <WifiOff className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">Mode Offline Aktif</span>
        </div>
      )}

      <header className={cn(
        "bg-background/80 backdrop-blur-2xl border-b h-20 sticky top-0 z-50 flex items-center justify-between px-8 transition-transform duration-500",
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-xl h-10 w-10"><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-xs font-black font-headline uppercase tracking-widest flex items-center gap-2">
              PUSAT KOMANDO KARYAPRO <Badge className="h-5 text-[8px] bg-primary text-primary-foreground font-black px-2">{userRole === 'super' ? 'SUPER ADMIN' : 'EDITOR'}</Badge>
            </h1>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => signOut(auth)} className="text-foreground hover:bg-muted rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest gap-2">
          <LogOut className="h-4 w-4" /> KELUAR
        </Button>
      </header>

      <div className="container mx-auto px-6 py-12">
        <Tabs defaultValue="profile" className="space-y-12">
          <div className={cn("flex justify-center sticky z-40 transition-all duration-500", isHeaderVisible ? "top-24" : "top-4")}>
            <TabsList className="h-20 bg-card border border-border shadow-2xl p-2 rounded-[2.5rem] w-full max-w-5xl overflow-x-auto no-scrollbar flex justify-between gap-1">
              <TabsTrigger value="profile" className="rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest gap-2 px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"><UserCircle className="h-4 w-4" /> PROFIL</TabsTrigger>
              <TabsTrigger value="projects" className="rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest gap-2 px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"><Laptop className="h-4 w-4" /> PROYEK</TabsTrigger>
              <TabsTrigger value="certificates" className="rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest gap-2 px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"><Award className="h-4 w-4" /> SERTIFIKAT</TabsTrigger>
              <TabsTrigger value="journey" className="rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest gap-2 px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"><History className="h-4 w-4" /> PENGALAMAN</TabsTrigger>
              <TabsTrigger value="messages" className="rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest gap-2 px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all relative">
                <Mail className="h-4 w-4" /> PESAN
                {messages.length > 0 && <span className="absolute top-4 right-4 w-2 h-2 bg-accent rounded-full animate-pulse" />}
              </TabsTrigger>
              <TabsTrigger value="system" className="rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest gap-2 px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"><Settings className="h-4 w-4" /> SISTEM</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-8 duration-500">
             <form onSubmit={handleProfileSubmit} className="space-y-20">
                <div className="grid lg:grid-cols-12 gap-10">
                   <div className="lg:col-span-4 space-y-6">
                      <div className="relative group aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-muted border-4 border-background shadow-2xl">
                         {profileFormData.profilePictureUrl ? (
                            <img src={profileFormData.profilePictureUrl} className="w-full h-full object-cover" alt="Pratinjau Profil" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><UserCircle className="h-32 w-32" /></div>
                         )}
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button type="button" variant="outline" className="bg-white/20 backdrop-blur-xl text-white rounded-2xl h-14" onClick={() => profileImageInputRef.current?.click()}><Camera className="h-5 w-5 mr-2" /> GANTI FOTO</Button>
                         </div>
                         <input type="file" ref={profileImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setProfileFormData({...profileFormData, profilePictureUrl: url}))} />
                      </div>

                      <Card className="rounded-[2.5rem] border-none bg-muted/30 p-8 space-y-6">
                         <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <h3 className="font-black text-xs uppercase tracking-widest">Statistik Portofolio</h3>
                         </div>
                         <div className="grid gap-4">
                            <div className="space-y-1">
                               <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Proyek Selesai</label>
                               <Input value={statsFormData.completedProjects} onChange={e => setStatsFormData({...statsFormData, completedProjects: e.target.value})} className="rounded-xl border-none bg-background/50 h-12" />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tahun Pengalaman</label>
                               <Input value={statsFormData.yearsExperience} onChange={e => setStatsFormData({...statsFormData, yearsExperience: e.target.value})} className="rounded-xl border-none bg-background/50 h-12" />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Teknologi Dikuasai</label>
                               <Input value={statsFormData.techMastered} onChange={e => setStatsFormData({...statsFormData, techMastered: e.target.value})} className="rounded-xl border-none bg-background/50 h-12" />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Kepuasan Klien (%)</label>
                               <Input value={statsFormData.clientSatisfaction} onChange={e => setStatsFormData({...statsFormData, clientSatisfaction: e.target.value})} className="rounded-xl border-none bg-background/50 h-12" />
                            </div>
                         </div>
                      </Card>
                   </div>

                   <div className="lg:col-span-8 space-y-10">
                      <div className="space-y-6">
                        <h3 className="text-xl font-black font-headline uppercase tracking-tight flex items-center gap-3">
                           <UserCircle className="h-6 w-6 text-primary" /> Identitas Dasar
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Nama Lengkap</label><Input value={profileFormData.name} onChange={e => setProfileFormData({...profileFormData, name: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Email Kontak</label><Input value={profileFormData.email} onChange={e => setProfileFormData({...profileFormData, email: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Jabatan Inti (ID)</label><Input value={profileFormData.roleId} onChange={e => setProfileFormData({...profileFormData, roleId: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Jabatan Inti (EN)</label><Input value={profileFormData.roleEn} onChange={e => setProfileFormData({...profileFormData, roleEn: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-xl font-black font-headline uppercase tracking-tight flex items-center gap-3">
                           <Zap className="h-6 w-6 text-primary" /> Konten Hero (Halaman Utama)
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Judul Utama Hero (ID)</label><Input value={profileFormData.heroTitleId} onChange={e => setProfileFormData({...profileFormData, heroTitleId: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Judul Utama Hero (EN)</label><Input value={profileFormData.heroTitleEn} onChange={e => setProfileFormData({...profileFormData, heroTitleEn: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Sub-judul Hero (ID)</label><Textarea value={profileFormData.heroSubtitleId} onChange={e => setProfileFormData({...profileFormData, heroSubtitleId: e.target.value})} className="h-24 rounded-2xl bg-muted/30 border-none p-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Sub-judul Hero (EN)</label><Textarea value={profileFormData.heroSubtitleEn} onChange={e => setProfileFormData({...profileFormData, heroSubtitleEn: e.target.value})} className="h-24 rounded-2xl bg-muted/30 border-none p-6" /></div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-xl font-black font-headline uppercase tracking-tight flex items-center gap-3">
                           <ImageIcon className="h-6 w-6 text-primary" /> Narasi Tentang Saya
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Tentang Saya (ID)</label><Textarea value={profileFormData.aboutMeId} onChange={e => setProfileFormData({...profileFormData, aboutMeId: e.target.value})} className="h-32 rounded-2xl bg-muted/30 border-none p-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Tentang Saya (EN)</label><Textarea value={profileFormData.aboutMeEn} onChange={e => setProfileFormData({...profileFormData, aboutMeEn: e.target.value})} className="h-32 rounded-2xl bg-muted/30 border-none p-6" /></div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-xl font-black font-headline uppercase tracking-tight flex items-center gap-3">
                           <Share2 className="h-6 w-6 text-primary" /> Jalur Komunikasi & Sosial
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">WhatsApp (62xxx)</label><Input value={profileFormData.whatsapp} onChange={e => setProfileFormData({...profileFormData, whatsapp: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none px-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">LinkedIn URL</label><Input value={profileFormData.linkedin} onChange={e => setProfileFormData({...profileFormData, linkedin: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none px-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">GitHub URL</label><Input value={profileFormData.github} onChange={e => setProfileFormData({...profileFormData, github: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none px-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Instagram URL</label><Input value={profileFormData.instagram} onChange={e => setProfileFormData({...profileFormData, instagram: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none px-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">TikTok URL</label><Input value={profileFormData.tiktok} onChange={e => setProfileFormData({...profileFormData, tiktok: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none px-6" /></div>
                        </div>
                      </div>
                   </div>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase bg-primary text-primary-foreground shadow-2xl hover:scale-[1.01] transition-all">SIMPAN PERUBAHAN INFRASTRUKTUR PROFIL</Button>
             </form>
          </TabsContent>

          <TabsContent value="projects" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="xl:col-span-8">
               <Card className="rounded-[2.5rem] shadow-none border-none bg-transparent">
                <CardHeader className="p-0 pb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <CardTitle className="font-black font-headline text-3xl uppercase tracking-tighter">{editingProjectId ? 'Ubah Unit Proyek' : 'Deploy Unit Baru'}</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.3em]">Arsip Arsitektur Sistem & Kode</CardDescription>
                  </div>
                  <Button type="button" size="sm" onClick={() => handleAITranslate('projects', projectForm, setProjectForm)} className="rounded-xl bg-primary/10 text-primary h-12 px-6 font-black uppercase" disabled={isTranslating === 'projects'}>
                    {isTranslating === 'projects' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} TERJEMAHKAN OTOMATIS (AI)
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addProject({ ...projectForm, id: editingProjectId || Date.now().toString(), technologies: typeof projectForm.technologies === 'string' ? projectForm.technologies.split(',').map(s => s.trim()) : projectForm.technologies } as any);
                    setProjectForm(initialProjectState); setEditingProjectId(null);
                    toast({ title: "Proyek Berhasil Disimpan" });
                  }} className="space-y-12">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Judul Proyek (ID)</label><Input required value={projectForm.titleId} onChange={e => setProjectForm({...projectForm, titleId: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Judul Proyek (EN)</label><Input value={projectForm.titleEn} onChange={e => setProjectForm({...projectForm, titleEn: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bidang Sistem</label><Select value={projectForm.type} onValueChange={(val: any) => setProjectForm({...projectForm, type: val})}><SelectTrigger className="h-16 rounded-2xl bg-muted/30 border-none px-6"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="web">Aplikasi Web</SelectItem><SelectItem value="ui">Arsitektur UI/UX</SelectItem><SelectItem value="backend">Layanan Backend</SelectItem></SelectContent></Select></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statistik Performa</label><Input placeholder="Cth: +25% Speed" value={projectForm.impactStats} onChange={e => setProjectForm({...projectForm, impactStats: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Teknologi (Gunakan Koma)</label><Input placeholder="Next.js, Tailwind, Firebase" value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><AlertCircle className="h-3 w-3" /> Tantangan Teknis (ID)</label><Textarea value={projectForm.problemId} onChange={e => setProjectForm({...projectForm, problemId: e.target.value})} className="h-40 rounded-[2rem] bg-muted/30 border-none p-6" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Solusi Strategis (ID)</label><Textarea value={projectForm.solutionId} onChange={e => setProjectForm({...projectForm, solutionId: e.target.value})} className="h-40 rounded-[2rem] bg-muted/30 border-none p-6" /></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL Demo Protokol</label><Input value={projectForm.demoUrl} onChange={e => setProjectForm({...projectForm, demoUrl: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                       <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tangkapan Layar (Image)</label><Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setProjectForm({...projectForm, imageUrl: url}))} className="h-16 rounded-2xl bg-muted/30 border-none pt-5 px-6" /></div>
                    </div>
                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1 h-14 rounded-2xl font-black uppercase bg-primary text-primary-foreground shadow-xl">SIMPAN PROYEK</Button>
                      {editingProjectId && <Button type="button" variant="outline" onClick={cancelEdit} className="h-14 rounded-2xl font-black uppercase"><X className="h-4 w-4 mr-2" /> BATALKAN</Button>}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="xl:col-span-4 space-y-8">
               <h3 className="font-black text-[11px] uppercase tracking-[0.4em] px-4 text-primary">REPOSITORI AKTIF ({projects.length})</h3>
               <div className="grid gap-4">
                  {projects.map(p => (
                    <Card key={p.id} className="p-5 flex gap-5 items-center group bg-card border-none hover:bg-muted/30 transition-all rounded-2xl shadow-sm overflow-hidden">
                      <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.titleId} />
                        ) : (
                          <Laptop className="h-6 w-6 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0"><h4 className="font-black truncate text-sm">{p.titleId}</h4><p className="text-[9px] font-bold text-muted-foreground uppercase">{p.type}</p></div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" onClick={() => startEditProject(p)} className="text-primary h-10 w-10 rounded-xl"><Edit3 className="h-4 w-4" /></Button>
                        {isSuper && <Button variant="ghost" size="icon" onClick={() => deleteProject(p.id)} className="text-destructive h-10 w-10 rounded-xl"><Trash2 className="h-4 w-4" /></Button>}
                      </div>
                    </Card>
                  ))}
               </div>
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="xl:col-span-8">
               <Card className="rounded-[2.5rem] shadow-none border-none bg-transparent">
                <CardHeader className="p-0 pb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <CardTitle className="font-black font-headline text-3xl uppercase tracking-tighter">{editingCertId ? 'Ubah Kredensial' : 'Catat Kredensial Baru'}</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.3em]">Log Verifikasi Validitas Institusional</CardDescription>
                  </div>
                  <Button type="button" size="sm" onClick={() => handleAITranslate('certificates', certForm, setCertForm)} className="rounded-xl bg-primary/10 text-primary h-12 px-6 font-black uppercase">SINKRONISASI AI</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addCertificate({ ...certForm, id: editingCertId || Date.now().toString() } as any);
                    setCertForm(initialCertState); setEditingCertId(null);
                    toast({ title: "Kredensial Berhasil Dicatat" });
                  }} className="space-y-12">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nama Sertifikat (ID)</label><Input required value={certForm.titleId} onChange={e => setCertForm({...certForm, titleId: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nama Sertifikat (EN)</label><Input value={certForm.titleEn} onChange={e => setCertForm({...certForm, titleEn: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Otoritas Penerbit</label><Input value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tahun Terbit</label><Input value={certForm.year} onChange={e => setCertForm({...certForm, year: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Link Verifikasi (URL)</label><Input value={certForm.credentialUrl} onChange={e => setCertForm({...certForm, credentialUrl: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                    </div>
                    <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Narasi Validasi (ID)</label><Textarea value={certForm.fullDescriptionId} onChange={e => setCertForm({...certForm, fullDescriptionId: e.target.value})} className="h-40 rounded-[2rem] bg-muted/30 border-none p-6" /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Berkas Visual (Scan/PDF)</label><Input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, (url) => setCertForm({...certForm, imageUrl: url}))} className="h-16 rounded-2xl bg-muted/30 border-none pt-5 px-6" /></div>
                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1 h-14 rounded-2xl font-black uppercase bg-primary text-primary-foreground shadow-xl">CATAT KREDENSIAL</Button>
                      {editingCertId && <Button type="button" variant="outline" onClick={cancelEdit} className="h-14 rounded-2xl font-black uppercase"><X className="h-4 w-4 mr-2" /> BATAL</Button>}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="xl:col-span-4 space-y-8">
               <h3 className="font-black text-[11px] uppercase tracking-[0.4em] px-4 text-primary">PUSAT KREDENSIAL ({certificates.length})</h3>
               <div className="grid gap-4">
                  {certificates.map(c => (
                    <Card key={c.id} className="p-5 flex gap-5 items-center group bg-card border-none hover:bg-muted/30 transition-all rounded-2xl shadow-sm overflow-hidden">
                      <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                        {c.imageUrl && !c.imageUrl.includes('application/pdf') ? (
                          <img src={c.imageUrl} className="w-full h-full object-cover" alt={c.titleId} />
                        ) : (
                          <Award className="h-6 w-6 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0"><h4 className="font-black truncate text-sm">{c.titleId}</h4><p className="text-[9px] font-bold text-muted-foreground uppercase">{c.issuer}</p></div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" onClick={() => startEditCert(c)} className="text-primary h-10 w-10 rounded-xl"><Edit3 className="h-4 w-4" /></Button>
                        {isSuper && <Button variant="ghost" size="icon" onClick={() => deleteCertificate(c.id)} className="text-destructive h-10 w-10 rounded-xl"><Trash2 className="h-4 w-4" /></Button>}
                      </div>
                    </Card>
                  ))}
               </div>
            </div>
          </TabsContent>

          <TabsContent value="journey" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="xl:col-span-8">
               <Card className="rounded-[2.5rem] shadow-none border-none bg-transparent">
                <CardHeader className="p-0 pb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <CardTitle className="font-black font-headline text-3xl uppercase tracking-tighter">{editingJourneyId ? 'Ubah Milestone' : 'Catat Milestone Baru'}</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.3em]">Entri Garis Waktu Riwayat Profesional</CardDescription>
                  </div>
                  <Button type="button" size="sm" onClick={() => handleAITranslate('journey', journeyForm, setJourneyForm)} className="rounded-xl bg-primary/10 text-primary h-12 px-6 font-black uppercase">SINKRONISASI AI</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addExperience({ ...journeyForm, id: editingJourneyId || Date.now().toString() } as any);
                    setJourneyForm(initialJourneyState); setEditingJourneyId(null);
                    toast({ title: "Milestone Berhasil Dicatat" });
                  }} className="space-y-12">
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tahun / Periode</label><Input required placeholder="Cth: 2023 - Sekarang" value={journeyForm.year} onChange={e => setJourneyForm({...journeyForm, year: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lembaga / Perusahaan</label><Input required value={journeyForm.company} onChange={e => setJourneyForm({...journeyForm, company: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Posisi / Jabatan (ID)</label><Input required value={journeyForm.titleId} onChange={e => setJourneyForm({...journeyForm, titleId: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Posisi / Jabatan (EN)</label><Input value={journeyForm.titleEn} onChange={e => setJourneyForm({...journeyForm, titleEn: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                    </div>
                    <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ringkasan Tanggung Jawab (ID)</label><Textarea value={journeyForm.descriptionId} onChange={e => setJourneyForm({...journeyForm, descriptionId: e.target.value})} className="h-32 rounded-[2rem] bg-muted/30 border-none p-6" /></div>
                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1 h-14 rounded-2xl font-black uppercase bg-primary text-primary-foreground shadow-xl">CATAT MILESTONE</Button>
                      {editingJourneyId && <Button type="button" variant="outline" onClick={cancelEdit} className="h-14 rounded-2xl font-black uppercase"><X className="h-4 w-4 mr-2" /> BATAL</Button>}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="xl:col-span-4 space-y-8">
               <h3 className="font-black text-[11px] uppercase tracking-[0.4em] px-4 text-primary">KRONOLOGI ({experiences.length})</h3>
               <div className="grid gap-4">
                  {experiences.sort((a,b) => b.year.localeCompare(a.year)).map(exp => (
                    <Card key={exp.id} className="p-5 flex gap-5 items-center group bg-card border-none hover:bg-muted/30 transition-all rounded-2xl shadow-sm overflow-hidden">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><History className="h-6 w-6" /></div>
                      <div className="flex-1 min-w-0"><h4 className="font-black truncate text-sm">{exp.titleId}</h4><p className="text-[9px] font-bold text-muted-foreground uppercase">{exp.year} @ {exp.company}</p></div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" onClick={() => startEditJourney(exp)} className="text-primary h-10 w-10 rounded-xl"><Edit3 className="h-4 w-4" /></Button>
                        {isSuper && <Button variant="ghost" size="icon" onClick={() => deleteExperience(exp.id)} className="text-destructive h-10 w-10 rounded-xl"><Trash2 className="h-4 w-4" /></Button>}
                      </div>
                    </Card>
                  ))}
               </div>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div className="flex items-center justify-between px-6">
                <div>
                  <h3 className="text-3xl font-black font-headline tracking-tighter uppercase">Kotak Masuk</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Riwayat Transmisi Pesan Pengunjung</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 h-8 px-4 font-black rounded-xl">{messages.length} Rekaman</Badge>
             </div>
             
             {messages.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-30">
                  <Mail className="h-16 w-16" />
                  <p className="text-xs font-black uppercase tracking-widest">Belum ada pesan yang diterima</p>
               </div>
             ) : (
               <div className="grid gap-6">
                 {messages.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(msg => (
                    <Card key={msg.id} className="rounded-[2rem] border-none bg-card/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all group overflow-hidden">
                       <CardContent className="p-8">
                          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                             <div className="flex gap-4 items-center">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                   <User className="h-7 w-7" />
                                </div>
                                <div>
                                   <h4 className="font-black text-lg">{msg.name}</h4>
                                   <p className="text-xs font-bold text-primary tracking-widest uppercase">{msg.email}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-3 py-1.5 rounded-lg">
                                   {new Date(msg.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                                {isSuper && (
                                   <Button variant="ghost" size="icon" onClick={() => deleteMessage(msg.id)} className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10">
                                      <Trash2 className="h-5 w-5" />
                                   </Button>
                                )}
                             </div>
                          </div>
                          <div className="mt-8 p-6 rounded-2xl bg-muted/30 border border-border/50">
                             <p className="text-sm leading-relaxed text-foreground font-medium whitespace-pre-wrap">{msg.message}</p>
                          </div>
                       </CardContent>
                    </Card>
                 ))}
               </div>
             )}
          </TabsContent>

          <TabsContent value="system" className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
             <Card className="rounded-[2.5rem] shadow-none border-none bg-transparent">
                <CardHeader className="p-0 pb-10"><CardTitle className="text-3xl font-black font-headline tracking-tighter uppercase">Pemeliharaan Infrastruktur</CardTitle></CardHeader>
                <CardContent className="p-0 flex gap-6">
                  <Button variant="outline" onClick={backupData} className="flex-1 h-40 flex-col gap-5 rounded-[2.5rem] bg-card border-none hover:bg-muted/30">
                    <Download className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <span className="text-[10px] font-black uppercase block">Ekspor Data (JSON)</span>
                      <p className="text-[8px] text-muted-foreground mt-1">Unduh semua data portofolio</p>
                    </div>
                  </Button>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1 h-40 flex-col gap-5 rounded-[2.5rem] bg-card border-none hover:bg-muted/30">
                    <Upload className="h-8 w-8 text-accent" />
                    <div className="text-center">
                      <span className="text-[10px] font-black uppercase block">Pulihkan Data</span>
                      <p className="text-[8px] text-muted-foreground mt-1">Impor data dari berkas cadangan</p>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = (ev) => restoreData(ev.target?.result as string); r.readAsText(f); } }} />
                  </Button>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return <ProjectStoreProvider><AdminContent /></ProjectStoreProvider>;
}
