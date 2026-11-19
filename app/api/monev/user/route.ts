import { NextRequest, NextResponse } from 'next/server';
import { MONEV_API_BASE_URL, DEFAULT_FRONTEND_BUILD_ID } from '@/lib/monev';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token otorisasi diperlukan' }, { status: 401 });
    }

    // 1. Fetch main profile from /users/me
    const userRes = await fetch(`${MONEV_API_BASE_URL}/users/me`, {
      headers: {
        Authorization: authHeader,
        'X-Frontend-Build-ID': DEFAULT_FRONTEND_BUILD_ID,
      },
      cache: 'no-store',
    });

    if (!userRes.ok) {
      const err = await userRes.json();
      return NextResponse.json(err, { status: userRes.status });
    }

    const userData = await userRes.json();
    const rawUser = userData?.data || userData;

    // 2. Fetch /users/me/home for real-time status (attendance today, holiday, etc.)
    let homeData: any = null;
    try {
      const homeRes = await fetch(`${MONEV_API_BASE_URL}/users/me/home`, {
        headers: {
          Authorization: authHeader,
          'X-Frontend-Build-ID': DEFAULT_FRONTEND_BUILD_ID,
        },
        cache: 'no-store',
      });
      if (homeRes.ok) {
        const parsedHome = await homeRes.json();
        homeData = parsedHome?.data || parsedHome;
      }
    } catch {
      // Gracefully ignore if not available
    }

    // 3. Fetch /monthly-reports for evaluations
    let monthlyReports: any = [];
    try {
      const repRes = await fetch(`${MONEV_API_BASE_URL}/monthly-reports`, {
        headers: {
          Authorization: authHeader,
          'X-Frontend-Build-ID': DEFAULT_FRONTEND_BUILD_ID,
        },
        cache: 'no-store',
      });
      if (repRes.ok) {
        const parsedRep = await repRes.json();
        monthlyReports = Array.isArray(parsedRep?.data)
          ? parsedRep.data
          : Array.isArray(parsedRep)
          ? parsedRep
          : [];
      }
    } catch {
      // Gracefully ignore if not available
    }

    const mergedUser = {
      ...rawUser,
      home: homeData,
      monthly_reports: monthlyReports,
      has_attendance_today: homeData?.has_attendance ?? rawUser?.has_attendance ?? false,
      is_holiday_today: homeData?.is_holiday ?? false,
      is_off_day_today: homeData?.is_scheduled_off_day ?? false,
    };

    return NextResponse.json({
      success: true,
      data: mergedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gagal memuat profil pengguna' },
      { status: 500 }
    );
  }
}
