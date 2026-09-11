
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Project,
  Certificate,
  PortfolioStats,
  ProfileData,
  Testimonial,
  Experience,
  ContactMessage,
  TechSkill,
  BlogPost,
  ShortLink,
  DEFAULT_PROFILE,
  DEFAULT_STATS
} from '@/lib/types';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

interface ProjectStoreType {
  projects: Project[];
  certificates: Certificate[];
  testimonials: Testimonial[];
  experiences: Experience[];
  messages: ContactMessage[];
  stats: PortfolioStats;
  profile: ProfileData;
  blogs: BlogPost[];
  shortLinks: ShortLink[];
  isLoading: boolean;
  error: any;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  setFeaturedProject: (id: string) => void;
  addCertificate: (cert: Certificate) => void;
  deleteCertificate: (id: string) => void;
  addTestimonial: (test: Testimonial) => void;
  deleteTestimonial: (id: string) => void;
  addExperience: (exp: Experience) => void;
  deleteExperience: (id: string) => void;
  deleteMessage: (id: string) => void;
  updateProfileAndStats: (newProfile: ProfileData, newStats: PortfolioStats) => void;
  techSkills: TechSkill[];
  addTechSkill: (skill: TechSkill) => void;
  deleteTechSkill: (id: string) => void;
  seedDefaultTechSkills: () => Promise<void>;
  addBlog: (blog: BlogPost) => void;
  deleteBlog: (id: string) => void;
  addShortLink: (link: ShortLink) => void;
  deleteShortLink: (slug: string) => void;
  backupData: () => void;
  restoreData: (json: string) => Promise<void>;
}

const defaultStats = DEFAULT_STATS;
const defaultProfile = DEFAULT_PROFILE;

const ProjectStoreContext = createContext<ProjectStoreType | undefined>(undefined);

// In-memory cache for public visitors to ensure 0ms instant render across page navigation
let cachedStoreState: {
  projects: Project[];
  certificates: Certificate[];
  testimonials: Testimonial[];
  experiences: Experience[];
  messages: ContactMessage[];
  techSkills: TechSkill[];
  blogs: BlogPost[];
  profile: ProfileData;
  stats: PortfolioStats;
} | null = null;

