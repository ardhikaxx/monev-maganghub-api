'use client';

import React, { useState } from 'react';
import { KeyRound, ExternalLink, HelpCircle, AlertCircle, ArrowRight, CheckCircle2, Copy } from 'lucide-react';

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

  const consoleSnippet = `JSON.parse(localStorage.getItem('monev-auth')).token`;

  const copySnippet = () => {
    navigator.clipboard.writeText(consoleSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <KeyRound className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Masuk ke Portal Monev</h1>
              <p className="text-sm text-blue-100">
                Hubungkan dengan akun resmi MagangHub Kemnaker Anda
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <p className="font-semibold">Otentikasi Gagal</p>
                <p className="text-xs text-rose-700">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-semibold text-slate-800">
                Bearer Token Monev MagangHub
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Masukkan JWT Access Token yang didapat dari akun MagangHub Anda.
              </p>
              <textarea
                id="token"
                rows={4}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-xs text-slate-800 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !tokenInput.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Memverifikasi Token...</span>
              ) : (
                <>
                  <span>Masuk & Buka Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                <HelpCircle className="h-4 w-4" />
                <span>{showGuide ? 'Sembunyikan Panduan' : 'Bagaimana Cara Mendapatkan Token?'}</span>
              </button>

              <a
                href="https://monev.maganghub.kemnaker.go.id/auth/login"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 hover:underline"
              >
                <span>Buka Web Monev Resmi</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {showGuide && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-3">
                <p className="font-semibold text-slate-900">
                  Langkah Mudah Mengambil Token:
                </p>
                <ol className="list-decimal space-y-2 pl-4 text-slate-600">
                  <li>
                    Buka situs resmi{' '}
                    <a
                      href="https://monev.maganghub.kemnaker.go.id"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-blue-600 underline"
                    >
                      monev.maganghub.kemnaker.go.id
                    </a>{' '}
                    dan lakukan login melalui SIAPkerja.
                  </li>
                  <li>
                    Setelah berhasil masuk ke halaman dashboard, tekan tombol <kbd className="rounded bg-slate-200 px-1 py-0.5 font-mono">F12</kbd> (atau klik kanan &rarr; Inspect) untuk membuka Developer Tools.
                  </li>
                  <li>
                    Pilih tab <strong>Console</strong>, lalu salin dan jalankan perintah di bawah ini:
                  </li>
                </ol>

                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5">
                  <code className="font-mono text-[11px] text-blue-700 truncate pr-2">
                    {consoleSnippet}
                  </code>
                  <button
                    onClick={copySnippet}
                    type="button"
                    className="flex shrink-0 items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                  >
                    {copiedCode ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
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

                <p className="text-[11px] text-slate-500">
                  Hasil yang muncul di console adalah token Anda. Salin teks tersebut (tanpa tanda kutip) dan tempelkan ke kolom input di atas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
