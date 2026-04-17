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
  },
  {
    id: '3',
    titleId: 'TaskFlow UI Kit',
    titleEn: 'TaskFlow UI Kit',
    shortDescriptionId: 'Desain UI produktivitas profesional.',
    shortDescriptionEn: 'Professional productivity UI design.',
    fullDescriptionId: 'Sistem desain komprehensif untuk aplikasi produktivitas.',
    fullDescriptionEn: 'A comprehensive design system for productivity applications, featuring 50+ modular components.',
    type: 'ui',
    technologies: ['Figma', 'Adobe XD', 'Sketch'],
    imageUrl: 'https://picsum.photos/seed/ui/800/600',
    featured: false
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
  },
  {
    id: 'c2',
    titleId: 'Meta Front-End Developer Professional Certificate',
    titleEn: 'Meta Front-End Developer Professional Certificate',
    shortDescriptionId: 'Pelatihan komprehensif teknologi front-end modern.',
    shortDescriptionEn: 'Comprehensive training in modern front-end technologies.',
    fullDescriptionId: 'Rangkaian 9 kursus yang mencakup JavaScript, React, dan desain UI/UX.',
    fullDescriptionEn: 'A series of 9 courses covering JavaScript, React, UI/UX design, and professional developer tools.',
    year: '2022',
    issuer: 'Meta / Coursera',
    validUntil: 'No Expiry',
    imageUrl: 'https://picsum.photos/seed/meta-cert/800/600'
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
  },
  {
    id: '2',
    year: '2021 - 2023',
    titleId: 'Web Developer',
    titleEn: 'Web Developer',
    company: 'Creative Solutions',
    descriptionId: 'Spesialisasi dalam membangun situs pemasaran performa tinggi.',
    descriptionEn: 'Specialized in building high-performance marketing sites.'
  }
];

export const testimonials: Testimonial[] = [
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
