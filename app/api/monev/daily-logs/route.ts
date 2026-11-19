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
    const date = searchParams.get('date') || '';
    const participantId = searchParams.get('participant_id') || '';

    const queryParams = new URLSearchParams();
    queryParams.set('limit', '1000');
    queryParams.set('page_size', '1000');
    if (startDate) queryParams.set('start_date', startDate);
    if (endDate) queryParams.set('end_date', endDate);
    if (date) queryParams.set('date', date);
    if (participantId) queryParams.set('participant_id', participantId);

    const res = await fetch(`${MONEV_API_BASE_URL}/daily-logs?${queryParams.toString()}`, {
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
      { error: error?.message || 'Gagal mengambil daily logs' },
      { status: 500 }
    );
  }
}
