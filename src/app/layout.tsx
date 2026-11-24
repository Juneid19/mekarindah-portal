import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Perumahan Mekar Indah - Portal Warga & Pengurus",
  description: "Sistem Manajemen Kawasan & Layanan Digital Warga Perumahan Mekar Indah",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-emerald-500 selection:text-slate-950`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}