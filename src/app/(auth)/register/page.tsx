"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", unit: "A-01", securityCode: "1111", emergencyName: "", emergencyPhone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        setError(data.message ?? "Pendaftaran gagal");
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
      <h1 style={{ margin: "0 0 6px", fontSize: 22, color: "#18263e", letterSpacing: "-.02em" }}>Daftarkan Unit Anda</h1>
      <p style={{ margin: "0 0 20px", color: "#718096", fontSize: 13 }}>1 unit hanya boleh memiliki 1 akun. Masukkan kode unit dan security code.</p>

      {error && <div style={{ marginBottom: 14, padding: "10px 12px", background: "#ffeded", color: "#c93b3b", borderRadius: 8, fontSize: 12 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <label style={fieldStyle}><span>Nama lengkap</span><input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Budi Santoso" style={inputStyle} /></label>
        <label style={fieldStyle}><span>Email</span><input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="nama@email.com" style={inputStyle} /></label>
        <label style={fieldStyle}><span>Password (min. 6 karakter)</span><input required minLength={6} type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" style={inputStyle} /></label>
        <label style={fieldStyle}><span>Nomor telepon</span><input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="0812…" style={inputStyle} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={fieldStyle}><span>Kode Unit</span><input required value={form.unit} onChange={(e) => update("unit", e.target.value.toUpperCase())} placeholder="A-01" style={inputStyle} /></label>
          <label style={fieldStyle}><span>Security Code</span><input required value={form.securityCode} onChange={(e) => update("securityCode", e.target.value)} placeholder="1111" style={inputStyle} /></label>
        </div>
        <label style={fieldStyle}><span>Nama kontak darurat</span><input value={form.emergencyName} onChange={(e) => update("emergencyName", e.target.value)} placeholder="Istri / Suami" style={inputStyle} /></label>
        <label style={fieldStyle}><span>Nomor kontak darurat</span><input value={form.emergencyPhone} onChange={(e) => update("emergencyPhone", e.target.value)} placeholder="0813…" style={inputStyle} /></label>

        <button type="submit" disabled={loading} style={{ ...primaryButton, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Memproses…" : "Daftar Sekarang"}
        </button>
      </form>

      <p style={{ marginTop: 18, fontSize: 12, color: "#718096", textAlign: "center" }}>
        Sudah punya akun? <Link href="/login" style={{ color: "#1557d8", fontWeight: 700 }}>Masuk di sini</Link>
      </p>

      <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "#fff8e1", color: "#92400e", fontSize: 11, lineHeight: 1.7, border: "1px solid #fde68a" }}>
        <strong>Contoh akun demo (sudah terdaftar):</strong><br />
        Unit A-01 / Security Code 1111 → budi.santoso@email.com
      </div>
    </>
  );
}

const fieldStyle: React.CSSProperties = { display: "block", marginBottom: 12 };
const inputStyle: React.CSSProperties = { width: "100%", height: 40, padding: "0 11px", border: "1px solid #dfe4ec", borderRadius: 8, outline: 0, color: "#364359", fontSize: 12, background: "white" };
const primaryButton: React.CSSProperties = { width: "100%", height: 44, border: 0, borderRadius: 10, background: "#1557d8", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(21,87,216,.22)" };
