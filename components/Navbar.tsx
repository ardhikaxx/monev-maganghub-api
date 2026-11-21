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
  { key: 'form' as TabType, label: 'Laporan', icon: FileText },
  { key: 'history' as TabType, label: 'Riwayat', icon: Calendar },
  { key: 'profile' as TabType, label: 'Profil', icon: User },
  { key: 'token' as TabType, label: 'Token', icon: Key },
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
      {/* ========================================================= */}
      {/* 1. DESKTOP / TABLET: FLOATING NAVBAR CAPSULE (hidden on mobile) */}
      {/* ========================================================= */}
      <header className="hidden sm:block fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-3 sm:px-6 pointer-events-none select-none">
        <div className="pointer-events-auto flex items-center justify-between gap-2 lg:gap-4 rounded-full border border-zinc-200/80 bg-white/95 p-1.5 px-3 sm:px-4 shadow-sm backdrop-blur-md">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-white shadow-sm shrink-0">
              <Shield className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-zinc-950 whitespace-nowrap">
                Monev MagangHub Assistant Agent
              </span>
              <span className="hidden md:inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 border border-zinc-200 shrink-0">
                Kemnaker
              </span>
            </div>
          </div>

          {/* Center: Floating Menu Tabs */}
          {user && (
            <nav
              aria-label="Navigasi Menu Desktop"
              className="flex items-center gap-1 rounded-full bg-zinc-100/90 p-1 border border-zinc-200/70 shrink-0"
            >
              {navItems.map((item) => {
                const isActive = activeTab === item.key;
                const Icon = item.icon;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelectTab?.(item.key)}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs font-semibold transition-all duration-300 ease-out cursor-pointer active:scale-95 ${
                      isActive
                        ? 'bg-zinc-950 text-white shadow-xs font-bold scale-[1.02]'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/70'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 transition-transform duration-200" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right: User Information & Action Buttons */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* User Info Capsule */}
              <button
                type="button"
                onClick={() => onSelectTab?.('profile')}
                className="flex items-center gap-2 rounded-full border border-zinc-200/80 bg-zinc-50/80 hover:bg-zinc-100/90 px-2.5 sm:px-3 py-1 text-left transition cursor-pointer max-w-[150px] lg:max-w-[210px]"
                title="Buka Profil Peserta"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-zinc-800 text-[11px] font-bold shrink-0">
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

              {/* Action Buttons: Refresh & Logout */}
              <div className="flex items-center gap-1 border-l border-zinc-200 pl-1.5 sm:pl-2">
                <button
                  type="button"
                  onClick={onRefreshToken}
                  disabled={isRefreshing}
                  title="Perbarui Masa Aktif Token"
                  className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-zinc-200/80 bg-white text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition shadow-xs disabled:opacity-40 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-zinc-950' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  title="Keluar / Ganti Akun"
                  className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-zinc-200/80 bg-white text-zinc-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition shadow-xs cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-500 font-medium">
              Presensi & Laporan
            </div>
          )}
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MOBILE: TOP HEADER (hidden on desktop) */}
      {/* ========================================================= */}
      <header className="sm:hidden sticky top-0 z-40 border-b border-zinc-200 bg-white/95 px-3 py-2.5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950 text-white shrink-0 shadow-sm">
              <Shield className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold tracking-tight text-zinc-950 truncate">
              Monev MagangHub Assistant Agent
            </span>
          </div>

          {/* User Quick Info & Action Buttons */}
          {user && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onSelectTab?.('profile')}
                className="flex items-center gap-1 bg-zinc-100 border border-zinc-200 rounded-full px-2 py-0.5 text-[10px] font-semibold text-zinc-800 max-w-[110px] truncate hover:bg-zinc-200 transition cursor-pointer"
                title="Buka Profil Peserta"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{user.name?.split(' ')[0] || 'Peserta'}</span>
              </button>

              <button
                type="button"
                onClick={onRefreshToken}
                disabled={isRefreshing}
                title="Perbarui Masa Aktif Token"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 transition shadow-xs disabled:opacity-40"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-zinc-950' : ''}`} />
              </button>

              <button
                type="button"
                onClick={onLogout}
                title="Keluar"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition shadow-xs"
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
