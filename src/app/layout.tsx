import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import { LanguageProvider } from '@/components/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { SecurityProvider } from '@/components/SecurityProvider';
import { ScrollProgressButton } from '@/components/ScrollProgressButton'; // Impor komponen baru

// Font Optimization
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

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Nara Andra Tyaga | PPLG SMK Wikrama Bogor',
  description: 'Portofolio Nara Andra Tyaga, siswa PPLG SMK Wikrama Bogor. Fokus pada pengembangan aplikasi web dan logika sistem yang efisien.',
  keywords: ['Portfolio', 'Nara Andra Tyaga', 'SMK Wikrama Bogor', 'PPLG', 'Web Developer', 'Software Engineering'],
  authors: [{ name: 'Nara Andra Tyaga' }],
  verification: {
    google: 'cu0oN6kGs748IQbeUkW1eFLhaKDJwYpJ6Gn9daxm9tk',
  },
  openGraph: {
    title: 'Nara Andra Tyaga | PPLG SMK Wikrama Bogor',
    description: 'Portofolio Nara Andra Tyaga, siswa PPLG SMK Wikrama Bogor. Fokus pada pengembangan aplikasi web dan logika sistem yang efisien.',
    url: 'https://nara-andra-tyaga.vercel.app',
    siteName: 'Nara Andra Tyaga Portfolio',
    images: [{ url: 'https://picsum.photos/seed/nat-og/1200/630', width: 1200, height: 630 }],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nara Andra Tyaga | PPLG SMK Wikrama Bogor',
    images: ['https://picsum.photos/seed/nat-og/1200/630'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning style={{ scrollBehavior: 'smooth' }}>
      <head>
        <meta name="google-site-verification" content="cu0oN6kGs748IQbeUkW1eFLhaKDJwYpJ6Gn9daxm9tk" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased theme-transition overflow-x-hidden`}>
        <FirebaseClientProvider>
          <LanguageProvider>
            <ThemeProvider>
              <SecurityProvider>
                <div className="print:hidden">{children}</div>
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