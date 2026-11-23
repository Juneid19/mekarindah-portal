import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Konfigurasi Metadata SEO
export const metadata: Metadata = {
  title: "Mekar Indah Portal",
  description: "Sistem Informasi Warga RW 08 Perumahan Mekar Indah",
  manifest: "/manifest.json",
};

// Konfigurasi Viewport Mobile-First (Mencegah Zoom Otomatis di HP)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a", // Slate-900 sesuai tema aplikasi
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased selection:bg-emerald-500/30`}>
        {children}
      </body>
    </html>
  );
}