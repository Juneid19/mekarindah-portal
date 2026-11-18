"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Users,
  Receipt,
  Trash2,
  LogOut,
  ShieldAlert,
  RefreshCw,
  FileText,
  CreditCard,
  PlusCircle,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"dokumen" | "aduan" | "ipl" | "kartu" | "warga">("dokumen");
  const [loading, setLoading] = useState(false);

  // 1. STATE DOKUMEN & ADUAN
  const [complaints, setComplaints] = useState<any[]>([]);
  const [documentsList, setDocumentsList] = useState<any[]>([]);

  // 2. STATE KEUANGAN & IPL
  const [iplBills, setIplBills] = useState<any[]>([
    { id: "ipl-1", unit: "Blok A No. 1", residentName: "Saluniza", month: "Oktober 2024", amount: 150000, status: "Lunas" },
    { id: "ipl-2", unit: "Blok B No. 4", residentName: "Budi Santoso", month: "Oktober 2024", amount: 150000, status: "Belum Bayar" },
  ]);
  const [newBill, setNewBill] = useState({ unit: "", residentName: "", month: "November 2024", amount: "150000", status: "Belum Bayar" });

  // 3. STATE KARTU AKSES RFID
  const [rfidCards, setRfidCards] = useState<any[]>([
    { id: "card-1", cardUid: "RFID-882190", residentName: "Saluniza", unit: "Blok A No. 1", status: "Aktif", issuedDate: "01/10/2024" },
    { id: "card-2", cardUid: "RFID-771234", residentName: "Budi Santoso", unit: "Blok B No. 4", status: "Aktif", issuedDate: "15/09/2024" },
  ]);
  const [newCard, setNewCard] = useState({ cardUid: "", residentName: "", unit: "" });

  // Fetch Dokumen & Aduan dari API
  const refreshData = async () => {
    setLoading(true);
    try {
      const [resComp, resDoc] = await Promise.all([
        fetch("/api/complaints"),
        fetch("/api/documents")
      ]);
      if (resComp.ok) setComplaints(await resComp.json());
      if (resDoc.ok) setDocumentsList(await resDoc.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Update Status Dokumen
  const handleUpdateDocStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) refreshData();
    } catch {
      alert("Gagal update status dokumen");
    }
  };

  // Update Status Aduan
  const handleUpdateComplaintStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) refreshData();
    } catch {
      alert("Gagal update aduan");
    }
  };

  // Tambah Tagihan IPL Baru
  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBill.unit || !newBill.residentName) {
      alert("Harap lengkapi unit dan nama warga");
      return;
    }
    const created = {
      id: `ipl-${Date.now()}`,
      unit: newBill.unit,
      residentName: newBill.residentName,
      month: newBill.month,
      amount: parseInt(newBill.amount) || 150000,
      status: newBill.status,
    };
    setIplBills([created, ...iplBills]);
    setNewBill({ unit: "", residentName: "", month: "November 2024", amount: "150000", status: "Belum Bayar" });
    alert("✅ Tagihan IPL berhasil ditambahkan!");
  };

  // Tambah Kartu RFID Baru
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.cardUid || !newCard.residentName) {
      alert("Harap lengkapi No RFID dan Nama Pemilik");
      return;
    }
    const created = {
      id: `card-${Date.now()}`,
      cardUid: newCard.cardUid,
      residentName: newCard.residentName,
      unit: newCard.unit || "-",
      status: "Aktif",
      issuedDate: new Date().toLocaleDateString("id-ID"),
    };
    setRfidCards([created, ...rfidCards]);
    setNewCard({ cardUid: "", residentName: "", unit: "" });
    alert("✅ Kartu Akses RFID berhasil didaftarkan!");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* NAVIGASI TAB ADMIN UNTUK MEMILIH MODUL */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 bg-white p-3 rounded-xl shadow-sm">
        <button
          onClick={() => setActiveTab("dokumen")}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "dokumen" ? "bg-orange-500 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileText size={18} /> Permohonan Dokumen ({documentsList.length})
        </button>
        <button
          onClick={() => setActiveTab("aduan")}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "aduan" ? "bg-orange-500 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Megaphone size={18} /> Aduan & SOS ({complaints.length})
        </button>
        <button
          onClick={() => setActiveTab("ipl")}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "ipl" ? "bg-orange-500 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Receipt size={18} /> Tagihan IPL & Kas
        </button>
        <button
          onClick={() => setActiveTab("kartu")}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "kartu" ? "bg-orange-500 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CreditCard size={18} /> Registrasi Kartu RFID
        </button>
      </div>

      {/* ==================== 1. MODUL PERMOHONAN DOKUMEN ==================== */}
      {activeTab === "dokumen" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-base">
              <FileText size={20} className="text-orange-500" />
              Daftar Permohonan Surat / Dokumen Masuk
            </h2>
            <button onClick={refreshData} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 text-xs font-bold flex items-center gap-1">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Muat Ulang
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3.5 font-bold">Pemohon / Unit</th>
                  <th className="p-3.5 font-bold">Jenis Surat</th>
                  <th className="p-3.5 font-bold">Tanggal</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 text-right font-bold">Tindakan Admin/RT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documentsList.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">Belum ada permohonan surat.</td></tr>
                ) : (
                  documentsList.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{doc.residentName || doc.residentId || "Warga"}</div>
                        <div className="text-xs text-slate-500">Unit: {doc.unit || "-"}</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-800">{doc.type}</td>
                      <td className="p-3.5 text-xs text-slate-500">{doc.submitted || "-"}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          doc.status === "Selesai" || doc.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                          doc.status === "Diproses" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {doc.status || "Pending"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button onClick={() => handleUpdateDocStatus(doc.id, "Diproses")} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold">Proses</button>
                        <button onClick={() => handleUpdateDocStatus(doc.id, "Selesai")} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold">Selesai / Terbit</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== 2. MODUL ADUAN & SOS ==================== */}
      {activeTab === "aduan" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-base">
              <ShieldAlert size={20} className="text-red-500" />
              Laporan Aduan & Panggilan Darurat SOS
            </h2>
            <button onClick={refreshData} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 text-xs font-bold flex items-center gap-1">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Muat Ulang
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3.5 font-bold">Pengirim</th>
                  <th className="p-3.5 font-bold">Rincian Laporan</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 text-right font-bold">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">Belum ada aduan masuk.</td></tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-800">{c.residentId || "Warga"}</td>
                      <td className="p-3.5 text-slate-800 font-medium">{c.detail}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          c.status === "Selesai" ? "bg-emerald-100 text-emerald-700" :
                          c.status === "Diproses" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {c.status || "Diterima"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button onClick={() => handleUpdateComplaintStatus(c.id, "Diproses")} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold">Proses</button>
                        <button onClick={() => handleUpdateComplaintStatus(c.id, "Selesai")} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold">Selesai</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== 3. MODUL KEUANGAN & TAGIHAN IPL ==================== */}
      {activeTab === "ipl" && (
        <div className="space-y-6">
          {/* Form Input Tagihan IPL Baru */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
              <PlusCircle className="text-orange-500" size={18} />
              Input Tagihan IPL / Catatan Keuangan Baru
            </h3>
            <form onSubmit={handleAddBill} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <input
                type="text"
                placeholder="Unit (contoh: Blok A No. 1)"
                value={newBill.unit}
                onChange={(e) => setNewBill({ ...newBill, unit: e.target.value })}
                className="border border-slate-300 rounded-lg p-2.5 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Nama Warga"
                value={newBill.residentName}
                onChange={(e) => setNewBill({ ...newBill, residentName: e.target.value })}
                className="border border-slate-300 rounded-lg p-2.5 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Bulan / Periode"
                value={newBill.month}
                onChange={(e) => setNewBill({ ...newBill, month: e.target.value })}
                className="border border-slate-300 rounded-lg p-2.5 text-sm"
                required
              />
              <input
                type="number"
                placeholder="Nominal (Rp)"
                value={newBill.amount}
                onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                className="border border-slate-300 rounded-lg p-2.5 text-sm"
                required
              />
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-1 shadow">
                <PlusCircle size={16} /> Simpan Tagihan
              </button>
            </form>
          </div>

          {/* Tabel Tagihan IPL */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Daftar Tagihan IPL & Rekap Keuangan</h3>
              <div className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                Total Kas Masuk: Rp {iplBills.filter(b => b.status === "Lunas").reduce((acc, curr) => acc + curr.amount, 0).toLocaleString("id-ID")}
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
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="p-3.5 text-right font-bold">Ubah Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {iplBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-800">{bill.unit}</td>
                      <td className="p-3.5 text-slate-700">{bill.residentName}</td>
                      <td className="p-3.5 text-slate-600">{bill.month}</td>
                      <td className="p-3.5 font-bold text-slate-800">Rp {bill.amount.toLocaleString("id-ID")}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          bill.status === "Lunas" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => setIplBills(iplBills.map(b => b.id === bill.id ? { ...b, status: b.status === "Lunas" ? "Belum Bayar" : "Lunas" } : b))}
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-semibold"
                        >
                          Tandai {bill.status === "Lunas" ? "Belum Lunas" : "Lunas"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. MODUL REGISTRASI KARTU AKSES RFID ==================== */}
      {activeTab === "kartu" && (
        <div className="space-y-6">
          {/* Form Registrasi Kartu Baru */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
              <PlusCircle className="text-orange-500" size={18} />
              Registrasi Kartu Akses RFID Gate Baru
            </h3>
            <form onSubmit={handleAddCard} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Nomor UID RFID (Contoh: RFID-99120)"
                value={newCard.cardUid}
                onChange={(e) => setNewCard({ ...newCard, cardUid: e.target.value })}
                className="border border-slate-300 rounded-lg p-2.5 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Nama Pemilik Kartu"
                value={newCard.residentName}
                onChange={(e) => setNewCard({ ...newCard, residentName: e.target.value })}
                className="border border-slate-300 rounded-lg p-2.5 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Unit Warga"
                value={newCard.unit}
                onChange={(e) => setNewCard({ ...newCard, unit: e.target.value })}
                className="border border-slate-300 rounded-lg p-2.5 text-sm"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-1 shadow">
                <CreditCard size={16} /> Daftarkan Kartu
              </button>
            </form>
          </div>

          {/* Tabel Kartu RFID */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Daftar Kartu RFID Akses Gate Perumahan</h3>
              <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                Total Terdaftar: {rfidCards.length} Kartu
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 font-bold">UID RFID</th>
                    <th className="p-3.5 font-bold">Nama Pemegang</th>
                    <th className="p-3.5 font-bold">Unit</th>
                    <th className="p-3.5 font-bold">Tgl Terbit</th>
                    <th className="p-3.5 font-bold">Status Kartu</th>
                    <th className="p-3.5 text-right font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rfidCards.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-slate-800">{c.cardUid}</td>
                      <td className="p-3.5 font-medium text-slate-800">{c.residentName}</td>
                      <td className="p-3.5 text-slate-600">{c.unit}</td>
                      <td className="p-3.5 text-slate-500 text-xs">{c.issuedDate}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          c.status === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setRfidCards(rfidCards.map(item => item.id === c.id ? { ...item, status: item.status === "Aktif" ? "Diblokir" : "Aktif" } : item))}
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-semibold"
                        >
                          {c.status === "Aktif" ? "Blokir" : "Aktifkan"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}