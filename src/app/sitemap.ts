import { MetadataRoute } from 'next'

const BASE_URL = 'https://nara-andra-tyaga.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  
  return [
    // ── Homepage — highest priority, crawled weekly
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // ── Projects / Portfolio
    {
      url: `${BASE_URL}/projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // ── About page
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // ── Certificates
    {
      url: `${BASE_URL}/certificates`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
}