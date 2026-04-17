import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import { LanguageProvider } from '@/components/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import Script from 'next/script';

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'KaryaPro | Professional Portfolio OP Edition',
  description: 'Showcase your career journey and projects with premium style, AI-powered descriptions, and real-time data.',
  keywords: ['Portfolio', 'Full Stack Developer', 'KaryaPro', 'Next.js', 'React', 'Firebase'],
  authors: [{ name: 'KaryaPro Owner' }],
  openGraph: {
    title: 'KaryaPro | Professional Portfolio',
    description: 'Transforming Ideas Into Reality with Modern Web Solutions.',
    url: 'https://karyapro.app',
    siteName: 'KaryaPro',
    images: [
      {
        url: 'https://picsum.photos/seed/karyapro-og/1200/630',
        width: 1200,
        height: 630,
        alt: 'KaryaPro Portfolio Preview',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KaryaPro | Professional Portfolio',
    description: 'Modern Full-Stack Developer Portfolio',
    images: ['https://picsum.photos/seed/karyapro-og/1200/630'],
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
  // Schema.org JSON-LD for Person & Portfolio
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "KaryaPro Owner",
    "jobTitle": "Full-Stack Developer",
    "url": "https://karyapro.app",
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
        {/* Google Analytics Placeholder */}
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
      <body className="font-body antialiased transition-colors duration-500">
        <FirebaseClientProvider>
          <LanguageProvider>
            <ThemeProvider>
              <div className="print:hidden">
                {children}
              </div>
              <div className="hidden print:block print:p-8">
                {/* Print Version will be handled by CSS */}
                {children}
              </div>
              <Toaster />
            </ThemeProvider>
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}