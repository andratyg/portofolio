# 🎨 PORTFOLIO REDESIGN — AI INSTRUCTION DOCUMENT
**Untuk: Nara Andra Tyaga Portfolio**
**Tech Stack: Next.js 15 App Router + TypeScript + Tailwind CSS + Framer Motion + Firebase**

---

## 🧭 RINGKASAN MISI

Kamu mendapat tugas untuk **mendesain ulang secara total** portofolio milik Nara Andra Tyaga. Portofolio ini sudah berjalan di production dengan data real dari Firestore, SEO yang sudah dioptimasi, dan performa Core Web Vitals yang sudah di-tune. **Tugasmu adalah mengubah tampilan visual sepenuhnya** — dari layout, tipografi, warna, spacing, animasi, hingga nuansa keseluruhan — **tanpa menyentuh logika data, sistem terjemahan, dan optimasi performa yang sudah ada**.

Desain saat ini terlihat "AI slop": terlalu generik, kurang karakter, card-nya biasa, section-nya monoton, dan animasinya klise. Kamu harus menciptakan sesuatu yang terasa **buatan tangan oleh desainer kelas dunia** — bukan sesuatu yang terlihat seperti hasil prompt template ChatGPT.

---

## ⛔ BATASAN KERAS — JANGAN PERNAH UBAH INI

### 1. Arsitektur & Performa
- **JANGAN** menghapus atau mengubah pola `getDocs`/`getDoc` one-time fetch dengan in-memory cache di `ProjectStore.tsx`. Ini menjaga bfcache tetap aktif dan mengeliminasi WebChannel Firebase.
- **JANGAN** mengubah pola `dynamic import` untuk Firebase Auth. Firebase Auth hanya boleh di-load di rute `/admin`.
- **JANGAN** menghapus atribut `loading="lazy"` dari gambar below-the-fold (`<Image />`).
- **JANGAN** menghapus prop `sizes` dan `quality={75}` pada komponen `<Image />`.
- **JANGAN** mengubah pola Server Component (ISR) di halaman `/projects`, `/certificates`, `/experience`, `/contact`, `/about`. Halaman-halaman ini menggunakan `export const revalidate = 300` dan menerima `initialXxx` props dari server.
- **JANGAN** memindahkan atau menghapus endpoint `/api/public-data`. Endpoint ini adalah single REST fetch yang menggantikan seluruh Firestore WebChannel di sisi klien publik.
- **JANGAN** mengubah `ScrollProgressButton.tsx` sehingga membaca `scrollHeight` di luar `requestAnimationFrame`.
- **JANGAN** mengubah timeout SSR di `getFeaturedProject` (sudah di-set 800ms agar tidak memblokir HTML shell).

### 2. Sistem Terjemahan
- **JANGAN** menghapus atau mengganti `useLanguage()` hook dan `LanguageContext`.
- Setiap teks yang terlihat oleh pengguna **wajib** diambil dari `t.xxx` (translation key) atau dari field bilingual (`xxxId`/`xxxEn`) dari store/profile data.
- Jangan hardcode teks dalam bahasa apapun langsung di JSX.

### 3. Sistem Tema
- Portofolio memiliki multi-tema dengan CSS custom properties di `globals.css`:
  - **Standard**: `light`, `dark`
  - **Modern**: `catppuccin` (Cappuccino Mocha), `sunset` (Sunset Beach), `liquid` (Liquid Glass Apple)
  - **Seasonal**: `ramadan`, `imlek`, `natal`
- **JANGAN** menghapus tema manapun dari `ThemeContext.tsx`.
- Setiap warna di komponen **wajib** menggunakan CSS variable (`bg-background`, `text-foreground`, `bg-primary`, `text-primary`, `bg-card`, `border-border`, `bg-muted`, dll.) bukan hardcode hex/rgb.
- Glassmorphism di komponen harus menggunakan variabel `--glass-bg`, `--glass-border`, `--glass-blur`.

### 4. Data Types
- Jangan ubah interface TypeScript di `src/lib/types.ts`. Semua komponen harus tetap kompatibel dengan tipe `Project`, `Certificate`, `Experience`, `Testimonial`, `ProfileData`.

### 5. Rute & Navigasi
- Pertahankan semua rute yang ada: `/`, `/about`, `/projects`, `/projects/[slug]`, `/blog`, `/blog/[slug]`, `/experience`, `/contact`, `/certificates`, `/l/[slug]`.
- Navbar harus tetap memiliki scroll-spy, hide-on-scroll-down behavior, dan navigasi smart (smooth scroll jika di homepage, navigate ke dedicated route jika di halaman lain).

