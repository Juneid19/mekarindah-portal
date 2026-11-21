// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Plus, Search, Calendar, User, Hash, X, Clock } from "lucide-react";

export default function AdminSecurityPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    unit: "",
    assignedTo: "",
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  const loadCodes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/security");
      const data = await res.json();
      setCodes(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCodes(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/security", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setIsModalOpen(false);
      loadCodes();
      alert("✅ Kode Keamanan Berhasil Dibuat!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kode Keamanan Tamu</h1>
          <p className="text-sm text-slate-500">Kelola kode akses sementara untuk tamu, kurir, atau pekerja.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all"
        >
          <Plus className="w-5 h-5" /> Buat Kode Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b">
            <tr>
              <th className="p-4">KODE AKSES</th>
              <th className="p-4">DITUJUKAN UNTUK</th>
              <th className="p-4">UNIT TUJUAN</th>
              <th className="p-4">BERLAKU SAMPAI</th>
              <th className="p-4">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400">Memuat data...</td></tr>
            ) : codes.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-mono text-lg font-black text-emerald-600">{c.code}</td>
                <td className="p-4 font-medium text-slate-800">{c.assignedTo}</td>
                <td className="p-4 text-slate-600">Blok/Unit: {c.unit}</td>
                <td className="p-4 text-slate-500 text-xs">
                  {new Date(c.validUntil).toLocaleString('id-ID')}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    c.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {c.status === 'active' ? 'Aktif' : 'Expired'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Buat Kode Akses Sementara</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Nama Tamu / Pekerja</label>
                <input 
                  type="text" required placeholder="Contoh: Kurir Paket / Tukang Cat"
                  value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Unit Tujuan (Rumah Warga)</label>
                <input 
                  type="text" required placeholder="Contoh: Blok A-15"
                  value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Berlaku Sampai Tanggal/Jam</label>
                <input 
                  type="datetime-local" required
                  value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20">
                Generate & Simpan Kode
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}