"use client";

import React, { useState, useEffect } from "react";
import {
  Receipt,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Search,
  Trash2,
} from "lucide-react";

interface IplBill {
  id: string;
  unit: string;
  residentName: string;
  month: string;
  amount: number;
  status: "Lunas" | "Belum Bayar";
  paidAt?: string;
}

export default function TagihanIplAdmin() {
  const [bills, setBills] = useState<IplBill[]>([
    { id: "ipl-1", unit: "Blok A No. 1", residentName: "Saluniza", month: "Oktober 2024", amount: 150000, status: "Lunas", paidAt: "02/10/2024" },
    { id: "ipl-2", unit: "Blok A No. 2", residentName: "Pak RT Hendra", month: "Oktober 2024", amount: 150000, status: "Lunas", paidAt: "01/10/2024" },
    { id: "ipl-3", unit: "Blok B No. 4", residentName: "Budi Santoso", month: "Oktober 2024", amount: 150000, status: "Belum Bayar" },
    { id: "ipl-4", unit: "Blok C No. 7", residentName: "Ibu Rahmawati", month: "Oktober 2024", amount: 150000, status: "Belum Bayar" },
  ]);

  const [search, setSearch] = useState("");
  const [newBill, setNewBill] = useState({
    unit: "",
    residentName: "",
    month: "November 2024",
    amount: "150000",
    status: "Belum Bayar" as "Lunas" | "Belum Bayar",
  });

  // Load dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mekarindah_tagihan_ipl");
    if (saved) {
      try { setBills(JSON.parse(saved)); } catch {}
    }
  }, []);

  const saveBills = (data: IplBill[]) => {
    setBills(data);
    localStorage.setItem("mekarindah_tagihan_ipl", JSON.stringify(data));
  };

  // Tambah Tagihan Baru
  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBill.unit || !newBill.residentName) {
      alert("Harap lengkapi Unit dan Nama Warga");
      return;
    }

    const created: IplBill = {
      id: `ipl-${Date.now()}`,
      unit: newBill.unit,
      residentName: newBill.residentName,
      month: newBill.month,
      amount: parseInt(newBill.amount) || 150000,
      status: newBill.status,
      paidAt: newBill.status === "Lunas" ? new Date().toLocaleDateString("id-ID") : undefined,
    };

    const updated = [created, ...bills];
    saveBills(updated);

    setNewBill({
      unit: "",
      residentName: "",
      month: "November 2024",
      amount: "150000",
      status: "Belum Bayar",
    });

    alert("✅ Tagihan IPL warga berhasil dibuat!");
  };

  // Ubah Status Lunas / Belum Lunas
  const toggleStatus = (id: string) => {
    const updated = bills.map((b) => {
      if (b.id === id) {
        const nextStatus = b.status === "Lunas" ? ("Belum Bayar" as const) : ("Lunas" as const);
        return {
          ...b,
          status: nextStatus,
          paidAt: nextStatus === "Lunas" ? new Date().toLocaleDateString("id-ID") : undefined,
        };
      }
      return b;
    });
    saveBills(updated);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Hapus data tagihan ini?")) return;
    saveBills(bills.filter((b) => b.id !== id));
  };

  // Filter Search
  const filtered = bills.filter(
    (b) =>
      b.unit.toLowerCase().includes(search.toLowerCase()) ||
      b.residentName.toLowerCase().includes(search.toLowerCase()) ||
      b.month.toLowerCase().includes(search.toLowerCase())
  );

  const lunasCount = bills.filter((b) => b.status === "Lunas").length;
  const nunggakCount = bills.filter((b) => b.status === "Belum Bayar").length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* JUDUL */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Receipt className="text-orange-500" />
          Manajemen Tagihan IPL (Iuran Pemeliharaan Lingkungan)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Daftar tagihan bulanan per unit warga, verifikasi status pembayaran lunas atau belum lunas.
        </p>
      </div>

      {/* STATISTIK TAGIHAN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Total Tagihan Beredar</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{bills.length} Tagihan</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Warga Sudah Lunas</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{lunasCount} Unit</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Menunggak (Belum Bayar)</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{nunggakCount} Unit</p>
        </div>
      </div>

      {/* FORM INPUT TAGIHAN PER UNIT */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
          <PlusCircle className="text-orange-500" size={20} />
          Input Tagihan IPL Unit Warga Baru
        </h2>
        <form onSubmit={handleAddBill} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Unit / Blok</label>
            <input
              type="text"
              placeholder="Contoh: Blok A No. 1"
              value={newBill.unit}
              onChange={(e) => setNewBill({ ...newBill, unit: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Nama Pemilik / Warga</label>
            <input
              type="text"
              placeholder="Nama warga"
              value={newBill.residentName}
              onChange={(e) => setNewBill({ ...newBill, residentName: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Bulan Periode</label>
            <input
              type="text"
              placeholder="Contoh: November 2024"
              value={newBill.month}
              onChange={(e) => setNewBill({ ...newBill, month: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Nominal IPL (Rp)</label>
            <input
              type="number"
              placeholder="150000"
              value={newBill.amount}
              onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-1.5 shadow"
            >
              <PlusCircle size={16} /> Buat Tagihan
            </button>
          </div>
        </form>
      </div>

      {/* TABEL DATA TAGIHAN WARGA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            Daftar Tagihan & Status Pembayaran Warga
          </h3>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Unit / Nama Warga..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-bold">Unit</th>
                <th className="p-3.5 font-bold">Nama Warga</th>
                <th className="p-3.5 font-bold">Periode</th>
                <th className="p-3.5 font-bold">Nominal</th>
                <th className="p-3.5 font-bold">Status Bayar</th>
                <th className="p-3.5 font-bold text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ditemukan data tagihan.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-800">{b.unit}</td>
                    <td className="p-3.5 text-slate-700">{b.residentName}</td>
                    <td className="p-3.5 text-slate-500 text-xs">{b.month}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-800">
                      Rp {b.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                          b.status === "Lunas"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {b.status === "Lunas" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(b.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          b.status === "Lunas"
                            ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                        }`}
                      >
                        {b.status === "Lunas" ? "Batalkan Lunas" : "Tandai Lunas"}
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                        title="Hapus"
                      >
                        <Trash2 size={15} />
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