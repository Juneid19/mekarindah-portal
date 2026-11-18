"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PlusCircle,
  Trash2,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";

export default function AdminFinancePage() {
  const [dataKas, setDataKas] = useState<{
    balance: number;
    totalIncome: number;
    totalExpense: number;
    transactions: any[];
  }>({
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
    transactions: [],
  });

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "expense",
    category: "Gaji Sekuriti",
    amount: "",
    description: "",
  });

  // Ambil data kas dari API
  const fetchKas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/finances");
      if (res.ok) {
        const data = await res.json();
        setDataKas(data);
      }
    } catch (e) {
      console.error("Gagal fetch kas:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKas();
  }, []);

  // Simpan transaksi kas baru
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) {
      alert("Harap isi nominal dan rincian penggunaan kas!");
      return;
    }

    try {
      const res = await fetch("/api/finances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("✅ Catatan Kas RW berhasil disimpan & otomatis tampil di Warga!");
        setForm({
          type: "expense",
          category: "Gaji Sekuriti",
          amount: "",
          description: "",
        });
        fetchKas();
      } else {
        alert("Gagal menyimpan transaksi");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat menyimpan");
    }
  };

  // Hapus transaksi kas
  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus catatan transaksi kas ini?")) return;
    try {
      const res = await fetch(`/api/finances?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchKas();
      }
    } catch {
      alert("Gagal menghapus");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* HEADER JUDUL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="text-emerald-600" />
            Laporan Kas & Transparansi Keuangan RW
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pencatatan kas masuk dan rincian belanja operasional RT/RW untuk transparansi seluruh warga.
          </p>
        </div>
        <button
          onClick={fetchKas}
          className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      {/* 3 KARTU KONDISI KAS RW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* SISA SALDO */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Sisa Saldo Kas RW Saat Ini</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 font-mono">
              Rp {dataKas.balance.toLocaleString("id-ID")}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              ● Kas Aktif & Terverifikasi
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <DollarSign size={24} />
          </div>
        </div>

        {/* TOTAL PEMASUKAN */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Total Kas Masuk</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 font-mono">
              + Rp {dataKas.totalIncome.toLocaleString("id-ID")}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              IPL, Donasi, Registrasi RFID Gate
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* TOTAL PENGELUARAN */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Total Pengeluaran (Belanja RW)</p>
            <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-1 font-mono">
              - Rp {dataKas.totalExpense.toLocaleString("id-ID")}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Gaji satpam, listrik, sampah, gate
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <TrendingDown size={24} />
          </div>
        </div>
      </div>

      {/* FORM INPUT CATATAN KAS BARU */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
          <PlusCircle className="text-emerald-600" size={20} />
          Input Catatan Kas RW Baru (Pemasukan / Pengeluaran)
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Arus Kas</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold"
            >
              <option value="expense">🔴 Kas Keluar (Pengeluaran)</option>
              <option value="income">🟢 Kas Masuk (Pemasukan)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
            >
              {form.type === "expense" ? (
                <>
                  <option value="Gaji Sekuriti">Gaji Sekuriti / Satpam</option>
                  <option value="Listrik & Fasilitas">Listrik Gate & Lampu Jalan</option>
                  <option value="Iuran Sampah">Iuran Sampah & Kebersihan</option>
                  <option value="Perbaikan Gate RFID">Perbaikan Portal RFID</option>
                  <option value="Perbaikan Lingkungan">Perbaikan Jalan & Fasilitas RT</option>
                  <option value="Operasional RT">Operasional & ATK RT/RW</option>
                  <option value="Lain-lain">Lain-lain</option>
                </>
              ) : (
                <>
                  <option value="Iuran IPL Terkumpul">Iuran IPL Terkumpul</option>
                  <option value="Donasi Warga">Donasi / Sumbangan Warga</option>
                  <option value="Penerimaan RFID Gate">Registrasi Kartu RFID</option>
                  <option value="Sewa Fasilitas">Sewa Fasilitas RW</option>
                  <option value="Lain-lain">Lain-lain</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Nominal (Rp)</label>
            <input
              type="number"
              placeholder="Contoh: 250000"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Rincian Pemakaian</label>
            <input
              type="text"
              placeholder="Rincian untuk apa uang dipakai..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-1.5 shadow"
            >
              <PlusCircle size={16} /> Simpan Catatan
            </button>
          </div>
        </form>
      </div>

      {/* TABEL BUKU KAS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-emerald-600" />
            Rincian Penggunaan & Catatan Kas RW
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {dataKas.transactions.length} Transaksi Tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-bold">Tanggal</th>
                <th className="p-3.5 font-bold">Jenis Kas</th>
                <th className="p-3.5 font-bold">Kategori</th>
                <th className="p-3.5 font-bold">Rincian Penggunaan Anggaran</th>
                <th className="p-3.5 font-bold text-right">Nominal</th>
                <th className="p-3.5 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataKas.transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Belum ada catatan kas RW.
                  </td>
                </tr>
              ) : (
                dataKas.transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3.5 text-xs text-slate-500">{t.date}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          t.type === "income"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {t.type === "income" ? "Kas Masuk" : "Kas Keluar"}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">{t.category}</td>
                    <td className="p-3.5 text-slate-800 font-medium">{t.description}</td>
                    <td
                      className={`p-3.5 font-mono font-bold text-right whitespace-nowrap ${
                        t.type === "income" ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {t.type === "income" ? "+ " : "- "}Rp {t.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}