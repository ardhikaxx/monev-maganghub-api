'use client';

import React from 'react';
import { FileText, Calendar, User, Key } from 'lucide-react';

export type TabType = 'form' | 'history' | 'profile' | 'token';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

interface NavItem {
  key: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { key: 'form', label: 'Laporan', icon: FileText },
  { key: 'history', label: 'Riwayat', icon: Calendar },
  { key: 'profile', label: 'Profil', icon: User },
  { key: 'token', label: 'Token', icon: Key },
];

export default function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 sm:hidden select-none"
    >
      <div className="flex h-12 items-center gap-1.5 rounded-full border border-zinc-800/90 bg-zinc-950/95 p-1 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] backdrop-blur-md">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectTab(item.key)}
              aria-label={item.label}
              className={`relative flex h-full items-center justify-center rounded-full transition-all duration-300 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-white px-3.5 text-zinc-950 shadow-sm font-bold'
                  : 'w-10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {isActive && (
                <span className="ml-1.5 text-xs tracking-tight whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
