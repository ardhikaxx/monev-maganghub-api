export const MONEV_API_BASE_URL = 'https://monev-api.maganghub.kemnaker.go.id/api/v1';
export const DEFAULT_FRONTEND_BUILD_ID = '5f0bba0a4407afb1f65eacbf1306c9c072b5bac9-production';

export interface ActivityTemplate {
  title: string;
  category: string;
  activity_log: string;
  lesson_learned: string;
  obstacles: string;
}

export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  {
    title: 'Pengembangan Fitur & Integrasi API (Software Engineering)',
    category: 'Teknologi Informasi',
    activity_log: 'Melakukan analisis kebutuhan modul antarmuka pengguna, merancang skema komponen frontend, serta mengimplementasikan integrasi REST API backend untuk proses pengambilan data secara dinamis dan real-time.',
    lesson_learned: 'Memahami tata cara penanganan asynchronous data fetching, implementasi caching state management, serta standarisasi validasi skema input untuk meminimalisir potensi kegagalan koneksi data pada aplikasi.',
    obstacles: 'Terdapat kendala perbedaan spesifikasi response payload antara lingkungan staging dan production yang sempat memicu parsing error, namun telah diselesaikan dengan penyesuaian fallback model.'
  },
  {
    title: 'Perbaikan Bug & Refactoring Kode (Quality & Maintenance)',
    category: 'Teknologi Informasi',
    activity_log: 'Menganalisis laporan error log dari sistem pengujian, melakukan debugging pada alur otentikasi sesi pengguna, dan merefaktor struktur query data agar waktu respons sistem menjadi lebih cepat dan efisien.',
    lesson_learned: 'Memahami teknik profiling performa aplikasi, penanganan memory leak pada proses loop yang berulang, serta pentingnya penulisan unit testing komprehensif guna mencegah regresi fungsi perangkat lunak.',
    obstacles: 'Kesulitan dalam mereproduksi bug intermittent yang hanya muncul pada kondisi jaringan lambat, diselesaikan dengan menambahkan mock network throttling pada sesi pengujian lokal.'
  },
  {
    title: 'Riset Desain UI/UX & Pembuatan Prototype (Design)',
    category: 'Desain & Kreatif',
    activity_log: 'Melakukan riset referensi antarmuka pengguna pada sistem informasi manajemen, merancang wireframe low-fidelity dan high-fidelity prototype, serta menyusun komponen design token yang reusable dan responsif.',
    lesson_learned: 'Mendapatkan pemahaman mendalam tentang prinsip hierarki visual, kontras warna aksesibilitas WCAG, serta pemetaan alur interaksi pengguna (user journey) yang intuitif untuk mengurangi cognitive load.',
    obstacles: 'Menyesuaikan batasan teknis styling pada framework frontend dengan estetika mockup awal, yang diatasi melalui koordinasi berkala bersama tim developer teknis.'
  },
  {
    title: 'Pengolahan Data & Penyusunan Laporan Administrasi',
    category: 'Administrasi & Operasional',
    activity_log: 'Mengumpulkan rekapan data operasional mingguan, melakukan validasi dan pembersihan entri data yang duplikat, serta menyusun laporan ringkasan berkala dalam format spreadsheet untuk ditinjau oleh mentor.',
    lesson_learned: 'Mempelajari pemanfaatan formula analisis data tingkat lanjut, verifikasi keabsahan data administrasi perusahaan, serta standarisasi dokumentasi arsip digital yang rapi dan mudah ditelusuri.',
    obstacles: 'Beberapa dokumen lampiran dari departemen terkait terlambat diserahkan sehingga proses rekapitulasi data sempat tertunda, namun diselesaikan dengan tindak lanjut proaktif.'
  }
];

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function parseJwt(token: string): { exp?: number; [key: string]: any } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
