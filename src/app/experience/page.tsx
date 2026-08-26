import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Timeline } from '@/components/sections/Timeline';
import { Contact } from '@/components/sections/Contact';
import { ProjectStoreProvider } from '@/stores/ProjectStore';
import { fetchExperiences } from '@/lib/server-firebase';
import { Footer } from '@/components/layout/Footer';

const BASE_URL = 'https://www.naraandratyaga.my.id';

export const metadata: Metadata = {
  title: 'Perjalanan Karir & Pendidikan',
  description:
    'Jejak perjalanan karir dan pendidikan Nara Andra Tyaga — riwayat pengalaman kerja, magang, dan pencapaian akademis di bidang web development dan teknologi.',
  alternates: {
    canonical: `${BASE_URL}/experience`,
  },
  openGraph: {
    title: 'Perjalanan Karir & Pendidikan | Nara Andra Tyaga',
    description:
      'Lihat riwayat perjalanan karir dan pendidikan Nara Andra Tyaga — pengalaman kerja, magang, dan pencapaian akademis.',
    url: `${BASE_URL}/experience`,
    type: 'profile',
  },
};

// ISR: revalidasi di background setiap 5 menit.
// Riwayat karir jarang berubah — 5 menit sangat cukup.
export const revalidate = 300;

export default async function ExperiencePage() {
  // Fetch data di server — sudah ada di HTML awal, terlihat oleh crawler
  const initialExperiences = await fetchExperiences();

  return (
    <ProjectStoreProvider>
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-20">
          <Timeline initialExperiences={initialExperiences} />
          <Contact />
        </div>
        <Footer />
      </main>
    </ProjectStoreProvider>
  );
}
