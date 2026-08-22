import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, addDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { ShortLink, ShortLinkClick } from '@/lib/types';

/**
 * Inisialisasi Firestore server-side instance.
 */
function getServerDb() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app);
}

const defaultShortLinks: Record<string, ShortLink> = {
  'github': {
    id: 'github',
    slug: 'github',
    originalUrl: 'https://github.com/nara-andra-tyaga',
    title: 'Profil GitHub Resmi Nara Andra Tyaga',
    description: 'Repositori open-source dan portofolio kode.',
    isActive: true,
    clickCount: 42,
    safetyStatus: 'unverified'
  },
  'instagram': {
    id: 'instagram',
    slug: 'instagram',
    originalUrl: 'https://instagram.com/nara.dev',
    title: 'Instagram Resmi Nara Andra Tyaga',
    description: 'Akun Instagram resmi pengembang web.',
    isActive: true,
    clickCount: 18,
    safetyStatus: 'unverified'
  },
  'linkedin': {
    id: 'linkedin',
    slug: 'linkedin',
    originalUrl: 'https://linkedin.com/in/nara-andra-tyaga',
    title: 'Profil LinkedIn Nara Andra Tyaga',
    description: 'Jaringan profesional dan karir teknologi.',
    isActive: true,
    clickCount: 25,
    safetyStatus: 'unverified'
  }
};

/**
 * Mengambil dokumen shortLink berdasarkan slug.
 * Jika dokumen tidak ditemukan atau isActive === false, kembalikan null.
 */
export async function getShortLinkData(slug: string): Promise<ShortLink | null> {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();

  try {
    const db = getServerDb();
    const docRef = doc(db, 'shortLinks', cleanSlug);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        slug: data.slug || snap.id,
        originalUrl: data.originalUrl || '',
        title: data.title || '',
        description: data.description || '',
        isActive: data.isActive !== false,
        clickCount: Number(data.clickCount) || 0,
        createdAt: data.createdAt ? String(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
        safetyStatus: data.safetyStatus || 'unverified',
      };
    }
  } catch (error) {
    console.warn(`[ShortLinks] Firestore query fallback for '${slug}':`, error);
  }

  // Fallback ke default short link jika ada
  if (defaultShortLinks[cleanSlug]) {
    return defaultShortLinks[cleanSlug];
  }

  return null;
}

/**
 * Ekstraksi metadata click dari request headers.
 * 
 * ATURAN PRIVASI KETAT:
 * - JANGAN PERNAH menyimpan IP mentah (x-forwarded-for, remote-addr, dll.).
 * - Hanya ambil agregasi umum: Device Type, Browser, OS, Negara, Kota, & Referer.
 */
export function extractClickMetadata(headersList: Headers): ShortLinkClick {
  const userAgent = headersList.get('user-agent') || 'Unknown';
  const uaLower = userAgent.toLowerCase();

  // 1. Deteksi Bot / Crawler / Link Previewer (WhatsApp, Telegram, Discord, Googlebot, dll)
  const botSignatures = [
    'bot', 'spider', 'crawl', 'slurp', 'mediapartners',
    'whatsapp', 'telegram', 'telegrambot', 'facebookexternalhit',
    'twitterbot', 'discordbot', 'slackbot', 'applebot', 'bingbot',
    'googlebot', 'yandex', 'duckduckbot', 'baiduspider', 'curl',
    'wget', 'python-requests', 'aiohttp', 'postmanruntime', 'axios',
    'headlesschrome', 'lighthouse', 'inspect', 'embedly', 'quora link preview'
  ];
  const isBot = botSignatures.some(sig => uaLower.includes(sig));

  // 2. Deteksi Device Type
  let deviceType: ShortLinkClick['deviceType'] = 'desktop';
  if (isBot) {
    deviceType = 'bot';
  } else if (/ipad|tablet|(android(?!.*mobile))/i.test(uaLower)) {
    deviceType = 'tablet';
  } else if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(uaLower)) {
    deviceType = 'mobile';
  } else if (!userAgent || userAgent === 'Unknown') {
    deviceType = 'unknown';
  }

  // 3. Deteksi Browser
  let browser = 'Other';
  if (/edg|edge/i.test(uaLower)) browser = 'Edge';
  else if (/samsungbrowser/i.test(uaLower)) browser = 'Samsung Internet';
  else if (/opr|opera/i.test(uaLower)) browser = 'Opera';
  else if (/chrome|crios/i.test(uaLower)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(uaLower)) browser = 'Firefox';
  else if (/safari/i.test(uaLower) && !/chrome/i.test(uaLower)) browser = 'Safari';

  // 4. Deteksi OS
  let os = 'Other';
  if (/windows/i.test(uaLower)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(uaLower)) os = 'macOS';
  else if (/android/i.test(uaLower)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(uaLower)) os = 'iOS';
  else if (/linux/i.test(uaLower)) os = 'Linux';
  else if (/cros/i.test(uaLower)) os = 'Chrome OS';

  // 5. Geolocation dari Edge/CDN Headers (Vercel, Cloudflare, App Engine, dll)
  const country = headersList.get('x-vercel-ip-country') ||
                  headersList.get('cf-ipcountry') ||
                  headersList.get('x-appengine-country') ||
                  headersList.get('x-country-code') ||
                  'Unknown';

  const city = headersList.get('x-vercel-ip-city') ||
               headersList.get('cf-ipcity') ||
               headersList.get('x-appengine-city') ||
               headersList.get('x-city') ||
               'Unknown';

  const referer = headersList.get('referer') || headersList.get('referrer') || 'Direct';

  return {
    timestamp: new Date().toISOString(),
    deviceType,
    browser,
    os,
    country,
    city,
    referer,
    userAgent: userAgent.slice(0, 300), // batasi panjang string UA
    isBot
  };
}

/**
 * Mencatat log klik ke subcollection `shortLinks/{slug}/clicks`.
 * 
 * ATURAN FILTER BOT:
 * - Jika isBot === true: log tetap disimpan untuk keperluan audit/debug,
 *   TETAPI clickCount utama TIDAK di-increment.
 * - Jika isBot === false: clickCount pada dokumen utama di-increment secara atomic (+1).
 */
export async function recordShortLinkClick(slug: string, clickData: ShortLinkClick): Promise<void> {
  if (!slug) return;
  try {
    const db = getServerDb();
    const docRef = doc(db, 'shortLinks', slug);
    const clicksColRef = collection(db, 'shortLinks', slug, 'clicks');

    // 1. Tulis log klik ke subcollection
    await addDoc(clicksColRef, {
      ...clickData,
      createdAt: serverTimestamp(),
    });

    // 2. Increment clickCount hanya untuk visitor manusia asli (bukan bot)
    if (!clickData.isBot) {
      await updateDoc(docRef, {
        clickCount: increment(1),
        lastClickedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error(`[ShortLinks Analytics] Gagal mencatat klik untuk '${slug}':`, error);
  }
}