---

## 🎨 PANDUAN DESAIN PER KOMPONEN

### GLOBALS & DESIGN SYSTEM

Sebelum menyentuh komponen apapun, definisikan **design system** di `globals.css` yang akan menjadi fondasi. Design system ini harus mencakup:

**Tipografi**: Ganti font heading ke sesuatu yang memiliki karakter kuat. Pertimbangkan kombinasi seperti font display yang bold dengan weight ekstrem (800-900) untuk heading, dan font geometric sans-serif yang bersih untuk body text. Gunakan Google Fonts dengan `next/font`. Size scale harus dramatis — heading utama di homepage bisa mencapai `clamp(3rem, 8vw, 7rem)` agar terasa impactful, bukan 2xl biasa.

**Spacing**: Kurangi padding yang berlebihan di section — gunakan ritme vertikal yang konsisten. Tiap section harus "bernapas" dengan baik, tidak terlalu rapat atau terlalu longgar.

**Warna**: Jangan tambah warna baru. Gunakan CSS variables yang sudah ada. Yang perlu diubah adalah **cara penggunaannya** — lebih bold, lebih kontrastif, lebih berani dalam kombinasi.

**Border Radius**: Pilih satu filosofi dan konsisten. Bisa full-rounded (pill) untuk badge/button kecil, medium (12-16px) untuk card, dan sharp (0-4px) untuk elemen editorial. Jangan campur acak.

**Shadow**: Gunakan shadow yang lebih expressive. Untuk dark theme, shadow berwarna (`shadow-primary/20`) lebih premium daripada shadow hitam biasa. Untuk light theme, shadow lembut dengan opacity rendah.

---

### NAVBAR

Navbar saat ini terlalu standar. Redesain menjadi lebih distinctive:

Pertimbangkan navbar dengan **frosted glass blur** yang kuat di semua tema — `backdrop-blur-xl` dengan background semi-transparent. Tinggi navbar dikurangi agar terasa sleek (56px di desktop, bukan 64px+). Logo di kiri harus berkarakter — bisa berupa inisial dengan monogram typography yang bold, bukan hanya teks biasa. Nav links di desktop tidak perlu underline yang bergerak — cukup dengan perubahan warna + font-weight yang subtle dan elegant. Theme switcher harus tetap ada tapi dibuat lebih compact — gunakan icon-only button dengan tooltip, jangan dropdown besar. Language switcher dan theme switcher dikelompokkan ke sisi kanan dengan pemisah visual (divider). Mobile menu harus full-screen overlay dengan animasi yang dramatis (slide dari atas atau fade), bukan hamburger drawer biasa.

---

### HERO SECTION

Hero adalah kesan pertama — ini yang paling krusial. Desain saat ini terlalu generik dengan dua kolom foto+teks.

**Layout**: Pertimbangkan untuk memecah dari layout 2-kolom standar. Alternatif yang lebih impactful: layout dengan nama besar yang mengisi hampir seluruh lebar layar (editorial style), dengan foto sebagai elemen floating atau background yang subtle. Atau: foto di center dengan teks mengililinginya secara kreatif. Atau: layout asimetris di mana teks mendapat 65% width dan foto 35% di sisi kanan.

**Tipografi Hero**: Nama "Nara Andra Tyaga" harus tampil dengan font yang sangat besar dan bold. Pertimbangkan text dengan `background-clip: text` + gradient dari primary ke accent sebagai efek warna judul. Role/typewriter text harus memiliki visual yang berbeda dari nama — bisa lebih kecil, monospace, atau dengan prefix simbol seperti `>_` (terminal feel).

**Latar Belakang**: Jangan hanya warna solid. Gunakan elemen dekoratif yang sudah dimiliki sistem (particle canvas sudah ada). Tambahkan geometric shapes atau noise texture yang subtle. Untuk dark theme, grid lines tipis (seperti graph paper) dengan opacity 3-5% memberikan kedalaman tanpa mengganggu. Gradient radial yang besar di belakang judul bisa memberikan "aura" yang dramatik.

**CTA Buttons**: Dua CTA button (lihat proyek + download CV) harus memiliki desain yang berbeda dari button generik. Primary button bisa berupa pill shape yang besar dengan icon yang muncul saat hover. Secondary button bisa berupa outlined dengan border gradient.

**Scroll Indicator**: Tambahkan animated scroll indicator di bagian bawah hero — bisa berupa chevron bouncing atau dot yang bergerak ke bawah.

---

### ABOUT SECTION

Saat ini sangat basic: foto di kiri, teks di kanan.

