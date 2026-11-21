# Monev MagangHub Assistant Agent (Kemnaker)

Aplikasi web modern berbasis **Next.js (App Router)** & **Tailwind CSS** untuk membantu peserta magang MagangHub Kemnaker RI dalam mencatat presensi, menyusun laporan aktivitas harian dengan standar validasi minimal 100 karakter, memantau riwayat evaluasi mentor, serta memperbarui token sesi secara otomatis.

---

## Fitur Utama

1. **Otentikasi & Manajemen Sesi:**
   - Masuk menggunakan Bearer Token MagangHub resmi.
   - Panduan 1-klik untuk mengambil token dari Console browser tanpa kesulitan.
   - Fitur **Perpanjang Masa Aktif Token (Auto-Refresh)** langsung ke endpoint resmi `POST /api/v1/auth/refresh`.

2. **Formulir Tambah Laporan Harian:**
   - Mendukung pilihan kehadiran: **Hadir (`PRESENT`)**, **Izin/Sakit (`ON_LEAVE`)**, dan **Alfa (`ABSENT`)**.
   - **Validasi Ketat Realtime:**
     - Live counter karakter untuk 3 input utama: **Uraian Aktivitas**, **Pembelajaran yang Diperoleh**, dan **Kendala yang Dialami**.
     - Indikator visual progress bar menuju batas **minimal 100 karakter**.
   - **Template Cepat Otomatis:** Pilihan template relevan (>100 karakter) untuk IT/Software Engineering, Maintenance & Bugfix, UI/UX Design, dan Administrasi.
   - **Geolokasi Presensi (GPS):** Deteksi koordinat latitude & longitude otomatis via browser.
   - Checkbox pernyataan integritas sebelum pengiriman laporan.

3. **Riwayat Kehadiran & Revisi Laporan:**
   - Rekapitulasi absensi harian langsung dari server Kemnaker.
   - Status badge persetujuan: *Disetujui Mentor*, *Menunggu Peninjauan*, atau *Perlu Perbaikan*.
   - **Fitur Revisi Terintegrasi:** Jika mentor meminta perbaikan uraian laporan (`NEEDS_REVISION`), peserta dapat mengedit dan mengirimkan revisi langsung melalui modal khusus (`PUT /daily-logs/:id`).

4. **Next.js API Proxy (Bebas Masalah CORS):**
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
