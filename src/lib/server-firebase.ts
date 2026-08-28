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
import { 
  Certificate, 
  Project, 
  Experience, 
  ProfileData, 
  Testimonial, 
  TechSkill, 
  BlogPost, 
  PortfolioStats,
  DEFAULT_PROFILE, 
  DEFAULT_STATS 
} from '@/lib/types';

/**
 * Singleton Firestore instance untuk server-side rendering.
 * Dipanggil sekali per cold start; Firebase SDK handles dedup sendiri.
 */
export function getServerDb() {
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
    if (!snap.exists()) return DEFAULT_PROFILE;
    const d = snap.data();
    return {
      name: d.name || DEFAULT_PROFILE.name,
      roleId: d.roleId || DEFAULT_PROFILE.roleId,
      roleEn: d.roleEn || DEFAULT_PROFILE.roleEn,
      aboutMeId: d.aboutMeId || DEFAULT_PROFILE.aboutMeId,
      aboutMeEn: d.aboutMeEn || DEFAULT_PROFILE.aboutMeEn,
      profilePictureUrl: d.profilePictureUrl || DEFAULT_PROFILE.profilePictureUrl,
      heroTitleId: d.heroTitleId || DEFAULT_PROFILE.heroTitleId,
      heroTitleEn: d.heroTitleEn || DEFAULT_PROFILE.heroTitleEn,
      heroSubtitleId: d.heroSubtitleId || DEFAULT_PROFILE.heroSubtitleId,
      heroSubtitleEn: d.heroSubtitleEn || DEFAULT_PROFILE.heroSubtitleEn,
      email: d.email || DEFAULT_PROFILE.email,
      whatsapp: d.whatsAppNumber || d.whatsapp || DEFAULT_PROFILE.whatsapp,
      linkedin: d.linkedInProfileUrl || d.linkedin || DEFAULT_PROFILE.linkedin,
      instagram: d.instagram || DEFAULT_PROFILE.instagram,
      github: d.githubProfileUrl || d.github || DEFAULT_PROFILE.github,
      tiktok: d.tiktok || DEFAULT_PROFILE.tiktok,
      cvUrl: d.cvUrl || '',
      cvFileName: d.cvFileName || '',
      cvUpdatedAt: d.cvUpdatedAt || '',
      cvStoragePath: d.cvStoragePath || '',
    };
  } catch (error) {
    console.warn('[server-firebase] fetchProfile failed:', error);
    return DEFAULT_PROFILE;
  }
}

/**
 * Mengambil seluruh data publik sekaligus di server untuk disajikan via endpoint /api/public-data
 */
