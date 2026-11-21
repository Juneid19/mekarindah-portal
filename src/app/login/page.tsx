// @ts-nocheck
"use client";

import React, { useState } from "react";
import { ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal masuk. Periksa kembali email & password Anda.");
      }

      // Jika role admin -> redirect ke /admin
      // Jika role warga -> redirect ke beranda warga /
      if (data.role === "admin" || data.user?.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
        {/* Logo & Judul */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-3 shadow-inner">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Portal Mekar Indah</h1>
          <p className="text-sm text-slate-400 mt-1">Silakan masuk ke akun Anda</p>
        </div>

        {/* Notifikasi Error */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-in fade-in">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 ml-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 ml-1">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Memverifikasi..." : "Masuk Sekarang"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Tombol Akses Cepat */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-[11px] text-center font-bold text-slate-400 uppercase mb-3">Akun Default</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail("admin@mekarindah.com");
                setPassword("adminmekarindah");
              }}
              className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200 text-center"
            >
              👑 Login Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("saluniza66@gmail.com");
                setPassword("mekarindah123");
              }}
              className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200 text-center"
            >
              🏡 Login Warga
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}