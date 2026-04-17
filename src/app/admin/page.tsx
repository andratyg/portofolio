"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/components/ProjectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Sparkles, LogOut, ArrowLeft, Laptop, Award, Settings, UserCircle, Languages } from 'lucide-react';
import { generatePortfolioDescriptionSuggestion } from '@/ai/flows/generate-portfolio-description-suggestion';
import { generateCertificateDescription } from '@/ai/flows/generate-certificate-description';
import { translateContent } from '@/ai/flows/translate-content';
import { useToast } from '@/hooks/use-toast';
import { ProfileData } from '@/lib/types';

function AdminContent() {
  const { 
    projects, addProject, deleteProject, 
    certificates, addCertificate, deleteCertificate,
    stats, updateStats,
    profile, updateProfile
  } = useProjectStore();
  
  const router = useRouter();
  const { toast } = useToast();
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Forms state
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

  const handleTranslate = async (text: string, targetLang: 'id' | 'en', callback: (val: string) => void) => {
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

  const handleGenerateAI = async () => {
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

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <header className="bg-background border-b h-16 sticky top-0 z-30 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold font-headline">KaryaPro Admin</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive gap-2">
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="projects" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 h-12 rounded-xl bg-card border shadow-sm p-1">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="certificates">Certs</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="projects" className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 rounded-3xl shadow-lg border-none">
              <CardHeader className="bg-primary text-primary-foreground p-8 rounded-t-3xl">
                <CardTitle className="flex items-center gap-3"><Plus /> Add Project</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <form onSubmit={submitProject} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase">Title (Indonesia)</label>
                      <Input required value={projectForm.titleId} onChange={e => setProjectForm({...projectForm, titleId: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-xs font-bold uppercase">Title (English)</label>
                        <Button type="button" variant="ghost" size="xs" onClick={() => handleTranslate(projectForm.titleId, 'en', (v) => setProjectForm(p => ({...p, titleEn: v})))}><Languages className="h-3 w-3 mr-1"/> Translate</Button>
                      </div>
                      <Input value={projectForm.titleEn} onChange={e => setProjectForm({...projectForm, titleEn: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase">Short Desc (ID)</label>
                      <Input value={projectForm.shortDescriptionId} onChange={e => setProjectForm({...projectForm, shortDescriptionId: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-xs font-bold uppercase">Short Desc (EN)</label>
                        <Button type="button" variant="ghost" size="xs" onClick={() => handleTranslate(projectForm.shortDescriptionId, 'en', (v) => setProjectForm(p => ({...p, shortDescriptionEn: v})))}><Languages className="h-3 w-3 mr-1"/> Translate</Button>
                      </div>
                      <Input value={projectForm.shortDescriptionEn} onChange={e => setProjectForm({...projectForm, shortDescriptionEn: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase">Full Description (ID)</label>
                      <Button type="button" variant="outline" size="sm" onClick={handleGenerateAI} disabled={isAIThinking} className="gap-2">
                        <Sparkles className="h-3 w-3" /> AI Generate
                      </Button>
                    </div>
                    <Textarea required value={projectForm.fullDescriptionId} onChange={e => setProjectForm({...projectForm, fullDescriptionId: e.target.value})} className="min-h-[100px]" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-xs font-bold uppercase">Full Description (EN)</label>
                      <Button type="button" variant="ghost" size="xs" onClick={() => handleTranslate(projectForm.fullDescriptionId, 'en', (v) => setProjectForm(p => ({...p, fullDescriptionEn: v})))}><Languages className="h-3 w-3 mr-1"/> Translate</Button>
                    </div>
                    <Textarea value={projectForm.fullDescriptionEn} onChange={e => setProjectForm({...projectForm, fullDescriptionEn: e.target.value})} className="min-h-[100px]" />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2"><label className="text-xs font-bold">Category</label>
                      <select className="w-full h-10 px-3 rounded-md border" value={projectForm.type} onChange={e => setProjectForm({...projectForm, type: e.target.value as any})}>
                        <option value="web">Web</option><option value="ui">UI/UX</option><option value="backend">Backend</option>
                      </select>
                    </div>
                    <div className="space-y-2"><label className="text-xs font-bold">Tech</label>
                      <Input placeholder="Next.js, Tailwind..." value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} />
                    </div>
                    <div className="space-y-2"><label className="text-xs font-bold">Demo URL</label>
                      <Input placeholder="https://..." value={projectForm.demoUrl} onChange={e => setProjectForm({...projectForm, demoUrl: e.target.value})} />
                    </div>
                  </div>
                  <Input placeholder="Image URL" value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} />
                  <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold">Add Project</Button>
                </form>
              </CardContent>
            </Card>
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2 px-2"><Laptop className="h-5 w-5" /> Projects</h3>
              {projects.map(p => (
                <Card key={p.id} className="p-4 flex gap-4 items-center">
                  <img src={p.imageUrl} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0"><h4 className="font-bold truncate">{p.titleId}</h4><Badge variant="secondary" className="text-[10px]">{p.type}</Badge></div>
                  <Button variant="ghost" size="icon" onClick={() => deleteProject(p.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Similar structure for Certificates, Stats, Profile */}
          <TabsContent value="certificates" className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 rounded-3xl shadow-lg border-none">
              <CardHeader className="bg-accent text-accent-foreground p-8 rounded-t-3xl">
                <CardTitle className="flex items-center gap-3"><Award /> Add Certificate</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <form onSubmit={submitCertificate} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input required placeholder="Judul (ID)" value={certForm.titleId} onChange={e => setCertForm({...certForm, titleId: e.target.value})} />
                    <Input placeholder="Title (EN)" value={certForm.titleEn} onChange={e => setCertForm({...certForm, titleEn: e.target.value})} />
                  </div>
                  <Textarea required placeholder="Deskripsi Lengkap (ID)" value={certForm.fullDescriptionId} onChange={e => setCertForm({...certForm, fullDescriptionId: e.target.value})} />
                  <Textarea placeholder="Full Description (EN)" value={certForm.fullDescriptionEn} onChange={e => setCertForm({...certForm, fullDescriptionEn: e.target.value})} />
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input placeholder="Issuer" value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} />
                    <Input placeholder="Year" value={certForm.year} onChange={e => setCertForm({...certForm, year: e.target.value})} />
                    <Input placeholder="Valid Until" value={certForm.validUntil} onChange={e => setCertForm({...certForm, validUntil: e.target.value})} />
                  </div>
                  <Input placeholder="Image URL" value={certForm.imageUrl} onChange={e => setCertForm({...certForm, imageUrl: e.target.value})} />
                  <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold bg-accent hover:bg-accent/90">Add Certificate</Button>
                </form>
              </CardContent>
            </Card>
            <div className="space-y-4">
              {certificates.map(c => (
                <Card key={c.id} className="p-4 flex gap-4 items-center">
                  <img src={c.imageUrl} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0"><h4 className="font-bold truncate">{c.titleId}</h4><p className="text-xs text-muted-foreground">{c.issuer}</p></div>
                  <Button variant="ghost" size="icon" onClick={() => deleteCertificate(c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="max-w-4xl mx-auto">
             <Card className="rounded-3xl shadow-lg border-none overflow-hidden">
              <CardHeader className="bg-slate-800 text-white p-8">
                <CardTitle className="flex items-center gap-3"><Settings /> Counter Stats</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-sm font-bold">Projects Done</label><Input value={statsData.completedProjects} onChange={e => setStatsData({...statsData, completedProjects: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-sm font-bold">Years Exp</label><Input value={statsData.yearsExperience} onChange={e => setStatsData({...statsData, yearsExperience: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-sm font-bold">Tech Mastered</label><Input value={statsData.techMastered} onChange={e => setStatsData({...statsData, techMastered: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-sm font-bold">Satisfaction (%)</label><Input value={statsData.clientSatisfaction} onChange={e => setStatsData({...statsData, clientSatisfaction: e.target.value})} /></div>
                </div>
                <Button onClick={() => {updateStats(statsData); toast({title: "Stats Saved"});}} className="w-full h-14 rounded-2xl text-xl font-bold bg-slate-800 hover:bg-slate-700">Save Stats</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="max-w-4xl mx-auto">
            <Card className="rounded-3xl shadow-lg border-none overflow-hidden">
              <CardHeader className="bg-indigo-600 text-white p-8">
                <CardTitle className="flex items-center gap-3"><UserCircle /> Profile Editor</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-sm font-bold">Name</label><Input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} /></div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Role (ID)</label><Input value={profileData.roleId} onChange={e => setProfileData({...profileData, roleId: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2"><label className="text-sm font-bold">About (ID)</label><Textarea value={profileData.aboutTextId} onChange={e => setProfileData({...profileData, aboutTextId: e.target.value})} className="min-h-[120px]" /></div>
                
                <div className="pt-4 border-t space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-indigo-600">English Version (AI Powered)</label>
                    <Button variant="ghost" size="sm" onClick={() => {
                       handleTranslate(profileData.roleId, 'en', (v) => setProfileData(p => ({...p, roleEn: v})));
                       handleTranslate(profileData.aboutTextId, 'en', (v) => setProfileData(p => ({...p, aboutTextEn: v})));
                    }}><Languages className="h-4 w-4 mr-1"/> Translate All</Button>
                  </div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase">Role (EN)</label><Input value={profileData.roleEn} onChange={e => setProfileData({...profileData, roleEn: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase">About (EN)</label><Textarea value={profileData.aboutTextEn} onChange={e => setProfileData({...profileData, aboutTextEn: e.target.value})} className="min-h-[120px]" /></div>
                </div>
                
                <div className="space-y-2"><label className="text-sm font-bold">Profile Image URL</label><Input value={profileData.profileImageUrl} onChange={e => setProfileData({...profileData, profileImageUrl: e.target.value})} /></div>
                <Button onClick={() => {updateProfile(profileData); toast({title: "Profile Updated"});}} className="w-full h-14 rounded-2xl text-xl font-bold bg-indigo-600 hover:bg-indigo-500">Update Profile</Button>
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
