# KaryaPro | Professional Portfolio "OP" Enterprise Edition

KaryaPro adalah platform branding digital kelas dunia yang dirancang untuk pengembang profesional. Versi ini (v2.5.0) mengusung standar arsitektur perusahaan dengan fokus pada narasi teknis (Case Studies), ketahanan sistem, dan keamanan tingkat tinggi.

## 🏛️ Arsitektur & Teknologi (Tech Stack)
- **Framework:** Next.js 15 (App Router) - Optimasi performa dan SEO.
- **State Management:** Layered Context-Store - Pemisahan logika bisnis dari UI.
- **Backend-as-a-Service:** Firebase (Firestore, Auth, App Hosting).
- **Intelligence:** Google Gemini 2.0 via Genkit - Auto-localization & content generation.
- **UI System:** ShadCN UI + Tailwind CSS + Lucide Icons.

## 💎 Fitur Unggulan Enterprise
- **Case Study Narrative:** Setiap proyek bukan sekadar gambar, melainkan dokumentasi masalah, solusi, dan dampak nyata.
- **Recruiter Experience:** 
  - **Recruiter Quick Mode:** Akses cepat ke CV/PDF tanpa animasi berat.
  - **Verified Impact Stats:** Menampilkan metrik nyata (performa, user base).
- **Advanced Admin Dashboard:**
  - **Smart AI Localization:** Terjemahan konten ID ↔ EN otomatis dengan satu klik.
  - **Global System Maintenance:** Fitur Ekspor/Impor data (JSON) untuk mitigasi bencana data.
  - **Role-Based Access Control (RBAC):** Perbedaan hak akses antara `super` admin (Full CRUD) dan `editor` (Read/Write).
- **Ketahanan Sistem (Resilience):**
  - **Skeleton Shimmer Loading:** Pengalaman pemuatan yang halus dan modern.
  - **Network-Aware UI:** Indikator status koneksi internet dan handling offline.
  - **Security Rules Berstandar:** Aturan Firestore yang ketat (DBAC) mencegah akses ilegal.

## 🎨 Estetika Visual ("OP" Style)
- **Giant Bold Typography:** Font *Space Grotesk* dengan ukuran ekstrem untuk kesan confident.
- **Glassmorphism 2.0:** Detail UI transparan dengan blur mendalam (Aura & Glow).
- **Seasonal Themes:** Mendukung tema Ramadan, Lunar (Imlek), Cyber, dan 7 tema lainnya secara instan.

## 🔐 Keamanan & Deployment
Akses admin dibatasi secara ketat melalui Firebase Authentication. 
**PENTING:** Untuk akses Admin, email harus terdaftar di koleksi `admins` Firestore dengan field `role: "super"`.

## 🛠️ Pengembangan & Debugging
- **Structured Logging:** Log sistem tercatat untuk mempermudah tracking error.
- **Optimasi Mobile:** Filter visual dan blur aura disesuaikan secara otomatis pada perangkat mobile untuk menjaga FPS.

---
*KaryaPro - Elevating Digital Identity with Technical Integrity.*
