# KaryaPro | Professional Portfolio "OP" Edition

KaryaPro adalah website portofolio profesional kelas atas yang dibangun dengan teknologi modern dan fitur kecerdasan buatan (AI) standar industri.

## 🚀 Fitur Utama
- **Real-time Database:** Menggunakan Firebase Firestore untuk sinkronisasi data instan di seluruh dunia.
- **AI-Powered (Genkit AI):** 
  - **Smart Auto-Translate:** Fitur terjemahan otomatis (ID ↔ EN) di setiap formulir admin menggunakan Google Gemini.
  - **AI Suggestions:** Saran deskripsi kreatif untuk proyek dan sertifikat secara otomatis.
- **Smart Navigation:** Navbar dan Admin Tabs dengan sistem *auto-hide* berbasis arah scroll untuk ruang pandang maksimal.
- **Multi-Language:** Dukungan penuh untuk Bahasa Indonesia dan Inggris (Bilingual).
- **Multi-Theme (10+ Themes):** Termasuk tema khusus **Ramadan** (Emerald/Gold) dan **Lunar** (Red/Gold).
- **Export to PDF:** Fitur satu klik untuk mengubah portofolio menjadi format CV profesional yang bersih dan siap dikirim ke HR/Klien.
- **Performance Optimized:** Penggunaan format gambar WebP, lazy loading, dan pengurangan beban visual pada perangkat mobile.

## 🎨 Desain & Gaya ("OP" Style)
- **Typography:** Tipografi raksasa menggunakan font *Space Grotesk* untuk kesan berani dan modern.
- **Visuals:** Efek Aura Background, Card Glow, dan Glassmorphism 2.0 yang memberikan kesan premium.
- **Accessibility:** Mendukung navigasi keyboard, kontras warna tinggi, dan ARIA attributes lengkap.
- **SEO Ready:** Markup Schema.org (Person & Portfolio) untuk meningkatkan discoverability di Google.

## 🔐 Akses Admin
Halaman Admin dapat diakses melalui `/admin/login`. 

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
4. **Selesai:** Sekarang akun tersebut memiliki izin penuh untuk menulis ke database.

## 🛠 Tech Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript.
- **Styling:** Tailwind CSS, ShadCN UI, Lucide Icons.
- **Backend:** Firebase Firestore (Database) & Firebase Authentication (Security).
- **GenAI:** Google Gemini via Genkit AI.

---
*Dibuat dengan dedikasi untuk profesionalitas tingkat tinggi dan personal branding yang tak terlupakan.*
