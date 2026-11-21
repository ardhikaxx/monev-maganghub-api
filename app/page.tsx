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
} from 'lucide-react';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<MonevUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'profile' | 'token'>('form');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Restore token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('monev-auth-token');
    if (savedToken) {
      validateAndSetToken(savedToken);
    }
  }, []);

  // Validasi token dan jika mendekati atau baru saja kadaluarsa, coba auto-refresh segera
  const validateAndSetToken = async (jwtToken: string): Promise<boolean> => {
    setIsLoadingAuth(true);
    try {
      let currentToken = jwtToken;
      let res = await fetch('/api/monev/user', {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      // Jika token expired (401), coba lakukan auto-refresh segera
      if (!res.ok) {
        try {
          const refreshRes = await fetch('/api/monev/auth', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          });
          const refreshData = await refreshRes.json();
          if (refreshRes.ok && refreshData?.access_token) {
            currentToken = refreshData.access_token;
            localStorage.setItem('monev-auth-token', currentToken);
            res = await fetch('/api/monev/user', {
              headers: {
                Authorization: `Bearer ${currentToken}`,
              },
            });
          }
        } catch {
          // Lanjutkan penanganan error
        }
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Sesi telah berakhir atau token tidak valid');
      }

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

  // Background silent auto-refresh agar user tidak perlu mengambil token berulang kali
  useEffect(() => {
    if (!token) return;

    const checkAndAutoRefreshToken = async () => {
      const payload = parseJwt(token);
      if (!payload?.exp) return;

      const nowSeconds = Math.floor(Date.now() / 1000);
      const remainingSeconds = payload.exp - nowSeconds;

      // Jika sisa masa aktif token kurang dari 2 jam (7200 detik), perbarui di latar belakang
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
        } catch {
          // Abaikan kegagalan refresh latar belakang
        }
      }
    };

    const initialTimer = setTimeout(checkAndAutoRefreshToken, 5000);
    const interval = setInterval(checkAndAutoRefreshToken, 15 * 60 * 1000); // Tiap 15 menit

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
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
      const res = await fetch('/api/monev/auth', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
  const tokenExpiry = tokenPayload?.exp
    ? new Date(tokenPayload.exp * 1000).toLocaleString('id-ID')
    : null;

  const [todayHolidayInfo, setTodayHolidayInfo] = useState<any>(null);

  useEffect(() => {
    setTodayHolidayInfo(getHolidayForDate(getTodayDateString(), [], user));
  }, [user]);

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 antialiased selection:bg-zinc-950 selection:text-white flex flex-col font-sans relative overflow-x-hidden">
      {/* Ambient Prismatic Glow Mesh behind frosted glass */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-gradient-to-tr from-pink-300/20 via-indigo-300/15 to-sky-300/20 blur-3xl" />
        <div className="absolute top-1/4 -right-40 w-[34rem] h-[34rem] rounded-full bg-gradient-to-br from-cyan-300/20 via-teal-200/15 to-purple-300/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-[38rem] h-[38rem] rounded-full bg-gradient-to-tl from-emerald-200/15 via-sky-300/20 to-rose-200/15 blur-3xl" />
        <div className="absolute inset-0 bg-zinc-50/40 backdrop-blur-[0.5px]" />
      </div>

      <Navbar
        user={user}
        onLogout={handleLogout}
        onRefreshToken={handleRefreshToken}
        isRefreshing={isRefreshing}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-3 sm:px-6 pt-4 sm:pt-28 md:pt-32 pb-24 sm:pb-16">
        {!token ? (
          <div className="py-4 sm:py-10">
            <LoginCard
              onLoginWithToken={validateAndSetToken}
              isLoading={isLoadingAuth}
            />
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Top Greeting Bar (Prismatic Glassmorphism) */}
            <div className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-black text-zinc-950 tracking-tight truncate">
                  Halo, {user?.name || 'Peserta Magang'}!
                </h1>
                <div className="text-[11px] sm:text-xs text-zinc-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                  <span className="flex items-center gap-1.5 font-medium text-zinc-700">
                    <Building2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-none">{user?.internship_company || user?.company || user?.company_name || 'Mitra Kemnaker'}</span>
                  </span>
                  {user?.internship_start_date && (
                    <>
                      <span className="text-zinc-300 hidden sm:inline">&bull;</span>
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
                className="self-start sm:self-auto glass-pill inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-800 hover:text-zinc-950 px-3 py-1.5 rounded-full transition shrink-0"
              >
                <span>Portal Kemnaker</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Banner Status Hari Ini jika Hari Libur / Off-Day */}
            {todayHolidayInfo && (
              <div className="glass-card p-4 sm:p-5 flex items-center justify-between gap-3 text-xs text-zinc-900">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl glass-dark text-white shrink-0">
                    <Coffee className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 font-bold text-zinc-950">
                      <span>Hari Ini: {todayHolidayInfo.name}</span>
                      <span className="glass-pill rounded-full px-2 py-0.5 text-[10px] font-semibold text-zinc-700">
                        {todayHolidayInfo.sourceLabel}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-600 truncate mt-0.5">
                      {todayHolidayInfo.description}
                    </p>
                  </div>
                </div>

                {activeTab !== 'form' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className="hidden sm:inline-flex items-center glass-pill rounded-full px-3.5 py-1.5 text-xs font-semibold text-zinc-800 hover:text-zinc-950 shrink-0 transition"
                  >
                    Tambah Laporan &rarr;
                  </button>
                )}
              </div>
            )}

            {/* Tab Contents */}
            <div key={activeTab} className="animate-tab-fade">
              {/* Tab 1: Form Tambah Laporan */}
              {activeTab === 'form' && (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <ReportForm
                      token={token}
                      user={user}
                      onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
                    />
                  </div>

                  <div className="space-y-4 sm:space-y-5">
                    {/* Ringkasan Tips Pengisian */}
                    <div className="glass-card p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Sparkles className="h-4 w-4 text-zinc-950 shrink-0" />
                        <h3 className="text-xs sm:text-sm font-bold text-zinc-950 uppercase tracking-wider">
                          Ketentuan Laporan
                        </h3>
                      </div>
                      <ul className="space-y-2 text-xs text-zinc-600 leading-relaxed">
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-zinc-950">&bull;</span>
                          <span>Minimal 100 karakter pada setiap uraian.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-zinc-950">&bull;</span>
                          <span>Presensi hanya berlaku untuk hari ini.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-zinc-950">&bull;</span>
                          <span>Periksa status review mentor berkala.</span>
                        </li>
                      </ul>
                    </div>

                    {/* Riwayat Mini CTA */}
                    <div className="glass-card p-4 sm:p-5">
                      <h3 className="text-xs sm:text-sm font-bold text-zinc-950 uppercase tracking-wider mb-1">
                        Riwayat Laporan
                      </h3>
                      <p className="text-xs text-zinc-500 mb-3">
                        Pantau status persetujuan mentor dan catatan perbaikan.
                      </p>
                      <button
                        onClick={() => setActiveTab('history')}
                        className="w-full rounded-xl glass-pill py-2.5 text-xs font-bold text-zinc-900 hover:text-zinc-950 transition text-center cursor-pointer"
                      >
                        Buka Riwayat &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Riwayat Kehadiran */}
              {activeTab === 'history' && (
                <AttendanceHistory token={token} key={refreshTrigger} />
              )}

              {/* Tab 3: Profil Peserta */}
              {activeTab === 'profile' && (
                <ProfileTab
                  user={user}
                  token={token}
                  onSelectTab={setActiveTab}
                  onRefreshUser={() => token && validateAndSetToken(token)}
                />
              )}

              {/* Tab 4: Status Token */}
              {activeTab === 'token' && (
                <div className="mx-auto max-w-2xl glass-card p-5 sm:p-8 space-y-5 sm:space-y-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-zinc-950">
                      Sesi & Token
                    </h2>
                  </div>

                  <div className="rounded-xl glass-pill p-3.5 sm:p-4 space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-zinc-200/60 gap-0.5 sm:gap-0">
                      <span className="text-zinc-500">Masa Berlaku:</span>
                      <span className="font-semibold text-zinc-800">
                        {tokenExpiry || 'Tidak diketahui'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-200/60">
                      <span className="text-zinc-500">Status Sesi:</span>
                      <span className="font-semibold text-zinc-950">Aktif (Auto-Refresh)</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between py-1 gap-0.5 sm:gap-0">
                      <span className="text-zinc-500">Server:</span>
                      <span className="font-mono text-zinc-700 break-all">
                        monev-api.maganghub.kemnaker.go.id
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Token Aktif (JWT):
                    </label>
                    <textarea
                      rows={4}
                      readOnly
                      value={token}
                      className="w-full rounded-xl glass-input p-3 font-mono text-xs text-zinc-600 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2">
                    <button
                      onClick={handleRefreshToken}
                      disabled={isRefreshing}
                      className="flex items-center justify-center gap-1.5 rounded-xl glass-dark px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-black disabled:opacity-50 transition w-full sm:w-auto cursor-pointer"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>{isRefreshing ? 'Memperbarui...' : 'Perpanjang Masa Aktif Token'}</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="rounded-xl glass-pill px-4 py-2.5 text-xs font-bold text-zinc-800 hover:text-red-600 transition w-full sm:w-auto text-center cursor-pointer"
                    >
                      Hapus Token & Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Nav Capsule (Mobile Only) */}
      {token && (
        <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
      )}
    </div>
  );
}
