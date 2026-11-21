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
  Building2,
  ShieldCheck,
  X,
  Copy,
  Check,
  Coffee,
} from 'lucide-react';

interface ProfileTabProps {
  user: MonevUser | null;
  token?: string | null;
  onSelectTab?: (tab: 'form' | 'history' | 'profile' | 'token') => void;
  onRefreshUser?: () => void;
}

export default function ProfileTab({ user, token, onSelectTab, onRefreshUser }: ProfileTabProps) {
  const [attendances, setAttendances]       = useState<Attendance[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [isRefreshing, setIsRefreshing]     = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<Attendance | null>(null);
  const [copiedId, setCopiedId]             = useState<string | null>(null);

  const fetchReportData = async () => {
    if (!token) return;
    setLoadingReports(true);
    try {
      const res = await fetch('/api/monev/attendances', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      const list: Attendance[] = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAttendances(list);
    } catch {}
    finally { setLoadingReports(false); }
  };

  useEffect(() => { fetchReportData(); }, [token]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    if (onRefreshUser) await onRefreshUser();
    await fetchReportData();
    setIsRefreshing(false);
  };

  const copyCardContent = (item: Attendance) => {
    if (!item.log) return;
    const text = `LAPORAN HARIAN MAGANGHUB KEMNAKER (${item.date})\n\n1. Uraian Aktivitas:\n${item.log.activity_log}\n\n2. Pembelajaran yang Diperoleh:\n${item.log.lesson_learned}\n\n3. Kendala yang Dialami:\n${item.log.obstacles}`;
    navigator.clipboard.writeText(text);
    setCopiedId(String(item.id));
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!user) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center text-[#737373] text-sm shadow-xs">
        Data profil peserta tidak ditemukan. Silakan login kembali.
      </div>
    );
  }

  const displayCompany  = user.internship_company || user.company || user.company_name || '';
  const displayPosition = user.job_role || user.position || '';
  const displayLocation = user.internship_location_regency_name || user.location || '';
  const displayStartDate = user.internship_start_date || '';
  const displayEndDate   = user.internship_end_date || '';
  const displayBatch     = user.internship_batch_name || user.batch_name || '';
  const displayMentor    = user.mentor_name || '';

  let progressPercent = 0, daysTotal = 0, daysPassed = 0, daysRemaining = 0;
  if (displayStartDate && displayEndDate) {
    const start = new Date(displayStartDate).getTime();
    const end   = new Date(displayEndDate).getTime();
    const now   = new Date().getTime();
    daysTotal     = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    daysPassed    = Math.max(0, Math.min(daysTotal, Math.round((now - start) / (1000 * 60 * 60 * 24))));
    daysRemaining = Math.max(0, daysTotal - daysPassed);
    progressPercent = Math.min(100, Math.round((daysPassed / daysTotal) * 100));
  }

  const initials = user.name
    ? user.name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('')
    : 'PM';

  const recentReports = attendances.slice(0, 3);

  const renderBadge = (item: Attendance, compact = false) => {
    const { status, approval_status: approval, log } = item;
    const size = compact ? 'text-[10px] px-2 py-0.5 font-medium' : 'text-xs px-2.5 py-1 font-medium';
    const iconSize = compact ? 'h-3 w-3' : 'h-3.5 w-3.5';

    if (log?.state === 'NEEDS_REVISION')
      return <span className={`inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${size}`}><AlertTriangle className={iconSize} />{compact ? 'Revisi' : 'Perlu Revisi'}</span>;
    if (status === 'ON_LEAVE')
      return <span className={`inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${size}`}><Clock className={iconSize} />Izin / Sakit</span>;
    if (status === 'DAYOFF')
      return <span className={`inline-flex items-center gap-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 ${size}`}><Coffee className={iconSize} />{compact ? 'Libur' : 'Hari Libur'}</span>;
    if (approval === 'APPROVED')
      return <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${size}`}><CheckCircle2 className={iconSize} />Disetujui</span>;
    return <span className={`inline-flex items-center gap-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 ${size}`}><Clock className={iconSize} />Menunggu Review</span>;
  };

  return (
    <div className="space-y-6">

      {/* ========================================================
          1. Hero Profile Card
          ======================================================== */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          {/* Avatar & Name Info */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Avatar Initial Tile */}
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-[#171717] text-white text-xl sm:text-2xl font-bold shrink-0">
              {initials}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-0.5 text-[10px] font-medium text-[#737373]">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <span>Peserta Terverifikasi</span>
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-[#171717] truncate leading-tight">
                {user.name || 'Peserta Magang'}
              </h1>
              <p className="text-xs text-[#737373] mt-1 truncate flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                <span>{displayPosition || 'Peserta Magang'} · {displayCompany || 'Mitra Kemnaker'}</span>
                {displayLocation && <span className="text-[#737373]">({displayLocation})</span>}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-lg bg-white hover:bg-[#F8F9FA] border border-[#E5E7EB] px-3.5 py-2 text-xs font-medium text-[#171717] transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>

            <a
              href="https://monev.maganghub.kemnaker.go.id/dashboard"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-white hover:bg-[#F8F9FA] border border-[#E5E7EB] px-3.5 py-2 text-xs font-semibold text-[#171717] transition"
            >
              <span>Portal Kemnaker</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#737373]" />
            </a>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        {displayStartDate && displayEndDate && (
          <div className="border-t border-[#E5E7EB] pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2.5">
              <div className="flex items-center gap-2 font-semibold text-[#171717]">
                <Clock className="h-4 w-4 text-[#737373] shrink-0" />
                <span>Progres Masa Magang</span>
                <span className="rounded bg-[#171717] text-white px-2 py-0.5 text-[11px] font-mono font-bold">
                  {progressPercent}%
                </span>
              </div>
              <div className="text-[11px] text-[#737373]">
                Hari ke-{daysPassed} dari {daysTotal} hari ({daysRemaining} hari tersisa)
              </div>
            </div>
            <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
              <div className="h-full bg-[#171717] rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          2. Internship Details Grid
          ======================================================== */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-[#171717] shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#171717]">Informasi Penempatan Magang</h2>
              <p className="text-xs text-[#737373]">Data terdaftar di sistem MagangHub Kemnaker RI</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <span>Aktif</span>
          </span>
        </div>

        {/* 4 Primary Detail Tiles */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3.5">
          {[
            { label: 'Perusahaan Mitra', value: displayCompany || '-', icon: Building2 },
            { label: 'Posisi Magang',   value: displayPosition || '-', icon: Briefcase },
            { label: 'Kab/Kota Penempatan', value: displayLocation || '-', icon: MapPin },
            {
              label: 'Periode Program',
              value: displayStartDate && displayEndDate
                ? `${formatDateIndo(displayStartDate)} – ${formatDateIndo(displayEndDate)}`
                : displayStartDate ? formatDateIndo(displayStartDate) : '-',
              sub: displayBatch ? `Batch: ${displayBatch}` : undefined,
              icon: Calendar,
            },
          ].map(({ label, value, sub, icon: Icon }) => (
            <div key={label} className="rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] p-4">
              <div className="flex items-center gap-1.5 mb-1.5 text-[#737373]">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider block">{label}</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#171717] leading-snug">{value}</p>
              {sub && <p className="text-[11px] text-[#737373] mt-1">{sub}</p>}
            </div>
          ))}
        </div>

        {/* Mentor & Institution Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-[#E5E7EB] text-xs">
          <div className="flex items-center gap-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] p-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-[#E5E7EB] shrink-0 text-[#171717]">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-[#737373] font-semibold block uppercase">Mentor Perusahaan</span>
              <strong className="text-[#171717] truncate block text-xs sm:text-sm font-bold">{displayMentor || 'Belum Ditugaskan'}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] p-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-[#E5E7EB] shrink-0 text-[#171717]">
              <GraduationCap className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-[#737373] font-semibold block uppercase">Institusi Pendidikan</span>
              <strong className="text-[#171717] truncate block text-xs sm:text-sm font-bold">{user.institution_name || user.university || '-'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. Recent Reports Section (1 Laporan = 1 Card)
          ======================================================== */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-[#171717] shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#171717]">Laporan Aktivitas Terakhir</h3>
              <p className="text-xs text-[#737373]">Klik kartu untuk melihat rincian isi laporan</p>
            </div>
          </div>

          {onSelectTab && (
            <button
              type="button"
              onClick={() => onSelectTab('history')}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#171717] hover:text-[#737373] transition cursor-pointer"
            >
              <span>Buka Semua Riwayat</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {loadingReports ? (
          <div className="py-10 text-center text-xs text-[#737373]">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#737373]" />
            <span>Memuat catatan laporan terbaru...</span>
          </div>
        ) : recentReports.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#E5E7EB] py-10 text-center text-xs text-[#737373]">
            Belum ada data laporan yang tercatat.
          </div>
        ) : (
          /* Grid 1 Laporan = 1 Card */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentReports.map((item, idx) => {
              const log = item.log;
              const needsRevision = log?.state === 'NEEDS_REVISION';

              return (
                <div
                  key={item.id ? `profile-rep-${item.id}` : `profile-idx-${idx}`}
                  onClick={() => setSelectedDetail(item)}
                  className={`group flex flex-col justify-between rounded-xl bg-[#F8F9FA] hover:bg-white border p-4 transition-all duration-200 cursor-pointer select-none shadow-xs ${
                    needsRevision
                      ? 'border-amber-300 hover:border-amber-400 bg-amber-50/20'
                      : 'border-[#E5E7EB] hover:border-[#171717]'
                  }`}
                >
                  <div>
                    {/* Card Header: Tanggal & Status Badge */}
                    <div className="flex items-center justify-between gap-1.5 border-b border-[#E5E7EB] pb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg bg-white border border-[#E5E7EB]">
                          <span className="text-[8px] font-bold uppercase text-[#737373] leading-none">
                            {new Date(item.date).toLocaleString('id-ID', { month: 'short' })}
                          </span>
                          <span className="text-xs font-bold leading-tight text-[#171717]">
                            {new Date(item.date).getDate()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#171717] truncate leading-tight">
                            {formatDateIndo(item.date)}
                          </p>
                          {item.latitude && item.longitude && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] text-[#737373] font-mono">
                              <MapPin className="h-2.5 w-2.5" />
                              <span>GPS Tersimpan</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-2.5">
                      {renderBadge(item, true)}
                    </div>

                    {/* Needs Revision Warning Box */}
                    {needsRevision && (
                      <div className="mt-2.5 rounded-lg bg-amber-50 border border-amber-200 p-2 text-[10px] text-amber-900 leading-tight">
                        <span className="font-semibold flex items-center gap-1 mb-0.5">
                          <AlertTriangle className="h-3 w-3 shrink-0 text-amber-600" />
                          <span>Catatan Mentor:</span>
                        </span>
                        <p className="line-clamp-2 text-amber-800">{log?.reviewer_notes || 'Perbaikan uraian laporan diperlukan'}</p>
                      </div>
                    )}

                    {/* Preview Snippet */}
                    {item.status === 'ON_LEAVE' ? (
                      <p className="mt-2.5 text-xs text-[#737373] line-clamp-3 italic leading-relaxed">
                        Izin: {item.leave_reason || 'Tidak ada catatan alasan.'}
                      </p>
                    ) : log ? (
                      <p className="mt-2.5 text-xs text-[#737373] line-clamp-3 leading-relaxed">
                        {log.activity_log || 'Aktivitas magang terisi.'}
                      </p>
                    ) : (
                      <p className="mt-2.5 text-xs italic text-[#737373]">Uraian laporan belum tersedia.</p>
                    )}
                  </div>

                  {/* Card Footer: Action Link & Point Count */}
                  <div className="mt-3.5 pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#171717] group-hover:underline flex items-center gap-1">
                      <span>Lihat Detail</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    {log && (
                      <span className="text-[10px] text-[#737373] font-mono">
                        {[log.activity_log, log.lesson_learned, log.obstacles].filter(Boolean).length}/3 poin
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================
          Modal Detail Laporan Harian (Clean Minimalist White Modal)
          ============================================================ */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden bg-white border border-[#E5E7EB] rounded-xl shadow-lg">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] p-5 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
                  <span className="text-[9px] font-bold uppercase text-[#737373] leading-none">
                    {new Date(selectedDetail.date).toLocaleString('id-ID', { month: 'short' })}
                  </span>
                  <span className="text-base font-bold text-[#171717] leading-tight">
                    {new Date(selectedDetail.date).getDate()}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-[#171717] truncate">
                    {formatDateIndo(selectedDetail.date)}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-[#737373]">
                    <span>
                      Status: <strong>{selectedDetail.status === 'PRESENT' ? 'Hadir' : selectedDetail.status === 'ON_LEAVE' ? 'Izin / Sakit' : 'Alfa'}</strong>
                    </span>
                    {selectedDetail.latitude && selectedDetail.longitude && (
                      <span className="text-[10px] font-mono text-[#737373] bg-[#F8F9FA] border border-[#E5E7EB] px-2 py-0.5 rounded">
                        {selectedDetail.latitude.toFixed(4)}, {selectedDetail.longitude.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {renderBadge(selectedDetail)}
                <button
                  type="button"
                  onClick={() => setSelectedDetail(null)}
                  className="rounded-lg p-1.5 text-[#737373] hover:text-[#171717] hover:bg-[#F8F9FA] transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* Catatan Reviewer jika Perlu Revisi */}
              {selectedDetail.log?.state === 'NEEDS_REVISION' && selectedDetail.log?.reviewer_notes && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>Catatan Evaluasi dari Mentor:</span>
                  </div>
                  <p className="leading-relaxed pl-6 text-amber-800">{selectedDetail.log.reviewer_notes}</p>
                </div>
              )}

              {/* Status: ON_LEAVE */}
              {selectedDetail.status === 'ON_LEAVE' && (
                <div className="rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] p-4 text-xs space-y-1">
                  <p className="font-semibold text-[#171717]">Alasan Ketidakhadiran:</p>
                  <p className="text-[#737373] leading-relaxed whitespace-pre-line">{selectedDetail.leave_reason || 'Tidak ada catatan alasan.'}</p>
                </div>
              )}

              {/* Status: PRESENT -> 3 Poin Laporan Lengkap */}
              {selectedDetail.status === 'PRESENT' && (
                selectedDetail.log ? (
                  <div className="space-y-3.5 text-xs">
                    {[
                      { icon: FileText, label: '1. Uraian Aktivitas yang Dikerjakan', text: selectedDetail.log.activity_log, len: selectedDetail.log.activity_log?.length || 0 },
                      { icon: BookOpen, label: '2. Capaian Pembelajaran yang Diperoleh', text: selectedDetail.log.lesson_learned, len: selectedDetail.log.lesson_learned?.length || 0 },
                      { icon: AlertCircle, label: '3. Kendala & Hambatan yang Dialami', text: selectedDetail.log.obstacles, len: selectedDetail.log.obstacles?.length || 0 },
                    ].map(({ icon: Icon, label, text, len }) => (
                      <div key={label} className="rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] p-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 font-semibold text-[#171717]">
                            <Icon className="h-4 w-4 text-[#737373] shrink-0" />
                            <span>{label}</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#737373]">{len} karakter</span>
                        </div>
                        <p className="text-[#171717] leading-relaxed whitespace-pre-line pl-6 text-xs sm:text-sm">
                          {text || '-'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[#E5E7EB] p-8 text-center text-xs text-[#737373]">
                    Rincian uraian teks laporan tidak tersedia untuk entri ini.
                  </div>
                )
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#E5E7EB] px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 shrink-0 bg-[#F8F9FA]">
              <span className="text-[10px] font-mono text-[#737373]">
                Log ID: {selectedDetail.id ? String(selectedDetail.id).slice(0, 10) : '-'}...
              </span>
              <div className="flex items-center gap-2">
                {selectedDetail.log && (
                  <button
                    type="button"
                    onClick={() => copyCardContent(selectedDetail)}
                    className="flex items-center gap-1.5 rounded-lg bg-white hover:bg-[#F0F1F3] border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#171717] transition cursor-pointer"
                  >
                    {copiedId === String(selectedDetail.id) ? (
                      <><Check className="h-3.5 w-3.5 text-emerald-600" /><span className="text-emerald-700">Tersalin</span></>
                    ) : (
                      <><Copy className="h-3.5 w-3.5 text-[#737373]" /><span>Salin Teks</span></>
                    )}
                  </button>
                )}

                {onSelectTab && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDetail(null);
                      onSelectTab('history');
                    }}
                    className="flex items-center gap-1 rounded-lg bg-[#171717] hover:bg-black text-white px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer"
                  >
                    <span>Buka di Riwayat</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedDetail(null)}
                  className="rounded-lg bg-white hover:bg-[#F0F1F3] border border-[#E5E7EB] px-3.5 py-1.5 text-xs font-medium text-[#737373] hover:text-[#171717] transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