**Redesain**: Ubah layout menjadi lebih editorial. Pertimbangkan: foto dengan frame yang tidak konvensional — bisa menggunakan `clip-path` polygon yang custom, atau frame dengan border animated gradient. Teks about bisa dipecah menjadi blok-blok kecil dengan typography hierarchy yang jelas — nama sebagai H2 besar, role sebagai overline text, dan bio text dengan leading yang nyaman. Tambahkan "fun facts" atau stat mini (3-4 angka penting) dalam grid kecil di bawah bio. Hindari section yang terlalu symmetric — sedikit "off-balance" terasa lebih manusiawi dan desainer.

---

### TECH STACK SECTION

Jangan tampilkan ikon tech sebagai grid biasa.

**Redesain**: Gunakan layout yang lebih organik — marquee/ticker tape yang smooth (bukan carousel dengan tombol next/prev biasa), atau grid dengan ukuran card yang bervariasi (featured tech lebih besar). Setiap tech card harus memiliki hover state yang satisfying — bisa lift + glow sesuai warna brand teknologi tersebut (React biru, Laravel merah, Firebase oranye, dll). Pertimbangkan grouping berdasarkan kategori (Frontend, Backend, Tools) dengan header kategori yang subtle.

---

### PORTFOLIO/PROJECTS SECTION

Card proyek saat ini terlalu template. Ini harus menjadi showcase utama.

**Layout Card**: Jangan card persegi panjang biasa. Pertimbangkan: card dengan aspect ratio yang lebih cinematic (16:9 untuk gambar), overlay gradient di bawah gambar tempat judul dan badge tech ditampilkan, atau card dengan "peek" design di mana gambar sedikit overflow keluar dari card boundary. Tag teknologi sebagai pill kecil yang colorful di bagian bawah image, bukan di bawah deskripsi.

**Filter**: Filter kategori jangan hanya button biasa. Pertimbangkan slider tabs atau underline tabs yang animated (sliding indicator). Search input harus minimal dan elegant — satu garis bawah atau dengan icon yang subtle.

**Featured Project**: Jika ada project yang `featured: true`, tampilkan dengan layout hero yang berbeda — lebih besar, lebih dramatis, full-width atau 70% width.

**Hover State**: Saat card di-hover, gambar perlahan zoom (sudah ada — pertahankan), dan overlay dengan info singkat muncul dengan smooth transition.

---

### CERTIFICATES SECTION

Sertifikat saat ini ditampilkan seperti card standar.

**Redesain**: Pertimbangkan layout horizontal scroll atau masonry grid. Setiap certificate card harus terasa seperti "dokumen resmi" — bisa menggunakan border ganda (double border), watermark subtle di background card, atau ribbon badge di pojok. Tahun dan issuer harus prominent. Credential link harus ada badge "Verified" yang meyakinkan.

---

### TIMELINE/EXPERIENCE SECTION

Timeline saat ini linear dan membosankan.

**Redesain**: Timeline yang menarik bisa menggunakan: garis vertikal di tengah dengan item alternating kiri-kanan (zig-zag), atau card yang muncul dari sisi layar saat di-scroll (sudah ada `AnimateOnScroll` — gunakan). Setiap item timeline harus memiliki: dot berwarna di garis, year badge yang prominent, company name dalam style berbeda dari jabatan. Pertimbangkan efek "active item" yang highlight entry saat scroll melewatinya.

---

### TESTIMONIALS SECTION

Testimonial saat ini terlalu basic.

**Redesain**: Gunakan carousel yang larger-than-life. Quote mark besar sebagai dekoratif di background card. Avatar bundar dengan ring gradient. Nama dan role dengan typography yang jelas. Rating stars jika ada. Card testimonial harus memiliki glassmorphism yang intens sesuai tema.

---

### CONTACT SECTION

Form kontak yang premium.

**Redesain**: Pertimbangkan layout split — di sisi kiri adalah info kontak (email, WhatsApp, LinkedIn, GitHub, TikTok, Instagram) dalam format yang stylish (bukan list plain), di sisi kanan adalah form. Setiap social link harus memiliki branded icon dengan warna aslinya saat hover. Form input harus memiliki floating label style (label bergerak ke atas saat focused), bukan label statis di atas. Submit button harus memiliki loading state yang bagus — spinner atau progress animation. Setelah submit, tampilkan success state yang satisfying.

---

### BLOG SECTION & DETAIL

**List Blog**: Card artikel dengan thumbnail di atas, kategori tag berwarna, judul bold, excerpt singkat, estimasi waktu baca, dan tanggal. Layout bisa 3-kolom di desktop, 2-kolom di tablet, 1-kolom di mobile.

