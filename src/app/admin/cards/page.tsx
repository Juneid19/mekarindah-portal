// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Plus, ShieldCheck, ShieldAlert, Search, RefreshCw, X } from "lucide-react";

interface AccessCard {
  id: string;
  residentId: string;
  residentName?: string;
  unit?: string;
  number: string;
  label: string;
  active: boolean;
}

export default function AdminCardsPage() {
  const [cards, setCards] = useState<AccessCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    residentId: "",
    number: "",
    label: "Kartu Utama",
  });
  const [residents, setResidents] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resCards, resWarga] = await Promise.all([
        fetch("/api/admin/cards").then((r) => r.json()),
        fetch("/api/residents").then((r) => r.json()),
      ]);
      setCards(Array.isArray(resCards) ? resCards : []);
      setResidents(Array.isArray(resWarga) ? resWarga : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const actionText = currentStatus ? "blokir" : "aktifkan";
    if (!confirm(`Apakah Anda yakin ingin ${actionText} kartu ini?`)) return;

    try {
      const res = await fetch(`/api/admin/cards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      alert("Gagal mengubah status kartu");
    }
  };

  const handleRegisterCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal daftarkan kartu");

      alert("✅ Kartu RFID fisik berhasil didaftarkan ke sistem!");
      setIsModalOpen(false);
      setFormData({ residentId: "", number: "", label: "Kartu Utama" });
      loadData();
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  };

  const filteredCards = cards.filter(
    (c) =>
      c.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.residentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.unit?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER YANG TELAH DIRAPIKAN */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-800">
              Kelola Kartu RFID Gerbang
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pusat registrasi kartu fisik RFID, aktivasi nomor akses, dan pemblokiran kartu yang hilang.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm transition-all active:scale-95 shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" />
          Daftarkan Kartu Fisik Baru
        </button>
      </div>

      {/* FILTER SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nomor UID RFID, nama warga, atau unit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-sm text-slate-700"
        />
      </div>

      {/* TABEL DAFTAR KARTU */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-4 px-6">Nomor Fisik Kartu (UID)</th>
                <th className="py-4 px-6">Pemilik (Warga)</th>
                <th className="py-4 px-6">Label Akses</th>
                <th className="py-4 px-6">Status Palang</th>
                <th className="py-4 px-6 text-right">Aksi Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Memuat data kartu RFID...
                  </td>
                </tr>
              ) : filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada kartu RFID yang didaftarkan.
                  </td>
                </tr>
              ) : (
                filteredCards.map((card) => (
                  <tr key={card.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-mono font-bold text-slate-800">
                      {card.number}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">
                        {card.residentName || "Warga"}
                      </div>
                      <div className="text-xs text-slate-400">
                        Unit {card.unit || "-"}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg">
                        {card.label || "Kartu Utama"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {card.active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Aktif (Bisa Buka Palang)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-semibold">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Terblokir (Palang Tolak)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleStatus(card.id, card.active)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                          card.active
                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                      >
                        {card.active ? "Blokir Akses" : "Aktifkan Kembali"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRASI KARTU BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Registrasi Kartu Fisik RFID
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterCard} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Pilih Pemilik (Warga) *
                </label>
                <select
                  required
                  value={formData.residentId}
                  onChange={(e) =>
                    setFormData({ ...formData, residentId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">-- Pilih Warga & Unit --</option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} - Blok {r.block} / Unit {r.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Nomor Fisik Kartu (UID RFID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: RFID-99281 atau Scan kartu"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Tempelkan kartu ke reader RFID atau ketikkan nomor seri yang tercetak di kartu fisik.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Jenis Akses
                </label>
                <select
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Kartu Utama">Kartu Utama (Mobil)</option>
                  <option value="Kartu Tambahan">Kartu Tambahan (Motor)</option>
                  <option value="Kartu Tamu / ART">Kartu Tamu / ART</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  Simpan & Aktifkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}