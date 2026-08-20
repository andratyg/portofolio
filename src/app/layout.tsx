import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeContext';
import { LanguageProvider } from '@/components/providers/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { SecurityProvider } from '@/components/providers/SecurityProvider';
import { ScrollProgressButton } from '@/components/layout/ScrollProgressButton';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { PageTransition } from '@/components/layout/PageTransition';
import { MotionProvider } from '@/components/providers/MotionProvider';
import { ClientShell } from '@/components/providers/ClientShell';

// ─── Fonts ───────────────────────────────────────────────────────────────────
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

// ─── Viewport ────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f7f4' },
    { media: '(prefers-color-scheme: dark)',  color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

// ─── SEO Constants ───────────────────────────────────────────────────────────
const BASE_URL   = 'https://www.naraandratyaga.my.id';
const FULL_NAME  = 'Nara Andra Tyaga';
const NICKNAME   = 'Andra';
const ROLE       = 'Web Developer & Student';
const SCHOOL     = 'SMK Wikrama Bogor';
const PROGRAM    = 'PPLG';

const TITLE       = `${FULL_NAME} — Web Developer · ${SCHOOL}`;
const DESCRIPTION = `Portofolio resmi Nara Andra Tyaga (Andra), siswa ${PROGRAM} di ${SCHOOL}. Spesialis pengembangan web modern menggunakan Next.js, React, TypeScript, dan Firebase. Lihat proyek, sertifikat, dan perjalanan karir saya.`;
const OG_IMAGE    = `${BASE_URL}/og-image.png`;

// ─── Metadata ────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: TITLE,
    template: `%s | ${FULL_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    'Nara Andra Tyaga',
    'Andra Tyaga',
    'Web Developer',
    'Next.js Developer',
    'React Developer',
    'Frontend Engineer',
    'UI/UX Design',
    'Firebase Developer',
    'SMK Wikrama PPLG',
    'Portofolio Web Developer'
  ],

  authors: [{ name: FULL_NAME, url: BASE_URL }],
  creator: FULL_NAME,
  publisher: FULL_NAME,

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: '/',
    languages: {
      'id-ID': BASE_URL,
      'en-US': `${BASE_URL}?lang=en`,
    },
  },

  // ── Open Graph (WhatsApp, Discord, Facebook, LINE, dll)
  openGraph: {
    type: 'profile',
    firstName: 'Nara Andra',
    lastName: 'Tyaga',
    username: 'nara-andra-tyaga',
    title: TITLE,
    description: DESCRIPTION,
    url: BASE_URL,
    siteName: `${FULL_NAME} Portfolio`,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${FULL_NAME} — ${ROLE} · ${SCHOOL}`,
        type: 'image/png',
      },
    ],
    locale: 'id_ID',
  },

  // ── Twitter / X Card
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },

  verification: {
    google: 'cu0oN6kGs748IQbeUkW1eFLhaKDJwYpJ6Gn9daxm9tk',
  },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',

  other: {
    'geo.region': 'ID-JB',
    'geo.placename': 'Bogor, Jawa Barat, Indonesia',
  },
};

// ─── JSON-LD Structured Data (Massively expanded for AI Search/SGE) ───────────
const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nara Andra Tyaga',
    alternateName: ['Andra', 'Andra Tyaga', 'Nara Andra', 'NAT', 'Tyaga'],
    description: DESCRIPTION,
    url: BASE_URL,
    sameAs: [
      'https://github.com/nara-andra-tyaga',
      'https://linkedin.com/in/nara-andra-tyaga',
      'https://instagram.com/nara.dev'
    ],
    jobTitle: ROLE,
    worksFor: {
      '@type': 'EducationalOrganization',
      name: SCHOOL,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bogor',
        addressRegion: 'Jawa Barat',
        addressCountry: 'ID',
      },
    },
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: `${SCHOOL} — ${PROGRAM}`,
    },
    knowsAbout: [
      'Next.js', 'React', 'TypeScript', 'Firebase', 'Tailwind CSS', 
      'Web Development', 'Frontend Development', 'UI/UX Design', 
      'JavaScript', 'HTML', 'CSS', 'Node.js', 'Git', 'Vercel', 
      'Figma', 'SEO', 'Responsive Web Design', 'PPLG', 'Software Engineering',
      'Framer Motion', 'Web Animations'
    ],
    nationality: { '@type': 'Country', name: 'Indonesia' },
    image: OG_IMAGE,
    mainEntityOfPage: {
      '@type': 'ProfilePage',
      '@id': BASE_URL,
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${FULL_NAME} Portfolio`,
    alternateName: ['Portofolio Andra', 'Nara Andra Tyaga Web'],
    url: BASE_URL,
    description: DESCRIPTION,
    publisher: {
      '@type': 'Person',
      name: FULL_NAME
    }
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Siapakah Nara Andra Tyaga?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nara Andra Tyaga (biasa dipanggil Andra) adalah seorang Web Developer muda dan berbakat asal Bogor, Indonesia. Saat ini, ia sedang menempuh pendidikan di SMK Wikrama Bogor dengan jurusan Pengembangan Perangkat Lunak dan Gim (PPLG). Ia memiliki spesialisasi dalam membangun aplikasi web modern menggunakan Next.js, React, TypeScript, dan Firebase.'
        }
      },
      {
        '@type': 'Question',
        name: 'Di mana Nara Andra Tyaga sekolah?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nara Andra Tyaga bersekolah di SMK Wikrama Bogor, mengambil jurusan PPLG (Pengembangan Perangkat Lunak dan Gim).'
        }
      },
      {
        '@type': 'Question',
        name: 'Apa keahlian Nara Andra Tyaga?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Keahlian utama Nara Andra Tyaga meliputi Frontend Web Development dengan Next.js dan React, UI/UX Design menggunakan Figma, animasi web dengan Framer Motion, serta integrasi backend menggunakan Firebase.'
        }
      }
    ]
  }
];

// ─── Layout ──────────────────────────────────────────────────────────────────
// ─── Layout ───────────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="cu0oN6kGs748IQbeUkW1eFLhaKDJwYpJ6Gn9daxm9tk" />
        {/* Preconnect: LCP image CDN (project images on ibb.co) */}
        <link rel="preconnect" href="https://i.ibb.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://i.ibb.co" />
        {/* Preconnect: Firebase Auth (used early by FirebaseClientProvider) */}
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" crossOrigin="anonymous" />
        {/* Preload local profile fallback to avoid lazy-load penalty */}
        <link rel="preload" as="image" href="/profile-fallback.jpg" fetchPriority="high" />
      </head>
      <body className={`${plusJakarta.variable} ${outfit.variable} font-body antialiased theme-transition`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          suppressHydrationWarning
        />
        <FirebaseClientProvider>
          <LanguageProvider>
            <ThemeProvider>
              <SecurityProvider>
                <MotionProvider>
                  <SplashScreen />
                  <ClientShell />
                  <div className="overflow-x-hidden w-full">
                    <PageTransition>{children}</PageTransition>
                  </div>
                  <Toaster />
                  <ScrollProgressButton />
                </MotionProvider>
              </SecurityProvider>
            </ThemeProvider>
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
