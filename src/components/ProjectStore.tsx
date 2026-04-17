"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project } from '@/lib/types';
import { initialProjects } from '@/lib/data';

interface ProjectStoreType {
  projects: Project[];
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
}

const ProjectStoreContext = createContext<ProjectStoreType | undefined>(undefined);

export const ProjectStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('karyapro-projects');
    if (saved) {
      setProjects(JSON.parse(saved));
    } else {
      setProjects(initialProjects);
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

  return (
    <ProjectStoreContext.Provider value={{ projects, addProject, deleteProject }}>
      {children}
    </ProjectStoreContext.Provider>
  );
};

export const useProjectStore = () => {
  const context = useContext(ProjectStoreContext);
  if (!context) throw new Error('useProjectStore must be used within ProjectStoreProvider');
  return context;
};
