import { NextRequest, NextResponse } from 'next/server';

interface GenerateRequest {
  prompt: string;
  no_obstacles: boolean;
  custom_obstacle?: string;
  role?: string;
  company?: string;
}

// API Key permanen yang tertanam di server (tidak bisa diubah atau diintip oleh pengguna)
const EMBEDDED_GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  Buffer.from('QVEuQWI4Uk42SlhyeUFjcjZPVUFyaTNadTNBdEVlejFGb0h6RFZVMTNKRjhhRFNpaHpnLVE=', 'base64').toString('utf-8');

// Fallback smart generator jika tanpa API Key atau kuota Gemini habis
function generateSmartFallback(prompt: string, noObstacles: boolean, customObstacle?: string, role?: string) {
  const cleanPrompt = prompt.trim() || 'Melaksanakan tugas dan penugasan proyek harian magang';
  const roleName = role || 'peserta magang';

  // 1. Activity Log (>= 100 chars)
  const activityTemplates = [
    `Pada hari ini, sebagai ${roleName}, saya berfokus pada kegiatan ${cleanPrompt}. Aktivitas ini mencakup koordinasi teknis bersama tim, penyesuaian alur kerja sesuai panduan yang diberikan mentor, serta memastikan target hasil pekerjaan hari ini terselesaikan dengan baik dan terstruktur.`,
    `Melaksanakan rangkaian agenda kerja harian yang meliputi ${cleanPrompt}. Proses pengerjaan diawali dengan tinjauan kebutuhan modul, pelaksanaan implementasi teknis secara bertahap, dan ditutup dengan dokumentasi hasil kerja agar mudah ditinjau oleh pembimbing lapangan.`,
    `Menyelesaikan penugasan kerja yang berfokus pada ${cleanPrompt}. Seluruh tahapan pengerjaan dijalankan sesuai prosedur operasional standar, mencakup riset pemecahan masalah, penyesuaian fungsionalitas, serta pengujian berkala untuk meminimalisir kesalahan kerja.`
  ];

  // 2. Lesson Learned (>= 100 chars)
  const lessonTemplates = [
    `Mendapatkan wawasan mendalam mengenai pentingnya ketelitian, manajemen waktu yang efisien, serta koordinasi tim yang proaktif saat menyelesaikan ${cleanPrompt}. Saya juga belajar memahami alur kerja standar industri secara langsung di lingkungan profesional.`,
    `Memperoleh pemahaman baru terkait strategi penyelesaian masalah teknis, kepatuhan terhadap standar kualitas kerja, serta peningkatan kemampuan adaptasi dalam menangani ${cleanPrompt} secara sistematis dan terukur.`,
    `Mempelajari penerapan metode kerja yang efektif dalam ${cleanPrompt}, memperkuat pemahaman mengenai evaluasi hasil pekerjaan berkala, serta pentingnya komunikasi aktif bersama mentor guna menjaga konsistensi kualitas tugas.`
  ];

  // 3. Obstacles (>= 100 chars)
  let obstacleText = '';
  if (noObstacles || !customObstacle?.trim()) {
    const smoothTemplates = [
      `Seluruh rangkaian kegiatan pada hari ini terlaksana dengan lancar dan sesuai jadwal yang ditetapkan. Tidak terdapat kendala teknis maupun operasional yang berarti, berkat komunikasi tim yang solid dan koordinasi yang baik bersama mentor.`,
      `Pelaksanaan tugas harian berjalan secara optimal tanpa hambatan yang signifikan. Fasilitas kerja dan sarana pendukung berfungsi dengan baik, sehingga setiap target kegiatan dapat diselesaikan tepat waktu sesuai standar operasional.`,
      `Tidak ditemukan kendala besar selama proses pengerjaan berlangsung. Langkah preventif dan konsultasi berkala dengan pembimbing lapangan berhasil memastikan alur kerja tetap produktif dan terkendali dengan baik.`
    ];
    obstacleText = smoothTemplates[Math.floor(Math.random() * smoothTemplates.length)];
  } else {
    obstacleText = `Terdapat sedikit tantangan operasional berupa: ${customObstacle.trim()}. Namun kendala tersebut berhasil diatasi dengan baik melalui analisis penyebab masalah, penyesuaian metode pengerjaan, dan koordinasi cepat bersama rekan tim serta arahan mentor.`;
  }

  // Pilih template secara acak namun konsisten
  const randIdx = Math.floor(Math.random() * activityTemplates.length);

  return {
    activity_log: activityTemplates[randIdx],
    lesson_learned: lessonTemplates[randIdx],
    obstacles: obstacleText,
    source: 'smart-fallback',
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

    // Gunakan API Key yang tertanam permanen di server (pengguna tidak bisa menggantinya)
    const apiKey = EMBEDDED_GEMINI_API_KEY;

    // Jika ada API Key Gemini, gunakan Google Gemini 2.5 Flash / Flash Latest
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const systemInstruction = `Anda adalah asisten AI profesional untuk peserta program MagangHub Kemnaker RI.
Tugas Anda adalah memperluas deskripsi kegiatan harian singkat menjadi 3 bagian laporan resmi MagangHub Kemnaker.
ATURAN WAJIB:
1. Bahasa Indonesia baku, formal, profesional, dan mencerminkan etos kerja magang berkualitas.
2. Panjang teks untuk SETIAP bagian (activity_log, lesson_learned, obstacles) WAJIB LEBIH DARI 100 KARAKTER (tidak boleh kurang dari 100 karakter).
3. Jika no_obstacles bernilai true, bagian "obstacles" HARUS menyatakan bahwa kegiatan berjalan lancar, tidak ada kendala signifikan, koordinasi berjalan baik, dan SOP terpenuhi (panjang minimal 100 karakter).
4. Jika no_obstacles bernilai false, gunakan kendala yang disebutkan dan jelaskan secara profesional beserta solusi penanganannya (minimal 100 karakter).
5. Output HARUS murni JSON dengan format:
{
  "activity_log": "...",
  "lesson_learned": "...",
  "obstacles": "..."
}`;

        const userPrompt = `
Posisi Magang: ${role || 'Peserta Magang'}
Perusahaan Penempatan: ${company || 'Mitra Kemnaker'}
Deskripsi Kegiatan Singkat: "${prompt.trim()}"
Tidak Ada Kendala?: ${no_obstacles ? 'YA (Tidak ada kendala)' : 'TIDAK'}
Catatan Kendala Khusus: "${custom_obstacle ? custom_obstacle.trim() : '-'}"

Hasilkan JSON laporan resmi Kemnaker dengan 3 atribut: activity_log, lesson_learned, obstacles (masing-masing wajib >= 100 karakter).`;

        // Daftar model yang didukung, utamakan gemini-2.5-flash
        const modelsToTry = ['gemini-2.5-flash', 'gemini-flash-latest'];

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
                  temperature: 0.7,
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
                      source: model,
                    },
                  });
                }
              }
            }
          } catch {
            // Lanjut ke model berikutnya jika ada error jaringan
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to smart engine:', geminiError);
      }
    }

    // Fallback cerdas jika tidak ada API key atau API key limit
    const fallbackResult = generateSmartFallback(
      prompt,
      no_obstacles,
      custom_obstacle,
      role
    );

    return NextResponse.json({
      success: true,
      data: fallbackResult,
      note: 'Generated via smart engine',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gagal memproses pembuatan draf otomatis' },
      { status: 500 }
    );
  }
}
