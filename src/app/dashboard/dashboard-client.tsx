"use client";

import React, { useState } from "react";
import { 
  Home, 
  CreditCard, 
  KeyRound, 
  FileText, 
  Car, 
  ShieldAlert, 
  Flame, 
  DoorOpen, 
  LogOut 
} from "lucide-react";
import { ComplaintsSection } from "@/components/complaints-section";

interface ResidentProps {
  id?: string;
  name?: string;
  email?: string;
  unit?: string;
  phone?: string;
  status?: string;
}

export default function DashboardClient({
  resident, initialUser, invoices = [],
  cards = [],
  documents = [],
  vehicles = [],
}: {
  resident?: ResidentProps;
  initialUser?: any;
  invoices?: any[];
  cards?: any[];
  documents?: any[];
  vehicles?: any[];
}) {
  const [sosLoading, setSosLoading] = useState<string | null>(null);
  const [gateLoading, setGateLoading] = useState(false);

  const residentId = resident?.id || "res-1";
  const residentName = resident?.name || "Almira";
  const residentUnit = resident?.unit || "A-001";

  // Handle Telegram SOS
  const handleSOS = async (type: "kebakaran" | "pencurian") => {
    if (!confirm(`Apakah Anda yakin ingin mengirim sinyal DARURAT ${type.toUpperCase()} ke Sekuriti?`)) return;
    setSosLoading(type);
    try {
      const res = await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          resident_name: residentName,
          unit: residentUnit,
          phone: resident?.phone || "-",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`🚨 Sinyal SOS ${type.toUpperCase()} telah terkirim ke Telegram Sekuriti!`);
      } else {
        alert("Gagal mengirim SOS. Silakan hubungi sekuriti langsung.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setSosLoading(null);
    }
  };

  // Handle Remote Gate Open
  const handleOpenGate = async () => {
    setGateLoading(true);
    try {
      const res = await fetch("/api/gate/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resident_name: residentName,
          unit: residentUnit,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("🔓 Perintah Buka Gate telah dikirim ke Telegram Sekuriti!");
      } else {
        alert("Gagal mengirim perintah buka gate.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setGateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Top Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-lg">
              MI
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">PORTAL WARGA TERUPDATE Mekarindah</h1>
              <p className="text-xs text-slate-400">Unit: <span className="text-emerald-400 font-semibold">{residentUnit}</span> | {residentName}</p>
            </div>
          </div>

          <a
            href="/api/auth/signout"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-800/80 px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Banner SOS & Fast Action */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
                Akses Cepat Warga
              </span>
              <h2 className="text-xl font-bold">Tombol Darurat & Buka Gate Remote</h2>
              <p className="text-sm text-slate-300 mt-1">
                Terhubung langsung 24/7 ke Telegram Sekuriti Perumahan Mekarindah.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => handleSOS("kebakaran")}
                disabled={sosLoading !== null}
                className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Flame className="w-4 h-4" />
                {sosLoading === "kebakaran" ? "Mengirim..." : "SOS Kebakaran"}
              </button>

              <button
                onClick={() => handleSOS("pencurian")}
                disabled={sosLoading !== null}
                className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                {sosLoading === "pencurian" ? "Mengirim..." : "SOS Pencurian"}
              </button>

              <button
                onClick={handleOpenGate}
                disabled={gateLoading}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <DoorOpen className="w-4 h-4" />
                {gateLoading ? "Membuka..." : "Buka Gate Remote"}
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Status Hunian</p>
              <p className="text-sm font-bold text-slate-800">Pemilik Aktif</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tagihan IPL</p>
              <p className="text-sm font-bold text-slate-800">
                {invoices.length > 0 ? `${invoices.length} Tagihan` : "Lunas"}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Kartu RFID</p>
              <p className="text-sm font-bold text-slate-800">{cards.length || 1} Kartu</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Kendaraan</p>
              <p className="text-sm font-bold text-slate-800">{vehicles.length || 0} Unit</p>
            </div>
          </div>
        </div>

        {/* MODUL ADUAN WARGA (FULL CRUD: BUAT, LIHAT, EDIT, HAPUS) */}
        <ComplaintsSection 
          residentId={residentId} 
          residentName={residentName} 
          unit={residentUnit} 
        />
      </main>
    </div>
  );
}
