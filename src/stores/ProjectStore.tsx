
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Certificate, PortfolioStats, ProfileData, Testimonial, Experience, ContactMessage, TechSkill, BlogPost, ShortLink } from '@/lib/types';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, getDocs, getDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
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
  addBlog: (blog: BlogPost) => void;
  deleteBlog: (id: string) => void;
  addShortLink: (link: ShortLink) => void;
  deleteShortLink: (slug: string) => void;
  backupData: () => void;
  restoreData: (json: string) => Promise<void>;
}

const defaultStats: PortfolioStats = {
  completedProjects: '12',
  yearsExperience: '5',
  techMastered: '20',
  clientSatisfaction: '100%'
};

const defaultProfile: ProfileData = {
  name: 'Nara Andra Tyaga',
  roleId: 'Pengembang Full-Stack',
  roleEn: 'Full-Stack Developer',
  aboutMeId: 'Saya seorang pengembang full-stack dengan hasrat untuk membangun aplikasi web yang indah dan fungsional.',
  aboutMeEn: 'I am a full-stack developer with a passion for building beautiful and functional web applications.',
  profilePictureUrl: '/profile-fallback.jpg',
  heroTitleId: 'Rekayasa Dampak Digital',
  heroTitleEn: 'Engineering Digital Impact',
  heroSubtitleId: 'Saya merancang dan mengembangkan solusi perangkat lunak yang andal, dapat diskalakan, dan berpusat pada pengguna, mengubah ide-ide kompleks menjadi kenyataan digital.',
  heroSubtitleEn: 'I design and develop robust, scalable, and user-centric software solutions, turning complex ideas into digital realities.',
  email: 'admin@karyapro.app',
  whatsapp: '6281234567890',
  linkedin: 'https://www.linkedin.com/in/nara-andra-tyaga/',
  instagram: 'https://www.instagram.com/nara.dev/',
  github: 'https://github.com/naradev',
  tiktok: 'https://www.tiktok.com/@naradev',
  cvUrl: '',
  cvFileName: '',
  cvUpdatedAt: '',
  cvStoragePath: '',
};


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

  // Real-time queries for Admin dashboard only
  const projectsQuery = useMemoFirebase(() => (isAdmin ? collection(firestore, 'projects') : null), [firestore, isAdmin]);
  const certsQuery = useMemoFirebase(() => (isAdmin ? collection(firestore, 'certificates') : null), [firestore, isAdmin]);
  const testsQuery = useMemoFirebase(() => (isAdmin ? collection(firestore, 'testimonials') : null), [firestore, isAdmin]);
  const journeyQuery = useMemoFirebase(() => (isAdmin ? collection(firestore, 'careerTimelineEntries') : null), [firestore, isAdmin]);
  const messagesQuery = useMemoFirebase(() => (isAdmin ? collection(firestore, 'messages') : null), [firestore, isAdmin]);
  const techSkillsQuery = useMemoFirebase(() => (isAdmin ? collection(firestore, 'techSkills') : null), [firestore, isAdmin]);
  const blogsQuery = useMemoFirebase(() => (isAdmin ? collection(firestore, 'blogs') : null), [firestore, isAdmin]);
  const shortLinksQuery = useMemoFirebase(() => (isAdmin ? collection(firestore, 'shortLinks') : null), [firestore, isAdmin]);
  const profileDocRef = useMemoFirebase(() => (isAdmin ? doc(firestore, 'portfolioOwner', 'profile') : null), [firestore, isAdmin]);

  const { data: adminProjects, isLoading: loadingProjects } = useCollection<Project>(projectsQuery);
  const { data: adminCerts, isLoading: loadingCerts } = useCollection<Certificate>(certsQuery);
  const { data: adminTests, isLoading: loadingTests } = useCollection<Testimonial>(testsQuery);
  const { data: adminJourney, isLoading: loadingJourney } = useCollection<Experience>(journeyQuery);
  const { data: adminMessages, isLoading: loadingMessages } = useCollection<ContactMessage>(messagesQuery);
  const { data: adminTechSkills, isLoading: loadingTechSkills } = useCollection<TechSkill>(techSkillsQuery);
  const { data: adminBlogs, isLoading: loadingBlogs } = useCollection<BlogPost>(blogsQuery);
  const { data: adminShortLinks, isLoading: loadingShortLinks } = useCollection<ShortLink>(shortLinksQuery);
  const { data: adminProfile, isLoading: loadingProfile } = useDoc<any>(profileDocRef);

  // State for public one-time fetch
  const [publicData, setPublicData] = useState<typeof cachedStoreState>(cachedStoreState);
  const [isPublicLoading, setIsPublicLoading] = useState(!cachedStoreState && !isAdmin);
  const [publicError, setPublicError] = useState<any>(null);

  // One-time fetch for public pages to avoid persistent WebSockets & enable bfcache
  useEffect(() => {
    if (isAdmin || cachedStoreState) return;

    let isMounted = true;

    async function fetchPublicData() {
      try {
        // Critical Tier 1: Fetch Profile & Projects for instantaneous Hero LCP
        const [profileSnap, projectsSnap] = await Promise.all([
          getDoc(doc(firestore, 'portfolioOwner', 'profile')),
          getDocs(collection(firestore, 'projects')),
        ]);

        if (!isMounted) return;

        const pData: ProfileData = profileSnap.exists() ? {
          name: profileSnap.data()?.name || defaultProfile.name,
          roleId: profileSnap.data()?.roleId || defaultProfile.roleId,
          roleEn: profileSnap.data()?.roleEn || defaultProfile.roleEn,
          aboutMeId: profileSnap.data()?.aboutMeId || defaultProfile.aboutMeId,
          aboutMeEn: profileSnap.data()?.aboutMeEn || defaultProfile.aboutMeEn,
          profilePictureUrl: profileSnap.data()?.profilePictureUrl || defaultProfile.profilePictureUrl,
          heroTitleId: profileSnap.data()?.heroTitleId || defaultProfile.heroTitleId,
          heroTitleEn: profileSnap.data()?.heroTitleEn || defaultProfile.heroTitleEn,
          heroSubtitleId: profileSnap.data()?.heroSubtitleId || defaultProfile.heroSubtitleId,
          heroSubtitleEn: profileSnap.data()?.heroSubtitleEn || defaultProfile.heroSubtitleEn,
          email: profileSnap.data()?.email || defaultProfile.email,
          whatsapp: profileSnap.data()?.whatsAppNumber || defaultProfile.whatsapp,
          linkedin: profileSnap.data()?.linkedInProfileUrl || defaultProfile.linkedin,
          instagram: profileSnap.data()?.instagram || defaultProfile.instagram,
          github: profileSnap.data()?.githubProfileUrl || defaultProfile.github,
          tiktok: profileSnap.data()?.tiktok || defaultProfile.tiktok,
          cvUrl: profileSnap.data()?.cvUrl || '',
          cvFileName: profileSnap.data()?.cvFileName || '',
          cvUpdatedAt: profileSnap.data()?.cvUpdatedAt || '',
          cvStoragePath: profileSnap.data()?.cvStoragePath || '',
        } : defaultProfile;

        const sData: PortfolioStats = profileSnap.exists() ? {
          completedProjects: String(profileSnap.data()?.totalProjectsCompleted || defaultStats.completedProjects),
          yearsExperience: String(profileSnap.data()?.codingExperienceYears || defaultStats.yearsExperience),
          techMastered: String(profileSnap.data()?.totalTechnologiesMastered || defaultStats.techMastered),
          clientSatisfaction: profileSnap.data()?.clientSatisfaction || defaultStats.clientSatisfaction,
        } : defaultStats;

        const loadedProjects = projectsSnap.docs.map(d => ({ ...(d.data() as Project), id: d.id }));

        // Unblock initial Hero LCP immediately
        setPublicData(prev => ({
          ...(prev || {
            projects: loadedProjects,
            certificates: [],
            testimonials: [],
            experiences: [],
            messages: [],
            techSkills: [],
            blogs: [],
            profile: pData,
            stats: sData,
          }),
          projects: loadedProjects,
          profile: pData,
          stats: sData,
        }));
        setIsPublicLoading(false);

        // Secondary Tier 2: Fetch below-the-fold collections concurrently
        const [
          certsSnap,
          testsSnap,
          journeySnap,
          skillsSnap,
          blogsSnap,
        ] = await Promise.all([
          getDocs(collection(firestore, 'certificates')),
          getDocs(collection(firestore, 'testimonials')),
          getDocs(collection(firestore, 'careerTimelineEntries')),
          getDocs(collection(firestore, 'techSkills')),
          getDocs(collection(firestore, 'blogs')),
        ]);

        if (!isMounted) return;

        const fullState = {
          projects: loadedProjects,
          certificates: certsSnap.docs.map(d => ({ ...(d.data() as Certificate), id: d.id })),
          testimonials: testsSnap.docs.map(d => ({ ...(d.data() as Testimonial), id: d.id })),
          experiences: journeySnap.docs.map(d => ({ ...(d.data() as Experience), id: d.id })),
          messages: [],
          techSkills: skillsSnap.docs.map(d => ({ ...(d.data() as TechSkill), id: d.id })),
          blogs: blogsSnap.docs.map(d => {
            const b = d.data() as any;
            return {
              id: d.id,
              slug: b.slug || d.id,
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
            };
          }),
          profile: pData,
          stats: sData,
        };

        cachedStoreState = fullState;
        setPublicData(fullState);
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
  }, [firestore, isAdmin]);

  // Derived values
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

  const backupData = () => {
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
    try {
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

  const addProject = (project: Project) => {
    const docRef = doc(firestore, 'projects', project.id);
    setDocumentNonBlocking(docRef, { ...project, updatedAt: new Date().toISOString() }, { merge: true });
  };
  
  const setFeaturedProject = async (projectId: string) => {
    if (!firestore || projects.length === 0) return;
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

  const deleteProject = (id: string) => deleteDocumentNonBlocking(doc(firestore, 'projects', id));
  const addCertificate = (cert: Certificate) => setDocumentNonBlocking(doc(firestore, 'certificates', cert.id), { ...cert, updatedAt: new Date().toISOString() }, { merge: true });
  const deleteCertificate = (id: string) => deleteDocumentNonBlocking(doc(firestore, 'certificates', id));
  const addTestimonial = (test: Testimonial) => setDocumentNonBlocking(doc(firestore, 'testimonials', test.id), test, { merge: true });
  const deleteTestimonial = (id: string) => deleteDocumentNonBlocking(doc(firestore, 'testimonials', id));
  const addExperience = (exp: Experience) => setDocumentNonBlocking(doc(firestore, 'careerTimelineEntries', exp.id), exp, { merge: true });
  const deleteExperience = (id: string) => deleteDocumentNonBlocking(doc(firestore, 'careerTimelineEntries', id));
  const deleteMessage = (id: string) => deleteDocumentNonBlocking(doc(firestore, 'messages', id));
  const addTechSkill = (skill: TechSkill) => setDocumentNonBlocking(doc(firestore, 'techSkills', skill.id), { ...skill, updatedAt: new Date().toISOString() }, { merge: true });
  const deleteTechSkill = (id: string) => deleteDocumentNonBlocking(doc(firestore, 'techSkills', id));
  const addBlog = (blog: BlogPost) => setDocumentNonBlocking(doc(firestore, 'blogs', blog.id), { ...blog, updatedAt: new Date().toISOString() }, { merge: true });
  const deleteBlog = (id: string) => deleteDocumentNonBlocking(doc(firestore, 'blogs', id));

  const addShortLink = (link: ShortLink) => {
    const cleanSlug = link.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const docRef = doc(firestore, 'shortLinks', cleanSlug);
    setDocumentNonBlocking(docRef, { ...link, slug: cleanSlug, updatedAt: new Date().toISOString() }, { merge: true });
  };
  const deleteShortLink = (slug: string) => deleteDocumentNonBlocking(doc(firestore, 'shortLinks', slug));

  const updateProfileAndStats = (newProfile: ProfileData, newStats: PortfolioStats) => {
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
      deleteMessage, updateProfileAndStats, addTechSkill, deleteTechSkill, addBlog, deleteBlog,
      addShortLink, deleteShortLink, backupData, restoreData
    }}>
      {children}
    </ProjectStoreContext.Provider>
  );
};

export const useProjectStore = () => {
  const context = useContext(ProjectStoreContext);
  if (!context) throw new Error('useProjectStore error');
  return context;
};
