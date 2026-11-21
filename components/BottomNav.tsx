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
      <div className="flex h-13 items-center gap-1.5 rounded-full glass-dark p-1.5 shadow-2xl">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectTab(item.key)}
              aria-label={item.label}
              className={`relative flex h-full items-center justify-center rounded-full transition-all duration-300 ease-out active:scale-95 cursor-pointer overflow-hidden ${
                isActive
                  ? 'glass-card px-4 text-zinc-950 shadow-sm font-bold'
                  : 'w-11 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 transition-transform duration-200" />
              {isActive && (
                <span className="ml-1.5 text-xs tracking-tight whitespace-nowrap animate-tab-fade">
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