export const ProjectStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const firestore = useFirestore();
  const { toast } = useToast();

  const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

  const projectsPath = isAdmin ? 'projects' : null;
  const certsPath = isAdmin ? 'certificates' : null;
  const testsPath = isAdmin ? 'testimonials' : null;
  const journeyPath = isAdmin ? 'careerTimelineEntries' : null;
  const messagesPath = isAdmin ? 'messages' : null;
  const techSkillsPath = isAdmin ? 'techSkills' : null;
  const blogsPath = isAdmin ? 'blogs' : null;
  const shortLinksPath = isAdmin ? 'shortLinks' : null;
  const profileDocPath = isAdmin ? 'portfolioOwner/profile' : null;

  const { data: adminProjects, isLoading: loadingProjects } = useCollection<Project>(projectsPath);
  const { data: adminCerts, isLoading: loadingCerts } = useCollection<Certificate>(certsPath);
  const { data: adminTests, isLoading: loadingTests } = useCollection<Testimonial>(testsPath);
  const { data: adminJourney, isLoading: loadingJourney } = useCollection<Experience>(journeyPath);
  const { data: adminMessages, isLoading: loadingMessages } = useCollection<ContactMessage>(messagesPath);
  const { data: adminTechSkills, isLoading: loadingTechSkills } = useCollection<TechSkill>(techSkillsPath);
  const { data: adminBlogs, isLoading: loadingBlogs } = useCollection<BlogPost>(blogsPath);
  const { data: adminShortLinks, isLoading: loadingShortLinks } = useCollection<ShortLink>(shortLinksPath);
  const { data: adminProfile, isLoading: loadingProfile } = useDoc<any>(profileDocPath);

  const [publicData, setPublicData] = useState<typeof cachedStoreState>(cachedStoreState);
  const [isPublicLoading, setIsPublicLoading] = useState(!cachedStoreState && !isAdmin);
  const [publicError, setPublicError] = useState<any>(null);

  useEffect(() => {
    if (isAdmin || cachedStoreState) return;

    let isMounted = true;

    async function fetchPublicData() {
      try {
        const res = await fetch('/api/public-data');
        if (!res.ok) throw new Error('Failed to fetch public data');
        const fullState = await res.json();

        if (!isMounted) return;

        cachedStoreState = fullState;
        setPublicData(fullState);
        setIsPublicLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        setPublicError(err);
        setIsPublicLoading(false);
      }
    }

    fetchPublicData();

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);


  const projects = isAdmin ? (adminProjects || []) : (publicData?.projects || []);
  const certificates = isAdmin ? (adminCerts || []) : (publicData?.certificates || []);
  const testimonials = isAdmin ? (adminTests || []) : (publicData?.testimonials || []);
  const experiences = isAdmin ? (adminJourney || []) : (publicData?.experiences || []);
  const messages = isAdmin ? (adminMessages || []) : (publicData?.messages || []);
  const techSkills = isAdmin ? (adminTechSkills || []) : (publicData?.techSkills || []);
  const blogs = isAdmin ? ((adminBlogs || []).map((b: any) => ({
    id: b.id,
    slug: b.slug || b.id,
    titleId: b.titleId || '',
    titleEn: b.titleEn || '',
    summaryId: b.summaryId || '',
    summaryEn: b.summaryEn || '',
    contentId: b.contentId || '',
    contentEn: b.contentEn || '',
    coverImage: b.coverImage || '',
    tags: Array.isArray(b.tags) ? b.tags : (b.tags ? b.tags.split(',').map((t: string) => t.trim()) : []),
    author: b.author || 'Nara Andra Tyaga',
    publishedAt: b.publishedAt || new Date().toISOString(),
    readingTime: b.readingTime || '3 min read',
    featured: !!b.featured,
    updatedAt: b.updatedAt || '',
  }))) : (publicData?.blogs || []);

  const shortLinks = isAdmin ? ((adminShortLinks || []).map((l: any) => ({
    id: l.id,
    slug: l.slug || l.id,
    originalUrl: l.originalUrl || '',
    title: l.title || '',
    description: l.description || '',
    isActive: l.isActive !== false,
    clickCount: Number(l.clickCount) || 0,
    createdAt: l.createdAt || '',
    updatedAt: l.updatedAt || '',
    safetyStatus: l.safetyStatus || 'unverified'
  }))) : [];

  const profile: ProfileData = isAdmin ? (adminProfile ? {
    name: adminProfile.name || defaultProfile.name,
    roleId: adminProfile.roleId || defaultProfile.roleId,
    roleEn: adminProfile.roleEn || defaultProfile.roleEn,
    aboutMeId: adminProfile.aboutMeId || defaultProfile.aboutMeId,
    aboutMeEn: adminProfile.aboutMeEn || defaultProfile.aboutMeEn,
    profilePictureUrl: adminProfile.profilePictureUrl || defaultProfile.profilePictureUrl,
    heroTitleId: adminProfile.heroTitleId || defaultProfile.heroTitleId,
    heroTitleEn: adminProfile.heroTitleEn || defaultProfile.heroTitleEn,
    heroSubtitleId: adminProfile.heroSubtitleId || defaultProfile.heroSubtitleId,
    heroSubtitleEn: adminProfile.heroSubtitleEn || defaultProfile.heroSubtitleEn,
    email: adminProfile.email || defaultProfile.email,
    whatsapp: adminProfile.whatsAppNumber || defaultProfile.whatsapp,
    linkedin: adminProfile.linkedInProfileUrl || defaultProfile.linkedin,
    instagram: adminProfile.instagram || defaultProfile.instagram,
    github: adminProfile.githubProfileUrl || defaultProfile.github,
    tiktok: adminProfile.tiktok || defaultProfile.tiktok,
    cvUrl: adminProfile.cvUrl || '',
    cvFileName: adminProfile.cvFileName || '',
    cvUpdatedAt: adminProfile.cvUpdatedAt || '',
    cvStoragePath: adminProfile.cvStoragePath || ''
  } : defaultProfile) : (publicData?.profile || defaultProfile);

  const stats: PortfolioStats = isAdmin ? (adminProfile ? {
    completedProjects: String(adminProfile.totalProjectsCompleted || defaultStats.completedProjects),
    yearsExperience: String(adminProfile.codingExperienceYears || defaultStats.yearsExperience),
    techMastered: String(adminProfile.totalTechnologiesMastered || defaultStats.techMastered),
    clientSatisfaction: adminProfile.clientSatisfaction || defaultStats.clientSatisfaction
  } : defaultStats) : (publicData?.stats || defaultStats);

  const isLoading = isAdmin
    ? (loadingProjects || loadingCerts || loadingTests || loadingJourney || loadingProfile || loadingMessages || loadingTechSkills || loadingBlogs)
    : isPublicLoading;

  const error = isAdmin ? null : publicError;

  const backupData = async () => {
    const data = {
      projects,
      certificates,
      testimonials,
      experiences,
      blogs,
      techSkills,
      profile,
      stats,
      version: '2.5.0',
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `karyapro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast({ title: "Backup Created", description: "JSON file downloaded." });
  };

  const restoreData = async (json: string) => {
    if (!firestore) return;
    try {
      const { doc, writeBatch } = await import('firebase/firestore');
      const data = JSON.parse(json);
      const batch = writeBatch(firestore);
      if (!data.projects || !data.certificates) throw new Error("Invalid format");
      data.projects.forEach((p: any) => batch.set(doc(firestore, 'projects', p.id), p));
      data.certificates.forEach((c: any) => batch.set(doc(firestore, 'certificates', c.id), c));
      data.testimonials?.forEach((t: any) => batch.set(doc(firestore, 'testimonials', t.id), t));
      data.experiences?.forEach((e: any) => batch.set(doc(firestore, 'careerTimelineEntries', e.id), e));
      data.blogs?.forEach((b: any) => batch.set(doc(firestore, 'blogs', b.id), b));
      data.techSkills?.forEach((s: any) => batch.set(doc(firestore, 'techSkills', s.id), s));
      await batch.commit();
      toast({ title: "Restore Successful" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Restore Failed", description: e.message });
    }
  };

  const addProject = async (project: Project) => {
    if (!firestore) return;
    const { doc } = await import('firebase/firestore');
    const { setDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
    const docRef = doc(firestore, 'projects', project.id);
    setDocumentNonBlocking(docRef, { ...project, updatedAt: new Date().toISOString() }, { merge: true });
  };

  const setFeaturedProject = async (projectId: string) => {
    if (!firestore || projects.length === 0) return;
    const { doc, writeBatch } = await import('firebase/firestore');
    const batch = writeBatch(firestore);
    projects.forEach(p => {
      const projectRef = doc(firestore, 'projects', p.id);
      const isTarget = p.id === projectId;
      batch.update(projectRef, { featured: isTarget });
    });
    try {
      await batch.commit();
      toast({
        title: "Proyek Unggulan Diperbarui",
        description: "Proyek pilihan Anda kini akan tampil di halaman utama.",
      });
    } catch (e) {
      console.error("Gagal mengatur proyek unggulan:", e);
      toast({
        variant: "destructive",
        title: "Gagal Memperbarui",
        description: "Terjadi kesalahan saat memilih proyek unggulan.",
      });
    }
  };

  const deleteProject = async (id: string) => {
    if (!firestore) return;
    const { doc } = await import('firebase/firestore');
    const { deleteDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
    deleteDocumentNonBlocking(doc(firestore, 'projects', id));
  };
  const addCertificate = async (cert: Certificate) => {
    if (!firestore) return;
    const { doc } = await import('firebase/firestore');
    const { setDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
    setDocumentNonBlocking(doc(firestore, 'certificates', cert.id), { ...cert, updatedAt: new Date().toISOString() }, { merge: true });
  };
  const deleteCertificate = async (id: string) => {
    if (!firestore) return;
    const { doc } = await import('firebase/firestore');
    const { deleteDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
    deleteDocumentNonBlocking(doc(firestore, 'certificates', id));
  };
  const addTestimonial = async (test: Testimonial) => {
    if (!firestore) return;
    const { doc } = await import('firebase/firestore');
    const { setDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
    setDocumentNonBlocking(doc(firestore, 'testimonials', test.id), test, { merge: true });
  };
  const deleteTestimonial = async (id: string) => {
    if (!firestore) return;
    const { doc } = await import('firebase/firestore');
    const { deleteDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
    deleteDocumentNonBlocking(doc(firestore, 'testimonials', id));
  };
  const addExperience = async (exp: Experience) => {
    if (!firestore) return;
    const { doc } = await import('firebase/firestore');
    const { setDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
    setDocumentNonBlocking(doc(firestore, 'careerTimelineEntries', exp.id), exp, { merge: true });
  };
  const deleteExperience = async (id: string) => {
    if (!firestore) return;
    const { doc } = await import('firebase/firestore');
    const { deleteDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
    deleteDocumentNonBlocking(doc(firestore, 'careerTimelineEntries', id));
  };
  const deleteMessage = async (id: string) => {
    if (!firestore) return;
    const { doc } = await import('firebase/firestore');
    const { deleteDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
    deleteDocumentNonBlocking(doc(firestore, 'messages', id));
  };
  const addTechSkill = async (skill: TechSkill) => {
    if (!firestore) return;
    const { doc } = await import('firebase/firestore');
    const { setDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
    setDocumentNonBlocking(doc(firestore, 'techSkills', skill.id), { ...skill, updatedAt: new Date().toISOString() }, { merge: true });
    try {
      const { revalidatePortfolio } = await import('@/app/actions/revalidate');
      await revalidatePortfolio('/');
    } catch (e) {
      console.warn('Revalidate error:', e);
    }
  };
  const deleteTechSkill = async (id: string) => {
    if (!firestore) return;
    const { doc } = await import('firebase/firestore');
    const { deleteDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
    deleteDocumentNonBlocking(doc(firestore, 'techSkills', id));
    try {
      const { revalidatePortfolio } = await import('@/app/actions/revalidate');
      await revalidatePortfolio('/');
    } catch (e) {
      console.warn('Revalidate error:', e);
    }
  };
  const seedDefaultTechSkills = async () => {
    if (!firestore) return;
    const { doc, writeBatch } = await import('firebase/firestore');
    const { defaultTechStack } = await import('@/components/sections/TechStack');
    const batch = writeBatch(firestore);
    defaultTechStack.forEach(skill => {
      const ref = doc(firestore, 'techSkills', skill.id);
      batch.set(ref, { ...skill, updatedAt: new Date().toISOString() }, { merge: true });
    });
    await batch.commit();
    try {
      const { revalidatePortfolio } = await import('@/app/actions/revalidate');
      await revalidatePortfolio('/');
    } catch (e) {
      console.warn('Revalidate error:', e);
    }
  };
  const addBlog = async (blog: BlogPost) => {
    if (!firestore) return;
    const { doc } = await import('firebase/firestore');
    const { setDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
    setDocumentNonBlocking(doc(firestore, 'blogs', blog.id), { ...blog, updatedAt: new Date().toISOString() }, { merge: true });
  };
  const deleteBlog = async (id: string) => {
    if (!firestore) return;
    const { doc } = await import('firebase/firestore');
    const { deleteDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
    deleteDocumentNonBlocking(doc(firestore, 'blogs', id));
  };

  const addShortLink = async (link: ShortLink) => {
    if (!firestore) return;
    const { doc } = await import('firebase/firestore');
    const { setDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
    const cleanSlug = link.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const docRef = doc(firestore, 'shortLinks', cleanSlug);
    setDocumentNonBlocking(docRef, { ...link, slug: cleanSlug, updatedAt: new Date().toISOString() }, { merge: true });
  };
  const deleteShortLink = async (slug: string) => {
    if (!firestore) return;
    const { doc } = await import('firebase/firestore');
    const { deleteDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
    deleteDocumentNonBlocking(doc(firestore, 'shortLinks', slug));
  };

  const updateProfileAndStats = async (newProfile: ProfileData, newStats: PortfolioStats) => {
    if (!firestore) return;
    const { doc } = await import('firebase/firestore');
    const { setDocumentNonBlocking } = await import('@/firebase/non-blocking-updates');
    const dataToUpdate = {
      name: newProfile.name,
      roleId: newProfile.roleId,
      roleEn: newProfile.roleEn,
      aboutMeId: newProfile.aboutMeId,
      aboutMeEn: newProfile.aboutMeEn,
      profilePictureUrl: newProfile.profilePictureUrl,
      heroTitleId: newProfile.heroTitleId,
      heroTitleEn: newProfile.heroTitleEn,
      heroSubtitleId: newProfile.heroSubtitleId,
      heroSubtitleEn: newProfile.heroSubtitleEn,
      email: newProfile.email,
      whatsAppNumber: newProfile.whatsapp,
      linkedInProfileUrl: newProfile.linkedin,
      instagram: newProfile.instagram,
      githubProfileUrl: newProfile.github,
      tiktok: newProfile.tiktok,
      cvUrl: newProfile.cvUrl || '',
      cvFileName: newProfile.cvFileName || '',
      cvUpdatedAt: newProfile.cvUpdatedAt || '',
      cvStoragePath: newProfile.cvStoragePath || '',
      totalProjectsCompleted: parseInt(newStats.completedProjects) || 0,
      codingExperienceYears: parseInt(newStats.yearsExperience) || 0,
      totalTechnologiesMastered: parseInt(newStats.techMastered) || 0,
      clientSatisfaction: newStats.clientSatisfaction,
      updatedAt: new Date().toISOString()
    };
    const pRef = doc(firestore, 'portfolioOwner', 'profile');
    setDocumentNonBlocking(pRef, dataToUpdate, { merge: true });
  };

  return (
    <ProjectStoreContext.Provider value={{
      projects, certificates, testimonials, experiences, messages, stats, profile, techSkills, blogs, shortLinks, isLoading, error,
      addProject, deleteProject, setFeaturedProject, addCertificate, deleteCertificate,
      addTestimonial, deleteTestimonial, addExperience, deleteExperience,
      deleteMessage, updateProfileAndStats, addTechSkill, deleteTechSkill, seedDefaultTechSkills, addBlog, deleteBlog,
      addShortLink, deleteShortLink, backupData, restoreData
    }}>
      {children}
    </ProjectStoreContext.Provider>
  );
};

export const useProjectStore = () => {
  const context = useContext(ProjectStoreContext);
  if (!context) {
    return {
      projects: [],
      certificates: [],
      testimonials: [],
      experiences: [],
      messages: [],
      stats: defaultStats,
      profile: defaultProfile,
      blogs: [],
      shortLinks: [],
      isLoading: false,
      error: null,
      addProject: () => { },
      deleteProject: () => { },
      setFeaturedProject: () => { },
      addCertificate: () => { },
      deleteCertificate: () => { },
      addTestimonial: () => { },
      deleteTestimonial: () => { },
      addExperience: () => { },
      deleteExperience: () => { },
      deleteMessage: () => { },
      updateProfileAndStats: () => { },
      techSkills: [],
      addTechSkill: () => { },
      deleteTechSkill: () => { },
      seedDefaultTechSkills: async () => { },
      addBlog: () => { },
      deleteBlog: () => { },
      addShortLink: () => { },
      deleteShortLink: () => { },
      backupData: () => { },
      restoreData: async () => { },
    };
  }
  return context;
};

