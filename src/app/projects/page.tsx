/**
 * /projects - Server Component dengan ISR (revalidate 300 detik / 5 menit).
 *
 * Data proyek diambil di SERVER saat render, sehingga HTML awal sudah berisi
 * daftar lengkap proyek — terlihat oleh crawler, Googlebot, dan AI indexers
 * tanpa perlu menjalankan JavaScript.
 *
 * ISR memastikan data tetap segar (max stale: 5 menit) tanpa mengorbankan
 * performa atau membuka koneksi WebSocket real-time yang melanggar bfcache.
 */

import { Navbar } from '@/components/layout/Navbar';
import { Portfolio } from '@/components/sections/Portfolio';
import { Contact } from '@/components/sections/Contact';
import { ProjectStoreProvider } from '@/stores/ProjectStore';
import { fetchProjects } from '@/lib/server-firebase';
import { Footer } from '@/components/layout/Footer';
// Footer is a "use client" component — safe here, it's nested inside providers

// ISR: revalidasi halaman di background setiap 5 menit.
// Crawler selalu mendapat HTML segar; bfcache tetap aktif (tidak ada WS).
export const revalidate = 300;

export default async function ProjectsPage() {
  // Fetch data di server — sudah ada di HTML awal, tidak perlu JS
  const initialProjects = await fetchProjects();

  return (
    <ProjectStoreProvider>
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-20">
          <Portfolio initialProjects={initialProjects} />
          <Contact />
        </div>
        <Footer />
      </main>
    </ProjectStoreProvider>
  );
}
