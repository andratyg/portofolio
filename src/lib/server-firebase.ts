/**
 * server-firebase.ts
 *
 * Fungsi server-only untuk mengambil data publik dari Firestore.
 * Menggunakan Firebase CLIENT SDK (bukan Admin SDK) — tidak perlu
 * service account / env var baru. Pola identik dengan server-shortlinks.ts.
 *
 * Digunakan oleh Server Components (halaman /certificates, /projects, dll.)
 * untuk SSR / ISR sehingga data sudah ada di initial HTML (visible ke crawler).
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { Certificate, Project, Experience, ProfileData } from '@/lib/types';

/**
 * Singleton Firestore instance untuk server-side rendering.
 * Dipanggil sekali per cold start; Firebase SDK handles dedup sendiri.
 */
function getServerDb() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app);
}

/**
 * Mengambil semua dokumen sertifikat dari koleksi Firestore.
 * Aman dipanggil di Server Component (async/await, tidak blocking UI).
 *
 * @returns Array<Certificate> — kosong jika fetch gagal (graceful fallback)
 */
export async function fetchCertificates(): Promise<Certificate[]> {
  try {
    const db = getServerDb();
    const snap = await getDocs(collection(db, 'certificates'));
    return snap.docs.map((d) => ({
      ...(d.data() as Certificate),
      id: d.id,
    }));
  } catch (error) {
    console.warn('[server-firebase] fetchCertificates failed:', error);
    return [];
  }
}

/**
 * Mengambil semua dokumen proyek dari koleksi Firestore.
 * Aman dipanggil di Server Component (async/await, tidak blocking UI).
 *
 * @returns Array<Project> — kosong jika fetch gagal (graceful fallback)
 */
export async function fetchProjects(): Promise<Project[]> {
  try {
    const db = getServerDb();
    const snap = await getDocs(collection(db, 'projects'));
    return snap.docs.map((d) => ({
      ...(d.data() as Project),
      id: d.id,
    }));
  } catch (error) {
    console.warn('[server-firebase] fetchProjects failed:', error);
    return [];
  }
}

/**
 * Mengambil semua entri perjalanan karir dari koleksi Firestore.
 * Aman dipanggil di Server Component (async/await, tidak blocking UI).
 *
 * @returns Array<Experience> — kosong jika fetch gagal (graceful fallback)
 */
export async function fetchExperiences(): Promise<Experience[]> {
  try {
    const db = getServerDb();
    const snap = await getDocs(collection(db, 'careerTimelineEntries'));
    return snap.docs.map((d) => ({
      ...(d.data() as Experience),
      id: d.id,
    }));
  } catch (error) {
    console.warn('[server-firebase] fetchExperiences failed:', error);
    return [];
  }
}

/**
 * Mengambil data profil pemilik portofolio dari Firestore (portfolioOwner/profile).
 * Digunakan untuk Server-Side Rendering (SSR/ISR) Hero section termasuk cvUrl.
 *
 * @returns ProfileData | null — null jika tidak ditemukan / fetch gagal
 */
export async function fetchProfile(): Promise<ProfileData | null> {
  try {
    const db = getServerDb();
    const snap = await getDoc(doc(db, 'portfolioOwner', 'profile'));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      name: d.name || '',
      roleId: d.roleId || '',
      roleEn: d.roleEn || '',
      aboutMeId: d.aboutMeId || '',
      aboutMeEn: d.aboutMeEn || '',
      profilePictureUrl: d.profilePictureUrl || '',
      heroTitleId: d.heroTitleId || '',
      heroTitleEn: d.heroTitleEn || '',
      heroSubtitleId: d.heroSubtitleId || '',
      heroSubtitleEn: d.heroSubtitleEn || '',
      email: d.email || '',
      whatsapp: d.whatsAppNumber || d.whatsapp || '',
      linkedin: d.linkedInProfileUrl || d.linkedin || '',
      instagram: d.instagram || '',
      github: d.githubProfileUrl || d.github || '',
      tiktok: d.tiktok || '',
      cvUrl: d.cvUrl || '',
      cvFileName: d.cvFileName || '',
      cvUpdatedAt: d.cvUpdatedAt || '',
      cvStoragePath: d.cvStoragePath || '',
    };
  } catch (error) {
    console.warn('[server-firebase] fetchProfile failed:', error);
    return null;
  }
}

