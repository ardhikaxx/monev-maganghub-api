import { NextRequest, NextResponse } from 'next/server';

interface GenerateRequest {
  prompt: string;
  no_obstacles: boolean;
  custom_obstacle?: string;
  role?: string;
  company?: string;
}

// API Key permanen di server (jika pengguna memiliki API key resmi Gemini)
const EMBEDDED_GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  Buffer.from('QVEuQWI4Uk42SlhyeUFjcjZPVUFyaTNadTNBdEVlejFGb0h6RFZVMTNKRjhhRFNpaHpnLVE=', 'base64').toString('utf-8');

/**
 * Merapikan input kegiatan agar masuk ke dalam kalimat secara luwes dan santai.
 */
function cleanUserText(raw: string): { full: string; noun: string } {
  let cleaned = raw.trim().replace(/[.,;!]+$/, '');
  if (!cleaned) return { full: 'tugas magang', noun: 'tugas magang' };

  const full = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);

  // Buang kata kerja awal agar tidak terjadi repetisi seperti "mengerjakan membuat" atau "menyelesaikan pengerjaan"
  let noun = full
    .replace(/^(mengerjakan|ngerjain|melakukan|menyelesaikan|membuat|bikin|menangani|mengembangkan|menyusun|merancang)\s+/i, '')
    .trim();

  if (!noun) noun = full;

  return { full, noun };
}

/**
 * Generator Laporan Harian Bahasa Indonesia Natural (Sangat Terhubung / Nyambung).
 * - Aktivitas (Activity Log): Mengalir alami sesuai catatan pengguna.
 * - Pembelajaran (Lesson Learned): Benar-benar nyambung secara spesifik dengan Uraian Aktivitas.
 * - Kendala (Obstacles): Mengalir santai dan realistis.
 */
