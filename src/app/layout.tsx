import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Warga Mekar Indah",
  description: "Sistem Informasi & Manajemen Lingkungan RW Mekar Indah",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}