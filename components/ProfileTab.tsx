'use client';

import React, { useState, useEffect } from 'react';
import { MonevUser, Attendance } from '@/types/monev';
import { formatDateIndo } from '@/lib/monev';
import {
  Building2,
  Calendar,
  ShieldCheck,
  Copy,
  Check,
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
  TrendingUp,
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
  const [copiedId, setCopiedId] = useState(false);
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

      // Urutkan tanggal terbaru paling atas
      list.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setAttendances(list);
    } catch {
      // Abaikan jika offline/gagal
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

  const copyId = () => {
    if (user.id) {
      navigator.clipboard.writeText(String(user.id));
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Hitung progres durasi magang
  let progressPercent = 0;
  let daysTotal = 0;
  let daysPassed = 0;
  let daysRemaining = 0;

  if (user.internship_start_date && user.internship_end_date) {
    const start = new Date(user.internship_start_date).getTime();
    const end = new Date(user.internship_end_date).getTime();
    const now = new Date().getTime();

    daysTotal = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    daysPassed = Math.max(0, Math.min(daysTotal, Math.round((now - start) / (1000 * 60 * 60 * 24))));
    daysRemaining = Math.max(0, daysTotal - daysPassed);
    progressPercent = Math.min(100, Math.round((daysPassed / daysTotal) * 100));
  }

  // Statistik Laporan Lengkap
  const totalReports = attendances.length;
  const presentCount = attendances.filter((a) => a.status === 'PRESENT').length;
  const approvedCount = attendances.filter((a) => a.approval_status === 'APPROVED').length;
  const pendingCount = attendances.filter(
    (a) => a.approval_status === 'SUBMITTED' && a.log?.state !== 'NEEDS_REVISION'
  ).length;
  const revisionCount = attendances.filter((a) => a.log?.state === 'NEEDS_REVISION').length;
  const leaveCount = attendances.filter((a) => a.status === 'ON_LEAVE').length;
  const withLogCount = attendances.filter((a) => a.log && a.log.activity_log).length;

  const attendanceRate = daysPassed > 0 ? Math.min(100, Math.round((presentCount / daysPassed) * 100)) : 100;

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
      {/* 1. Kartu Header Utama (Simple Flat Monochrome) */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {/* Solid Dark Banner */}
        <div className="bg-zinc-950 px-4 py-5 sm:px-8 sm:py-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-zinc-800 text-base sm:text-xl font-black text-white shrink-0 border border-zinc-700">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-white">
                  {user.name || 'Peserta Magang'}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-300 border border-zinc-700">
                  <ShieldCheck className="h-3 w-3 text-zinc-200" />
                  Terverifikasi
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {user.position || 'Peserta Program Magang'} &bull; {user.company_name || 'Mitra Kemnaker'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto pt-2 sm:pt-0">
            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition disabled:opacity-50"
              title="Segarkan Profil & Laporan"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>

            <a
              href="https://monev.maganghub.kemnaker.go.id/dashboard"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-zinc-100 transition"
            >
              <span>Dashboard Asli</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Progress Periode Magang */}
        {user.internship_start_date && user.internship_end_date && (
          <div className="border-t border-zinc-100 bg-zinc-50/70 px-4 py-3 sm:px-8 sm:py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <Clock className="h-3.5 w-3.5 text-zinc-800 shrink-0" />
                <span>Progres Pelaksanaan Magang:</span>
                <span className="rounded bg-zinc-950 px-2 py-0.5 text-[11px] font-mono font-bold text-white">
                  {progressPercent}%
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 font-medium">
                Hari ke-<strong>{daysPassed}</strong> dari <strong>{daysTotal}</strong> hari ({daysRemaining} hari tersisa)
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full bg-zinc-950 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Rangkuman KPI & Statistik Laporan Lengkap (Monochrome) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-500">
            Ringkasan Kehadiran & Laporan Lengkap
          </h2>
          <span className="text-[11px] text-zinc-400 font-medium">
            Total {totalReports} Catatan
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: Hadir */}
          <div className="rounded-xl border border-zinc-200 bg-white p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
              <span>Total Hadir</span>
              <Calendar className="h-3.5 w-3.5 text-zinc-700" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-950">
              {loadingReports ? '...' : presentCount}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {withLogCount} terisi uraian lengkap
            </p>
          </div>

          {/* Card 2: Disetujui */}
          <div className="rounded-xl border border-zinc-200 bg-white p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
              <span>Disetujui</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-950" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-950">
              {loadingReports ? '...' : approvedCount}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Telah disetujui mentor
            </p>
          </div>

          {/* Card 3: Menunggu / Perlu Revisi */}
          <div className="rounded-xl border border-zinc-200 bg-white p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
              <span>Evaluasi</span>
              <AlertCircle className="h-3.5 w-3.5 text-zinc-700" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-950">
              {loadingReports ? '...' : pendingCount}
              {revisionCount > 0 && (
                <span className="text-xs font-semibold text-zinc-600 ml-1.5">
                  ({revisionCount} revisi)
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {revisionCount > 0 ? 'Ada laporan perlu perbaikan' : 'Menunggu review'}
            </p>
          </div>

          {/* Card 4: Izin / Cuti */}
          <div className="rounded-xl border border-zinc-200 bg-white p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
              <span>Izin / Sakit</span>
              <Clock className="h-3.5 w-3.5 text-zinc-700" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-950">
              {loadingReports ? '...' : leaveCount}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Tingkat kehadiran: <strong>{attendanceRate}%</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Grid Rincian Data Peserta & Magang */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Kolom 1: Perusahaan & Pembimbing */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Building2 className="h-4.5 w-4.5 text-zinc-950 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-zinc-950">
              Penempatan & Mentor Magang
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-zinc-400 font-medium block">Perusahaan Mitra Penyelenggara:</span>
              <p className="text-zinc-950 font-bold text-sm mt-0.5">
                {user.company_name || 'Mitra Penyelenggara Magang'}
              </p>
            </div>

            <div>
              <span className="text-zinc-400 font-medium block">Divisi / Posisi Pekerjaan:</span>
              <p className="text-zinc-800 font-semibold mt-0.5">
                {user.position || 'Peserta Program Magang Kemnaker'}
              </p>
            </div>

            <div>
              <span className="text-zinc-400 font-medium block">Mentor / Pembimbing Lapangan:</span>
              <div className="flex items-center gap-1.5 text-zinc-950 font-semibold mt-0.5">
                <UserCheck className="h-3.5 w-3.5 text-zinc-700" />
                <span>{user.mentor_name || 'Pembimbing Lapangan'}</span>
              </div>
            </div>

            <div>
              <span className="text-zinc-400 font-medium block">Periode Pelaksanaan:</span>
              <p className="text-zinc-800 font-semibold mt-0.5">
                {user.internship_start_date ? formatDateIndo(user.internship_start_date) : '-'} s/d{' '}
                {user.internship_end_date ? formatDateIndo(user.internship_end_date) : 'Selesai'}
              </p>
            </div>
          </div>
        </div>

        {/* Kolom 2: Identitas Peserta & SIAPkerja */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <GraduationCap className="h-4.5 w-4.5 text-zinc-950 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-zinc-950">
              Identitas & Akun SIAPkerja
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-zinc-400 font-medium block">Nama Lengkap Peserta:</span>
              <p className="text-zinc-950 font-bold text-sm mt-0.5">
                {user.name || '-'}
              </p>
            </div>

            <div>
              <span className="text-zinc-400 font-medium block">Asal Institusi / Universitas:</span>
              <p className="text-zinc-800 font-semibold mt-0.5">
                {user.institution_name || user.university || 'Peserta Terdaftar MagangHub'}
              </p>
            </div>

            <div>
              <span className="text-zinc-400 font-medium block">Email Terdaftar:</span>
              <p className="text-zinc-800 font-mono font-medium mt-0.5">
                {user.email || '-'}
              </p>
            </div>

            <div>
              <span className="text-zinc-400 font-medium block">ID Peserta Sistem:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <code className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-zinc-900 border border-zinc-200 font-bold">
                  {user.id ? String(user.id) : '-'}
                </code>
                {user.id && (
                  <button
                    type="button"
                    onClick={copyId}
                    className="flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-200 transition border border-zinc-200"
                  >
                    {copiedId ? (
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bagian Data Laporan Lengkap Terbaru Langsung di Profil */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-zinc-950 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-zinc-950">
                Data Laporan Harian Terakhir
              </h3>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Rincian uraian aktivitas lengkap peserta magang yang tercatat di sistem
            </p>
          </div>

          {onSelectTab && (
            <button
              type="button"
              onClick={() => onSelectTab('history')}
              className="flex items-center gap-1 text-xs font-semibold text-zinc-800 hover:text-zinc-950 transition self-start sm:self-auto"
            >
              <span>Buka Semua di Riwayat</span>
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
          <div className="space-y-3.5">
            {recentReports.map((item, idx) => {
              const log = item.log;
              const isApproved = item.approval_status === 'APPROVED';
              const needsRevision = log?.state === 'NEEDS_REVISION';

              return (
                <div
                  key={item.id ? `profile-rep-${item.id}` : `profile-idx-${idx}`}
                  className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 sm:p-4 space-y-2.5 transition hover:border-zinc-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/80 pb-2">
                    <div className="flex items-center gap-2">
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
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2.5 py-0.5 text-[11px] font-bold text-zinc-950 border border-zinc-400">
                          <AlertTriangle className="h-3 w-3" />
                          Perlu Revisi
                        </span>
                      ) : isApproved ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-950 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                          <CheckCircle2 className="h-3 w-3" />
                          Disetujui
                        </span>
                      ) : item.status === 'ON_LEAVE' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-800">
                          Izin / Cuti
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 border border-zinc-200">
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
                          <span>1. Aktivitas:</span>
                        </div>
                        <p className="text-zinc-700 leading-relaxed pl-4">
                          {log.activity_log || '-'}
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-2.5 border border-zinc-200">
                        <div className="flex items-center gap-1 font-bold text-zinc-900 mb-0.5">
                          <BookOpen className="h-3 w-3 text-zinc-700" />
                          <span>2. Pembelajaran:</span>
                        </div>
                        <p className="text-zinc-700 leading-relaxed pl-4">
                          {log.lesson_learned || '-'}
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-2.5 border border-zinc-200">
                        <div className="flex items-center gap-1 font-bold text-zinc-900 mb-0.5">
                          <AlertCircle className="h-3 w-3 text-zinc-700" />
                          <span>3. Kendala:</span>
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
