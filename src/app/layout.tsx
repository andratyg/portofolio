import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import { LanguageProvider } from '@/components/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import Script from 'next/script';
import { SecurityProvider } from '@/components/SecurityProvider';

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'NAT | Professional Portfolio OP Edition',
  description: 'Showcase your career journey and projects with premium style, AI-powered descriptions, and real-time data.',
  keywords: ['Portfolio', 'Full Stack Developer', 'NAT', 'Next.js', 'React', 'Firebase'],
  authors: [{ name: 'Nara Andra Tyaga' }],
  verification: {
    google: 'cu0oN6kGs748IQbeUkW1eFLhaKDJwYpJ6Gn9daxm9tk',
  },
  openGraph: {
    title: 'NAT | Professional Portfolio',
    description: 'Transforming Ideas Into Reality with Modern Web Solutions.',
    url: 'https://nat.app',
    siteName: 'NAT',
    images: [
      {
        url: 'https://picsum.photos/seed/nat-og/1200/630',
        width: 1200,
        height: 630,
        alt: 'NAT Portfolio Preview',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NAT | Professional Portfolio',
    description: 'Modern Full-Stack Developer Portfolio',
    images: ['https://picsum.photos/seed/nat-og/1200/630'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Nara Andra Tyaga",
    "jobTitle": "Full-Stack Developer",
    "url": "https://nat.app",
    "sameAs": [
      "https://github.com",
      "https://linkedin.com"
    ]
  };

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body className="font-body antialiased transition-colors duration-500 overflow-x-hidden">
        <FirebaseClientProvider>
          <LanguageProvider>
            <ThemeProvider>
              <SecurityProvider>
                <div className="print:hidden">
                  {children}
                </div>
                <div className="hidden print:block print:p-8">
                  {children}
                </div>
                <Toaster />
              </SecurityProvider>
            </ThemeProvider>
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
