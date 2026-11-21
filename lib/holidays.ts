import { HolidayItem, HolidayInfo, MonevUser } from '@/types/monev';
import { getTodayDateString } from '@/lib/monev';

/**
 * Daftar Hari Libur Nasional & Cuti Bersama Indonesia (2025 - 2027)
 * Sebagai dataset referensi bawaan jika API Kemnaker sedang memuat atau offline.
 */
export const INDONESIAN_NATIONAL_HOLIDAYS: HolidayItem[] = [
  // 2025
  { date: '2025-01-01', name: 'Tahun Baru 2025 Masehi', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-01-27', name: "Isra Mi'raj Nabi Muhammad SAW", scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-01-28', name: 'Cuti Bersama Tahun Baru Imlek', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-01-29', name: 'Tahun Baru Imlek 2576 Kongzili', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-03-28', name: 'Cuti Bersama Hari Suci Nyepi', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-03-29', name: 'Hari Suci Nyepi (Tahun Baru Saka 1947)', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-03-31', name: 'Hari Raya Idul Fitri 1446 H', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-04-01', name: 'Hari Raya Idul Fitri 1446 H', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-04-02', name: 'Cuti Bersama Idul Fitri 1446 H', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-04-03', name: 'Cuti Bersama Idul Fitri 1446 H', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-04-04', name: 'Cuti Bersama Idul Fitri 1446 H', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-04-07', name: 'Cuti Bersama Idul Fitri 1446 H', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-04-18', name: 'Wafat Yesus Kristus', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-04-20', name: 'Kebangkitan Yesus Kristus (Paskah)', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-05-01', name: 'Hari Buruh Internasional', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-05-12', name: 'Hari Raya Waisak 2569 BE', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-05-13', name: 'Cuti Bersama Hari Raya Waisak', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-05-29', name: 'Kenaikan Yesus Kristus', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-05-30', name: 'Cuti Bersama Kenaikan Yesus Kristus', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-06-01', name: 'Hari Lahir Pancasila', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-06-06', name: 'Hari Raya Idul Adha 1446 H', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-06-09', name: 'Cuti Bersama Idul Adha 1446 H', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-06-27', name: '1 Muharram (Tahun Baru Islam 1447 H)', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-08-17', name: 'Hari Kemerdekaan Republik Indonesia Ke-80', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-09-05', name: 'Maulid Nabi Muhammad SAW', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-12-25', name: 'Hari Raya Natal', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2025-12-26', name: 'Cuti Bersama Hari Raya Natal', scope: 'NATIONAL', type: 'NATIONAL' },

  // 2026
  { date: '2026-01-01', name: 'Tahun Baru 2026 Masehi', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-01-16', name: "Isra Mi'raj Nabi Muhammad SAW", scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-02-16', name: 'Cuti Bersama Tahun Baru Imlek', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-02-17', name: 'Tahun Baru Imlek 2577 Kongzili', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-03-18', name: 'Cuti Bersama Hari Suci Nyepi', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-03-19', name: 'Hari Suci Nyepi (Tahun Baru Saka 1948)', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-03-20', name: 'Hari Raya Idul Fitri 1447 H', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-03-21', name: 'Hari Raya Idul Fitri 1447 H', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-03-23', name: 'Cuti Bersama Hari Raya Idul Fitri', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-03-24', name: 'Cuti Bersama Hari Raya Idul Fitri', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-04-03', name: 'Wafat Yesus Kristus', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-04-05', name: 'Kebangkitan Yesus Kristus (Paskah)', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-05-01', name: 'Hari Buruh Internasional', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-05-14', name: 'Kenaikan Yesus Kristus', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-05-15', name: 'Cuti Bersama Kenaikan Yesus Kristus', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-05-27', name: 'Hari Raya Idul Adha 1447 H', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-05-31', name: 'Hari Raya Waisak 2570 BE', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-06-01', name: 'Hari Lahir Pancasila', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-06-16', name: '1 Muharram (Tahun Baru Islam 1448 H)', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-08-17', name: 'Hari Kemerdekaan Republik Indonesia Ke-81', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-08-25', name: 'Maulid Nabi Muhammad SAW', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-12-25', name: 'Hari Raya Natal', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2026-12-26', name: 'Cuti Bersama Hari Raya Natal', scope: 'NATIONAL', type: 'NATIONAL' },

  // 2027
  { date: '2027-01-01', name: 'Tahun Baru 2027 Masehi', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2027-01-06', name: "Isra Mi'raj Nabi Muhammad SAW", scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2027-02-06', name: 'Tahun Baru Imlek 2578 Kongzili', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2027-03-09', name: 'Hari Raya Idul Fitri 1448 H', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2027-03-10', name: 'Hari Raya Idul Fitri 1448 H', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2027-03-26', name: 'Wafat Yesus Kristus', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2027-04-08', name: 'Hari Suci Nyepi (Tahun Baru Saka 1949)', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2027-05-01', name: 'Hari Buruh Internasional', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2027-05-06', name: 'Kenaikan Yesus Kristus', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2027-05-17', name: 'Hari Raya Idul Adha 1448 H', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2027-05-20', name: 'Hari Raya Waisak 2571 BE', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2027-06-01', name: 'Hari Lahir Pancasila', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2027-06-06', name: '1 Muharram (Tahun Baru Islam 1449 H)', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2027-08-17', name: 'Hari Kemerdekaan Republik Indonesia Ke-82', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2027-08-15', name: 'Maulid Nabi Muhammad SAW', scope: 'NATIONAL', type: 'NATIONAL' },
  { date: '2027-12-25', name: 'Hari Raya Natal', scope: 'NATIONAL', type: 'NATIONAL' },
];

const DAYS_EN = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

const DAYS_ID = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export function cleanCode(code?: string | number | null): string {
  return String(code || '').replace(/\./g, '').trim();
}

export function getDayOfWeekEnglish(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
    const date = new Date(y, (m || 1) - 1, d || 1);
    return DAYS_EN[date.getDay()] ?? 'SUNDAY';
  } catch {
    return 'SUNDAY';
  }
}

export function getDayOfWeekIndo(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
    const date = new Date(y, (m || 1) - 1, d || 1);
    return DAYS_ID[date.getDay()] ?? 'Minggu';
  } catch {
    return 'Minggu';
  }
}

/**
 * Memfilter daftar hari libur Kemnaker yang berlaku untuk peserta magang
 * berdasarkan wilayah penempatan (Nasional, Provinsi, Kabupaten/Kota)
 * Menggunakan algoritma resmi Kemnaker MagangHub.
 */
export function filterHolidaysForUser(
  holidays: HolidayItem[],
  user?: MonevUser | null
): HolidayItem[] {
  if (!Array.isArray(holidays) || holidays.length === 0) {
    return [];
  }

  const userProv = cleanCode(
    user?.internship_location_province_code || user?.home?.internship_location_province_code
  );
  const userReg = cleanCode(
    user?.internship_location_regency_code || user?.home?.internship_location_regency_code
  );

  const matched = holidays.filter((h) => {
    if (!h || !h.date) return false;
    const scope = (h.scope || 'NATIONAL').toUpperCase();
    if (scope === 'NATIONAL') return true;
    if (!userProv && !userReg) return false;
    if (scope === 'PROVINCE') {
      return !!(userProv && cleanCode(h.province_code) === userProv);
    }
    return !!(userReg && cleanCode(h.regency_code) === userReg);
  });

  const scopeWeight: Record<string, number> = {
    NATIONAL: 1,
    PROVINCE: 2,
    REGENCY: 3,
  };

  const typeWeight: Record<string, number> = {
    NATIONAL: 1,
    REGIONAL: 2,
    FORCE_MAJEURE: 3,
  };

  // Prioritaskan level wilayah spesifik dan jenis libur tertinggi
  const byDate = new Map<string, HolidayItem>();
  for (const item of matched) {
    const dateKey = String(item.date).slice(0, 10);
    const prev = byDate.get(dateKey);
    if (!prev) {
      byDate.set(dateKey, item);
      continue;
    }

    const prevScopeW = scopeWeight[(prev.scope || 'NATIONAL').toUpperCase()] || 1;
    const currScopeW = scopeWeight[(item.scope || 'NATIONAL').toUpperCase()] || 1;

    if (currScopeW > prevScopeW) {
      byDate.set(dateKey, item);
    } else if (currScopeW === prevScopeW) {
      const prevTypeW = typeWeight[(prev.type || 'NATIONAL').toUpperCase()] || 1;
      const currTypeW = typeWeight[(item.type || 'NATIONAL').toUpperCase()] || 1;
      if (currTypeW > prevTypeW) {
        byDate.set(dateKey, item);
      }
    }
  }

  return Array.from(byDate.values());
}

/**
 * Mengecek apakah tanggal tertentu merupakan Hari Libur atau Jadwal Libur Posisi.
 * Menghasilkan informasi lengkap dan keterangan resmi Kemnaker.
 */
export function getHolidayForDate(
  dateStr: string,
  apiHolidays: HolidayItem[] = [],
  user: MonevUser | null = null
): HolidayInfo | null {
  if (!dateStr) return null;

  const targetDate = String(dateStr).slice(0, 10);
  const todayStr = getTodayDateString();
  const isToday = targetDate === todayStr;

  // 1. Jika tanggal adalah HARI INI, utamakan data real-time Kemnaker /users/me/home
  if (isToday) {
    if (user?.is_holiday_today || user?.holiday_today) {
      const hol = user?.holiday_today;
      const holidayName = hol?.name || 'Hari Libur Nasional / Kemnaker';
      return {
        isHoliday: true,
        isOffDay: false,
        isToday: true,
        date: targetDate,
        name: holidayName,
        type: 'NATIONAL_HOLIDAY',
        scopeLabel: hol?.scope === 'PROVINCE' ? 'Provinsi' : hol?.scope === 'REGENCY' ? 'Kabupaten/Kota' : 'Nasional',
        sourceLabel: 'Ditetapkan oleh Kemnaker',
        description: `${holidayName}. Laporan harian dan kehadiran tidak perlu diisi.`,
        justification: hol?.justification || '',
      };
    }

    if (user?.is_off_day_today) {
      const dayName = getDayOfWeekIndo(targetDate);
      return {
        isHoliday: false,
        isOffDay: true,
        isToday: true,
        date: targetDate,
        name: `Jadwal Libur Posisi (${dayName})`,
        type: 'SCHEDULED_OFF_DAY',
        scopeLabel: 'Posisi',
        sourceLabel: 'Jadwal libur posisi',
        description: 'Hari ini termasuk jadwal libur posisi Anda. Laporan harian dan kehadiran tidak perlu diisi.',
      };
    }
  }

  // 2. Periksa apakah tanggal cocok dengan API Holidays Kemnaker
  const filteredApiHolidays = filterHolidaysForUser(apiHolidays, user);
  const foundApi = filteredApiHolidays.find(
    (h) => String(h.date).slice(0, 10) === targetDate
  );

  if (foundApi) {
    const scopeUpper = (foundApi.scope || 'NATIONAL').toUpperCase();
    const scopeLabel =
      scopeUpper === 'PROVINCE'
        ? 'Provinsi'
        : scopeUpper === 'REGENCY'
        ? 'Kabupaten/Kota'
        : 'Nasional';

    return {
      isHoliday: true,
      isOffDay: false,
      isToday,
      date: targetDate,
      name: foundApi.name || 'Hari Libur',
      type: scopeUpper === 'NATIONAL' ? 'NATIONAL_HOLIDAY' : 'REGIONAL_HOLIDAY',
      scopeLabel,
      sourceLabel: 'Ditetapkan oleh Kemnaker',
      description: `${foundApi.name}. Laporan harian dan kehadiran tidak perlu diisi.`,
      justification: foundApi.justification || '',
    };
  }

  // 3. Periksa dataset bawaan Hari Libur Nasional SKB 3 Menteri
  const foundNational = INDONESIAN_NATIONAL_HOLIDAYS.find(
    (h) => h.date === targetDate
  );

  if (foundNational) {
    return {
      isHoliday: true,
      isOffDay: false,
      isToday,
      date: targetDate,
      name: foundNational.name,
      type: 'NATIONAL_HOLIDAY',
      scopeLabel: 'Nasional',
      sourceLabel: 'Hari Libur Nasional',
      description: `${foundNational.name}. Laporan harian dan kehadiran tidak perlu diisi.`,
    };
  }

  // 4. Periksa jadwal libur posisi (Weekend / Off Days)
  // Default off_days di Kemnaker MagangHub adalah SATURDAY dan SUNDAY
  const userOffDays = (user?.off_days && user.off_days.length > 0)
    ? user.off_days
    : ['SATURDAY', 'SUNDAY'];

  const dayOfWeekEn = getDayOfWeekEnglish(targetDate);
  const isOffDay = userOffDays.some(
    (d) => String(d).trim().toUpperCase() === dayOfWeekEn
  );

  if (isOffDay) {
    const dayName = getDayOfWeekIndo(targetDate);
    const dayPrefix = isToday ? 'Hari ini' : `Hari ${dayName}`;
    return {
      isHoliday: false,
      isOffDay: true,
      isToday,
      date: targetDate,
      name: `Jadwal Libur Posisi (${dayName})`,
      type: 'SCHEDULED_OFF_DAY',
      scopeLabel: 'Posisi',
      sourceLabel: 'Jadwal libur posisi',
      description: `${dayPrefix} termasuk jadwal libur posisi Anda. Laporan harian dan kehadiran tidak perlu diisi.`,
    };
  }

  return null;
}
