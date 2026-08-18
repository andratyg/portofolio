import type { Metadata } from 'next';

const BASE_URL = 'https://www.naraandratyaga.my.id';

export const metadata: Metadata = {
  title: 'Sertifikat & Pencapaian',
  description:
    'Koleksi sertifikat dan pencapaian resmi Nara Andra Tyaga di bidang web development, UI/UX design, dan teknologi — dari berbagai lembaga dan platform terpercaya.',
  alternates: {
    canonical: `${BASE_URL}/certificates`,
  },
  openGraph: {
    title: 'Sertifikat & Pencapaian | Nara Andra Tyaga',
    description:
      'Lihat sertifikat dan pencapaian resmi Nara Andra Tyaga dalam web development, UI/UX, dan teknologi modern.',
    url: `${BASE_URL}/certificates`,
  },
};

export default function CertificatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}