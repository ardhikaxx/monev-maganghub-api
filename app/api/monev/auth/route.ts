import { NextRequest, NextResponse } from 'next/server';
import { MONEV_API_BASE_URL, DEFAULT_FRONTEND_BUILD_ID } from '@/lib/monev';

export async function GET() {
  try {
    const res = await fetch(`${MONEV_API_BASE_URL}/auth/login`, {
      headers: {
        'X-Frontend-Build-ID': DEFAULT_FRONTEND_BUILD_ID,
      },
      cache: 'no-store',
    });

    const data = await res.text();
    return NextResponse.json({ url: data.trim() });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gagal mengambil URL login SSO' },
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

    const res = await fetch(`${MONEV_API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'X-Frontend-Build-ID': DEFAULT_FRONTEND_BUILD_ID,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gagal memperbarui token' },
      { status: 500 }
    );
  }
}
