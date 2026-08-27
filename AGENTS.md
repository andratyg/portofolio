# 🤖 AGENTS.md — Panduan & Log Perubahan AI Agent

Dokumen ini adalah panduan standar dan catatan historis untuk semua AI Agent yang bekerja pada repositori portofolio **Nara Andra Tyaga**.

---

## 📌 Aturan & Prinsip Kerja Agent
1. **Wajib Membaca Sebelum Mengedit**: Selalu baca file yang ditargetkan dan file terkait sebelum melakukan modifikasi.
2. **Update Log Perubahan**: Setiap kali selesai merubah atau mengedit kode, **wajib memperbarui bagian "Log Perubahan"** di dokumen ini (Tanggal, File, Alasan).
3. **Performa & Best Practices**:
   - Gunakan `loading="lazy"` untuk gambar di bawah lipatan (*below the fold*).
   - Selalu berikan prop `sizes` yang proporsional pada komponen Next.js `<Image />`.
   - Jangan mengimpor atau menginisialisasi SDK berat (seperti Firebase Auth) di halaman publik kecuali pada rute `/admin`.
   - Gunakan `getDocs`/`getDoc` dengan in-memory cache untuk data publik agar **Back/Forward Cache (bfcache)** tetap aktif.
4. **Keamanan & Kompatibilitas**:
   - Pastikan tipe TypeScript lolos pengecekan (`npm run typecheck`).
   - Hindari manipulasi DOM langsung yang melanggar CSP atau Trusted Types.

---

## 🚦 Status Fitur & Prioritas

### 🟢 Selesai (Completed)
- **Sistem Blog Lengkap**:
  - Manajemen blog di dashboard admin (`/admin`) dengan dukungan terjemahan AI (ID/EN) dan tag.
  - Halaman publik `/blog` dengan fitur pencarian instan dan filter kategori/tag.
  - Halaman detail artikel `/blog/[slug]` dengan format typography modern, code block parser, dan related articles.
- **AI Studio Admin & AI Portfolio Advisor**:
  - Context Injection pada `generate-certificate-description.ts` & `generate-portfolio-description-suggestion.ts` untuk konsistensi gaya bahasa dan klaim pengalaman.
  - Flow baru `analyze-portfolio-recommendations.ts` (Gemini 2.5 Flash) untuk audit otomatis kelengkapan data, validasi bilingual, dan konsistensi metrik.
  - Komponen UI `AIAdvisorPanel.tsx` di `/admin` dengan visual health score, filter kategori, badge prioritas (tinggi/sedang/rendah), navigasi langsung ke tab terkait, dan fitur dismissal permanen tersimpan ke Firestore.
- **Optimasi Performa Core Web Vitals (Lighthouse)**:
  - Lazy load Firebase Auth (mengeliminasi *iframe blocking* 3.4-4.5 detik di halaman publik).
  - Transisi Firestore data publik ke One-Time Fetch (`getDocs`/`getDoc`) + memory cache, memulihkan *bfcache*.
  - Pembersihan layout shifts (CLS) pada kursor typewriter Hero dan pemotongan CPU tilt di perangkat layar sentuh.
  - ParticleCanvas dinonaktifkan di layar mobile untuk hemat daya.
  - Peningkatan target kompilasi ke `ES2022` di `tsconfig.json` (eliminasi polyfill legacy ~8 KiB).
  - Berkas statis `public/robots.txt` dengan dukungan AI Crawler & eliminasi crash error 500.
  - Penjaminan meta description di semua rute halaman.
  - Penguatan CSP dengan direktif Trusted Types (khusus production).

---

## 📝 Log Perubahan