export async function fetchPublicDataFromServer() {
  try {
    const db = getServerDb();
    const [
      profileSnap,
      projectsSnap,
      certsSnap,
      testsSnap,
      journeySnap,
      skillsSnap,
      blogsSnap,
    ] = await Promise.all([
      getDoc(doc(db, 'portfolioOwner', 'profile')),
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'certificates')),
      getDocs(collection(db, 'testimonials')),
      getDocs(collection(db, 'careerTimelineEntries')),
      getDocs(collection(db, 'techSkills')),
      getDocs(collection(db, 'blogs')),
    ]);

    const pDoc = profileSnap.exists() ? profileSnap.data() : null;

    const profile: ProfileData = pDoc ? {
      name: pDoc.name || DEFAULT_PROFILE.name,
      roleId: pDoc.roleId || DEFAULT_PROFILE.roleId,
      roleEn: pDoc.roleEn || DEFAULT_PROFILE.roleEn,
      aboutMeId: pDoc.aboutMeId || DEFAULT_PROFILE.aboutMeId,
      aboutMeEn: pDoc.aboutMeEn || DEFAULT_PROFILE.aboutMeEn,
      profilePictureUrl: pDoc.profilePictureUrl || DEFAULT_PROFILE.profilePictureUrl,
      heroTitleId: pDoc.heroTitleId || DEFAULT_PROFILE.heroTitleId,
      heroTitleEn: pDoc.heroTitleEn || DEFAULT_PROFILE.heroTitleEn,
      heroSubtitleId: pDoc.heroSubtitleId || DEFAULT_PROFILE.heroSubtitleId,
      heroSubtitleEn: pDoc.heroSubtitleEn || DEFAULT_PROFILE.heroSubtitleEn,
      email: pDoc.email || DEFAULT_PROFILE.email,
      whatsapp: pDoc.whatsAppNumber || pDoc.whatsapp || DEFAULT_PROFILE.whatsapp,
      linkedin: pDoc.linkedInProfileUrl || pDoc.linkedin || DEFAULT_PROFILE.linkedin,
      instagram: pDoc.instagram || DEFAULT_PROFILE.instagram,
      github: pDoc.githubProfileUrl || pDoc.github || DEFAULT_PROFILE.github,
      tiktok: pDoc.tiktok || DEFAULT_PROFILE.tiktok,
      cvUrl: pDoc.cvUrl || '',
      cvFileName: pDoc.cvFileName || '',
      cvUpdatedAt: pDoc.cvUpdatedAt || '',
      cvStoragePath: pDoc.cvStoragePath || '',
    } : DEFAULT_PROFILE;

    const stats: PortfolioStats = pDoc ? {
      completedProjects: String(pDoc.totalProjectsCompleted || DEFAULT_STATS.completedProjects),
      yearsExperience: String(pDoc.codingExperienceYears || DEFAULT_STATS.yearsExperience),
      techMastered: String(pDoc.totalTechnologiesMastered || DEFAULT_STATS.techMastered),
      clientSatisfaction: pDoc.clientSatisfaction || DEFAULT_STATS.clientSatisfaction,
    } : DEFAULT_STATS;

    const projects: Project[] = projectsSnap.docs.map(d => ({ ...(d.data() as Project), id: d.id }));
    const certificates: Certificate[] = certsSnap.docs.map(d => ({ ...(d.data() as Certificate), id: d.id }));
    const testimonials: Testimonial[] = testsSnap.docs.map(d => ({ ...(d.data() as Testimonial), id: d.id }));
    const experiences: Experience[] = journeySnap.docs.map(d => ({ ...(d.data() as Experience), id: d.id }));
    const techSkills: TechSkill[] = skillsSnap.docs.map(d => ({ ...(d.data() as TechSkill), id: d.id }));
    const blogs: BlogPost[] = blogsSnap.docs.map(d => {
      const b = d.data() as any;
      return {
        id: d.id,
        slug: b.slug || d.id,
        titleId: b.titleId || '',
        titleEn: b.titleEn || '',
        summaryId: b.summaryId || '',
        summaryEn: b.summaryEn || '',
        contentId: b.contentId || '',
        contentEn: b.contentEn || '',
        coverImage: b.coverImage || '',
        tags: Array.isArray(b.tags) ? b.tags : (b.tags ? b.tags.split(',').map((t: string) => t.trim()) : []),
        author: b.author || 'Nara Andra Tyaga',
        publishedAt: b.publishedAt || new Date().toISOString(),
        readingTime: b.readingTime || '3 min read',
        featured: !!b.featured,
        updatedAt: b.updatedAt || '',
      };
    });

    return {
      projects,
      certificates,
      testimonials,
      experiences,
      messages: [],
      techSkills,
      blogs,
      shortLinks: [],
      profile,
      stats,
    };
  } catch (error) {
    console.warn('[server-firebase] fetchPublicDataFromServer failed:', error);
    return {
      projects: [],
      certificates: [],
      testimonials: [],
      experiences: [],
      messages: [],
      techSkills: [],
      blogs: [],
      shortLinks: [],
      profile: DEFAULT_PROFILE,
      stats: DEFAULT_STATS,
    };
  }
}


