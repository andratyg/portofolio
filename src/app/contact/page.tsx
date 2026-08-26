import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Contact } from '@/components/sections/Contact';
import { ProjectStoreProvider } from '@/stores/ProjectStore';
import { Footer } from '@/components/layout/Footer';

const BASE_URL = 'https://www.naraandratyaga.my.id';

export const metadata: Metadata = {
  title: 'Hubungi Saya',
  description:
    'Hubungi Nara Andra Tyaga untuk diskusi kolaborasi, proyek web, atau peluang kerja. Tersedia melalui WhatsApp, LinkedIn, Instagram, GitHub, dan email.',
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
  openGraph: {
    title: 'Hubungi Saya | Nara Andra Tyaga',
    description:
      'Ingin berkolaborasi atau punya proyek menarik? Hubungi Nara Andra Tyaga melalui form atau kanal sosial yang tersedia.',
    url: `${BASE_URL}/contact`,
    type: 'website',
  },
};

// Contact page tidak membutuhkan ISR — konten statis (form + social links dari profile store).
// Namun tetap set revalidate supaya metadata konsisten dengan halaman lain.
export const revalidate = 3600;

export default function ContactPage() {
  return (
    <ProjectStoreProvider>
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-20">
          <Contact />
        </div>
        <Footer />
      </main>
    </ProjectStoreProvider>
  );
}