**Detail Artikel**: Typography yang nyaman untuk membaca jangka panjang — `prose` class yang disesuaikan. Reading progress bar yang sudah ada harus tetap dipertahankan. Table of contents untuk artikel panjang. Code blocks dengan syntax highlighting yang kontrastif.

---

### 404 & ERROR PAGES

Sudah memiliki tema Cyberpunk — pertahankan dan perkuat estetikanya. Jangan ubah menjadi halaman error yang generik.

---

### COMMAND PALETTE (Ctrl+K)

Sudah ada dan berfungsi. Redesain visual saja: modal lebih besar, animasi muncul lebih dramatis (scale dari 0.95 ke 1.0 + fade), input lebih prominent, hasil pencarian dengan icon dan shortcut key visible di kanan.

---

## 🎨 PANDUAN DESAIN PER TEMA

Setiap tema harus memiliki "jiwa" visualnya sendiri — bukan hanya ganti warna.

### Theme: `light`
**Jiwa**: Profesional, bersih, premium editorial. Seperti portofolio agensi desain kelas atas.  
Gunakan whitespace yang sangat lega. Typography besar dan bold. Shadow lembut. Accent color (biru) hanya untuk elemen interaktif, bukan untuk dekorasi berlebihan. Background card putih bersih dengan shadow `0 1px 3px rgba(0,0,0,0.05)`. Border sangat tipis dan subtle.

### Theme: `dark`
**Jiwa**: Deep space, premium tech, elegant slate.  
Background hampir hitam (`hsl(220 15% 6%)`). Gradient radial biru di belakang hero (sudah ada — perkuat intensitasnya). Card dengan background slate yang sedikit lebih terang. Glow effect di elemen utama menggunakan warna primary/blue. Particle canvas aktif penuh. Text sedikit lebih terang dari pure white agar tidak terlalu harsh.

### Theme: `catppuccin` (Cappuccino Mocha)
**Jiwa**: Artisan coffee shop, warm, cozy, analog.  
Background ivory/parchment yang hangat. Seluruh elemen harus terasa "handcrafted". Gunakan border yang sedikit lebih tebal dan warm. Bayangan berwarna caramel/mocha. Font heading bisa mendapat sedikit `letter-spacing` untuk kesan clasik. Icon dan ilustrasi bisa diberi tone sepia yang subtle.

### Theme: `sunset`
**Jiwa**: Pantai, golden hour, energi, optimisme.  
Background biru langit yang cerah. Gradient dari biru langit ke oranye sunset di area hero. Gunakan banyak white card dengan shadow berwarna sunset. Elemen decorative bisa berupa lingkaran/circle yang overlap seperti gelembung atau matahari. Energi visual harus tinggi — warna-warna cerah dan kontrastif.

### Theme: `liquid` (Liquid Glass)
**Jiwa**: Apple iOS, futuristic, ultra-clean, multi-layer glass.  
Semua card dan panel harus menggunakan glassmorphism yang kuat (`backdrop-blur-3xl`, opacity background rendah). Border `rgba(255,255,255,0.85)` — hampir tidak terlihat tapi ada. Warna primary Apple blue yang ikonik. Tidak ada elemen yang terlalu opaque. Bayangan harus sangat ringan. Kesan seperti menggunakan aplikasi iOS premium.

### Theme: `ramadan`
**Jiwa**: Masjid, malam bintang, khidmat, elegan spiritual.  
Background hijau emerald yang dalam. Aksen emas yang berkilau. Dekorasi bintang dan bulan sabit yang subtle (SVG atau CSS). Pattern geometris islami (arabesque) sebagai texture background yang sangat transparan. Glassmorphism dengan tint emerald.

### Theme: `imlek`
**Jiwa**: Perayaan oriental, kemakmuran, keberanian.  
Background merah yang dalam dan royal. Emas yang prominent dan festive. Pattern tradisional Cina (cloud pattern atau wave pattern) sebagai texture. Card dengan border emas. Elemen dekoratif: lampion (bisa sebagai SVG decoration), pattern naga yang sangat subtle.

### Theme: `natal`
**Jiwa**: Winter, malam Natal, bintang, salju.  
Background biru navy yang dalam seperti langit malam. Primary merah natal yang festive. Accent silver/white seperti salju. Snowflake decoration yang subtle dan beranimasi perlahan (sudah ada `NatalDecorations` — pertahankan dan perkuat).

---

## 🚀 URUTAN PENGERJAAN YANG DISARANKAN

Ikuti urutan ini agar perubahan tidak saling konflik dan bisa di-review secara bertahap:

