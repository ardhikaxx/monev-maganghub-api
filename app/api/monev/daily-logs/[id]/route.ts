import { NextRequest, NextResponse } from 'next/server';
import { MONEV_API_BASE_URL, DEFAULT_FRONTEND_BUILD_ID } from '@/lib/monev';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token otorisasi diperlukan' }, { status: 401 });
    }

    const { id } = await params;
    const res = await fetch(`${MONEV_API_BASE_URL}/daily-logs/${id}`, {
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
      { error: error?.message || 'Gagal mengambil detail log' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token otorisasi diperlukan' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const res = await fetch(`${MONEV_API_BASE_URL}/daily-logs/${id}`, {
      method: 'PUT',
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
      { error: error?.message || 'Gagal memperbarui laporan harian' },
      { status: 500 }
    );
  }
}
