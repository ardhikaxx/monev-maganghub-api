import { NextRequest, NextResponse } from 'next/server';
import { MONEV_API_BASE_URL, DEFAULT_FRONTEND_BUILD_ID } from '@/lib/monev';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token otorisasi diperlukan' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    const participantId = searchParams.get('participant_id') || '';

    // Parameter query dengan limit tinggi (1000) agar seluruh laporan terambil
    const queryParams = new URLSearchParams();
    queryParams.set('limit', '1000');
    queryParams.set('page_size', '1000');
    if (startDate) queryParams.set('start_date', startDate);
    if (endDate) queryParams.set('end_date', endDate);
    if (participantId) queryParams.set('participant_id', participantId);

    // Ambil data attendances dan daily-logs secara paralel
    const [attendancesRes, logsRes] = await Promise.all([
      fetch(`${MONEV_API_BASE_URL}/attendances?${queryParams.toString()}`, {
        headers: {
          Authorization: authHeader,
          'X-Frontend-Build-ID': DEFAULT_FRONTEND_BUILD_ID,
        },
        cache: 'no-store',
      }),
      fetch(`${MONEV_API_BASE_URL}/daily-logs?${queryParams.toString()}`, {
        headers: {
          Authorization: authHeader,
          'X-Frontend-Build-ID': DEFAULT_FRONTEND_BUILD_ID,
        },
        cache: 'no-store',
      }).catch(() => null),
    ]);

    let attendancesData: any[] = [];
    if (attendancesRes.ok) {
      const parsed = await attendancesRes.json();
      attendancesData = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.data)
        ? parsed.data
        : [];
    }

    let logsData: any[] = [];
    if (logsRes && logsRes.ok) {
      const parsedLogs = await logsRes.json();
      logsData = Array.isArray(parsedLogs)
        ? parsedLogs
        : Array.isArray(parsedLogs?.data)
        ? parsedLogs.data
        : [];
    }

    // Indeks daily-logs berdasarkan attendance_id dan tanggal
    const logByAttendanceId = new Map<string, any>();
    const logByDate = new Map<string, any>();

    for (const log of logsData) {
      if (log.attendance_id) {
        logByAttendanceId.set(String(log.attendance_id), log);
      }
      if (log.date) {
        const d = String(log.date).slice(0, 10);
        logByDate.set(d, log);
      }
    }

    // Gabungkan data presensi dengan teks laporan harian lengkap
    const mergedList: any[] = [];
    const matchedLogDates = new Set<string>();

    for (const att of attendancesData) {
      const attId = String(att.id);
      const attDate = String(att.date || '').slice(0, 10);

      let log = att.log || null;

      // Jika log belum ada atau teks uraian kosong, ambil dari hasil /daily-logs
      if (!log || (!log.activity_log && !log.lesson_learned && !log.obstacles)) {
        const found = logByAttendanceId.get(attId) || logByDate.get(attDate);
        if (found) {
          log = { ...found, ...(log || {}) };
        }
      }

      if (attDate) {
        matchedLogDates.add(attDate);
      }

      // Sinkronkan status persetujuan jika di log sudah disetujui
      let approvalStatus = att.approval_status || 'SUBMITTED';
      if (log?.state === 'APPROVED') {
        approvalStatus = 'APPROVED';
      } else if (log?.state === 'NEEDS_REVISION') {
        approvalStatus = 'SUBMITTED';
      }

      mergedList.push({
        ...att,
        date: attDate || att.date,
        approval_status: approvalStatus,
        log: log || null,
      });
    }

    // Sertakan juga entri daily-logs yang belum tercakup di attendances
    for (const log of logsData) {
      const logDate = String(log.date || '').slice(0, 10);
      if (logDate && !matchedLogDates.has(logDate)) {
        matchedLogDates.add(logDate);
        mergedList.push({
          id: log.attendance_id || log.id || `log-${logDate}`,
          date: logDate,
          status: 'PRESENT',
          approval_status: log.state === 'APPROVED' ? 'APPROVED' : 'SUBMITTED',
          log: log,
        });
      }
    }

    // Urutkan tanggal terbaru paling atas
    mergedList.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({
      success: true,
      data: mergedList,
      total: mergedList.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gagal mengambil data kehadiran' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token otorisasi diperlukan' }, { status: 401 });
    }

    const body = await req.json();

    // Pilih target endpoint: jika status PRESENT kirim with-daily-log
    const endpoint =
      body.status === 'PRESENT'
        ? `${MONEV_API_BASE_URL}/attendances/with-daily-log`
        : `${MONEV_API_BASE_URL}/attendances`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
        'X-Frontend-Build-ID': DEFAULT_FRONTEND_BUILD_ID,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gagal mengirim laporan kehadiran' },
      { status: 500 }
    );
  }
}
