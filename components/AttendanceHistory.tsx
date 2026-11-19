'use client';

import React, { useState, useEffect } from 'react';
import { Attendance, DailyLog } from '@/types/monev';
import { formatDateIndo } from '@/lib/monev';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileEdit,
  FileText,
  RefreshCw,
  Send,
  X,
  MapPin,
  BookOpen,
  AlertCircle,
  Check,
  Copy,
  Search,
} from 'lucide-react';

interface AttendanceHistoryProps {
  token: string;
}

export default function AttendanceHistory({ token }: AttendanceHistoryProps) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'APPROVED' | 'SUBMITTED' | 'REVISION' | 'LEAVE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Revision modal state
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  const [revisionActivity, setRevisionActivity] = useState('');
  const [revisionLesson, setRevisionLesson] = useState('');
  const [revisionObstacles, setRevisionObstacles] = useState('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [revisionAlert, setRevisionAlert] = useState<string | null>(null);

  // Copy indicator per card
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAttendances = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/monev/attendances', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Gagal mengambil riwayat kehadiran');
      }

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      // Urutkan tanggal terbaru paling atas
      items.sort(
        (a: Attendance, b: Attendance) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setAttendances(items);
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAttendances();
    }
  }, [token]);

  const openRevisionModal = (log: DailyLog) => {
    setEditingLog(log);
    setRevisionActivity(log.activity_log || '');
    setRevisionLesson(log.lesson_learned || '');
    setRevisionObstacles(log.obstacles || '');
    setRevisionAlert(null);
  };

  const handleSaveRevision = async () => {
    if (!editingLog?.id) return;
    if (
      revisionActivity.trim().length < 100 ||
      revisionLesson.trim().length < 100 ||
      revisionObstacles.trim().length < 100
    ) {
      setRevisionAlert('Semua uraian perbaikan wajib minimal 100 karakter.');
      return;
    }

    setIsSubmittingRevision(true);
    setRevisionAlert(null);
    try {
      const res = await fetch(`/api/monev/daily-logs/${editingLog.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: editingLog.date,
          activity_log: revisionActivity.trim(),
          lesson_learned: revisionLesson.trim(),
          obstacles: revisionObstacles.trim(),
          state: 'REVISION_SUBMITTED',
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result?.message || 'Gagal menyimpan perbaikan laporan');
      }

      setEditingLog(null);
      fetchAttendances();
    } catch (err: any) {
      setRevisionAlert(err?.message || 'Gagal memperbarui laporan.');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const copyCardContent = (item: Attendance) => {
    if (!item.log) return;
    const text = `LAPORAN HARIAN MAGANG (${item.date})
1. Uraian Aktivitas:
${item.log.activity_log}

2. Pembelajaran yang Diperoleh:
${item.log.lesson_learned}

3. Kendala yang Dialami:
${item.log.obstacles}`;

    navigator.clipboard.writeText(text);
    setCopiedId(String(item.id));
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Status counts
  const totalCount = attendances.length;
  const approvedCount = attendances.filter((a) => a.approval_status === 'APPROVED').length;
  const pendingCount = attendances.filter(
    (a) => a.approval_status === 'SUBMITTED' && a.log?.state !== 'NEEDS_REVISION'
  ).length;
  const revisionCount = attendances.filter((a) => a.log?.state === 'NEEDS_REVISION').length;

  // Filter items
  const filteredAttendances = attendances.filter((item) => {
    if (filterStatus === 'APPROVED' && item.approval_status !== 'APPROVED') return false;
    if (filterStatus === 'SUBMITTED' && (item.approval_status !== 'SUBMITTED' || item.log?.state === 'NEEDS_REVISION')) return false;
    if (filterStatus === 'REVISION' && item.log?.state !== 'NEEDS_REVISION') return false;
    if (filterStatus === 'LEAVE' && item.status !== 'ON_LEAVE' && item.status !== 'ABSENT') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDate = item.date.toLowerCase().includes(q);
      const matchAct = item.log?.activity_log?.toLowerCase().includes(q);
      const matchLesson = item.log?.lesson_learned?.toLowerCase().includes(q);
      const matchObs = item.log?.obstacles?.toLowerCase().includes(q);
      const matchLeave = item.leave_reason?.toLowerCase().includes(q);
      return matchDate || matchAct || matchLesson || matchObs || matchLeave;
    }

    return true;
  });

  const renderStatusBadge = (attendance: Attendance) => {
    const status = attendance.status;
    const approval = attendance.approval_status;
    const logState = attendance.log?.state;

    if (logState === 'NEEDS_REVISION') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-zinc-950 border border-zinc-400 shrink-0">
          <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          Perbaikan
        </span>
      );
    }

    if (status === 'ON_LEAVE') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-zinc-700 border border-zinc-200 shrink-0">
          <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          Izin
        </span>
      );
    }

    if (status === 'ABSENT') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-zinc-600 border border-zinc-200 shrink-0">
          <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          Alfa
        </span>
      );
    }

    if (approval === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-950 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white shrink-0">
          <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          Disetujui
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-zinc-700 border border-zinc-200 shrink-0">
        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        Menunggu
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Quick Summary */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-zinc-900 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
                Riwayat & Evaluasi Laporan
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Rangkuman seluruh presensi dan catatan evaluasi harian Anda
            </p>
          </div>

          <button
            onClick={fetchAttendances}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 self-start sm:self-auto rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-zinc-950' : ''}`} />
            <span>Muat Ulang</span>
          </button>
        </div>

        {/* Statistic Cards (Monochrome) */}
        <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 sm:p-3.5">
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium truncate">Total Laporan</p>
            <p className="text-lg sm:text-xl font-bold text-zinc-950 mt-0.5">{totalCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 sm:p-3.5">
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium truncate">Disetujui Mentor</p>
            <p className="text-lg sm:text-xl font-bold text-zinc-950 mt-0.5">{approvedCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 sm:p-3.5">
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium truncate">Menunggu</p>
            <p className="text-lg sm:text-xl font-bold text-zinc-950 mt-0.5">{pendingCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 sm:p-3.5">
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium truncate">Perlu Revisi</p>
            <p className="text-lg sm:text-xl font-bold text-zinc-950 mt-0.5">{revisionCount}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 sm:mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-zinc-100 pt-3.5 sm:pt-4">
          <div className="relative w-full sm:max-w-xs md:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aktivitas atau tanggal..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-8 sm:pl-9 pr-3.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-950 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold transition shrink-0 ${
                filterStatus === 'ALL'
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              Semua ({totalCount})
            </button>
            <button
              onClick={() => setFilterStatus('APPROVED')}
              className={`rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold transition shrink-0 ${
                filterStatus === 'APPROVED'
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              Disetujui ({approvedCount})
            </button>
            <button
              onClick={() => setFilterStatus('SUBMITTED')}
              className={`rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold transition shrink-0 ${
                filterStatus === 'SUBMITTED'
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              Menunggu ({pendingCount})
            </button>
            {revisionCount > 0 && (
              <button
                onClick={() => setFilterStatus('REVISION')}
                className={`rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold transition shrink-0 ${
                  filterStatus === 'REVISION'
                    ? 'bg-zinc-950 text-white'
                    : 'bg-zinc-200 text-zinc-950 hover:bg-zinc-300'
                }`}
              >
                Revisi ({revisionCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-zinc-300 bg-zinc-100 p-3 sm:p-4 text-xs text-zinc-900 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-zinc-700" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Cards (1 col on mobile, 2 cols on tablet/desktop) */}
      {loading ? (
        <div className="py-12 sm:py-16 text-center text-xs text-zinc-500 rounded-2xl border border-zinc-200 bg-white p-4">
          <RefreshCw className="mx-auto mb-2 h-7 w-7 animate-spin text-zinc-950" />
          <span className="font-semibold text-zinc-800">Mengambil data laporan dari MagangHub Kemnaker...</span>
        </div>
      ) : filteredAttendances.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-12 sm:py-16 text-center p-4">
          <Calendar className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
          <p className="text-sm sm:text-base font-bold text-zinc-800">Tidak Ada Laporan yang Cocok</p>
          <p className="text-xs text-zinc-400 mt-1">
            {searchQuery || filterStatus !== 'ALL'
              ? 'Coba ganti filter atau kata kunci pencarian Anda.'
              : 'Belum ada catatan kehadiran yang dibuat.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2">
          {filteredAttendances.map((item) => {
            const log = item.log;
            const needsRevision = log?.state === 'NEEDS_REVISION';
            const isCopied = copiedId === String(item.id);

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:border-zinc-400 ${
                  needsRevision ? 'border-zinc-400 ring-1 ring-zinc-400' : 'border-zinc-200'
                }`}
              >
                {/* Card Top Header */}
                <div className="border-b border-zinc-100 bg-zinc-50/70 p-3.5 sm:p-4">
                  <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-zinc-950 text-white">
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase leading-none text-zinc-400">
                          {new Date(item.date).toLocaleString('id-ID', { month: 'short' })}
                        </span>
                        <span className="text-sm sm:text-base font-black leading-tight">
                          {new Date(item.date).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                          {formatDateIndo(item.date)}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5">
                          <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500">
                            Status:{' '}
                            <strong className="text-zinc-900">
                              {item.status === 'PRESENT'
                                ? 'Hadir'
                                : item.status === 'ON_LEAVE'
                                ? 'Izin'
                                : 'Alfa'}
                            </strong>
                          </span>

                          {item.latitude && item.longitude && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] text-zinc-700 font-mono bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 shrink-0">
                              <MapPin className="h-2.5 w-2.5 text-zinc-800" />
                              GPS
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">{renderStatusBadge(item)}</div>
                  </div>
                </div>

                {/* Card Body Contents */}
                <div className="p-3.5 sm:p-5 space-y-3 flex-1">
                  {/* Catatan Reviewer jika ada revisi */}
                  {needsRevision && log?.reviewer_notes && (
                    <div className="rounded-xl border border-zinc-300 bg-zinc-100 p-3 text-xs text-zinc-900">
                      <div className="flex items-center gap-1.5 font-bold text-zinc-950 mb-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
                        <span>Catatan dari Mentor:</span>
                      </div>
                      <p className="leading-relaxed pl-4 font-medium">{log.reviewer_notes}</p>
                    </div>
                  )}

                  {/* Jika Izin / Sakit */}
                  {item.status === 'ON_LEAVE' && (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs">
                      <p className="font-bold text-zinc-900 mb-1">Alasan Ketidakhadiran:</p>
                      <p className="text-zinc-700 leading-relaxed">
                        {item.leave_reason || 'Tidak ada catatan alasan.'}
                      </p>
                    </div>
                  )}

                  {/* Jika Hadir: 3 Bagian Laporan Lengkap */}
                  {item.status === 'PRESENT' && log ? (
                    <div className="space-y-2.5 text-xs">
                      {/* 1. Uraian Aktivitas */}
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-2.5 sm:p-3">
                        <div className="flex items-center gap-1.5 font-bold text-zinc-900 mb-1">
                          <FileText className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
                          <span>1. Uraian Aktivitas:</span>
                        </div>
                        <p className="text-zinc-700 leading-relaxed whitespace-pre-line pl-4">
                          {log.activity_log || '-'}
                        </p>
                      </div>

                      {/* 2. Pembelajaran */}
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-2.5 sm:p-3">
                        <div className="flex items-center gap-1.5 font-bold text-zinc-900 mb-1">
                          <BookOpen className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
                          <span>2. Pembelajaran:</span>
                        </div>
                        <p className="text-zinc-700 leading-relaxed whitespace-pre-line pl-4">
                          {log.lesson_learned || '-'}
                        </p>
                      </div>

                      {/* 3. Kendala */}
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-2.5 sm:p-3">
                        <div className="flex items-center gap-1.5 font-bold text-zinc-900 mb-1">
                          <AlertCircle className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
                          <span>3. Kendala:</span>
                        </div>
                        <p className="text-zinc-700 leading-relaxed whitespace-pre-line pl-4">
                          {log.obstacles || '-'}
                        </p>
                      </div>
                    </div>
                  ) : item.status === 'PRESENT' ? (
                    <p className="text-xs italic text-zinc-400 py-1">
                      Rincian teks laporan aktivitas tidak terdeteksi untuk kehadiran ini.
                    </p>
                  ) : null}
                </div>

                {/* Card Bottom Footer */}
                <div className="border-t border-zinc-100 bg-zinc-50/50 px-3.5 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400">
                    ID: {item.id ? String(item.id).slice(0, 8) : '-'}...
                  </span>

                  <div className="flex items-center gap-2">
                    {item.log && (
                      <button
                        type="button"
                        onClick={() => copyCardContent(item)}
                        className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100 transition shadow-sm active:scale-95"
                        title="Salin Isi Laporan"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3 text-zinc-950" />
                            <span className="text-zinc-950">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    )}

                    {needsRevision && (
                      <button
                        type="button"
                        onClick={() => {
                          if (log) openRevisionModal(log);
                        }}
                        className="flex items-center gap-1 rounded-lg bg-zinc-950 px-2.5 py-1 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 transition active:scale-95"
                      >
                        <FileEdit className="h-3.5 w-3.5" />
                        <span>Perbaiki</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Edit / Revisi */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-3 sm:px-6 sm:py-4 shrink-0">
              <div className="flex items-center gap-2">
                <FileEdit className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-900" />
                <h3 className="font-bold text-sm sm:text-base text-zinc-950">
                  Perbaiki Uraian Laporan Harian
                </h3>
              </div>
              <button
                onClick={() => setEditingLog(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {revisionAlert && (
                <div className="rounded-xl border border-zinc-300 bg-zinc-100 p-3 text-xs text-zinc-900">
                  {revisionAlert}
                </div>
              )}

              {editingLog.reviewer_notes && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900">
                  <span className="font-bold">Catatan Mentor:</span>{' '}
                  {editingLog.reviewer_notes}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Uraian Aktivitas (Min 100 Karakter)
                </label>
                <textarea
                  rows={3}
                  value={revisionActivity}
                  onChange={(e) => setRevisionActivity(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                />
                <span className="text-[11px] text-zinc-400">
                  {revisionActivity.trim().length} / 100 karakter
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Pembelajaran yang Diperoleh (Min 100 Karakter)
                </label>
                <textarea
                  rows={3}
                  value={revisionLesson}
                  onChange={(e) => setRevisionLesson(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                />
                <span className="text-[11px] text-zinc-400">
                  {revisionLesson.trim().length} / 100 karakter
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Kendala yang Dialami (Min 100 Karakter)
                </label>
                <textarea
                  rows={3}
                  value={revisionObstacles}
                  onChange={(e) => setRevisionObstacles(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                />
                <span className="text-[11px] text-zinc-400">
                  {revisionObstacles.trim().length} / 100 karakter
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-4 py-2.5 sm:px-6 sm:py-3.5 shrink-0">
              <button
                type="button"
                onClick={() => setEditingLog(null)}
                className="rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRevision}
                disabled={isSubmittingRevision}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-40"
              >
                {isSubmittingRevision ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Kirim Perbaikan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
