import { NextRequest, NextResponse } from 'next/server';
import { MONEV_API_BASE_URL, DEFAULT_FRONTEND_BUILD_ID, parseJwt } from '@/lib/monev';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token otorisasi diperlukan' }, { status: 401 });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const jwtPayload = parseJwt(token);

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

    // 2. Fetch /users/me/home for real-time status and extra context
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
      // Gracefully ignore
    }

    // 3. Fetch /schedules for placement period
    let schedulesData: any = null;
    try {
      const schedRes = await fetch(`${MONEV_API_BASE_URL}/schedules`, {
        headers: {
          Authorization: authHeader,
          'X-Frontend-Build-ID': DEFAULT_FRONTEND_BUILD_ID,
        },
        cache: 'no-store',
      });
      if (schedRes.ok) {
        const parsedSched = await schedRes.json();
        schedulesData = parsedSched?.data || parsedSched;
      }
    } catch {
      // Gracefully ignore
    }

    // 4. Fetch /monthly-reports for evaluations
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
      // Gracefully ignore
    }

    // Ambil dan satukan seluruh alias data informasi magang
    const company =
      rawUser.internship_company ||
      rawUser.company ||
      rawUser.company_name ||
      rawUser.partner_name ||
      rawUser.agency_name ||
      homeData?.internship_company ||
      homeData?.company ||
      '';

    const position =
      rawUser.job_role ||
      rawUser.position ||
      rawUser.role_name ||
      rawUser.internship_position ||
      homeData?.job_role ||
      homeData?.position ||
      '';

    const location =
      rawUser.internship_location_regency_name ||
      rawUser.internship_location ||
      rawUser.location ||
      rawUser.regency_name ||
      rawUser.city ||
      homeData?.internship_location_regency_name ||
      homeData?.location ||
      '';

    const startDate =
      rawUser.internship_start_date ||
      rawUser.start_date ||
      homeData?.internship_start_date ||
      homeData?.period_start ||
      '';

    const endDate =
      rawUser.internship_end_date ||
      rawUser.end_date ||
      homeData?.internship_end_date ||
      homeData?.period_end ||
      '';

    const batchName =
      rawUser.internship_batch_name ||
      rawUser.batch_name ||
      rawUser.batch ||
      homeData?.internship_batch_name ||
      homeData?.batch_name ||
      '';

    const mentor =
      rawUser.mentor_name ||
      rawUser.mentor?.name ||
      (typeof rawUser.mentor === 'string' ? rawUser.mentor : '') ||
      homeData?.mentor_name ||
      '';

    const institution =
      rawUser.institution_name ||
      rawUser.university ||
      rawUser.school ||
      homeData?.institution_name ||
      '';

    const mergedUser = {
      ...rawUser,
      // Informasi Magang Resmi Kemnaker (dengan alias lengkap)
      internship_company: company,
      company_name: company,
      company: company,

      job_role: position,
      position: position,

      internship_location_regency_name: location,
      location: location,

      internship_start_date: startDate,
      internship_end_date: endDate,

      internship_batch_name: batchName,
      batch_name: batchName,

      mentor_name: mentor,
      institution_name: institution,

      jwt_payload: jwtPayload,
      home: homeData,
      schedules: schedulesData,
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
