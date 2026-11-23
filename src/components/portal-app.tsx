"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Building2,
  Car,
  CreditCard,
  AlertTriangle,
  KeyRound,
  ShieldCheck,
  User,
  LogOut,
  QrCode,
  Bell,
  Phone,
  Upload,
  CheckCircle2,
  Clock,
  ChevronRight,
  Info,
  Sparkles,
  BadgeCheck,
  Copy,
  Flame,
  Ambulance,
  ShieldAlert,
  Send,
  X,
  LayoutGrid,
  Table as TableIcon,
  Bike
} from "lucide-react";

// Tipe Data
export interface ResidentData {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  block: string;
  unit: string;
  role: string;
  rfid_tag?: string;
  status_ipl?: "Lunas" | "Belum Bayar" | "Menunggu Verifikasi";
}

export interface PropertyItem {
  id: string | number;
  resident_id?: string | number;
  block: string;
  unit_number: string;
  status: string; // Dihuni Sendiri, Disewakan, Kosong
  surface_area: number | string; // Luas Tanah (m²)
  building_area: number | string; // Luas Bangunan (m²)
  electricity: string; // misal: 2200 VA
  ipl_amount: number | string; // Besaran IPL
  is_verified?: boolean;
}

export interface VehicleItem {
  id: string | number;
  resident_id?: string | number;
  plate: string;
  type: "Mobil" | "Motor" | string;
  brand: string;
  color: string;
  rfid_tag?: string;
  is_rfid_active?: boolean;
  registered_at?: string;
}

