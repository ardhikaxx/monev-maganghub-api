'use client';

import React, { useState } from 'react';
import { KeyRound, ExternalLink, HelpCircle, AlertCircle, ArrowRight, CheckCircle2, Copy, Shield, Sparkles } from 'lucide-react';

interface LoginCardProps {
  onLoginWithToken: (token: string) => Promise<boolean>;
  isLoading: boolean;
}

export default function LoginCard({ onLoginWithToken, isLoading }: LoginCardProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const cleaned = tokenInput.trim().replace(/^Bearer\s+/i, '');
    if (!cleaned) {
      setErrorMessage('Mohon masukkan token otorisasi MagangHub Anda.');
      return;
    }

    const success = await onLoginWithToken(cleaned);
    if (!success) {
      setErrorMessage('Token tidak valid atau sudah kadaluarsa. Silakan periksa kembali token Anda.');
    }
  };

  const consoleSnippet = `sessionStorage.getItem('monev_access_token')`;

  const copySnippet = () => {
    navigator.clipboard.writeText(consoleSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {/* Flat Monochrome Header */}
        <div className="bg-zinc-950 px-4 py-4 sm:px-6 sm:py-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-zinc-800 text-white shrink-0 border border-zinc-700">
              <KeyRound className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-lg font-bold tracking-tight">Masuk Monev MagangHub</h1>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                Gunakan token sesi akun Kemnaker Anda
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-7 space-y-3.5 sm:space-y-4">
          {/* Info Auto-Refresh */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 sm:p-3 text-xs text-zinc-700 flex items-center gap-2 sm:gap-2.5">
            <Shield className="h-4 w-4 text-zinc-950 shrink-0" />
            <p className="text-zinc-600 text-[11px] sm:text-xs leading-relaxed">
              Sesi <strong>auto-refresh aktif</strong>. Cukup masukkan token satu kali.
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-zinc-300 bg-zinc-100 p-3 sm:p-3.5 text-xs text-zinc-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" />
              <div>
                <p className="font-bold">Gagal</p>
                <p className="text-zinc-600 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <div>
              <label htmlFor="token" className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Token MagangHub
              </label>
              <textarea
                id="token"
                rows={3}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste token JWT Anda di sini..."
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 p-2.5 sm:p-3 font-mono text-xs text-zinc-900 transition focus:border-zinc-950 focus:bg-white focus:outline-none"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !tokenInput.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-40"
            >
              {isLoading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 border-t border-zinc-100 pt-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950"
              >
                <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{showGuide ? 'Tutup Panduan' : 'Panduan Ambil Token'}</span>
              </button>

              <a
                href="https://monev.maganghub.kemnaker.go.id/dashboard"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950"
              >
                <span>Portal Monev</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {showGuide && (
              <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4 text-xs text-zinc-700 space-y-2">
                <p className="font-bold text-zinc-900">
                  Langkah Mengambil Token:
                </p>
                <ol className="list-decimal space-y-1.5 pl-4 text-zinc-600">
                  <li>
                    Buka situs resmi{' '}
                    <a
                      href="https://monev.maganghub.kemnaker.go.id"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-zinc-950 underline"
                    >
                      monev.maganghub.kemnaker.go.id
                    </a>{' '}
                    yang sudah login.
                  </li>
                  <li>
                    Tekan tombol <kbd className="rounded bg-zinc-200 px-1 py-0.5 font-mono text-[10px]">F12</kbd> di keyboard Anda (atau Klik Kanan &gt; Inspect).
                  </li>
                  <li>
                    Pilih tab <strong>Console</strong>, lalu ketik/paste kode berikut:
                  </li>
                </ol>

                <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-2 overflow-hidden">
                  <code className="font-mono text-[10px] sm:text-[11px] text-zinc-900 truncate pr-2">
                    {consoleSnippet}
                  </code>
                  <button
                    onClick={copySnippet}
                    type="button"
                    className="flex shrink-0 items-center gap-1 rounded bg-zinc-100 px-2 py-1 text-[10px] sm:text-[11px] font-semibold text-zinc-800 hover:bg-zinc-200"
                  >
                    {copiedCode ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-zinc-950" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
