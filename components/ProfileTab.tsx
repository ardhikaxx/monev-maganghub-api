'use client';

import React, { useState, useEffect } from 'react';
import { MonevUser, Attendance } from '@/types/monev';
import { formatDateIndo } from '@/lib/monev';
import {
  Calendar,
  UserCheck,
  Clock,
  RefreshCw,
  FileText,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ExternalLink,
  GraduationCap,
  ArrowRight,
  Briefcase,
} from 'lucide-react';

interface ProfileTabProps {
  user: MonevUser | null;
  token?: string | null;
  onSelectTab?: (tab: 'form' | 'history' | 'profile' | 'token') => void;
  onRefreshUser?: () => void;
}

export default function ProfileTab({
  user,
  token,
  onSelectTab,
  onRefreshUser,
}: ProfileTabProps) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ambil data laporan lengkap untuk profil
  const fetchReportData = async () => {
    if (!token) return;
    setLoadingReports(true);
    try {
      const res = await fetch('/api/monev/attendances', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      const list: Attendance[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
        ? json.data
        : [];

      list.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setAttendances(list);
    } catch {
      // Offline fallback
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [token]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    if (onRefreshUser) {
      await onRefreshUser();
    }
    await fetchReportData();
    setIsRefreshing(false);
  };

  if (!user) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
        Data profil peserta tidak ditemukan. Silakan login ulang.
      </div>
    );
  }

  // Data resmi dari API Kemnaker
  const displayCompany =
    user.internship_company ||
    user.company ||
    user.company_name ||
    '';

  const displayPosition =
    user.job_role ||
    user.position ||
    '';

  const displayLocation =
    user.internship_location_regency_name ||
    user.location ||
    '';

  const displayStartDate =
    user.internship_start_date ||
    '';

  const displayEndDate =
    user.internship_end_date ||
    '';

  const displayBatch =
    user.internship_batch_name ||
    user.batch_name ||
    '';

  const displayMentor =
    user.mentor_name ||
    '';

  // Hitung progres durasi magang
  let progressPercent = 0;
  let daysTotal = 0;
  let daysPassed = 0;
  let daysRemaining = 0;

  if (displayStartDate && displayEndDate) {
    const start = new Date(displayStartDate).getTime();
    const end = new Date(displayEndDate).getTime();
    const now = new Date().getTime();

    daysTotal = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    daysPassed = Math.max(0, Math.min(daysTotal, Math.round((now - start) / (1000 * 60 * 60 * 24))));
    daysRemaining = Math.max(0, daysTotal - daysPassed);
    progressPercent = Math.min(100, Math.round((daysPassed / daysTotal) * 100));
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : 'PM';

  // 3 Laporan Terbaru
  const recentReports = attendances.slice(0, 3);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Kartu Header Utama (Glassmorphic) */}
      <div className="overflow-hidden glass-card shadow-xl">
        {/* Prismatic Dark Glass Banner */}
        <div className="glass-dark px-4 py-5 sm:px-8 sm:py-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white/10 text-sm sm:text-xl font-black text-white shrink-0 border border-white/20 shadow-xs">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-xl font-bold tracking-tight text-white truncate">
                  {user.name || 'Peserta Magang'}
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 truncate">
                {displayPosition || 'Peserta Magang'} &bull; {displayCompany || 'Mitra Kemnaker'}
                {displayLocation && ` &bull; ${displayLocation}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 self-stretch sm:self-auto pt-1 sm:pt-0">
            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl glass-pill px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:text-zinc-950 transition disabled:opacity-50 text-center cursor-pointer"
              title="Segarkan Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>

            <a
              href="https://monev.maganghub.kemnaker.go.id/dashboard"
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl glass-pill px-3 py-1.5 text-xs font-bold text-zinc-950 transition text-center"
            >
              <span>Portal Asli</span>
              <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            </a>
          </div>
        </div>

        {/* Progress Periode Magang */}
        {displayStartDate && displayEndDate && (
          <div className="border-t border-zinc-200/60 p-4 sm:px-8 sm:py-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <Clock className="h-3.5 w-3.5 text-zinc-800 shrink-0" />
                <span>Progres Magang:</span>
                <span className="rounded-full glass-dark px-2.5 py-0.5 text-[11px] font-mono font-bold text-white">
                  {progressPercent}%
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 font-medium">
                Hari {daysPassed} / {daysTotal} ({daysRemaining} hari tersisa)
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200/80">
              <div
                className="h-full bg-zinc-950 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Kartu Resmi: Informasi Magang (Glassmorphic) */}
      <div className="glass-card p-4 sm:p-6 space-y-3.5 sm:space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-zinc-950 shrink-0" />
            <h2 className="text-sm sm:text-lg font-bold text-zinc-950">
              Informasi Magang
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full glass-pill px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold text-zinc-900">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Aktif
            </span>
          </div>
        </div>

        {/* Grid 4 Elemen Pokok Resmi */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 pt-1">
          {/* 1. Perusahaan */}
          <div className="rounded-xl glass-pill p-3 sm:p-3.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Perusahaan
            </span>
            <p className="text-xs sm:text-sm font-bold text-zinc-950 leading-snug">
              {displayCompany || '-'}
            </p>
          </div>

          {/* 2. Posisi */}
          <div className="rounded-xl glass-pill p-3 sm:p-3.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Posisi
            </span>
            <p className="text-xs sm:text-sm font-bold text-zinc-950 leading-snug">
              {displayPosition || '-'}
            </p>
          </div>

          {/* 3. Lokasi Posisi */}
          <div className="rounded-xl glass-pill p-3 sm:p-3.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Lokasi
            </span>
            <p className="text-xs sm:text-sm font-bold text-zinc-950 leading-snug">
              {displayLocation || '-'}
            </p>
          </div>

          {/* 4. Periode Magang */}
          <div className="rounded-xl glass-pill p-3 sm:p-3.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Periode
            </span>
            <p className="text-xs sm:text-sm font-bold text-zinc-950 leading-snug">
              {displayStartDate && displayEndDate
                ? `${formatDateIndo(displayStartDate)} s/d ${formatDateIndo(displayEndDate)}`
                : displayStartDate
                ? formatDateIndo(displayStartDate)
                : '-'}
            </p>
            {displayBatch && (
              <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1">Batch {displayBatch}</p>
            )}
          </div>
        </div>

        {/* Rincian Tambahan: Mentor & Asal Institusi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-2 border-t border-zinc-200/60 text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-zinc-700 shrink-0" />
            <span className="text-zinc-500">Mentor:</span>
            <strong className="text-zinc-900 truncate">{displayMentor || '-'}</strong>
          </div>

          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-zinc-700 shrink-0" />
            <span className="text-zinc-500">Institusi:</span>
            <strong className="text-zinc-900 truncate">{user.institution_name || user.university || '-'}</strong>
          </div>
        </div>
      </div>

      {/* 3. Bagian Data Laporan Terakhir */}
      <div className="glass-card p-4 sm:p-6 space-y-3.5 sm:space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-zinc-950 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-zinc-950">
              Laporan Terakhir
            </h3>
          </div>

          {onSelectTab && (
            <button
              type="button"
              onClick={() => onSelectTab('history')}
              className="flex items-center gap-1 text-xs font-semibold text-zinc-800 hover:text-zinc-950 transition"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {loadingReports ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-zinc-700" />
            <span>Memuat data laporan harian lengkap...</span>
          </div>
        ) : recentReports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-xs text-zinc-500">
            Belum ada data laporan yang tercatat.
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-3.5">
            {recentReports.map((item, idx) => {
              const log = item.log;
              const isApproved = item.approval_status === 'APPROVED';
              const needsRevision = log?.state === 'NEEDS_REVISION';

              return (
                <div
                  key={item.id ? `profile-rep-${item.id}` : `profile-idx-${idx}`}
                  className="rounded-xl glass-pill p-3 sm:p-4 space-y-2 sm:space-y-2.5 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 border-b border-zinc-200/80 pb-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Calendar className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
                      <span className="font-bold text-xs sm:text-sm text-zinc-950">
                        {formatDateIndo(item.date)}
                      </span>
                      {item.latitude && item.longitude && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-600 font-mono bg-zinc-200/80 px-1.5 py-0.5 rounded border border-zinc-300">
                          <MapPin className="h-2.5 w-2.5 text-zinc-700" />
                          GPS
                        </span>
                      )}
                    </div>

                    <div>
                      {needsRevision ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-zinc-950 border border-zinc-400">
                          <AlertTriangle className="h-3 w-3" />
                          Perlu Revisi
                        </span>
                      ) : isApproved ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-950 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-white">
                          <CheckCircle2 className="h-3 w-3" />
                          Disetujui
                        </span>
                      ) : item.status === 'ON_LEAVE' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-zinc-800">
                          Izin / Cuti
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-zinc-700 border border-zinc-200">
                          Menunggu Review
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Isi Lengkap Laporan */}
                  {item.status === 'ON_LEAVE' ? (
                    <p className="text-xs text-zinc-600">
                      <strong>Alasan Ketidakhadiran:</strong> {item.leave_reason || '-'}
                    </p>
                  ) : log ? (
                    <div className="space-y-2 text-xs">
                      {log.reviewer_notes && needsRevision && (
                        <div className="rounded-lg border border-zinc-300 bg-zinc-100 p-2.5 text-zinc-900">
                          <strong className="block text-zinc-950 mb-0.5">Catatan Perbaikan Mentor:</strong>
                          <p>{log.reviewer_notes}</p>
                        </div>
                      )}

                      <div className="bg-white rounded-lg p-2.5 border border-zinc-200">
                        <div className="flex items-center gap-1 font-bold text-zinc-900 mb-0.5">
                          <FileText className="h-3 w-3 text-zinc-700" />
                          <span>Aktivitas:</span>
                        </div>
                        <p className="text-zinc-700 leading-relaxed pl-4">
                          {log.activity_log || '-'}
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-2.5 border border-zinc-200">
                        <div className="flex items-center gap-1 font-bold text-zinc-900 mb-0.5">
                          <BookOpen className="h-3 w-3 text-zinc-700" />
                          <span>Pembelajaran:</span>
                        </div>
                        <p className="text-zinc-700 leading-relaxed pl-4">
                          {log.lesson_learned || '-'}
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-2.5 border border-zinc-200">
                        <div className="flex items-center gap-1 font-bold text-zinc-900 mb-0.5">
                          <AlertCircle className="h-3 w-3 text-zinc-700" />
                          <span>Kendala:</span>
                        </div>
                        <p className="text-zinc-700 leading-relaxed pl-4">
                          {log.obstacles || '-'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs italic text-zinc-400">
                      Uraian laporan belum tersedia untuk tanggal ini.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
