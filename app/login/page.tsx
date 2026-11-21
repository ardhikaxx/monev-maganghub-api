'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginCard from '@/components/LoginCard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('monev-auth-token');
      if (savedToken) {
        setToken(savedToken);
      }
    } catch {}
  }, []);

  const handleLoginWithToken = async (jwtToken: string): Promise<boolean> => {
    setIsLoadingAuth(true);
    try {
      let currentToken = jwtToken;
      let res = await fetch('/api/monev/user', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (!res.ok) {
        try {
          const refreshRes = await fetch('/api/monev/auth', {
            method: 'POST',
            headers: { Authorization: `Bearer ${currentToken}` },
          });
          const refreshData = await refreshRes.json();
          if (refreshRes.ok && refreshData?.access_token) {
            currentToken = refreshData.access_token;
            localStorage.setItem('monev-auth-token', currentToken);
            res = await fetch('/api/monev/user', {
              headers: { Authorization: `Bearer ${currentToken}` },
            });
          }
        } catch {}
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Token tidak valid atau kadaluarsa');

      localStorage.setItem('monev-auth-token', currentToken);
      router.push('/');
      return true;
    } catch {
      localStorage.removeItem('monev-auth-token');
      return false;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#171717] antialiased flex flex-col justify-center items-center font-sans p-4 sm:p-6">
      <main className="w-full max-w-md mx-auto py-6">
        <LoginCard onLoginWithToken={handleLoginWithToken} isLoading={isLoadingAuth} />

        {token && (
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737373] hover:text-[#171717] transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Dashboard Utama</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
