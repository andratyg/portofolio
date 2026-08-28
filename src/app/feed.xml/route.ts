import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.naraandratyaga.my.id';

export async function GET() {
  try {
    // 1. Inisialisasi Firebase & ambil data
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'blogs'));
    
    // 2. Format dan urutkan data blog (terbaru di atas)
    const blogs = snap.docs.map(doc => doc.data()).sort((a, b) => {
        const dateA = new Date(a.publishedAt || 0).getTime();
        const dateB = new Date(b.publishedAt || 0).getTime();
        return dateB - dateA;
    });

    const now = new Date();

    // 3. Bangun XML String
    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nara Andra Tyaga - Blog &amp; Insights</title>
    <link>${BASE_URL}/blog</link>
    <description>Artikel terbaru mengenai software engineering, web development, dan pengalaman karir dari Nara Andra Tyaga.</description>
    <language>id-ID</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${blogs.map(blog => {
        // Encode special characters untuk XML
        const title = (blog.titleId || blog.titleEn || 'Untitled')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
            
        const summary = (blog.summaryId || blog.summaryEn || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
            
        const url = `${BASE_URL}/blog/${blog.slug || blog.id}`;
        const date = blog.publishedAt ? new Date(blog.publishedAt).toUTCString() : now.toUTCString();
        
        return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${summary}</description>
    </item>`;
    }).join('')}
  </channel>
</rss>`;

    // 4. Return XML Response dengan Cache Control
    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating RSS:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}
