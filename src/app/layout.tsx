import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Warga Mekarindah",
  description: "Portal Resmi Manajemen & Keamanan Warga Perumahan Mekarindah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased font-sans bg-slate-100 text-slate-800">
        {children}
      </body>
    </html>
  );
}