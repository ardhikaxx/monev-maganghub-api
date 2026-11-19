'use client';

import React from 'react';
import { MonevUser } from '@/types/monev';
import { LogOut, RefreshCw, UserCheck, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  user: MonevUser | null;
  onLogout: () => void;
  onRefreshToken: () => void;
  isRefreshing: boolean;
}

export default function Navbar({
  user,
  onLogout,
  onRefreshToken,
  isRefreshing,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                Monev MagangHub
              </span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                Kemnaker
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Sistem Input & Manajemen Laporan Pemagangan
            </p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="flex items-center justify-end gap-1.5 text-sm font-semibold text-slate-800">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                <span>{user.name || 'Peserta Magang'}</span>
              </div>
              <p className="text-xs text-slate-500">
                {user.company_name || user.email || 'Terotentikasi'}
              </p>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <button
                onClick={onRefreshToken}
                disabled={isRefreshing}
                title="Perbarui Masa Aktif Token"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
                <span className="hidden md:inline">Refresh Token</span>
              </button>

              <button
                onClick={onLogout}
                title="Keluar / Ganti Token"
                className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
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
