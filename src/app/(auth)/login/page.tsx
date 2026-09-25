"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("budi.santoso@email.com");
  const [password, setPassword] = useState("mekarindah123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        setError(data.message ?? "Login gagal");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 style={{ margin: "0 0 6px", fontSize: 22, color: "#18263e", letterSpacing: "-.02em" }}>Selamat datang kembali</h1>
      <p style={{ margin: "0 0 22px", color: "#718096", fontSize: 13 }}>Masuk dengan akun penghuni Mekarindah.</p>

      {error && <div style={{ marginBottom: 14, padding: "10px 12px", background: "#ffeded", color: "#c93b3b", borderRadius: 8, fontSize: 12 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <label style={fieldStyle}>
          <span>Email</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" style={inputStyle} />
        </label>
        <label style={fieldStyle}>
          <span>Password</span>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
        </label>
        <button type="submit" disabled={loading} style={{ ...primaryButton, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Memproses…" : "Masuk Sekarang"}
        </button>
      </form>

      <p style={{ marginTop: 18, fontSize: 12, color: "#718096", textAlign: "center" }}>
        Belum punya akun? <Link href="/register" style={{ color: "#1557d8", fontWeight: 700 }}>Daftar di sini</Link>
      </p>

      <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "#f4f7fb", color: "#5b687c", fontSize: 11, lineHeight: 1.7 }}>
        <strong style={{ color: "#273449" }}>Akun demo:</strong><br />
        Admin: <code style={demoCode}>admin@mekarindah.com / adminmekarindah</code><br />
        Warga: <code style={demoCode}>budi.santoso@email.com / mekarindah123</code>
      </div>
    </>
  );
}

const fieldStyle: React.CSSProperties = { display: "block", marginBottom: 14 };
const inputStyle: React.CSSProperties = { width: "100%", height: 42, padding: "0 12px", border: "1px solid #dfe4ec", borderRadius: 9, outline: 0, color: "#364359", fontSize: 13, background: "white" };
const primaryButton: React.CSSProperties = { width: "100%", height: 44, border: 0, borderRadius: 10, background: "#1557d8", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(21,87,216,.22)" };
const demoCode: React.CSSProperties = { background: "white", padding: "1px 6px", borderRadius: 5, color: "#1557d8", border: "1px solid #e2e6ed" };
