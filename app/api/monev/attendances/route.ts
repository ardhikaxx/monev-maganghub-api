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

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.set('start_date', startDate);
    if (endDate) queryParams.set('end_date', endDate);

    const res = await fetch(`${MONEV_API_BASE_URL}/attendances?${queryParams.toString()}`, {
      headers: {
        Authorization: authHeader,
        'X-Frontend-Build-ID': DEFAULT_FRONTEND_BUILD_ID,
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
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
