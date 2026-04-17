# KaryaPro | Professional Portfolio "OP" Edition

KaryaPro adalah website portofolio profesional kelas atas yang dibangun dengan teknologi modern dan fitur kecerdasan buatan (AI) standar industri. Website ini dirancang untuk memberikan kesan "Premium & High-Authority" bagi pengembang profesional.

## 🎨 Gaya Visual & Estetika ("OP" Style)
Website ini mengusung estetika **Modern-Cyber-Premium** dengan detail:
- **Typography Raksasa:** Menggunakan font *Space Grotesk* dengan ukuran ekstrem (hingga 9xl) pada bagian portofolio untuk kesan berani dan percaya diri.
- **Visuals Premium:** Efek **Aura Background**, **Card Glow**, dan **Glassmorphism 2.0** yang memberikan kedalaman visual mewah.
- **Smart Navigation:** Navbar dan Admin Tabs dengan sistem *auto-hide* berbasis arah scroll untuk memberikan ruang pandang maksimal bagi pengunjung.
- **Multi-Theme (10+ Themes):** Mendukung pergantian tema instan, termasuk tema khusus **Ramadan** (Emerald/Gold) dan **Lunar/Imlek** (Red/Gold).

## 🚀 Fitur Utama
- **Real-time Database:** Menggunakan Firebase Firestore untuk sinkronisasi data instan di seluruh dunia tanpa perlu refresh halaman.
- **AI-Powered (Genkit AI):** 
  - **Smart Auto-Translate:** Fitur terjemahan otomatis (ID ↔ EN) di setiap formulir admin menggunakan Google Gemini.
  - **AI Suggestions:** Menghasilkan saran deskripsi kreatif dan profesional untuk proyek dan sertifikat secara otomatis.
- **Export to PDF (CV Mode):** Fitur satu klik untuk mengubah portofolio menjadi format CV profesional yang bersih dan siap dikirim ke HR/Klien.
- **Multi-Language:** Dukungan penuh untuk Bahasa Indonesia dan Inggris (Bilingual).

## 💼 Fitur Karir & Profesional
- **SEO Ready:** Markup Schema.org (Person & Portfolio) dan Meta OG Tags lengkap untuk meningkatkan discoverability di Google.
- **Accessibility (A11y):** Mendukung navigasi keyboard, kontras warna tinggi, dan ARIA attributes lengkap untuk pembaca layar.
- **Performance Optimized:** Penggunaan format gambar WebP, lazy loading, dan optimasi beban visual pada perangkat mobile untuk kecepatan maksimal.
- **Analytics & Tracking:** Terintegrasi untuk memantau trafik pengunjung dan interaksi pada setiap proyek.

## 🔐 Akses Admin & Keamanan
Halaman Admin dapat diakses melalui `/admin/login` dan diamankan dengan Firebase Authentication.

### 🛠 Langkah Setup Akun Admin (Wajib):
Agar email Anda bisa mengelola konten, silakan ikuti langkah ini di Firebase Console:
1. **Authentication:** Tambahkan user baru dengan email & password berikut:
   - `indraandra545@gmail.com` (Password: `indra2605`)
   - `naraandratyaga@smkwikrama.sc.id` (Password: `indra2605`)
2. **Salin UID:** Setelah user dibuat, salin **User UID** milik mereka.
3. **Firestore Database:** 
   - Buat koleksi baru bernama `admins`.
   - Tambahkan dokumen baru. Gunakan **User UID** tersebut sebagai **Document ID**. 
   - Anda bisa membiarkan isi dokumennya kosong `{}`.
4. **Selesai:** Sekarang akun tersebut memiliki izin penuh untuk mengelola konten via Cloud.

## 🛠 Tech Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript.
- **Styling:** Tailwind CSS, ShadCN UI, Lucide Icons.
- **Backend:** Firebase Firestore (Database) & Firebase Authentication (Security).
- **GenAI:** Google Gemini via Genkit AI.

---
*Dibuat dengan dedikasi untuk profesionalitas tingkat tinggi dan personal branding yang tak terlupakan.*
