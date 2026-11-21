import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monev MagangHub Assistant Agent (Kemnaker)',
  description: 'Aplikasi pembantu pengisian laporan aktivitas harian dan pemantauan monev MagangHub Kemnaker RI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
