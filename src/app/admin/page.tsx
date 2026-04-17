"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore, ProjectStoreProvider } from '@/components/ProjectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Trash2, Sparkles, LogOut, ArrowLeft, Laptop, Award, Settings, 
  UserCircle, Languages, Loader2, Image as ImageIcon, Quote, 
  Briefcase, LayoutDashboard, Github, Instagram, Linkedin, 
  MessageSquare, Video, History 
} from 'lucide-react';
import { generatePortfolioDescriptionSuggestion } from '@/ai/flows/generate-portfolio-description-suggestion';
import { generateCertificateDescription } from '@/ai/flows/generate-certificate-description';
import { translateContent } from '@/ai/flows/translate-content';
import { useToast } from '@/hooks/use-toast';
import { ProfileData } from '@/lib/types';
import { cn } from '@/lib/utils';

function AdminContent() {
  const { 
    projects, addProject, deleteProject, 
    certificates, addCertificate, deleteCertificate,
    testimonials, addTestimonial, deleteTestimonial,
    experiences, addExperience, deleteExperience,
    stats, updateStats,
    profile, updateProfile
  } = useProjectStore();
  
  const router = useRouter();
  const { toast } = useToast();
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTabsVisible, setIsTabsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
    const auth = sessionStorage.getItem('karyapro-auth');
    if (!auth) router.push('/admin/login');
  }, [router]);

  useEffect(() => {
    if (stats) setStatsData(stats);
    if (profile) setProfileData(profile);
  }, [stats, profile]);

  const handleLogout = () => {
    sessionStorage.removeItem('karyapro-auth');
    router.push('/');
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

  const handleTranslateCertificate = async () => {
    if (!certForm.titleId && !certForm.fullDescriptionId) {
      toast({ title: "Isi konten Indonesia terlebih dahulu", variant: "destructive" });
      return;
    }
    setIsTranslating(true);
    try {
      if (certForm.titleId) await translateSingleField(certForm.titleId, (v) => setCertForm(p => ({...p, titleEn: v})));
      if (certForm.fullDescriptionId) await translateSingleField(certForm.fullDescriptionId, (v) => setCertForm(p => ({...p, fullDescriptionEn: v})));
      toast({ title: "Sertifikat berhasil diterjemahkan" });
    } catch (e) {
      toast({ title: "Gagal menerjemahkan", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateTestimonial = async () => {
    if (!testForm.roleId && !testForm.contentId) {
      toast({ title: "Isi konten Indonesia terlebih dahulu", variant: "destructive" });
      return;
    }
    setIsTranslating(true);
    try {
      if (testForm.roleId) await translateSingleField(testForm.roleId, (v) => setTestForm(p => ({...p, roleEn: v})));
      if (testForm.contentId) await translateSingleField(testForm.contentId, (v) => setTestForm(p => ({...p, contentEn: v})));
      toast({ title: "Testimoni berhasil diterjemahkan" });
    } catch (e) {
      toast({ title: "Gagal menerjemahkan", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateJourney = async () => {
    if (!expForm.titleId && !expForm.descriptionId) {
      toast({ title: "Isi konten Indonesia terlebih dahulu", variant: "destructive" });
      return;
    }
    setIsTranslating(true);
    try {
      if (expForm.titleId) await translateSingleField(expForm.titleId, (v) => setExpForm(p => ({...p, titleEn: v})));
      if (expForm.descriptionId) await translateSingleField(expForm.descriptionId, (v) => setExpForm(p => ({...p, descriptionEn: v})));
      toast({ title: "Perjalanan berhasil diterjemahkan" });
    } catch (e) {
      toast({ title: "Gagal menerjemahkan", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateProfile = async () => {
    setIsTranslating(true);
    try {
      if (profileData.roleId) await translateSingleField(profileData.roleId, (v) => setProfileData(p => ({...p, roleEn: v})));
      if (profileData.aboutTextId) await translateSingleField(profileData.aboutTextId, (v) => setProfileData(p => ({...p, aboutTextEn: v})));
      if (profileData.heroTitleId) await translateSingleField(profileData.heroTitleId, (v) => setProfileData(p => ({...p, heroTitleEn: v})));
      if (profileData.heroSubtitleId) await translateSingleField(profileData.heroSubtitleId, (v) => setProfileData(p => ({...p, heroSubtitleEn: v})));
      toast({ title: "Profil berhasil diterjemahkan" });
    } catch (e) {
      toast({ title: "Gagal menerjemahkan", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleGenerateAIProject = async () => {
    if (!projectForm.titleId) {
      toast({ title: "Judul (ID) Diperlukan", variant: "destructive" });
      return;
    }
    setIsAIThinking(true);
    try {
      const result = await generatePortfolioDescriptionSuggestion({
        title: projectForm.titleId,
        projectType: projectForm.type,
        technologiesUsed: projectForm.technologies.split(',').map(s => s.trim()),
      });
      setProjectForm(prev => ({ ...prev, fullDescriptionId: result.descriptionSuggestion }));
      toast({ title: "Deskripsi AI berhasil dibuat" });
    } catch (e) {
      toast({ title: "Gagal membuat saran AI", variant: "destructive" });
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleGenerateAICert = async () => {
    if (!certForm.titleId || !certForm.issuer) {
      toast({ title: "Judul & Penerbit Diperlukan", variant: "destructive" });
      return;
    }
    setIsAIThinking(true);
    try {
      const result = await generateCertificateDescription({
        title: certForm.titleId,
        issuer: certForm.issuer,
      });
      setCertForm(prev => ({ ...prev, fullDescriptionId: result.descriptionSuggestion }));
      toast({ title: "Deskripsi AI berhasil dibuat" });
    } catch (e) {
      toast({ title: "Gagal membuat saran AI", variant: "destructive" });
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
    toast({ title: "Riwayat Karir Ditambahkan" });
    setExpForm({ year: '', company: '', titleId: '', titleEn: '', descriptionId: '', descriptionEn: '' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
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
              <h1 className="text-sm font-black font-headline tracking-tight uppercase leading-none">Admin</h1>
              <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-1">Infrastructure</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={handleLogout} className="text-destructive hover:bg-destructive/10 rounded-xl gap-2 px-3 h-9 text-xs font-bold">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Tabs defaultValue="projects" className="space-y-8">
          <div className={cn(
            "flex justify-center sticky top-20 z-40 transition-all duration-500",
            isTabsVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"
          )}>
            <TabsList className="inline-flex h-11 items-center justify-center rounded-2xl bg-muted/80 backdrop-blur-xl border border-border shadow-xl p-1 w-full max-w-2xl overflow-x-auto no-scrollbar">
              <TabsTrigger value="projects" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-4 h-full">Projects</TabsTrigger>
              <TabsTrigger value="certificates" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-4 h-full">Certs</TabsTrigger>
              <TabsTrigger value="testimonials" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-4 h-full">Feedback</TabsTrigger>
              <TabsTrigger value="journey" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-4 h-full">Journey</TabsTrigger>
              <TabsTrigger value="stats" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-4 h-full">Stats</TabsTrigger>
              <TabsTrigger value="profile" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-4 h-full">Profile</TabsTrigger>
            </TabsList>
          </div>

          {/* Projects Tab */}
          <TabsContent value="projects" className="grid lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-8 space-y-6">
              <Card className="rounded-[2rem] shadow-xl border border-border bg-card">
                <CardHeader className="p-5 border-b border-border/50">
                  <div className="flex flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-lg font-black font-headline"><Plus className="text-primary h-4 w-4" /> New Project</CardTitle>
                    </div>
                    <Button type="button" variant="outline" onClick={handleTranslateProject} disabled={isTranslating} className="rounded-xl gap-2 h-9 px-3 text-xs font-bold">
                      {isTranslating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                      Translate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <form onSubmit={submitProject} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Title (ID)</label>
                        <Input required value={projectForm.titleId} onChange={e => setProjectForm({...projectForm, titleId: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Title (EN)</label>
                        <Input value={projectForm.titleEn} onChange={e => setProjectForm({...projectForm, titleEn: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Short Desc (ID)</label>
                        <Input value={projectForm.shortDescriptionId} onChange={e => setProjectForm({...projectForm, shortDescriptionId: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Short Desc (EN)</label>
                        <Input value={projectForm.shortDescriptionEn} onChange={e => setProjectForm({...projectForm, shortDescriptionEn: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Full Description (ID)</label>
                        <Button type="button" variant="ghost" onClick={handleGenerateAIProject} disabled={isAIThinking} className="gap-1 text-primary h-7 px-2 font-black uppercase text-[8px] tracking-widest">
                          {isAIThinking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} AI
                        </Button>
                      </div>
                      <Textarea required value={projectForm.fullDescriptionId} onChange={e => setProjectForm({...projectForm, fullDescriptionId: e.target.value})} className="min-h-[100px] rounded-xl bg-muted/30 border-border text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Full Description (EN)</label>
                      <Textarea value={projectForm.fullDescriptionEn} onChange={e => setProjectForm({...projectForm, fullDescriptionEn: e.target.value})} className="min-h-[100px] rounded-xl bg-muted/30 border-border text-sm" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Category</label>
                        <select className="flex h-10 w-full rounded-xl border border-border bg-muted/30 px-3 text-xs font-bold" value={projectForm.type} onChange={e => setProjectForm({...projectForm, type: e.target.value as any})}>
                          <option value="web">Web App</option>
                          <option value="ui">UI/UX Design</option>
                          <option value="backend">Backend</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Tech Stack</label>
                        <Input placeholder="Next.js, Tailwind..." value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Live URL</label>
                        <Input placeholder="https://..." value={projectForm.demoUrl} onChange={e => setProjectForm({...projectForm, demoUrl: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Image URL</label>
                       <Input placeholder="https://..." value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                    </div>
                    <Button type="submit" className="w-full h-11 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:scale-[0.99] transition-transform">Deploy Project</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-black uppercase tracking-widest text-[9px] flex items-center gap-2 text-muted-foreground"><Laptop className="h-3 w-3 text-primary" /> Repository</h3>
                <Badge className="rounded-lg bg-muted text-muted-foreground font-black text-[9px]">{projects.length} UNITS</Badge>
              </div>
              <div className="grid gap-3">
                {projects.map(p => (
                  <Card key={p.id} className="p-3 flex gap-3 items-center group bg-card border-border hover:border-primary/50 transition-all rounded-xl shadow-sm">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted border border-border">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <ImageIcon className="w-4 h-4 m-auto absolute inset-0 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-xs group-hover:text-primary transition-colors">{p.titleId}</h4>
                      <Badge variant="secondary" className="text-[7px] font-black mt-0.5 uppercase tracking-widest h-4 bg-muted border-none">{p.type}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteProject(p.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="grid lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
            <div className="lg:col-span-8 space-y-6">
              <Card className="rounded-[2rem] shadow-xl border border-border bg-card">
                <CardHeader className="p-5 border-b border-border/50">
                  <div className="flex flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-lg font-black font-headline"><Award className="text-accent h-4 w-4" /> New Cert</CardTitle>
                    </div>
                    <Button type="button" variant="outline" onClick={handleTranslateCertificate} disabled={isTranslating} className="rounded-xl gap-2 h-9 px-3 text-xs font-bold">
                      {isTranslating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                      Translate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <form onSubmit={submitCertificate} className="space-y-4">
                     <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Cert Title (ID)</label>
                        <Input required value={certForm.titleId} onChange={e => setCertForm({...certForm, titleId: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Cert Title (EN)</label>
                        <Input value={certForm.titleEn} onChange={e => setCertForm({...certForm, titleEn: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="button" variant="ghost" onClick={handleGenerateAICert} disabled={isAIThinking} className="gap-1 text-accent h-7 px-2 font-black uppercase text-[8px] tracking-widest">
                         {isAIThinking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} AI
                      </Button>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Description (ID)</label>
                      <Textarea required value={certForm.fullDescriptionId} onChange={e => setCertForm({...certForm, fullDescriptionId: e.target.value})} className="min-h-[80px] rounded-xl bg-muted/30 border-border text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Description (EN)</label>
                      <Textarea value={certForm.fullDescriptionEn} onChange={e => setCertForm({...certForm, fullDescriptionEn: e.target.value})} className="min-h-[80px] rounded-xl bg-muted/30 border-border text-sm" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Issuer</label>
                        <Input value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Year</label>
                        <Input value={certForm.year} onChange={e => setCertForm({...certForm, year: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Expiry</label>
                        <Input value={certForm.validUntil} onChange={e => setCertForm({...certForm, validUntil: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Asset URL</label>
                      <Input placeholder="https://..." value={certForm.imageUrl} onChange={e => setCertForm({...certForm, imageUrl: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                    </div>
                    <Button type="submit" className="w-full h-11 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/20 bg-accent hover:scale-[0.99] transition-transform">Issue Cert</Button>
                  </form>
                </CardContent>
              </Card>
             </div>
             <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-black uppercase tracking-widest text-[9px] flex items-center gap-2 text-muted-foreground"><Award className="h-3 w-3 text-accent" /> Verified</h3>
                  <Badge className="rounded-lg bg-muted text-muted-foreground font-black text-[9px]">{certificates.length} UNITS</Badge>
                </div>
                <div className="grid gap-3">
                  {certificates.map(c => (
                    <Card key={c.id} className="p-3 flex gap-3 items-center group bg-card border-border hover:border-accent/50 transition-all rounded-xl shadow-sm">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted border border-border">
                        <img src={c.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate text-xs group-hover:text-accent transition-colors">{c.titleId}</h4>
                        <p className="text-[7px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{c.issuer}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteCertificate(c.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
             </div>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials" className="grid lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
            <div className="lg:col-span-8 space-y-6">
              <Card className="rounded-[2rem] shadow-xl border border-border bg-card">
                <CardHeader className="p-5 border-b border-border/50">
                  <div className="flex flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-lg font-black font-headline"><MessageSquare className="text-pink-500 h-4 w-4" /> Feedback</CardTitle>
                    </div>
                    <Button type="button" variant="outline" onClick={handleTranslateTestimonial} disabled={isTranslating} className="rounded-xl gap-2 h-9 px-3 text-xs font-bold">
                      {isTranslating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                      Translate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <form onSubmit={submitTestimonial} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Client Name</label>
                        <Input required value={testForm.name} onChange={e => setTestForm({...testForm, name: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Avatar URL</label>
                        <Input value={testForm.avatarUrl} onChange={e => setTestForm({...testForm, avatarUrl: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Role (ID)</label>
                        <Input required value={testForm.roleId} onChange={e => setTestForm({...testForm, roleId: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Role (EN)</label>
                        <Input value={testForm.roleEn} onChange={e => setTestForm({...testForm, roleEn: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Content (ID)</label>
                      <Textarea required value={testForm.contentId} onChange={e => setTestForm({...testForm, contentId: e.target.value})} className="min-h-[70px] rounded-xl bg-muted/30 border-border text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Content (EN)</label>
                      <Textarea value={testForm.contentEn} onChange={e => setTestForm({...testForm, contentEn: e.target.value})} className="min-h-[70px] rounded-xl bg-muted/30 border-border text-sm" />
                    </div>
                    <Button type="submit" className="w-full h-11 rounded-xl text-xs font-black uppercase tracking-widest bg-pink-600 text-white hover:scale-[0.99] transition-transform">Push Feedback</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-black uppercase tracking-widest text-[9px] flex items-center gap-2 text-muted-foreground"><Quote className="h-3 w-3 text-pink-500" /> Reviews</h3>
                <Badge className="rounded-lg bg-muted text-muted-foreground font-black text-[9px]">{testimonials.length} UNITS</Badge>
              </div>
              <div className="grid gap-3">
                {testimonials.map(t => (
                  <Card key={t.id} className="p-3 flex gap-3 items-center group bg-card border-border hover:border-pink-500/50 transition-all rounded-xl shadow-sm">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-border bg-muted">
                      <img src={t.avatarUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-xs group-hover:text-pink-500 transition-colors">{t.name}</h4>
                      <p className="text-[7px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{t.roleId}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteTestimonial(t.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Journey Tab */}
          <TabsContent value="journey" className="grid lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
            <div className="lg:col-span-8 space-y-6">
              <Card className="rounded-[2rem] shadow-xl border border-border bg-card">
                <CardHeader className="p-5 border-b border-border/50">
                  <div className="flex flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-lg font-black font-headline"><History className="text-emerald-500 h-4 w-4" /> Journey</CardTitle>
                    </div>
                    <Button type="button" variant="outline" onClick={handleTranslateJourney} disabled={isTranslating} className="rounded-xl gap-2 h-9 px-3 text-xs font-bold">
                      {isTranslating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                      Translate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <form onSubmit={submitExperience} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Period</label>
                        <Input required value={expForm.year} onChange={e => setExpForm({...expForm, year: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Company</label>
                        <Input required value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Job Title (ID)</label>
                        <Input required value={expForm.titleId} onChange={e => setExpForm({...expForm, titleId: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Job Title (EN)</label>
                        <Input value={expForm.titleEn} onChange={e => setExpForm({...expForm, titleEn: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Desc (ID)</label>
                      <Textarea required value={expForm.descriptionId} onChange={e => setExpForm({...expForm, descriptionId: e.target.value})} className="min-h-[70px] rounded-xl bg-muted/30 border-border text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Desc (EN)</label>
                      <Textarea value={expForm.descriptionEn} onChange={e => setExpForm({...expForm, descriptionEn: e.target.value})} className="min-h-[70px] rounded-xl bg-muted/30 border-border text-sm" />
                    </div>
                    <Button type="submit" className="w-full h-11 rounded-xl text-xs font-black uppercase tracking-widest bg-emerald-600 text-white hover:scale-[0.99] transition-transform">Add Experience</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-black uppercase tracking-widest text-[9px] flex items-center gap-2 text-muted-foreground"><Briefcase className="h-3 w-3 text-emerald-500" /> Stages</h3>
                <Badge className="rounded-lg bg-muted text-muted-foreground font-black text-[9px]">{experiences.length} UNITS</Badge>
              </div>
              <div className="grid gap-3">
                {experiences.map(e => (
                  <Card key={e.id} className="p-3 flex gap-3 items-center group bg-card border-border hover:border-emerald-500/50 transition-all rounded-xl shadow-sm">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <Briefcase className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-xs group-hover:text-emerald-500 transition-colors">{e.titleId}</h4>
                      <p className="text-[7px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{e.company}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteExperience(e.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="max-w-2xl mx-auto animate-in fade-in duration-500">
             <Card className="rounded-[2rem] shadow-xl border border-border bg-card">
              <CardHeader className="p-6 border-b border-border">
                <CardTitle className="flex items-center gap-3 text-lg font-black font-headline tracking-tighter"><Settings className="text-primary h-5 w-5" /> Metrics</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Projects</label>
                    <Input value={statsData.completedProjects} onChange={e => setStatsData({...statsData, completedProjects: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border font-black text-center" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Years</label>
                    <Input value={statsData.yearsExperience} onChange={e => setStatsData({...statsData, yearsExperience: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border font-black text-center" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Tech Count</label>
                    <Input value={statsData.techMastered} onChange={e => setStatsData({...statsData, techMastered: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border font-black text-center" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Satisfaction</label>
                    <Input value={statsData.clientSatisfaction} onChange={e => setStatsData({...statsData, clientSatisfaction: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border font-black text-center" />
                  </div>
                </div>
                <Button onClick={() => {updateStats(statsData); toast({title: "Synchronized"});}} className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 shadow-lg transition-all">Propagate Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="max-w-3xl mx-auto animate-in fade-in duration-500">
             <Card className="rounded-[2rem] shadow-xl border border-border bg-card">
              <CardHeader className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-lg font-black font-headline tracking-tighter"><UserCircle className="text-indigo-500 h-5 w-5" /> Profile</CardTitle>
                  </div>
                  <Button variant="outline" onClick={handleTranslateProfile} disabled={isTranslating} className="rounded-xl gap-2 h-9 px-3 text-xs font-bold">
                    {isTranslating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                    Translate
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Name</label>
                    <Input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Role (ID)</label>
                    <Input value={profileData.roleId} onChange={e => setProfileData({...profileData, roleId: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border font-bold" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Role (EN)</label>
                  <Input value={profileData.roleEn} onChange={e => setProfileData({...profileData, roleEn: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border font-bold" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                   <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Hero Title (ID)</label>
                    <Input value={profileData.heroTitleId} onChange={e => setProfileData({...profileData, heroTitleId: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border font-black" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Hero Title (EN)</label>
                    <Input value={profileData.heroTitleEn} onChange={e => setProfileData({...profileData, heroTitleEn: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border font-black" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">About (ID)</label>
                    <Textarea value={profileData.aboutTextId} onChange={e => setProfileData({...profileData, aboutTextId: e.target.value})} className="min-h-[100px] rounded-xl bg-muted/30 border-border text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">About (EN)</label>
                    <Textarea value={profileData.aboutTextEn} onChange={e => setProfileData({...profileData, aboutTextEn: e.target.value})} className="min-h-[100px] rounded-xl bg-muted/30 border-border text-sm" />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/50">
                  <h3 className="font-black uppercase tracking-widest text-[9px] flex items-center gap-2 text-primary">Socials</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><MessageSquare className="h-3 w-3" /> WhatsApp</label>
                      <Input value={profileData.whatsapp} onChange={e => setProfileData({...profileData, whatsapp: e.target.value})} placeholder="628..." className="h-10 rounded-xl bg-muted/30 border-border" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Linkedin className="h-3 w-3" /> LinkedIn</label>
                      <Input value={profileData.linkedin} onChange={e => setProfileData({...profileData, linkedin: e.target.value})} placeholder="https://..." className="h-10 rounded-xl bg-muted/30 border-border" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Instagram className="h-3 w-3" /> Instagram</label>
                      <Input value={profileData.instagram} onChange={e => setProfileData({...profileData, instagram: e.target.value})} placeholder="https://..." className="h-10 rounded-xl bg-muted/30 border-border" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Github className="h-3 w-3" /> GitHub</label>
                      <Input value={profileData.github} onChange={e => setProfileData({...profileData, github: e.target.value})} placeholder="https://..." className="h-10 rounded-xl bg-muted/30 border-border" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Video className="h-3 w-3" /> TikTok</label>
                      <Input value={profileData.tiktok} onChange={e => setProfileData({...profileData, tiktok: e.target.value})} placeholder="https://..." className="h-10 rounded-xl bg-muted/30 border-border" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-4 border-t border-border/50">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Avatar Asset URL</label>
                  <div className="flex gap-4 items-center">
                    <Input value={profileData.profileImageUrl} onChange={e => setProfileData({...profileData, profileImageUrl: e.target.value})} className="h-10 rounded-xl bg-muted/30 border-border flex-1" />
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-border shadow-md bg-muted shrink-0">
                      <img src={profileData.profileImageUrl} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
                
                <Button onClick={() => {updateProfile(profileData); toast({title: "Updated"});}} className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-all">Update Identity</Button>
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
