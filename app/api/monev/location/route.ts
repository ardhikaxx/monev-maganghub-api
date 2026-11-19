import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Coba ipapi.co
    try {
      const res = await fetch('https://ipapi.co/json/', {
        cache: 'no-store',
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.latitude && data?.longitude) {
          return NextResponse.json({
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude),
            city: data.city || '',
            region: data.region || '',
            country: data.country_name || 'Indonesia',
          });
        }
      }
    } catch {}

    // Fallback freeipapi.com
    try {
      const res2 = await fetch('https://freeipapi.com/api/json', {
        cache: 'no-store',
      });
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2?.latitude && data2?.longitude) {
          return NextResponse.json({
            lat: parseFloat(data2.latitude),
            lng: parseFloat(data2.longitude),
            city: data2.cityName || '',
            region: data2.regionName || '',
            country: data2.countryName || 'Indonesia',
          });
        }
      }
    } catch {}

    // Default Surabaya jika offline
    return NextResponse.json({
      lat: -7.257472,
      lng: 112.75209,
      city: 'Surabaya',
      region: 'Jawa Timur',
      country: 'Indonesia',
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        lat: -7.257472,
        lng: 112.75209,
        city: 'Surabaya',
        region: 'Jawa Timur',
        country: 'Indonesia',
      },
      { status: 200 }
    );
  }
}
