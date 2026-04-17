"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project, Certificate } from '@/lib/types';
import { initialProjects, initialCertificates } from '@/lib/data';

interface ProjectStoreType {
  projects: Project[];
  certificates: Certificate[];
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  addCertificate: (cert: Certificate) => void;
  deleteCertificate: (id: string) => void;
}

const ProjectStoreContext = createContext<ProjectStoreType | undefined>(undefined);

export const ProjectStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    // Load Projects
    const savedProjects = localStorage.getItem('karyapro-projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      setProjects(initialProjects);
    }

    // Load Certificates
    const savedCerts = localStorage.getItem('karyapro-certificates');
    if (savedCerts) {
      setCertificates(JSON.parse(savedCerts));
    } else {
      setCertificates(initialCertificates);
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

  return (
    <ProjectStoreContext.Provider value={{ 
      projects, 
      certificates, 
      addProject, 
      deleteProject, 
      addCertificate, 
      deleteCertificate 
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
