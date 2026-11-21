'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AttendanceStatus,
  AttendanceSubmissionPayload,
  MonevUser,
  HolidayItem,
  HolidayInfo,
} from '@/types/monev';
import {
  getTodayDateString,
  formatDateIndo,
} from '@/lib/monev';
import { getHolidayForDate } from '@/lib/holidays';
import { POPULAR_CITIES, RegencyCity } from '@/lib/cities';
import {
  Send,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Check,
  Search,
  X,
  ExternalLink,
  Shield,
  HelpCircle,
  Coffee,
  Calendar as CalendarIcon,
  Info,
} from 'lucide-react';

interface ReportFormProps {
  token: string;
  user: MonevUser | null;
  onSuccess: () => void;
}

export default function ReportForm({ token, user, onSuccess }: ReportFormProps) {
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [date, setDate] = useState<string>('');
  const [status, setStatus] = useState<AttendanceStatus>('PRESENT');
  const [activityLog, setActivityLog] = useState('');
  const [lessonLearned, setLessonLearned] = useState('');
  const [obstacles, setObstacles] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    setDate(getTodayDateString());
  }, []);

  // Quick AI Prompt states
  const [quickPrompt, setQuickPrompt] = useState('');
  const [noObstacles, setNoObstacles] = useState(true);
  const [customObstacle, setCustomObstacle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Geolocation states
  const [includeGeo, setIncludeGeo] = useState(true);
  const [coords, setCoords] = useState<{
    lat: number;
    lng: number;
    label?: string;
  } | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Holidays data states
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);

  // Restore Location on mount
  useEffect(() => {
    try {
      const savedCoords = localStorage.getItem('monev-saved-coords');
      if (savedCoords) {
        const parsed = JSON.parse(savedCoords);
        if (parsed.lat && parsed.lng) {
          setCoords({
            lat: parseFloat(parsed.lat),
            lng: parseFloat(parsed.lng),
            label: parsed.label || 'Lokasi Tersimpan',
          });
          return;
        }
      }
    } catch {}

    // Default ke Bondowoso, Jawa Timur
    const bondowoso = POPULAR_CITIES[0];
    applyCity(bondowoso);
  }, []);

  const applyCity = (city: RegencyCity) => {
    const newCoord = {
      lat: city.lat,
      lng: city.lng,
      label: `${city.name}, ${city.province}`,
    };
    setCoords(newCoord);
    localStorage.setItem('monev-saved-coords', JSON.stringify(newCoord));
    setShowCityPicker(false);
  };

  // Ambil daftar hari libur dari endpoint API Kemnaker / Monev MagangHub
  useEffect(() => {
    let isMounted = true;
    const fetchHolidaysData = async () => {
      setIsLoadingHolidays(true);
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/monev/holidays', { headers });
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data) && isMounted) {
            setHolidays(json.data);
          }
        }
      } catch {
        // Fallback ditangani otomatis oleh getHolidayForDate
      } finally {
        if (isMounted) setIsLoadingHolidays(false);
      }
    };

    fetchHolidaysData();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Evaluasi keterangan hari libur atau jadwal libur posisi untuk tanggal terpilih
  const holidayInfo: HolidayInfo | null = React.useMemo(() => {
    if (!date) return null;
    return getHolidayForDate(date, holidays, user);
  }, [date, holidays, user]);

  const filteredCities = POPULAR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.province.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Handler Generate AI Otomatis
  const handleGenerateAI = async () => {
    if (!quickPrompt.trim()) {
      setAlertInfo({
        type: 'error',
        message: 'Mohon tuliskan kegiatan singkat hari ini terlebih dahulu sebelum men-generate.',
      });
      return;
    }

    setIsGenerating(true);
    setAlertInfo(null);

    try {
      const res = await fetch('/api/monev/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: quickPrompt.trim(),
          no_obstacles: noObstacles,
          custom_obstacle: noObstacles ? '' : customObstacle.trim(),
          role: user?.job_role || user?.position || 'Peserta Magang',
          company: user?.internship_company || user?.company || user?.company_name || 'Mitra Kemnaker',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json?.error || 'Gagal menyusun laporan otomatis');
      }

      setActivityLog(json.data.activity_log || '');
      setLessonLearned(json.data.lesson_learned || '');
      setObstacles(json.data.obstacles || '');

      const totalWords = [
        json.data.activity_log || '',
        json.data.lesson_learned || '',
        json.data.obstacles || '',
      ]
        .join(' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

      setAlertInfo({
        type: 'success',
        message:
          `Laporan berhasil dibuat otomatis oleh AI (${totalWords} kata, padat & profesional)! Semua kolom telah memenuhi standar minimal 100 karakter. Silakan tinjau dan centang persetujuan di bawah.`,
      });
    } catch (err: any) {
      setAlertInfo({
        type: 'error',
        message: err?.message || 'Terjadi kesalahan saat men-generate laporan.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Character validations
  const MIN_CHARS = 100;
  const isActivityValid = activityLog.trim().length >= MIN_CHARS;
  const isLessonValid = lessonLearned.trim().length >= MIN_CHARS;
  const isObstaclesValid = obstacles.trim().length >= MIN_CHARS;
  const isLeaveReasonValid = leaveReason.trim().length >= MIN_CHARS;

  const isFormValid =
    status === 'PRESENT'
      ? isActivityValid && isLessonValid && isObstaclesValid && isAgreed
      : status === 'ON_LEAVE'
      ? isLeaveReasonValid && isAgreed
      : isAgreed; // ABSENT

  const resetForm = () => {
    setQuickPrompt('');
    setCustomObstacle('');
    setNoObstacles(true);
    setActivityLog('');
    setLessonLearned('');
    setObstacles('');
    setLeaveReason('');
    setIsAgreed(false);
    setAlertInfo(null);
  };

  // Submit report to Kemnaker
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertInfo(null);

    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      const payload: AttendanceSubmissionPayload = {
        date,
        status,
        ...(status === 'PRESENT'
          ? {
              activity_log: activityLog.trim(),
              lesson_learned: lessonLearned.trim(),
              obstacles: obstacles.trim(),
              ...(includeGeo && coords
                ? { latitude: coords.lat, longitude: coords.lng }
                : {}),
            }
          : status === 'ON_LEAVE'
          ? {
              leave_reason: leaveReason.trim(),
              participant_id: user?.id,
            }
          : {
              participant_id: user?.id,
            }),
      };

      const res = await fetch('/api/monev/attendances', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result?.message || result?.error || 'Gagal menyimpan laporan'
        );
      }

      // Kosongkan seluruh isian formulir setelah berhasil kirim
      setActivityLog('');
      setLessonLearned('');
      setObstacles('');
      setQuickPrompt('');
      setCustomObstacle('');
      setNoObstacles(true);
      setLeaveReason('');
      setIsAgreed(false);

      setAlertInfo({
        type: 'success',
        message:
          status === 'PRESENT'
            ? 'Laporan aktivitas dan kehadiran berhasil dikirim ke MagangHub Kemnaker!'
            : 'Data kehadiran berhasil disimpan ke MagangHub Kemnaker.',
      });

      // Scroll ke atas agar notifikasi terlihat jelas di HP maupun Desktop
      if (formContainerRef.current) {
        formContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      onSuccess();
    } catch (err: any) {
      setAlertInfo({
        type: 'error',
        message: err?.message || 'Terjadi kesalahan saat mengirim laporan.',
      });
      if (formContainerRef.current) {
        formContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCharIndicator = (text: string) => {
    const currentLength = text.trim().length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const isPassing = currentLength >= MIN_CHARS;
    const percent = Math.min(100, Math.round((currentLength / MIN_CHARS) * 100));

    return (
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="h-1 w-14 sm:w-20 overflow-hidden rounded-full bg-zinc-200 shrink-0">
            <div
              className={`h-full transition-all duration-300 ${
                isPassing ? 'bg-zinc-950' : 'bg-zinc-400'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className={`font-semibold truncate ${isPassing ? 'text-zinc-950' : 'text-zinc-500'}`}>
            {isPassing ? (
              <span className="flex items-center gap-0.5">
                <Check className="h-3 w-3 shrink-0" /> Memenuhi
              </span>
            ) : (
              `Kurang ${MIN_CHARS - currentLength} lagi`
            )}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-zinc-500 text-[10px] sm:text-[11px] shrink-0">
          <span className="font-semibold text-zinc-800">{wordCount} kata</span>
          <span>•</span>
          <span>{currentLength} kar (min. {MIN_CHARS})</span>
        </div>
      </div>
    );
  };

  return (
    <div ref={formContainerRef} className="glass-card p-4 sm:p-7 md:p-8">
      {/* Form Header (Glassmorphic) */}
      <div className="mb-4 sm:mb-6 flex flex-col gap-2 border-b border-zinc-200/60 pb-3 sm:pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-zinc-900 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-950">
              Tambah Laporan Harian
            </h2>
          </div>
        </div>

        <div className="inline-flex self-start sm:self-auto glass-pill rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold text-zinc-800">
          {formatDateIndo(date)}
        </div>
      </div>

      {alertInfo && (
        <div
          className={`mb-4 sm:mb-6 flex items-start justify-between gap-2.5 rounded-xl glass-card p-3 sm:p-4 text-xs sm:text-sm ${
            alertInfo.type === 'success'
              ? 'border-emerald-200/80 bg-emerald-50/70 text-emerald-950'
              : 'border-zinc-300 bg-white/70 text-zinc-950'
          }`}
        >
          <div className="flex items-start gap-2.5 flex-1">
            {alertInfo.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" />
            )}
            <div>
              <p className="font-bold">
                {alertInfo.type === 'success' ? 'Laporan Terkirim' : 'Pemberitahuan'}
              </p>
              <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">{alertInfo.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAlertInfo(null)}
            className="text-zinc-400 hover:text-zinc-700 p-0.5 shrink-0"
            title="Tutup pesan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Jika Hari Libur: Tampilkan HANYA Keterangan Hari Libur Tanpa Ada Inputan Sama Sekali */}
      {holidayInfo ? (
        <div className="flex flex-col items-center justify-center text-center py-10 sm:py-16 px-4 rounded-2xl glass-card">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl glass-dark text-white shadow-md mb-4">
            {holidayInfo.isHoliday ? (
              <CalendarIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            ) : (
              <Coffee className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            )}
          </div>

          <h3 className="text-lg sm:text-2xl font-black text-zinc-950 max-w-md">
            {holidayInfo.name}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-zinc-600 max-w-lg leading-relaxed font-medium">
            {holidayInfo.description}
          </p>

          <div className="mt-5 max-w-md rounded-xl glass-pill p-3.5 sm:p-4 text-xs text-zinc-600 leading-relaxed text-left">
            <p className="font-bold text-zinc-900 mb-1 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
              <span>Petunjuk Sistem Kemnaker:</span>
            </p>
            <p>
              Pada hari libur, sistem MagangHub Kemnaker tidak membuka pengisian laporan kegiatan harian maupun presensi kehadiran. Anda dapat beristirahat hari ini tanpa perlu mengisi formulir laporan.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Tanggal & Status */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-700">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                className="w-full rounded-xl glass-input px-3.5 py-2.5 text-xs sm:text-sm font-medium text-zinc-900 focus:outline-none"
              >
                <option value="PRESENT">Hadir (PRESENT)</option>
                <option value="ON_LEAVE">Izin / Sakit (ON_LEAVE)</option>
                <option value="ABSENT">Alfa (ABSENT)</option>
              </select>
            </div>
          </div>

        {/* Jika Hadir: Bagian Generator AI & 3 Textarea */}
        {status === 'PRESENT' && (
          <div className="space-y-3 sm:space-y-4 rounded-2xl glass-pill p-3 sm:p-5">
            {/* FITUR 1: AI Assistant Agent & Checkbox Tidak Ada Kendala */}
            <div className="rounded-xl glass-card p-3.5 sm:p-4 space-y-2.5 sm:space-y-3">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 border-b border-zinc-200/60 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-zinc-950">
                  <Sparkles className="h-4 w-4 text-zinc-900 shrink-0" />
                  <span>AI Assistant Agent (Generate Laporan)</span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-zinc-500 font-medium self-start xs:self-auto">
                  Aktivitas, Pembelajaran & Kendala (min. 100 kar)
                </span>
              </div>

              {/* Input Singkat Kegiatan */}
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Kegiatan Singkat Hari Ini:
                </label>
                <textarea
                  rows={2}
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  placeholder="Contoh: Koordinasi tim dan pengerjaan modul fitur..."
                  className="w-full rounded-xl glass-input p-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none"
                />
              </div>

              {/* Checkbox "Tidak Ada Kendala" */}
              <div className="rounded-lg glass-pill p-3 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noObstacles}
                    onChange={(e) => setNoObstacles(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-400 text-zinc-950 focus:ring-0 shrink-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-zinc-900 select-none">
                    Tidak ada kendala hari ini
                  </span>
                </label>

                {!noObstacles && (
                  <div className="pl-6 pt-1">
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Kendala Singkat:
                    </label>
                    <input
                      type="text"
                      value={customObstacle}
                      onChange={(e) => setCustomObstacle(e.target.value)}
                      placeholder="Contoh: Terjadi kendala koneksi internet..."
                      className="w-full rounded-lg glass-input px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Tombol Eksekusi Generate */}
              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !quickPrompt.trim()}
                  className="flex items-center justify-center gap-2 rounded-xl glass-dark hover:bg-black disabled:opacity-40 text-white px-4 py-2 text-xs font-bold transition shadow-md w-full sm:w-auto cursor-pointer"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Menyusun via AI Agent...' : 'Susun Laporan via AI Agent'}</span>
                </button>
              </div>
            </div>

            {/* 1. Uraian Aktivitas */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-zinc-900">
                  1. Aktivitas
                </label>
                <span className="text-[10px] sm:text-[11px] text-zinc-400">Min. 100 karakter</span>
              </div>
              <textarea
                rows={3}
                value={activityLog}
                onChange={(e) => setActivityLog(e.target.value)}
                placeholder="Minimal 100 karakter..."
                className="w-full rounded-xl glass-input p-2.5 sm:p-3 text-xs sm:text-sm text-zinc-900 focus:outline-none"
              />
              {renderCharIndicator(activityLog)}
            </div>

            {/* 2. Pembelajaran */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-zinc-900">
                  2. Pembelajaran
                </label>
                <span className="text-[10px] sm:text-[11px] text-zinc-400">Min. 100 karakter</span>
              </div>
              <textarea
                rows={3}
                value={lessonLearned}
                onChange={(e) => setLessonLearned(e.target.value)}
                placeholder="Minimal 100 karakter..."
                className="w-full rounded-xl glass-input p-2.5 sm:p-3 text-xs sm:text-sm text-zinc-900 focus:outline-none"
              />
              {renderCharIndicator(lessonLearned)}
            </div>

            {/* 3. Kendala */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-zinc-900">
                  3. Kendala
                </label>
                <span className="text-[10px] sm:text-[11px] text-zinc-400">Min. 100 karakter</span>
              </div>
              <textarea
                rows={3}
                value={obstacles}
                onChange={(e) => setObstacles(e.target.value)}
                placeholder="Minimal 100 karakter..."
                className="w-full rounded-xl glass-input p-2.5 sm:p-3 text-xs sm:text-sm text-zinc-900 focus:outline-none"
              />
              {renderCharIndicator(obstacles)}
            </div>

            {/* Lokasi Presensi (Glassmorphic) */}
            <div className="border-t border-zinc-200/60 pt-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl glass-pill p-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-900 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg glass-dark text-white shrink-0">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-900 truncate">
                      <span>Lokasi:</span>
                      <span className="text-zinc-700 font-semibold truncate">
                        {coords?.label || 'Kabupaten Bondowoso, Jawa Timur'}
                      </span>
                    </div>
                    {coords && (
                      <p className="font-mono text-[10px] text-zinc-400">
                        {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCityPicker(true)}
                  className="self-start sm:self-auto flex items-center justify-center rounded-lg glass-pill px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:text-zinc-950 transition cursor-pointer"
                >
                  <span>Ganti Kota</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Pemilih Kota Instan (Glassmorphic Dialog) */}
        {showCityPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-md p-3 sm:p-4">
            <div className="w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden glass-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-200/60 px-4 py-3 sm:px-6 sm:py-4 shrink-0">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-zinc-900" />
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900">
                    Pilih Kota Penempatan
                  </h3>
                </div>
                <button
                  onClick={() => setShowCityPicker(false)}
                  className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 sm:p-4 border-b border-zinc-200/60 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Ketik nama kota (Bondowoso, Jember...)"
                    className="w-full rounded-xl glass-input pl-9 pr-4 py-2 text-xs text-zinc-900 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 divide-y divide-zinc-100/60">
                {filteredCities.map((city, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyCity(city)}
                    className="w-full flex items-center justify-between p-2.5 sm:p-3 text-left hover:bg-white/60 rounded-lg transition cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-zinc-900">
                        {city.name}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {city.province}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {city.lat.toFixed(4)}, {city.lng.toFixed(4)}
                    </span>
                  </button>
                ))}
              </div>

              <div className="border-t border-zinc-200/60 px-4 py-2.5 sm:px-6 sm:py-3 text-right shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCityPicker(false)}
                  className="rounded-lg glass-pill px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}



        {/* Jika Hari Libur: Keterangan DAYOFF */}
        {status === 'DAYOFF' && (
          <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-zinc-950 font-bold text-xs sm:text-sm">
              <Coffee className="h-4 w-4 text-zinc-900" />
              <span>Presensi Hari Libur (DAYOFF)</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Anda memilih status <strong>Hari Libur (DAYOFF)</strong>. Presensi akan dicatat sebagai libur dan Anda tidak perlu mengisi kolom uraian kegiatan, pembelajaran, maupun kendala.
            </p>
          </div>
        )}

        {/* Jika Izin: Alasan */}
        {status === 'ON_LEAVE' && (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5 space-y-3">
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-zinc-900">
                Alasan Tidak Hadir
              </label>
              <span className="text-[11px] text-zinc-400">Minimal 100 Karakter</span>
            </div>
            <textarea
              rows={3}
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="Tulis alasan tidak hadir minimal 100 karakter"
              className="w-full rounded-xl border border-zinc-300 bg-white p-2.5 sm:p-3 text-xs sm:text-sm text-zinc-900 transition focus:border-zinc-950 focus:outline-none"
            />
            {renderCharIndicator(leaveReason)}
          </div>
        )}

        {/* Checkbox Pernyataan */}
        <div className="rounded-xl border border-zinc-300 bg-zinc-50/80 p-3.5 sm:p-4">
          <label className="flex items-center gap-2.5 sm:gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-400 text-zinc-950 focus:ring-0 shrink-0"
            />
            <span className="text-xs text-zinc-800 select-none font-medium">
              Saya menyatakan data laporan ini sudah benar dan siap dikirim.
            </span>
          </label>
        </div>

        {/* Notifikasi Hasil Kirim di Bawah (Langsung terlihat di HP tanpa perlu scroll) */}
        {alertInfo && (
          <div
            className={`flex items-center justify-between gap-2.5 rounded-xl border p-3.5 text-xs sm:text-sm ${
              alertInfo.type === 'success'
                ? 'border-zinc-300 bg-zinc-100 text-zinc-950'
                : 'border-zinc-400 bg-zinc-100 text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2">
              {alertInfo.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-zinc-950" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-zinc-700" />
              )}
              <span className="font-semibold">{alertInfo.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setAlertInfo(null)}
              className="text-zinc-400 hover:text-zinc-700 p-0.5 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tombol Submit & Reset (Glassmorphic) */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-1 sm:pt-2">
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center justify-center gap-1.5 rounded-xl glass-pill px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="flex items-center justify-center gap-2 rounded-xl glass-dark px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-black disabled:opacity-40 transition cursor-pointer"
          >
            {isSubmitting ? (
              <span>Mengirim...</span>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Kirim Laporan</span>
              </>
            )}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
