import { NextRequest, NextResponse } from 'next/server';
import { MONEV_API_BASE_URL, DEFAULT_FRONTEND_BUILD_ID } from '@/lib/monev';
import { INDONESIAN_NATIONAL_HOLIDAYS, getHolidayForDate } from '@/lib/holidays';
import { HolidayItem } from '@/types/monev';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const { searchParams } = new URL(req.url);
    const specificDate = searchParams.get('date');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '100';

    let holidays: HolidayItem[] = [];

    // Jika ada token otorisasi, ambil data real-time resmi dari Kemnaker
    if (authHeader) {
      try {
        const query = new URLSearchParams();
        query.set('page', page);
        query.set('limit', limit);

        const res = await fetch(`${MONEV_API_BASE_URL}/holidays?${query.toString()}`, {
          headers: {
            Authorization: authHeader,
            'X-Frontend-Build-ID': DEFAULT_FRONTEND_BUILD_ID,
          },
          cache: 'no-store',
        });

        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json)
            ? json
            : [];
          holidays = items;
        }
      } catch {
        // Fallback ke dataset bawaan
      }
    }

    // Gabungkan dengan daftar Hari Libur Nasional standar untuk menjamin kelengkapan
    const combinedMap = new Map<string, HolidayItem>();
    for (const h of INDONESIAN_NATIONAL_HOLIDAYS) {
      combinedMap.set(h.date, h);
    }
    for (const h of holidays) {
      if (h && h.date) {
        const key = String(h.date).slice(0, 10);
        combinedMap.set(key, { ...combinedMap.get(key), ...h });
      }
    }

    const allHolidays = Array.from(combinedMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Jika pengguna meminta pengecekan spesifik pada suatu tanggal
    if (specificDate) {
      const holidayInfo = getHolidayForDate(specificDate, allHolidays, null);
      return NextResponse.json({
        success: true,
        date: specificDate,
        is_holiday_or_off_day: !!holidayInfo,
        data: holidayInfo,
      });
    }

    return NextResponse.json({
      success: true,
      data: allHolidays,
      total: allHolidays.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: true,
        data: INDONESIAN_NATIONAL_HOLIDAYS,
        error: error?.message,
      },
      { status: 200 }
    );
  }
}
