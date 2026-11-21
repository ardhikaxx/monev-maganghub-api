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
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 sm:hidden select-none pointer-events-auto"
    >
      {/* Outer capsule */}
      <div
        className="relative flex items-center gap-1 p-1.5 rounded-full overflow-hidden"
        style={{
          background: 'rgba(9, 9, 11, 0.88)',
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow:
            '0 20px 60px rgba(0,0,0,0.55), 0 8px 20px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.30)',
        }}
      >
        {/* Prismatic rim border overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            padding: '1px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,180,230,0.35) 25%, rgba(140,200,255,0.40) 50%, rgba(140,255,210,0.35) 75%, rgba(255,255,255,0.40) 100%)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />

        {/* Top specular highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-3 right-3 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.40) 50%, transparent 100%)',
          }}
        />

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
              className={`
                relative flex h-11 items-center justify-center rounded-full
                transition-all duration-300 cursor-pointer active:scale-95 overflow-hidden
                ${isActive
                  ? 'glass-card text-zinc-950 px-4 font-bold shadow-sm'
                  : 'w-11 text-zinc-400 hover:text-white hover:bg-white/10'
                }
              `}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
              }}
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
