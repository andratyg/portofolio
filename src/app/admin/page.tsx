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

  // Scroll handler for Tabs
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
  
  // Forms States
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

  // Generic Translation Helper
  const translateSingleField = async (text: string, callback: (val: string) => void) => {
    if (!text) return;
    try {
      const result = await translateContent({ text, targetLang: 'en' });
      callback(result.translatedText);
    } catch (e) {
      console.error(e);
    }
  };

  // Bulk Translation Handlers
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

  // AI Suggestions
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

  // Submit Handlers
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
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-primary selection:text-primary-foreground">
      <header className="bg-slate-900/50 backdrop-blur-2xl border-b border-slate-800 h-24 sticky top-0 z-50 flex items-center justify-between px-10">
        <div className="flex items-center gap-8">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-2xl bg-slate-800/50 hover:bg-slate-700 h-12 w-12 border border-slate-700">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20">
               <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-black font-headline tracking-tight uppercase leading-none">Admin Command</h1>
              <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Portfolio Infrastructure</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleLogout} className="text-destructive hover:bg-destructive/10 rounded-2xl gap-3 px-6 h-12 font-bold">
            <LogOut className="h-5 w-5" /> Logout Session
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <Tabs defaultValue="projects" className="space-y-16">
          <div className={cn(
            "flex justify-center sticky top-28 z-40 transition-all duration-500 ease-in-out",
            isTabsVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"
          )}>
            <TabsList className="inline-flex h-16 items-center justify-center rounded-[2rem] bg-slate-900/80 backdrop-blur-3xl border border-slate-800 shadow-2xl p-2 w-full max-w-5xl overflow-x-auto no-scrollbar">
              <TabsTrigger value="projects" className="rounded-[1.5rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-black uppercase text-[10px] tracking-widest px-8 h-full">Projects</TabsTrigger>
              <TabsTrigger value="certificates" className="rounded-[1.5rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-black uppercase text-[10px] tracking-widest px-8 h-full">Certs</TabsTrigger>
              <TabsTrigger value="testimonials" className="rounded-[1.5rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-black uppercase text-[10px] tracking-widest px-8 h-full">Feedback</TabsTrigger>
              <TabsTrigger value="journey" className="rounded-[1.5rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-black uppercase text-[10px] tracking-widest px-8 h-full">Journey</TabsTrigger>
              <TabsTrigger value="stats" className="rounded-[1.5rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-black uppercase text-[10px] tracking-widest px-8 h-full">Stats</TabsTrigger>
              <TabsTrigger value="profile" className="rounded-[1.5rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-black uppercase text-[10px] tracking-widest px-8 h-full">Profile</TabsTrigger>
            </TabsList>
          </div>

          {/* Projects Tab */}
          <TabsContent value="projects" className="grid lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="lg:col-span-8 space-y-10">
              <Card className="rounded-[3rem] shadow-2xl border-none overflow-hidden bg-slate-900/40 backdrop-blur-xl">
                <CardHeader className="bg-gradient-to-r from-primary/10 via-transparent to-transparent p-10 border-b border-slate-800/50">
                  <div className="flex flex-row items-center justify-between gap-6">
                    <div>
                      <CardTitle className="flex items-center gap-4 text-3xl font-black font-headline"><Plus className="text-primary h-8 w-8" /> New Production</CardTitle>
                      <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">Deploy a new project to your portfolio</p>
                    </div>
                    <Button type="button" variant="outline" onClick={handleTranslateProject} disabled={isTranslating} className="rounded-2xl gap-3 border-primary/20 bg-primary/5 hover:bg-primary/10 h-12 px-6 font-bold">
                      {isTranslating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Languages className="h-5 w-5" />}
                      AI Translate All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                  <form onSubmit={submitProject} className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Project Title (ID)</label>
                        <Input required value={projectForm.titleId} onChange={e => setProjectForm({...projectForm, titleId: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800 text-lg font-bold" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Project Title (EN)</label>
                        <Input value={projectForm.titleEn} onChange={e => setProjectForm({...projectForm, titleEn: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800 text-lg font-bold" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Hook / Short Desc (ID)</label>
                        <Input value={projectForm.shortDescriptionId} onChange={e => setProjectForm({...projectForm, shortDescriptionId: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Hook / Short Desc (EN)</label>
                        <Input value={projectForm.shortDescriptionEn} onChange={e => setProjectForm({...projectForm, shortDescriptionEn: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Case Study / Full Desc (ID)</label>
                        <Button type="button" variant="ghost" onClick={handleGenerateAIProject} disabled={isAIThinking} className="gap-2 text-primary hover:bg-primary/10 rounded-xl h-10 px-4 font-black uppercase text-[10px] tracking-widest">
                          {isAIThinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                          AI Engine Suggest
                        </Button>
                      </div>
                      <Textarea required value={projectForm.fullDescriptionId} onChange={e => setProjectForm({...projectForm, fullDescriptionId: e.target.value})} className="min-h-[160px] rounded-3xl bg-slate-950/50 border-slate-800 leading-relaxed p-6" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Case Study / Full Desc (EN)</label>
                      <Textarea value={projectForm.fullDescriptionEn} onChange={e => setProjectForm({...projectForm, fullDescriptionEn: e.target.value})} className="min-h-[160px] rounded-3xl bg-slate-950/50 border-slate-800 leading-relaxed p-6" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Category</label>
                        <select className="flex h-14 w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-2 text-sm font-bold" value={projectForm.type} onChange={e => setProjectForm({...projectForm, type: e.target.value as any})}>
                          <option value="web">Web Application</option>
                          <option value="ui">UI/UX Design</option>
                          <option value="backend">Backend System</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Tech Stack</label>
                        <Input placeholder="Next.js, Tailwind..." value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Deployment URL</label>
                        <Input placeholder="https://..." value={projectForm.demoUrl} onChange={e => setProjectForm({...projectForm, demoUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800" />
                      </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Cover Image Asset URL</label>
                       <Input placeholder="https://..." value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800" />
                    </div>
                    <Button type="submit" className="w-full h-20 rounded-[2.5rem] text-xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 bg-primary hover:scale-[0.98] transition-transform">Push to Production</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-4 space-y-8">
              <div className="flex items-center justify-between px-4">
                <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-3"><Laptop className="h-5 w-5 text-primary" /> Active Repository</h3>
                <Badge className="rounded-lg bg-slate-800 text-slate-400 font-black">{projects.length} UNITS</Badge>
              </div>
              <div className="grid gap-6">
                {projects.map(p => (
                  <Card key={p.id} className="p-6 flex gap-6 items-center group bg-slate-900/40 border-slate-800 hover:border-primary/50 transition-all rounded-[2rem] shadow-xl">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-2xl bg-slate-950 border border-slate-800">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" />
                      ) : (
                        <ImageIcon className="w-8 h-8 m-auto absolute inset-0 text-slate-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-lg group-hover:text-primary transition-colors">{p.titleId}</h4>
                      <Badge variant="secondary" className="text-[10px] font-black mt-2 uppercase tracking-[0.2em] h-6 bg-slate-800/50 border-slate-700">{p.type}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteProject(p.id)} className="text-destructive hover:bg-destructive/10 h-12 w-12 rounded-2xl shrink-0">
                      <Trash2 className="h-6 w-6" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="grid lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="lg:col-span-8 space-y-10">
              <Card className="rounded-[3rem] shadow-2xl border-none overflow-hidden bg-slate-900/40 backdrop-blur-xl">
                <CardHeader className="bg-gradient-to-r from-accent/10 via-transparent to-transparent p-10 border-b border-slate-800/50">
                  <div className="flex flex-row items-center justify-between gap-6">
                    <div>
                      <CardTitle className="flex items-center gap-4 text-3xl font-black font-headline"><Award className="text-accent h-8 w-8" /> Add Credential</CardTitle>
                      <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">Verify and list your professional certifications</p>
                    </div>
                    <Button type="button" variant="outline" onClick={handleTranslateCertificate} disabled={isTranslating} className="rounded-2xl gap-3 border-accent/20 bg-accent/5 hover:bg-accent/10 h-12 px-6 font-bold">
                      {isTranslating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Languages className="h-5 w-5" />}
                      AI Translate All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                  <form onSubmit={submitCertificate} className="space-y-8">
                     <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Cert Title (ID)</label>
                        <Input required value={certForm.titleId} onChange={e => setCertForm({...certForm, titleId: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800 text-lg font-bold" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Cert Title (EN)</label>
                        <Input value={certForm.titleEn} onChange={e => setCertForm({...certForm, titleEn: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800 text-lg font-bold" />
                      </div>
                    </div>
                    <div className="flex justify-end px-1">
                      <Button type="button" variant="ghost" onClick={handleGenerateAICert} disabled={isAIThinking} className="gap-2 text-accent hover:bg-accent/10 rounded-xl h-10 px-4 font-black uppercase text-[10px] tracking-widest">
                         {isAIThinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                         AI Assist
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Case (ID)</label>
                      <Textarea required value={certForm.fullDescriptionId} onChange={e => setCertForm({...certForm, fullDescriptionId: e.target.value})} className="min-h-[120px] rounded-3xl bg-slate-950/50 border-slate-800 p-6" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Case (EN)</label>
                      <Textarea value={certForm.fullDescriptionEn} onChange={e => setCertForm({...certForm, fullDescriptionEn: e.target.value})} className="min-h-[120px] rounded-3xl bg-slate-950/50 border-slate-800 p-6" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Authority</label>
                        <Input value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Year</label>
                        <Input value={certForm.year} onChange={e => setCertForm({...certForm, year: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Expiry</label>
                        <Input value={certForm.validUntil} onChange={e => setCertForm({...certForm, validUntil: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Asset URL</label>
                      <Input placeholder="https://..." value={certForm.imageUrl} onChange={e => setCertForm({...certForm, imageUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800" />
                    </div>
                    <Button type="submit" className="w-full h-20 rounded-[2.5rem] text-xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-accent/30 bg-accent hover:scale-[0.98] transition-transform">Issue Certificate</Button>
                  </form>
                </CardHeader>
              </Card>
             </div>
             <div className="lg:col-span-4 space-y-8">
                <div className="flex items-center justify-between px-4">
                  <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-3"><Award className="h-5 w-5 text-accent" /> Verified Units</h3>
                  <Badge className="rounded-lg bg-slate-800 text-slate-400 font-black">{certificates.length} UNITS</Badge>
                </div>
                <div className="grid gap-6">
                  {certificates.map(c => (
                    <Card key={c.id} className="p-6 flex gap-6 items-center group bg-slate-900/40 border-slate-800 hover:border-accent/50 transition-all rounded-[2rem] shadow-xl">
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-2xl bg-slate-950 border border-slate-800">
                        <img src={c.imageUrl} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate text-lg group-hover:text-accent transition-colors">{c.titleId}</h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">{c.issuer}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteCertificate(c.id)} className="text-destructive hover:bg-destructive/10 h-12 w-12 rounded-2xl shrink-0">
                        <Trash2 className="h-6 w-6" />
                      </Button>
                    </Card>
                  ))}
                </div>
             </div>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials" className="grid lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="lg:col-span-8 space-y-10">
              <Card className="rounded-[3rem] shadow-2xl border-none overflow-hidden bg-slate-900/40 backdrop-blur-xl">
                <CardHeader className="bg-gradient-to-r from-pink-500/10 via-transparent to-transparent p-10 border-b border-slate-800/50">
                  <div className="flex flex-row items-center justify-between gap-6">
                    <div>
                      <CardTitle className="flex items-center gap-4 text-3xl font-black font-headline"><MessageSquare className="text-pink-500 h-8 w-8" /> Client Feedback</CardTitle>
                      <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">Document testimonials and client success stories</p>
                    </div>
                    <Button type="button" variant="outline" onClick={handleTranslateTestimonial} disabled={isTranslating} className="rounded-2xl gap-3 border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/10 h-12 px-6 font-bold">
                      {isTranslating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Languages className="h-5 w-5" />}
                      AI Translate All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                  <form onSubmit={submitTestimonial} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Client Name</label>
                        <Input required value={testForm.name} onChange={e => setTestForm({...testForm, name: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800 text-lg font-bold" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Avatar URL</label>
                        <Input value={testForm.avatarUrl} onChange={e => setTestForm({...testForm, avatarUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Client Role (ID)</label>
                        <Input required value={testForm.roleId} onChange={e => setTestForm({...testForm, roleId: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Client Role (EN)</label>
                        <Input value={testForm.roleEn} onChange={e => setTestForm({...testForm, roleEn: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Testimonial Content (ID)</label>
                      <Textarea required value={testForm.contentId} onChange={e => setTestForm({...testForm, contentId: e.target.value})} className="min-h-[120px] rounded-3xl bg-slate-950/50 border-slate-800 p-6" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Testimonial Content (EN)</label>
                      <Textarea value={testForm.contentEn} onChange={e => setTestForm({...testForm, contentEn: e.target.value})} className="min-h-[120px] rounded-3xl bg-slate-950/50 border-slate-800 p-6" />
                    </div>
                    <Button type="submit" className="w-full h-20 rounded-[2.5rem] text-xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-pink-500/30 bg-pink-600 hover:scale-[0.98] transition-transform">Submit Feedback</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-4 space-y-8">
              <div className="flex items-center justify-between px-4">
                <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-3"><Quote className="h-5 w-5 text-pink-500" /> Reviews</h3>
                <Badge className="rounded-lg bg-slate-800 text-slate-400 font-black">{testimonials.length} UNITS</Badge>
              </div>
              <div className="grid gap-6">
                {testimonials.map(t => (
                  <Card key={t.id} className="p-6 flex gap-6 items-center group bg-slate-900/40 border-slate-800 hover:border-pink-500/50 transition-all rounded-[2rem] shadow-xl">
                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-slate-800 shadow-xl bg-slate-950">
                      <img src={t.avatarUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-lg group-hover:text-pink-500 transition-colors">{t.name}</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{t.roleId}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteTestimonial(t.id)} className="text-destructive hover:bg-destructive/10 h-12 w-12 rounded-2xl shrink-0">
                      <Trash2 className="h-6 w-6" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Journey Tab */}
          <TabsContent value="journey" className="grid lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="lg:col-span-8 space-y-10">
              <Card className="rounded-[3rem] shadow-2xl border-none overflow-hidden bg-slate-900/40 backdrop-blur-xl">
                <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent p-10 border-b border-slate-800/50">
                  <div className="flex flex-row items-center justify-between gap-6">
                    <div>
                      <CardTitle className="flex items-center gap-4 text-3xl font-black font-headline"><History className="text-emerald-500 h-8 w-8" /> Career Journey</CardTitle>
                      <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">Update your professional timeline and experience</p>
                    </div>
                    <Button type="button" variant="outline" onClick={handleTranslateJourney} disabled={isTranslating} className="rounded-2xl gap-3 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 h-12 px-6 font-bold">
                      {isTranslating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Languages className="h-5 w-5" />}
                      AI Translate All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                  <form onSubmit={submitExperience} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Period (e.g., 2023 - Present)</label>
                        <Input required value={expForm.year} onChange={e => setExpForm({...expForm, year: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800 text-lg font-bold" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Company / Institution</label>
                        <Input required value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Job Title (ID)</label>
                        <Input required value={expForm.titleId} onChange={e => setExpForm({...expForm, titleId: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Job Title (EN)</label>
                        <Input value={expForm.titleEn} onChange={e => setExpForm({...expForm, titleEn: e.target.value})} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Achievement / Desc (ID)</label>
                      <Textarea required value={expForm.descriptionId} onChange={e => setExpForm({...expForm, descriptionId: e.target.value})} className="min-h-[100px] rounded-3xl bg-slate-950/50 border-slate-800 p-6" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Achievement / Desc (EN)</label>
                      <Textarea value={expForm.descriptionEn} onChange={e => setExpForm({...expForm, descriptionEn: e.target.value})} className="min-h-[100px] rounded-3xl bg-slate-950/50 border-slate-800 p-6" />
                    </div>
                    <Button type="submit" className="w-full h-20 rounded-[2.5rem] text-xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/30 bg-emerald-600 hover:scale-[0.98] transition-transform">Add to Journey</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-4 space-y-8">
              <div className="flex items-center justify-between px-4">
                <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-3"><Briefcase className="h-5 w-5 text-emerald-500" /> History</h3>
                <Badge className="rounded-lg bg-slate-800 text-slate-400 font-black">{experiences.length} STAGES</Badge>
              </div>
              <div className="grid gap-6">
                {experiences.map(e => (
                  <Card key={e.id} className="p-6 flex gap-6 items-center group bg-slate-900/40 border-slate-800 hover:border-emerald-500/50 transition-all rounded-[2rem] shadow-xl">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <Briefcase className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-lg group-hover:text-emerald-500 transition-colors">{e.titleId}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{e.company}</p>
                      <Badge variant="outline" className="text-[10px] mt-2 border-slate-800 text-slate-500">{e.year}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteExperience(e.id)} className="text-destructive hover:bg-destructive/10 h-12 w-12 rounded-2xl shrink-0">
                      <Trash2 className="h-6 w-6" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
             <Card className="rounded-[4rem] shadow-2xl border-none overflow-hidden bg-slate-900/40 backdrop-blur-xl">
              <CardHeader className="bg-gradient-to-br from-slate-800/50 to-transparent p-14 border-b border-slate-800">
                <CardTitle className="flex items-center gap-6 text-4xl font-black font-headline tracking-tighter"><Settings className="text-primary h-12 w-12" /> Metrics Control</CardTitle>
                <p className="text-slate-500 text-lg font-medium mt-2">Adjust your high-level performance metrics globally</p>
              </CardHeader>
              <CardContent className="p-14 space-y-12">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Projects Completed</label>
                    <Input value={statsData.completedProjects} onChange={e => setStatsData({...statsData, completedProjects: e.target.value})} className="h-20 rounded-3xl bg-slate-950/50 border-slate-800 text-3xl font-black text-center" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Years of Exp</label>
                    <Input value={statsData.yearsExperience} onChange={e => setStatsData({...statsData, yearsExperience: e.target.value})} className="h-20 rounded-3xl bg-slate-950/50 border-slate-800 text-3xl font-black text-center" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Tech Stack Count</label>
                    <Input value={statsData.techMastered} onChange={e => setStatsData({...statsData, techMastered: e.target.value})} className="h-20 rounded-3xl bg-slate-950/50 border-slate-800 text-3xl font-black text-center" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Satisfaction Index</label>
                    <Input value={statsData.clientSatisfaction} onChange={e => setStatsData({...statsData, clientSatisfaction: e.target.value})} className="h-20 rounded-3xl bg-slate-950/50 border-slate-800 text-3xl font-black text-center" />
                  </div>
                </div>
                <Button onClick={() => {updateStats(statsData); toast({title: "Metrics Synchronized"});}} className="w-full h-24 rounded-[3rem] text-2xl font-black uppercase tracking-[0.3em] bg-slate-100 text-slate-950 hover:bg-white shadow-2xl transition-all">Propagate Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
             <Card className="rounded-[4rem] shadow-2xl border-none overflow-hidden bg-slate-900/40 backdrop-blur-xl">
              <CardHeader className="bg-gradient-to-br from-indigo-900/30 to-transparent p-14 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-6 text-4xl font-black font-headline tracking-tighter"><UserCircle className="text-indigo-400 h-12 w-12" /> Profile Intel</CardTitle>
                    <p className="text-slate-500 text-lg font-medium mt-2">Manage your professional identity and hero section content</p>
                  </div>
                  <Button variant="outline" onClick={handleTranslateProfile} disabled={isTranslating} className="rounded-2xl gap-3 border-indigo-400/20 bg-indigo-400/5 hover:bg-indigo-400/10 h-14 px-8 font-bold">
                    {isTranslating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Languages className="h-5 w-5" />}
                    AI Translate All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-14 space-y-12">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Display Name</label>
                    <Input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="h-16 rounded-2xl bg-slate-950/50 border-slate-800 text-xl font-bold" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Professional Role (ID)</label>
                    <Input value={profileData.roleId} onChange={e => setProfileData({...profileData, roleId: e.target.value})} className="h-16 rounded-2xl bg-slate-950/50 border-slate-800 text-xl font-bold" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Professional Role (EN)</label>
                  <Input value={profileData.roleEn} onChange={e => setProfileData({...profileData, roleEn: e.target.value})} className="h-16 rounded-2xl bg-slate-950/50 border-slate-800 text-xl font-bold" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-10 border-t border-slate-800 pt-12">
                   <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Hero Heading (ID)</label>
                    <Input value={profileData.heroTitleId} onChange={e => setProfileData({...profileData, heroTitleId: e.target.value})} className="h-16 rounded-2xl bg-slate-950/50 border-slate-800 text-2xl font-black" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Hero Heading (EN)</label>
                    <Input value={profileData.heroTitleEn} onChange={e => setProfileData({...profileData, heroTitleEn: e.target.value})} className="h-16 rounded-2xl bg-slate-950/50 border-slate-800 text-2xl font-black" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10 border-t border-slate-800 pt-12">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Mission / About (ID)</label>
                    <Textarea value={profileData.aboutTextId} onChange={e => setProfileData({...profileData, aboutTextId: e.target.value})} className="min-h-[200px] rounded-[2rem] bg-slate-950/50 border-slate-800 leading-relaxed p-8 text-lg" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Mission / About (EN)</label>
                    <Textarea value={profileData.aboutTextEn} onChange={e => setProfileData({...profileData, aboutTextEn: e.target.value})} className="min-h-[200px] rounded-[2rem] bg-slate-950/50 border-slate-800 leading-relaxed p-8 text-lg" />
                  </div>
                </div>

                <div className="space-y-10 border-t border-slate-800 pt-12">
                  <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-3 text-primary"><Settings className="h-5 w-5" /> Social Connections</h3>
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2"><MessageSquare className="h-3 w-3" /> WhatsApp (Phone Number)</label>
                      <Input value={profileData.whatsapp} onChange={e => setProfileData({...profileData, whatsapp: e.target.value})} placeholder="628..." className="h-16 rounded-2xl bg-slate-950/50 border-slate-800" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2"><Linkedin className="h-3 w-3" /> LinkedIn URL</label>
                      <Input value={profileData.linkedin} onChange={e => setProfileData({...profileData, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." className="h-16 rounded-2xl bg-slate-950/50 border-slate-800" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2"><Instagram className="h-3 w-3" /> Instagram URL</label>
                      <Input value={profileData.instagram} onChange={e => setProfileData({...profileData, instagram: e.target.value})} placeholder="https://instagram.com/..." className="h-16 rounded-2xl bg-slate-950/50 border-slate-800" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2"><Github className="h-3 w-3" /> GitHub URL</label>
                      <Input value={profileData.github} onChange={e => setProfileData({...profileData, github: e.target.value})} placeholder="https://github.com/..." className="h-16 rounded-2xl bg-slate-950/50 border-slate-800" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2"><Video className="h-3 w-3" /> TikTok URL</label>
                      <Input value={profileData.tiktok} onChange={e => setProfileData({...profileData, tiktok: e.target.value})} placeholder="https://tiktok.com/@..." className="h-16 rounded-2xl bg-slate-950/50 border-slate-800" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-10 border-t border-slate-800">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Avatar Asset URL</label>
                  <div className="flex gap-8 items-center">
                    <Input value={profileData.profileImageUrl} onChange={e => setProfileData({...profileData, profileImageUrl: e.target.value})} className="h-16 rounded-2xl bg-slate-950/50 border-slate-800 flex-1" />
                    <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-900 shrink-0">
                      <img src={profileData.profileImageUrl} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
                
                <Button onClick={() => {updateProfile(profileData); toast({title: "Identity Verified"});}} className="w-full h-24 rounded-[3rem] text-2xl font-black uppercase tracking-[0.3em] bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-600/30 transition-all">Execute Update</Button>
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
