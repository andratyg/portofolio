"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project, Certificate, PortfolioStats, ProfileData } from '@/lib/types';
import { initialProjects, initialCertificates } from '@/lib/data';

interface ProjectStoreType {
  projects: Project[];
  certificates: Certificate[];
  stats: PortfolioStats;
  profile: ProfileData;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  addCertificate: (cert: Certificate) => void;
  deleteCertificate: (id: string) => void;
  updateStats: (newStats: PortfolioStats) => void;
  updateProfile: (newProfile: ProfileData) => void;
}

const defaultStats: PortfolioStats = {
  completedProjects: '25+',
  yearsExperience: '5+',
  techMastered: '15+',
  clientSatisfaction: '100%'
};

const defaultProfile: ProfileData = {
  name: 'KaryaPro',
  role: 'Full-Stack Developer',
  aboutText: 'I am a passionate Full-Stack Developer dedicated to building high-quality web applications. With a strong foundation in modern technologies and a keen eye for design, I strive to create digital solutions that are not only functional but also provide an exceptional user experience.',
  profileImageUrl: 'https://picsum.photos/seed/karyapro-profile/600/800'
};

const ProjectStoreContext = createContext<ProjectStoreType | undefined>(undefined);

export const ProjectStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<PortfolioStats>(defaultStats);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);

  useEffect(() => {
    // Load Projects
    const savedProjects = localStorage.getItem('karyapro-projects');
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    else setProjects(initialProjects);

    // Load Certificates
    const savedCerts = localStorage.getItem('karyapro-certificates');
    if (savedCerts) setCertificates(JSON.parse(savedCerts));
    else setCertificates(initialCertificates);

    // Load Stats
    const savedStats = localStorage.getItem('karyapro-stats');
    if (savedStats) setStats(JSON.parse(savedStats));

    // Load Profile
    const savedProfile = localStorage.getItem('karyapro-profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  const addProject = (project: Project) => {
    const updated = [project, ...projects];
    setProjects(updated);
    localStorage.setItem('karyapro-projects', JSON.stringify(updated));
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('karyapro-projects', JSON.stringify(updated));
  };

  const addCertificate = (cert: Certificate) => {
    const updated = [cert, ...certificates];
    setCertificates(updated);
    localStorage.setItem('karyapro-certificates', JSON.stringify(updated));
  };

  const deleteCertificate = (id: string) => {
    const updated = certificates.filter(c => c.id !== id);
    setCertificates(updated);
    localStorage.setItem('karyapro-certificates', JSON.stringify(updated));
  };

  const updateStats = (newStats: PortfolioStats) => {
    setStats(newStats);
    localStorage.setItem('karyapro-stats', JSON.stringify(newStats));
  };

  const updateProfile = (newProfile: ProfileData) => {
    setProfile(newProfile);
    localStorage.setItem('karyapro-profile', JSON.stringify(newProfile));
  };

  return (
    <ProjectStoreContext.Provider value={{ 
      projects, 
      certificates, 
      stats,
      profile,
      addProject, 
      deleteProject, 
      addCertificate, 
      deleteCertificate,
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
