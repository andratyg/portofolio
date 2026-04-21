
"use client"

import React, { createContext, useContext } from 'react';
import { Project, Certificate, PortfolioStats, ProfileData, Testimonial, Experience, ContactMessage } from '@/lib/types';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
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
  profilePictureUrl: 'https://firebasestorage.googleapis.com/v0/b/personalsite-ad939.appspot.com/o/profile%2Fphoto.jpg?alt=media&token=c1a3258a-e555-4428-a63b-31d167c61f25',
  heroTitleId: 'Rekayasa Dampak Digital',
  heroTitleEn: 'Engineering Digital Impact',
  heroSubtitleId: 'Saya merancang dan mengembangkan solusi perangkat lunak yang andal, dapat diskalakan, dan berpusat pada pengguna, mengubah ide-ide kompleks menjadi kenyataan digital.',
  heroSubtitleEn: 'I design and develop robust, scalable, and user-centric software solutions, turning complex ideas into digital realities.',
  email: 'admin@karyapro.app',
  whatsapp: '6281234567890',
  linkedin: 'https://www.linkedin.com/in/nara-andra-tyaga/',
  instagram: 'https://www.instagram.com/nara.dev/',
  github: 'https://github.com/naradev',
  tiktok: 'https://www.tiktok.com/@naradev'
};


const ProjectStoreContext = createContext<ProjectStoreType | undefined>(undefined);

export const ProjectStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const firestore = useFirestore();
  const { toast } = useToast();

  const projectsQuery = useMemoFirebase(() => collection(firestore, 'projects'), [firestore]);
  const certsQuery = useMemoFirebase(() => collection(firestore, 'certificates'), [firestore]);
  const testsQuery = useMemoFirebase(() => collection(firestore, 'testimonials'), [firestore]);
  const journeyQuery = useMemoFirebase(() => collection(firestore, 'careerTimelineEntries'), [firestore]);
  const messagesQuery = useMemoFirebase(() => collection(firestore, 'messages'), [firestore]);
  const profileDocRef = useMemoFirebase(() => doc(firestore, 'portfolioOwner', 'profile'), [firestore]);

  const { data: projectsData, isLoading: loadingProjects, error: errorProjects } = useCollection<Project>(projectsQuery);
  const { data: certsData, isLoading: loadingCerts, error: errorCerts } = useCollection<Certificate>(certsQuery);
  const { data: testsData, isLoading: loadingTests, error: errorTests } = useCollection<Testimonial>(testsQuery);
  const { data: journeyData, isLoading: loadingJourney, error: errorJourney } = useCollection<Experience>(journeyQuery);
  const { data: messagesData, isLoading: loadingMessages, error: errorMessages } = useCollection<ContactMessage>(messagesQuery);
  const { data: profileData, isLoading: loadingProfile, error: errorProfile } = useDoc<any>(profileDocRef);

  const projects = projectsData || [];
  const testimonials = testsData || [];
  const experiences = journeyData || [];
  const messages = messagesData || [];
  const certificates: Certificate[] = (certsData || []).map((c: any) => ({
    id: c.id,
    titleId: c.titleId || '',
    titleEn: c.titleEn || '',
    shortDescriptionId: c.shortDescriptionId || '',
    shortDescriptionEn: c.shortDescriptionEn || '',
    fullDescriptionId: c.fullDescriptionId || '',
    fullDescriptionEn: c.fullDescriptionEn || '',
    year: c.year || '',
    issuer: c.issuer || '',
    validUntil: c.validUntil || 'N/A',
    imageUrl: c.imageUrl || c.url || '',
    credentialUrl: c.credentialUrl || '',
  }));

  const profile: ProfileData = profileData ? {
    name: profileData.name || defaultProfile.name,
    roleId: profileData.roleId || defaultProfile.roleId,
    roleEn: profileData.roleEn || defaultProfile.roleEn,
    aboutMeId: profileData.aboutMeId || defaultProfile.aboutMeId,
    aboutMeEn: profileData.aboutMeEn || defaultProfile.aboutMeEn,
    profilePictureUrl: profileData.profilePictureUrl || defaultProfile.profilePictureUrl,
    heroTitleId: profileData.heroTitleId || defaultProfile.heroTitleId,
    heroTitleEn: profileData.heroTitleEn || defaultProfile.heroTitleEn,
    heroSubtitleId: profileData.heroSubtitleId || defaultProfile.heroSubtitleId,
    heroSubtitleEn: profileData.heroSubtitleEn || defaultProfile.heroSubtitleEn,
    email: profileData.email || defaultProfile.email,
    whatsapp: profileData.whatsAppNumber || defaultProfile.whatsapp,
    linkedin: profileData.linkedInProfileUrl || defaultProfile.linkedin,
    instagram: profileData.instagram || defaultProfile.instagram,
    github: profileData.githubProfileUrl || defaultProfile.github,
    tiktok: profileData.tiktok || defaultProfile.tiktok
  } : defaultProfile;

  const stats: PortfolioStats = profileData ? {
    completedProjects: String(profileData.totalProjectsCompleted || '0'),
    yearsExperience: String(profileData.codingExperienceYears || '0'),
    techMastered: String(profileData.totalTechnologiesMastered || '0'),
    clientSatisfaction: profileData.clientSatisfaction || '100%'
  } : defaultStats;

  const isLoading = loadingProjects || loadingCerts || loadingTests || loadingJourney || loadingProfile || loadingMessages;
  const error = errorProjects || errorCerts || errorTests || errorJourney || errorProfile || errorMessages;

  const backupData = () => {
    const data = {
      projects,
      certificates,
      testimonials,
      experiences,
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
      data.testimonials.forEach((t: any) => batch.set(doc(firestore, 'testimonials', t.id), t));
      data.experiences.forEach((e: any) => batch.set(doc(firestore, 'careerTimelineEntries', e.id), e));
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
      totalProjectsCompleted: parseInt(newStats.completedProjects) || 0,
      codingExperienceYears: parseInt(newStats.yearsExperience) || 0,
      totalTechnologiesMastered: parseInt(newStats.techMastered) || 0,
      clientSatisfaction: newStats.clientSatisfaction,
      updatedAt: new Date().toISOString()
    };
    setDocumentNonBlocking(profileDocRef, dataToUpdate, { merge: true });
  };

  return (
    <ProjectStoreContext.Provider value={{ 
      projects, certificates, testimonials, experiences, messages, stats, profile, isLoading, error,
      addProject, deleteProject, setFeaturedProject, addCertificate, deleteCertificate,
      addTestimonial, deleteTestimonial, addExperience, deleteExperience,
      deleteMessage, updateProfileAndStats, backupData, restoreData
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
