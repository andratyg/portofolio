"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectStoreProvider, useProjectStore } from '@/components/ProjectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Sparkles, LogOut, ArrowLeft, Image as ImageIcon, Laptop } from 'lucide-react';
import { generatePortfolioDescriptionSuggestion } from '@/ai/flows/generate-portfolio-description-suggestion';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/lib/types';

function AdminContent() {
  const { projects, addProject, deleteProject } = useProjectStore();
  const router = useRouter();
  const { toast } = useToast();
  const [isAIThinking, setIsAIThinking] = useState(false);
  
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

  useEffect(() => {
    const auth = sessionStorage.getItem('karyapro-auth');
    if (!auth) router.push('/admin/login');
  }, [router]);

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
      toast({ title: "AI Generated!", description: "Description suggested based on your input." });
    } catch (error) {
      toast({ title: "AI Error", description: "Could not generate description at this time.", variant: "destructive" });
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: Date.now().toString(),
      ...formData,
      technologies: formData.technologies.split(',').map(s => s.trim()),
      featured: false
    };
    addProject(newProject);
    toast({ title: "Success", description: "Project added to your portfolio!" });
    setFormData({
      title: '', type: 'web', shortDescription: '', fullDescription: '',
      technologies: '', problemSolved: '', process: '', results: '',
      imageUrl: '', demoUrl: ''
    });
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

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-3xl shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground p-8">
              <CardTitle className="text-2xl font-bold font-headline flex items-center gap-3">
                <Plus className="h-6 w-6" /> Add New Project
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    <label className="text-sm font-semibold">Long Description</label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleGenerateAI}
                      disabled={isAIThinking}
                      className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
                    >
                      <Sparkles className="h-4 w-4" /> {isAIThinking ? 'Thinking...' : 'AI Suggestion'}
                    </Button>
                  </div>
                  <Textarea 
                    required 
                    value={formData.fullDescription} 
                    onChange={e => setFormData({...formData, fullDescription: e.target.value})}
                    placeholder="Describe the journey and impact of this project..." 
                    className="min-h-[150px]"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Technologies (Comma separated)</label>
                    <Input required value={formData.technologies} onChange={e => setFormData({...formData, technologies: e.target.value})} placeholder="React, Tailwind, Node.js" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Project Image URL</label>
                    <Input required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://picsum.photos/..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Problem Solved</label>
                  <Input value={formData.problemSolved} onChange={e => setFormData({...formData, problemSolved: e.target.value})} placeholder="What challenge did this solve?" />
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold mt-4">Publish Project</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold font-headline flex items-center gap-2 px-2">
             <Laptop className="h-5 w-5" /> Current Portfolio
          </h2>
          <div className="space-y-4">
            {projects.map(project => (
              <Card key={project.id} className="group hover:border-primary transition-colors">
                <CardContent className="p-4 flex gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={project.imageUrl} className="object-cover w-full h-full" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{project.title}</h3>
                    <Badge variant="secondary" className="mt-1 text-[10px]">{project.type}</Badge>
                    <div className="flex gap-2 mt-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProject(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-3xl">
                No projects yet.
              </div>
            )}
          </div>
        </div>
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
