import { Project, Experience, Testimonial, Certificate } from './types';

export const initialProjects: Project[] = [
  {
    id: '1',
    title: 'Fintech Dashboard',
    shortDescription: 'Modern financial analytics platform.',
    fullDescription: 'A comprehensive dashboard built for a fintech startup to visualize real-time market data and user portfolios.',
    type: 'web',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Recharts'],
    problemSolved: 'Users were struggling with fragmented financial data across multiple spreadsheets.',
    process: 'Conducted user interviews, created wireframes in Figma, and developed a modular React component architecture.',
    results: 'Increased user engagement by 45% and reduced data processing time for clients.',
    imageUrl: 'https://picsum.photos/seed/dashboard/800/600',
    demoUrl: 'https://demo.example.com',
    certificates: ['Advanced React Certification', 'UI/UX Specialization'],
    featured: true
  },
  {
    id: '2',
    title: 'EcoStore E-commerce',
    shortDescription: 'Sustainable products marketplace.',
    fullDescription: 'An e-commerce platform focused on sustainable and eco-friendly products with a seamless checkout experience.',
    type: 'web',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    problemSolved: 'Slow page loads were causing high cart abandonment rates.',
    process: 'Optimized server-side rendering and implemented image lazy-loading and edge caching.',
    results: '30% increase in conversion rate within the first month of launch.',
    imageUrl: 'https://picsum.photos/seed/store/800/600',
    demoUrl: 'https://ecostore.example.com',
    featured: true
  },
  {
    id: '3',
    title: 'TaskFlow UI Kit',
    shortDescription: 'Professional productivity UI design.',
    fullDescription: 'A comprehensive design system for productivity applications, featuring 50+ modular components.',
    type: 'ui',
    technologies: ['Figma', 'Adobe XD', 'Sketch'],
    problemSolved: 'Designers needed a consistent set of components for rapid prototyping.',
    process: 'Iterative design loops based on user testing with professional project managers.',
    results: 'Used by over 10 development teams to standardize their app interfaces.',
    imageUrl: 'https://picsum.photos/seed/ui/800/600',
    featured: false
  }
];

export const initialCertificates: Certificate[] = [
  {
    id: 'c1',
    title: 'Google Professional Cloud Architect',
    shortDescription: 'Certification for designing and managing robust cloud solutions.',
    fullDescription: 'This certificate validates my ability to design, develop, and manage robust, secure, scalable, highly available, and dynamic solutions to drive business objectives.',
    year: '2023',
    issuer: 'Google Cloud',
    validUntil: '2025',
    imageUrl: 'https://picsum.photos/seed/cloud-cert/800/600'
  },
  {
    id: 'c2',
    title: 'Meta Front-End Developer Professional Certificate',
    shortDescription: 'Comprehensive training in modern front-end technologies.',
    fullDescription: 'A series of 9 courses covering JavaScript, React, UI/UX design, and professional developer tools through hands-on projects.',
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
    title: 'Senior Full-Stack Developer',
    company: 'Tech Innovators Inc.',
    description: 'Leading the development of enterprise-scale web applications using modern stacks.'
  },
  {
    id: '2',
    year: '2021 - 2023',
    title: 'Web Developer',
    company: 'Creative Solutions',
    description: 'Specialized in building high-performance marketing sites and interactive dashboards.'
  },
  {
    id: '3',
    year: '2019 - 2021',
    title: 'Junior UI Designer',
    company: 'Pixel Perfect Agency',
    description: 'Focused on creating user-centric interfaces and design systems.'
  }
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Product Manager at Fintech Plus',
    content: 'The work delivered was exceptional. Not only was the UI clean, but the performance optimizations were a game changer.',
    avatarUrl: 'https://picsum.photos/seed/sarah/100/100'
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'CTO of EcoWorld',
    content: 'Professional, communicative, and technically proficient. A rare find in the development world.',
    avatarUrl: 'https://picsum.photos/seed/mike/100/100'
  }
];
