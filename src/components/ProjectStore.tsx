
"use client"

import React, { createContext, useContext, useState } from 'react';
import { Project, Certificate, PortfolioStats, ProfileData, Testimonial, Experience } from '@/lib/types';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { 
  setDocumentNonBlocking, 
  deleteDocumentNonBlocking 
} from '@/firebase/non-blocking-updates';

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
}

const defaultStats: PortfolioStats = {
  completedProjects: '0',
  yearsExperience: '0',
  techMastered: '0',
  clientSatisfaction: '0%'
};

const defaultProfile: ProfileData = {
  name: 'Portfolio Owner',
  roleId: 'Full-Stack Developer',
  roleEn: 'Full-Stack Developer',
  aboutTextId: '',
  aboutTextEn: '',
  profileImageUrl: 'https://picsum.photos/seed/profile/600/800',
  heroTitleId: 'Transforming Ideas Into Reality',
  heroTitleEn: 'Transforming Ideas Into Reality',
  heroSubtitleId: '',
  heroSubtitleEn: '',
  whatsapp: '',
  linkedin: '',
  instagram: '',
  github: '',
  tiktok: ''
};

const ProjectStoreContext = createContext<ProjectStoreType | undefined>(undefined);

export const ProjectStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const firestore = useFirestore();

  // Firestore Queries
  const projectsQuery = useMemoFirebase(() => collection(firestore, 'projects'), [firestore]);
  const certsQuery = useMemoFirebase(() => collection(firestore, 'certificates'), [firestore]);
  const testsQuery = useMemoFirebase(() => collection(firestore, 'testimonials'), [firestore]);
  const journeyQuery = useMemoFirebase(() => collection(firestore, 'careerTimelineEntries'), [firestore]);
  const profileDocRef = useMemoFirebase(() => doc(firestore, 'portfolioOwner', 'profile'), [firestore]);

  // Real-time Data
  const { data: projectsData, isLoading: loadingProjects, error: errorProjects } = useCollection<Project>(projectsQuery);
  const { data: certsData, isLoading: loadingCerts, error: errorCerts } = useCollection<Certificate>(certsQuery);
  const { data: testsData, isLoading: loadingTests, error: errorTests } = useCollection<Testimonial>(testsQuery);
  const { data: journeyData, isLoading: loadingJourney, error: errorJourney } = useCollection<Experience>(journeyQuery);
  const { data: profileData, isLoading: loadingProfile, error: errorProfile } = useDoc<any>(profileDocRef);

  const projects = projectsData || [];
  const certificates = certsData || [];
  const testimonials = testsData || [];
  const experiences = journeyData || [];
  const error = errorProjects || errorCerts || errorTests || errorJourney || errorProfile;
  
  const profile: ProfileData = profileData ? {
    name: profileData.name || defaultProfile.name,
    roleId: profileData.roleId || defaultProfile.roleId,
    roleEn: profileData.roleEn || defaultProfile.roleEn,
    aboutTextId: profileData.aboutMeId || defaultProfile.aboutTextId,
    aboutTextEn: profileData.aboutMeEn || defaultProfile.aboutTextEn,
    profileImageUrl: profileData.profilePictureUrl || defaultProfile.profileImageUrl,
    heroTitleId: profileData.heroTitleId || defaultProfile.heroTitleId,
    heroTitleEn: profileData.heroTitleEn || defaultProfile.heroTitleEn,
    heroSubtitleId: profileData.heroSubtitleId || defaultProfile.heroSubtitleId,
    heroSubtitleEn: profileData.heroSubtitleEn || defaultProfile.heroSubtitleEn,
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

  // Mutations
  const addProject = (project: Project) => {
    const docRef = doc(firestore, 'projects', project.id);
    setDocumentNonBlocking(docRef, project, { merge: true });
  };

  const deleteProject = (id: string) => {
    const docRef = doc(firestore, 'projects', id);
    deleteDocumentNonBlocking(docRef);
  };

  const addCertificate = (cert: Certificate) => {
    const docRef = doc(firestore, 'certificates', cert.id);
    setDocumentNonBlocking(docRef, cert, { merge: true });
  };

  const deleteCertificate = (id: string) => {
    const docRef = doc(firestore, 'certificates', id);
    deleteDocumentNonBlocking(docRef);
  };

  const addTestimonial = (test: Testimonial) => {
    const docRef = doc(firestore, 'testimonials', test.id);
    setDocumentNonBlocking(docRef, test, { merge: true });
  };

  const deleteTestimonial = (id: string) => {
    const docRef = doc(firestore, 'testimonials', id);
    deleteDocumentNonBlocking(docRef);
  };

  const addExperience = (exp: Experience) => {
    const docRef = doc(firestore, 'careerTimelineEntries', exp.id);
    setDocumentNonBlocking(docRef, exp, { merge: true });
  };

  const deleteExperience = (id: string) => {
    const docRef = doc(firestore, 'careerTimelineEntries', id);
    deleteDocumentNonBlocking(docRef);
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
      aboutMeId: newProfile.aboutTextId,
      aboutMeEn: newProfile.aboutTextEn,
      profilePictureUrl: newProfile.profileImageUrl,
      heroTitleId: newProfile.heroTitleId,
      heroTitleEn: newProfile.heroTitleEn,
      heroSubtitleId: newProfile.heroSubtitleId,
      heroSubtitleEn: newProfile.heroSubtitleEn,
      whatsAppNumber: newProfile.whatsapp,
      linkedInProfileUrl: newProfile.linkedin,
      instagram: newProfile.instagram,
      githubProfileUrl: newProfile.github,
      tiktok: newProfile.tiktok
    }, { merge: true });
  };

  return (
    <ProjectStoreContext.Provider value={{ 
      projects, 
      certificates, 
      testimonials,
      experiences,
      stats,
      profile,
      isLoading,
      error,
      addProject, 
      deleteProject, 
      addCertificate, 
      deleteCertificate,
      addTestimonial,
      deleteTestimonial,
      addExperience,
      deleteExperience,
      updateStats,
      updateProfile
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
