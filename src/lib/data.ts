import { Project, Experience, Testimonial, Certificate } from './types';

export const initialProjects: Project[] = [
  {
    id: '1',
    titleId: 'Dashboard Fintech',
    titleEn: 'Fintech Dashboard',
    shortDescriptionId: 'Platform analitik keuangan modern.',
    shortDescriptionEn: 'Modern financial analytics platform.',
    fullDescriptionId: 'Dashboard komprehensif yang dibangun untuk startup fintech untuk memvisualisasikan data pasar real-time.',
    fullDescriptionEn: 'A comprehensive dashboard built for a fintech startup to visualize real-time market data and user portfolios.',
    type: 'web',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Recharts'],
    imageUrl: 'https://picsum.photos/seed/dashboard/800/600',
    demoUrl: 'https://demo.example.com',
    featured: true
  },
  {
    id: '2',
    titleId: 'E-commerce EcoStore',
    titleEn: 'EcoStore E-commerce',
    shortDescriptionId: 'Pasar produk berkelanjutan.',
    shortDescriptionEn: 'Sustainable products marketplace.',
    fullDescriptionId: 'Platform e-commerce yang berfokus pada produk berkelanjutan dan ramah lingkungan.',
    fullDescriptionEn: 'An e-commerce platform focused on sustainable and eco-friendly products with a seamless checkout experience.',
    type: 'web',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    imageUrl: 'https://picsum.photos/seed/store/800/600',
    demoUrl: 'https://ecostore.example.com',
    featured: true
  }
];

export const initialCertificates: Certificate[] = [
  {
    id: 'c1',
    titleId: 'Google Professional Cloud Architect',
    titleEn: 'Google Professional Cloud Architect',
    shortDescriptionId: 'Sertifikasi untuk merancang solusi cloud yang kuat.',
    shortDescriptionEn: 'Certification for designing and managing robust cloud solutions.',
    fullDescriptionId: 'Sertifikat ini memvalidasi kemampuan saya dalam merancang dan mengelola solusi cloud yang aman dan skalabel.',
    fullDescriptionEn: 'This certificate validates my ability to design, develop, and manage robust, secure, scalable, highly available, and dynamic solutions.',
    year: '2023',
    issuer: 'Google Cloud',
    validUntil: '2025',
    imageUrl: 'https://picsum.photos/seed/cloud-cert/800/600'
  }
];

export const initialTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    roleId: 'Manajer Produk di Fintech Plus',
    roleEn: 'Product Manager at Fintech Plus',
    contentId: 'Hasil kerja yang luar biasa. UI bersih dan optimasi performanya sangat membantu.',
    contentEn: 'The work delivered was exceptional. Not only was the UI clean, but the performance optimizations were a game changer.',
    avatarUrl: 'https://picsum.photos/seed/sarah/100/100'
  }
];

export const timeline: Experience[] = [
  {
    id: '1',
    year: '2023 - Present',
    titleId: 'Senior Full-Stack Developer',
    titleEn: 'Senior Full-Stack Developer',
    company: 'Tech Innovators Inc.',
    descriptionId: 'Memimpin pengembangan aplikasi web skala perusahaan.',
    descriptionEn: 'Leading the development of enterprise-scale web applications.'
  }
];
