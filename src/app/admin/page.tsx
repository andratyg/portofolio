"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectStoreProvider, useProjectStore } from '@/components/ProjectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Sparkles, LogOut, ArrowLeft, Laptop, Award, Settings, Save, UserCircle } from 'lucide-react';
import { generatePortfolioDescriptionSuggestion } from '@/ai/flows/generate-portfolio-description-suggestion';
import { generateCertificateDescription } from '@/ai/flows/generate-certificate-description';
import { useToast } from '@/hooks/use-toast';
import { Project, Certificate, ProfileData } from '@/lib/types';

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
  const [isCertAIThinking, setIsCertAIThinking] = useState(false);
  
  // Forms state
  const [projectForm, setProjectForm] = useState({
    title: '',
    type: 'web' as 'web' | 'ui' | 'backend',
    shortDescription: '',
    fullDescription: '',
    technologies: '',
    imageUrl: '',
    demoUrl: ''
  });

  const [certForm, setCertForm] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    year: '',
    issuer: '',
    validUntil: '',
    imageUrl: ''
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

  const handleGenerateAI = async () => {
    if (!projectForm.title) {
      toast({ title: "Title Required", description: "Please enter a title.", variant: "destructive" });
      return;
    }
    setIsAIThinking(true);
    try {
      const result = await generatePortfolioDescriptionSuggestion({
        title: projectForm.title,
        projectType: projectForm.type,
        technologiesUsed: projectForm.technologies.split(',').map(s => s.trim()),
      });
      setProjectForm(prev => ({ ...prev, fullDescription: result.descriptionSuggestion }));
    } catch (e) {
      toast({ title: "AI Error", variant: "destructive" });
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleGenerateCertAI = async () => {
    if (!certForm.title || !certForm.issuer) {
      toast({ title: "Details Required", variant: "destructive" });
      return;
    }
    setIsCertAIThinking(true);
    try {
      const result = await generateCertificateDescription({
        title: certForm.title,
        issuer: certForm.issuer,
      });
      setCertForm(prev => ({ ...prev, fullDescription: result.descriptionSuggestion }));
    } catch (e) {
      toast({ title: "AI Error", variant: "destructive" });
    } finally {
      setIsCertAIThinking(false);
    }
  };

  const submitProject = (e: React.FormEvent) => {
    e.preventDefault();
    addProject({
      ...projectForm,
      id: Date.now().toString(),
      technologies: projectForm.technologies.split(',').map(s => s.trim()),
      problemSolved: '', process: '', results: ''
    } as any);
    toast({ title: "Project Added" });
    setProjectForm({ title: '', type: 'web', shortDescription: '', fullDescription: '', technologies: '', imageUrl: '', demoUrl: '' });
  };

  const submitCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    addCertificate({ ...certForm, id: Date.now().toString() });
    toast({ title: "Certificate Added" });
    setCertForm({ title: '', shortDescription: '', fullDescription: '', year: '', issuer: '', validUntil: '', imageUrl: '' });
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
              <TabsTrigger value="projects" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Projects</TabsTrigger>
              <TabsTrigger value="certificates" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Certs</TabsTrigger>
              <TabsTrigger value="stats" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Stats</TabsTrigger>
              <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Profile</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="projects" className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 rounded-3xl shadow-lg border-none">
              <CardHeader className="bg-primary text-primary-foreground p-8 rounded-t-3xl">
                <CardTitle className="flex items-center gap-3"><Plus /> Add Project</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <form onSubmit={submitProject} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Title</label>
                      <Input required value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Category</label>
                      <select className="w-full h-10 px-3 rounded-md border" value={projectForm.type} onChange={e => setProjectForm({...projectForm, type: e.target.value as any})}>
                        <option value="web">Web</option>
                        <option value="ui">UI/UX</option>
                        <option value="backend">Backend</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold">Description</label>
                      <Button type="button" variant="outline" size="sm" onClick={handleGenerateAI} disabled={isAIThinking} className="gap-2">
                        <Sparkles className="h-4 w-4" /> {isAIThinking ? 'AI Working...' : 'AI Suggest'}
                      </Button>
                    </div>
                    <Textarea required value={projectForm.fullDescription} onChange={e => setProjectForm({...projectForm, fullDescription: e.target.value})} className="min-h-[120px]" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input placeholder="Technologies (comma separated)" value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} />
                    <Input placeholder="Demo URL" value={projectForm.demoUrl} onChange={e => setProjectForm({...projectForm, demoUrl: e.target.value})} />
                  </div>
                  <Input placeholder="Image URL" value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} />
                  <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold">Add Project</Button>
                </form>
              </CardContent>
            </Card>
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2 px-2"><Laptop className="h-5 w-5" /> Active Projects</h3>
              {projects.map(p => (
                <Card key={p.id} className="p-4 flex gap-4 items-center">
                  <img src={p.imageUrl} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0"><h4 className="font-bold truncate">{p.title}</h4><Badge variant="secondary" className="text-[10px]">{p.type}</Badge></div>
                  <Button variant="ghost" size="icon" onClick={() => deleteProject(p.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 rounded-3xl shadow-lg border-none">
              <CardHeader className="bg-accent text-accent-foreground p-8 rounded-t-3xl">
                <CardTitle className="flex items-center gap-3"><Award /> Add Certificate</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <form onSubmit={submitCertificate} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input required placeholder="Cert Title" value={certForm.title} onChange={e => setCertForm({...certForm, title: e.target.value})} />
                    <Input required placeholder="Issuer" value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateCertAI} disabled={isCertAIThinking} className="gap-2">
                      <Sparkles className="h-4 w-4" /> {isCertAIThinking ? 'AI Working...' : 'AI Suggest'}
                    </Button>
                    <Textarea required placeholder="Full Description" value={certForm.fullDescription} onChange={e => setCertForm({...certForm, fullDescription: e.target.value})} />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input placeholder="Short Desc" value={certForm.shortDescription} onChange={e => setCertForm({...certForm, shortDescription: e.target.value})} />
                    <Input placeholder="Year" value={certForm.year} onChange={e => setCertForm({...certForm, year: e.target.value})} />
                    <Input placeholder="Valid Until" value={certForm.validUntil} onChange={e => setCertForm({...certForm, validUntil: e.target.value})} />
                  </div>
                  <Input placeholder="Image URL" value={certForm.imageUrl} onChange={e => setCertForm({...certForm, imageUrl: e.target.value})} />
                  <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold bg-accent hover:bg-accent/90">Add Certificate</Button>
                </form>
              </CardContent>
            </Card>
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2 px-2"><Award className="h-5 w-5" /> Your Certs</h3>
              {certificates.map(c => (
                <Card key={c.id} className="p-4 flex gap-4 items-center">
                  <img src={c.imageUrl} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0"><h4 className="font-bold truncate">{c.title}</h4><p className="text-xs text-muted-foreground">{c.issuer}</p></div>
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
                <CardTitle className="flex items-center gap-3"><UserCircle /> About Me Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-sm font-bold">Full Name</label><Input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-sm font-bold">Headline Role</label><Input value={profileData.role} onChange={e => setProfileData({...profileData, role: e.target.value})} /></div>
                </div>
                <div className="space-y-2"><label className="text-sm font-bold">Bio / About Text</label><Textarea value={profileData.aboutText} onChange={e => setProfileData({...profileData, aboutText: e.target.value})} className="min-h-[200px]" /></div>
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
