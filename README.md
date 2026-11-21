# Monev MagangHub Assistant Agent (Kemnaker)

Aplikasi web modern berbasis **Next.js (App Router)** & **Tailwind CSS** yang bertindak sebagai **AI Assistant Agent** untuk membantu peserta MagangHub Kemnaker RI mempermudah pencatatan presensi dan penyusunan laporan harian (**Uraian Aktivitas**, **Pembelajaran yang Diperoleh**, dan **Kendala yang Dialami**) secara otomatis dan cerdas sesuai standar resmi Kemnaker.

---

## Fitur Utama

1. **AI Assistant Agent untuk Penyusunan Laporan:**
   - Membantu peserta menyusun 3 poin wajib laporan harian (**Uraian Aktivitas**, **Pembelajaran yang Diperoleh**, dan **Kendala yang Dialami**) secara otomatis dari catatan kegiatan singkat.
   - Menjamin setiap bagian memenuhi syarat batas **minimal 100 karakter** dengan tata bahasa Indonesia formal, natural, dan saling terhubung.
   - Dilengkapi opsi cerdas **"Tidak ada kendala hari ini"** untuk menyusun narasi kendala realistis dan santun saat pekerjaan berlangsung lancar.

2. **Otentikasi & Manajemen Sesi:**
   - Masuk menggunakan Bearer Token MagangHub resmi.
   - Panduan 1-klik untuk mengambil token dari Console browser tanpa kesulitan.
   - Fitur **Perpanjang Masa Aktif Token (Auto-Refresh)** langsung ke endpoint resmi `POST /api/v1/auth/refresh`.

3. **Formulir Presensi & Laporan Terintegrasi:**
   - Mendukung pilihan kehadiran: **Hadir (`PRESENT`)**, **Izin/Sakit (`ON_LEAVE`)**, dan **Alfa (`ABSENT`)**.
   - **Deteksi Hari Libur Otomatis:** Terhubung langsung dengan API Kemnaker untuk mengenali hari libur nasional, cuti bersama, dan jadwal libur posisi magang (mencegah salah lapor saat libur).
   - **Geolokasi Presensi (GPS):** Deteksi koordinat latitude & longitude otomatis via browser atau pemilih lokasi tersimpan.
   - Live counter karakter dengan progress bar untuk memastikan batas minimal 100 karakter terpenuhi.

4. **Navigasi Modern & Antarmuka Responsif:**
   - **Desktop / Tablet:** Floating Navbar Capsule di bagian atas layar dengan menu navigasi, status peserta, serta tombol aksi cepat (Refresh & Keluar).
   - **Mobile:** Floating Navbottom Capsule di bagian bawah layar untuk kenyamanan navigasi satu tangan.
   - Transisi perpindahan menu ultra-smooth bebas kedip (*layout shift free*).

5. **Riwayat Kehadiran & Modal Detail:**
   - Rekapitulasi absensi harian langsung dari server Kemnaker.
   - Grid kartu responsif (5 kolom di desktop, 3 di tablet, 2 di mobile).
   - Modal popup interaktif untuk melihat detail lengkap laporan dan catatan mentor.
   - **Fitur Revisi Terintegrasi:** Jika mentor meminta perbaikan uraian laporan (`NEEDS_REVISION`), peserta dapat mengedit dan mengirimkan revisi langsung melalui modal khusus (`PUT /daily-logs/:id`).

6. **Next.js API Proxy (Bebas Masalah CORS):**
   - Semua panggilan ke `https://monev-api.maganghub.kemnaker.go.id/api/v1` diarahkan melalui route handler server internal Next.js (`/api/monev/...`), sehingga browser tidak akan terkena pembatasan CORS.

---

## Cara Menjalankan

Masuk ke direktori projek di terminal:

```bash
cd D:\monev-maganghub
npm run dev
```

Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## Struktur Folder

```text
D:\monev-maganghub\
├── app\
│   ├── api\
│   │   └── monev\
│   │       ├── attendances\route.ts    # Proxy POST /attendances/with-daily-log & GET /attendances
│   │       ├── auth\route.ts           # Proxy POST /auth/refresh & GET /auth/login
│   │       ├── daily-logs\[id]\route.ts# Proxy PUT /daily-logs/:id (Revisi)
│   │       └── user\route.ts           # Proxy GET /users/me
│   ├── layout.tsx
│   └── page.tsx                        # Dashboard & Manajemen Tab
├── components\
│   ├── Navbar.tsx                      # Header & Profil Peserta
│   ├── LoginCard.tsx                   # Form Login & Panduan Token
│   ├── ReportForm.tsx                  # Form Laporan Harian (Uraian, Pembelajaran, Kendala)
│   └── AttendanceHistory.tsx           # Riwayat Absensi & Modal Revisi
├── lib\
│   └── monev.ts                        # Template aktivitas, utility tanggal, & konstanta
└── types\
    └── monev.ts                        # Definisi tipe data TypeScript
```
