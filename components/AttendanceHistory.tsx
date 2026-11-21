'use client';

import React, { useState, useEffect } from 'react';
import { Attendance, DailyLog } from '@/types/monev';
import { formatDateIndo } from '@/lib/monev';
import {
  Calendar,
  Clock,
  Coffee,
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
  ArrowRight,
} from 'lucide-react';

interface AttendanceHistoryProps {
  token: string;
}

export default function AttendanceHistory({ token }: AttendanceHistoryProps) {
  const [attendances, setAttendances]   = useState<Attendance[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'APPROVED' | 'SUBMITTED' | 'REVISION' | 'LEAVE'>('ALL');
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedDetail, setSelectedDetail] = useState<Attendance | null>(null);

  const [editingLog, setEditingLog]               = useState<DailyLog | null>(null);
  const [revisionActivity, setRevisionActivity]   = useState('');
  const [revisionLesson, setRevisionLesson]       = useState('');
  const [revisionObstacles, setRevisionObstacles] = useState('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [revisionAlert, setRevisionAlert]         = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAttendances = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/monev/attendances', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Gagal mengambil riwayat kehadiran');
      const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      items.sort((a: Attendance, b: Attendance) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAttendances(items);
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat memuat data presensi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchAttendances(); }, [token]);

  const openRevisionModal = (log: DailyLog) => {
    setEditingLog(log);
    setRevisionActivity(log.activity_log || '');
    setRevisionLesson(log.lesson_learned || '');
    setRevisionObstacles(log.obstacles || '');
    setRevisionAlert(null);
  };

  const handleSaveRevision = async () => {
    if (!editingLog?.id) return;
    if (revisionActivity.trim().length < 100 || revisionLesson.trim().length < 100 || revisionObstacles.trim().length < 100) {
      setRevisionAlert('Semua poin uraian perbaikan wajib memenuhi batas minimal 100 karakter.');
      return;
    }
    setIsSubmittingRevision(true);
    setRevisionAlert(null);
    try {
      const res = await fetch(`/api/monev/daily-logs/${editingLog.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editingLog.date,
          activity_log: revisionActivity.trim(),
          lesson_learned: revisionLesson.trim(),
          obstacles: revisionObstacles.trim(),
          state: 'REVISION_SUBMITTED',
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || 'Gagal menyimpan perbaikan laporan');
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
    const text = `LAPORAN HARIAN MAGANGHUB KEMNAKER (${item.date})\n\n1. Uraian Aktivitas:\n${item.log.activity_log}\n\n2. Pembelajaran yang Diperoleh:\n${item.log.lesson_learned}\n\n3. Kendala yang Dialami:\n${item.log.obstacles}`;
    navigator.clipboard.writeText(text);
    setCopiedId(String(item.id));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalCount    = attendances.length;
  const approvedCount = attendances.filter((a) => a.approval_status === 'APPROVED').length;
  const pendingCount  = attendances.filter((a) => a.approval_status === 'SUBMITTED' && a.log?.state !== 'NEEDS_REVISION').length;
  const revisionCount = attendances.filter((a) => a.log?.state === 'NEEDS_REVISION').length;

  const filteredAttendances = attendances.filter((item) => {
    if (filterStatus === 'APPROVED'  && item.approval_status !== 'APPROVED') return false;
    if (filterStatus === 'SUBMITTED' && (item.approval_status !== 'SUBMITTED' || item.log?.state === 'NEEDS_REVISION')) return false;
    if (filterStatus === 'REVISION'  && item.log?.state !== 'NEEDS_REVISION') return false;
    if (filterStatus === 'LEAVE'     && item.status !== 'ON_LEAVE' && item.status !== 'ABSENT') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.date.toLowerCase().includes(q) ||
        item.log?.activity_log?.toLowerCase().includes(q) ||
        item.log?.lesson_learned?.toLowerCase().includes(q) ||
        item.log?.obstacles?.toLowerCase().includes(q) ||
        item.leave_reason?.toLowerCase().includes(q);
    }
    return true;
  });

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
    if (status === 'ABSENT')
      return <span className={`inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-200 ${size}`}><XCircle className={iconSize} />Alfa</span>;
    if (approval === 'APPROVED')
      return <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${size}`}><CheckCircle2 className={iconSize} />Disetujui</span>;
    return <span className={`inline-flex items-center gap-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 ${size}`}><Clock className={iconSize} />Menunggu Review</span>;
  };

  return (
    <div className="space-y-6">

      {/* ---- Summary Header Card ---- */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-7 space-y-6 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-[#171717] shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#171717]">
                Riwayat Laporan &amp; Presensi
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Pantau status persetujuan mentor dan catatan perbaikan
              </p>
            </div>
          </div>

          <button
            onClick={fetchAttendances}
            disabled={loading}
            className="flex items-center justify-center gap-2 self-start sm:self-auto rounded-lg bg-white hover:bg-[#F8F9FA] border border-[#E5E7EB] px-3.5 py-1.5 text-xs font-medium text-[#171717] transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan Data</span>
          </button>
        </div>

        {/* 4 Stat Metric Tiles */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            { label: 'Total Laporan', value: totalCount, isAlert: false },
            { label: 'Disetujui Mentor', value: approvedCount, isAlert: false },
            { label: 'Menunggu Review', value: pendingCount, isAlert: false },
            { label: 'Perlu Revisi', value: revisionCount, isAlert: revisionCount > 0 },
          ].map(({ label, value, isAlert }) => (
            <div
              key={label}
              className={`rounded-xl p-4 border ${
                isAlert
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-[#F8F9FA] border-[#E5E7EB]'
              }`}
            >
              <p className="text-[11px] text-[#737373] font-semibold uppercase tracking-wider truncate">
                {label}
              </p>
              <p className={`text-2xl sm:text-3xl font-bold mt-1 leading-none ${isAlert ? 'text-amber-700' : 'text-[#171717]'}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between border-t border-[#E5E7EB] pt-5">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#737373]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aktivitas, kendala atau tanggal..."
              className="w-full rounded-lg bg-white border border-[#E5E7EB] pl-9 pr-8 py-2 text-xs text-[#171717] placeholder:text-[#737373] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#737373] hover:text-[#171717]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="inline-flex items-center gap-1 bg-[#F8F9FA] p-1 rounded-lg border border-[#E5E7EB] overflow-x-auto no-scrollbar whitespace-nowrap">
            {([
              { key: 'ALL',      label: `Semua (${totalCount})` },
              { key: 'APPROVED', label: `Disetujui (${approvedCount})` },
              { key: 'SUBMITTED',label: `Menunggu (${pendingCount})` },
              ...(revisionCount > 0 ? [{ key: 'REVISION', label: `Revisi (${revisionCount})` }] : []),
            ] as const).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key as typeof filterStatus)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer shrink-0 ${
                  filterStatus === f.key
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Error Notice ---- */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3.5 flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ---- Loading Indicator ---- */}
      {loading ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl py-16 text-center shadow-xs">
          <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-[#737373]" />
          <p className="text-sm font-semibold text-[#171717]">Memuat Data dari MagangHub Kemnaker...</p>
          <p className="text-xs text-[#737373] mt-1">Mengambil rekapitulasi presensi dan catatan mentor</p>
        </div>

      /* ---- Empty Notice ---- */
      ) : filteredAttendances.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl py-16 text-center shadow-xs">
          <div className="mx-auto mb-3 h-12 w-12 flex items-center justify-center rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-[#171717]">
            <Calendar className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-[#171717]">Tidak Ada Laporan yang Cocok</p>
          <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto">
            {searchQuery || filterStatus !== 'ALL'
              ? 'Tidak ditemukan entri laporan untuk kriteria pencarian yang Anda pilih.'
              : 'Belum ada riwayat presensi yang tersimpan pada akun ini.'}
          </p>
        </div>

      /* ---- Responsive 5-column Clean Card Grid ---- */
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {filteredAttendances.map((item) => {
            const log = item.log;
            const needsRevision = log?.state === 'NEEDS_REVISION';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedDetail(item)}
                className={`group flex flex-col justify-between rounded-xl bg-white border p-3.5 transition cursor-pointer select-none hover:border-[#171717] shadow-xs ${
                  needsRevision ? 'border-amber-300 bg-amber-50/20' : 'border-[#E5E7EB]'
                }`}
              >
                <div>
                  {/* Top Bar: Date Tile & Info */}
                  <div className="flex items-center justify-between gap-1.5 border-b border-[#E5E7EB] pb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-[#F8F9FA] border border-[#E5E7EB]">
                        <span className="text-[8px] font-bold uppercase text-[#737373] leading-none">
                          {new Date(item.date).toLocaleString('id-ID', { month: 'short' })}
                        </span>
                        <span className="text-sm font-bold leading-tight text-[#171717]">
                          {new Date(item.date).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-[#171717] truncate leading-tight">
                          {new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(new Date(item.date))},{' '}
                          {new Date(item.date).getDate()} {new Date(item.date).toLocaleString('id-ID', { month: 'short' })}
                        </p>
                        <span className="text-[10px] text-[#737373] font-mono">
                          {new Date(item.date).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & GPS */}
                  <div className="mt-2.5 flex items-center justify-between gap-1">
                    <div className="truncate">{renderBadge(item, true)}</div>
                    {item.latitude && item.longitude && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-[#737373] font-mono bg-[#F8F9FA] border border-[#E5E7EB] px-1.5 py-0.5 rounded shrink-0">
                        <MapPin className="h-2.5 w-2.5" />
                        <span>GPS</span>
                      </span>
                    )}
                  </div>

                  {/* Needs Revision Box */}
                  {needsRevision && (
                    <div className="mt-2.5 rounded-lg bg-amber-50 border border-amber-200 p-2 text-[10px] text-amber-900 leading-tight">
                      <span className="font-semibold flex items-center gap-1 mb-0.5">
                        <AlertTriangle className="h-3 w-3 shrink-0 text-amber-600" />
                        <span>Catatan Mentor:</span>
                      </span>
                      <p className="line-clamp-2 text-amber-800">{log?.reviewer_notes || 'Perbaikan uraian laporan diperlukan'}</p>
                    </div>
                  )}

                  {/* Snippet text */}
                  {item.status === 'PRESENT' && log && (
                    <p className="mt-2 text-xs text-[#737373] line-clamp-3 leading-relaxed">
                      {log.activity_log || 'Aktivitas magang terisi.'}
                    </p>
                  )}
                  {item.status === 'ON_LEAVE' && (
                    <p className="mt-2 text-xs text-[#737373] line-clamp-2 italic leading-relaxed">
                      Izin: {item.leave_reason || 'Tidak ada catatan alasan.'}
                    </p>
                  )}
                  {item.status === 'DAYOFF' && (
                    <p className="mt-2 text-xs text-[#737373] flex items-center gap-1 py-1">
                      <Coffee className="h-3.5 w-3.5 shrink-0" />
                      <span>Presensi Hari Libur</span>
                    </p>
                  )}
                  {item.status === 'ABSENT' && (
                    <p className="mt-2 text-xs text-[#737373] italic py-1">Tidak hadir tanpa keterangan (Alfa).</p>
                  )}
                </div>

                {/* Footer of Card */}
                <div className="mt-3 pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#171717] group-hover:underline flex items-center gap-1">
                    Detail <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
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

      {/* ============================================================
          Detail Modal (Clean Minimalist Dialog)
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
                      Status: <strong>{selectedDetail.status === 'PRESENT' ? 'Hadir' : selectedDetail.status === 'ON_LEAVE' ? 'Izin' : selectedDetail.status === 'DAYOFF' ? 'Hari Libur' : 'Alfa'}</strong>
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

              {/* Reviewer Note Warning */}
              {selectedDetail.log?.state === 'NEEDS_REVISION' && selectedDetail.log?.reviewer_notes && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>Catatan Perbaikan dari Mentor:</span>
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

              {/* Status: DAYOFF */}
              {selectedDetail.status === 'DAYOFF' && (
                <div className="rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] p-4 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-[#171717] font-semibold">
                    <Coffee className="h-4 w-4" />
                    <span>Presensi Hari Libur Resmi</span>
                  </div>
                  <p className="text-[#737373] leading-relaxed">
                    Tanggal ini tercatat sebagai presensi hari libur. Tidak memerlukan pengisian uraian aktivitas.
                  </p>
                </div>
              )}

              {/* Status: ABSENT */}
              {selectedDetail.status === 'ABSENT' && (
                <div className="rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] p-4 text-xs space-y-1">
                  <p className="font-semibold text-[#171717]">Tidak Hadir Tanpa Keterangan (Alfa)</p>
                  <p className="text-[#737373]">Presensi tidak tercatat atau tidak dilaporkan pada hari ini.</p>
                </div>
              )}

              {/* Status: PRESENT -> 3 Points */}
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

                {selectedDetail.log?.state === 'NEEDS_REVISION' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedDetail.log) {
                        const targetLog = selectedDetail.log;
                        setSelectedDetail(null);
                        openRevisionModal(targetLog);
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-[#171717] hover:bg-black px-3.5 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
                  >
                    <FileEdit className="h-3.5 w-3.5" />
                    <span>Perbaiki Sekarang</span>
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

      {/* ============================================================
          Revision Edit Modal (Clean Minimalist Dialog)
          ============================================================ */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden bg-white border border-[#E5E7EB] rounded-xl shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-[#171717]">
                  <FileEdit className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#171717]">Perbaiki Laporan Harian</h3>
                  <p className="text-[11px] text-[#737373]">Tanggapi catatan evaluasi dari mentor magang</p>
                </div>
              </div>
              <button
                onClick={() => setEditingLog(null)}
                className="text-[#737373] hover:text-[#171717] p-1 rounded-lg transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {revisionAlert && (
                <div className="rounded-lg p-3 text-xs text-red-700 font-medium bg-red-50 border border-red-200">
                  {revisionAlert}
                </div>
              )}
              {editingLog.reviewer_notes && (
                <div className="rounded-lg p-3.5 text-xs bg-amber-50 border border-amber-200">
                  <span className="font-semibold text-amber-900 block mb-0.5">Catatan Evaluasi Mentor:</span>
                  <p className="text-amber-800 leading-relaxed">{editingLog.reviewer_notes}</p>
                </div>
              )}

              {[
                { label: '1. Uraian Aktivitas (Min. 100 Karakter)', value: revisionActivity, onChange: setRevisionActivity },
                { label: '2. Capaian Pembelajaran (Min. 100 Karakter)', value: revisionLesson, onChange: setRevisionLesson },
                { label: '3. Kendala & Solusi (Min. 100 Karakter)', value: revisionObstacles, onChange: setRevisionObstacles },
              ].map(({ label, value, onChange }) => (
                <div key={label} className="space-y-1">
                  <label className="block text-xs font-semibold text-[#171717]">{label}</label>
                  <textarea
                    rows={3}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full rounded-lg bg-white border border-[#E5E7EB] p-3 text-xs text-[#171717] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] focus:outline-none resize-none leading-relaxed"
                  />
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-1.5 w-14 bg-[#E5E7EB] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${value.trim().length >= 100 ? 'bg-emerald-600' : 'bg-[#171717]'}`}
                        style={{ width: `${Math.min(100, Math.round((value.trim().length / 100) * 100))}%` }}
                      />
                    </div>
                    <span className={`text-[11px] font-medium ${value.trim().length >= 100 ? 'text-emerald-700' : 'text-[#737373]'}`}>
                      {value.trim().length} / 100 karakter
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 border-t border-[#E5E7EB] px-5 py-3.5 shrink-0 bg-[#F8F9FA]">
              <button
                type="button"
                onClick={() => setEditingLog(null)}
                className="rounded-lg bg-white hover:bg-[#F0F1F3] border border-[#E5E7EB] px-4 py-2 text-xs font-medium text-[#737373] hover:text-[#171717] transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRevision}
                disabled={isSubmittingRevision}
                className="flex items-center gap-2 rounded-lg bg-[#171717] hover:bg-black px-5 py-2 text-xs font-semibold text-white disabled:opacity-40 transition cursor-pointer"
              >
                {isSubmittingRevision ? (
                  <><div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /><span>Menyimpan Perbaikan...</span></>
                ) : (
                  <><Send className="h-3.5 w-3.5" /><span>Kirimkan Perbaikan</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
