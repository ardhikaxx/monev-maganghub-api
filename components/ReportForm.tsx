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
  Coffee,
  Calendar as CalendarIcon,
  Info,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';

interface ReportFormProps {
  token: string;
  user: MonevUser | null;
  onSuccess: () => void;
}

const QUICK_PROMPT_SUGGESTIONS = [
  'Koordinasi tim & pengerjaan fitur baru',
  'Pengujian aplikasi, bug fixing & QA',
  'Analisis data & riset kebutuhan pengguna',
  'Penyusunan dokumentasi teknis & laporan',
];

export default function ReportForm({ token, user, onSuccess }: ReportFormProps) {
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [date, setDate]           = useState<string>('');
  const [status, setStatus]       = useState<AttendanceStatus>('PRESENT');
  const [activityLog, setActivityLog]       = useState('');
  const [lessonLearned, setLessonLearned]   = useState('');
  const [obstacles, setObstacles]           = useState('');
  const [leaveReason, setLeaveReason]       = useState('');
  const [isAgreed, setIsAgreed]             = useState(false);

  useEffect(() => { setDate(getTodayDateString()); }, []);

  const [quickPrompt, setQuickPrompt]         = useState('');
  const [noObstacles, setNoObstacles]         = useState(true);
  const [customObstacle, setCustomObstacle]   = useState('');
  const [isGenerating, setIsGenerating]       = useState(false);

  const [includeGeo, setIncludeGeo]           = useState(true);
  const [coords, setCoords]                   = useState<{ lat: number; lng: number; label?: string } | null>(null);
  const [showCityPicker, setShowCityPicker]   = useState(false);
  const [citySearch, setCitySearch]           = useState('');

  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [alertInfo, setAlertInfo]             = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const [holidays, setHolidays]               = useState<HolidayItem[]>([]);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);

  useEffect(() => {
    try {
      const savedCoords = localStorage.getItem('monev-saved-coords');
      if (savedCoords) {
        const parsed = JSON.parse(savedCoords);
        if (parsed.lat && parsed.lng) {
          setCoords({ lat: parseFloat(parsed.lat), lng: parseFloat(parsed.lng), label: parsed.label || 'Lokasi Tersimpan' });
          return;
        }
      }
    } catch {}
    const defaultCity = POPULAR_CITIES[0];
    applyCity(defaultCity);
  }, []);

  const applyCity = (city: RegencyCity) => {
    const newCoord = { lat: city.lat, lng: city.lng, label: `${city.name}, ${city.province}` };
    setCoords(newCoord);
    localStorage.setItem('monev-saved-coords', JSON.stringify(newCoord));
    setShowCityPicker(false);
  };

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
          if (json?.data && Array.isArray(json.data) && isMounted) setHolidays(json.data);
        }
      } catch {}
      finally { if (isMounted) setIsLoadingHolidays(false); }
    };
    fetchHolidaysData();
    return () => { isMounted = false; };
  }, [token]);

  const holidayInfo: HolidayInfo | null = React.useMemo(() => {
    if (!date) return null;
    return getHolidayForDate(date, holidays, user);
  }, [date, holidays, user]);

  const filteredCities = POPULAR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.province.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleGenerateAI = async () => {
    if (!quickPrompt.trim()) {
      setAlertInfo({ type: 'error', message: 'Mohon tuliskan ringkasan kegiatan hari ini terlebih dahulu.' });
      return;
    }
    setIsGenerating(true);
    setAlertInfo(null);
    try {
      const res = await fetch('/api/monev/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: quickPrompt.trim(),
          no_obstacles: noObstacles,
          custom_obstacle: noObstacles ? '' : customObstacle.trim(),
          role: user?.job_role || user?.position || 'Peserta Magang',
          company: user?.internship_company || user?.company || user?.company_name || 'Mitra Kemnaker',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.data) throw new Error(json?.error || 'Gagal menyusun laporan otomatis');
      setActivityLog(json.data.activity_log || '');
      setLessonLearned(json.data.lesson_learned || '');
      setObstacles(json.data.obstacles || '');
      const totalWords = [json.data.activity_log || '', json.data.lesson_learned || '', json.data.obstacles || ''].join(' ').trim().split(/\s+/).filter(Boolean).length;
      setAlertInfo({ type: 'success', message: `Laporan berhasil disusun oleh AI Assistant (${totalWords} kata). Semua poin telah memenuhi batas minimal 100 karakter resmi Kemnaker. Silakan periksa kembali dan centang persetujuan.` });
    } catch (err: any) {
      setAlertInfo({ type: 'error', message: err?.message || 'Terjadi kesalahan saat memproses laporan dengan AI.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const MIN_CHARS = 100;
  const isActivityValid  = activityLog.trim().length >= MIN_CHARS;
  const isLessonValid    = lessonLearned.trim().length >= MIN_CHARS;
  const isObstaclesValid = obstacles.trim().length >= MIN_CHARS;
  const isLeaveReasonValid = leaveReason.trim().length >= MIN_CHARS;

  const isFormValid =
    status === 'PRESENT'  ? isActivityValid && isLessonValid && isObstaclesValid && isAgreed :
    status === 'ON_LEAVE' ? isLeaveReasonValid && isAgreed :
    isAgreed;

  const resetForm = () => {
    setQuickPrompt(''); setCustomObstacle(''); setNoObstacles(true);
    setActivityLog(''); setLessonLearned(''); setObstacles('');
    setLeaveReason(''); setIsAgreed(false); setAlertInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertInfo(null);
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      const payload: AttendanceSubmissionPayload = {
        date, status,
        ...(status === 'PRESENT'
          ? { activity_log: activityLog.trim(), lesson_learned: lessonLearned.trim(), obstacles: obstacles.trim(), ...(includeGeo && coords ? { latitude: coords.lat, longitude: coords.lng } : {}) }
          : status === 'ON_LEAVE'
          ? { leave_reason: leaveReason.trim(), participant_id: user?.id }
          : { participant_id: user?.id }),
      };
      const res = await fetch('/api/monev/attendances', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || result?.error || 'Gagal menyimpan laporan');
      setActivityLog(''); setLessonLearned(''); setObstacles('');
      setQuickPrompt(''); setCustomObstacle(''); setNoObstacles(true);
      setLeaveReason(''); setIsAgreed(false);
      setAlertInfo({ type: 'success', message: status === 'PRESENT' ? 'Laporan harian & presensi berhasil dikirim ke server MagangHub Kemnaker RI!' : 'Data presensi berhasil disimpan ke MagangHub Kemnaker RI.' });
      if (formContainerRef.current) formContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      onSuccess();
    } catch (err: any) {
      setAlertInfo({ type: 'error', message: err?.message || 'Terjadi kesalahan saat mengirim laporan ke server.' });
      if (formContainerRef.current) formContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-1.5 w-16 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-200 ${isPassing ? 'bg-emerald-600' : 'bg-[#171717]'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className={`text-[11px] font-medium truncate ${isPassing ? 'text-emerald-700' : 'text-[#737373]'}`}>
            {isPassing ? (
              <span className="inline-flex items-center gap-1">
                <Check className="h-3 w-3 stroke-[2.5]" />
                <span>Memenuhi Syarat</span>
              </span>
            ) : (
              <span>Kurang {MIN_CHARS - currentLength} karakter</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[#737373] text-[11px] shrink-0">
          <span className="font-semibold text-[#171717]">{wordCount} kata</span>
          <span>·</span>
          <span>{currentLength} / {MIN_CHARS} kar</span>
        </div>
      </div>
    );
  };

  return (
    <div ref={formContainerRef} className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-7 space-y-6 shadow-xs">

      {/* ---- Header ---- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E7EB] pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-[#171717] shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#171717]">
              Tambah Laporan Harian
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Presensi &amp; Uraian Aktivitas Magang Kemnaker
            </p>
          </div>
        </div>

        <div className="inline-flex self-start sm:self-auto items-center gap-1.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#737373]">
          <CalendarIcon className="h-3.5 w-3.5 text-[#737373]" />
          <span>{formatDateIndo(date)}</span>
        </div>
      </div>

      {/* ---- Alert Notification Banner ---- */}
      {alertInfo && (
        <div
          className={`flex items-start justify-between gap-3 rounded-lg p-3.5 text-xs ${
            alertInfo.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {alertInfo.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            )}
            <div>
              <p className="font-semibold">
                {alertInfo.type === 'success' ? 'Berhasil Disimpan' : 'Perhatian'}
              </p>
              <p className="mt-0.5 leading-relaxed">
                {alertInfo.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAlertInfo(null)}
            className="text-[#737373] hover:text-[#171717] p-0.5 shrink-0 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ---- Holiday Mode Notice ---- */}
      {holidayInfo ? (
        <div className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB]">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white border border-[#E5E7EB] mb-3 text-[#171717]">
            {holidayInfo.isHoliday ? (
              <CalendarIcon className="h-7 w-7" />
            ) : (
              <Coffee className="h-7 w-7" />
            )}
          </div>
          <span className="rounded bg-white border border-[#E5E7EB] px-2.5 py-0.5 text-[11px] font-semibold text-[#737373] mb-2">
            {holidayInfo.sourceLabel || 'Hari Libur'}
          </span>
          <h3 className="text-lg font-bold text-[#171717] max-w-md">
            {holidayInfo.name}
          </h3>
          <p className="mt-1 text-xs text-[#737373] max-w-lg leading-relaxed">
            {holidayInfo.description}
          </p>

          <div className="mt-5 max-w-md w-full rounded-lg bg-white border border-[#E5E7EB] p-3.5 text-xs text-[#737373] leading-relaxed text-left">
            <p className="font-semibold text-[#171717] mb-1 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-[#171717] shrink-0" />
              <span>Petunjuk Sistem MagangHub Kemnaker:</span>
            </p>
            <p>
              Pada hari libur resmi atau jadwal off, portal Monev MagangHub menutup pengisian laporan presensi. Anda tidak perlu mengirimkan laporan aktivitas pada hari ini.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ---- Date & Status Controls ---- */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#171717]">
                Tanggal Laporan
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#171717] font-medium focus:border-[#171717] focus:ring-1 focus:ring-[#171717] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#171717]">
                Status Kehadiran
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-xs font-medium text-[#171717] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] focus:outline-none cursor-pointer"
              >
                <option value="PRESENT">Hadir (PRESENT)</option>
                <option value="ON_LEAVE">Izin / Sakit (ON_LEAVE)</option>
                <option value="ABSENT">Alfa (ABSENT)</option>
              </select>
            </div>
          </div>

          {/* ---- PRESENT: AI Agent + 3 Textarea Sections ---- */}
          {status === 'PRESENT' && (
            <div className="space-y-5">
              {/* AI Assistant Box */}
              <div className="rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#E5E7EB] pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#171717]">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-[#171717] text-white">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <span>AI Assistant Agent</span>
                  </div>
                  <span className="text-[11px] text-[#737373]">
                    Otomatis menyusun 3 poin wajib min. 100 karakter
                  </span>
                </div>

                {/* Prompt Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-[#737373] mr-1">
                    Ide Cepat:
                  </span>
                  {QUICK_PROMPT_SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setQuickPrompt(sug)}
                      className="text-[11px] rounded-full bg-white hover:bg-[#F0F1F3] border border-[#E5E7EB] px-2.5 py-0.5 text-[#171717] transition cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                {/* Prompt Textarea */}
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Kegiatan Singkat Hari Ini:
                  </label>
                  <textarea
                    rows={2}
                    value={quickPrompt}
                    onChange={(e) => setQuickPrompt(e.target.value)}
                    placeholder="Contoh: Diskusi evaluasi mingguan dengan mentor dan riset implementasi modul pencarian..."
                    className="w-full rounded-lg bg-white border border-[#E5E7EB] p-3 text-xs text-[#171717] placeholder:text-[#737373] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Obstacle Option Toggle */}
                <div className="rounded-lg bg-white border border-[#E5E7EB] p-3 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={noObstacles}
                      onChange={(e) => setNoObstacles(e.target.checked)}
                      className="h-4 w-4 rounded border-[#E5E7EB] text-[#171717] focus:ring-0 cursor-pointer shrink-0"
                    />
                    <span className="text-xs font-medium text-[#171717]">
                      Tidak ada kendala yang berarti hari ini (pekerjaan berjalan lancar)
                    </span>
                  </label>
                  {!noObstacles && (
                    <div className="pl-6 pt-1">
                      <label className="block text-[11px] font-semibold text-[#737373] mb-1">
                        Kendala yang Dialami:
                      </label>
                      <input
                        type="text"
                        value={customObstacle}
                        onChange={(e) => setCustomObstacle(e.target.value)}
                        placeholder="Contoh: Terjadi kendala teknis pada koneksi server pengujian..."
                        className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#171717] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* AI Generate Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !quickPrompt.trim()}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#171717] hover:bg-black text-white px-4 py-2 text-xs font-semibold transition disabled:opacity-40 w-full sm:w-auto cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{isGenerating ? 'Menyusun Narasi Laporan...' : 'Susun Laporan via AI Agent'}</span>
                  </button>
                </div>
              </div>

              {/* 1. Uraian Aktivitas */}
              <div className="rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#171717] text-[10px] font-bold text-white shrink-0">
                      1
                    </span>
                    <label className="text-xs sm:text-sm font-semibold text-[#171717]">
                      Uraian Aktivitas yang Dikerjakan
                    </label>
                  </div>
                  <span className="text-[11px] font-medium text-[#737373]">
                    Min. 100 Karakter
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={activityLog}
                  onChange={(e) => setActivityLog(e.target.value)}
                  placeholder="Jelaskan secara rinci tugas atau pekerjaan yang Anda lakukan hari ini (minimal 100 karakter)..."
                  className="w-full rounded-lg bg-white border border-[#E5E7EB] p-3 text-xs sm:text-sm text-[#171717] placeholder:text-[#737373] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] focus:outline-none resize-none leading-relaxed"
                />
                {renderCharIndicator(activityLog)}
              </div>

              {/* 2. Capaian Pembelajaran */}
              <div className="rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#171717] text-[10px] font-bold text-white shrink-0">
                      2
                    </span>
                    <label className="text-xs sm:text-sm font-semibold text-[#171717]">
                      Pembelajaran yang Diperoleh
                    </label>
                  </div>
                  <span className="text-[11px] font-medium text-[#737373]">
                    Min. 100 Karakter
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={lessonLearned}
                  onChange={(e) => setLessonLearned(e.target.value)}
                  placeholder="Jelaskan pengetahuan, wawasan, atau keterampilan baru yang Anda pelajari (minimal 100 karakter)..."
                  className="w-full rounded-lg bg-white border border-[#E5E7EB] p-3 text-xs sm:text-sm text-[#171717] placeholder:text-[#737373] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] focus:outline-none resize-none leading-relaxed"
                />
                {renderCharIndicator(lessonLearned)}
              </div>

              {/* 3. Kendala & Solusi */}
              <div className="rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#171717] text-[10px] font-bold text-white shrink-0">
                      3
                    </span>
                    <label className="text-xs sm:text-sm font-semibold text-[#171717]">
                      Kendala yang Dialami &amp; Upaya Mengatasinya
                    </label>
                  </div>
                  <span className="text-[11px] font-medium text-[#737373]">
                    Min. 100 Karakter
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={obstacles}
                  onChange={(e) => setObstacles(e.target.value)}
                  placeholder="Uraikan kendala yang dihadapi dan cara penyelesaiannya (minimal 100 karakter)..."
                  className="w-full rounded-lg bg-white border border-[#E5E7EB] p-3 text-xs sm:text-sm text-[#171717] placeholder:text-[#737373] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] focus:outline-none resize-none leading-relaxed"
                />
                {renderCharIndicator(obstacles)}
              </div>

              {/* GPS Geolocation Setting Card */}
              <div className="pt-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] p-3.5">
                  <div className="flex items-center gap-3 text-[#171717] min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#E5E7EB] shrink-0 text-[#171717]">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-[#171717] truncate">
                        <span>Koordinat Presensi:</span>
                        <span className="text-[#737373] font-normal truncate">
                          {coords?.label || 'Kabupaten Bondowoso, Jawa Timur'}
                        </span>
                      </div>
                      {coords && (
                        <p className="font-mono text-[10px] text-[#737373] mt-0.5">
                          Lat: {coords.lat.toFixed(5)} · Lng: {coords.lng.toFixed(5)}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCityPicker(true)}
                    className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg bg-white hover:bg-[#F0F1F3] border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#171717] transition cursor-pointer"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-[#737373]" />
                    <span>Ganti Lokasi</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---- City Picker Modal ---- */}
          {showCityPicker && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden bg-white border border-[#E5E7EB] rounded-xl shadow-lg">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-[#171717]">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#171717]">Pilih Lokasi Penempatan</h3>
                      <p className="text-[11px] text-[#737373]">Koordinat resmi untuk presensi MagangHub</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCityPicker(false)}
                    className="text-[#737373] hover:text-[#171717] p-1 rounded-lg transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4 border-b border-[#E5E7EB] shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#737373]" />
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      placeholder="Cari nama kabupaten/kota..."
                      className="w-full rounded-lg bg-white border border-[#E5E7EB] pl-9 pr-3 py-2 text-xs text-[#171717] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredCities.map((city, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyCity(city)}
                      className="w-full flex items-center justify-between p-2.5 text-left rounded-lg hover:bg-[#F8F9FA] transition cursor-pointer group"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#171717]">{city.name}</p>
                        <p className="text-[10px] text-[#737373]">{city.province}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#737373]">
                          {city.lat.toFixed(4)}, {city.lng.toFixed(4)}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-[#737373] group-hover:text-[#171717] transition" />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="border-t border-[#E5E7EB] px-5 py-3 text-right shrink-0 bg-[#F8F9FA]">
                  <button
                    type="button"
                    onClick={() => setShowCityPicker(false)}
                    className="rounded-lg bg-white hover:bg-[#F0F1F3] border border-[#E5E7EB] px-4 py-1.5 text-xs font-medium text-[#171717] cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---- ON_LEAVE: Reason ---- */}
          {status === 'ON_LEAVE' && (
            <div className="rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-semibold text-[#171717]">
                  Alasan Tidak Hadir (Izin / Sakit)
                </label>
                <span className="text-[11px] font-medium text-[#737373]">
                  Min. 100 Karakter
                </span>
              </div>
              <textarea
                rows={4}
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="Tuliskan keterangan lengkap alasan izin atau sakit sesuai dengan izin yang telah diajukan ke mentor magang (minimal 100 karakter)..."
                className="w-full rounded-lg bg-white border border-[#E5E7EB] p-3 text-xs sm:text-sm text-[#171717] placeholder:text-[#737373] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] focus:outline-none resize-none leading-relaxed"
              />
              {renderCharIndicator(leaveReason)}
            </div>
          )}

          {/* ---- Agreement Checkbox ---- */}
          <div className="rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] p-3.5">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="h-4 w-4 rounded border-[#E5E7EB] text-[#171717] focus:ring-0 shrink-0 cursor-pointer"
              />
              <span className="text-xs text-[#737373] leading-relaxed">
                Saya menyatakan bahwa seluruh data aktivitas dan informasi kehadiran ini adalah benar, sah, dan siap dikirimkan ke portal resmi Kemnaker RI.
              </span>
            </label>
          </div>

          {/* ---- Submit & Reset Controls ---- */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-white hover:bg-[#F8F9FA] border border-[#E5E7EB] px-4 py-2.5 text-xs font-medium text-[#171717] transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#737373]" />
              <span>Reset Formulir</span>
            </button>

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#171717] hover:bg-black text-white px-6 py-2.5 text-xs font-semibold disabled:opacity-40 transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Mengirim ke MagangHub...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Kirim Laporan Harian</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
