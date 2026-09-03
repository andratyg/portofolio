import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollText, ArrowLeft, Scale, Code2, Link2, Gavel } from 'lucide-react';

const BASE_URL = 'https://www.naraandratyaga.my.id';
const FULL_NAME = 'Nara Andra Tyaga';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan (Terms of Service)',
  description: `Syarat dan ketentuan penggunaan situs portofolio ${FULL_NAME} — aturan penggunaan konten, kekayaan intelektual, dan batasan tanggung jawab.`,
  alternates: {
    canonical: `${BASE_URL}/terms`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
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
              <ScrollText className="h-5 w-5" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              Aturan Penggunaan
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4">
            Syarat & Ketentuan
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Terakhir diperbarui: 3 September 2026
          </p>

          <div className="space-y-8 text-foreground/90 text-sm sm:text-base leading-relaxed">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <h2 className="text-lg font-black uppercase text-foreground flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" /> 1. Penerimaan Syarat
              </h2>
              <p>
                Dengan mengakses dan menggunakan situs portofolio {FULL_NAME}, Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang tercantum di halaman ini.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <h2 className="text-lg font-black uppercase text-foreground flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" /> 2. Kekayaan Intelektual
              </h2>
              <p>
                Seluruh konten dalam situs ini — termasuk namun tidak terbatas pada desain, kode, artikel blog, teks, logo, dan studi kasus proyek — adalah milik {FULL_NAME} kecuali dinyatakan lain. Anda diperbolehkan membagikan tautan ke halaman situs ini, namun dilarang menyalin, menduplikasi, atau mempublikasikan ulang konten tanpa izin tertulis.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <h2 className="text-lg font-black uppercase text-foreground flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" /> 3. Tautan Eksternal
              </h2>
              <p>
                Situs ini memuat tautan ke situs pihak ketiga (live demo proyek, profil sosial media, dan lain-lain). Kami tidak bertanggung jawab atas isi, kebijakan privasi, maupun praktik dari situs-situs eksternal tersebut.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <h2 className="text-lg font-black uppercase text-foreground flex items-center gap-2">
                <Gavel className="h-5 w-5 text-primary" /> 4. Batasan Tanggung Jawab
              </h2>
              <p>
                Situs ini disediakan &ldquo;sebagaimana adanya&rdquo; tanpa jaminan apa pun. Kami berupaya menjaga informasi tetap akurat dan terkini, namun tidak menjamin bebas dari kesalahan. Penggunaan informasi dari situs ini sepenuhnya menjadi tanggung jawab Anda. Kebijakan privasi kami dapat dibaca di halaman <Link href="/privacy" className="text-primary underline font-bold">Kebijakan Privasi</Link>.
              </p>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
