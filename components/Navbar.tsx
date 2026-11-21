'use client';

import React from 'react';
import { MonevUser } from '@/types/monev';
import {
  LogOut,
  RefreshCw,
  Shield,
  FileText,
  Calendar,
  User,
  Key,
} from 'lucide-react';

export type TabType = 'form' | 'history' | 'profile' | 'token';

interface NavbarProps {
  user: MonevUser | null;
  onLogout: () => void;
  onRefreshToken: () => void;
  isRefreshing: boolean;
  activeTab?: TabType;
  onSelectTab?: (tab: TabType) => void;
}

const navItems = [
  { key: 'form'    as TabType, label: 'Laporan', icon: FileText },
  { key: 'history' as TabType, label: 'Riwayat', icon: Calendar  },
  { key: 'profile' as TabType, label: 'Profil',  icon: User      },
  { key: 'token'   as TabType, label: 'Token',   icon: Key       },
];

export default function Navbar({
  user,
  onLogout,
  onRefreshToken,
  isRefreshing,
  activeTab = 'form',
  onSelectTab,
}: NavbarProps) {
  return (
    <>
      {/* ============================================================
          DESKTOP / TABLET: Floating Glass Capsule Navbar
          ============================================================ */}
      <header
        className="hidden sm:block fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4 lg:px-6 pointer-events-none select-none"
        role="banner"
      >
        {/* Outer capsule: glass-ultra material */}
        <div
          className="pointer-events-auto relative overflow-hidden rounded-full glass-ultra glass-shimmer px-3 py-1.5"
          style={{
            boxShadow:
              '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(255,255,255,0.75), inset 0 1px 0 rgba(255,255,255,1)',
          }}
        >
          <div className="flex items-center justify-between gap-2 lg:gap-3">

            {/* ---- Left: Brand ---- */}
            <div className="flex items-center gap-2 shrink-0 min-w-0">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full glass-dark shrink-0"
                style={{ borderRadius: '50%' }}
              >
                <Shield className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-zinc-950 whitespace-nowrap leading-none">
                  Monev MagangHub
                </span>
                <span
                  className="hidden md:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold text-zinc-700 glass-pill shrink-0"
                  style={{ fontSize: '10px' }}
                >
                  Kemnaker
                </span>
              </div>
            </div>

            {/* ---- Center: Nav Menu ---- */}
            {user && (
              <nav
                aria-label="Navigasi Menu Desktop"
                className="flex items-center gap-0.5 rounded-full p-1 shrink-0"
                style={{
                  background: 'rgba(0,0,0,0.045)',
                  border: '1px solid rgba(255,255,255,0.65)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {navItems.map((item) => {
                  const isActive = activeTab === item.key;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onSelectTab?.(item.key)}
                      className={`
                        relative flex items-center gap-1.5 rounded-full px-3 sm:px-3.5 py-1.5
                        text-xs font-semibold transition-all duration-250 cursor-pointer
                        active:scale-95 overflow-hidden
                        ${isActive
                          ? 'glass-dark text-white shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'
                        }
                      `}
                      style={{
                        transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
                        fontWeight: isActive ? 700 : 600,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}

            {/* ---- Right: User + Actions ---- */}
            {user ? (
              <div className="flex items-center gap-1.5 shrink-0">
                {/* User info pill */}
                <button
                  type="button"
                  onClick={() => onSelectTab?.('profile')}
                  className="flex items-center gap-2 rounded-full glass-pill px-2.5 py-1 text-left transition cursor-pointer max-w-[140px] lg:max-w-[200px]"
                  title="Buka Profil Peserta"
                >
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shrink-0 text-white"
                    style={{
                      background: 'linear-gradient(135deg, #18181b, #3f3f46)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.12)',
                    }}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 truncate leading-tight">
                      {user.name || 'Peserta'}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate leading-tight hidden lg:block">
                      {user.internship_company || user.company || user.company_name || 'Mitra'}
                    </p>
                  </div>
                </button>

                {/* Divider */}
                <div className="w-px h-5 bg-zinc-200/80 mx-0.5" />

                {/* Refresh */}
                <button
                  type="button"
                  onClick={onRefreshToken}
                  disabled={isRefreshing}
                  title="Perbarui Masa Aktif Token"
                  className="flex h-8 w-8 items-center justify-center rounded-full glass-pill text-zinc-700 hover:text-zinc-950 transition disabled:opacity-40 cursor-pointer"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-zinc-950' : ''}`}
                  />
                </button>

                {/* Logout */}
                <button
                  type="button"
                  onClick={onLogout}
                  title="Keluar / Ganti Akun"
                  className="flex h-8 w-8 items-center justify-center rounded-full glass-pill text-zinc-700 hover:text-red-600 transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div
                className="text-xs text-zinc-500 font-medium glass-pill rounded-full px-3 py-1"
              >
                Presensi &amp; Laporan
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================
          MOBILE: Sticky Top Glass Header
          ============================================================ */}
      <header
        className="sm:hidden sticky top-0 z-40 select-none"
        style={{
          background: 'rgba(250,250,250,0.88)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.80)',
          boxShadow: '0 1px 12px rgba(0,0,0,0.05), 0 0 0 0.5px rgba(255,255,255,0.65)',
        }}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          {/* Brand */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-xl glass-dark shrink-0"
            >
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-bold tracking-tight text-zinc-950 truncate">
              Monev MagangHub
            </span>
          </div>

          {/* Mobile user actions */}
          {user && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onSelectTab?.('profile')}
                className="flex items-center gap-1.5 glass-pill rounded-full px-2.5 py-1 text-[10px] font-semibold text-zinc-800 max-w-[100px] transition cursor-pointer"
                title="Buka Profil"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: '#22c55e' }}
                />
                <span className="truncate">{user.name?.split(' ')[0] || 'Peserta'}</span>
              </button>

              <button
                type="button"
                onClick={onRefreshToken}
                disabled={isRefreshing}
                title="Perbarui Token"
                className="flex h-7 w-7 items-center justify-center rounded-lg glass-pill text-zinc-700 transition disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={onLogout}
                title="Keluar"
                className="flex h-7 w-7 items-center justify-center rounded-lg glass-pill text-zinc-700 hover:text-zinc-950 transition cursor-pointer"
              >
                <LogOut className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
