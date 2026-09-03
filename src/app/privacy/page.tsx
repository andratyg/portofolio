import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, ArrowLeft, Lock, FileText, Eye, CheckCircle2 } from 'lucide-react';

const BASE_URL = 'https://www.naraandratyaga.my.id';
const FULL_NAME = 'Nara Andra Tyaga';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi (Privacy Policy)',
  description: `Kebijakan Privasi resmi portofolio ${FULL_NAME}. Informasi mengenai pengumpulan, penggunaan, dan perlindungan data pengunjung situs.`,
  alternates: {
    canonical: `${BASE_URL}/privacy`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen selection:bg-primary selection:text-primary-foreground flex flex-col justify-between">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[150px]" />
      </div>

      <article className="pt-28 pb-16 md:pt-36 md:pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              Transparansi & Keamanan
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4">
            Kebijakan Privasi
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Terakhir diperbarui: 3 September 2026
          </p>

          <div className="space-y-8 text-foreground/90 text-sm sm:text-base leading-relaxed">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <h2 className="text-lg font-black uppercase text-foreground flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" /> 1. Pengumpulan Informasi
              </h2>
              <p>
                Kami menghormati privasi Anda. Situs portofolio ini mengumpulkan informasi minimal yang Anda berikan secara sukarela melalui formulir kontak (nama, alamat email, dan isi pesan). Situs ini juga menggunakan analitik anonim (seperti Vercel Analytics) untuk memantau performa dan jumlah pengunjung tanpa menyimpan alamat IP mentah atau identitas pribadi.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <h2 className="text-lg font-black uppercase text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" /> 2. Penggunaan Data
              </h2>
              <p>
                Informasi yang dikirimkan via formulir kontak hanya digunakan untuk merespons pesan atau penawaran kerja sama dari Anda. Data Anda <strong>tidak akan pernah</strong> dijual, disewakan, atau dibagikan kepada pihak ketiga mana pun tanpa persetujuan Anda.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <h2 className="text-lg font-black uppercase text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> 3. Cookies & Penyimpanan Lokal
              </h2>
              <p>
                Situs ini menggunakan <code>localStorage</code> hanya untuk menyimpan preferensi tema (Light, Dark, Anime, dll) dan pilihan bahasa Anda agar pengalaman menjelajah tetap konsisten. Kami tidak menggunakan cookie pelacak iklan pihak ketiga.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <h2 className="text-lg font-black uppercase text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" /> 4. Hak Anda & Hubungi Kami
              </h2>
              <p>
                Anda berhak meminta penghapusan pesan atau data pribadi yang telah Anda kirimkan kepada kami kapan saja. Jika ada pertanyaan mengenai kebijakan privasi ini, silakan hubungi via halaman <Link href="/contact" className="text-primary underline font-bold">Kontak</Link>.
              </p>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