| Tanggal | File yang Diubah | Alasan Perubahan |
| :--- | :--- | :--- |
| **2026-08-21** | `src/app/blog/page.tsx`<br>`src/app/blog/[slug]/page.tsx`<br>`src/app/admin/page.tsx`<br>`src/lib/types.ts`<br>`src/components/layout/Navbar.tsx`<br>`src/components/layout/Footer.tsx` | Implementasi sistem Blog lengkap (Admin CRUD + AI translation, dynamic public listing `/blog`, dynamic reader detail `/blog/[slug]`, dan navigasi). |
| **2026-08-21** | `src/firebase/index.ts`<br>`src/firebase/provider.tsx` | Lazy load `getAuth` dan auth listener hanya untuk rute `/admin`, mengeliminasi iframe otentikasi Google dari critical path halaman publik. |
| **2026-08-21** | `src/stores/ProjectStore.tsx` | Mengganti subscription WebSocket `onSnapshot` real-time pada data publik menjadi one-time fetch (`getDocs`/`getDoc`) dengan caching, mengaktifkan kembali Back/Forward Cache (bfcache). |
| **2026-08-21** | `src/components/sections/Hero.tsx`<br>`src/components/sections/Portfolio.tsx`<br>`src/components/sections/About.tsx`<br>`src/components/features/ParticleCanvas.tsx` | Optimasi LCP & CLS: Mengubah gambar below-the-fold ke `loading="lazy"`, membatasi mouse tilt ke desktop, memperbaiki container typewriter, dan menonaktifkan canvas di mobile. |
| **2026-08-21** | `public/robots.txt`<br>`src/app/sitemap.ts`<br>`src/app/layout.tsx` | Memperbaiki error 500 robots.txt dengan menyajikan berkas statis, fallback URL sitemap, dan memastikan tag meta description terinjeksi bersih. |
| **2026-08-21** | `tsconfig.json`<br>`package.json` | Upgrade target TypeScript ke `ES2022` dan browserslist ke browser modern untuk mengeliminasi polyfill JavaScript usang (~8 KiB). |
| **2026-08-21** | `next.config.ts`<br>`src/app/layout.tsx` | Penguatan CSP & Trusted Types: Mengisolasi `require-trusted-types-for` ke mode production dan mendaftarkan default policy di root layout agar HMR dev server tidak error. |
| **2026-08-21** | `src/firebase/index.ts` | Eliminasi `console.warn` pada inisialisasi Firebase fallback untuk mencegah regresi audit "Browser errors in console" pada Lighthouse Best Practices (100). |
| **2026-08-21** | `src/ai/flows/generate-certificate-description.ts`<br>`src/ai/flows/generate-portfolio-description-suggestion.ts`<br>`src/ai/flows/analyze-portfolio-recommendations.ts`<br>`src/components/admin/AIAdvisorPanel.tsx`<br>`src/app/admin/page.tsx` | Implementasi Context Injection pada generator deskripsi dan flow baru AI Portfolio Advisor (Gemini 2.5 Flash) lengkap dengan panel audit rekomendasi di dashboard admin. |
| **2026-08-21** | `src/app/sitemap.ts`<br>`src/app/blog/[slug]/page.tsx` | Integrasi Dynamic Sitemap otomatis dari Firestore untuk seluruh custom slug blog dan injeksi Schema.org `BlogPosting` JSON-LD untuk pengindeksan instan Google SEO. |
| **2026-08-21** | `src/components/icons/TikTokIcon.tsx`<br>`src/components/sections/Contact.tsx`<br>`src/components/layout/Footer.tsx` | Implementasi logo asli TikTok dengan efek chromatic aberration (Cyan, Magenta, White) pada Contact section dan Footer. |
| **2026-08-21** | `public/sw.js`<br>`src/components/layout/ScrollProgressButton.tsx`<br>`next.config.ts`<br>`src/components/sections/Hero.tsx`<br>`src/components/sections/About.tsx`<br>`src/components/sections/Portfolio.tsx`<br>`src/components/sections/Certificates.tsx` | Optimasi Mobile Lighthouse: Eliminasi 404 cache pada Service Worker (Best Practices 100), passive scroll listener, konfigurasi granular deviceSizes (360-414px) & quality={75} untuk memangkas LCP bandwidth, eliminasi CLS pada SVG icons, dan ekspansi optimizePackageImports (tree-shaking Radix & Zustand). |
| **2026-08-21** | `public/sw.js`<br>`src/components/layout/Navbar.tsx`<br>`src/stores/ProjectStore.tsx`<br>`src/components/sections/TechStack.tsx`<br>`src/app/blog/page.tsx` | Perbaikan Definitif Core Web Vitals: Isolasi Service Worker khusus same-origin (mengeliminasi crash respondWith TypeError pada fetch throttling), penggantian layoutId Navbar ke static CSS underline (CLS Desktop 0.000), dan Tiered Firestore Data Fetching (Tier 1 Profile+Projects instan unblock LCP; Tier 2 below-the-fold) untuk memangkas network dependency chain di Slow 4G. |
| **2026-08-21** | `AGENTS.md` | Inisialisasi dokumen panduan agen dan pencatatan log perubahan terstruktur. |
| **2026-08-22** | `src/app/l/[slug]/page.tsx`<br>`src/app/l/[slug]/ShortLinkPreviewClient.tsx`<br>`src/lib/server-shortlinks.ts`<br>`src/lib/types.ts`<br>`src/stores/ProjectStore.tsx`<br>`src/app/admin/page.tsx`<br>`firestore.rules` | Revisi Arsitektur URL Shortener ke Interstitial Preview Page (`/l/[slug]`): Transisi ke halaman preview Cyberpunk/System dengan countdown 3s & pause toggle, non-blocking click tracking via `after()`, filter crawler/bot previewer agar tidak meng-increment `clickCount`, eliminasi total penyimpanan IP mentah, implementasi **OPSI B** (verifikasi netral & jujur), serta penambahan tab manajemen Short Links di Dashboard Admin. |
| **2026-08-22** | `src/ai/flows/analyze-portfolio-recommendations.ts`<br>`src/ai/flows/translate-content.ts`<br>`src/ai/flows/generate-portfolio-description-suggestion.ts`<br>`src/ai/flows/generate-certificate-description.ts`<br>`src/components/providers/MotionProvider.tsx` | Resolusi Error Server Action AI Advisor & LazyMotion Crash: Implementasi intelligent deterministic heuristic audit fallback pada flow rekomendasi portfolio saat API Gemini tidak tersedia/rate-limited (mengeliminasi crash 500 Internal Server Error di production), pengamanan seluruh flow AI dengan try/catch, penghapusan strict mode LazyMotion, dan instalasi dependensi `@vercel/analytics`. |
| **2026-08-23** | `src/firebase/provider.tsx`<br>`src/components/layout/Navbar.tsx`<br>`next.config.ts`<br>`public/manifest.json`<br>`public/favicon.ico`<br>`public/apple-touch-icon.png` | Investigasi & Resolusi Diagnostic Production: Mengeliminasi eager fallback `getAuth()` di `useFirebase()` dan menghapus residual `useUser()` di `Navbar.tsx` (mencegah iframe auth Google dan 13 third-party cookies di mobile/desktop), perbaikan CSP Trusted Types (`gapi#gapi`, `goog#html`), pembuatan aset ikon statis `favicon.ico` dan `apple-touch-icon.png` (mengeliminasi console error 404 pada browser), serta perbaikan atribut manifest icon purpose. |
| **2026-08-26** | `src/app/experience/page.tsx` *(baru)*<br>`src/app/contact/page.tsx` *(baru)*<br>`src/lib/server-firebase.ts`<br>`src/components/sections/Timeline.tsx`<br>`src/components/layout/Navbar.tsx`<br>`src/components/layout/Footer.tsx`<br>`src/app/sitemap.ts` | **Halaman Dedicated `/experience` & `/contact`**: Membuat rute mandiri untuk section Journey dan Contact yang sebelumnya hanya bisa diakses via anchor scroll di homepage. `/experience` adalah async Server Component (ISR 5 menit) dengan `fetchExperiences()` server-side sehingga data terlihat crawler. `/contact` adalah Server Component statis (form submission tetap client-side). Timeline direfactor dengan prop `initialExperiences`. Navbar diperbarui: klik "Perjalanan"/"Kontak" di homepage tetap smooth scroll ke anchor; di halaman lain navigasi ke rute dedicated. Footer diperbarui ke link eksplisit. Kedua rute ditambahkan ke sitemap.ts. |
| **2026-08-26** | `src/lib/server-firebase.ts` *(baru)*<br>`src/app/certificates/page.tsx`<br>`src/app/projects/page.tsx`<br>`src/components/sections/Certificates.tsx`<br>`src/components/sections/Portfolio.tsx` | **SSR Data Hydration (SEO/Crawler Fix)**: Membuat `server-firebase.ts` dengan fungsi `fetchCertificates()` & `fetchProjects()` (pola identik `server-shortlinks.ts`, tanpa Admin SDK). Mengubah halaman `/certificates` dan `/projects` dari `"use client"` menjadi async Server Components dengan `export const revalidate = 300` (ISR 5 menit). Menambahkan prop `initialCertificates` dan `initialProjects` ke komponen `Certificates` dan `Portfolio` agar data diinject dari server dan langsung ada di initial HTML — terlihat oleh Googlebot, AI crawler, dan `curl` tanpa JS. Logic store (untuk admin & interaktivitas) tidak tersentuh; bfcache, CLS, lazy load auth tetap utuh. |
| **2026-08-23** | `src/hooks/use-typewriter.ts`<br>`src/components/AnimateOnScroll.tsx`<br>`src/components/sections/Hero.tsx` | Eliminasi Regresi Desktop CLS (0.055 -> 0.000): Inisialisasi `useTypewriter` langsung dengan `words[0]` (menghilangkan layout shift kursor saat hidrasi) dan menghapus transisi `translateY` dinamis serta mengunci `minHeight` statis pada `AnimateOnScroll` agar elemen below-the-fold tidak melompat di viewport desktop. |
| **2026-08-26** | `src/firebase/config.ts`<br>`firebase.json`<br>`storage.rules`<br>`src/app/actions/revalidate.ts` *(baru)*<br>`src/lib/types.ts`<br>`src/lib/server-firebase.ts`<br>`src/app/page.tsx`<br>`src/components/sections/Hero.tsx`<br>`src/stores/ProjectStore.tsx`<br>`src/app/admin/page.tsx` | **Sistem Pengelolaan CV/Resume & SSR Hero**: Mengganti action statis `window.print()` di Hero dengan link unduh dinamis dari Firebase Storage. Menambahkan tab manajemen "CV / Resume" di dashboard `/admin` dengan validasi ketat (PDF only, max 5MB), metadata `Content-Disposition: attachment` untuk download murni, urutan upload fail-safe (upload baru berhasil sebelum membersihkan berkas lama), Server Action on-demand revalidation (`revalidatePath('/')`), penghapusan bypass leak pada `storage.rules`, pemetaan `storage` di `firebase.json`, dan SSR profile hydration di homepage `/` dengan auto-hide tombol saat data CV kosong. |
| **2026-08-27** | `src/app/admin/page.tsx`<br>`src/components/sections/Hero.tsx`<br>`public/manifest.json`<br>`cors.json` *(baru)* | **Dukungan Tautan Langsung CV (Dual-Method CV Management)**: Menambahkan mode input Tautan Langsung (Google Drive, Dropbox, Notion, Cloud URL) di tab CV dashboard admin sebagai alternatif instan upload biner Storage, membersihkan berkas lama saat berganti metode, on-demand ISR revalidation homepage, penanganan atribut link di `Hero.tsx` (`target="_blank"` & `rel="noopener noreferrer"` untuk link web eksternal, `download` untuk berkas PDF/Storage), penambahan spesifikasi icon purpose pada `manifest.json`, dan berkas `cors.json`. |
| **2026-08-27** | `src/app/experience/page.tsx`<br>`src/app/contact/page.tsx`<br>`src/app/certificates/page.tsx`<br>`src/app/projects/page.tsx`<br>`src/app/certificates/layout.tsx` | **Optimasi SEO & AI Discovery Semua Halaman Dedicated**: Menambahkan metadata SEO lengkap (title, description, keywords, canonical, OG image+locale+siteName, Twitter card summary_large_image, geo.region ID-JB, geo.placename Bogor) ke semua halaman `/experience`, `/contact`, `/certificates`, `/projects`. Meng-inject JSON-LD Schema.org server-side per halaman: `ProfilePage`+`ItemList`→`OrganizationRole` untuk experience, `ContactPage`+`Person`+`ContactPoint` untuk contact, `ItemList`→`EducationalOccupationalCredential` untuk certificates, `CollectionPage`→`ItemList`→`SoftwareApplication` untuk projects. Metadata duplikat di `certificates/layout.tsx` dihapus (sudah dipindah ke page.tsx yang lebih lengkap). |




