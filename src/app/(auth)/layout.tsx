import type { ReactNode } from "react";
import Link from "next/link";
import "../globals.css";

export const metadata = { title: "Mekarindah Portal — Autentikasi" };

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px", background: "linear-gradient(135deg,#0b1d38 0%,#1557d8 100%)", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <div style={{ width: "min(440px, 100%)", padding: "32px", background: "white", borderRadius: 18, boxShadow: "0 24px 60px rgba(11,29,56,.32)" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 22, color: "#1557d8", fontWeight: 800, letterSpacing: ".05em", fontSize: 13 }}>
          <span style={{ width: 36, height: 36, display: "grid", placeItems: "center", borderRadius: 10, color: "white", background: "linear-gradient(145deg,#3182ff,#1557d8)" }}>🏘</span>
          MEKARINDAH PORTAL
        </Link>
        {children}
        <p style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #eef1f5", color: "#718096", fontSize: 11, textAlign: "center" }}>
          © {new Date().getFullYear()} Mekarindah Housing · Sistem Informasi Penghuni
        </p>
      </div>
    </main>
  );
}
