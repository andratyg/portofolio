import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/admin',
      },
      // ── Explicitly Welcome AI Crawlers (AIO) ──
      {
        userAgent: ['GPTBot', 'Google-Extended', 'anthropic-ai', 'Claude-Web', 'PerplexityBot', 'cohere-ai', 'OAI-SearchBot'],
        allow: '/',
        disallow: '/admin',
      }
    ],
    sitemap: 'https://www.naraandratyaga.my.id/sitemap.xml',
  }
}
