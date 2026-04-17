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
import { Plus, Trash2, Sparkles, LogOut, ArrowLeft, Laptop, Award, Settings, Save } from 'lucide-react';
import { generatePortfolioDescriptionSuggestion } from '@/ai/flows/generate-portfolio-description-suggestion';
import { generateCertificateDescription } from '@/ai/flows/generate-certificate-description';
import { useToast } from '@/hooks/use-toast';
import { Project, Certificate } from '@/lib/types';

function AdminContent() {
  const { 
    projects, addProject, deleteProject, 
    certificates, addCertificate, deleteCertificate,
    stats, updateStats
  } = useProjectStore();
  
  const router = useRouter();
  const { toast } = useToast();
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isCertAIThinking, setIsCertAIThinking] = useState(false);
  
  // New Project Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'web' as 'web' | 'ui' | 'backend',
    shortDescription: '',
    fullDescription: '',
    technologies: '',
    problemSolved: '',
    process: '',
    results: '',
    imageUrl: '',
    demoUrl: ''
  });

  // New Certificate Form State
  const [certData, setCertData] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    year: '',
    issuer: '',
    validUntil: '',
    imageUrl: ''
  });

  // Stats Settings State
  const [statsData, setStatsData] = useState(stats);

  useEffect(() => {
    const auth = sessionStorage.getItem('karyapro-auth');
    if (!auth) router.push('/admin/login');
  }, [router]);

  useEffect(() => {
    setStatsData(stats);
  }, [stats]);

  const handleLogout = () => {
    sessionStorage.removeItem('karyapro-auth');
    router.push('/');
  };

  const handleGenerateAI = async () => {
    if (!formData.title) {
      toast({ title: "Title Required", description: "Please enter a project title first.", variant: "destructive" });
      return;
    }

    setIsAIThinking(true);
    try {
      const result = await generatePortfolioDescriptionSuggestion({
        title: formData.title,
        projectType: formData.type,
        technologiesUsed: formData.technologies.split(',').map(s => s.trim()),
        problemSolved: formData.problemSolved,
      });
      setFormData(prev => ({ ...prev, fullDescription: result.descriptionSuggestion }));
      toast({ title: "AI Generated!", description: "Description suggested!" });
    } catch (error) {
      toast({ title: "AI Error", description: "Could not generate description.", variant: "destructive" });
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleGenerateCertAI = async () => {
    if (!certData.title || !certData.issuer) {
      toast({ title: "Details Required", description: "Please enter title and issuer.", variant: "destructive" });
      return;
    }

    setIsCertAIThinking(true);
    try {
      const result = await generateCertificateDescription({
        title: certData.title,
        issuer: certData.issuer,
        shortDescription: certData.shortDescription,
      });
      setCertData(prev => ({ ...prev, fullDescription: result.descriptionSuggestion }));
      toast({ title: "AI Generated!", description: "Certificate description suggested!" });
    } catch (error) {
      toast({ title: "AI Error", description: "Could not generate description.", variant: "destructive" });
    } finally {
      setIsCertAIThinking(false);
    }
  };

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: Date.now().toString(),
      ...formData,
      technologies: formData.technologies.split(',').map(s => s.trim()),
      featured: false
    };
    addProject(newProject);
    toast({ title: "Success", description: "Project added!" });
    setFormData({
      title: '', type: 'web', shortDescription: '', fullDescription: '',
      technologies: '', problemSolved: '', process: '', results: '',
      imageUrl: '', demoUrl: ''
    });
  };

  const handleSubmitCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const newCert: Certificate = {
      id: Date.now().toString(),
      ...certData
    };
    addCertificate(newCert);
    toast({ title: "Success", description: "Certificate added!" });
    setCertData({
      title: '', shortDescription: '', fullDescription: '',
      year: '', issuer: '', validUntil: '', imageUrl: ''
    });
  };

  const handleSaveStats = () => {
    updateStats(statsData);
    toast({ title: "Stats Updated", description: "Portfolio statistics have been updated successfully!" });
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20 theme-transition">
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
            <TabsList className="grid w-full max-w-lg grid-cols-3 h-12 rounded-xl">
              <TabsTrigger value="projects" className="rounded-lg">Projects</TabsTrigger>
              <TabsTrigger value="certificates" className="rounded-lg">Certificates</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg">Stats</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="projects" className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="rounded-3xl shadow-lg border-none overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground p-8">
                  <CardTitle className="text-2xl font-bold font-headline flex items-center gap-3">
                    <Plus className="h-6 w-6" /> Add New Project
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmitProject} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Project Title</label>
                        <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="E.g. Healthcare Mobile App" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Category</label>
                        <select 
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          value={formData.type}
                          onChange={e => setFormData({...formData, type: e.target.value as any})}
                        >
                          <option value="web">Web Development</option>
                          <option value="ui">UI/UX Design</option>
                          <option value="backend">Backend Services</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold">Description</label>
                        <Button type="button" variant="outline" size="sm" onClick={handleGenerateAI} disabled={isAIThinking} className="gap-2">
                          <Sparkles className="h-4 w-4" /> {isAIThinking ? 'AI Working...' : 'AI Suggest'}
                        </Button>
                      </div>
                      <Textarea required value={formData.fullDescription} onChange={e => setFormData({...formData, fullDescription: e.target.value})} placeholder="Project details..." className="min-h-[120px]" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Technologies</label>
                        <Input required value={formData.technologies} onChange={e => setFormData({...formData, technologies: e.target.value})} placeholder="React, Node.js" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Image URL</label>
                        <Input required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold">Publish Project</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-headline flex items-center gap-2 px-2"><Laptop className="h-5 w-5" /> Current Portfolio</h2>
              <div className="space-y-4">
                {projects.map(project => (
                  <Card key={project.id} className="p-4 flex gap-4">
                    <img src={project.imageUrl} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{project.title}</h3>
                      <Badge variant="secondary" className="text-[10px]">{project.type}</Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive ml-auto block" onClick={() => deleteProject(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="rounded-3xl shadow-lg border-none overflow-hidden">
                <CardHeader className="bg-accent text-accent-foreground p-8">
                  <CardTitle className="text-2xl font-bold font-headline flex items-center gap-3">
                    <Award className="h-6 w-6" /> Add New Certificate
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmitCertificate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Title</label>
                        <Input required value={certData.title} onChange={e => setCertData({...certData, title: e.target.value})} placeholder="Certificate Name" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Issuer</label>
                        <Input required value={certData.issuer} onChange={e => setCertData({...certData, issuer: e.target.value})} placeholder="Organization" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold">Detailed Description</label>
                        <Button type="button" variant="outline" size="sm" onClick={handleGenerateCertAI} disabled={isCertAIThinking} className="gap-2 text-accent border-accent/20">
                          <Sparkles className="h-4 w-4" /> {isCertAIThinking ? 'AI Working...' : 'AI Suggest'}
                        </Button>
                      </div>
                      <Textarea required value={certData.fullDescription} onChange={e => setCertData({...certData, fullDescription: e.target.value})} placeholder="What did you learn?" className="min-h-[120px]" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Short Desc</label>
                        <Input required value={certData.shortDescription} onChange={e => setCertData({...certData, shortDescription: e.target.value})} placeholder="Quick summary" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Year</label>
                        <Input required value={certData.year} onChange={e => setCertData({...certData, year: e.target.value})} placeholder="2023" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Valid Until</label>
                        <Input required value={certData.validUntil} onChange={e => setCertData({...certData, validUntil: e.target.value})} placeholder="Expiry date" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Image URL</label>
                      <Input required value={certData.imageUrl} onChange={e => setCertData({...certData, imageUrl: e.target.value})} placeholder="https://..." />
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold bg-accent hover:bg-accent/90">Add Certificate</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-headline flex items-center gap-2 px-2"><Award className="h-5 w-5" /> All Certificates</h2>
              <div className="space-y-4">
                {certificates.map(cert => (
                  <Card key={cert.id} className="p-4 flex gap-4">
                    <img src={cert.imageUrl} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{cert.title}</h3>
                      <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive ml-auto block" onClick={() => deleteCertificate(cert.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="max-w-4xl mx-auto">
            <Card className="rounded-3xl shadow-lg border-none overflow-hidden">
              <CardHeader className="bg-slate-800 text-white p-8">
                <CardTitle className="text-2xl font-bold font-headline flex items-center gap-3">
                  <Settings className="h-6 w-6" /> Portfolio Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Projects Completed</label>
                    <Input value={statsData.completedProjects} onChange={e => setStatsData({...statsData, completedProjects: e.target.value})} className="h-12 text-lg font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Years Experience</label>
                    <Input value={statsData.yearsExperience} onChange={e => setStatsData({...statsData, yearsExperience: e.target.value})} className="h-12 text-lg font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Technologies Mastered</label>
                    <Input value={statsData.techMastered} onChange={e => setStatsData({...statsData, techMastered: e.target.value})} className="h-12 text-lg font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Client Satisfaction (%)</label>
                    <Input value={statsData.clientSatisfaction} onChange={e => setStatsData({...statsData, clientSatisfaction: e.target.value})} className="h-12 text-lg font-bold" />
                  </div>
                </div>
                <div className="mt-10">
                  <Button onClick={handleSaveStats} className="w-full h-14 rounded-2xl text-xl font-bold gap-2 bg-slate-800 hover:bg-slate-700">
                    <Save className="h-6 w-6" /> Save Statistics
                  </Button>
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