function generateNaturalReport(
  prompt: string,
  noObstacles: boolean,
  customObstacle?: string,
  role?: string
) {
  const { full, noun } = cleanUserText(prompt);

  // 1. Variasi AKTIVITAS HARIAN (Activity Log) - Bahasa Natural Mengalir & Sopan (Wajib > 100 karakter)
  const activityTemplates = [
    // 1
    `Hari ini saya fokus menyelesaikan tugas ${noun}. Kegiatan diawali dengan mempelajari instruksi dan panduan dari mentor, lalu dilanjutkan dengan pengerjaan tahap demi tahap secara teliti. Di sela pengerjaan saya juga berkoordinasi dengan tim agar hasilnya sesuai dengan arahan. Sebelum jam kerja berakhir, saya memeriksa kembali seluruh hasil pekerjaan agar rapi dan siap dilaporkan ke pembimbing.`,

    // 2
    `Untuk kegiatan magang hari ini, agenda utama saya adalah mengerjakan ${noun}. Tadi pagi saya mengikuti briefing singkat bersama mentor mengenai target pekerjaan yang perlu dicapai. Setelah itu saya langsung mengerjakan tugas tersebut, mulai dari menyiapkan bahan yang dibutuhkan hingga merapikan hasilnya. Seluruh bagian tugas hari ini dapat diselesaikan dengan baik dan laporannya telah saya rekap.`,

    // 3
    `Aktivitas magang hari ini berfokus pada pengerjaan ${noun}. Saya mengawali kegiatan dengan menelaah referensi dan alur kerja yang relevan agar proses pengerjaannya lebih lancar dan terarah. Selanjutnya saya mengerjakan tugas tersebut secara bertahap dan mandiri. Hasil pekerjaan hari ini sudah selesai dirapikan dan disimpan dengan aman untuk bahan evaluasi bersama tim.`,

    // 4
    `Melanjutkan tugas magang hari ini, saya fokus menuntaskan ${noun}. Pengerjaan saya bagi menjadi beberapa tahapan agar lebih terstruktur dan tidak ada detail yang terlewat. Selama pengerjaan, saya juga rutin memeriksa kembali kualitas hasilnya. Tugas hari ini berhasil selesai tepat waktu dan dokumen pendukungnya telah tersusun rapi.`,

    // 5
    `Hari ini saya melanjutkan tanggung jawab harian yaitu ${noun}. Proses pengerjaan berjalan dengan lancar, dimulai dari perencanaan alur kerja hingga tahap penyelesaian detail tugas. Saya juga sempat berdiskusi dengan rekan kerja untuk saling memeriksa progres masing-masing. Di akhir sesi kerja, saya merangkum hasil kerja hari ini untuk dilaporkan kepada mentor.`,

    // 6
    `Fokus kerja saya hari ini yaitu menangani ${noun}. Saya memeriksa kembali catatan dari pertemuan sebelumnya agar langkah pengerjaannya tepat sasaran. Setelah itu saya fokus menyelesaikan bagian utamanya secara menyeluruh. Sebelum jam kerja selesai, saya menyempatkan waktu untuk memeriksa ulang hasil pekerjaan hari ini agar kualitasnya sesuai standar.`,

    // 7
    `Kegiatan magang hari ini diisi dengan pengerjaan ${noun}. Proses diawali dengan persiapan data dan dokumen pendukung, kemudian dilanjutkan dengan pengerjaan teknis secara cermat. Saya berusaha menjaga ketelitian di setiap langkah agar hasilnya maksimal. Tugas hari ini sudah selesai dengan baik dan laporannya siap ditinjau oleh pembimbing lapangan.`,

    // 8
    `Hari ini saya berfokus penuh untuk mengerjakan ${noun}. Alur kerja saya sesuaikan dengan panduan dan arahan yang telah disampaikan oleh mentor. Pengerjaan dilakukan secara bertahap sambil tetap memperhatikan poin-poin penting yang harus dipenuhi. Hasil tugas hari ini alhamdulillah sudah selesai dan siap dievaluasi pada agenda review berikutnya.`,

    // 9
    `Untuk hari ini, saya memprioritaskan penugasan terkait ${noun}. Dimulai dari mempelajari instruksi kerja, mengumpulkan kebutuhan tugas, hingga mengeksekusi langsung di tempat kerja. Komunikasi dengan rekan tim juga berjalan lancar saat memerlukan konfirmasi hal-hal teknis. Seluruh target kerja hari ini dapat diselesaikan dengan baik dan rapi.`,

    // 10
    `Agenda kegiatan magang hari ini berjalan produktif dengan fokus pada ${noun}. Saya mengawali hari dengan menyusun skala prioritas pengerjaan tugas, lalu langsung mengerjakan bagian yang paling penting terlebih dahulu. Hasil akhir pekerjaan hari ini sudah saya periksa kembali dan semuanya telah sesuai dengan arahan pembimbing.`,

    // 11
    `Hari ini saya fokus mengerjakan penugasan ${noun}. Dari pagi saya menyiapkan dokumen dan bahan yang diperlukan, lalu fokus menyelesaikan modul pekerjaan langkah demi langkah. Di penghujung hari kerja, saya merapikan seluruh hasil kerja dan memperbarui catatan progres harian saya.`,

    // 12
    `Aktivitas hari ini difokuskan pada penyelesaian ${noun}. Saya mengerjakan tugas ini dengan memperhatikan detail arahan dari mentor agar hasilnya benar-benar rapi dan tepat sasaran. Sepanjang pengerjaan situasi kerja berlangsung sangat kondusif, sehingga target hari ini dapat tercapai dengan baik dan selesai tepat waktu.`,

    // 13
    `Hari ini saya mendapatkan tugas untuk ${noun}. Kegiatan diawali dengan diskusi singkat bersama rekan kerja untuk menyamakan persepsi, kemudian dilanjutkan dengan proses pengerjaan. Saya memastikan setiap tahapan yang dikerjakan telah mengikuti panduan yang ada. Pekerjaan hari ini selesai dengan baik dan siap untuk ditinjau oleh mentor.`,

    // 14
    `Menjalani rutinitas magang hari ini dengan fokus menyelesaikan ${noun}. Saya mengawali dengan memeriksa progres sebelumnya, lalu melanjutkan pengerjaan bagian hari ini secara konsisten dan terarah. Sebelum selesai, saya melakukan pengecekan mandiri untuk memastikan tidak ada bagian yang terlewat atau keliru.`,

    // 15
    `Kegiatan hari ini saya manfaatkan untuk menuntaskan ${noun}. Pengerjaan berlangsung dari pagi dengan alur kerja yang terencana dan efisien. Saya juga sempat berkonsultasi dengan mentor untuk memastikan hasil pekerjaan sudah sesuai arahan. Alhamdulillah seluruh tugas hari ini dapat terselesaikan dengan lancar.`
  ];

  // 2. Variasi PEMBELAJARAN (Lesson Learned) - Nyambung, Alami & Santun (Wajib > 100 karakter)
  const connectedLessons: string[] = [
    // 1: Ketelitian khusus tugas
    `Dari proses pengerjaan ${noun} hari ini, pelajaran utama yang saya dapatkan adalah pentingnya ketelitian dalam memeriksa setiap detail sebelum diserahkan kepada mentor. Membiasakan diri untuk melakukan pengecekan mandiri saat ${noun} terbukti efektif mencegah kesalahan kecil dan membuat hasil kerja jauh lebih rapi.`,

    // 2: Komunikasi & klarifikasi instruksi
    `Saat menyelesaikan ${noun} hari ini, saya belajar banyak mengenai pentingnya komunikasi aktif bersama mentor dan tim kerja. Jika terdapat bagian teknis yang belum jelas saat mengerjakan ${noun}, berinisiatif untuk mengonfirmasi sejak awal membuat waktu kerja lebih efisien dan hasilnya tepat sasaran.`,

    // 3: Manajemen alur kerja terstruktur
    `Melalui kegiatan ${noun} hari ini, saya semakin memahami cara mengatur alur kerja agar lebih terencana. Menyusun tahapan langkah demi langkah sebelum memulai ${noun} membantu saya tetap fokus dan dapat menyelesaikan seluruh target tugas tepat waktu secara teratur.`,

    // 4: Problem-solving & riset mandiri
    `Hal berharga yang saya pelajari saat mengerjakan ${noun} yaitu melatih kemandirian dan kemampuan problem-solving ketika menghadapi kendala baru. Saya berupaya mencari referensi pendukung terlebih dahulu sebelum berkonsultasi dengan mentor, sehingga wawasan saya terkait ${noun} juga semakin bertambah.`,

    // 5: Standarisasi & SOP
    `Dari penugasan ${noun} hari ini, saya belajar bahwa mengikuti alur kerja dan standar mutu perusahaan merupakan hal yang sangat fundamental. Pengerjaan ${noun} yang mengacu pada panduan baku menghasilkan output yang konsisten, mudah dipahami oleh tim lain, dan sesuai dengan ekspektasi pembimbing.`,

    // 6: Dokumentasi & pengarsipan rapi
    `Setelah mengerjakan ${noun} hari ini, saya semakin menyadari pentingnya merapikan file dan dokumentasi kerja secara berkala. Hasil akhir ${noun} yang tertata rapi dan terstruktur memudahkan pekerjaan selanjutnya untuk ditindaklanjuti atau ditinjau kembali di kemudian hari.`,

    // 7: Adaptasi tools & praktik nyata
    `Poin pembelajaran utama saat mengerjakan ${noun} tadi adalah membiasakan diri lebih adaptif dengan sistem dan perangkat kerja di kantor. Pengalaman langsung dalam menyelesaikan ${noun} ini membuat pemahaman praktis saya jauh lebih matang dibandingkan hanya mempelajari konsep teorinya saja.`,

    // 8: Menerima masukan mentor
    `Kegiatan ${noun} hari ini mengajarkan saya untuk selalu terbuka menerima masukan dan arahan perbaikan dari pembimbing. Diskusi dan evaluasi saat proses ${noun} sangat membantu saya melihat sudut pandang baru dalam menyempurnakan hasil pekerjaan agar semakin profesional.`,

    // 9: Tanggung jawab & konsistensi
    `Pengalaman menuntaskan ${noun} hari ini memperkuat rasa tanggung jawab profesional saya dalam bekerja. Menjaga komitmen untuk menyelesaikan setiap target pada ${noun} secara tepat waktu merupakan etos kerja penting yang terus saya bangun selama masa magang.`,

    // 10: Membagi beban kerja
    `Saat mengerjakan ${noun} hari ini, saya belajar cara membagi penugasan yang kompleks menjadi bagian-bagian kecil yang lebih mudah dikelola. Pendekatan ini membuat proses pengerjaan ${noun} terasa lebih teratur dan hasil akhirnya tetap terorganisir dengan sangat baik.`,

    // 11: Kualitas vs Kecepatan
    `Dari pengerjaan ${noun} tadi, saya belajar bahwa menjaga kualitas hasil kerja sama pentingnya dengan ketepatan waktu. Mengerjakan ${noun} dengan teliti dan cermat membuat hasil akhirnya matang serta meminimalisir kebutuhan revisi ulang.`,

    // 12: Evaluasi mandiri
    `Melalui penugasan ${noun} hari ini, saya belajar cara mengevaluasi hasil kerja sendiri secara objektif. Menguji dan meninjau kembali setiap bagian dari ${noun} sebelum dilaporkan membantu saya lebih percaya diri terhadap kualitas pekerjaan yang saya selesaikan.`
  ];

  // Tambahan variasi kontekstual berdasarkan kata kunci pada tugas:
  const isCoding = /(fitur|bug|coding|program|api|database|web|frontend|backend|testing|develop|aplikasi|sistem|query|halaman|login|tampilan)/i.test(prompt);
  const isDesign = /(desain|design|poster|banner|konten|video|feed|canva|figma|ui|ux|mockup|reels|tiktok|animasi|gambar|visual)/i.test(prompt);
  const isDataOrAdmin = /(data|excel|spreadsheet|rekap|input|laporan|arsip|dokumen|administrasi|keuangan|surat|tabel|pembukuan|berkas)/i.test(prompt);

  if (isCoding) {
    connectedLessons.push(
      `Saat mengerjakan ${noun} hari ini, saya belajar pentingnya memahami alur logika sistem dan penanganan error secara menyeluruh. Menguji setiap skenario saat ${noun} sangat krusial agar aplikasi berjalan stabil dan andal saat digunakan.`,
      `Dari pengerjaan ${noun} tadi, pembelajaran teknis yang saya peroleh adalah cara menyusun struktur kode yang rapi dan terstandarisasi. Memperhatikan praktik terbaik saat ${noun} sangat mempermudah proses integrasi dan pemeliharaan ke depannya.`
    );
  }

  if (isDesign) {
    connectedLessons.push(
      `Saat mengerjakan ${noun} hari ini, saya belajar pentingnya memperhatikan keselarasan visual, tata letak, dan pemilihan warna. Menyesuaikan estetika desain dengan kebutuhan audiens saat ${noun} sangat membantu agar pesan yang disampaikan dapat diterima dengan jelas.`,
      `Dari kegiatan ${noun} tadi, pembelajaran pentingnya adalah melihat hasil karya dari sudut pandang pengguna. Masukan dari mentor saat meninjau ${noun} membantu saya menyempurnakan detail visual agar terlihat lebih elegan dan profesional.`
    );
  }

  if (isDataOrAdmin) {
    connectedLessons.push(
      `Dari proses pengerjaan ${noun} hari ini, pelajaran terpenting adalah menjaga ketelitian dan akurasi tinggi dalam mengolah setiap entri data. Memeriksa ulang angka dan format saat ${noun} sangat penting untuk mencegah terjadinya kesalahan dalam laporan.`,
      `Saat menyelesaikan ${noun} tadi, saya belajar cara mengorganisasi data dan berkas dengan sistem penamaan yang rapi. Kerapian dokumen saat ${noun} membuat informasi mudah ditelusuri kembali saat sewaktu-waktu dibutuhkan oleh tim.`
    );
  }

  // 3. Variasi KENDALA (Obstacles) - Bahasa Natural Sehari-hari & Sopan (Wajib > 100 karakter)
  let obstacleText = '';

  if (noObstacles || !customObstacle?.trim()) {
    // 12 Variasi Natural Sopan Saat Tidak Ada Kendala
    const smoothTemplates = [
      `Alhamdulillah kegiatan hari ini berjalan lancar dari awal hingga selesai. Arahan dari mentor sangat jelas dan rekan tim juga komunikatif, sehingga seluruh target tugas hari ini dapat diselesaikan dengan baik tanpa kendala berarti.`,
      `Secara keseluruhan aktivitas kerja hari ini berjalan kondusif. Akses sistem, koneksi internet, dan perangkat kerja berfungsi secara optimal, sehingga alur pengerjaan tugas dapat diselesaikan tepat waktu sesuai rencana.`,
      `Hari ini tidak ada kendala yang berarti selama proses pengerjaan tugas. Lingkungan kerja sangat mendukung dan koordinasi bersama pembimbing lapangan berjalan lancar, sehingga seluruh penugasan dapat terselesaikan secara maksimal.`,
      `Pengerjaan tugas hari ini berlangsung lancar tanpa ada hambatan teknis maupun operasional. Persiapan materi yang baik sejak awal sangat membantu kelancaran penyelesaian tugas hingga tuntas.`,
      `Alhamdulillah tidak ada hambatan yang mengganggu produktivitas kerja hari ini. Komunikasi tim berjalan responsif dan mentor senantiasa membimbing saat diperlukan, sehingga target harian tercapai dengan baik.`,
      `Kegiatan magang hari ini berjalan tertib dan sesuai dengan jadwal yang telah ditentukan. Tidak ada kendala teknis yang ditemui, dan seluruh tahapan pekerjaan berhasil saya selesaikan dengan rapi dan lancar.`,
      `Semua agenda tugas hari ini terlaksana dengan baik tanpa kendala khusus. Pembagian tugas yang jelas serta suasana kerja yang profesional membuat proses pengerjaan hari ini berlangsung sangat efektif.`,
      `Hari ini alur pengerjaan tugas berlangsung sangat baik dan minim hambatan. Bahan pendukung sudah siap sejak pagi, sehingga proses pengerjaan dapat langsung dilaksanakan dan selesai tepat pada waktunya.`,
      `Alhamdulillah seluruh aktivitas hari ini dapat diselesaikan dengan lancar. Diskusi singkat di awal hari sangat membantu menyelaraskan pemahaman dan mencegah terjadinya kendala selama pengerjaan tugas.`,
      `Tidak ada kendala operasional yang berarti hari ini. Alur kerja berjalan sesuai dengan panduan dan seluruh penugasan yang direncanakan untuk hari ini berhasil diselesaikan dengan baik.`,
      `Secara umum kegiatan hari ini berjalan lancar dan terarah. Rekan kerja sangat suportif dan instruksi pembimbing mudah dipahami, sehingga proses penyelesaian tugas dapat berjalan tanpa hambatan.`,
      `Pekerjaan hari ini berlangsung lancar tanpa kendala. Segala kebutuhan data dan referensi kerja tersedia dengan lengkap, sehingga tugas hari ini dapat diselesaikan dengan hasil yang memuaskan.`
    ];
    obstacleText = smoothTemplates[Math.floor(Math.random() * smoothTemplates.length)];
  } else {
    // 8 Variasi Natural Sopan Saat Ada Kendala Nyata
    const obstacleInput = customObstacle.trim().replace(/[.,;!]+$/, '');
    const lowerObstacle = obstacleInput.charAt(0).toLowerCase() + obstacleInput.slice(1);

    const obstacleVariations = [
      `Pada kegiatan hari ini sempat terdapat kendala terkait ${lowerObstacle}. Namun kendala tersebut berhasil diatasi dengan baik setelah saya berkonsultasi dan mendapatkan arahan dari mentor, sehingga pekerjaan dapat selesai tepat waktu.`,
      `Kendala yang dihadapi hari ini yaitu terkait ${lowerObstacle}. Kendala ini dapat segera teratasi setelah saya berdiskusi bersama rekan tim dan menyesuaikan langkah kerja sesuai masukan pembimbing.`,
      `Tadi sempat menemui sedikit hambatan saat ${lowerObstacle}. Langkah penanganannya saya lakukan dengan menelusuri sumber kendala terlebih dahulu, lalu berkonsultasi kepada mentor untuk menerapkan solusi yang paling tepat.`,
      `Dalam proses pengerjaannya, hari ini ada sedikit tantangan mengenai ${lowerObstacle}. Berkat bimbingan dan arahan solutif dari pembimbing lapangan, kendala tersebut berhasil ditangani dengan baik dan tugas tetap berjalan lancar.`,
      `Sempat terjadi sedikit kendala teknis terkait ${lowerObstacle}. Setelah mencari referensi tambahan dan melakukan penyesuaian alur kerja, kendala tersebut dapat terselesaikan dan target hari ini tetap tercapai.`,
      `Hambatan yang muncul pada pengerjaan hari ini adalah ${lowerObstacle}. Saya segera berkoordinasi dengan tim kerja untuk mencari solusi bersama, sehingga permasalahan tersebut dapat tertangani tanpa mengganggu tugas lainnya.`,
      `Tadi sempat sedikit terhambat karena ${lowerObstacle}. Namun masalah ini berhasil diselesaikan melalui evaluasi mandiri serta arahan dari mentor, sehingga seluruh penugasan tetap selesai dengan rapi.`,
      `Terdapat sedikit kendala pada bagian ${lowerObstacle}. Berkat komunikasi yang cepat dengan pembimbing dan rekan magang, solusinya dapat langsung diterapkan dan pekerjaan tetap selesai tepat pada waktunya.`
    ];
    obstacleText = obstacleVariations[Math.floor(Math.random() * obstacleVariations.length)];
  }

  // Pilih variasi secara acak independen agar selalu segar
  const actIdx = Math.floor(Math.random() * activityTemplates.length);
  const lesIdx = Math.floor(Math.random() * connectedLessons.length);

  return {
    activity_log: activityTemplates[actIdx],
    lesson_learned: connectedLessons[lesIdx],
    obstacles: obstacleText,
    source: 'natural-connected-engine',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { prompt, no_obstacles, custom_obstacle, role, company } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Deskripsi kegiatan singkat wajib diisi untuk generate laporan.' },
        { status: 400 }
      );
    }

    const apiKey = EMBEDDED_GEMINI_API_KEY;

    // Jalankan Google Gemini AI
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const systemInstruction = `Anda adalah asisten profesional untuk peserta magang Kemnaker RI.
Tugas Anda adalah membuat draf laporan harian kegiatan magang (activity_log, lesson_learned, obstacles) berdasarkan catatan singkat dari pengguna.

ATURAN GAYA BAHASA & STRUKTUR (SANGAT WAJIB DIPATUHI):
1. BAHASA NATURAL, MENGALIR, DAN TETAP SOPAN/SANTUN:
   - Gunakan bahasa Indonesia yang mengalir alami, manusiawi, dan komunikatif, namun TETAP SOPAN, SANTUN, dan PANTAS untuk laporan resmi mahasiswa magang kepada mentor/pembimbing lapangan.
   - Selalu gunakan kata ganti "saya" jika menyebut diri sendiri (DILARANG KERAS menggunakan "gue/aku/lo").
   - HINDARI bahasa slang/tongkrongan yang terlalu santai atau kurang sopan (HINDARI kata seperti: "ngerjain", "kelar", "beres", "udah", "nggak", "bareng tim", "pas pengerjaan", "bikin", "nemu", "ngetes"). Gunakan kata yang santun dan wajar: "mengerjakan", "menyelesaikan", "sudah", "tidak ada kendala", "bersama tim", "saat pengerjaan", "membuat/menyusun", "menemukan", "menguji".
   - HINDARI JUGA gaya bahasa yang terlalu kaku/birokratis/skripsi (HINDARI kata berbelit seperti: "mengimplementasikan", "fungsionalitas", "adapun", "komprehensif", "sebagaimana mestinya"). Gunakan kalimat aktif yang ringkas, jelas, dan santun.

2. JUMLAH KALIMAT: PERSIS 2 HINGGA 3 KALIMAT PADAT PER BAGIAN:
   - Setiap kolom (activity_log, lesson_learned, obstacles) HANYA BOLEH TERDIRI DARI 2 SAMPAI 3 KALIMAT PADAT SAJA.
   - Dilarang membuat paragraf panjang atau lebih dari 3 kalimat.
   - Setiap bagian TETAP WAJIB MEMILIKI LEBIH DARI 100 KARAKTER (misal 120 - 250 karakter) agar lolos validasi sistem Kemnaker RI.

3. KETERHUBUNGAN:
   - Bagian "lesson_learned" (Pembelajaran) WAJIB NYAMBUNG LANGSUNG secara spesifik dan santun dengan apa yang dikerjakan di "activity_log".

4. KENDALA (obstacles):
   - Jika no_obstacles = true: tulis 2 kalimat santun bahwa kegiatan hari ini berjalan lancar tanpa kendala berarti, koordinasi bersama mentor berjalan baik, dan tugas selesai sesuai target (> 100 karakter).
   - Jika no_obstacles = false: tulis 2-3 kalimat santun tentang kendala teknis yang dihadapi dan bagaimana hal tersebut berhasil diselesaikan melalui konsultasi bersama mentor/tim (> 100 karakter).

Format output HARUS murni JSON:
{
  "activity_log": "...",
  "lesson_learned": "...",
  "obstacles": "..."
}`;

        const userPrompt = `
Posisi Magang: ${role || 'Peserta Magang'}
Perusahaan: ${company || 'Mitra Magang'}
Catatan Kegiatan Singkat: "${prompt.trim()}"
Tidak Ada Kendala?: ${no_obstacles ? 'YA (Kegiatan lancar)' : 'TIDAK'}
Kendala Spesifik: "${custom_obstacle ? custom_obstacle.trim() : '-'}"

INSTRUKSI KHUSUS: Buatkan laporan harian dengan bahasa Indonesia yang NATURAL, MENGALIR, dan TETAP SOPAN/SANTUN (kata ganti 'saya', tidak kaku, namun bukan bahasa slang gaul). Masing-masing kolom CUKUP 2 SAMPAI 3 KALIMAT PADAT SAJA (tidak bertele-tele) dan tetap memenuhi minimal lebih dari 100 karakter.`;

        const modelsToTry = [
          'gemini-3-flash-preview',
          'gemini-flash-lite-latest',
          'gemini-3.5-flash',
          'gemini-2.5-flash',
        ];

        for (const model of modelsToTry) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

            const geminiRes = await fetch(geminiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }],
                  },
                ],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.75,
                  maxOutputTokens: 1500,
                },
              }),
            });

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const candidateText =
                geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

              if (candidateText) {
                const parsed = JSON.parse(candidateText);
                if (
                  parsed.activity_log &&
                  parsed.lesson_learned &&
                  parsed.obstacles
                ) {
                  return NextResponse.json({
                    success: true,
                    data: {
                      activity_log: String(parsed.activity_log).trim(),
                      lesson_learned: String(parsed.lesson_learned).trim(),
                      obstacles: String(parsed.obstacles).trim(),
                      source: `AI Gemini (${model})`,
                    },
                  });
                }
              }
            }
          } catch {
            // Lanjut ke model berikutnya jika ada error
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to natural connected engine:', geminiError);
      }
    }

    // Gunakan Natural Connected Engine
    const naturalResult = generateNaturalReport(
      prompt,
      no_obstacles,
      custom_obstacle,
      role
    );

    return NextResponse.json({
      success: true,
      data: naturalResult,
      note: 'Generated via natural connected engine',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gagal menyusun laporan otomatis' },
      { status: 500 }
    );
  }
}
