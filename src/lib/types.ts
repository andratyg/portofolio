export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  type: 'web' | 'ui' | 'backend';
  technologies: string[];
  problemSolved: string;
  process: string;
  results: string;
  imageUrl: string;
  demoUrl?: string;
  certificates?: string[];
  featured?: boolean;
}

export interface Experience {
  id: string;
  year: string;
  title: string;
  company: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatarUrl: string;
}

export interface Certificate {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  year: string;
  issuer: string;
  validUntil: string;
  imageUrl: string;
}

export interface PortfolioStats {
  completedProjects: string;
  yearsExperience: string;
  techMastered: string;
  clientSatisfaction: string;
}

export interface ProfileData {
  name: string;
  role: string;
  aboutText: string;
  profileImageUrl: string;
}
