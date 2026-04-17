import type {Metadata} from 'next';
import './globals.css';
import {ThemeProvider} from '@/components/ThemeContext';
import {LanguageProvider} from '@/components/LanguageContext';
import {Toaster} from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'KaryaPro | Professional Portfolio',
  description: 'Showcase your career journey and projects with style.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased transition-colors duration-500">
        <LanguageProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
