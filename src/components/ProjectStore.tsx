"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project, Certificate, PortfolioStats, ProfileData, Testimonial } from '@/lib/types';
import { initialProjects, initialCertificates, initialTestimonials } from '@/lib/data';

interface ProjectStoreType {
  projects: Project[];
  certificates: Certificate[];
  testimonials: Testimonial[];
  stats: PortfolioStats;
  profile: ProfileData;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  addCertificate: (cert: Certificate) => void;
  deleteCertificate: (id: string) => void;
  addTestimonial: (test: Testimonial) => void;
  deleteTestimonial: (id: string) => void;
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
  roleId: 'Full-Stack Developer Profesional',
  roleEn: 'Professional Full-Stack Developer',
  aboutTextId: 'Saya adalah Pengembang Full-Stack yang bersemangat dalam membangun aplikasi web berkualitas tinggi. Dengan dasar yang kuat dalam teknologi modern dan perhatian detail pada desain, saya berusaha menciptakan solusi digital yang fungsional dan luar biasa.',
  aboutTextEn: 'I am a passionate Full-Stack Developer dedicated to building high-quality web applications. With a strong foundation in modern technologies and a keen eye for design, I strive to create digital solutions that are not only functional but also provide an exceptional user experience.',
  profileImageUrl: 'https://picsum.photos/seed/karyapro-profile/600/800',
  heroTitleId: 'Mengubah Ide Menjadi Realitas',
  heroTitleEn: 'Transforming Ideas Into Reality',
  heroSubtitleId: 'Pengembang Full-Stack Profesional menciptakan pengalaman web modern.',
  heroSubtitleEn: 'Professional Full-Stack Developer creating modern web experiences.'
};

const ProjectStoreContext = createContext<ProjectStoreType | undefined>(undefined);

export const ProjectStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<PortfolioStats>(defaultStats);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);

  useEffect(() => {
    // Load Projects
    const savedProjects = localStorage.getItem('karyapro-projects');
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    else setProjects(initialProjects as any);

    // Load Certificates
    const savedCerts = localStorage.getItem('karyapro-certificates');
    if (savedCerts) setCertificates(JSON.parse(savedCerts));
    else setCertificates(initialCertificates as any);

    // Load Testimonials
    const savedTestimonials = localStorage.getItem('karyapro-testimonials');
    if (savedTestimonials) setTestimonials(JSON.parse(savedTestimonials));
    else setTestimonials(initialTestimonials as any);

    // Load Stats
    const savedStats = localStorage.getItem('karyapro-stats');
    if (savedStats) setStats(JSON.parse(savedStats));

    // Load Profile
    const savedProfile = localStorage.getItem('karyapro-profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile({ ...defaultProfile, ...parsed });
    }
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

  const addTestimonial = (test: Testimonial) => {
    const updated = [test, ...testimonials];
    setTestimonials(updated);
    localStorage.setItem('karyapro-testimonials', JSON.stringify(updated));
  };

  const deleteTestimonial = (id: string) => {
    const updated = testimonials.filter(t => t.id !== id);
    setTestimonials(updated);
    localStorage.setItem('karyapro-testimonials', JSON.stringify(updated));
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
      testimonials,
      stats,
      profile,
      addProject, 
      deleteProject, 
      addCertificate, 
      deleteCertificate,
      addTestimonial,
      deleteTestimonial,
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
