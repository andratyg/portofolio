import { Project, Experience, Testimonial, Certificate } from './types';

// Public content is loaded from Firestore. These arrays intentionally stay empty
// so demo data is never shown while the database is loading or unavailable.
export const initialProjects: Project[] = [];
export const initialCertificates: Certificate[] = [];
export const initialTestimonials: Testimonial[] = [];

export const timeline: Experience[] = [
  {
    id: 'student',
    year: '2024 - Present',
    titleId: 'Siswa PPLG',
    titleEn: 'Software Engineering Student',
    company: 'SMK Wikrama Bogor',
    descriptionId: 'Mempelajari dasar pemrograman, pengembangan perangkat lunak modern, dan praktik rekayasa.',
    descriptionEn: 'Learning programming fundamentals, modern software development, and engineering practices.'
  },
  {
    id: 'independent',
    year: '2024 - Present',
    titleId: 'Web Developer Independen',
    titleEn: 'Independent Web Developer',
    company: 'Personal Projects',
    descriptionId: 'Membangun aplikasi web, antarmuka interaktif, dan integrasi backend modern.',
    descriptionEn: 'Building web applications, interactive interfaces, and modern backend integrations.'
  }
];
