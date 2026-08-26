import { MetadataRoute } from 'next';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.naraandratyaga.my.id';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/experience`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/certificates`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'blogs'));
    blogRoutes = snap.docs.map(doc => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      return {
        url: `${BASE_URL}/blog/${slug}`,
        lastModified: data.updatedAt ? new Date(data.updatedAt) : (data.publishedAt ? new Date(data.publishedAt) : now),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };
    });
  } catch (e) {
    // Graceful fallback to static routes if database is unreachable during build
  }

  return [...staticRoutes, ...blogRoutes];
}