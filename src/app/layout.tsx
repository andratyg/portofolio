import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import { LanguageProvider } from '@/components/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { SecurityProvider } from '@/components/SecurityProvider';
import { ScrollProgressButton } from '@/components/ScrollProgressButton';

// ─── Fonts ───────────────────────────────────────────────────────────────────
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-space-grotesk',
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
const BASE_URL   = 'https://nara-andra-tyaga.vercel.app';
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

  // Covers all search variants: "Nara Andra Tyaga", "Andra", "Andra Tyaga", "Tyaga", "NAT"
  keywords: [
    'Nara Andra Tyaga',
    'Andra Tyaga',
    'Nara Andra',
    NICKNAME,
    'Tyaga',
    'NAT',
    'nara andra tyaga portofolio',
    'andra tyaga web developer',
    'andra smk wikrama',
    'andra bogor',
    SCHOOL,
    PROGRAM,
    'PPLG Wikrama',
    'SMK Wikrama PPLG',
    'Web Developer Indonesia',
    'Next.js Developer',
    'React Developer',
    'TypeScript Developer',
    'Firebase Developer',
    'Frontend Developer Indonesia',
    'Portofolio Siswa PPLG',
    'Bogor Web Developer',
    'Portofolio Web Developer',
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
    canonical: BASE_URL,
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

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Nara Andra Tyaga',
  alternateName: ['Andra', 'Andra Tyaga', 'Nara Andra', 'NAT', 'Tyaga'],
  description: DESCRIPTION,
  url: BASE_URL,
  sameAs: [
    'https://github.com/nara-andra-tyaga',
    'https://linkedin.com/in/nara-andra-tyaga',
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
  knowsAbout: ['Next.js', 'React', 'TypeScript', 'Firebase', 'Tailwind CSS', 'Web Development'],
  nationality: { '@type': 'Country', name: 'Indonesia' },
  image: OG_IMAGE,
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': BASE_URL,
  },
};

// ─── Layout ──────────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning style={{ scrollBehavior: 'smooth' }}>
      <head>
        <meta name="google-site-verification" content="cu0oN6kGs748IQbeUkW1eFLhaKDJwYpJ6Gn9daxm9tk" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased theme-transition`}>
        <FirebaseClientProvider>
          <LanguageProvider>
            <ThemeProvider>
              <SecurityProvider>
                <div className="print:hidden overflow-x-hidden w-full">{children}</div>
                <div className="hidden print:block print:p-8">{children}</div>
                <Toaster />
                <ScrollProgressButton />
              </SecurityProvider>
            </ThemeProvider>
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
