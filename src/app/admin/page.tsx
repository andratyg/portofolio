
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
import { Plus, Trash2, Sparkles, LogOut, ArrowLeft, Laptop, Award, Settings, UserCircle, Languages, Loader2, Image as ImageIcon, Quote, Briefcase, LayoutDashboard, ShieldCheck, Github, Instagram, Linkedin, MessageSquare, Video } from 'lucide-react';
import { generatePortfolioDescriptionSuggestion } from '@/ai/flows/generate-portfolio-description-suggestion';
import { generateCertificateDescription } from '@/ai/flows/generate-certificate-description';
import { translateContent } from '@/ai/flows/translate-content';
import { useToast } from '@/hooks/use-toast';
import { ProfileData } from '@/lib/types';

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
    setStatsData(stats);
    setProfileData(profile);
  }, [stats, profile]);

  const handleLogout = () => {
    sessionStorage.removeItem('karyapro-auth');
    router.push('/');
  };

  const translateSingle = async (text: string, targetLang: 'id' | 'en', callback: (val: string) => void) => {
    if (!text) return;
    setIsTranslating(true);
    try {
      const result = await translateContent({ text, targetLang });
      callback(result.translatedText);
    } catch (e) {
      toast({ title: "Translation Error", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateProject = async () => {
    const { titleId, shortDescriptionId, fullDescriptionId } = projectForm;
    if (!titleId && !shortDescriptionId && !fullDescriptionId) {
      toast({ title: "Isi konten Indonesia terlebih dahulu", variant: "destructive" });
      return;
    }
    setIsTranslating(true);
    try {
      if (titleId) {
        const r = await translateContent({ text: titleId, targetLang: 'en' });
        setProjectForm(prev => ({ ...prev, titleEn: r.translatedText }));
      }
      if (shortDescriptionId) {
        const r = await translateContent({ text: shortDescriptionId, targetLang: 'en' });
        setProjectForm(prev => ({ ...prev, shortDescriptionEn: r.translatedText }));
      }
      if (fullDescriptionId) {
        const r = await translateContent({ text: fullDescriptionId, targetLang: 'en' });
        setProjectForm(prev => ({ ...prev, fullDescriptionEn: r.translatedText }));
      }
      toast({ title: "Project translated successfully" });
    } catch (e) {
      toast({ title: "Translation Error", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateCertificate = async () => {
    const { titleId, fullDescriptionId } = certForm;
    setIsTranslating(true);
    try {
      if (titleId) {
        const r = await translateContent({ text: titleId, targetLang: 'en' });
        setCertForm(prev => ({ ...prev, titleEn: r.translatedText }));
      }
      if (fullDescriptionId) {
        const r = await translateContent({ text: fullDescriptionId, targetLang: 'en' });
        setCertForm(prev => ({ ...prev, fullDescriptionEn: r.translatedText }));
      }
      toast({ title: "Certificate translated successfully" });
    } catch (e) {
      toast({ title: "Translation Error", variant: "destructive" });
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
    } catch (e) {
      toast({ title: "AI Error", variant: "destructive" });
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
    } catch (e) {
      toast({ title: "AI Error", variant: "destructive" });
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
    toast({ title: "Project Added" });
    setProjectForm({ titleId: '', titleEn: '', type: 'web', shortDescriptionId: '', shortDescriptionEn: '', fullDescriptionId: '', fullDescriptionEn: '', technologies: '', imageUrl: '', demoUrl: '' });
  };

  const submitCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    addCertificate({ ...certForm, id: Date.now().toString() });
    toast({ title: "Certificate Added" });
    setCertForm({ titleId: '', titleEn: '', shortDescriptionId: '', shortDescriptionEn: '', fullDescriptionId: '', fullDescriptionEn: '', year: '', issuer: '', validUntil: '', imageUrl: '' });
  };

  const submitTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    addTestimonial({ ...testForm, id: Date.now().toString() });
    toast({ title: "Testimonial Added" });
    setTestForm({ name: '', roleId: '', roleEn: '', contentId: '', contentEn: '', avatarUrl: '' });
  };

  const submitExperience = (e: React.FormEvent) => {
    e.preventDefault();
    addExperience({ ...expForm, id: Date.now().toString() });
    toast({ title: "Journey Experience Added" });
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
          <div className="flex justify-center sticky top-28 z-40">
            <TabsList className="inline-flex h-16 items-center justify-center rounded-[2rem] bg-slate-900/80 backdrop-blur-3xl border border-slate-800 shadow-2xl p-2 w-full max-w-5xl overflow-x-auto no-scrollbar">
              <TabsTrigger value="projects" className="rounded-[1.5rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-black uppercase text-[10px] tracking-widest px-8 h-full">Projects</TabsTrigger>
              <TabsTrigger value="certificates" className="rounded-[1.5rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-black uppercase text-[10px] tracking-widest px-8 h-full">Certs</TabsTrigger>
              <TabsTrigger value="testimonials" className="rounded-[1.5rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-black uppercase text-[10px] tracking-widest px-8 h-full">Feedback</TabsTrigger>
              <TabsTrigger value="journey" className="rounded-[1.5rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-black uppercase text-[10px] tracking-widest px-8 h-full">Journey</TabsTrigger>
              <TabsTrigger value="stats" className="rounded-[1.5rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-black uppercase text-[10px] tracking-widest px-8 h-full">Stats</TabsTrigger>
              <TabsTrigger value="profile" className="rounded-[1.5rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-black uppercase text-[10px] tracking-widest px-8 h-full">Profile</TabsTrigger>
            </TabsList>
          </div>

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
                      AI Translate
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
                         AI Proofread
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
                </CardContent>
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

          <TabsContent value="profile" className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
             <Card className="rounded-[4rem] shadow-2xl border-none overflow-hidden bg-slate-900/40 backdrop-blur-xl">
              <CardHeader className="bg-gradient-to-br from-indigo-900/30 to-transparent p-14 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-6 text-4xl font-black font-headline tracking-tighter"><UserCircle className="text-indigo-400 h-12 w-12" /> Profile Intel</CardTitle>
                    <p className="text-slate-500 text-lg font-medium mt-2">Manage your professional identity and hero section content</p>
                  </div>
                  <Button variant="outline" onClick={() => {
                       translateSingle(profileData.roleId, 'en', (v) => setProfileData(p => ({...p, roleEn: v})));
                       translateSingle(profileData.aboutTextId, 'en', (v) => setProfileData(p => ({...p, aboutTextEn: v})));
                       translateSingle(profileData.heroTitleId, 'en', (v) => setProfileData(p => ({...p, heroTitleEn: v})));
                       translateSingle(profileData.heroSubtitleId, 'en', (v) => setProfileData(p => ({...p, heroSubtitleEn: v})));
                    }} disabled={isTranslating} className="rounded-2xl gap-3 border-indigo-400/20 bg-indigo-400/5 hover:bg-indigo-400/10 h-14 px-8 font-bold">
                    {isTranslating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Languages className="h-5 w-5" />}
                    Sync Identity
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
