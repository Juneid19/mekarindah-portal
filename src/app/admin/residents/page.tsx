// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Search, ChevronLeft, ChevronRight, X, Phone, Mail, Home } from "lucide-react";

interface Resident {
  id: string;
  name: string;
  email: string;
  phone?: string;
  unit: string;
  block: string;
  role: string;
}

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // Sesuai permintaan: 50 warga per halaman

  // Daftar Blok A sampai J
  const blockOptions = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    block: "A",
    unit: "",
    password: "mekarindah123",
  });

  const loadResidents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/residents");
      if (res.ok) {
        const data = await res.json();
        setResidents(data);
      }
    } catch (err) {
      console.error("Gagal load warga:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResidents();
  }, []);

  const handleAddResident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/residents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal menambah");

      alert("✅ Warga berhasil ditambahkan ke Blok " + formData.block);
      setIsModalOpen(false);
      setFormData({ name: "", email: "", phone: "", block: "A", unit: "", password: "mekarindah123" });
      loadResidents();
    } catch (error: any) {
      alert("❌ " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Paginasi
  const filtered = residents.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.block.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentResidents = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Warga Mekar Indah</h1>
          <p className="text-sm text-slate-500 mt-1">
            Menampilkan {filtered.length} dari {residents.length} total warga
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
        >
          <UserPlus className="w-5 h-5" />
          Tambah Warga Baru
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari Nama, No Rumah, atau Blok (A-J)..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full bg-transparent border-none outline-none text-sm text-slate-700"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-4 px-6">Nama</th>
                <th className="py-4 px-6">Blok & Unit</th>
                <th className="py-4 px-6">Kontak</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="py-10 text-center text-slate-400">Mengambil data dari database Neon...</td></tr>
              ) : currentResidents.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-medium text-slate-800">{r.name}</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold mr-2">
                      Blok {r.block}
                    </span>
                    <span className="text-slate-600 font-medium">Unit {r.unit}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-500 text-xs italic">{r.email}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] uppercase font-bold">Aktif</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="text-xs text-slate-500 font-medium">
            Halaman <span className="text-slate-800">{currentPage}</span> dari <span className="text-slate-800">{totalPages}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 disabled:opacity-20 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex gap-1 px-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) pageNum = currentPage - 3 + i + 1;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-white'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 disabled:opacity-20 transition-all"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal with Expanded Blocks A-J */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Registrasi Warga Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <form onSubmit={handleAddResident} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Nama Lengkap</label>
                  <input
                    type="text" required placeholder="Nama Warga"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Blok (A-J)</label>
                  <select
                    value={formData.block}
                    onChange={e => setFormData({...formData, block: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  >
                    {blockOptions.map(b => (
                      <option key={b} value={b}>Blok {b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">No. Unit/Rumah</label>
                  <input
                    type="text" required placeholder="Contoh: 100"
                    value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Email (Login)</label>
                <input
                  type="email" required placeholder="email@warga.com"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">No. WhatsApp</label>
                <input
                  type="text" placeholder="0812..."
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 disabled:opacity-50">
                  {isSubmitting ? "Menyimpan..." : "Simpan Data Warga"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}