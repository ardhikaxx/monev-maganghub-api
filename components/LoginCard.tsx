'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  ExternalLink,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Copy,
  ChevronDown,
  Terminal,
} from 'lucide-react';

interface LoginCardProps {
  onLoginWithToken: (token: string) => Promise<boolean>;
  isLoading: boolean;
}

export default function LoginCard({ onLoginWithToken, isLoading }: LoginCardProps) {
  const [tokenInput, setTokenInput]     = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGuide, setShowGuide]       = useState(false);
  const [copiedCode, setCopiedCode]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const cleaned = tokenInput.trim().replace(/^Bearer\s+/i, '');
    if (!cleaned) {
      setErrorMessage('Mohon tempelkan (paste) token otorisasi MagangHub Anda pada kolom di bawah.');
      return;
    }
    const success = await onLoginWithToken(cleaned);
    if (!success) {
      setErrorMessage('Token tidak valid atau sudah kadaluarsa. Silakan periksa kembali atau ambil token baru dari console browser.');
    }
  };

  const consoleSnippet = `sessionStorage.getItem('monev_access_token')`;

  const copySnippet = () => {
    navigator.clipboard.writeText(consoleSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isJwtFormat = tokenInput.trim().replace(/^Bearer\s+/i, '').startsWith('eyJ');

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Clean White Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 shadow-xs">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#171717] mb-3">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-[#171717]">
            Masuk Monev MagangHub
          </h1>
          <p className="text-xs text-[#737373] mt-1">
            Gunakan token otorisasi akun MagangHub Kemnaker RI Anda
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 p-3 mb-5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Perhatian</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="token"
                className="block text-xs font-semibold text-[#171717]"
              >
                Token Otorisasi (JWT)
              </label>
              <div className="flex items-center gap-2">
                {isJwtFormat && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                    <span>Format Valid</span>
                  </span>
                )}
                {tokenInput.trim() && (
                  <button
                    type="button"
                    onClick={() => setTokenInput('')}
                    className="text-[11px] font-medium text-[#737373] hover:text-[#171717] transition cursor-pointer"
                  >
                    Bersihkan
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="token"
              rows={3}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste token JWT MagangHub Anda di sini..."
              className="w-full rounded-lg bg-white border border-[#E5E7EB] p-3 font-mono text-xs text-[#171717] placeholder:text-[#737373] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] focus:outline-none resize-none leading-relaxed transition-colors"
              disabled={isLoading}
              spellCheck={false}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#171717] hover:bg-black text-white py-2.5 px-4 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Memverifikasi Sesi...</span>
              </>
            ) : (
              <>
                <span>Masuk dengan Token</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Collapsible Token Guide */}
        <div className="border-t border-[#E5E7EB] mt-6 pt-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center gap-1.5 text-xs font-medium text-[#171717] hover:text-[#737373] transition cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5 text-[#737373]" />
              <span>{showGuide ? 'Tutup Panduan' : 'Cara Mengambil Token'}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-[#737373] transition-transform duration-200 ${showGuide ? 'rotate-180' : ''}`} />
            </button>

            <a
              href="https://monev.maganghub.kemnaker.go.id/dashboard"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-[#737373] hover:text-[#171717] transition"
            >
              <span>Portal Monev</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {showGuide && (
            <div className="mt-3 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] p-4 text-xs space-y-3">
              <p className="font-semibold text-[#171717] flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-[#171717]" />
                <span>Langkah Mengambil Token dari Browser:</span>
              </p>
              <ol className="list-decimal pl-4 space-y-1.5 text-[#737373] leading-relaxed">
                <li>
                  Buka tab browser yang sedang membuka situs{' '}
                  <a
                    href="https://monev.maganghub.kemnaker.go.id"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[#171717] underline underline-offset-2"
                  >
                    monev.maganghub.kemnaker.go.id
                  </a>
                </li>
                <li>
                  Tekan <kbd className="rounded bg-white border border-[#E5E7EB] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#171717]">F12</kbd> (atau Klik Kanan &rarr; Periksa/Inspect) untuk membuka Developer Tools.
                </li>
                <li>
                  Buka tab <strong>Console</strong>, lalu jalankan perintah berikut:
                </li>
              </ol>

              {/* Code Snippet */}
              <div className="flex items-center justify-between gap-2 rounded-lg bg-white border border-[#E5E7EB] p-2.5">
                <code className="font-mono text-[11px] text-[#171717] truncate flex-1">
                  {consoleSnippet}
                </code>
                <button
                  type="button"
                  onClick={copySnippet}
                  className="flex shrink-0 items-center gap-1 rounded bg-[#F8F9FA] hover:bg-[#F0F1F3] border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-medium text-[#171717] transition cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-[#737373]" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-[#737373]">
                Hasil teks yang muncul tanpa tanda kutip adalah token Anda. Tempelkan ke kolom isian di atas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
