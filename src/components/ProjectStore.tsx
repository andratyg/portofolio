
"use client"

import React, { createContext, useContext, useState } from 'react';
import { Project, Certificate, PortfolioStats, ProfileData, Testimonial, Experience } from '@/lib/types';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { 
  setDocumentNonBlocking, 
  deleteDocumentNonBlocking 
} from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

interface ProjectStoreType {
  projects: Project[];
  certificates: Certificate[];
  testimonials: Testimonial[];
  experiences: Experience[];
  stats: PortfolioStats;
  profile: ProfileData;
  isLoading: boolean;
  error: any;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  addCertificate: (cert: Certificate) => void;
  deleteCertificate: (id: string) => void;
  addTestimonial: (test: Testimonial) => void;
  deleteTestimonial: (id: string) => void;
  addExperience: (exp: Experience) => void;
  deleteExperience: (id: string) => void;
  updateStats: (newStats: PortfolioStats) => void;
  updateProfile: (newProfile: ProfileData) => void;
  backupData: () => void;
  restoreData: (json: string) => Promise<void>;
}

const defaultStats: PortfolioStats = {
  completedProjects: '0',
  yearsExperience: '0',
  techMastered: '0',
  clientSatisfaction: '0%'
};

const defaultProfile: ProfileData = {
  name: 'Nara Andra Tyaga',
  roleId: 'Full-Stack Developer',
  roleEn: 'Full-Stack Developer',
  aboutMeId: '',
  aboutMeEn: '',
  profilePictureUrl: 'https://picsum.photos/seed/profile/600/800',
  heroTitleId: 'Transforming Ideas Into Reality',
  heroTitleEn: 'Transforming Ideas Into Reality',
  heroSubtitleId: '',
  heroSubtitleEn: '',
  email: 'admin@karyapro.app',
  whatsapp: '',
  linkedin: '',
  instagram: '',
  github: '',
  tiktok: ''
};

const ProjectStoreContext = createContext<ProjectStoreType | undefined>(undefined);

export const ProjectStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const firestore = useFirestore();
  const { toast } = useToast();

  const projectsQuery = useMemoFirebase(() => collection(firestore, 'projects'), [firestore]);
  const certsQuery = useMemoFirebase(() => collection(firestore, 'certificates'), [firestore]);
  const testsQuery = useMemoFirebase(() => collection(firestore, 'testimonials'), [firestore]);
  const journeyQuery = useMemoFirebase(() => collection(firestore, 'careerTimelineEntries'), [firestore]);
  const profileDocRef = useMemoFirebase(() => doc(firestore, 'portfolioOwner', 'profile'), [firestore]);

  const { data: projectsData, isLoading: loadingProjects, error: errorProjects } = useCollection<Project>(projectsQuery);
  const { data: certsData, isLoading: loadingCerts, error: errorCerts } = useCollection<Certificate>(certsQuery);
  const { data: testsData, isLoading: loadingTests, error: errorTests } = useCollection<Testimonial>(testsQuery);
  const { data: journeyData, isLoading: loadingJourney, error: errorJourney } = useCollection<Experience>(journeyQuery);
  const { data: profileData, isLoading: loadingProfile, error: errorProfile } = useDoc<any>(profileDocRef);

  const projects = projectsData || [];
  const certificates = certsData || [];
  const testimonials = testsData || [];
  const experiences = journeyData || [];
  
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

  const isLoading = loadingProjects || loadingCerts || loadingTests || loadingJourney || loadingProfile;
  const error = errorProjects || errorCerts || errorTests || errorJourney || errorProfile;

  const backupData = () => {
    const data = {
      projects,
      certificates,
      testimonials,
      experiences,
      profile,
      stats,
      version: '2.4.0',
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `karyapro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast({ title: "Backup Created", description: "JSON file downloaded successfully." });
  };

  const restoreData = async (json: string) => {
    try {
      const data = JSON.parse(json);
      const batch = writeBatch(firestore);
      
      if (!data.projects || !data.certificates) throw new Error("Invalid backup format");

      data.projects.forEach((p: any) => batch.set(doc(firestore, 'projects', p.id), p));
      data.certificates.forEach((c: any) => batch.set(doc(firestore, 'certificates', c.id), c));
      data.testimonials.forEach((t: any) => batch.set(doc(firestore, 'testimonials', t.id), t));
      data.experiences.forEach((e: any) => batch.set(doc(firestore, 'careerTimelineEntries', e.id), e));
      
      await batch.commit();
      toast({ title: "Restore Successful", description: "All database records have been synced." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Restore Failed", description: e.message });
    }
  };

  const addProject = (project: Project) => {
    const docRef = doc(firestore, 'projects', project.id);
    setDocumentNonBlocking(docRef, { ...project, updatedAt: new Date().toISOString() }, { merge: true });
  };

  const deleteProject = (id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'projects', id));
  };

  const addCertificate = (cert: Certificate) => {
    setDocumentNonBlocking(doc(firestore, 'certificates', cert.id), cert, { merge: true });
  };

  const deleteCertificate = (id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'certificates', id));
  };

  const addTestimonial = (test: Testimonial) => {
    setDocumentNonBlocking(doc(firestore, 'testimonials', test.id), test, { merge: true });
  };

  const deleteTestimonial = (id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'testimonials', id));
  };

  const addExperience = (exp: Experience) => {
    setDocumentNonBlocking(doc(firestore, 'careerTimelineEntries', exp.id), exp, { merge: true });
  };

  const deleteExperience = (id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'careerTimelineEntries', id));
  };

  const updateStats = (newStats: PortfolioStats) => {
    setDocumentNonBlocking(profileDocRef, {
      totalProjectsCompleted: parseInt(newStats.completedProjects) || 0,
      codingExperienceYears: parseInt(newStats.yearsExperience) || 0,
      totalTechnologiesMastered: parseInt(newStats.techMastered) || 0,
      clientSatisfaction: newStats.clientSatisfaction
    }, { merge: true });
  };

  const updateProfile = (newProfile: ProfileData) => {
    setDocumentNonBlocking(profileDocRef, {
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
      tiktok: newProfile.tiktok
    }, { merge: true });
  };

  return (
    <ProjectStoreContext.Provider value={{ 
      projects, certificates, testimonials, experiences, stats, profile, isLoading, error,
      addProject, deleteProject, addCertificate, deleteCertificate,
      addTestimonial, deleteTestimonial, addExperience, deleteExperience,
      updateStats, updateProfile, backupData, restoreData
    }}>
      {children}
    </ProjectStoreContext.Provider>
  );
};

export const useProjectStore = () => {
  const context = useContext(ProjectStoreContext);
  if (!context) throw new Error('useProjectStore must be used within ProjectStoreProvider');
  return context;
};
