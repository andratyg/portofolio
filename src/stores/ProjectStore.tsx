
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
  addProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setFeaturedProject: (id: string) => Promise<void>;
  addCertificate: (cert: Certificate) => Promise<void>;
  deleteCertificate: (id: string) => Promise<void>;
  addTestimonial: (test: Testimonial) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  addExperience: (exp: Experience) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  updateProfileAndStats: (newProfile: ProfileData, newStats: PortfolioStats) => Promise<void>;
  techSkills: TechSkill[];
  addTechSkill: (skill: TechSkill) => Promise<void>;
  deleteTechSkill: (id: string) => Promise<void>;
  seedDefaultTechSkills: () => Promise<void>;
  addBlog: (blog: BlogPost) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  addShortLink: (link: ShortLink) => Promise<void>;
  deleteShortLink: (slug: string) => Promise<void>;
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

  // Reliable helper to ensure Firestore instance is available even if lazy context is resolving
  const getSafeDb = async () => {
    if (firestore) return firestore;
    const { getFirestore } = await import('firebase/firestore');
    const { initializeFirebase } = await import('@/firebase');
    const services = initializeFirebase();
    return getFirestore(services.firebaseApp);
  };

  const triggerRevalidate = async () => {
    try {
      const { revalidatePortfolio } = await import('@/app/actions/revalidate');
      await revalidatePortfolio('/');
    } catch (e) {
      console.warn('[ProjectStore] Revalidate error:', e);
    }
  };

  const backupData = async () => {
    const data = {
      projects,
      certificates,
      testimonials,
      experiences,
      blogs,
      techSkills,
      shortLinks,
      profile,
      stats,
      version: '2.6.0',
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
    const db = await getSafeDb();
    try {
      const { doc, writeBatch } = await import('firebase/firestore');
      const data = JSON.parse(json);
      const batch = writeBatch(db);
      if (!data.projects || !data.certificates) throw new Error("Invalid format");
      data.projects.forEach((p: any) => batch.set(doc(db, 'projects', p.id), p, { merge: true }));
      data.certificates.forEach((c: any) => batch.set(doc(db, 'certificates', c.id), c, { merge: true }));
      data.testimonials?.forEach((t: any) => batch.set(doc(db, 'testimonials', t.id), t, { merge: true }));
      data.experiences?.forEach((e: any) => batch.set(doc(db, 'careerTimelineEntries', e.id), e, { merge: true }));
      data.blogs?.forEach((b: any) => batch.set(doc(db, 'blogs', b.id), b, { merge: true }));
      data.techSkills?.forEach((s: any) => batch.set(doc(db, 'techSkills', s.id), s, { merge: true }));
      data.shortLinks?.forEach((l: any) => batch.set(doc(db, 'shortLinks', l.slug || l.id), l, { merge: true }));
      await batch.commit();
      await triggerRevalidate();
      toast({ title: "Restore Successful" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Restore Failed", description: e.message });
      throw e;
    }
  };

  const addProject = async (project: Project) => {
    const db = await getSafeDb();
    const { doc, setDoc } = await import('firebase/firestore');
    const { sanitizeFirestoreData } = await import('@/firebase/non-blocking-updates');
    const docRef = doc(db, 'projects', project.id);
    const sanitized = sanitizeFirestoreData({ ...project, updatedAt: new Date().toISOString() });
    await setDoc(docRef, sanitized, { merge: true });
    await triggerRevalidate();
  };

  const setFeaturedProject = async (projectId: string) => {
    const db = await getSafeDb();
    if (projects.length === 0) return;
    const { doc, writeBatch } = await import('firebase/firestore');
    const batch = writeBatch(db);
    projects.forEach(p => {
      const projectRef = doc(db, 'projects', p.id);
      const isTarget = p.id === projectId;
      batch.update(projectRef, { featured: isTarget });
    });
    try {
      await batch.commit();
      await triggerRevalidate();
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
      throw e;
    }
  };

  const deleteProject = async (id: string) => {
    const db = await getSafeDb();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'projects', id));
    await triggerRevalidate();
  };

  const addCertificate = async (cert: Certificate) => {
    const db = await getSafeDb();
    const { doc, setDoc } = await import('firebase/firestore');
    const { sanitizeFirestoreData } = await import('@/firebase/non-blocking-updates');
    const docRef = doc(db, 'certificates', cert.id);
    const sanitized = sanitizeFirestoreData({ ...cert, updatedAt: new Date().toISOString() });
    await setDoc(docRef, sanitized, { merge: true });
    await triggerRevalidate();
  };

  const deleteCertificate = async (id: string) => {
    const db = await getSafeDb();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'certificates', id));
    await triggerRevalidate();
  };

  const addTestimonial = async (test: Testimonial) => {
    const db = await getSafeDb();
    const { doc, setDoc } = await import('firebase/firestore');
    const { sanitizeFirestoreData } = await import('@/firebase/non-blocking-updates');
    const docRef = doc(db, 'testimonials', test.id);
    const sanitized = sanitizeFirestoreData(test);
    await setDoc(docRef, sanitized, { merge: true });
    await triggerRevalidate();
  };

  const deleteTestimonial = async (id: string) => {
    const db = await getSafeDb();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'testimonials', id));
    await triggerRevalidate();
  };

  const addExperience = async (exp: Experience) => {
    const db = await getSafeDb();
    const { doc, setDoc } = await import('firebase/firestore');
    const { sanitizeFirestoreData } = await import('@/firebase/non-blocking-updates');
    const docRef = doc(db, 'careerTimelineEntries', exp.id);
    const sanitized = sanitizeFirestoreData(exp);
    await setDoc(docRef, sanitized, { merge: true });
    await triggerRevalidate();
  };

  const deleteExperience = async (id: string) => {
    const db = await getSafeDb();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'careerTimelineEntries', id));
    await triggerRevalidate();
  };

  const deleteMessage = async (id: string) => {
    const db = await getSafeDb();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'messages', id));
  };

  const addTechSkill = async (skill: TechSkill) => {
    const db = await getSafeDb();
    const { doc, setDoc } = await import('firebase/firestore');
    const { sanitizeFirestoreData } = await import('@/firebase/non-blocking-updates');
    const docRef = doc(db, 'techSkills', skill.id);
    const sanitized = sanitizeFirestoreData({ ...skill, updatedAt: new Date().toISOString() });
    await setDoc(docRef, sanitized, { merge: true });
    await triggerRevalidate();
  };

  const deleteTechSkill = async (id: string) => {
    const db = await getSafeDb();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'techSkills', id));
    await triggerRevalidate();
  };

  const seedDefaultTechSkills = async () => {
    const db = await getSafeDb();
    const { doc, writeBatch } = await import('firebase/firestore');
    const { defaultTechStack } = await import('@/components/sections/TechStack');
    const batch = writeBatch(db);
    defaultTechStack.forEach(skill => {
      const ref = doc(db, 'techSkills', skill.id);
      batch.set(ref, { ...skill, updatedAt: new Date().toISOString() }, { merge: true });
    });
    await batch.commit();
    await triggerRevalidate();
  };

  const addBlog = async (blog: BlogPost) => {
    const db = await getSafeDb();
    const { doc, setDoc } = await import('firebase/firestore');
    const { sanitizeFirestoreData } = await import('@/firebase/non-blocking-updates');
    const docRef = doc(db, 'blogs', blog.id);
    const sanitized = sanitizeFirestoreData({ ...blog, updatedAt: new Date().toISOString() });
    await setDoc(docRef, sanitized, { merge: true });
    await triggerRevalidate();
  };

  const deleteBlog = async (id: string) => {
    const db = await getSafeDb();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'blogs', id));
    await triggerRevalidate();
  };

  const addShortLink = async (link: ShortLink) => {
    const db = await getSafeDb();
    const { doc, setDoc } = await import('firebase/firestore');
    const { sanitizeFirestoreData } = await import('@/firebase/non-blocking-updates');
    const cleanSlug = link.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const docRef = doc(db, 'shortLinks', cleanSlug);
    const sanitized = sanitizeFirestoreData({ ...link, slug: cleanSlug, updatedAt: new Date().toISOString() });
    await setDoc(docRef, sanitized, { merge: true });
  };

  const deleteShortLink = async (slug: string) => {
    const db = await getSafeDb();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'shortLinks', slug));
  };

  const updateProfileAndStats = async (newProfile: ProfileData, newStats: PortfolioStats) => {
    const db = await getSafeDb();
    const { doc, setDoc } = await import('firebase/firestore');
    const { sanitizeFirestoreData } = await import('@/firebase/non-blocking-updates');
    const dataToUpdate = sanitizeFirestoreData({
      name: newProfile.name || defaultProfile.name,
      roleId: newProfile.roleId || defaultProfile.roleId,
      roleEn: newProfile.roleEn || defaultProfile.roleEn,
      aboutMeId: newProfile.aboutMeId || defaultProfile.aboutMeId,
      aboutMeEn: newProfile.aboutMeEn || defaultProfile.aboutMeEn,
      profilePictureUrl: newProfile.profilePictureUrl || defaultProfile.profilePictureUrl,
      heroTitleId: newProfile.heroTitleId || defaultProfile.heroTitleId,
      heroTitleEn: newProfile.heroTitleEn || defaultProfile.heroTitleEn,
      heroSubtitleId: newProfile.heroSubtitleId || defaultProfile.heroSubtitleId,
      heroSubtitleEn: newProfile.heroSubtitleEn || defaultProfile.heroSubtitleEn,
      email: newProfile.email || defaultProfile.email,
      whatsAppNumber: newProfile.whatsapp || defaultProfile.whatsapp,
      linkedInProfileUrl: newProfile.linkedin || defaultProfile.linkedin,
      instagram: newProfile.instagram || defaultProfile.instagram,
      githubProfileUrl: newProfile.github || defaultProfile.github,
      tiktok: newProfile.tiktok || defaultProfile.tiktok,
      cvUrl: newProfile.cvUrl || '',
      cvFileName: newProfile.cvFileName || '',
      cvUpdatedAt: newProfile.cvUpdatedAt || '',
      cvStoragePath: newProfile.cvStoragePath || '',
      totalProjectsCompleted: parseInt(newStats.completedProjects) || 0,
      codingExperienceYears: parseInt(newStats.yearsExperience) || 0,
      totalTechnologiesMastered: parseInt(newStats.techMastered) || 0,
      clientSatisfaction: newStats.clientSatisfaction || defaultStats.clientSatisfaction,
      updatedAt: new Date().toISOString()
    });
    const pRef = doc(db, 'portfolioOwner', 'profile');
    await setDoc(pRef, dataToUpdate, { merge: true });
    await triggerRevalidate();
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
      addProject: async () => { },
      deleteProject: async () => { },
      setFeaturedProject: async () => { },
      addCertificate: async () => { },
      deleteCertificate: async () => { },
      addTestimonial: async () => { },
      deleteTestimonial: async () => { },
      addExperience: async () => { },
      deleteExperience: async () => { },
      deleteMessage: async () => { },
      updateProfileAndStats: async () => { },
      techSkills: [],
      addTechSkill: async () => { },
      deleteTechSkill: async () => { },
      seedDefaultTechSkills: async () => { },
      addBlog: async () => { },
      deleteBlog: async () => { },
      addShortLink: async () => { },
      deleteShortLink: async () => { },
      backupData: () => { },
      restoreData: async () => { },
    };
  }
  return context;
};

