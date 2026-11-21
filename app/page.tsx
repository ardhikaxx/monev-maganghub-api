'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import LoginCard from '@/components/LoginCard';
import ReportForm from '@/components/ReportForm';
import AttendanceHistory from '@/components/AttendanceHistory';
import ProfileTab from '@/components/ProfileTab';
import { MonevUser } from '@/types/monev';
import { parseJwt, formatDateIndo, getTodayDateString } from '@/lib/monev';
import { getHolidayForDate } from '@/lib/holidays';
import {
  Building2,
  Coffee,
  Key,
  RefreshCw,
  LogOut,
  ExternalLink,
  CheckCircle2,
  Copy,
} from 'lucide-react';

export default function Home() {
  const [token, setToken]                 = useState<string | null>(null);
  const [user, setUser]                   = useState<MonevUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isRefreshing, setIsRefreshing]   = useState(false);
  const [activeTab, setActiveTab]         = useState<'form' | 'history' | 'profile' | 'token'>('form');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [copiedToken, setCopiedToken]     = useState(false);

  /* ---- Restore saved token on mount ---- */
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('monev-auth-token');
      if (savedToken) {
        validateAndSetToken(savedToken);
      }
    } catch {}
  }, []);

  /* ---- Validate & set token ---- */
  const validateAndSetToken = async (jwtToken: string): Promise<boolean> => {
    setIsLoadingAuth(true);
    try {
      let currentToken = jwtToken;
      let res = await fetch('/api/monev/user', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (!res.ok) {
        try {
          const refreshRes = await fetch('/api/monev/auth', {
            method: 'POST',
            headers: { Authorization: `Bearer ${currentToken}` },
          });
          const refreshData = await refreshRes.json();
          if (refreshRes.ok && refreshData?.access_token) {
            currentToken = refreshData.access_token;
            localStorage.setItem('monev-auth-token', currentToken);
            res = await fetch('/api/monev/user', {
              headers: { Authorization: `Bearer ${currentToken}` },
            });
          }
        } catch {}
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Sesi telah berakhir atau token tidak valid');

      const userData: MonevUser = data?.data || data;
      setToken(currentToken);
      setUser(userData);
      localStorage.setItem('monev-auth-token', currentToken);
      return true;
    } catch {
      localStorage.removeItem('monev-auth-token');
      setToken(null);
      setUser(null);
      return false;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  /* ---- Background auto-refresh (15 min interval) ---- */
  useEffect(() => {
    if (!token) return;
    const checkAndAutoRefreshToken = async () => {
      const payload = parseJwt(token);
      if (!payload?.exp) return;
      const nowSeconds = Math.floor(Date.now() / 1000);
      const remainingSeconds = payload.exp - nowSeconds;
      if (remainingSeconds < 7200 && remainingSeconds > 0) {
        try {
          const res = await fetch('/api/monev/auth', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok && data?.access_token) {
            setToken(data.access_token);
            localStorage.setItem('monev-auth-token', data.access_token);
          }
        } catch {}
      }
    };
    const initialTimer = setTimeout(checkAndAutoRefreshToken, 5000);
    const interval     = setInterval(checkAndAutoRefreshToken, 15 * 60 * 1000);
    return () => { clearTimeout(initialTimer); clearInterval(interval); };
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('monev-auth-token');
    setToken(null);
    setUser(null);
  };

  const handleRefreshToken = async () => {
    if (!token) return;
    setIsRefreshing(true);
    try {
      const res  = await fetch('/api/monev/auth', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data?.access_token) {
        setToken(data.access_token);
        localStorage.setItem('monev-auth-token', data.access_token);
        alert('Masa aktif token berhasil diperbarui!');
      } else {
        alert(data?.message || 'Gagal memperbarui token.');
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyJwt = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const tokenPayload = token ? parseJwt(token) : null;
  const tokenExpiry  = tokenPayload?.exp
    ? new Date(tokenPayload.exp * 1000).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })
    : null;

  const [todayHolidayInfo, setTodayHolidayInfo] = useState<any>(null);
  useEffect(() => {
    setTodayHolidayInfo(getHolidayForDate(getTodayDateString(), [], user));
  }, [user]);

  return (
    <div className="min-h-screen bg-white text-[#171717] antialiased flex flex-col font-sans">

      {/* ---- Floating Navigation Bar (Only for Authenticated Users) ---- */}
      {token && (
        <Navbar
          user={user}
          onLogout={handleLogout}
          onRefreshToken={handleRefreshToken}
          isRefreshing={isRefreshing}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      )}

      {/* ---- Main Application Viewport ---- */}
      <main
        className={`mx-auto w-full max-w-7xl flex-1 px-3.5 sm:px-6 ${
          token
            ? 'pt-2 sm:pt-3 pb-28 sm:pb-14'
            : 'min-h-screen flex items-center justify-center py-10'
        }`}
      >
        {/* ============================================================
            VIEW A: NOT AUTHENTICATED (LOGIN VIEW ONLY)
            ============================================================ */}
        {!token ? (
          <div className="w-full">
            <LoginCard onLoginWithToken={validateAndSetToken} isLoading={isLoadingAuth} />
          </div>

        ) : (
          /* ============================================================
              VIEW B: AUTHENTICATED (DASHBOARD & TAB ECOSYSTEM)
              ============================================================ */
          <div className="space-y-6">

            {/* ---- Greeting Banner ---- */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5 min-w-0">
                {/* User Initial */}
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg bg-[#171717] text-white text-sm sm:text-base font-bold shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-bold text-[#171717] truncate">
                      Selamat Datang, {user?.name?.split(' ')[0] || 'Peserta'}!
                    </h1>
                    <span className="hidden sm:inline-flex items-center rounded-full bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-0.5 text-[11px] font-medium text-[#737373]">
                      Peserta Aktif
                    </span>
                  </div>
                  <div className="text-xs text-[#737373] flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-0.5">
                    <span className="flex items-center gap-1 font-medium text-[#171717]">
                      <Building2 className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                      <span className="truncate max-w-[200px] sm:max-w-none">
                        {user?.internship_company || user?.company || user?.company_name || 'Mitra Kemnaker RI'}
                      </span>
                    </span>
                    {user?.internship_start_date && (
                      <>
                        <span className="text-[#E5E7EB] hidden sm:inline">&bull;</span>
                        <span className="text-[#737373]">
                          {formatDateIndo(user.internship_start_date)} –{' '}
                          {user.internship_end_date ? formatDateIndo(user.internship_end_date) : 'Selesai'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <a
                  href="https://monev.maganghub.kemnaker.go.id/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white hover:bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#171717] transition cursor-pointer"
                >
                  <span>Portal Kemnaker</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[#737373]" />
                </a>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Ganti Akun / Keluar"
                  className="inline-flex items-center gap-1 rounded-lg bg-white hover:bg-red-50 border border-[#E5E7EB] hover:border-red-200 px-3 py-1.5 text-xs font-medium text-[#737373] hover:text-red-600 transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Ganti Akun</span>
                </button>
              </div>
            </div>

            {/* ---- Holiday Announcement Banner (If applicable) ---- */}
            {todayHolidayInfo && (
              <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-[#171717]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-[#E5E7EB] shrink-0 text-[#171717]">
                    <Coffee className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 font-bold text-[#171717]">
                      <span>Hari Ini: {todayHolidayInfo.name}</span>
                      <span className="rounded bg-white border border-[#E5E7EB] px-2 py-0.5 text-[10px] font-semibold text-[#737373]">
                        {todayHolidayInfo.sourceLabel || 'Libur Resmi'}
                      </span>
                    </div>
                    <p className="text-xs text-[#737373] truncate mt-0.5">
                      {todayHolidayInfo.description}
                    </p>
                  </div>
                </div>

                {activeTab !== 'form' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className="hidden sm:inline-flex items-center rounded-lg bg-white hover:bg-[#F0F1F3] border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#171717] shrink-0 transition cursor-pointer"
                  >
                    Tambah Laporan &rarr;
                  </button>
                )}
              </div>
            )}

            {/* ============================================================
                DYNAMIC TAB CONTENTS
                ============================================================ */}
            <div>
              {/* --------------------------------------------------------
                  TAB 1: FORM LAPORAN & KETENTUAN KEMNAKER
                  -------------------------------------------------------- */}
              {activeTab === 'form' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <ReportForm
                      token={token}
                      user={user}
                      onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
                    />
                  </div>

                  {/* Sidebar Info */}
                  <div className="space-y-6">
                    {/* Ketentuan Laporan Card */}
                    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
                      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
                        <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                          Ketentuan Laporan Magang
                        </h3>
                      </div>

                      <ul className="space-y-3.5 text-xs leading-relaxed text-[#737373]">
                        {[
                          {
                            title: 'Batas Minimal Karakter',
                            desc: 'Setiap poin (Aktivitas, Pembelajaran, Kendala) wajib berisi minimal 100 karakter.',
                          },
                          {
                            title: 'Presensi Hari Kerja Aktif',
                            desc: 'Presensi hanya berlaku pada hari kerja dan posisi magang yang aktif.',
                          },
                          {
                            title: 'Pemeriksaan Evaluasi Mentor',
                            desc: 'Periksa status review secara berkala. Jika ada permintaan revisi, perbaiki segera.',
                          },
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="mt-0.5 h-4.5 w-4.5 flex items-center justify-center rounded-full bg-[#F8F9FA] border border-[#E5E7EB] text-[10px] font-bold text-[#171717] shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <strong className="block text-[#171717] font-semibold">{item.title}</strong>
                              <span className="text-[#737373] text-[11px]">{item.desc}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Riwayat Laporan CTA Card */}
                    <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-5 space-y-3">
                      <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                        Riwayat &amp; Evaluasi Mentor
                      </h3>
                      <p className="text-xs text-[#737373] leading-relaxed">
                        Pantau riwayat presensi yang telah disetujui, catatan perbaikan revisi dari mentor, dan rekapitulasi kehadiran Anda.
                      </p>
                      <button
                        onClick={() => setActiveTab('history')}
                        className="w-full flex items-center justify-center rounded-lg bg-[#171717] hover:bg-black text-white py-2.5 text-xs font-semibold transition cursor-pointer"
                      >
                        Buka Riwayat Presensi &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------
                  TAB 2: RIWAYAT & MODAL EVALUASI
                  -------------------------------------------------------- */}
              {activeTab === 'history' && (
                <AttendanceHistory token={token} key={refreshTrigger} />
              )}

              {/* --------------------------------------------------------
                  TAB 3: PROFIL PESERTA & PROGRES MAGANG
                  -------------------------------------------------------- */}
              {activeTab === 'profile' && (
                <ProfileTab
                  user={user}
                  token={token}
                  onSelectTab={setActiveTab}
                  onRefreshUser={() => token && validateAndSetToken(token)}
                />
              )}

              {/* --------------------------------------------------------
                  TAB 4: TOKEN & KEAMANAN SESI (SECURITY VAULT)
                  -------------------------------------------------------- */}
              {activeTab === 'token' && (
                <div className="mx-auto max-w-2xl">
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">

                    {/* Vault Header */}
                    <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] shrink-0 text-[#171717]">
                        <Key className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-[#171717]">
                          Keamanan Sesi &amp; Token
                        </h2>
                        <p className="text-xs text-[#737373] mt-0.5">
                          Status autentikasi JWT resmi MagangHub Kemnaker
                        </p>
                      </div>
                    </div>

                    {/* Sesi Status Table */}
                    <div className="rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] p-4 space-y-2.5 text-xs">
                      {[
                        { label: 'Status Sesi', value: 'Aktif (Auto-Refresh Background)' },
                        { label: 'Masa Berlaku Token', value: tokenExpiry || 'Tidak Diketahui' },
                        { label: 'Server Endpoint', value: 'monev-api.maganghub.kemnaker.go.id' },
                        { label: 'Penyimpanan Kredensial', value: 'LocalStorage Browser (Client-Only)' },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-[#E5E7EB] last:border-0 gap-0.5 sm:gap-0"
                        >
                          <span className="text-[#737373] font-medium">{label}:</span>
                          <span className="font-semibold text-[#171717] font-mono text-left sm:text-right">{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* JWT Raw Textarea with 1-Click Copy */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-[#171717]">
                          Token JWT Aktif:
                        </label>
                        <button
                          type="button"
                          onClick={copyJwt}
                          className="flex items-center gap-1 text-xs font-medium text-[#737373] hover:text-[#171717] cursor-pointer"
                        >
                          {copiedToken ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Tersalin ke Clipboard</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Salin Token</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        readOnly
                        value={token}
                        className="w-full rounded-lg bg-white border border-[#E5E7EB] p-3 font-mono text-xs text-[#737373] focus:outline-none resize-none leading-relaxed"
                      />
                    </div>

                    {/* Actions Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                      <button
                        onClick={handleRefreshToken}
                        disabled={isRefreshing}
                        className="flex items-center justify-center gap-2 rounded-lg bg-[#171717] hover:bg-black text-white px-5 py-2.5 text-xs font-semibold disabled:opacity-50 transition w-full sm:w-auto cursor-pointer"
                      >
                        {isRefreshing ? (
                          <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                        <span>{isRefreshing ? 'Memperbarui...' : 'Perpanjang Masa Aktif Token'}</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 rounded-lg bg-white hover:bg-red-50 border border-[#E5E7EB] hover:border-red-200 px-5 py-2.5 text-xs font-medium text-[#737373] hover:text-red-600 transition w-full sm:w-auto cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Hapus Sesi &amp; Keluar</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ---- Mobile Floating Bottom Navigation ---- */}
      {token && (
        <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
      )}
    </div>
  );
}
