export interface Project {
  id: string;
  titleId: string;
  titleEn: string;
  shortDescriptionId: string;
  shortDescriptionEn: string;
  fullDescriptionId: string;
  fullDescriptionEn: string;
  problemId?: string;
  problemEn?: string;
  solutionId?: string;
  solutionEn?: string;
  resultId?: string;
  resultEn?: string;
  impactStats?: string; // e.g. "99.9% Uptime", "10k+ Users"
  type: 'web' | 'ui' | 'backend';
  technologies: string[];
  imageUrl: string;
  demoUrl?: string;
  featured?: boolean;
  updatedAt?: string;
}

export interface Experience {
  id: string;
  year: string;
  titleId: string;
  titleEn: string;
  company: string;
  descriptionId: string;
  descriptionEn: string;
}

export interface Testimonial {
  id: string;
  name: string;
  roleId: string;
  roleEn: string;
  contentId: string;
  contentEn: string;
  avatarUrl: string;
}

export interface Certificate {
  id: string;
  titleId: string;
  titleEn: string;
  shortDescriptionId: string;
  shortDescriptionEn: string;
  fullDescriptionId: string;
  fullDescriptionEn: string;
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
  roleId: string;
  roleEn: string;
  aboutMeId: string;
  aboutMeEn: string;
  profilePictureUrl: string;
  heroTitleId: string;
  heroTitleEn: string;
  heroSubtitleId: string;
  heroSubtitleEn: string;
  email?: string;
  whatsapp?: string;
  linkedin?: string;
  instagram?: string;
  github?: string;
  tiktok?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'super' | 'editor';
}
