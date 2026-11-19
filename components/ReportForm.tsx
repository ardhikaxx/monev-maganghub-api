'use client';

import React, { useState, useEffect } from 'react';
import {
  AttendanceStatus,
  AttendanceSubmissionPayload,
  MonevUser,
} from '@/types/monev';
import {
  ACTIVITY_TEMPLATES,
  ActivityTemplate,
  getTodayDateString,
  formatDateIndo,
} from '@/lib/monev';
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
} from 'lucide-react';

interface ReportFormProps {
  token: string;
  user: MonevUser | null;
  onSuccess: () => void;
}

export default function ReportForm({ token, user, onSuccess }: ReportFormProps) {
  const [date, setDate] = useState<string>(getTodayDateString());
  const [status, setStatus] = useState<AttendanceStatus>('PRESENT');
  const [activityLog, setActivityLog] = useState('');
  const [lessonLearned, setLessonLearned] = useState('');
  const [obstacles, setObstacles] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);

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
          role: user?.position || 'Peserta Magang',
          company: user?.company_name || 'Mitra Kemnaker',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json?.error || 'Gagal menyusun laporan otomatis');
      }

      setActivityLog(json.data.activity_log || '');
      setLessonLearned(json.data.lesson_learned || '');
      setObstacles(json.data.obstacles || '');

      setAlertInfo({
        type: 'success',
        message:
          'Laporan berhasil dibuat otomatis oleh AI! Semua kolom telah memenuhi standar minimal 100 karakter. Silakan tinjau dan centang persetujuan di bawah.',
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

  // Apply template
  const applyTemplate = (tmpl: ActivityTemplate) => {
    setActivityLog(tmpl.activity_log);
    setLessonLearned(tmpl.lesson_learned);
    setObstacles(tmpl.obstacles);
  };

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

      setAlertInfo({
        type: 'success',
        message:
          status === 'PRESENT'
            ? 'Kehadiran dan laporan aktivitas harian berhasil dikirim ke MagangHub Kemnaker.'
            : 'Data kehadiran berhasil disimpan.',
      });
      onSuccess();
    } catch (err: any) {
      setAlertInfo({
        type: 'error',
        message: err?.message || 'Terjadi kesalahan saat mengirim laporan.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCharIndicator = (currentLength: number) => {
    const isPassing = currentLength >= MIN_CHARS;
    const percent = Math.min(100, Math.round((currentLength / MIN_CHARS) * 100));

    return (
      <div className="mt-1 flex items-center justify-between text-[11px] sm:text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-16 sm:w-20 overflow-hidden rounded-full bg-zinc-200">
            <div
              className={`h-full transition-all duration-300 ${
                isPassing ? 'bg-zinc-950' : 'bg-zinc-400'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className={`font-semibold ${isPassing ? 'text-zinc-950' : 'text-zinc-500'}`}>
            {isPassing ? (
              <span className="flex items-center gap-0.5">
                <Check className="h-3 w-3" /> Memenuhi ({currentLength})
              </span>
            ) : (
              `Butuh ${MIN_CHARS - currentLength} lagi`
            )}
          </span>
        </div>
        <span className="font-mono text-zinc-400">
          {currentLength} / {MIN_CHARS}
        </span>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm">
      {/* Form Header (Monochrome) */}
      <div className="mb-5 sm:mb-6 flex flex-col gap-2.5 border-b border-zinc-100 pb-4 sm:pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-zinc-900 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-950">
              Tambah Laporan Harian
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Pelaporan resmi terintegrasi dengan MagangHub Kemnaker
          </p>
        </div>

        <div className="inline-flex self-start sm:self-auto rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-800">
          {formatDateIndo(date)}
        </div>
      </div>

      {alertInfo && (
        <div
          className={`mb-5 sm:mb-6 flex items-start gap-2.5 rounded-xl border p-3.5 text-xs sm:text-sm ${
            alertInfo.type === 'success'
              ? 'border-zinc-300 bg-zinc-100 text-zinc-950'
              : 'border-zinc-400 bg-zinc-100 text-zinc-950'
          }`}
        >
          {alertInfo.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-950" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" />
          )}
          <div className="flex-1">
            <p className="font-bold">
              {alertInfo.type === 'success' ? 'Sukses' : 'Pemberitahuan'}
            </p>
            <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">{alertInfo.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Tanggal & Status */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Pilih Tanggal Laporan
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 transition focus:border-zinc-950 focus:bg-white focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-zinc-400">
              *Hanya berlaku untuk presensi hari ini.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Status Kehadiran
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-3.5 py-2 text-xs sm:text-sm font-medium text-zinc-900 transition focus:border-zinc-950 focus:bg-white focus:outline-none"
            >
              <option value="PRESENT">Hadir (Isi Laporan Aktivitas)</option>
              <option value="ON_LEAVE">Tidak Hadir Dengan Keterangan (Izin)</option>
              <option value="ABSENT">Tidak Hadir Tanpa Keterangan</option>
            </select>
          </div>
        </div>

        {/* Jika Hadir: Bagian Generator AI & 3 Textarea */}
        {status === 'PRESENT' && (
          <div className="space-y-4 sm:space-y-5 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-3.5 sm:p-5">
            {/* FITUR 1: Generator AI Cepat & Checkbox Tidak Ada Kendala */}
            <div className="rounded-xl border border-zinc-300 bg-white p-4 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-100 pb-2.5">
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-zinc-950">
                  <Sparkles className="h-4 w-4 text-zinc-900" />
                  <span>Generator Draf Laporan Otomatis (AI)</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>AI Gemini Siap Digunakan</span>
                </div>
              </div>

              {/* Input Singkat Kegiatan */}
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  1. Tuliskan Kegiatan Singkat Hari Ini:
                </label>
                <textarea
                  rows={2}
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  placeholder="Contoh: Mengerjakan fitur antarmuka dashboard, perbaikan bug autentikasi, dan pengujian API..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-xs sm:text-sm text-zinc-900 focus:border-zinc-950 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Checkbox "Tidak Ada Kendala" */}
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noObstacles}
                    onChange={(e) => setNoObstacles(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-400 text-zinc-950 focus:ring-0 shrink-0"
                  />
                  <span className="text-xs font-bold text-zinc-900 select-none">
                    Tidak ada kendala operasional / teknis hari ini
                  </span>
                </label>

                {noObstacles ? (
                  <p className="text-[11px] text-zinc-500 pl-6 leading-relaxed">
                    Uraian kendala akan otomatis diisi formal &ge;100 karakter: <em>kegiatan berjalan lancar, fasilitas kerja berfungsi optimal, dan tidak ada hambatan operasional signifikan.</em>
                  </p>
                ) : (
                  <div className="pl-6 pt-1">
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Sebutkan Kendala Singkat (Jika Ada):
                    </label>
                    <input
                      type="text"
                      value={customObstacle}
                      onChange={(e) => setCustomObstacle(e.target.value)}
                      placeholder="Contoh: Sempat terjadi kendala jaringan internet lambat saat download aset..."
                      className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Tombol Eksekusi Generate */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
                <span className="text-[11px] text-zinc-400">
                  *Sekali klik langsung mengisi ketiga form di bawah (&ge;100 karakter).
                </span>

                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !quickPrompt.trim()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Menyusun Laporan...' : 'Generate Laporan Otomatis'}</span>
                </button>
              </div>
            </div>

            {/* Template Cepat Draf Bawaan (Monochrome Chips) */}
            <div className="rounded-xl border border-zinc-200 bg-white p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 mb-2">
                <FileText className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                <span>Atau Pilih Draf Template Siap Pakai:</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
                {ACTIVITY_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyTemplate(tmpl)}
                    className="rounded-lg bg-zinc-100 hover:bg-zinc-950 hover:text-white px-2.5 py-1.5 text-[11px] font-semibold text-zinc-800 border border-zinc-200 transition shrink-0 active:scale-95"
                  >
                    {tmpl.title.split(' ')[0]} {tmpl.title.split(' ')[1]}...
                  </button>
                ))}
              </div>
            </div>

            {/* 1. Uraian Aktivitas */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-zinc-900">
                  1. Uraian Aktivitas
                </label>
                <span className="text-[10px] sm:text-[11px] text-zinc-400">Min 100 Karakter</span>
              </div>
              <textarea
                rows={3}
                value={activityLog}
                onChange={(e) => setActivityLog(e.target.value)}
                placeholder="Tulis uraian aktivitas minimal 100 karakter"
                className="w-full rounded-xl border border-zinc-300 bg-white p-2.5 sm:p-3 text-xs sm:text-sm text-zinc-900 transition focus:border-zinc-950 focus:outline-none"
              />
              {renderCharIndicator(activityLog.trim().length)}
            </div>

            {/* 2. Pembelajaran */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-zinc-900">
                  2. Pembelajaran yang Diperoleh
                </label>
                <span className="text-[10px] sm:text-[11px] text-zinc-400">Min 100 Karakter</span>
              </div>
              <textarea
                rows={3}
                value={lessonLearned}
                onChange={(e) => setLessonLearned(e.target.value)}
                placeholder="Tulis ilmu/pembelajaran yang diperoleh minimal 100 karakter"
                className="w-full rounded-xl border border-zinc-300 bg-white p-2.5 sm:p-3 text-xs sm:text-sm text-zinc-900 transition focus:border-zinc-950 focus:outline-none"
              />
              {renderCharIndicator(lessonLearned.trim().length)}
            </div>

            {/* 3. Kendala */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-zinc-900">
                  3. Kendala yang Dialami
                </label>
                <span className="text-[10px] sm:text-[11px] text-zinc-400">Min 100 Karakter</span>
              </div>
              <textarea
                rows={3}
                value={obstacles}
                onChange={(e) => setObstacles(e.target.value)}
                placeholder="Tulis kendala/hambatan yang dialami minimal 100 karakter"
                className="w-full rounded-xl border border-zinc-300 bg-white p-2.5 sm:p-3 text-xs sm:text-sm text-zinc-900 transition focus:border-zinc-950 focus:outline-none"
              />
              {renderCharIndicator(obstacles.trim().length)}
            </div>

            {/* Lokasi Presensi (Monochrome) */}
            <div className="border-t border-zinc-200 pt-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white p-3 border border-zinc-200 text-xs">
                <div className="flex items-center gap-2 text-zinc-900 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950 text-white shrink-0">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-900 truncate">
                      <span>Lokasi Presensi:</span>
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
                  className="self-start sm:self-auto flex items-center justify-center rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-800 border border-zinc-200 hover:bg-zinc-200 transition"
                >
                  <span>Ganti Kota</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Pemilih Kota Instan (Monochrome Dialog) */}
        {showCityPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-3 sm:p-4">
            <div className="w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl border border-zinc-200">
              <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-3 sm:px-6 sm:py-4 shrink-0">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-zinc-900" />
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900">
                    Pilih Kota Penempatan
                  </h3>
                </div>
                <button
                  onClick={() => setShowCityPicker(false)}
                  className="text-zinc-400 hover:text-zinc-700 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 sm:p-4 border-b border-zinc-100 bg-white shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Ketik nama kota (Bondowoso, Jember...)"
                    className="w-full rounded-xl border border-zinc-200 pl-9 pr-4 py-2 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 divide-y divide-zinc-100">
                {filteredCities.map((city, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyCity(city)}
                    className="w-full flex items-center justify-between p-2.5 sm:p-3 text-left hover:bg-zinc-100 rounded-lg transition"
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

              <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-2.5 sm:px-6 sm:py-3 text-right shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCityPicker(false)}
                  className="rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Tutup
                </button>
              </div>
            </div>
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
            {renderCharIndicator(leaveReason.trim().length)}
          </div>
        )}

        {/* Checkbox Pernyataan & Konfirmasi Wajib Sebelum Kirim */}
        <div className="rounded-xl border border-zinc-300 bg-zinc-50/80 p-3.5 sm:p-4">
          <label className="flex items-start gap-2.5 sm:gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-zinc-400 text-zinc-950 focus:ring-0 shrink-0"
            />
            <span className="text-xs text-zinc-800 select-none leading-relaxed font-medium">
              Saya menyatakan telah meninjau seluruh uraian laporan harian di atas, memastikannya telah sesuai standar minimal 100 karakter, dan siap dikirimkan ke portal MagangHub Kemnaker.
            </span>
          </label>
        </div>

        {/* Tombol Submit & Reset */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-1 sm:pt-2">
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-40"
          >
            {isSubmitting ? (
              <span>Mengirim Laporan...</span>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Kirim Laporan ke MagangHub</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
