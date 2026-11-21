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
  Clock,
  Sparkles,
  ExternalLink,
  Coffee,
  Key,
  RefreshCw,
  LogOut,
} from 'lucide-react';

export default function Home() {
  const [token, setToken]               = useState<string | null>(null);
  const [user, setUser]                 = useState<MonevUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isRefreshing, setIsRefreshing]   = useState(false);
  const [activeTab, setActiveTab]         = useState<'form' | 'history' | 'profile' | 'token'>('form');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /* ---- Restore token ---- */
  useEffect(() => {
    const savedToken = localStorage.getItem('monev-auth-token');
    if (savedToken) validateAndSetToken(savedToken);
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

  /* ---- Background auto-refresh ---- */
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

  const tokenPayload = token ? parseJwt(token) : null;
  const tokenExpiry  = tokenPayload?.exp
    ? new Date(tokenPayload.exp * 1000).toLocaleString('id-ID')
    : null;

  const [todayHolidayInfo, setTodayHolidayInfo] = useState<any>(null);
  useEffect(() => {
    setTodayHolidayInfo(getHolidayForDate(getTodayDateString(), [], user));
  }, [user]);

  return (
    <div
      className="min-h-screen text-zinc-900 antialiased selection:bg-zinc-950 selection:text-white flex flex-col font-sans relative overflow-x-hidden"
      style={{ background: 'var(--bg-surface-light)' }}
    >

      {/* ============================================================
          AMBIENT PRISMATIC BACKGROUND SYSTEM
          ============================================================ */}
      <div className="ambient-bg" aria-hidden="true">
        {/* Large ambient orbs */}
        <div
          className="ambient-orb"
          style={{
            width: '38rem', height: '38rem',
            top: '-14rem', left: '-10rem',
            background: 'radial-gradient(ellipse, rgba(220,215,255,0.28) 0%, rgba(240,210,250,0.18) 40%, transparent 70%)',
          }}
        />
        <div
          className="ambient-orb"
          style={{
            width: '44rem', height: '44rem',
            top: '18%', right: '-14rem',
            background: 'radial-gradient(ellipse, rgba(200,235,255,0.26) 0%, rgba(210,250,240,0.16) 40%, transparent 70%)',
          }}
        />
        <div
          className="ambient-orb"
          style={{
            width: '50rem', height: '50rem',
            bottom: '-18rem', left: '20%',
            background: 'radial-gradient(ellipse, rgba(255,230,235,0.22) 0%, rgba(220,215,255,0.14) 40%, transparent 70%)',
          }}
        />
        <div
          className="ambient-orb"
          style={{
            width: '32rem', height: '32rem',
            top: '50%', left: '40%',
            background: 'radial-gradient(ellipse, rgba(230,250,230,0.18) 0%, rgba(255,245,200,0.12) 40%, transparent 70%)',
          }}
        />

        {/* Subtle noise texture */}
        <div className="ambient-noise" />

        {/* Light base wash */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(250,250,251,0.35)',
            backdropFilter: 'blur(0.5px)',
          }}
        />
      </div>

      {/* ---- Navbar ---- */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onRefreshToken={handleRefreshToken}
        isRefreshing={isRefreshing}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* ---- Main Content ---- */}
      <main
        className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-3 sm:px-6 pt-4 sm:pt-28 md:pt-32 pb-28 sm:pb-16"
      >

        {/* ========== NOT LOGGED IN ========== */}
        {!token ? (
          <div className="py-6 sm:py-12">
            {/* Hero text above login card */}
            <div className="text-center mb-8 sm:mb-10 animate-liquid-in">
              <div
                className="inline-flex items-center gap-2 rounded-full glass-pill px-4 py-1.5 text-xs font-semibold text-zinc-700 mb-4"
              >
                <Sparkles className="h-3.5 w-3.5 text-zinc-700" />
                <span>AI-Powered Attendance Assistant</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight leading-tight">
                Monev MagangHub<br />
                <span className="text-zinc-500 font-medium text-xl sm:text-3xl">Assistant Agent</span>
              </h1>
              <p className="mt-3 text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                Permudah pengisian absensi &amp; laporan aktivitas harian magang Kemnaker dengan bantuan AI.
              </p>
            </div>

            <LoginCard onLoginWithToken={validateAndSetToken} isLoading={isLoadingAuth} />
          </div>

        ) : (
          /* ========== LOGGED IN ========== */
          <div className="space-y-4 sm:space-y-5">

            {/* ---- Greeting Bar ---- */}
            <div className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-liquid-in">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #18181b, #3f3f46)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <h1 className="text-sm sm:text-lg font-black text-zinc-950 tracking-tight truncate">
                    Halo, {user?.name?.split(' ')[0] || 'Peserta'}!
                  </h1>
                </div>
                <div className="text-[11px] sm:text-xs text-zinc-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 ml-9">
                  <span className="flex items-center gap-1 font-medium text-zinc-700">
                    <Building2 className="h-3 w-3 text-zinc-400 shrink-0" />
                    <span className="truncate max-w-[180px] sm:max-w-none">
                      {user?.internship_company || user?.company || user?.company_name || 'Mitra Kemnaker'}
                    </span>
                  </span>
                  {user?.internship_start_date && (
                    <>
                      <span className="text-zinc-200 hidden sm:inline">&bull;</span>
                      <span className="text-zinc-500">
                        {formatDateIndo(user.internship_start_date)} –{' '}
                        {user.internship_end_date ? formatDateIndo(user.internship_end_date) : 'Selesai'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <a
                href="https://monev.maganghub.kemnaker.go.id/dashboard"
                target="_blank"
                rel="noreferrer"
                className="self-start sm:self-auto glass-pill inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-800 hover:text-zinc-950 px-3.5 py-1.5 rounded-full transition shrink-0 cursor-pointer"
              >
                <span>Portal Kemnaker</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* ---- Holiday Banner ---- */}
            {todayHolidayInfo && (
              <div className="glass-card p-4 sm:p-5 flex items-center justify-between gap-3 text-xs text-zinc-900 animate-liquid-in">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl glass-dark shrink-0"
                  >
                    <Coffee className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 font-bold text-zinc-950">
                      <span>Hari Ini: {todayHolidayInfo.name}</span>
                      <span className="glass-pill rounded-full px-2 py-0.5 text-[10px] font-semibold text-zinc-700">
                        {todayHolidayInfo.sourceLabel}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-500 truncate mt-0.5">
                      {todayHolidayInfo.description}
                    </p>
                  </div>
                </div>

                {activeTab !== 'form' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className="hidden sm:inline-flex items-center glass-pill rounded-full px-3.5 py-1.5 text-xs font-semibold text-zinc-800 hover:text-zinc-950 shrink-0 transition cursor-pointer"
                  >
                    Tambah Laporan &rarr;
                  </button>
                )}
              </div>
            )}

            {/* ---- Tab Contents ---- */}
            <div key={activeTab} className="animate-tab-fade">

              {/* TAB: Form Laporan */}
              {activeTab === 'form' && (
                <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <ReportForm
                      token={token}
                      user={user}
                      onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
                    />
                  </div>

                  <div className="space-y-4 sm:space-y-5">
                    {/* Tips card */}
                    <div className="glass-card p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                          style={{
                            background: 'rgba(9,9,11,0.90)',
                            border: '1px solid rgba(255,255,255,0.14)',
                            boxShadow: '0 3px 8px rgba(0,0,0,0.20)',
                          }}
                        >
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                        <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-widest">
                          Ketentuan Laporan
                        </h3>
                      </div>
                      <ul className="space-y-2.5 text-xs text-zinc-600 leading-relaxed">
                        {[
                          'Minimal 100 karakter pada setiap uraian laporan.',
                          'Presensi hanya berlaku untuk hari kerja aktif.',
                          'Periksa status review mentor secara berkala.',
                        ].map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span
                              className="mt-0.5 h-4 w-4 flex items-center justify-center rounded-full shrink-0 text-[9px] font-black text-white"
                              style={{ background: 'rgba(9,9,11,0.80)' }}
                            >
                              {i + 1}
                            </span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Riwayat CTA card */}
                    <div className="glass-card p-4 sm:p-5">
                      <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-widest mb-1.5">
                        Riwayat Laporan
                      </h3>
                      <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                        Pantau status persetujuan mentor dan catatan perbaikan laporan Anda.
                      </p>
                      <button
                        onClick={() => setActiveTab('history')}
                        className="relative w-full overflow-hidden rounded-2xl glass-dark glass-shimmer py-3 text-xs font-bold text-white transition text-center cursor-pointer"
                        style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.18)' }}
                      >
                        Buka Riwayat &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Riwayat */}
              {activeTab === 'history' && (
                <AttendanceHistory token={token} key={refreshTrigger} />
              )}

              {/* TAB: Profil */}
              {activeTab === 'profile' && (
                <ProfileTab
                  user={user}
                  token={token}
                  onSelectTab={setActiveTab}
                  onRefreshUser={() => token && validateAndSetToken(token)}
                />
              )}

              {/* TAB: Token */}
              {activeTab === 'token' && (
                <div className="mx-auto max-w-2xl animate-liquid-in">
                  <div className="glass-card p-5 sm:p-8 space-y-5 sm:space-y-6">

                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-zinc-200/60 pb-5">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                        style={{
                          background: 'rgba(9,9,11,0.90)',
                          border: '1px solid rgba(255,255,255,0.14)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        }}
                      >
                        <Key className="h-4.5 w-4.5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-zinc-950 leading-tight">Sesi &amp; Token</h2>
                        <p className="text-xs text-zinc-500 mt-0.5">Status autentikasi JWT MagangHub</p>
                      </div>
                    </div>

                    {/* Info table */}
                    <div className="rounded-2xl glass-pill p-4 space-y-2.5 text-xs">
                      {[
                        { label: 'Masa Berlaku', value: tokenExpiry || 'Tidak diketahui' },
                        { label: 'Status Sesi', value: 'Aktif (Auto-Refresh)' },
                        { label: 'Server', value: 'monev-api.maganghub.kemnaker.go.id' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-zinc-200/50 last:border-0 gap-0.5 sm:gap-0">
                          <span className="text-zinc-500">{label}:</span>
                          <span className="font-semibold text-zinc-800 font-mono text-right">{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* JWT display */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                        Token Aktif (JWT):
                      </label>
                      <textarea
                        rows={4}
                        readOnly
                        value={token}
                        className="w-full rounded-2xl glass-input p-3.5 font-mono text-xs text-zinc-600 focus:outline-none resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                      <button
                        onClick={handleRefreshToken}
                        disabled={isRefreshing}
                        className="relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl glass-dark glass-shimmer px-5 py-3 text-xs font-bold text-white disabled:opacity-50 transition w-full sm:w-auto cursor-pointer"
                        style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.20)' }}
                      >
                        {isRefreshing ? (
                          <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        <span>{isRefreshing ? 'Memperbarui...' : 'Perpanjang Masa Aktif Token'}</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-1.5 rounded-2xl glass-pill px-5 py-3 text-xs font-bold text-zinc-700 hover:text-red-600 transition w-full sm:w-auto text-center cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Hapus Token &amp; Keluar</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ---- Bottom Nav (Mobile) ---- */}
      {token && (
        <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
      )}
    </div>
  );
}
