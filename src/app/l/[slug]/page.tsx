import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { after } from 'next/server';
import type { Metadata } from 'next';
import { getShortLinkData, extractClickMetadata, recordShortLinkClick } from '@/lib/server-shortlinks';
import { ShortLinkPreviewClient } from './ShortLinkPreviewClient';

interface ShortLinkPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Metadata halaman Interstitial Preview:
 * Set robots noindex & nofollow agar halaman redirect tidak diindeks mesin pencari.
 */
export async function generateMetadata({ params }: ShortLinkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const shortLink = await getShortLinkData(slug);

  if (!shortLink || !shortLink.isActive) {
    return {
      title: 'Link Tidak Ditemukan | Nara Andra Tyaga',
      robots: { index: false, follow: false },
    };
  }

  const linkTitle = shortLink.title ? `${shortLink.title} — ` : '';
  return {
    title: `${linkTitle}Pengalihan Tautan | Nara Andra Tyaga`,
    description: `Halaman pratinjau pengalihan resmi ke ${shortLink.originalUrl}`,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

/**
 * Server Component untuk Interstitial Preview URL Shortener:
 * 1. Fetch data dokumen `shortLinks/{slug}` dari Firestore.
 * 2. Jika tidak ada / isActive: false -> 404 (notFound).
 * 3. Jika valid -> ekstrak header & jadwalkan pencatatan klik secara non-blocking
 *    (memakai Next.js 15 after() API agar tidak menahan proses render).
 * 4. Render halaman preview bertema Cyberpunk / System.
 */
export default async function ShortLinkPage({ params }: ShortLinkPageProps) {
  const { slug } = await params;

  // 1. Fetch data short link dari Firestore
  const shortLink = await getShortLinkData(slug);

  // 2. Validasi status dokumen
  if (!shortLink || !shortLink.isActive) {
    notFound();
  }

  // 3. Ekstraksi metadata click (device, browser, os, lokasi, referer - TANPA IP mentah)
  const headersList = await headers();
  const clickMetadata = extractClickMetadata(headersList);

  // 4. Pencatatan klik NON-BLOCKING SAAT HALAMAN DI-LOAD
  // Menggunakan Next.js 15 after() agar request render langsung dikirim ke browser
  // tanpa menunggu operasi tulis Firestore selesai.
  if (typeof after === 'function') {
    after(async () => {
      await recordShortLinkClick(slug, clickMetadata);
    });
  } else {
    // Fallback detached promise
    recordShortLinkClick(slug, clickMetadata).catch((err) => {
      console.error(`[ShortLinks] Error recording click for ${slug}:`, err);
    });
  }

  // 5. Render Interstitial Preview Page
  return <ShortLinkPreviewClient shortLink={shortLink} />;
}
