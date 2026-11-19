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
  Edit3,
  X,
  Briefcase,
  Layers,
} from 'lucide-react';

interface ProfileTabProps {
  user: MonevUser | null;
  token?: string | null;
  onSelectTab?: (tab: 'form' | 'history' | 'profile' | 'token') => void;
  onRefreshUser?: () => void;
}

interface CustomInternshipInfo {
  company?: string;
  position?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  batch?: string;
  mentor?: string;
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

  // Modal Sesuaikan Informasi Magang
  const [showEditModal, setShowEditModal] = useState(false);
  const [customInfo, setCustomInfo] = useState<CustomInternshipInfo>({});
  const [editCompany, setEditCompany] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editBatch, setEditBatch] = useState('');
  const [editMentor, setEditMentor] = useState('');

  // Restore custom internship info from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('monev-custom-internship-info');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomInfo(parsed);
      }
    } catch {}
  }, []);

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

  // Tentukan data gabungan (Custom override || Server API Kemnaker)
  const displayCompany =
    customInfo.company ||
    user.internship_company ||
    user.company ||
    user.company_name ||
    '';

  const displayPosition =
    customInfo.position ||
    user.job_role ||
    user.position ||
    '';

  const displayLocation =
    customInfo.location ||
    user.internship_location_regency_name ||
    user.location ||
    '';

  const displayStartDate =
    customInfo.startDate ||
    user.internship_start_date ||
    '';

  const displayEndDate =
    customInfo.endDate ||
    user.internship_end_date ||
    '';

  const displayBatch =
    customInfo.batch ||
    user.internship_batch_name ||
    user.batch_name ||
    '';

  const displayMentor =
    customInfo.mentor ||
    user.mentor_name ||
    '';

  const openEditModal = () => {
    setEditCompany(displayCompany);
    setEditPosition(displayPosition);
    setEditLocation(displayLocation);
    setEditStartDate(displayStartDate ? displayStartDate.slice(0, 10) : '');
    setEditEndDate(displayEndDate ? displayEndDate.slice(0, 10) : '');
    setEditBatch(displayBatch);
    setEditMentor(displayMentor);
    setShowEditModal(true);
  };

  const handleSaveCustomInfo = () => {
    const updated: CustomInternshipInfo = {
      company: editCompany.trim(),
      position: editPosition.trim(),
      location: editLocation.trim(),
      startDate: editStartDate.trim(),
      endDate: editEndDate.trim(),
      batch: editBatch.trim(),
      mentor: editMentor.trim(),
    };
    setCustomInfo(updated);
    localStorage.setItem('monev-custom-internship-info', JSON.stringify(updated));
    setShowEditModal(false);
  };

  const handleResetCustomInfo = () => {
    setCustomInfo({});
    localStorage.removeItem('monev-custom-internship-info');
    setShowEditModal(false);
  };

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

  if (displayStartDate && displayEndDate) {
    const start = new Date(displayStartDate).getTime();
    const end = new Date(displayEndDate).getTime();
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
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {displayPosition || 'Peserta Magang'} &bull; {displayCompany || 'Mitra Kemnaker'}
                {displayLocation && ` &bull; ${displayLocation}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto pt-2 sm:pt-0">
            <button
              type="button"
              onClick={openEditModal}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition"
              title="Sesuaikan Data Magang"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Sesuaikan</span>
            </button>

            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition disabled:opacity-50"
              title="Segarkan Data"
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
              <span>Portal Asli</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Progress Periode Magang */}
        {displayStartDate && displayEndDate && (
          <div className="border-t border-zinc-100 bg-zinc-50/70 px-4 py-3 sm:px-8 sm:py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <Clock className="h-3.5 w-3.5 text-zinc-800 shrink-0" />
                <span>Progres Magang:</span>
                <span className="rounded bg-zinc-950 px-2 py-0.5 text-[11px] font-mono font-bold text-white">
                  {progressPercent}%
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 font-medium">
                Hari {daysPassed} / {daysTotal} ({daysRemaining} hari tersisa)
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

      {/* 2. Kartu Resmi: Informasi Magang (Perusahaan, Posisi, Lokasi Posisi, Periode Magang) */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-zinc-950 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-950">
              Informasi Magang
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-900 border border-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
              Aktif
            </span>

            <button
              type="button"
              onClick={openEditModal}
              className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-2.5 py-1 rounded-lg transition"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Grid 4 Elemen Pokok Resmi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          {/* 1. Perusahaan */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Perusahaan
            </span>
            <p className="text-sm font-bold text-zinc-950 leading-snug">
              {displayCompany || '-'}
            </p>
          </div>

          {/* 2. Posisi */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Posisi
            </span>
            <p className="text-sm font-bold text-zinc-950 leading-snug">
              {displayPosition || '-'}
            </p>
          </div>

          {/* 3. Lokasi Posisi */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Lokasi
            </span>
            <p className="text-sm font-bold text-zinc-950 leading-snug">
              {displayLocation || '-'}
            </p>
          </div>

          {/* 4. Periode Magang */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Periode
            </span>
            <p className="text-sm font-bold text-zinc-950 leading-snug">
              {displayStartDate && displayEndDate
                ? `${formatDateIndo(displayStartDate)} s/d ${formatDateIndo(displayEndDate)}`
                : displayStartDate
                ? formatDateIndo(displayStartDate)
                : '-'}
            </p>
            {displayBatch && (
              <p className="text-[11px] text-zinc-500 mt-1">Batch {displayBatch}</p>
            )}
          </div>
        </div>

        {/* Rincian Tambahan: Mentor & Asal Institusi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-100 text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-zinc-700 shrink-0" />
            <span className="text-zinc-500">Mentor:</span>
            <strong className="text-zinc-900">{displayMentor || '-'}</strong>
          </div>

          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-zinc-700 shrink-0" />
            <span className="text-zinc-500">Institusi:</span>
            <strong className="text-zinc-900">{user.institution_name || user.university || '-'}</strong>
          </div>
        </div>
      </div>

      {/* 3. Rangkuman KPI & Statistik (Monochrome) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-500">
            Statistik Kehadiran
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: Hadir */}
          <div className="rounded-xl border border-zinc-200 bg-white p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
              <span>Hadir</span>
              <Calendar className="h-3.5 w-3.5 text-zinc-700" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-950">
              {loadingReports ? '...' : presentCount}
            </div>
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
          </div>

          {/* Card 4: Izin / Cuti */}
          <div className="rounded-xl border border-zinc-200 bg-white p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-1">
              <span>Izin / Cuti</span>
              <Clock className="h-3.5 w-3.5 text-zinc-700" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-950">
              {loadingReports ? '...' : leaveCount}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bagian Data Laporan Terakhir */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
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

      {/* Modal Sesuaikan Informasi Magang */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-5 py-4 shrink-0">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4.5 w-4.5 text-zinc-900" />
                <h3 className="font-bold text-sm sm:text-base text-zinc-900">
                  Sesuaikan Informasi Magang
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              {/* 1. Perusahaan */}
              <div>
                <label className="block font-bold text-zinc-800 mb-1">
                  Nama Perusahaan:
                </label>
                <input
                  type="text"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  placeholder="Contoh: PT Bank Rakyat Indonesia (Persero) Tbk"
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-900 focus:border-zinc-950 focus:outline-none"
                />
              </div>

              {/* 2. Posisi */}
              <div>
                <label className="block font-bold text-zinc-800 mb-1">
                  Posisi / Role:
                </label>
                <input
                  type="text"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  placeholder="Contoh: Software Engineer Intern"
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-900 focus:border-zinc-950 focus:outline-none"
                />
              </div>

              {/* 3. Lokasi Posisi */}
              <div>
                <label className="block font-bold text-zinc-800 mb-1">
                  Lokasi:
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="Contoh: Kabupaten Bondowoso"
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-900 focus:border-zinc-950 focus:outline-none"
                />
              </div>

              {/* 4. Periode Magang (Mulai & Selesai) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Tanggal Mulai:
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Tanggal Selesai:
                  </label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              {/* 5. Batch & Mentor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Batch:
                  </label>
                  <input
                    type="text"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    placeholder="Contoh: 1"
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Mentor:
                  </label>
                  <input
                    type="text"
                    value={editMentor}
                    onChange={(e) => setEditMentor(e.target.value)}
                    placeholder="Nama mentor pembimbing"
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-5 py-3 shrink-0">
              <button
                type="button"
                onClick={handleResetCustomInfo}
                className="text-xs text-zinc-500 hover:text-zinc-800 font-semibold underline"
              >
                Reset ke Data Asli Server
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleSaveCustomInfo}
                  className="rounded-lg bg-zinc-950 px-4 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
