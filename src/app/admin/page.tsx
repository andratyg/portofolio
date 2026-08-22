"use client"

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore, ProjectStoreProvider } from '@/stores/ProjectStore';
import { useContentStore } from '@/stores/ContentStore';
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
  Terminal, Image as ImageIcon, Globe, Share2, BarChart3, Zap, FileText, ExternalLink, Star, Edit,
  BookOpen, Tag, Calendar, Clock, Sparkles, Link as LinkIcon, Check, Copy, MousePointerClick
} from 'lucide-react';
import { translateContent } from '@/ai/flows/translate-content';
import { generatePortfolioDescriptionSuggestion } from '@/ai/flows/generate-portfolio-description-suggestion';
import { generateCertificateDescription } from '@/ai/flows/generate-certificate-description';
import { AIAdvisorPanel } from '@/components/admin/AIAdvisorPanel';
import { useToast } from '@/hooks/use-toast';
import { ProfileData, Project, Certificate, Experience, PortfolioStats, TechSkill, BlogPost, ShortLink } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';

function AdminContent() {
  const { 
    projects, addProject, deleteProject, setFeaturedProject, 
    certificates, addCertificate, deleteCertificate,
    experiences, addExperience, deleteExperience,
    blogs, addBlog, deleteBlog,
    shortLinks, addShortLink, deleteShortLink,
    messages, deleteMessage,
    profile, updateProfileAndStats,
    stats,
    techSkills, addTechSkill, deleteTechSkill,
    backupData, restoreData,
    isLoading: storeLoading
  } = useProjectStore();
  
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  
  const [activeTab, setActiveTab] = useState<string>('advisor');
  const [isGeneratingProjectDesc, setIsGeneratingProjectDesc] = useState(false);
  const [isGeneratingCertDesc, setIsGeneratingCertDesc] = useState(false);
  const [isTranslating, setIsTranslating] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const initialTechSkillState: TechSkill = {
    id: '', name: '', icon: '', level: 50, color: 'from-blue-400 to-blue-600', category: 'Frontend'
  };

  const initialBlogState = {
    titleId: '', titleEn: '', slug: '',
    summaryId: '', summaryEn: '',
    contentId: '', contentEn: '',
    coverImage: '', tags: '',
    author: 'Nara Andra Tyaga',
    readingTime: '3 min read',
    featured: false
  };

  const initialShortLinkState = {
    slug: '',
    originalUrl: '',
    title: '',
    description: '',
    isActive: true,
  };

  const [projectForm, setProjectForm] = useState(initialProjectState);
  const [certForm, setCertForm] = useState(initialCertState);
  const [journeyForm, setJourneyForm] = useState(initialJourneyState);
  const [techSkillForm, setTechSkillForm] = useState(initialTechSkillState);
  const [blogForm, setBlogForm] = useState(initialBlogState);
  const [shortLinkForm, setShortLinkForm] = useState(initialShortLinkState);
  const [editingTechSkillId, setEditingTechSkillId] = useState<string | null>(null);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editingShortLinkId, setEditingShortLinkId] = useState<string | null>(null);
  const [copiedShortSlug, setCopiedShortSlug] = useState<string | null>(null);
  const [profileFormData, setProfileFormData] = useState<ProfileData>(profile);
  const [statsFormData, setStatsFormData] = useState<PortfolioStats>(stats);
  const contentStore = useContentStore();
  const [contentFormData, setContentFormData] = useState({
    portfolioTitleId: contentStore.portfolioTitleId,
    portfolioTitleEn: contentStore.portfolioTitleEn,
    portfolioSubtitleId: contentStore.portfolioSubtitleId,
    portfolioSubtitleEn: contentStore.portfolioSubtitleEn,
    certificatesTitleId: contentStore.certificatesTitleId,
    certificatesTitleEn: contentStore.certificatesTitleEn,
    certificatesSubtitleId: contentStore.certificatesSubtitleId,
    certificatesSubtitleEn: contentStore.certificatesSubtitleEn
  });

  useEffect(() => { if (profile) setProfileFormData(profile); }, [profile]);
  useEffect(() => { if (stats) setStatsFormData(stats); }, [stats]);
  useEffect(() => {
    setContentFormData({
      portfolioTitleId: contentStore.portfolioTitleId,
      portfolioTitleEn: contentStore.portfolioTitleEn,
      portfolioSubtitleId: contentStore.portfolioSubtitleId,
      portfolioSubtitleEn: contentStore.portfolioSubtitleEn,
      certificatesTitleId: contentStore.certificatesTitleId,
      certificatesTitleEn: contentStore.certificatesTitleEn,
      certificatesSubtitleId: contentStore.certificatesSubtitleId,
      certificatesSubtitleEn: contentStore.certificatesSubtitleEn
    });
  }, [contentStore]);

  const handleAITranslate = async (formType: string, data: any, setter: Function, direction: 'id-to-en' | 'en-to-id' = 'id-to-en') => {
    setIsTranslating(formType);
    try {
      const updated = { ...data };
      const sourceSuffix = direction === 'id-to-en' ? 'Id' : 'En';
      const targetSuffix = direction === 'id-to-en' ? 'En' : 'Id';
      const targetLang = direction === 'id-to-en' ? 'en' : 'id' as 'en' | 'id';
      
      const fieldsToTranslate = Object.keys(data).filter(key => key.endsWith(sourceSuffix));
      
      const translationResults = await Promise.all(
        fieldsToTranslate.map(async (sourceField) => {
          const targetField = sourceField.replace(sourceSuffix, targetSuffix);
          if (data[sourceField] && typeof data[sourceField] === 'string' && data[sourceField].trim() !== '') {
            try {
              const res = await translateContent({ text: data[sourceField], targetLang });
              return { field: targetField, text: res.translatedText };
            } catch (err) {
              console.error(`Gagal menerjemahkan kolom ${sourceField}:`, err);
              return null;
            }
          }
          return null;
        })
      );

      translationResults.forEach(result => {
        if (result) updated[result.field] = result.text;
      });

      setter(updated);
      toast({ title: "Sinkronisasi AI Berhasil", description: "Seluruh konten telah diterjemahkan secara paralel." });
    } catch (e) {
      console.error("AI Sync Error:", e);
      toast({ variant: "destructive", title: "Gagal Sinkronisasi AI", description: "Terjadi kesalahan pada layanan kecerdasan buatan." });
    } finally {
      setIsTranslating(null);
    }
  };

  const handleGenerateProjectDescription = async () => {
    if (!projectForm.titleId.trim()) {
      toast({ variant: "destructive", title: "Judul Proyek Diperlukan", description: "Masukkan nama/judul proyek terlebih dahulu." });
      return;
    }
    setIsGeneratingProjectDesc(true);
    try {
      const existingSummary = projects
        .filter(p => p.id !== editingProjectId)
        .slice(0, 5)
        .map(p => `- ${p.titleId} (${p.type}): ${(p.technologies || []).join(', ')}`)
        .join('\n');
      const profileSummary = `${profile?.name || 'Nara Andra Tyaga'} - ${profile?.roleId || 'Full-Stack Developer'} (${profile?.roleEn || 'Full-Stack Developer'}). Bio: ${profile?.aboutMeId || ''}. Top skills: ${techSkills.slice(0, 6).map(s => s.name).join(', ')}`;

      const techArray = typeof projectForm.technologies === 'string'
        ? projectForm.technologies.split(',').map(s => s.trim()).filter(Boolean)
        : (projectForm.technologies || []);

      const res = await generatePortfolioDescriptionSuggestion({
        title: projectForm.titleId,
        projectType: projectForm.type,
        technologiesUsed: techArray.length > 0 ? techArray : ['Next.js', 'React', 'TypeScript'],
        problemSolved: projectForm.problemId || undefined,
        keyFeatures: projectForm.solutionId || undefined,
        existingProjectsContext: existingSummary,
        developerProfileContext: profileSummary,
      });

      if (res.descriptionSuggestion) {
        setProjectForm(prev => ({
          ...prev,
          solutionId: prev.solutionId ? `${prev.solutionId}\n\n${res.descriptionSuggestion}` : res.descriptionSuggestion
        }));
        toast({ title: "Saran Deskripsi AI Berhasil", description: "Deskripsi konsisten telah disisipkan ke solusi strategis proyek." });
      }
    } catch (err: any) {
      console.error("Generate project desc error:", err);
      toast({ variant: "destructive", title: "Gagal Menghasilkan Deskripsi", description: err.message });
    } finally {
      setIsGeneratingProjectDesc(false);
    }
  };

  const handleGenerateCertDescription = async () => {
    if (!certForm.titleId.trim()) {
      toast({ variant: "destructive", title: "Judul Sertifikat Diperlukan", description: "Masukkan judul sertifikat terlebih dahulu." });
      return;
    }
    setIsGeneratingCertDesc(true);
    try {
      const existingCertsSummary = certificates
        .filter(c => c.id !== editingCertId)
        .slice(0, 5)
        .map(c => `- ${c.titleId} (${c.issuer}, ${c.year})`)
        .join('\n');
      const profileSummary = `${profile?.name || 'Nara Andra Tyaga'} - ${profile?.roleId || 'Full-Stack Developer'} (${profile?.roleEn || 'Full-Stack Developer'}). Skills: ${techSkills.slice(0, 6).map(s => s.name).join(', ')}`;

      const res = await generateCertificateDescription({
        title: certForm.titleId,
        issuer: certForm.issuer || 'Lembaga Sertifikasi',
        shortDescription: certForm.shortDescriptionId || undefined,
        existingCertificatesContext: existingCertsSummary,
        developerProfileContext: profileSummary,
      });

      if (res.descriptionSuggestion) {
        setCertForm(prev => ({
          ...prev,
          fullDescriptionId: res.descriptionSuggestion
        }));
        toast({ title: "Deskripsi Kredensial AI Berhasil", description: "Deskripsi mendalam dengan konteks portofolio telah digenerate." });
      }
    } catch (err: any) {
      console.error("Generate cert desc error:", err);
      toast({ variant: "destructive", title: "Gagal Menghasilkan Deskripsi", description: err.message });
    } finally {
      setIsGeneratingCertDesc(false);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileAndStats(profileFormData, statsFormData);
    toast({ title: "Profil Berhasil Diperbarui" });
  };
  
  const handleContentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contentStore.setContent(contentFormData);
    toast({ title: "Konten Berhasil Diperbarui" });
  };

  const handleTechSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skillData = { ...techSkillForm };
    if (!editingTechSkillId) skillData.id = Date.now().toString();
    else skillData.id = editingTechSkillId;
    addTechSkill(skillData as any);
    setTechSkillForm(initialTechSkillState);
    setEditingTechSkillId(null);
    toast({ title: editingTechSkillId ? "Skill Diperbarui" : "Skill Ditambahkan" });
  };

  const handleBlogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const blogSlug = (blogForm.slug && blogForm.slug.trim())
      ? blogForm.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
      : (blogForm.titleId || 'post').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') || `post-${Date.now()}`;

    const tagsArray = typeof blogForm.tags === 'string'
      ? blogForm.tags.split(',').map(s => s.trim()).filter(Boolean)
      : (blogForm.tags || []);

    const blogData: BlogPost = {
      id: editingBlogId || Date.now().toString(),
      slug: blogSlug,
      titleId: blogForm.titleId,
      titleEn: blogForm.titleEn || blogForm.titleId,
      summaryId: blogForm.summaryId,
      summaryEn: blogForm.summaryEn || blogForm.summaryId,
      contentId: blogForm.contentId,
      contentEn: blogForm.contentEn || blogForm.contentId,
      coverImage: blogForm.coverImage || '',
      tags: tagsArray.length > 0 ? tagsArray : ['Tech'],
      author: blogForm.author || 'Nara Andra Tyaga',
      publishedAt: editingBlogId ? (blogs.find(b => b.id === editingBlogId)?.publishedAt || new Date().toISOString()) : new Date().toISOString(),
      readingTime: blogForm.readingTime || '3 min read',
      featured: blogForm.featured,
      updatedAt: new Date().toISOString(),
    };

    addBlog(blogData);
    setBlogForm(initialBlogState);
    setEditingBlogId(null);
    toast({ title: editingBlogId ? "Artikel Berhasil Diperbarui" : "Artikel Berhasil Dipublikasikan" });
  };

  const startEditTechSkill = (s: TechSkill) => {
    setEditingTechSkillId(s.id);
    setTechSkillForm(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 1 * 1024 * 1024) { // 1MB size limit
      toast({ 
        variant: "destructive", 
        title: "Berkas Terlalu Besar", 
        description: "Ukuran maksimal berkas adalah 1MB. Harap kompres gambar Anda."
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setter(url);
    };
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
    setCertForm({ ...c, credentialUrl: c.credentialUrl || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditJourney = (e: Experience) => {
    setEditingJourneyId(e.id);
    setJourneyForm({ ...e });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditBlog = (b: BlogPost) => {
    setEditingBlogId(b.id);
    setBlogForm({
      titleId: b.titleId || '',
      titleEn: b.titleEn || '',
      slug: b.slug || '',
      summaryId: b.summaryId || '',
      summaryEn: b.summaryEn || '',
      contentId: b.contentId || '',
      contentEn: b.contentEn || '',
      coverImage: b.coverImage || '',
      tags: Array.isArray(b.tags) ? b.tags.join(', ') : (b.tags || ''),
      author: b.author || 'Nara Andra Tyaga',
      readingTime: b.readingTime || '3 min read',
      featured: !!b.featured
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProjectId(null); setEditingCertId(null); setEditingJourneyId(null); setEditingTechSkillId(null); setEditingBlogId(null); setEditingShortLinkId(null);
    setProjectForm(initialProjectState); setCertForm(initialCertState); setJourneyForm(initialJourneyState); setTechSkillForm(initialTechSkillState); setBlogForm(initialBlogState); setShortLinkForm(initialShortLinkState);
  };

  const handleShortLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortLinkForm.slug || !shortLinkForm.originalUrl) {
      toast({ variant: 'destructive', title: 'Data Belum Lengkap', description: 'Slug dan URL Tujuan wajib diisi.' });
      return;
    }
    const cleanSlug = shortLinkForm.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    let finalUrl = shortLinkForm.originalUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }
    addShortLink({
      id: cleanSlug,
      slug: cleanSlug,
      originalUrl: finalUrl,
      title: shortLinkForm.title.trim(),
      description: shortLinkForm.description.trim(),
      isActive: shortLinkForm.isActive,
      clickCount: editingShortLinkId ? (shortLinks.find(s => s.slug === editingShortLinkId)?.clickCount || 0) : 0,
      safetyStatus: 'unverified'
    });
    toast({ title: editingShortLinkId ? 'Short Link Diperbarui' : 'Short Link Dibuat', description: `/l/${cleanSlug}` });
    setShortLinkForm(initialShortLinkState);
    setEditingShortLinkId(null);
  };

  const startEditShortLink = (link: ShortLink) => {
    setEditingShortLinkId(link.slug);
    setShortLinkForm({
      slug: link.slug,
      originalUrl: link.originalUrl,
      title: link.title || '',
      description: link.description || '',
      isActive: link.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyShortLinkUrl = async (slug: string) => {
    const fullUrl = `${window.location.origin}/l/${slug}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedShortSlug(slug);
      toast({ title: 'Tautan Disalin', description: fullUrl });
      setTimeout(() => setCopiedShortSlug(null), 2000);
    } catch {
      toast({ variant: 'destructive', title: 'Gagal Menyalin' });
    }
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('is_admin');
    }
    await signOut(auth);
    router.push('/');
  };

  if (isUserLoading || storeLoading || isAdminLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (user && !adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-lg rounded-[2.5rem] p-10 text-center space-y-8 shadow-2xl border-destructive/20">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
          <h2 className="text-3xl font-black  uppercase">Akses Ditolak</h2>
          <p className="text-muted-foreground text-sm font-medium">Akun Anda tidak memiliki otoritas untuk mengakses infrastruktur admin.</p>
          <Button onClick={handleLogout} variant="destructive" className="w-full h-14 rounded-2xl font-black uppercase">Keluar Sesi</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 relative selection:bg-primary/30">
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground py-2 px-6 flex items-center justify-center gap-2 sticky top-0 z-[60]">
          <WifiOff className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">Sistem Berjalan Offline</span>
        </div>
      )}

      <header className={cn(
        "bg-background/80 backdrop-blur-sm border-b h-16 sm:h-20 sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 transition-transform duration-500",
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 shrink-0"><ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" /></Button>
          <div className="min-w-0">
            <h1 className="text-[9px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 truncate">
              <span className="hidden sm:inline">PUSAT KENDALI KARYAPRO</span><span className="sm:hidden">ADMIN</span> <Badge className="h-5 text-[8px] bg-primary text-primary-foreground font-black px-2 shrink-0">{userRole === 'super' ? 'SUPER' : 'EDITOR'}</Badge>
            </h1>
            <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] sm:tracking-[0.2em] truncate">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="text-foreground hover:bg-muted rounded-xl h-9 sm:h-10 px-2 sm:px-4 text-[10px] font-black uppercase tracking-widest gap-2 shrink-0">
          <LogOut className="h-4 w-4" /><span className="hidden sm:inline">KELUAR</span>
        </Button>
      </header>

      <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8 sm:space-y-12">
          <div className={cn("flex justify-center sticky z-40 transition-all duration-500", isHeaderVisible ? "top-[68px] sm:top-24" : "top-4")}>
            <TabsList className="bg-card border border-border shadow-2xl p-1.5 sm:p-2 rounded-2xl sm:rounded-[2.5rem] w-full max-w-5xl grid grid-cols-5 sm:flex sm:flex-wrap sm:justify-center gap-1 h-auto">
              <TabsTrigger value="advisor" className="rounded-xl sm:rounded-[1.8rem] font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest gap-1 sm:gap-2 px-2 sm:px-5 py-3 sm:py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex-col sm:flex-row border-2 border-primary/20 data-[state=active]:border-primary"><Sparkles className="h-4 w-4 text-primary data-[state=active]:text-primary-foreground" /><span className="hidden sm:inline">AI ADVISOR</span><span className="sm:hidden text-[7px]">ADVISOR</span></TabsTrigger>
              <TabsTrigger value="profile" className="rounded-xl sm:rounded-[1.8rem] font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest gap-1 sm:gap-2 px-2 sm:px-5 py-3 sm:py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex-col sm:flex-row"><UserCircle className="h-4 w-4 sm:h-4 sm:w-4" /><span className="hidden sm:inline">IDENTITAS</span><span className="sm:hidden text-[7px]">PROFIL</span></TabsTrigger>
              <TabsTrigger value="content" className="rounded-xl sm:rounded-[1.8rem] font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest gap-1 sm:gap-2 px-2 sm:px-5 py-3 sm:py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex-col sm:flex-row"><Edit className="h-4 w-4 sm:h-4 sm:w-4" /><span className="hidden sm:inline">KONTEN</span><span className="sm:hidden text-[7px]">KONTEN</span></TabsTrigger>
              <TabsTrigger value="projects" className="rounded-xl sm:rounded-[1.8rem] font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest gap-1 sm:gap-2 px-2 sm:px-5 py-3 sm:py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex-col sm:flex-row"><Briefcase className="h-4 w-4 sm:h-4 sm:w-4" /><span className="hidden sm:inline">PROYEK</span><span className="sm:hidden text-[7px]">PROYEK</span></TabsTrigger>
              <TabsTrigger value="certificates" className="rounded-xl sm:rounded-[1.8rem] font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest gap-1 sm:gap-2 px-2 sm:px-5 py-3 sm:py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex-col sm:flex-row"><Award className="h-4 w-4 sm:h-4 sm:w-4" /><span className="hidden sm:inline">SERTIFIKAT</span><span className="sm:hidden text-[7px]">SERTIF</span></TabsTrigger>
              <TabsTrigger value="journey" className="rounded-xl sm:rounded-[1.8rem] font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest gap-1 sm:gap-2 px-2 sm:px-5 py-3 sm:py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex-col sm:flex-row"><History className="h-4 w-4 sm:h-4 sm:w-4" /><span className="hidden sm:inline">JOURNEY</span><span className="sm:hidden text-[7px]">KARIR</span></TabsTrigger>
              <TabsTrigger value="techstack" className="rounded-xl sm:rounded-[1.8rem] font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest gap-1 sm:gap-2 px-2 sm:px-5 py-3 sm:py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex-col sm:flex-row"><Terminal className="h-4 w-4 sm:h-4 sm:w-4" /><span className="hidden sm:inline">TECH STACK</span><span className="sm:hidden text-[7px]">TECH</span></TabsTrigger>
              <TabsTrigger value="blogs" className="rounded-xl sm:rounded-[1.8rem] font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest gap-1 sm:gap-2 px-2 sm:px-5 py-3 sm:py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex-col sm:flex-row"><BookOpen className="h-4 w-4 sm:h-4 sm:w-4" /><span className="hidden sm:inline">BLOG</span><span className="sm:hidden text-[7px]">BLOG</span></TabsTrigger>
              <TabsTrigger value="links" className="rounded-xl sm:rounded-[1.8rem] font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest gap-1 sm:gap-2 px-2 sm:px-5 py-3 sm:py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex-col sm:flex-row"><LinkIcon className="h-4 w-4 sm:h-4 sm:w-4" /><span className="hidden sm:inline">SHORT LINK</span><span className="sm:hidden text-[7px]">LINK</span></TabsTrigger>
              <TabsTrigger value="messages" className="rounded-xl sm:rounded-[1.8rem] font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest gap-1 sm:gap-2 px-2 sm:px-5 py-3 sm:py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex-col sm:flex-row relative">
                <Mail className="h-4 w-4 sm:h-4 sm:w-4" /><span className="hidden sm:inline">PESAN</span><span className="sm:hidden text-[7px]">PESAN</span>
                {messages.length > 0 && <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-destructive rounded-full animate-pulse" />}
              </TabsTrigger>
              <TabsTrigger value="system" className="rounded-xl sm:rounded-[1.8rem] font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest gap-1 sm:gap-2 px-2 sm:px-5 py-3 sm:py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex-col sm:flex-row"><Settings className="h-4 w-4 sm:h-4 sm:w-4" /><span className="hidden sm:inline">SISTEM</span><span className="sm:hidden text-[7px]">SISTEM</span></TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="advisor" className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <AIAdvisorPanel
              projects={projects}
              certificates={certificates}
              experiences={experiences}
              techSkills={techSkills}
              blogs={blogs}
              profile={profile}
              stats={stats}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </TabsContent>

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
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">URL Gambar Profil</label>
                        <Input 
                          value={profileFormData.profilePictureUrl || ''} 
                          onChange={e => setProfileFormData({...profileFormData, profilePictureUrl: e.target.value})} 
                          className="h-14 rounded-2xl bg-muted/30 border-none px-6" 
                          placeholder="https://example.com/gambar.jpg" 
                        />
                      </div>

                      <Card className="rounded-[2.5rem] border-none bg-muted/30 p-8 space-y-6">
                         <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <h3 className="font-black text-xs uppercase tracking-widest">Metrik Portofolio</h3>
                         </div>
                         <div className="grid gap-4">
                            <div className="space-y-1">
                               <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Total Proyek</label>
                               <Input value={statsFormData.completedProjects} onChange={e => setStatsFormData({...statsFormData, completedProjects: e.target.value})} className="rounded-xl border-none bg-background/50 h-12" />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tahun Pengalaman</label>
                               <Input value={statsFormData.yearsExperience} onChange={e => setStatsFormData({...statsFormData, yearsExperience: e.target.value})} className="rounded-xl border-none bg-background/50 h-12" />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Teknologi Terapan</label>
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
                        <h3 className="text-xl font-black  uppercase tracking-tight flex items-center gap-3">
                           <UserCircle className="h-6 w-6 text-primary" /> Informasi Dasar
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Nama Brand/Lengkap</label><Input value={profileFormData.name} onChange={e => setProfileFormData({...profileFormData, name: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Email Kependudukan Admin</label><Input value={profileFormData.email} onChange={e => setProfileFormData({...profileFormData, email: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Spesialisasi (ID)</label><Input value={profileFormData.roleId} onChange={e => setProfileFormData({...profileFormData, roleId: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Spesialisasi (EN)</label><Input value={profileFormData.roleEn} onChange={e => setProfileFormData({...profileFormData, roleEn: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-xl font-black  uppercase tracking-tight flex items-center gap-3">
                           <Zap className="h-6 w-6 text-primary" /> Narasi Utama (Hero)
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Headline Hero (ID)</label><Input value={profileFormData.heroTitleId} onChange={e => setProfileFormData({...profileFormData, heroTitleId: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Headline Hero (EN)</label><Input value={profileFormData.heroTitleEn} onChange={e => setProfileFormData({...profileFormData, heroTitleEn: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Sub-Headline Hero (ID)</label><Textarea value={profileFormData.heroSubtitleId} onChange={e => setProfileFormData({...profileFormData, heroSubtitleId: e.target.value})} className="h-24 rounded-2xl bg-muted/30 border-none p-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Sub-Headline Hero (EN)</label><Textarea value={profileFormData.heroSubtitleEn} onChange={e => setProfileFormData({...profileFormData, heroSubtitleEn: e.target.value})} className="h-24 rounded-2xl bg-muted/30 border-none p-6" /></div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-xl font-black  uppercase tracking-tight flex items-center gap-3">
                           <ImageIcon className="h-6 w-6 text-primary" /> Tentang Saya
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Biografi Profesional (ID)</label><Textarea value={profileFormData.aboutMeId} onChange={e => setProfileFormData({...profileFormData, aboutMeId: e.target.value})} className="h-32 rounded-2xl bg-muted/30 border-none p-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Biografi Profesional (EN)</label><Textarea value={profileFormData.aboutMeEn} onChange={e => setProfileFormData({...profileFormData, aboutMeEn: e.target.value})} className="h-32 rounded-2xl bg-muted/30 border-none p-6" /></div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-xl font-black  uppercase tracking-tight flex items-center gap-3">
                           <Share2 className="h-6 w-6 text-primary" /> Konektivitas Sosial
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">WhatsApp (628xx)</label><Input value={profileFormData.whatsapp} onChange={e => setProfileFormData({...profileFormData, whatsapp: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none px-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">LinkedIn Profile</label><Input value={profileFormData.linkedin} onChange={e => setProfileFormData({...profileFormData, linkedin: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none px-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">GitHub Repositori</label><Input value={profileFormData.github} onChange={e => setProfileFormData({...profileFormData, github: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none px-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Instagram Handle</label><Input value={profileFormData.instagram} onChange={e => setProfileFormData({...profileFormData, instagram: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none px-6" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">TikTok Channel</label><Input value={profileFormData.tiktok} onChange={e => setProfileFormData({...profileFormData, tiktok: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none px-6" /></div>
                        </div>
                      </div>
                   </div>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase bg-primary text-primary-foreground shadow-2xl hover:scale-[1.01] transition-all">MUTAKHIRKAN SELURUH IDENTITAS DIGITAL</Button>
             </form>
          </TabsContent>
          
          <TabsContent value="content" className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <form onSubmit={handleContentSubmit} className="max-w-4xl mx-auto space-y-12">
              <Card className="rounded-[2.5rem] shadow-none border-none bg-transparent">
                <CardHeader className="p-0 pb-10">
                  <CardTitle className="font-black  text-3xl uppercase tracking-normal">Manajemen Konten Halaman</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold tracking-[0.3em]">Sunting teks di berbagai bagian situs.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-xl font-black  uppercase tracking-tight flex items-center gap-3">
                      <Briefcase className="h-6 w-6 text-primary" /> Bagian Portofolio
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Judul Portofolio (ID)</label>
                        <Input value={contentFormData.portfolioTitleId} onChange={e => setContentFormData({...contentFormData, portfolioTitleId: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Judul Portofolio (EN)</label>
                        <Input value={contentFormData.portfolioTitleEn} onChange={e => setContentFormData({...contentFormData, portfolioTitleEn: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Subjudul Portofolio (ID)</label>
                        <Textarea value={contentFormData.portfolioSubtitleId} onChange={e => setContentFormData({...contentFormData, portfolioSubtitleId: e.target.value})} className="h-24 rounded-2xl bg-muted/30 border-none p-6" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Subjudul Portofolio (EN)</label>
                        <Textarea value={contentFormData.portfolioSubtitleEn} onChange={e => setContentFormData({...contentFormData, portfolioSubtitleEn: e.target.value})} className="h-24 rounded-2xl bg-muted/30 border-none p-6" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xl font-black  uppercase tracking-tight flex items-center gap-3">
                      <Award className="h-6 w-6 text-primary" /> Bagian Sertifikat
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Judul Sertifikat (ID)</label>
                        <Input value={contentFormData.certificatesTitleId} onChange={e => setContentFormData({...contentFormData, certificatesTitleId: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Judul Sertifikat (EN)</label>
                        <Input value={contentFormData.certificatesTitleEn} onChange={e => setContentFormData({...contentFormData, certificatesTitleEn: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Subjudul Sertifikat (ID)</label>
                        <Textarea value={contentFormData.certificatesSubtitleId} onChange={e => setContentFormData({...contentFormData, certificatesSubtitleId: e.target.value})} className="h-24 rounded-2xl bg-muted/30 border-none p-6" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Subjudul Sertifikat (EN)</label>
                        <Textarea value={contentFormData.certificatesSubtitleEn} onChange={e => setContentFormData({...contentFormData, certificatesSubtitleEn: e.target.value})} className="h-24 rounded-2xl bg-muted/30 border-none p-6" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase bg-primary text-primary-foreground shadow-2xl hover:scale-[1.01] transition-all">SIMPAN PERUBAHAN KONTEN</Button>
            </form>
          </TabsContent>

          <TabsContent value="projects" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="xl:col-span-8">
               <Card className="rounded-[2.5rem] shadow-none border-none bg-transparent">
                <CardHeader className="p-0 pb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <CardTitle className="font-black  text-3xl uppercase tracking-normal">{editingProjectId ? 'Ubah Data Proyek' : 'Deploy Proyek Baru'}</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.3em]">Arsip Arsitektur Sistem & Rekayasa Kode</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="button" size="sm" onClick={handleGenerateProjectDescription} className="rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground h-12 px-5 font-black uppercase gap-2 transition-all" disabled={isGeneratingProjectDesc}>
                      {isGeneratingProjectDesc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      <span>SARANKAN DESKRIPSI (AI)</span>
                    </Button>
                    <Button type="button" size="sm" onClick={() => handleAITranslate('projects', projectForm, setProjectForm)} className="rounded-xl bg-primary/10 text-primary h-12 px-6 font-black uppercase" disabled={isTranslating === 'projects'}>
                      {isTranslating === 'projects' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} SINKRONISASI AI (OTOMATIS)
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addProject({ ...projectForm, id: editingProjectId || Date.now().toString(), technologies: typeof projectForm.technologies === 'string' ? projectForm.technologies.split(',').map(s => s.trim()) : projectForm.technologies } as any);
                    setProjectForm(initialProjectState); setEditingProjectId(null);
                    toast({ title: "Unit Proyek Berhasil Disimpan" });
                  }} className="space-y-12">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nama Proyek (ID)</label><Input required value={projectForm.titleId} onChange={e => setProjectForm({...projectForm, titleId: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nama Proyek (EN)</label><Input value={projectForm.titleEn} onChange={e => setProjectForm({...projectForm, titleEn: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ranah Sistem</label><Select value={projectForm.type} onValueChange={(val: any) => setProjectForm({...projectForm, type: val})}><SelectTrigger className="h-16 rounded-2xl bg-muted/30 border-none px-6"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="web">Platform Web</SelectItem><SelectItem value="ui">Arsitektur UI/UX</SelectItem><SelectItem value="backend">Layanan Backend</SelectItem></SelectContent></Select></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Metrik Dampak</label><Input placeholder="Cth: +30% Efisiensi" value={projectForm.impactStats} onChange={e => setProjectForm({...projectForm, impactStats: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stack Teknis (Koma)</label><Input placeholder="Next.js, Tailwind, Firebase" value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><AlertCircle className="h-3 w-3" /> Tantangan Utama (ID)</label><Textarea value={projectForm.problemId} onChange={e => setProjectForm({...projectForm, problemId: e.target.value})} className="h-40 rounded-[2rem] bg-muted/30 border-none p-6" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Solusi Strategis (ID)</label><Textarea value={projectForm.solutionId} onChange={e => setProjectForm({...projectForm, solutionId: e.target.value})} className="h-40 rounded-[2rem] bg-muted/30 border-none p-6" /></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL Live Protocol</label><Input value={projectForm.demoUrl} onChange={e => setProjectForm({...projectForm, demoUrl: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                       <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visual Utama (Cover)</label><Input value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                    </div>
                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1 h-14 rounded-2xl font-black uppercase bg-primary text-primary-foreground shadow-xl">PUBLIKASIKAN PROYEK</Button>
                      {editingProjectId && <Button type="button" variant="outline" onClick={cancelEdit} className="h-14 rounded-2xl font-black uppercase"><X className="h-4 w-4 mr-2" /> BATALKAN</Button>}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="xl:col-span-4 space-y-8">
               <h3 className="font-black text-[11px] uppercase tracking-[0.4em] px-4 text-primary">REPOSITORI AKTIF ({projects.length})</h3>
               <div className="grid gap-4">
                  {projects.map(p => {
                    const hasDemo = p.demoUrl && p.demoUrl.startsWith('http');
                    return (
                      <Card key={p.id} className="p-5 flex gap-5 items-center group bg-card border-none hover:bg-muted/30 transition-all rounded-2xl shadow-sm overflow-hidden">
                        <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.titleId} />
                          ) : (
                            <Laptop className="h-6 w-6 text-muted-foreground/30" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {hasDemo ? (
                            <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 group/link hover:text-primary transition-colors">
                              <h4 className="font-black truncate text-sm group-hover/link:underline">{p.titleId}</h4>
                              <ExternalLink className="h-3 w-3 text-muted-foreground group-hover/link:text-primary transition-all shrink-0" />
                            </a>
                          ) : (
                            <h4 className="font-black truncate text-sm">{p.titleId}</h4>
                          )}
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">{p.type}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button variant="ghost" size="icon" onClick={() => setFeaturedProject(p.id)} className={cn("h-10 w-10 rounded-xl", p.featured ? "text-primary" : "text-muted-foreground")}><Star className={cn("h-4 w-4", p.featured && "fill-current")} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => startEditProject(p)} className="text-primary h-10 w-10 rounded-xl"><Edit3 className="h-4 w-4" /></Button>
                          {isSuper && <Button variant="ghost" size="icon" onClick={() => deleteProject(p.id)} className="text-destructive h-10 w-10 rounded-xl"><Trash2 className="h-4 w-4" /></Button>}
                        </div>
                      </Card>
                    )
                  })}
               </div>
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="xl:col-span-8">
               <Card className="rounded-[2.5rem] shadow-none border-none bg-transparent">
                <CardHeader className="p-0 pb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <CardTitle className="font-black  text-3xl uppercase tracking-normal">{editingCertId ? 'Mutakhirkan Kredensial' : 'Daftarkan Kredensial'}</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.3em]">Validasi Validitas & Akreditasi Industri</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="button" size="sm" onClick={handleGenerateCertDescription} className="rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground h-12 px-5 font-black uppercase gap-2 transition-all" disabled={isGeneratingCertDesc}>
                      {isGeneratingCertDesc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      <span>DESKRIPSI AI</span>
                    </Button>
                    <Button type="button" size="sm" onClick={() => handleAITranslate('certificates', certForm, setCertForm)} className="rounded-xl bg-primary/10 text-primary h-12 px-6 font-black uppercase" disabled={isTranslating === 'certificates'}>
                      {isTranslating === 'certificates' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} SINKRONISASI AI
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addCertificate({ ...certForm, id: editingCertId || Date.now().toString() } as any);
                    setCertForm(initialCertState); setEditingCertId(null);
                    toast({ title: "Kredensial Berhasil Diverifikasi" });
                  }} className="space-y-12">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Judul Sertifikat (ID)</label><Input required value={certForm.titleId} onChange={e => setCertForm({...certForm, titleId: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Judul Sertifikat (EN)</label><Input value={certForm.titleEn} onChange={e => setCertForm({...certForm, titleEn: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lembaga Penerbit</label><Input value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tahun Rilis</label><Input value={certForm.year} onChange={e => setCertForm({...certForm, year: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Masa Berlaku</label><Input placeholder="Cth: Seumur Hidup" value={certForm.validUntil} onChange={e => setCertForm({...certForm, validUntil: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                    </div>
                    <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL Verifikasi</label><Input value={certForm.credentialUrl} onChange={e => setCertForm({...certForm, credentialUrl: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                    </div>
                    <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Narasi Validasi (ID)</label><Textarea value={certForm.fullDescriptionId} onChange={e => setCertForm({...certForm, fullDescriptionId: e.target.value})} className="h-40 rounded-[2rem] bg-muted/30 border-none p-6" /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL Gambar Sertifikat</label><Input value={certForm.imageUrl || ''} onChange={e => setCertForm({...certForm, imageUrl: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" placeholder="https://example.com/sertifikat.jpg" /></div>
                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1 h-14 rounded-2xl font-black uppercase bg-primary text-primary-foreground shadow-xl">SIMPAN KREDENSIAL</Button>
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
                          <FileText className="h-6 w-6 text-primary" />
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
                    <CardTitle className="font-black  text-3xl uppercase tracking-normal">{editingJourneyId ? 'Ubah Milestone' : 'Catat Milestone Karir'}</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.3em]">Log Kronologis Riwayat Profesional & Akademik</CardDescription>
                  </div>
                  <Button type="button" size="sm" onClick={() => handleAITranslate('journey', journeyForm, setJourneyForm)} className="rounded-xl bg-primary/10 text-primary h-12 px-6 font-black uppercase" disabled={isTranslating === 'journey'}>
                    {isTranslating === 'journey' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} SINKRONISASI AI
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addExperience({ ...journeyForm, id: editingJourneyId || Date.now().toString() } as any);
                    setJourneyForm(initialJourneyState); setEditingJourneyId(null);
                    toast({ title: "Milestone Berhasil Dicatat" });
                  }} className="space-y-12">
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Periode Waktu</label><Input required placeholder="Cth: 2023 - Sekarang" value={journeyForm.year} onChange={e => setJourneyForm({...journeyForm, year: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entitas Organisasi</label><Input required value={journeyForm.company} onChange={e => setJourneyForm({...journeyForm, company: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Posisi / Jabatan (ID)</label><Input required value={journeyForm.titleId} onChange={e => setJourneyForm({...journeyForm, titleId: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Posisi / Jabatan (EN)</label><Input value={journeyForm.titleEn} onChange={e => setJourneyForm({...journeyForm, titleEn: e.target.value})} className="h-16 rounded-2xl bg-muted/30 border-none px-6" /></div>
                    </div>
                    <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Uraian Tanggung Jawab (ID)</label><Textarea value={journeyForm.descriptionId} onChange={e => setJourneyForm({...journeyForm, descriptionId: e.target.value})} className="h-32 rounded-[2rem] bg-muted/30 border-none p-6" /></div>
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
                  <h3 className="text-3xl font-black  tracking-normal uppercase">Inbound Messages</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Log Transmisi Pesan Pengunjung</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 h-8 px-4 font-black rounded-xl">{messages.length} Records</Badge>
             </div>
             
             {messages.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-30">
                  <Mail className="h-16 w-16" />
                  <p className="text-xs font-black uppercase tracking-widest">Belum ada transmisi pesan masuk</p>
               </div>
             ) : (
               <div className="grid gap-6">
                 {messages.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(msg => (
                    <Card key={msg.id} className="rounded-[2rem] border-none bg-card/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all group overflow-hidden">
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

          <TabsContent value="techstack" className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
             <Card className="rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-10 bg-card border-none shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-gradient-to-r from-teal-400 to-cyan-500" />
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <CardTitle className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Katalog Teknologi</CardTitle>
                      <CardDescription className="mt-1">Manajemen skill dan teknologi yang dikuasai.</CardDescription>
                    </div>
                    <Badge className="h-8 px-4 rounded-full text-xs font-black bg-primary/10 text-primary border-primary/20">
                      {techSkills.length} Skill{techSkills.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pt-6 space-y-10">
                   {/* ── Add/Edit Form ── */}
                   <form onSubmit={handleTechSkillSubmit} className="space-y-6 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-muted/30 border border-border/50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest flex items-center gap-2">
                           <Terminal className="h-4 w-4 text-primary" /> {editingTechSkillId ? 'Edit Skill' : 'Tambah Skill Baru'}
                        </h3>
                        {editingTechSkillId && (
                          <Button type="button" variant="ghost" size="sm" onClick={cancelEdit} className="rounded-xl text-[10px] font-black uppercase gap-1 h-8">
                            <X className="h-3 w-3" /> Batal
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Nama Teknologi *</label>
                           <Input required value={techSkillForm.name} onChange={e => setTechSkillForm({...techSkillForm, name: e.target.value})} placeholder="Contoh: Next.js" className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-background border-none px-4 sm:px-6" />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Ikon (URL Gambar atau Emoji) *</label>
                           <Input required value={techSkillForm.icon} onChange={e => setTechSkillForm({...techSkillForm, icon: e.target.value})} placeholder="URL (https://...) atau Emoji (🔥)" className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-background border-none px-4 sm:px-6" />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Tingkat Penguasaan: {techSkillForm.level}%</label>
                           <div className="flex items-center gap-3 px-1">
                             <input type="range" min="1" max="100" value={techSkillForm.level} onChange={e => setTechSkillForm({...techSkillForm, level: parseInt(e.target.value) || 0})} className="flex-1 accent-primary h-2 cursor-pointer" />
                             <span className="text-sm font-black text-primary tabular-nums w-10 text-right">{techSkillForm.level}%</span>
                           </div>
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Kategori *</label>
                           <Select value={techSkillForm.category} onValueChange={v => setTechSkillForm({...techSkillForm, category: v})}>
                              <SelectTrigger className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-background border-none px-4 sm:px-6">
                                 <SelectValue placeholder="Pilih Kategori" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="Frontend">Frontend</SelectItem>
                                 <SelectItem value="Backend">Backend</SelectItem>
                                 <SelectItem value="Tools">Tools/DevOps</SelectItem>
                                 <SelectItem value="Design">Design</SelectItem>
                                 <SelectItem value="Database">Database</SelectItem>
                                 <SelectItem value="Mobile">Mobile</SelectItem>
                                 <SelectItem value="Other">Lainnya</SelectItem>
                              </SelectContent>
                           </Select>
                         </div>
                         <div className="space-y-2 sm:col-span-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Warna Background (Hex, RGB, atau Tailwind)</label>
                           <div className="flex gap-3 items-center">
                             <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-primary/20 hover:border-primary/50 overflow-hidden shrink-0 cursor-pointer flex items-center justify-center bg-background group transition-all shadow-sm hover:shadow-md" title="Pilih Warna">
                               <input 
                                 type="color" 
                                 value={techSkillForm.color.startsWith('#') ? techSkillForm.color : '#3b82f6'} 
                                 onChange={e => setTechSkillForm({...techSkillForm, color: e.target.value})} 
                                 className="absolute inset-[-20px] w-32 h-32 opacity-0 cursor-pointer z-10" 
                               />
                               <div 
                                 className="absolute inset-0 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity duration-300" 
                                 style={{ background: techSkillForm.color.startsWith('#') ? techSkillForm.color : '#3b82f6' }}
                               />
                               <div 
                                 className="w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] border-2 border-white/80 pointer-events-none group-hover:scale-110 transition-transform duration-300 relative z-0" 
                                 style={{ background: techSkillForm.color.startsWith('#') ? techSkillForm.color : '#3b82f6' }}
                               />
                             </div>
                             <Input required value={techSkillForm.color} onChange={e => setTechSkillForm({...techSkillForm, color: e.target.value})} placeholder="Kode Hex (#FF0000) atau kelas Tailwind" className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-background border-none px-4 sm:px-6 flex-1" />
                             <div 
                                className={cn(
                                  "w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-lg overflow-hidden",
                                  (techSkillForm.color.includes('from-') || techSkillForm.color.includes('bg-')) ? `bg-gradient-to-br ${techSkillForm.color}` : ""
                                )}
                                style={!(techSkillForm.color.includes('from-') || techSkillForm.color.includes('bg-')) ? { background: techSkillForm.color || 'var(--primary)' } : {}}
                             >
                               {(techSkillForm.icon && (techSkillForm.icon.startsWith('http') || techSkillForm.icon.startsWith('/'))) ? (
                                 <img src={techSkillForm.icon} alt="preview" className="w-6 h-6 object-contain" />
                               ) : (
                                 <span className="font-black text-xl text-white">{techSkillForm.icon}</span>
                               )}
                             </div>
                           </div>
                           <div className="flex flex-wrap gap-1.5 px-1 mt-2">
                             {[
                               { label: 'Blue', value: '#3b82f6' },
                               { label: 'Cyan', value: '#06b6d4' },
                               { label: 'Green', value: '#10b981' },
                               { label: 'Purple', value: '#8b5cf6' },
                               { label: 'Orange', value: '#f59e0b' },
                               { label: 'Red', value: '#ef4444' },
                               { label: 'Teal', value: '#14b8a6' },
                               { label: 'Yellow', value: '#eab308' },
                               { label: 'Pink', value: '#f43f5e' },
                               { label: 'Gray', value: '#64748b' },
                             ].map(preset => (
                               <button
                                 key={preset.value}
                                 type="button"
                                 onClick={() => setTechSkillForm({...techSkillForm, color: preset.value})}
                                 className={cn(
                                   "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all",
                                   techSkillForm.color === preset.value 
                                     ? "bg-primary text-primary-foreground shadow-md" 
                                     : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                 )}
                               >{preset.label}</button>
                             ))}
                           </div>
                         </div>
                      </div>
                      <Button type="submit" className="h-12 sm:h-14 w-full rounded-xl sm:rounded-2xl font-black uppercase gap-2">
                         {editingTechSkillId ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                         {editingTechSkillId ? 'Simpan Perubahan' : 'Tambahkan Skill'}
                      </Button>
                   </form>

                   {/* ── Skills List ── */}
                   {techSkills.length === 0 ? (
                     <div className="text-center py-16 space-y-4">
                       <Terminal className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                       <p className="text-sm text-muted-foreground">Belum ada skill. Tambahkan dari form di atas.</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {techSkills.map(skill => (
                           <div key={skill.id} className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-muted/30 border border-border/50 relative group hover:border-primary/20 transition-colors">
                              <div className="flex items-start gap-3 mb-3">
                                 <div 
                                    className={cn(
                                      "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-base shrink-0 shadow-md overflow-hidden",
                                      (skill.color.includes('from-') || skill.color.includes('bg-')) ? `bg-gradient-to-br ${skill.color}` : ""
                                    )}
                                    style={!(skill.color.includes('from-') || skill.color.includes('bg-')) ? { background: skill.color || 'var(--primary)' } : {}}
                                 >
                                    <span className="drop-shadow-sm flex items-center justify-center w-full h-full text-white">
                                       {(skill.icon && (skill.icon.startsWith('http') || skill.icon.startsWith('/'))) ? (
                                         <img src={skill.icon} alt={skill.name} className="w-5 h-5 object-contain" />
                                       ) : (
                                         skill.icon
                                       )}
                                    </span>
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm leading-tight truncate">{skill.name}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[9px] font-black uppercase text-muted-foreground">{skill.category}</span>
                                      <span className="text-[9px] font-bold text-primary tabular-nums">{skill.level}%</span>
                                    </div>
                                 </div>
                                 <div className="flex gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                                    <Button size="icon" variant="secondary" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg shadow-md" onClick={() => startEditTechSkill(skill)}><Edit3 className="h-3 w-3" /></Button>
                                    <Button size="icon" variant="destructive" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg shadow-md" onClick={() => deleteTechSkill(skill.id!)}><Trash2 className="h-3 w-3" /></Button>
                                 </div>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full bg-gradient-to-r ${skill.color} transition-all duration-500`} style={{ width: `${skill.level}%` }} />
                              </div>
                           </div>
                        ))}
                     </div>
                   )}
                </CardContent>
             </Card>
          </TabsContent>

          {/* ── BLOGS TAB ── */}
          <TabsContent value="blogs" className="grid xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="xl:col-span-8">
              <Card className="rounded-[2.5rem] shadow-none border-none bg-transparent">
                <CardHeader className="p-0 pb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <CardTitle className="font-black text-3xl uppercase tracking-normal">
                      {editingBlogId ? 'Ubah Konten Artikel' : 'Tulis Artikel Baru'}
                    </CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.3em]">
                      Publikasi Insight, Dokumentasi Teknis & Tutorial
                    </CardDescription>
                  </div>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => handleAITranslate('blogs', blogForm, setBlogForm)} 
                    className="rounded-xl bg-primary/10 text-primary hover:bg-primary/20 h-12 px-6 font-black uppercase" 
                    disabled={isTranslating === 'blogs'}
                  >
                    {isTranslating === 'blogs' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} 
                    SINKRONISASI AI (OTOMATIS)
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={handleBlogSubmit} className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Judul Artikel (ID) *</label>
                        <Input 
                          required 
                          placeholder="Cth: Menguasai Next.js 15 App Router" 
                          value={blogForm.titleId} 
                          onChange={e => {
                            const val = e.target.value;
                            setBlogForm(prev => ({
                              ...prev,
                              titleId: val,
                              slug: editingBlogId ? prev.slug : val.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
                            }));
                          }} 
                          className="h-16 rounded-2xl bg-muted/30 border-none px-6" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Judul Artikel (EN)</label>
                        <Input 
                          placeholder="E.g.: Mastering Next.js 15 App Router" 
                          value={blogForm.titleEn} 
                          onChange={e => setBlogForm({...blogForm, titleEn: e.target.value})} 
                          className="h-16 rounded-2xl bg-muted/30 border-none px-6" 
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Custom Slug (URL) *</label>
                        <Input 
                          required 
                          placeholder="menguasai-nextjs-15" 
                          value={blogForm.slug} 
                          onChange={e => setBlogForm({...blogForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')})} 
                          className="h-16 rounded-2xl bg-muted/30 border-none px-6" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estimasi Waktu Baca</label>
                        <Input 
                          placeholder="Cth: 5 min read" 
                          value={blogForm.readingTime} 
                          onChange={e => setBlogForm({...blogForm, readingTime: e.target.value})} 
                          className="h-16 rounded-2xl bg-muted/30 border-none px-6" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nama Penulis</label>
                        <Input 
                          placeholder="Nara Andra Tyaga" 
                          value={blogForm.author} 
                          onChange={e => setBlogForm({...blogForm, author: e.target.value})} 
                          className="h-16 rounded-2xl bg-muted/30 border-none px-6" 
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tags / Topik (Pisahkan Koma)</label>
                        <Input 
                          placeholder="Next.js, React, Architecture, Tutorial" 
                          value={blogForm.tags} 
                          onChange={e => setBlogForm({...blogForm, tags: e.target.value})} 
                          className="h-16 rounded-2xl bg-muted/30 border-none px-6" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL Gambar Cover (Thumbnail)</label>
                        <Input 
                          placeholder="https://example.com/banner.jpg" 
                          value={blogForm.coverImage} 
                          onChange={e => setBlogForm({...blogForm, coverImage: e.target.value})} 
                          className="h-16 rounded-2xl bg-muted/30 border-none px-6" 
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ringkasan Singkat (ID) *</label>
                        <Textarea 
                          required 
                          placeholder="Ringkasan atau preview pengantar artikel dalam bahasa Indonesia..." 
                          value={blogForm.summaryId} 
                          onChange={e => setBlogForm({...blogForm, summaryId: e.target.value})} 
                          className="h-32 rounded-[2rem] bg-muted/30 border-none p-6" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ringkasan Singkat (EN)</label>
                        <Textarea 
                          placeholder="Short summary or article preview in English..." 
                          value={blogForm.summaryEn} 
                          onChange={e => setBlogForm({...blogForm, summaryEn: e.target.value})} 
                          className="h-32 rounded-[2rem] bg-muted/30 border-none p-6" 
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Isi Konten Lengkap (ID) *</label>
                        <Textarea 
                          required 
                          placeholder="Tulis artikel lengkap di sini. Mendukung pemisahan paragraf dan markdown teks..." 
                          value={blogForm.contentId} 
                          onChange={e => setBlogForm({...blogForm, contentId: e.target.value})} 
                          className="h-72 rounded-[2rem] bg-muted/30 border-none p-6 font-mono text-sm" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Isi Konten Lengkap (EN)</label>
                        <Textarea 
                          placeholder="Full article content in English (or use AI Sync to translate automatically)..." 
                          value={blogForm.contentEn} 
                          onChange={e => setBlogForm({...blogForm, contentEn: e.target.value})} 
                          className="h-72 rounded-[2rem] bg-muted/30 border-none p-6 font-mono text-sm" 
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 w-fit cursor-pointer" onClick={() => setBlogForm({...blogForm, featured: !blogForm.featured})}>
                      <input 
                        type="checkbox" 
                        id="blog-featured" 
                        checked={blogForm.featured} 
                        onChange={e => setBlogForm({...blogForm, featured: e.target.checked})} 
                        className="h-5 w-5 accent-primary rounded cursor-pointer" 
                      />
                      <label htmlFor="blog-featured" className="text-xs font-black uppercase tracking-wider cursor-pointer select-none">
                        Tandai sebagai Artikel Unggulan (Featured)
                      </label>
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1 h-14 rounded-2xl font-black uppercase bg-primary text-primary-foreground shadow-xl">
                        {editingBlogId ? 'SIMPAN PERUBAHAN ARTIKEL' : 'PUBLIKASIKAN ARTIKEL'}
                      </Button>
                      {editingBlogId && (
                        <Button type="button" variant="outline" onClick={cancelEdit} className="h-14 rounded-2xl font-black uppercase">
                          <X className="h-4 w-4 mr-2" /> BATALKAN
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-4 space-y-8">
              <h3 className="font-black text-[11px] uppercase tracking-[0.4em] px-4 text-primary">
                ARTIKEL TERPUBLIKASI ({blogs.length})
              </h3>
              {blogs.length === 0 ? (
                <div className="text-center py-16 space-y-4 border border-dashed rounded-3xl p-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground">Belum ada artikel. Publikasikan artikel pertama dari formulir di samping.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {blogs.map(b => (
                    <Card key={b.id} className="p-5 flex gap-5 items-center group bg-card border-none hover:bg-muted/30 transition-all rounded-2xl shadow-sm overflow-hidden">
                      <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                        {b.coverImage ? (
                          <img src={b.coverImage} className="w-full h-full object-cover" alt={b.titleId} />
                        ) : (
                          <BookOpen className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black truncate text-sm">{b.titleId}</h4>
                          {b.featured && <Star className="h-3 w-3 fill-primary text-primary shrink-0" />}
                        </div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-2 mt-0.5">
                          <span>{b.readingTime || '3 min'}</span>
                          <span>•</span>
                          <span className="truncate">{b.tags?.[0] || 'Article'}</span>
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => window.open(`/blog/${b.slug}`, '_blank')} 
                          className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary"
                          title="Lihat Halaman Artikel"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => startEditBlog(b)} 
                          className="text-primary h-10 w-10 rounded-xl"
                          title="Edit Artikel"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        {isSuper && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteBlog(b.id)} 
                            className="text-destructive h-10 w-10 rounded-xl"
                            title="Hapus Artikel"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="links" className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
            <Card className="rounded-[2.5rem] p-8 sm:p-12 bg-card border-none shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardHeader className="p-0 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-1">
                  <CardTitle className="font-black text-3xl uppercase tracking-normal">
                    {editingShortLinkId ? 'Ubah Short Link' : 'Buat Short Link Baru'}
                  </CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold tracking-[0.3em]">
                    URL Shortener & Interstitial Preview Page Gateway (/l/slug)
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <form onSubmit={handleShortLinkSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Custom Slug *</label>
                      <div className="flex items-center rounded-2xl bg-muted/30 px-4">
                        <span className="text-xs font-mono text-muted-foreground">/l/</span>
                        <Input 
                          required
                          placeholder="github" 
                          value={shortLinkForm.slug} 
                          onChange={e => setShortLinkForm({...shortLinkForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')})} 
                          className="h-14 bg-transparent border-none px-2 font-mono" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL Tujuan (Original URL) *</label>
                      <Input 
                        required
                        type="url"
                        placeholder="https://github.com/nara-andra-tyaga" 
                        value={shortLinkForm.originalUrl} 
                        onChange={e => setShortLinkForm({...shortLinkForm, originalUrl: e.target.value})} 
                        className="h-14 rounded-2xl bg-muted/30 border-none px-6 font-mono text-sm" 
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Judul / Label Link</label>
                      <Input 
                        placeholder="Cth: Profil GitHub Resmi Nara Andra Tyaga" 
                        value={shortLinkForm.title} 
                        onChange={e => setShortLinkForm({...shortLinkForm, title: e.target.value})} 
                        className="h-14 rounded-2xl bg-muted/30 border-none px-6" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deskripsi (Opsional)</label>
                      <Input 
                        placeholder="Cth: Repositori open-source dan portofolio kode" 
                        value={shortLinkForm.description} 
                        onChange={e => setShortLinkForm({...shortLinkForm, description: e.target.value})} 
                        className="h-14 rounded-2xl bg-muted/30 border-none px-6" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="linkActiveCheck" 
                        checked={shortLinkForm.isActive} 
                        onChange={e => setShortLinkForm({...shortLinkForm, isActive: e.target.checked})}
                        className="w-5 h-5 rounded accent-primary cursor-pointer"
                      />
                      <label htmlFor="linkActiveCheck" className="text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer">
                        Aktifkan Link (Dapat diakses publik)
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      {editingShortLinkId && (
                        <Button type="button" variant="outline" onClick={cancelEdit} className="h-12 px-6 rounded-2xl font-black uppercase">
                          Batal
                        </Button>
                      )}
                      <Button type="submit" className="h-12 px-8 rounded-2xl font-black uppercase bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90">
                        {editingShortLinkId ? 'Simpan Perubahan' : 'Buat Short Link'}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* List Existing Short Links */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-xl uppercase tracking-wider flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-primary" /> Daftar Short Links ({shortLinks.length})
                </h3>
              </div>

              {shortLinks.length === 0 ? (
                <Card className="p-12 rounded-[2.5rem] text-center space-y-4 bg-muted/20 border-dashed">
                  <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-sm font-medium text-muted-foreground">Belum ada short link yang dibuat.</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {shortLinks.map(link => (
                    <Card key={link.slug} className="p-5 sm:p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group">
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-sm text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg border border-primary/20">
                            /l/{link.slug}
                          </span>
                          <Badge variant={link.isActive ? 'default' : 'secondary'} className="text-[10px] font-bold uppercase">
                            {link.isActive ? 'Aktif' : 'Non-aktif'}
                          </Badge>
                          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                            <MousePointerClick className="w-3.5 h-3.5 text-primary" />
                            {link.clickCount || 0} Klik
                          </span>
                        </div>
                        {link.title && (
                          <h4 className="font-bold text-foreground text-sm truncate">{link.title}</h4>
                        )}
                        <p className="font-mono text-xs text-muted-foreground truncate max-w-xl">
                          {link.originalUrl}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyShortLinkUrl(link.slug)} 
                          className="h-10 px-3 rounded-xl text-xs font-mono gap-1.5"
                          title="Salin Short Link"
                        >
                          {copiedShortSlug === link.slug ? (
                            <>
                              <Check className="h-4 w-4 text-emerald-500" />
                              <span className="text-emerald-500 font-sans">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              <span className="font-sans">Salin</span>
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => window.open(`/l/${link.slug}`, '_blank')} 
                          className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary"
                          title="Buka Preview Link"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => startEditShortLink(link)} 
                          className="text-primary h-10 w-10 rounded-xl"
                          title="Edit Link"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        {isSuper && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteShortLink(link.slug)} 
                            className="text-destructive h-10 w-10 rounded-xl"
                            title="Hapus Link"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="system" className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
             <Card className="rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-10 bg-card border-none shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-gradient-to-r from-gray-400 to-gray-600" />
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl sm:text-3xl font-black tracking-normal uppercase">Infrastruktur & Maintenance</CardTitle>
                  <CardDescription className="mt-1">Cadangkan dan pulihkan data portofolio Anda.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <Button variant="outline" onClick={backupData} className="h-32 sm:h-40 flex-col gap-4 sm:gap-5 rounded-2xl sm:rounded-[2.5rem] bg-muted/20 border border-border/50 hover:bg-muted/40 hover:border-primary/20 transition-all">
                    <Download className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                    <div className="text-center">
                      <span className="text-[10px] font-black uppercase block">Ekspor Seluruh Data (JSON)</span>
                      <p className="text-[8px] text-muted-foreground mt-1">Unduh cadangan data portofolio</p>
                    </div>
                  </Button>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-32 sm:h-40 flex-col gap-4 sm:gap-5 rounded-2xl sm:rounded-[2.5rem] bg-muted/20 border border-border/50 hover:bg-muted/40 hover:border-accent/20 transition-all">
                    <Upload className="h-7 w-7 sm:h-8 sm:w-8 text-accent" />
                    <div className="text-center">
                      <span className="text-[10px] font-black uppercase block">Pulihkan Arsitektur</span>
                      <p className="text-[8px] text-muted-foreground mt-1">Impor data dari berkas eksternal</p>
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
