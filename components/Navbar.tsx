'use client';

import React from 'react';
import Link from 'next/link';
import { MonevUser } from '@/types/monev';
import {
  LogOut,
  RefreshCw,
  Shield,
  FileText,
  Calendar,
  User,
  Key,
  ExternalLink,
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
  { key: 'history' as TabType, label: 'Riwayat', icon: Calendar },
  { key: 'profile' as TabType, label: 'Profil',  icon: User     },
  { key: 'token'   as TabType, label: 'Token',   icon: Key      },
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
    <header className="sticky top-3 sm:top-5 z-40 w-full px-3.5 sm:px-6 pointer-events-none mb-4 sm:mb-6">
      {/* Floating Desktop & Mobile Container */}
      <div className="mx-auto max-w-7xl bg-white border border-[#E5E7EB] rounded-2xl shadow-sm px-3.5 sm:px-5 py-2.5 flex items-center justify-between gap-3 pointer-events-auto transition-all">

        {/* ---- Left: Logo & Brand ---- */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#171717] text-white shrink-0">
            <Shield className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold tracking-tight text-[#171717]">
              Monev MagangHub
            </span>
            <span className="hidden md:inline-block rounded border border-[#E5E7EB] bg-[#F8F9FA] px-1.5 py-0.5 text-[10px] font-semibold text-[#737373]">
              Kemnaker RI
            </span>
          </div>
        </Link>

        {/* ---- Center: Floating Navigation Tabs (Desktop View) ---- */}
        {user && (
          <nav
            aria-label="Navigasi Menu Utama"
            className="hidden sm:flex items-center gap-1 bg-[#F8F9FA] border border-[#E5E7EB] p-1 rounded-xl"
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
                    inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition cursor-pointer
                    ${isActive
                      ? 'bg-[#171717] text-white font-semibold shadow-xs'
                      : 'text-[#737373] hover:text-[#171717] hover:bg-white font-medium'
                    }
                  `}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* ---- Right: User Information & Quick Actions (Desktop View) ---- */}
        {user ? (
          <div className="flex items-center gap-2 shrink-0">
            {/* Participant Information Chip */}
            <button
              type="button"
              onClick={() => onSelectTab?.('profile')}
              className="flex items-center gap-2.5 rounded-xl border border-[#E5E7EB] px-2.5 py-1 bg-[#F8F9FA] hover:bg-[#F0F1F3] transition text-left cursor-pointer max-w-[210px]"
              title="Buka Profil Peserta"
            >
              <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-[#171717] text-xs font-bold text-white shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'P'}
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-white"
                  title="Sesi Aktif"
                />
              </div>
              <div className="min-w-0 hidden xs:block">
                <p className="text-xs font-semibold text-[#171717] truncate leading-tight">
                  {user.name || 'Peserta'}
                </p>
                <p className="text-[10px] text-[#737373] truncate leading-tight">
                  {user.internship_company || user.company || user.company_name || 'Mitra Kemnaker'}
                </p>
              </div>
            </button>

            {/* Quick External Link to Portal Monev (Desktop) */}
            <a
              href="https://monev.maganghub.kemnaker.go.id/dashboard"
              target="_blank"
              rel="noreferrer"
              title="Kunjungi Portal Monev Resmi"
              className="hidden lg:inline-flex items-center gap-1 text-xs font-medium text-[#737373] hover:text-[#171717] bg-[#F8F9FA] hover:bg-[#F0F1F3] border border-[#E5E7EB] px-2.5 py-1.5 rounded-lg transition"
            >
              <span>Portal</span>
              <ExternalLink className="h-3 w-3 text-[#737373]" />
            </a>

            {/* Refresh Token Button */}
            <button
              type="button"
              onClick={onRefreshToken}
              disabled={isRefreshing}
              title="Perbarui Masa Aktif Token"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#737373] hover:text-[#171717] hover:bg-[#F8F9FA] transition disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-[#171717]' : ''}`} />
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              title="Keluar dari Aplikasi"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#737373] hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#171717] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-black transition cursor-pointer"
            >
              <Key className="h-3.5 w-3.5" />
              <span>Masuk</span>
            </Link>
          </div>
        )}

      </div>
    </header>
  );
}
