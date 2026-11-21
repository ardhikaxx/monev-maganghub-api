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
  { key: 'form',    label: 'Laporan', icon: FileText },
  { key: 'history', label: 'Riwayat', icon: Calendar },
  { key: 'profile', label: 'Profil',  icon: User     },
  { key: 'token',   label: 'Token',   icon: Key      },
];

export default function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 sm:hidden select-none pointer-events-auto w-[calc(100%-2rem)] max-w-sm"
    >
      {/* Floating Bottom Nav Capsule */}
      <div className="flex items-center justify-between bg-white border border-[#E5E7EB] rounded-2xl p-1.5 shadow-md">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectTab(item.key)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-[#171717] text-white font-semibold shadow-xs'
                  : 'text-[#737373] hover:text-[#171717] hover:bg-[#F8F9FA]'
              }`}
            >
              <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-[#737373]'}`} />
              <span className="text-[10px] mt-0.5 leading-none font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