1. **Definisikan design system** di `globals.css` — typography scale, utility classes custom, dan atmospheric background per tema.
2. **Redesain Navbar** — ini muncul di semua halaman, jadi selesaikan dulu agar konsisten.
3. **Redesain Hero Section** — ini impression pertama.
4. **Redesain About Section**.
5. **Redesain Portfolio/Projects Section & Card**.
6. **Redesain Tech Stack Section**.
7. **Redesain Certificates Section**.
8. **Redesain Timeline/Experience Section**.
9. **Redesain Testimonials Section**.
10. **Redesain Contact Section**.
11. **Redesain Blog List & Detail**.
12. **Redesain Command Palette visual**.
13. **Redesain Footer**.
14. **Polish**: review semua halaman dedicated (`/about`, `/projects`, `/experience`, `/contact`, `/certificates`) dan pastikan konsisten.

---

## 📋 CHECKLIST KUALITAS SEBELUM SELESAI

Setelah selesai redesain, verifikasi hal-hal berikut:

- [ ] Semua warna menggunakan CSS variables, tidak ada hardcode hex/rgb
- [ ] Semua teks menggunakan sistem terjemahan (`t.xxx` atau `xxxId`/`xxxEn`)
- [ ] Tidak ada `import firebase/firestore` baru di komponen publik (hanya via `/api/public-data`)
- [ ] Semua gambar below-fold memiliki `loading="lazy"` dan `sizes` prop
- [ ] Tidak ada `onSnapshot` / real-time listener baru di komponen publik
- [ ] Framer Motion digunakan via `m as motion` (bukan `motion` langsung) untuk tree-shaking
- [ ] Tidak ada layout shift (CLS) yang muncul — elemen dengan height dinamis harus memiliki `min-height` reserved
- [ ] Semua halaman dedicated tetap merupakan Server Component (tidak ada `"use client"` di top level page.tsx yang seharusnya server)
- [ ] Mobile responsiveness di semua breakpoint (360px — 1440px+)
- [ ] TypeScript types tidak ada error (`npm run typecheck`)
- [ ] Tema seasonal (Ramadan, Imlek, Natal) tetap berfungsi dan konsisten visual
- [ ] `ScrollProgressButton` masih menggunakan `requestAnimationFrame` untuk DOM reads

---

## 📁 FILE UTAMA YANG PERLU DIEDIT

```
src/app/globals.css                          ← Design tokens & atmospheric backgrounds
src/components/layout/Navbar.tsx             ← Global navigation
src/components/layout/Footer.tsx             ← Global footer
src/components/sections/Hero.tsx             ← Homepage hero
src/components/sections/About.tsx            ← About section
src/components/sections/Portfolio.tsx        ← Projects grid
src/components/sections/TechStack.tsx        ← Tech icons
src/components/sections/Certificates.tsx     ← Certificates grid
src/components/sections/Timeline.tsx         ← Experience timeline
src/components/sections/Testimonials.tsx     ← Testimonials carousel
src/components/sections/Contact.tsx          ← Contact form & links
src/components/features/CommandPalette.tsx   ← Ctrl+K search modal
src/app/blog/page.tsx                        ← Blog listing (visual layer)
src/app/blog/[slug]/page.tsx                 ← Blog detail (visual layer)
src/components/blog/BlogListClient.tsx       ← Blog list UI
src/components/blog/BlogDetailClient.tsx     ← Blog reader UI
src/app/not-found.tsx                        ← 404 page (sudah cyberpunk, perkuat)
src/app/error.tsx                            ← Error page (sudah cyberpunk, perkuat)
```

**File yang JANGAN diubah:**
```
src/stores/ProjectStore.tsx                  ← Data fetching & cache logic
src/firebase/index.ts                        ← Firebase initialization
src/firebase/provider.tsx                    ← Firebase context (lazy auth)
src/app/api/public-data/route.ts             ← Public data REST endpoint
src/lib/types.ts                             ← TypeScript types
src/lib/server-firebase.ts                   ← Server-side Firestore fetchers
src/components/providers/LanguageContext.tsx ← Translation system
src/components/providers/ThemeContext.tsx    ← Theme system (warna boleh diubah di globals.css, tapi jangan hapus tema)
src/hooks/use-typewriter.ts                  ← Typewriter hook (CLS-safe)
src/components/AnimateOnScroll.tsx           ← Scroll animation (CLS-safe, min-height locked)
```

---

*Dokumen ini dibuat khusus untuk redesign total portofolio Nara Andra Tyaga. Pastikan setiap keputusan desain yang dibuat konsisten di seluruh tema dan tidak merusak sistem yang sudah bekerja dengan baik.*
