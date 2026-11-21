import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monev MagangHub Assistant Agent (Kemnaker)',
  description: 'Aplikasi pembantu presensi dan penyusunan laporan harian MagangHub Kemnaker RI dengan tampilan bersih, minimalis, dan profesional.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full bg-white antialiased">
      <body className="min-h-full flex flex-col bg-white text-[#171717] font-sans selection:bg-[#171717] selection:text-white">
        {children}
      </body>
    </html>
  );
}
