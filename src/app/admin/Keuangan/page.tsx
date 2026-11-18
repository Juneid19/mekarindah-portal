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
  Calendar,
  AlertCircle,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string; // Rincian pemakaian
  date: string;
  receiptNo?: string; // No nota/kwitansi
}

export default function LaporanKeuanganAdmin() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "tx-1",
      type: "income",
      category: "Iuran IPL Warga",
      amount: 4500000,
      description: "Total IPL terkumpul Periode Oktober (30 Unit Warga)",
      date: "01/10/2024",
      receiptNo: "KAS-IN-001",
    },
    {
      id: "tx-2",
      type: "expense",
      category: "Gaji Sekuriti & Keamanan",
      amount: 2500000,
      description: "Honor 2 petugas satpam jaga portal (Shift Pagi & Malam)",
      date: "02/10/2024",
      receiptNo: "KAS-OUT-001",
    },
    {
      id: "tx-3",
      type: "expense",
      category: "Listrik Fasilitas & Portal",
      amount: 380000,
      description: "Pembayaran token listrik portal otomatis dan penerangan jalan utama",
      date: "05/10/2024",
      receiptNo: "PLN-10293",
    },
    {
      id: "tx-4",
      type: "expense",
      category: "Perbaikan & Perawatan Gate",
      amount: 250000,
      description: "Servis motor barrier gate & penggantian switch sensor loop",
      date: "12/10/2024",
      receiptNo: "NOTA-SRV-88",
    },
  ]);

  // Form State Input Transaksi
  const [form, setForm] = useState({
    type: "expense" as "income" | "expense",
    category: "Gaji Sekuriti & Keamanan",
    amount: "",
    description: "",
    receiptNo: "",
    date: new Date().toLocaleDateString("id-ID"),
  });

  // Load dari localStorage agar data tersimpan permanen di browser
  useEffect(() => {
    const saved = localStorage.getItem("mekarindah_buku_kas");
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const saveToStorage = (data: Transaction[]) => {
    setTransactions(data);
    localStorage.setItem("mekarindah_buku_kas", JSON.stringify(data));
  };

  // Tambah Transaksi Kas Baru
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) {
      alert("Harap isi nominal dan rincian pemakaian/keterangan!");
      return;
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: form.type,
      category: form.category,
      amount: parseInt(form.amount) || 0,
      description: form.description,
      receiptNo: form.receiptNo || "-",
      date: form.date || new Date().toLocaleDateString("id-ID"),
    };

    const updated = [newTx, ...transactions];
    saveToStorage(updated);

    // Reset Form
    setForm({
      type: "expense",
      category: "Gaji Sekuriti & Keamanan",
      amount: "",
      description: "",
      receiptNo: "",
      date: new Date().toLocaleDateString("id-ID"),
    });

    alert("✅ Catatan keuangan berhasil disimpan!");
  };

  // Hapus Transaksi
  const handleDelete = (id: string) => {
    if (!window.confirm("Hapus catatan transaksi ini?")) return;
    const updated = transactions.filter((t) => t.id !== id);
    saveToStorage(updated);
  };

  // Perhitungan Ringkasan Kas
  const totalPemasukan = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPengeluaran = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const sisaSaldoKas = totalPemasukan - totalPengeluaran;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* JUDUL */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Wallet className="text-emerald-600" />
          Laporan Pembukuan Kas & Transparansi RT
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pencatatan kas masuk dan rincian pemakaian kas keluar perumahan untuk laporan pertanggungjawaban ke warga.
        </p>
      </div>

      {/* 3 KARTU RINGKASAN SALDO KAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* SISA SALDO KAS */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Sisa Saldo Kas RT Saat Ini</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">
              Rp {sisaSaldoKas.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <DollarSign size={24} />
          </div>
        </div>

        {/* TOTAL PEMASUKAN */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Total Pemasukan Kas</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              + Rp {totalPemasukan.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* TOTAL PENGELUARAN */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Total Pengeluaran / Belanja</p>
            <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">
              - Rp {totalPengeluaran.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <TrendingDown size={24} />
          </div>
        </div>
      </div>

      {/* FORM INPUT TRANSAKSI / RINCIAN BELANJA */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
          <PlusCircle className="text-emerald-600" size={20} />
          Input Catatan Transaksi Kas / Rincian Pemakaian
        </h2>

        <form onSubmit={handleAddTransaction} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* ARUS KAS */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Arus Kas</label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as "income" | "expense",
                  category: e.target.value === "income" ? "Total IPL Terkumpul" : "Gaji Sekuriti & Keamanan",
                })
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold"
            >
              <option value="expense">🔴 Pengeluaran (Belanja)</option>
              <option value="income">🟢 Pemasukan (Kas Masuk)</option>
            </select>
          </div>

          {/* KATEGORI */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
            >
              {form.type === "expense" ? (
                <>
                  <option value="Gaji Sekuriti & Keamanan">Gaji Sekuriti / Satpam</option>
                  <option value="Listrik Fasilitas & Portal">Listrik Portal & Lampu Jalan</option>
                  <option value="Kebersihan & Iuran Sampah">Iuran Sampah & Kebersihan</option>
                  <option value="Perbaikan & Perawatan Gate">Perbaikan Portal RFID / Gate</option>
                  <option value="Perbaikan Fasilitas Umum">Perbaikan Jalan & Fasilitas RT</option>
                  <option value="Konsumsi & Operasional RT">Konsumsi Rapat & Alat Kantor</option>
                  <option value="Lain-lain (Pengeluaran)">Lain-lain</option>
                </>
              ) : (
                <>
                  <option value="Total IPL Terkumpul">Penerimaan IPL Warga</option>
                  <option value="Donasi / Sumbangan Warga">Donasi / Sumbangan Warga</option>
                  <option value="Biaya Registrasi Kartu RFID">Penerimaan Kartu RFID Gate</option>
                  <option value="Sewa Fasilitas / Lapangan">Sewa Lapangan / Balai Warga</option>
                  <option value="Lain-lain (Pemasukan)">Lain-lain</option>
                </>
              )}
            </select>
          </div>

          {/* NOMINAL */}
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

          {/* NO KWITANSI / NOTA */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">No. Nota / Kwitansi</label>
            <input
              type="text"
              placeholder="Opsional (contoh: NOTA-01)"
              value={form.receiptNo}
              onChange={(e) => setForm({ ...form, receiptNo: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
            />
          </div>

          {/* RINCIAN PEMAKAIAN */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Rincian Pemakaian</label>
            <input
              type="text"
              placeholder="Untuk apa uang digunakan..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
              required
            />
          </div>

          {/* TOMBOL SIMPAN */}
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

      {/* TABEL RINCIAN LAPORAN KAS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-emerald-600" />
            Buku Kas & Rincian Penggunaan Anggaran
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {transactions.length} Transaksi Tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-bold">Tanggal</th>
                <th className="p-3.5 font-bold">Jenis Kas</th>
                <th className="p-3.5 font-bold">Kategori</th>
                <th className="p-3.5 font-bold">Rincian Pemakaian / Keterangan</th>
                <th className="p-3.5 font-bold">No. Kwitansi</th>
                <th className="p-3.5 font-bold text-right">Nominal</th>
                <th className="p-3.5 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Belum ada catatan transaksi kas.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3.5 text-xs text-slate-500 whitespace-nowrap">{t.date}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                          t.type === "income"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {t.type === "income" ? "Kas Masuk" : "Kas Keluar"}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">{t.category}</td>
                    <td className="p-3.5 text-slate-800 font-medium max-w-xs">{t.description}</td>
                    <td className="p-3.5 text-slate-500 text-xs font-mono">{t.receiptNo || "-"}</td>
                    <td
                      className={`p-3.5 font-mono font-bold text-right whitespace-nowrap ${
                        t.type === "income" ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {t.type === "income" ? "+ " : "- "}
                      Rp {t.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                        title="Hapus Catatan"
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