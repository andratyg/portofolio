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
import { Plus, Trash2, Sparkles, LogOut, ArrowLeft, Laptop, Award, Settings, UserCircle, Languages, Loader2, Image as ImageIcon, ExternalLink, Quote } from 'lucide-react';
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
    if (!titleId && !fullDescriptionId) {
      toast({ title: "Isi konten Indonesia terlebih dahulu", variant: "destructive" });
      return;
    }
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

  const handleTranslateTestimonial = async () => {
    const { roleId, contentId } = testForm;
    if (!roleId && !contentId) {
      toast({ title: "Isi konten Indonesia terlebih dahulu", variant: "destructive" });
      return;
    }
    setIsTranslating(true);
    try {
      if (roleId) {
        const r = await translateContent({ text: roleId, targetLang: 'en' });
        setTestForm(prev => ({ ...prev, roleEn: r.translatedText }));
      }
      if (contentId) {
        const r = await translateContent({ text: contentId, targetLang: 'en' });
        setTestForm(prev => ({ ...prev, contentEn: r.translatedText }));
      }
      toast({ title: "Testimonial translated successfully" });
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

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="bg-card/50 backdrop-blur-xl border-b h-20 sticky top-0 z-50 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" onClick={() => router.push('/')} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold font-headline tracking-tight">KaryaPro Admin</h1>
            <p className="text-xs text-muted-foreground font-medium">Manage your digital presence</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:bg-destructive/10 rounded-xl gap-2 px-4">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <Tabs defaultValue="projects" className="space-y-12">
          <div className="flex justify-center">
            <TabsList className="inline-flex h-14 items-center justify-center rounded-2xl bg-card border shadow-xl p-1.5 w-full max-w-3xl overflow-x-auto no-scrollbar">
              <TabsTrigger value="projects" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-bold text-sm">Projects</TabsTrigger>
              <TabsTrigger value="certificates" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-bold text-sm">Certs</TabsTrigger>
              <TabsTrigger value="testimonials" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-bold text-sm">Testimonials</TabsTrigger>
              <TabsTrigger value="stats" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-bold text-sm">Stats</TabsTrigger>
              <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 font-bold text-sm">Profile</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="projects" className="grid lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-8 space-y-8">
              <Card className="rounded-[2rem] shadow-2xl border-none overflow-hidden bg-card">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent p-8 border-b">
                  <div className="flex flex-row items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-3 text-2xl"><Plus className="text-primary" /> Add New Project</CardTitle>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleTranslateProject}
                      disabled={isTranslating}
                      className="rounded-xl gap-2 border-primary/20 hover:bg-primary/5"
                    >
                      {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                      Translate to EN
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={submitProject} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Project Title (ID)</label>
                        <Input required value={projectForm.titleId} onChange={e => setProjectForm({...projectForm, titleId: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Project Title (EN)</label>
                        <Input value={projectForm.titleEn} onChange={e => setProjectForm({...projectForm, titleEn: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Short Description (ID)</label>
                        <Input value={projectForm.shortDescriptionId} onChange={e => setProjectForm({...projectForm, shortDescriptionId: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Short Description (EN)</label>
                        <Input value={projectForm.shortDescriptionEn} onChange={e => setProjectForm({...projectForm, shortDescriptionEn: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Description (ID)</label>
                        <Button type="button" variant="ghost" size="sm" onClick={handleGenerateAIProject} disabled={isAIThinking} className="gap-2 text-primary hover:bg-primary/5 rounded-lg h-8">
                          {isAIThinking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                          AI Magic Suggest
                        </Button>
                      </div>
                      <Textarea required value={projectForm.fullDescriptionId} onChange={e => setProjectForm({...projectForm, fullDescriptionId: e.target.value})} className="min-h-[120px] rounded-xl bg-background/50" />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Full Description (EN)</label>
                      <Textarea value={projectForm.fullDescriptionEn} onChange={e => setProjectForm({...projectForm, fullDescriptionEn: e.target.value})} className="min-h-[120px] rounded-xl bg-background/50" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Category</label>
                        <select className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background" value={projectForm.type} onChange={e => setProjectForm({...projectForm, type: e.target.value as any})}>
                          <option value="web">Web Application</option>
                          <option value="ui">UI/UX Design</option>
                          <option value="backend">Backend System</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Technologies</label>
                        <Input placeholder="Next.js, Tailwind..." value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Demo URL</label>
                        <Input placeholder="https://..." value={projectForm.demoUrl} onChange={e => setProjectForm({...projectForm, demoUrl: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                      </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Image URL</label>
                       <Input placeholder="https://images.unsplash.com/..." value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">Publish Project</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-xl flex items-center gap-2"><Laptop className="h-5 w-5 text-primary" /> Active Projects</h3>
                <Badge variant="secondary" className="rounded-lg">{projects.length}</Badge>
              </div>
              <div className="grid gap-4">
                {projects.map(p => (
                  <Card key={p.id} className="p-4 flex gap-4 items-center group bg-card hover:bg-accent/5 transition-colors rounded-2xl border-none shadow-sm">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-inner bg-muted">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <ImageIcon className="w-6 h-6 m-auto absolute inset-0 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-sm">{p.titleId}</h4>
                      <Badge variant="secondary" className="text-[10px] font-bold mt-1 uppercase tracking-wider h-5">{p.type}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteProject(p.id)} className="text-destructive hover:bg-destructive/10 rounded-lg shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="grid lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-8 space-y-8">
              <Card className="rounded-[2rem] shadow-2xl border-none overflow-hidden bg-card">
                <CardHeader className="bg-gradient-to-r from-accent/10 to-transparent p-8 border-b">
                  <div className="flex flex-row items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-3 text-2xl"><Award className="text-accent" /> Add New Certificate</CardTitle>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleTranslateCertificate}
                      disabled={isTranslating}
                      className="rounded-xl gap-2 border-accent/20 hover:bg-accent/5"
                    >
                      {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                      Translate to EN
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={submitCertificate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Certificate Title (ID)</label>
                        <Input required value={certForm.titleId} onChange={e => setCertForm({...certForm, titleId: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Certificate Title (EN)</label>
                        <Input value={certForm.titleEn} onChange={e => setCertForm({...certForm, titleEn: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                      </div>
                    </div>
                    <div className="flex justify-end px-1">
                      <Button type="button" variant="ghost" size="sm" onClick={handleGenerateAICert} disabled={isAIThinking} className="gap-2 text-accent hover:bg-accent/5 rounded-lg h-8">
                         {isAIThinking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                         AI Suggest Description
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Full Description (ID)</label>
                      <Textarea required value={certForm.fullDescriptionId} onChange={e => setCertForm({...certForm, fullDescriptionId: e.target.value})} className="min-h-[100px] rounded-xl bg-background/50" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Full Description (EN)</label>
                      <Textarea value={certForm.fullDescriptionEn} onChange={e => setCertForm({...certForm, fullDescriptionEn: e.target.value})} className="min-h-[100px] rounded-xl bg-background/50" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Issuer</label>
                        <Input value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Year</label>
                        <Input value={certForm.year} onChange={e => setCertForm({...certForm, year: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Valid Until</label>
                        <Input value={certForm.validUntil} onChange={e => setCertForm({...certForm, validUntil: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Image URL</label>
                      <Input placeholder="https://..." value={certForm.imageUrl} onChange={e => setCertForm({...certForm, imageUrl: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold bg-accent hover:bg-accent/90 shadow-xl shadow-accent/20">Add Certificate</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-xl flex items-center gap-2"><Award className="h-5 w-5 text-accent" /> Credentials</h3>
                <Badge variant="secondary" className="rounded-lg">{certificates.length}</Badge>
              </div>
              <div className="grid gap-4">
                {certificates.map(c => (
                  <Card key={c.id} className="p-4 flex gap-4 items-center group bg-card hover:bg-accent/5 transition-colors rounded-2xl border-none shadow-sm">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-inner bg-muted">
                      <img src={c.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-sm">{c.titleId}</h4>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">{c.issuer}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteCertificate(c.id)} className="text-destructive hover:bg-destructive/10 rounded-lg shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="testimonials" className="grid lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-8 space-y-8">
              <Card className="rounded-[2rem] shadow-2xl border-none overflow-hidden bg-card">
                <CardHeader className="bg-gradient-to-r from-pink-500/10 to-transparent p-8 border-b">
                  <div className="flex flex-row items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-3 text-2xl"><Quote className="text-pink-500" /> Add Testimonial</CardTitle>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleTranslateTestimonial}
                      disabled={isTranslating}
                      className="rounded-xl gap-2 border-pink-500/20 hover:bg-pink-500/5"
                    >
                      {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                      Translate to EN
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={submitTestimonial} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Client Name</label>
                        <Input required value={testForm.name} onChange={e => setTestForm({...testForm, name: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Avatar URL</label>
                        <Input value={testForm.avatarUrl} onChange={e => setTestForm({...testForm, avatarUrl: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Role (ID)</label>
                        <Input required value={testForm.roleId} onChange={e => setTestForm({...testForm, roleId: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Role (EN)</label>
                        <Input value={testForm.roleEn} onChange={e => setTestForm({...testForm, roleEn: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Content (ID)</label>
                      <Textarea required value={testForm.contentId} onChange={e => setTestForm({...testForm, contentId: e.target.value})} className="min-h-[100px] rounded-xl bg-background/50" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Content (EN)</label>
                      <Textarea value={testForm.contentEn} onChange={e => setTestForm({...testForm, contentEn: e.target.value})} className="min-h-[100px] rounded-xl bg-background/50" />
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold bg-pink-500 hover:bg-pink-600 shadow-xl shadow-pink-500/20">Add Testimonial</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-xl flex items-center gap-2"><Quote className="h-5 w-5 text-pink-500" /> Feedbacks</h3>
                <Badge variant="secondary" className="rounded-lg">{testimonials.length}</Badge>
              </div>
              <div className="grid gap-4">
                {testimonials.map(t => (
                  <Card key={t.id} className="p-4 flex gap-4 items-center group bg-card hover:bg-pink-500/5 transition-colors rounded-2xl border-none shadow-sm">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border shadow-inner">
                      <img src={t.avatarUrl || `https://picsum.photos/seed/${t.id}/100/100`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-sm">{t.name}</h4>
                      <p className="text-[10px] text-muted-foreground truncate">{t.roleId}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteTestimonial(t.id)} className="text-destructive hover:bg-destructive/10 rounded-lg shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Card className="rounded-[2.5rem] shadow-2xl border-none overflow-hidden bg-card">
              <CardHeader className="bg-gradient-to-r from-slate-800 to-transparent p-10 border-b">
                <CardTitle className="flex items-center gap-3 text-2xl text-white"><Settings className="text-primary" /> Key Performance Metrics</CardTitle>
                <p className="text-slate-400 text-sm font-medium">Update your counter stats displayed on the home page</p>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Projects Done</label>
                    <Input value={statsData.completedProjects} onChange={e => setStatsData({...statsData, completedProjects: e.target.value})} className="h-14 rounded-2xl bg-background/50 text-xl font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Years Experience</label>
                    <Input value={statsData.yearsExperience} onChange={e => setStatsData({...statsData, yearsExperience: e.target.value})} className="h-14 rounded-2xl bg-background/50 text-xl font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Technologies Mastered</label>
                    <Input value={statsData.techMastered} onChange={e => setStatsData({...statsData, techMastered: e.target.value})} className="h-14 rounded-2xl bg-background/50 text-xl font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Client Satisfaction (%)</label>
                    <Input value={statsData.clientSatisfaction} onChange={e => setStatsData({...statsData, clientSatisfaction: e.target.value})} className="h-14 rounded-2xl bg-background/50 text-xl font-bold" />
                  </div>
                </div>
                <Button onClick={() => {updateStats(statsData); toast({title: "Stats Saved"});}} className="w-full h-16 rounded-[2rem] text-xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-2xl shadow-slate-900/20">Apply Stats Update</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="rounded-[2.5rem] shadow-2xl border-none overflow-hidden bg-card">
              <CardHeader className="bg-gradient-to-r from-indigo-600/10 to-transparent p-10 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-2xl"><UserCircle className="text-indigo-600" /> Professional Identity</CardTitle>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Refine your public persona and bio</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                       translateSingle(profileData.roleId, 'en', (v) => setProfileData(p => ({...p, roleEn: v})));
                       translateSingle(profileData.aboutTextId, 'en', (v) => setProfileData(p => ({...p, aboutTextEn: v})));
                       translateSingle(profileData.heroTitleId, 'en', (v) => setProfileData(p => ({...p, heroTitleEn: v})));
                       translateSingle(profileData.heroSubtitleId, 'en', (v) => setProfileData(p => ({...p, heroSubtitleEn: v})));
                    }} disabled={isTranslating} className="rounded-xl gap-2 border-indigo-600/20 hover:bg-indigo-600/5">
                    {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                    Translate Bio
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Display Name</label>
                    <Input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Role Title (ID)</label>
                    <Input value={profileData.roleId} onChange={e => setProfileData({...profileData, roleId: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Role Title (EN)</label>
                  <Input value={profileData.roleEn} onChange={e => setProfileData({...profileData, roleEn: e.target.value})} className="h-12 rounded-xl bg-background/50" />
                </div>

                <div className="grid md:grid-cols-2 gap-8 border-t pt-8">
                   <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Hero Title (ID)</label>
                    <Input value={profileData.heroTitleId} onChange={e => setProfileData({...profileData, heroTitleId: e.target.value})} className="h-12 rounded-xl bg-background/50 font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Hero Title (EN)</label>
                    <Input value={profileData.heroTitleEn} onChange={e => setProfileData({...profileData, heroTitleEn: e.target.value})} className="h-12 rounded-xl bg-background/50 font-bold" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Hero Subtitle (ID)</label>
                    <Textarea value={profileData.heroSubtitleId} onChange={e => setProfileData({...profileData, heroSubtitleId: e.target.value})} className="h-20 rounded-xl bg-background/50" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Hero Subtitle (EN)</label>
                    <Textarea value={profileData.heroSubtitleEn} onChange={e => setProfileData({...profileData, heroSubtitleEn: e.target.value})} className="h-20 rounded-xl bg-background/50" />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 border-t pt-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">About Bio (ID)</label>
                    <Textarea value={profileData.aboutTextId} onChange={e => setProfileData({...profileData, aboutTextId: e.target.value})} className="min-h-[150px] rounded-2xl bg-background/50 leading-relaxed" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">About Bio (EN)</label>
                    <Textarea value={profileData.aboutTextEn} onChange={e => setProfileData({...profileData, aboutTextEn: e.target.value})} className="min-h-[150px] rounded-2xl bg-background/50 leading-relaxed" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Profile Photo URL</label>
                  <div className="flex gap-4">
                    <Input value={profileData.profileImageUrl} onChange={e => setProfileData({...profileData, profileImageUrl: e.target.value})} className="h-12 rounded-xl bg-background/50 flex-1" />
                    <div className="w-12 h-12 rounded-xl overflow-hidden border bg-muted shrink-0 shadow-sm">
                      <img src={profileData.profileImageUrl} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
                
                <Button onClick={() => {updateProfile(profileData); toast({title: "Profile Updated"});}} className="w-full h-16 rounded-[2rem] text-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20">Update Personal Profile</Button>
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