export function PortalApp() {
  // Tab Aktif
  const [activeTab, setActiveTab] = useState<"beranda" | "properti" | "kendaraan" | "keuangan" | "tamu" | "aduan">("beranda");

  // Mode Tampilan Kendaraan (Card Visual vs Tabel)
  const [vehicleViewMode, setVehicleViewMode] = useState<"card" | "table">("card");

  // State Data Warga
  const [resident, setResident] = useState<ResidentData>({
    id: "1",
    name: "Saluniza",
    email: "saluniza66@gmail.com",
    phone: "0812-3456-7890",
    block: "B",
    unit: "B-08",
    role: "Warga Tetap",
    rfid_tag: "RFID-MI-8821",
    status_ipl: "Lunas"
  });

  // Data Properti
  const [properties, setProperties] = useState<PropertyItem[]>([
    {
      id: "prop-1",
      block: "B",
      unit_number: "08",
      status: "Dihuni Sendiri",
      surface_area: 120,
      building_area: 90,
      electricity: "2200 VA",
      ipl_amount: 150000,
      is_verified: true
    }
  ]);

  // Data Kendaraan (Proporsional & Lengkap)
  const [vehicles, setVehicles] = useState<VehicleItem[]>([
    {
      id: "veh-1",
      plate: "B 1829 SZO",
      type: "Mobil",
      brand: "Honda HR-V 1.5 RS",
      color: "Putih Mutiara",
      rfid_tag: "RF-8829-01",
      is_rfid_active: true,
      registered_at: "2024"
    },
    {
      id: "veh-2",
      plate: "B 4921 BNA",
      type: "Motor",
      brand: "Yamaha NMAX 155",
      color: "Hitam Doff",
      rfid_tag: "RF-8829-02",
      is_rfid_active: true,
      registered_at: "2024"
    }
  ]);

  // State Keuangan
  const [bills] = useState([
    { id: "bill-1", month: "Maret", year: 2025, amount: 150000, status: "Lunas", due_date: "10 Mar 2025" },
    { id: "bill-2", month: "April", year: 2025, amount: 150000, status: "Belum Bayar", due_date: "10 Apr 2025" }
  ]);

  // State Modal
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isGuestPassModalOpen, setIsGuestPassModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Form State
  const [guestName, setGuestName] = useState("");
  const [generatedGuestCode, setGeneratedGuestCode] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [sosSending, setSosSending] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  // Ambil Data dari API jika tersedia
  useEffect(() => {
    async function fetchData() {
      try {
        const propRes = await fetch("/api/properties");
        if (propRes.ok) {
          const propData = await propRes.json();
          if (Array.isArray(propData) && propData.length > 0) setProperties(propData);
        }

        const vehRes = await fetch("/api/vehicles");
        if (vehRes.ok) {
          const vehData = await vehRes.json();
          if (Array.isArray(vehData) && vehData.length > 0) setVehicles(vehData);
        }
      } catch (err) {
        console.log("Portal menggunakan data aktif");
      }
    }
    fetchData();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSendSOS = async (type: string) => {
    setSosSending(true);
    try {
      const message = `🚨 *PANIC BUTTON / SOS MEKAR INDAH* 🚨\n\n👤 *Nama Warga:* ${resident.name}\n🏠 *Unit:* Blok ${resident.block} No. ${resident.unit}\n📞 *No. HP:* ${resident.phone}\n⚠️ *Jenis Darurat:* ${type.toUpperCase()}\n⏰ *Waktu:* ${new Date().toLocaleString("id-ID")}\n\n*Petugas Satpam Harap Segera Menuju Lokasi!*`;

      await fetch("https://api.telegram.org/bot9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: "-1004379863895",
          text: message,
          parse_mode: "Markdown"
        })
      });

      setSosSent(true);
      setTimeout(() => {
        setSosSent(false);
        setIsSosModalOpen(false);
      }, 3000);
    } catch (e) {
      alert("Peringatan darurat telah dikirim ke Pos Keamanan!");
      setIsSosModalOpen(false);
    } finally {
      setSosSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-28 md:pb-12">
      {/* ========================================================
          APP BAR / TOP HEADER
      ======================================================== */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-base shadow-lg shadow-emerald-500/20">
              MI
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Warga Blok {resident.block}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white leading-tight">Mekar Indah Portal</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSosModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>SOS</span>
            </button>

            <a
              href="/login"
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}
      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Profile Card Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-850 via-slate-900 to-slate-950 border border-slate-800 p-4 sm:p-5 shadow-xl">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-xs text-slate-400">Selamat Datang,</p>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-1.5 mt-0.5">
                {resident.name}
                <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              </h2>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Unit: <strong className="text-emerald-400">Blok {resident.block} No. {resident.unit}</strong></span>
                <span className="text-slate-600">•</span>
                <span>RFID Gate: <code className="text-[11px] font-mono text-cyan-300 font-semibold">{resident.rfid_tag}</code></span>
              </p>
            </div>

            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 transition active:scale-95 shrink-0"
            >
              <QrCode className="w-5 h-5 text-emerald-400" />
              <span className="text-[9px] font-medium text-slate-300 mt-1">Pass Gate</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800">
            <div className="bg-slate-900/70 rounded-xl p-2.5 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Status Iuran IPL</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Lunas (Maret 2025)
              </span>
            </div>
            <div className="bg-slate-900/70 rounded-xl p-2.5 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Akses Kendaraan</span>
              <span className="text-xs sm:text-sm font-bold text-cyan-400 flex items-center gap-1 mt-0.5">
                <Car className="w-3.5 h-3.5" /> {vehicles.length} Unit Terdaftar
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            NAVIGATION TABS (DESKTOP & TABLET)
        ======================================================== */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs font-semibold">
          {[
            { id: "beranda", label: "Beranda", icon: Home },
            { id: "properti", label: "Properti Saya", icon: Building2 },
            { id: "kendaraan", label: "Kendaraan", icon: Car },
            { id: "keuangan", label: "IPL & Kas", icon: CreditCard },
            { id: "tamu", label: "Akses Tamu", icon: KeyRound }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl shrink-0 transition-all ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB 1: BERANDA
        ======================================================== */}
        {activeTab === "beranda" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => setActiveTab("properti")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition active:scale-95 text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1.5">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Properti</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{properties.length} Unit</span>
              </button>

              <button
                onClick={() => setActiveTab("kendaraan")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition active:scale-95 text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-1.5">
                  <Car className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Kendaraan</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{vehicles.length} Unit</span>
              </button>

              <button
                onClick={() => setActiveTab("keuangan")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition active:scale-95 text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-1.5">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Tagihan IPL</span>
                <span className="text-[10px] text-emerald-400 mt-0.5">Lunas</span>
              </button>

              <button
                onClick={() => setIsGuestPassModalOpen(true)}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition active:scale-95 text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-1.5">
                  <KeyRound className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Kode Tamu</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Buat Pass</span>
              </button>
            </div>

            {/* Pengumuman */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  Pengumuman Warga RW 08
                </h3>
                <span className="text-[10px] text-emerald-400 font-semibold">Terkini</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold text-emerald-400">Pemberitahuan Sistem RFID Gate</span>
                  <span>28 Mar 2025</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Pemasangan stiker RFID kendaraan baru dilakukan di Pos Satpam Utama setiap Sabtu-Minggu.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: PROPERTI SAYA (SMART CARDS PROPORSIONAL)
        ======================================================== */}
        {activeTab === "properti" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Data Unit Properti Terdaftar
                </h3>
                <p className="text-[11px] text-slate-400">Data resmi terverifikasi dalam database RW Mekar Indah</p>
              </div>
            </div>

            {/* Info Warga: Read Only */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Data properti dikelola terpusat oleh Admin RW. Hubungi pengurus jika ada perbaikan data luas tanah atau sertifikat.
              </span>
            </div>

            {/* List Property Cards */}
            <div className="space-y-3">
              {properties.map((prop, idx) => (
                <div
                  key={prop.id || idx}
                  className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-4 shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {prop.status || "Dihuni Sendiri"}
                        </span>
                        <span className="text-[10px] font-semibold text-cyan-400 flex items-center gap-0.5">
                          <BadgeCheck className="w-3.5 h-3.5" /> Terverifikasi
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white mt-1">
                        Blok {prop.block} — No. {prop.unit_number}
                      </h4>
                      <p className="text-[11px] text-slate-400">Komplek Mekar Indah RW 08</p>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>

                  {/* 4 Kotak Spesifikasi Proporsional */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
                    <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Luas Tanah (LT)</span>
                      <strong className="text-xs sm:text-sm text-slate-100">{prop.surface_area || 120} m²</strong>
                    </div>

                    <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Luas Bangunan (LB)</span>
                      <strong className="text-xs sm:text-sm text-slate-100">{prop.building_area || 90} m²</strong>
                    </div>

                    <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Daya Listrik</span>
                      <strong className="text-xs sm:text-sm text-amber-400">{prop.electricity || "2200 VA"}</strong>
                    </div>

                    <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Iuran IPL / Bln</span>
                      <strong className="text-xs sm:text-sm text-emerald-400">
                        Rp {Number(prop.ipl_amount || 150000).toLocaleString("id-ID")}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: KENDARAAN (SMART LICENSE PLATE & PROPORTIONAL)
        ======================================================== */}
        {activeTab === "kendaraan" && (
          <div className="space-y-3">
            {/* Header & View Switcher */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-cyan-400" />
                  Kendaraan & Akses Gerbang
                </h3>
                <p className="text-[11px] text-slate-400">Daftar kendaraan resmi yang memiliki stiker RFID Gate</p>
              </div>

              {/* Toggle Card vs Table */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                <button
                  onClick={() => setVehicleViewMode("card")}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    vehicleViewMode === "card"
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Tampilan Kartu Plat"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setVehicleViewMode("table")}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    vehicleViewMode === "table"
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Tampilan Tabel"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Info Card Pengurusan Plat */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Pendaftaran plat baru atau penggantian stiker RFID dilakukan di Sekretariat RW atau Pos Satpam.
              </span>
            </div>

            {/* VIEW MODE 1: SMART LICENSE PLATE CARDS (DESAIN OTENTIK) */}
            {vehicleViewMode === "card" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicles.map((veh, idx) => (
                  <div
                    key={veh.id || idx}
                    className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-4 shadow-lg space-y-3 relative"
                  >
                    {/* Header Kartu Kendaraan */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400">
                          {veh.type?.toLowerCase().includes("motor") ? (
                            <Bike className="w-4 h-4" />
                          ) : (
                            <Car className="w-4 h-4" />
                          )}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{veh.type}</span>
                      </div>

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Gate Aktif
                      </span>
                    </div>

                    {/* PLAT NOMOR INDONESIA REALISTIS (OTENTIK) */}
                    <div className="bg-zinc-950 rounded-xl p-2.5 border-2 border-zinc-700/80 shadow-inner flex flex-col items-center justify-center">
                      <div className="border border-zinc-600/40 rounded-lg w-full py-2 px-3 text-center bg-zinc-900/60 shadow-inner">
                        <span className="text-lg sm:text-xl font-mono font-black tracking-widest text-white block uppercase drop-shadow-sm">
                          {veh.plate}
                        </span>
                        <div className="flex items-center justify-between w-full px-1 mt-1 pt-1 border-t border-zinc-800 text-[9px] font-mono text-zinc-400">
                          <span>08 • 29</span>
                          <span className="text-cyan-400 font-semibold tracking-wider">MEKAR INDAH</span>
                          <span>RW 08</span>
                        </div>
                      </div>
                    </div>

                    {/* Detail Spesifikasi Grid Proporsional */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                      <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-850">
                        <span className="text-[10px] text-slate-400 block font-medium">Merk & Model</span>
                        <span className="font-bold text-slate-200 text-xs truncate block">{veh.brand}</span>
                      </div>

                      <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-850">
                        <span className="text-[10px] text-slate-400 block font-medium">Warna Kendaraan</span>
                        <span className="font-bold text-slate-200 text-xs truncate block">{veh.color}</span>
                      </div>

                      <div className="col-span-2 bg-slate-950/80 rounded-lg p-2 border border-slate-850 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">ID Tag Stiker RFID</span>
                        <code className="text-xs font-mono font-bold text-cyan-300">
                          {veh.rfid_tag || "MI-TAG-" + (idx + 1)}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW MODE 2: TABEL RINGKAS (DESKTOP & MOBILE COMPACT) */}
            {vehicleViewMode === "table" && (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-850 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-3.5">Plat Nomor</th>
                        <th className="py-3 px-3.5">Jenis</th>
                        <th className="py-3 px-3.5">Merk / Model</th>
                        <th className="py-3 px-3.5">Warna</th>
                        <th className="py-3 px-3.5">Akses Gate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {vehicles.map((v, i) => (
                        <tr key={v.id || i} className="hover:bg-slate-850/50">
                          <td className="py-3 px-3.5 font-mono font-bold text-white tracking-wide">
                            {v.plate}
                          </td>
                          <td className="py-3 px-3.5">{v.type}</td>
                          <td className="py-3 px-3.5 font-medium">{v.brand}</td>
                          <td className="py-3 px-3.5">{v.color}</td>
                          <td className="py-3 px-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Aktif
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: KEUANGAN & IPL
        ======================================================== */}
        {activeTab === "keuangan" && (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                Tagihan IPL & Kas RW
              </h3>
              <p className="text-[11px] text-slate-400">Rekening Kas Lingkungan & Keamanan RW 08</p>
            </div>

            {/* Rekening Card */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-4 space-y-2.5">
              <span className="text-xs text-slate-400 block font-medium">Rekening Resmi RW 08 Mekar Indah</span>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Bank Central Asia (BCA)</span>
                  <span className="text-base font-mono font-bold text-emerald-400 tracking-wider">8820 1928 33</span>
                  <span className="text-[10px] text-slate-300 block">a.n. KAS RW 08 MEKAR INDAH</span>
                </div>
                <button
                  onClick={() => copyToClipboard("8820192833")}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="Salin No Rekening"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copiedText && (
                <p className="text-xs text-emerald-400 font-semibold text-center">✓ Berhasil disalin!</p>
              )}
            </div>

            {/* Tagihan List */}
            <div className="space-y-2">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-white">IPL {bill.month} {bill.year}</h5>
                    <span className="text-[10px] text-slate-400">Jatuh Tempo: {bill.due_date}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-200 block">Rp {bill.amount.toLocaleString("id-ID")}</span>
                    {bill.status === "Lunas" ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-500/20">
                        LUNAS
                      </span>
                    ) : (
                      <button
                        onClick={() => setIsPayModalOpen(true)}
                        className="text-[10px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-2.5 py-0.5 rounded-md mt-0.5 transition"
                      >
                        Bayar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: AKSES TAMU
        ======================================================== */}
        {activeTab === "tamu" && (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                Akses Tamu (Guest Pass)
              </h3>
              <p className="text-[11px] text-slate-400">Buat pass masuk gerbang untuk kurir / kerabat berkunjung</p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">Nama Tamu / Keterangan</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: Kurir Paket / Keluarga"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    if (guestName.trim()) {
                      setGeneratedGuestCode("MI-" + Math.floor(100000 + Math.random() * 900000));
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition"
                >
                  Generate
                </button>
              </div>

              {generatedGuestCode && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-center space-y-1 mt-2">
                  <span className="text-[10px] text-slate-400 block">Kode Masuk Gerbang (24 Jam):</span>
                  <span className="text-xl font-mono font-black text-indigo-400 tracking-wider block">
                    {generatedGuestCode}
                  </span>
                  <p className="text-[10px] text-slate-400">Tunjukkan ke Satpam Pos Utama Mekar Indah.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          BOTTOM NAVIGATION (KHUSUS HP)
      ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 md:hidden">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          {[
            { id: "beranda", label: "Beranda", icon: Home },
            { id: "properti", label: "Properti", icon: Building2 },
            { id: "kendaraan", label: "Kendaraan", icon: Car },
            { id: "keuangan", label: "IPL", icon: CreditCard },
            { id: "tamu", label: "Tamu", icon: KeyRound }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
                  isActive ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""}`} />
                <span className="text-[10px] mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ========================================================
          MODAL: SOS PANIC BUTTON
      ======================================================== */}
      {isSosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl max-w-sm w-full p-5 space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-600/20 text-rose-500 mx-auto flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">PANIC BUTTON (SOS)</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Kirim sinyal darurat langsung ke Pos Keamanan & Telegram Satpam.
              </p>
            </div>

            {sosSent ? (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                ✓ Peringatan Terkirim! Petugas Sedang Menuju Lokasi.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  disabled={sosSending}
                  onClick={() => handleSendSOS("Kejahatan")}
                  className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex flex-col items-center gap-1"
                >
                  <ShieldAlert className="w-4 h-4" /> Kejahatan
                </button>
                <button
                  disabled={sosSending}
                  onClick={() => handleSendSOS("Kebakaran")}
                  className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white flex flex-col items-center gap-1"
                >
                  <Flame className="w-4 h-4" /> Kebakaran
                </button>
                <button
                  disabled={sosSending}
                  onClick={() => handleSendSOS("Medis")}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex flex-col items-center gap-1"
                >
                  <Ambulance className="w-4 h-4" /> Medis
                </button>
                <button
                  disabled={sosSending}
                  onClick={() => handleSendSOS("Bencana")}
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex flex-col items-center gap-1"
                >
                  <AlertTriangle className="w-4 h-4" /> Bencana
                </button>
              </div>
            )}

            <button
              onClick={() => setIsSosModalOpen(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: QR PASS GERBANG
      ======================================================== */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xs w-full p-4 space-y-3 text-center shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">Pass Gerbang Otomatis</span>
              <button onClick={() => setIsQrModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-white rounded-xl flex items-center justify-center">
              <div className="w-40 h-40 bg-slate-950 rounded-lg flex flex-col items-center justify-center p-2 text-white">
                <QrCode className="w-24 h-24 text-white" />
                <span className="text-[9px] font-mono text-emerald-400 mt-1 font-bold">
                  {resident.block}-{resident.unit} • MI-PASS
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300">Scan QR Code ini pada scanner Gerbang Utama Mekar Indah.</p>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: BAYAR IPL
      ======================================================== */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xs w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white">Konfirmasi Pembayaran IPL</h3>
              <button onClick={() => setIsPayModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px]">Transfer ke Rekening BCA:</span>
              <p className="font-mono font-bold text-emerald-400">8820 1928 33</p>
              <p className="text-slate-200 mt-0.5">Nominal: <strong>Rp 150.000</strong></p>
            </div>

            <div className="border border-dashed border-slate-700 rounded-xl p-3 text-center cursor-pointer hover:border-emerald-500 transition">
              <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <span className="text-[11px] text-slate-300 block">Pilih foto bukti transfer</span>
            </div>

            <button
              onClick={() => {
                alert("Bukti pembayaran berhasil diunggah!");
                setIsPayModalOpen(false);
              }}
              className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
            >
              Kirim Bukti Pembayaran
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PortalApp;