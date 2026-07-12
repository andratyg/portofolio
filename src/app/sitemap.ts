import { MetadataRoute } from 'next'

const BASE_URL = 'https://nara-andra-tyaga.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  
  return [
    // ── Homepage — highest priority
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // ── About / Journey page
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // ── Projects / Portfolio page
    {
      url: `${BASE_URL}/projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // ── Certificates page
    {
      url: `${BASE_URL}/certificates`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // ── Anchor sections on homepage (hint for crawlers)
    {
      url: `${BASE_URL}/#about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/#portfolio`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/#contact`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/#journey`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}