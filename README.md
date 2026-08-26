# Nara Andra Tyaga — Personal Portfolio

Platform portofolio digital pribadi **Nara Andra Tyaga** yang dibangun dengan standar arsitektur modern: SSR/ISR untuk SEO & AI crawler, lazy load Firebase Auth, bfcache-friendly, dan Core Web Vitals score tinggi.

🌐 **Live:** [www.naraandratyaga.my.id](https://www.naraandratyaga.my.id)

---

## 🏛️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Framework** | Next.js 15 (App Router, Server Components, ISR) |
| **Language** | TypeScript (ES2022 target) |
| **Styling** | Tailwind CSS + ShadCN UI + Lucide Icons |
| **Animasi** | Framer Motion (LazyMotion, tree-shaken) |
| **Backend** | Firebase Firestore (Client SDK, no Admin SDK) |
| **Auth** | Firebase Authentication (lazy-loaded, admin-only) |
| **AI** | Google Gemini 2.5 Flash via Genkit (admin features) |
| **Hosting** | Firebase App Hosting / Vercel |
| **Analytics** | Vercel Analytics |

---

## 📄 Halaman & Rute

| Route | Tipe | Data Fetch |
|---|---|---|
| `/` | Server Component + ISR 1h | Featured project via Firestore REST |
| `/projects` | Server Component + ISR 5m | `fetchProjects()` server-side |
| `/certificates` | Server Component + ISR 5m | `fetchCertificates()` server-side |
| `/experience` | Server Component + ISR 5m | `fetchExperiences()` server-side |
| `/contact` | Server Component + ISR 1h | Static (form write-only) |
| `/blog` | Server Component + ISR | Firestore blogs collection |
| `/blog/[slug]` | Dynamic Server Component | Per-slug Firestore fetch |
| `/l/[slug]` | Dynamic Server Component | Short link redirect + analytics |
| `/about` | Static | — |
| `/admin` | Client Component | Real-time Firestore (auth-gated) |

> **SSR Policy:** Semua halaman publik dengan data Firestore menggunakan Server Components + ISR. Data sudah ada di initial HTML — terlihat oleh Googlebot, AI crawlers, dan `curl` tanpa JS.

---

## ✨ Fitur Utama

### 🌐 Publik
- **Bilingual (ID/EN):** Semua konten tersedia dalam Bahasa Indonesia dan English, toggle real-time
- **Multi Theme:** Dark, Light, Ramadan, Imlek, Natal — auto-detect berdasarkan bulan
- **Blog System:** Listing + detail artikel dengan rich typography, code block parser, dan related articles
- **URL Shortener:** `/l/[slug]` — interstitial preview page dengan countdown 3 detik, click analytics tanpa menyimpan IP
- **Search & Filter:** Sertifikat dan proyek bisa dicari/difilter/diurutkan secara real-time

### 🔐 Admin Dashboard (`/admin`)
- **AI Content Studio** (Gemini 2.5 Flash):
  - Auto-terjemahan konten ID ↔ EN
  - Generate deskripsi proyek & sertifikat
  - AI Portfolio Advisor: audit otomatis kelengkapan data + health score
- **Full CRUD:** Proyek, Sertifikat, Pengalaman, Testimonial, Tech Skills, Blog, Short Links
- **Backup/Restore:** Export/Import data JSON
- **Akses:** Email harus terdaftar di koleksi `admins` Firestore dengan `role: "super"`

---

## ⚡ Optimasi Performa (Core Web Vitals)

| Optimasi | Detail |
|---|---|
| **Lazy Firebase Auth** | `getAuth()` hanya diinisialisasi di rute `/admin` — mengeliminasi iframe blocking 3–4 detik di halaman publik |
| **bfcache** | One-time fetch (`getDocs`) + in-memory cache menggantikan `onSnapshot` WebSocket — Back/Forward Cache aktif |
| **SSR/ISR** | Semua halaman publik di-prerender server-side, data sudah ada di HTML awal |
| **Tiered Fetch** | Tier 1 (Profile + Projects) unblock LCP; Tier 2 (below-the-fold) fetch belakangan |
| **Passive Scroll** | `{ passive: true }` pada semua scroll listener |
| **ParticleCanvas** | Dinonaktifkan di mobile untuk hemat daya |
| **Image Optimization** | AVIF/WebP, `deviceSizes` granular, `quality={75}`, `loading="lazy"` below-the-fold |
| **Tree Shaking** | `optimizePackageImports` untuk framer-motion, lucide-react, Radix UI, zustand |
| **CLS = 0** | Typewriter inisialisasi dengan `words[0]`, static underline Navbar, locked `minHeight` AnimateOnScroll |
| **ES2022 Target** | Eliminasi polyfill legacy ~8 KiB |

---

## 🔒 Keamanan

- **CSP (Content Security Policy):** Header ketat dengan `require-trusted-types-for 'script'` di production
- **Trusted Types:** Policy `default`, `nextjs#bundler`, `gapi#gapi`, `goog#html` terdaftar
- **Firestore Rules:** DBAC — publik hanya bisa read, write dibatasi ke authenticated admin
- **Bot Filter:** URL shortener tidak menghitung klik dari crawler/bot ke `clickCount`
- **Honeypot:** Form kontak memiliki field honeypot tersembunyi untuk deteksi bot

---

## 🗺️ Sitemap & SEO

- `sitemap.xml` di-generate otomatis dari Firestore (blog slugs + static routes)
- Schema.org JSON-LD: `Person`, `WebSite`, `BlogPosting`, `SoftwareApplication`, `EducationalOccupationalCredential`
- Meta description + OG tags di semua rute
- Canonical URL di semua halaman
- `robots.txt` statis dengan dukungan AI crawlers

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run dev server (port 9002)
npm run dev

# Build production
npm run build

# TypeScript check
npx tsc --noEmit

# Start production server
npm start
```

### Environment Variables

Tidak perlu `.env` tambahan — Firebase config di-hardcode di `src/firebase/config.ts` dan Firebase App Hosting meng-inject credentials otomatis di production.

---

## 📁 Struktur Folder Penting

```
src/
├── app/                    # Next.js App Router pages
│   ├── (root)/page.tsx     # Homepage (SSR)
│   ├── experience/         # /experience — riwayat karir (SSR + ISR)
│   ├── contact/            # /contact — form kontak (Static)
│   ├── certificates/       # /certificates (SSR + ISR)
│   ├── projects/           # /projects (SSR + ISR)
│   ├── blog/               # /blog + /blog/[slug]
│   ├── l/[slug]/           # URL Shortener redirect
│   └── admin/              # Dashboard admin (auth-gated)
├── components/
│   ├── sections/           # Section components (Hero, Portfolio, Certificates, Timeline, Contact, ...)
│   ├── layout/             # Navbar, Footer
│   └── providers/          # LanguageContext, ThemeContext, MotionProvider
├── stores/
│   └── ProjectStore.tsx    # Zustand-like Context store (client-side, admin + interaktivitas)
├── lib/
│   ├── server-firebase.ts  # Server-side Firestore fetch (SSR/ISR, no Admin SDK)
│   ├── server-shortlinks.ts # Server-side short link fetch + click tracking
│   └── types.ts            # TypeScript interfaces
├── firebase/               # Firebase client SDK initialization (lazy auth)
└── ai/flows/               # Genkit AI flows (admin features)
```

---

## 🤖 AI Agent Guidelines

Lihat [`AGENTS.md`](./AGENTS.md) untuk panduan lengkap agent dan log perubahan historis.

---

*Built with ❤️ by Nara Andra Tyaga — Engineering Digital Impact.*
