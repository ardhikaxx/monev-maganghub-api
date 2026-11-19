'use client';

import React from 'react';
import { MonevUser } from '@/types/monev';
import { LogOut, RefreshCw, UserCheck, Shield } from 'lucide-react';

interface NavbarProps {
  user: MonevUser | null;
  onLogout: () => void;
  onRefreshToken: () => void;
  isRefreshing: boolean;
  onSelectTab?: (tab: 'form' | 'history' | 'profile' | 'token') => void;
}

export default function Navbar({
  user,
  onLogout,
  onRefreshToken,
  isRefreshing,
  onSelectTab,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-zinc-950 text-white shrink-0">
            <Shield className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-zinc-950">
                Monev MagangHub
              </span>
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold text-zinc-700 border border-zinc-200">
                Kemnaker
              </span>
            </div>
          </div>
        </div>

        {/* User Status & Action Buttons */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop / Tablet User Info */}
            <button
              onClick={() => onSelectTab?.('profile')}
              className="hidden sm:block text-right hover:opacity-75 transition cursor-pointer"
              title="Buka Profil Peserta"
            >
              <div className="flex items-center justify-end gap-1.5 text-xs sm:text-sm font-semibold text-zinc-900">
                <UserCheck className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                <span className="truncate max-w-[160px] md:max-w-[220px]">{user.name || 'Peserta'}</span>
              </div>
              <p className="text-[11px] text-zinc-500 truncate max-w-[160px] md:max-w-[220px]">
                {user.internship_company || user.company || user.company_name || 'Mitra Kemnaker'}
              </p>
            </button>

            {/* Mobile User Compact Badge */}
            <button
              onClick={() => onSelectTab?.('profile')}
              className="sm:hidden flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-zinc-800 max-w-[120px] truncate hover:bg-zinc-200 transition cursor-pointer"
              title="Buka Profil Peserta"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-950 shrink-0" />
              <span className="truncate">{user.name?.split(' ')[0] || 'Peserta'}</span>
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 sm:border-l sm:border-zinc-200 sm:pl-3">
              <button
                onClick={onRefreshToken}
                disabled={isRefreshing}
                title="Perbarui Masa Aktif Token"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-40"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-zinc-950' : ''}`} />
                <span className="hidden md:inline">Refresh</span>
              </button>

              <button
                onClick={onLogout}
                title="Keluar / Ganti Akun"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-950 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
