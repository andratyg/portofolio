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
