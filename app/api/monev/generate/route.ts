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

  // Buang kata kerja berlebih (mengerjakan, ngerjain, melakukan) agar tidak terjadi "ngerjain mengerjakan"
  let noun = full
    .replace(/^(mengerjakan|ngerjain|melakukan|menyelesaikan)\s+/i, '');

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

  // 1. Variasi AKTIVITAS HARIAN (Activity Log) - Bahasa Natural Mengalir (Wajib > 100 karakter)
  const activityTemplates = [
    // 1
    `Hari ini saya fokus menyelesaikan tugas ${noun}. Tadi dimulai dari cek instruksi dan panduan yang udah dikasih mentor, lalu lanjut ngerjain tahap demi tahap secara teliti. Di sela pengerjaan saya juga sempat koordinasi sebentar sama tim biar hasilnya sesuai harapan. Sebelum jam kerja selesai, saya cek ulang lagi hasilnya biar rapi dan siap dilaporkan ke pembimbing.`,

    // 2
    `Untuk kegiatan magang hari ini, agenda utama saya adalah ngerjain ${noun}. Tadi pagi sempat ada briefing singkat bareng mentor mengenai target yang perlu dicapai. Setelah itu saya langsung eksekusi tugasnya, mulai dari nyiapin bahan yang dibutuhin sampai merapikan hasilnya. Semua bagian tugas hari ini alhamdulillah selesai dengan baik dan progresnya sudah saya rekap.`,

    // 3
    `Aktivitas magang hari ini berfokus ke pengerjaan ${noun}. Saya mulai dengan mempelajari referensi dan alur kerja yang relevan dulu biar proses pengerjaannya lebih lancar dan terarah. Setelah itu saya kerjakan tugasnya secara bertahap dan mandiri. Hasil kerjaan hari ini sudah selesai dirapikan dan disimpan dengan aman untuk bahan evaluasi tim besok.`,

    // 4
    `Melanjutkan tugas magang hari ini, saya fokus menyelesaikan ${noun}. Tadi saya bagi pengerjaannya jadi beberapa bagian kecil biar lebih terstruktur dan nggak ada yang kelewat. Selama pengerjaan, saya juga rutin ngecek kembali detail hasilnya. Tugas hari ini berhasil selesai tepat waktu dan file-file pendukungnya sudah tersusun rapi.`,

    // 5
    `Hari ini saya melanjutkan tanggung jawab harian yaitu ${noun}. Pengerjaannya berjalan dengan lancar, diawali dari penyusunan alur kerja sampai tahap eksekusi detail tugasnya. Tadi juga sempat diskusi santai sama rekan tim buat saling kroscek progres masing-masing. Di akhir sesi kerja, saya merangkum hasil kerja hari ini untuk laporan ke mentor.`,

    // 6
    `Fokus kerja saya hari ini yaitu menangani ${noun}. Tadi saya cek kembali catatan dari pertemuan sebelumnya biar nggak ada salah langkah saat pengerjaan. Setelah itu saya fokus ngerjain bagian utamanya sampai tuntas. Sebelum jam pulang, saya sempatkan untuk double check lagi hasil kerjaan hari ini biar kualitasnya benar-benar sesuai standar.`,

    // 7
    `Kegiatan magang hari ini diisi dengan pengerjaan ${noun}. Tadi prosesnya dimulai dengan persiapan data dan bahan pendukung, lalu dilanjutkan dengan pengerjaan teknis secara cermat. Saya berusaha menjaga ketelitian di setiap langkah agar hasilnya maksimal. Tugas hari ini sudah beres dan laporannya sudah saya siapkan untuk dicek pembimbing lapangan.`,

    // 8
    `Hari ini saya berfokus penuh untuk ngerjain ${noun}. Tadi alur kerjanya saya sesuaikan dengan arahan yang udah dijelaskan mentor. Pengerjaan dilakukan secara bertahap sambil terus memperhatikan poin-poin penting yang harus dipenuhi. Hasil tugas hari ini alhamdulillah sudah selesai dan siap ditinjau pada agenda review berikutnya.`,

    // 9
    `Untuk hari ini, saya memprioritaskan penugasan terkait ${noun}. Dimulai dari menelaah instruksi kerja, mengumpulkan kebutuhan tugas, sampai mengeksekusi langsung di tempat kerja. Komunikasi dengan rekan tim juga berjalan lancar pas butuh konfirmasi hal-hal teknis. Akhirnya semua target kerja hari ini bisa tuntas dengan rapi.`,

    // 10
    `Agenda kegiatan magang hari ini berjalan produktif dengan fokus pada ${noun}. Tadi saya mengawali hari dengan menyusun skala prioritas pengerjaan tugas, lalu langsung mengerjakan bagian yang paling penting terlebih dahulu. Hasil akhir pekerjaan hari ini sudah saya periksa kembali dan semuanya sudah sesuai dengan arahan dari pembimbing.`,

    // 11
    `Hari ini saya fokus mengerjakan penugasan ${noun}. Dari pagi saya langsung nyiapin dokumen dan bahan yang diperlukan, lalu fokus menyelesaikan modul pekerjaan langkah demi langkah. Di penghujung hari, saya menyempatkan diri buat merapikan seluruh hasil kerja dan memperbarui catatan progres harian saya.`,

    // 12
    `Aktivitas hari ini difokuskan pada penyelesaian ${noun}. Saya kerjakan tugas ini dengan memperhatikan detail arahan dari mentor agar hasilnya benar-benar rapi dan tepat sasaran. Sepanjang pengerjaan situasi kerja sangat kondusif, sehingga target yang ditentukan hari ini bisa tercapai dengan baik dan selesai tepat waktu.`,

    // 13
    `Hari ini saya dapat tugas untuk ${noun}. Tadi saya awali dengan diskusi singkat sama rekan kerja untuk menyamakan persepsi, setelah itu langsung mulai eksekusi pekerjaannya. Saya pastikan setiap proses yang dikerjakan sudah mengikuti panduan yang ada. Pekerjaan hari ini selesai dengan baik dan sudah siap direview mentor.`,

    // 14
    `Menjalani rutinitas magang hari ini dengan fokus ke ${noun}. Saya mulai dengan memeriksa tugas-tugas kemarin, lalu melanjutkan pengerjaan bagian hari ini secara konsisten dan terarah. Sebelum selesai, saya sempat melakukan pengujian mandiri untuk memastikan tidak ada bagian yang terlewat atau keliru.`,

    // 15
    `Kegiatan hari ini saya manfaatkan untuk menuntaskan ${noun}. Pengerjaan berlangsung dari pagi dengan alur kerja yang terencana dan efisien. Saya juga sempat berkonsultasi sebentar ke mentor untuk memastikan hasil pekerjaan sudah sesuai jalur. Alhamdulillah hari ini semua tugas bisa terselesaikan dengan lancar.`
  ];

  // 2. Variasi PEMBELAJARAN (Lesson Learned) - BENAR-BENAR NYAMBUNG DENGAN AKTIVITAS (Wajib > 100 karakter)
  const connectedLessons: string[] = [
    // 1: Ketelitian khusus tugas
    `Dari proses pengerjaan ${noun} hari ini, pelajaran utama yang saya dapat adalah pentingnya ketelitian dalam memeriksa setiap detail sebelum diserahkan ke mentor. Membiasakan diri buat kroscek mandiri pas ${noun} terbukti efektif buat mencegah kesalahan kecil dan bikin hasil kerja jauh lebih rapi.`,

    // 2: Komunikasi & klarifikasi instruksi
    `Pas menyelesaikan ${noun} tadi, saya belajar banyak soal pentingnya komunikasi yang aktif bareng mentor dan tim. Kalau ada bagian teknis yang masih belum jelas pas ngerjain ${noun}, lebih baik langsung dikonfirmasi sejak awal biar waktu pengerjaan lebih efisien dan hasilnya tepat sasaran.`,

    // 3: Manajemen alur kerja terstruktur
    `Melalui kegiatan ${noun} hari ini, saya jadi lebih paham cara ngatur alur kerja biar lebih terencana. Menyusun tahapan langkah demi langkah sebelum mulai ${noun} ngebantu saya tetap fokus dan bisa menyelesaikan seluruh bagian tugas tepat waktu tanpa tergesa-gesa.`,

    // 4: Problem-solving & riset mandiri
    `Hal berharga yang saya pelajari pas ngerjain ${noun} yaitu melatih kemandirian dan cara problem-solving saat nemu kendala baru. Saya coba cari referensi pendukung dulu sebelum nanya ke mentor, jadi wawasan dan pemahaman saya soal ${noun} juga ikut bertambah banyak.`,

    // 5: Standarisasi & SOP
    `Dari penugasan ${noun} hari ini, saya belajar bahwa mengikuti alur kerja dan standar mutu perusahaan itu sangat penting. Pengerjaan ${noun} yang mengacu pada panduan baku bikin hasilnya lebih konsisten, mudah dipahami tim lain, dan lolos review mentor dengan baik.`,

    // 6: Dokumentasi & pengarsipan rapi
    `Setelah ngerjain ${noun} seharian ini, saya makin sadar pentingnya merapikan file dan dokumentasi kerja secara berkala. Hasil akhir ${noun} yang disimpan dengan rapi dan terstruktur bikin pekerjaan selanjutnya jadi jauh lebih gampang untuk dilanjutkan atau dicek kembali.`,

    // 7: Adaptasi tools & praktik nyata
    `Poin pembelajaran terbesar pas ngerjain ${noun} tadi adalah membiasakan diri lebih adaptif dengan tools dan sistem kerja di kantor. Pengalaman langsung menyelesaikan ${noun} ini bikin pemahaman praktis saya jauh lebih matang dibanding hanya belajar konsep teorinya saja.`,

    // 8: Menerima masukan mentor
    `Kegiatan ${noun} hari ini ngajarin saya untuk selalu terbuka menerima masukan dan arahan perbaikan dari pembimbing. Diskusi kecil saat proses ${noun} sangat ngebantu saya melihat sudut pandang baru buat menyempurnakan hasil pekerjaan agar makin profesional.`,

    // 9: Tanggung jawab & konsistensi
    `Pengalaman menuntaskan ${noun} hari ini memperkuat rasa tanggung jawab profesional saya dalam bekerja. Menjaga komitmen buat menyelesaikan setiap target pada ${noun} tepat waktu merupakan etos kerja penting yang terus saya bangun selama magang.`,

    // 10: Membagi beban kerja
    `Pas ngerjain ${noun} hari ini, saya belajar cara membagi tugas yang kompleks jadi bagian-bagian kecil yang lebih mudah dikontrol. Pendekatan ini bikin proses pengerjaan ${noun} terasa lebih ringan dan hasilnya tetap terorganisir dengan sangat baik.`,

    // 11: Kualitas vs Kecepatan
    `Dari pengerjaan ${noun} tadi, saya belajar bahwa menjaga kualitas hasil kerja itu sama pentingnya dengan kecepatan kerja. Mengerjakan ${noun} dengan sabar dan teliti bikin hasil akhirnya matang serta meminimalisir kebutuhan revisi ulang.`,

    // 12: Evaluasi mandiri
    `Lewat penugasan ${noun} hari ini, saya belajar cara mengevaluasi hasil kerja sendiri secara kritis. Menguji dan meninjau kembali setiap bagian dari ${noun} sebelum dikirim ngebantu saya lebih percaya diri dengan kualitas pekerjaan yang saya selesaikan.`
  ];

  // Tambahan variasi kontekstual berdasarkan kata kunci pada tugas:
  const isCoding = /(fitur|bug|coding|program|api|database|web|frontend|backend|testing|develop|aplikasi|sistem|query|halaman|login|tampilan)/i.test(prompt);
  const isDesign = /(desain|design|poster|banner|konten|video|feed|canva|figma|ui|ux|mockup|reels|tiktok|animasi|gambar|visual)/i.test(prompt);
  const isDataOrAdmin = /(data|excel|spreadsheet|rekap|input|laporan|arsip|dokumen|administrasi|keuangan|surat|tabel|pembukuan|berkas)/i.test(prompt);

  if (isCoding) {
    connectedLessons.push(
      `Pas ngerjain ${noun} hari ini, saya belajar pentingnya memahami alur logika sistem dan penanganan error secara menyeluruh. Menguji setiap kemungkinan skenario pas ${noun} sangat krusial biar aplikasi tetap stabil dan aman saat digunakan.`,
      `Dari pengerjaan ${noun} tadi, pelajaran teknis yang saya dapat adalah cara menulis kode dan menyusun struktur yang rapi. Memperhatikan standar teknis pas ${noun} sangat ngebantu proses pengujian dan integrasi ke depannya.`
    );
  }

  if (isDesign) {
    connectedLessons.push(
      `Pas ngerjain ${noun} hari ini, saya belajar pentingnya memperhatikan keselarasan visual, tata letak, dan pemilihan warna. Menyesuaikan estetika dengan kebutuhan audiens pas ${noun} ngebantu banget biar pesan yang disampaikan bisa dipahami dengan jelas.`,
      `Dari kegiatan ${noun} tadi, pembelajaran pentingnya adalah melihat hasil karya dari sudut pandang audiens. Arahan mentor saat review ${noun} ngebantu saya menyempurnakan detail desain biar terlihat lebih profesional.`
    );
  }

  if (isDataOrAdmin) {
    connectedLessons.push(
      `Dari proses ngerjain ${noun} hari ini, pelajaran terpenting adalah menjaga akurasi dan ketelitian dalam mengolah setiap entri data. Kroscek berulang pada angka dan format pas ${noun} sangat penting buat mencegah selisih atau kesalahan laporan.`,
      `Pas menyelesaikan ${noun} tadi, saya belajar cara mengorganisir data dan berkas dengan sistem penamaan yang baku. Kerapian arsip pas ${noun} bikin informasi mudah ditelusuri kembali saat sewaktu-waktu dibutuhkan tim.`
    );
  }

  // 3. Variasi KENDALA (Obstacles) - Bahasa Natural Sehari-hari (Wajib > 100 karakter)
  let obstacleText = '';

  if (noObstacles || !customObstacle?.trim()) {
    // 12 Variasi Natural Saat Tidak Ada Kendala
    const smoothTemplates = [
      `Alhamdulillah kegiatan hari ini berjalan lancar dari awal sampai selesai. Instruksi dari mentor sangat jelas dan rekan-rekan tim juga komunikatif, jadi semua target tugas hari ini bisa diselesaikan dengan baik tanpa kendala berarti.`,
      `Secara keseluruhan aktivitas kerja hari ini aman dan kondusif. Jaringan internet, akses sistem, dan perangkat kerja berfungsi dengan normal, sehingga alur pengerjaan tugas bisa beres tepat waktu sesuai rencana harian.`,
      `Hari ini tidak ada kendala yang berarti selama proses pengerjaan tugas. Suasana kantor nyaman dan komunikasi bareng pembimbing lapangan berjalan lancar, jadi seluruh pekerjaan bisa diselesaikan dengan optimal.`,
      `Pengerjaan tugas hari ini berlangsung lancar tanpa ada hambatan teknis maupun operasional. Persiapan materi yang matang dari awal sangat membantu kelancaran eksekusi tugas sampai selesai.`,
      `Alhamdulillah tidak ada hambatan yang mengganggu produktivitas hari ini. Koordinasi tim berjalan responsif dan mentor selalu siap memberi arahan saat dibutuhkan, sehingga target kerja harian tercapai dengan baik.`,
      `Kegiatan magang hari ini berjalan aman, tertib, dan sesuai jadwal. Tidak ada masalah teknis yang ditemui, dan seluruh tahapan pekerjaan berhasil saya selesaikan dengan rapi dan lancar.`,
      `Semua agenda tugas hari ini terlaksana dengan lancar tanpa kendala khusus. Pembagian tugas yang jelas dan komunikasi yang santai tapi profesional membuat ritme kerja hari ini sangat produktif.`,
      `Hari ini proses kerja berjalan sangat baik dan minim hambatan. Bahan kerja sudah siap sejak pagi sehingga proses eksekusi tugas bisa langsung jalan dan selesai tepat pada waktunya.`,
      `Alhamdulillah seluruh aktivitas hari ini bisa diselesaikan dengan lancar. Diskusi singkat di awal hari sangat membantu mencegah terjadinya kebingungan atau kendala di tengah pengerjaan tugas.`,
      `Tidak ada kendala operasional yang berarti hari ini. Alur kerja berjalan sesuai panduan dan semua tugas yang direncanakan untuk hari ini berhasil dirampungkan dengan baik.`,
      `Secara umum kegiatan hari ini berjalan lancar dan terarah. Rekan-rekan kerja sangat suportif dan arahan pembimbing mudah dipahami, sehingga tidak ada hambatan yang menghalangi penyelesaian tugas.`,
      `Pekerjaan hari ini berjalan mulus tanpa kendala. Segala kebutuhan data dan referensi kerja tersedia dengan lengkap, sehingga tugas hari ini bisa dituntaskan dengan hasil yang memuaskan.`
    ];
    obstacleText = smoothTemplates[Math.floor(Math.random() * smoothTemplates.length)];
  } else {
    // 8 Variasi Natural Saat Ada Kendala Nyata yang Dihadapi
    const obstacleInput = customObstacle.trim().replace(/[.,;!]+$/, '');
    const lowerObstacle = obstacleInput.charAt(0).toLowerCase() + obstacleInput.slice(1);

    const obstacleVariations = [
      `Tadi sempat ada kendala sedikit mengenai ${lowerObstacle}. Tapi masalahnya langsung beres setelah saya diskusi dan minta arahan singkat ke mentor, jadi tugasnya tetap bisa lanjut dan selesai tepat waktu.`,
      `Kendala yang dihadapi hari ini yaitu terkait ${lowerObstacle}. Untungnya kendala ini cepat teratasi setelah saya kroscek bareng rekan tim dan menyesuaikan langkah pengerjaannya sesuai saran pembimbing.`,
      `Tadi sempat nemu sedikit hambatan saat ${lowerObstacle}. Langkah penanganannya saya coba telusuri dulu penyebabnya, lalu konsultasi ke mentor buat nentuin solusi yang paling tepat sampai masalahnya beres.`,
      `Dalam pengerjaannya, hari ini ada sedikit tantangan mengenai ${lowerObstacle}. Tapi berkat bantuan dan arahan solutif dari pembimbing lapangan, kendala tersebut berhasil diatasi dengan baik dan pekerjaan tetap aman.`,
      `Sempat terjadi sedikit kendala teknis yaitu ${lowerObstacle}. Setelah coba mencari referensi alternatif dan melakukan penyesuaian alur kerja, kendala tersebut bisa terselesaikan dan target hari ini tetap tercapai.`,
      `Hambatan yang muncul hari ini adalah ${lowerObstacle}. Saya segera berkoordinasi dengan tim kerja untuk mencari jalan keluar, dan alhamdulillah masalahnya bisa langsung ditangani tanpa mengganggu tugas lainnya.`,
      `Tadi sempat terhambat sebentar karena ${lowerObstacle}. Namun masalah ini berhasil diatasi dengan evaluasi mandiri dan arahan mentor, sehingga seluruh penugasan hari ini tetap selesai dengan rapi.`,
      `Ada sedikit kendala di bagian ${lowerObstacle}. Berkat komunikasi cepat dengan pembimbing dan rekan magang, solusinya bisa langsung diterapkan dan hasil kerjaan tetap selesai tepat waktu.`
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
        const systemInstruction = `Anda adalah asisten cerdas untuk peserta magang Kemnaker RI.
Tugas Anda adalah membuat draf laporan harian kegiatan magang (activity_log, lesson_learned, obstacles) berdasarkan catatan singkat dari pengguna.

ATURAN GAYA BAHASA & STRUKTUR (SANGAT WAJIB DIPATUHI):
1. BAHASA TIDAK BAKU, NATURAL & TETAP SOPAN:
   - Gunakan bahasa Indonesia santai, mengalir, dan TIDAK BAKU layaknya gaya bicara atau catatan asli anak magang sehari-hari (contoh kata: ngerjain, nyelesaiin, bikin, ngecek, ngetes, nyoba, udah, nggak ada, kelar, beres, bareng tim, pas, tadi).
   - Selalu gunakan kata ganti "saya" jika menyebut diri sendiri (DILARANG pakai "gue/aku/lo").
   - DILARANG KERAS menggunakan bahasa baku kaku, kata-kata formal birokratis, atau gaya skripsi (hindari kata kaku seperti: "mengimplementasikan", "fungsionalitas", "adapun", "berdasarkan rancangan", "komprehensif", "melakukan koordinasi", dll).

2. JUMLAH KALIMAT: PERSIS 2 HINGGA 3 KALIMAT PADAT PER BAGIAN:
   - Setiap kolom (activity_log, lesson_learned, obstacles) HANYA BOLEH TERDIRI DARI 2 SAMPAI 3 KALIMAT PADAT SAJA.
   - Dilarang membuat paragraf panjang atau lebih dari 3 kalimat.
   - Setiap bagian TETAP WAJIB MEMILIKI LEBIH DARI 100 KARAKTER agar lolos validasi sistem Kemnaker RI.

3. KETERHUBUNGAN:
   - Bagian "lesson_learned" (Pembelajaran) WAJIB NYAMBUNG LANGSUNG secara santai dan spesifik dengan apa yang dikerjakan di "activity_log".

4. KENDALA (obstacles):
   - Jika no_obstacles = true: tulis 2 kalimat santai bahwa kegiatan hari ini lancar, arahan mentor jelas, dan kerjaan beres tanpa kendala (> 100 karakter).
   - Jika no_obstacles = false: tulis 2-3 kalimat santai tentang kendala yang dialami dan bagaimana kendala itu cepat beres setelah diskusi bareng tim/mentor (> 100 karakter).

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

INSTRUKSI KHUSUS: Buatkan laporan harian dengan bahasa Indonesia yang NATURAL dan TIDAK BAKU (santai, mengalir, kata ganti 'saya'). Masing-masing kolom CUKUP 2 SAMPAI 3 KALIMAT PADAT SAJA (tidak bertele-tele, tidak panjang) dan tetap memenuhi minimal lebih dari 100 karakter.`;

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
