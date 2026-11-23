"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Building2,
  Car,
  CreditCard,
  AlertTriangle,
  FileText,
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
  XCircle,
  ChevronRight,
  Info,
  Sparkles,
  BadgeCheck,
  Copy,
  ExternalLink,
  Flame,
  Ambulance,
  ShieldAlert,
  Send,
  X,
  RefreshCw,
  Search,
  MessageSquare
} from "lucide-react";

// Tipe Data
interface ResidentData {
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

interface PropertyItem {
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

interface VehicleItem {
  id: string | number;
  resident_id?: string | number;
  plate: string;
  type: "Mobil" | "Motor" | string;
  brand: string;
  color: string;
  is_rfid_active?: boolean;
  registered_at?: string;
}

interface BillItem {
  id: string;
  month: string;
  year: number;
  amount: number;
  status: "Lunas" | "Belum Bayar" | "Menunggu Verifikasi";
  due_date: string;
}

interface ComplaintItem {
  id: string;
  title: string;
  category: string;
  description: string;
  status: "Pending" | "Diproses" | "Selesai";
  date: string;
}

export function PortalApp() {
  // Tab Aktif
  const [activeTab, setActiveTab] = useState<"beranda" | "properti" | "kendaraan" | "keuangan" | "tamu" | "aduan" | "surat">("beranda");

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

  // State Data Properti (Read-Only untuk Warga, dikelola Admin)
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

  // State Data Kendaraan (Read-Only untuk Warga, dikelola Admin)
  const [vehicles, setVehicles] = useState<VehicleItem[]>([
    {
      id: "veh-1",
      plate: "B 1829 SZO",
      type: "Mobil",
      brand: "Honda HR-V",
      color: "Putih Mutiara",
      is_rfid_active: true,
      registered_at: "2024"
    },
    {
      id: "veh-2",
      plate: "B 4921 BNA",
      type: "Motor",
      brand: "Yamaha NMAX 155",
      color: "Hitam Doff",
      is_rfid_active: true,
      registered_at: "2024"
    }
  ]);

  // State Keuangan
  const [bills, setBills] = useState<BillItem[]>([
    { id: "bill-1", month: "Maret", year: 2025, amount: 150000, status: "Lunas", due_date: "10 Mar 2025" },
    { id: "bill-2", month: "April", year: 2025, amount: 150000, status: "Belum Bayar", due_date: "10 Apr 2025" }
  ]);

  // State Aduan
  const [complaints, setComplaints] = useState<ComplaintItem[]>([
    {
      id: "c-1",
      title: "Lampu Penerangan Jalan Blok B Redup",
      category: "Fasilitas Umum",
      description: "Lampu dekat tiang No. 3 Blok B mati total sejak kemarin malam.",
      status: "Diproses",
      date: "28 Mar 2025"
    }
  ]);

  // State Modal
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isGuestPassModalOpen, setIsGuestPassModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isAduanModalOpen, setIsAduanModalOpen] = useState(false);

  // Form State
  const [newComplaint, setNewComplaint] = useState({ title: "", category: "Keamanan", description: "" });
  const [guestName, setGuestName] = useState("");
  const [generatedGuestCode, setGeneratedGuestCode] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [sosSending, setSosSending] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  // Ambil Data dari API jika tersedia
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch properties
        const propRes = await fetch("/api/properties");
        if (propRes.ok) {
          const propData = await propRes.json();
          if (Array.isArray(propData) && propData.length > 0) {
            setProperties(propData);
          }
        }

        // Fetch vehicles
        const vehRes = await fetch("/api/vehicles");
        if (vehRes.ok) {
          const vehData = await vehRes.json();
          if (Array.isArray(vehData) && vehData.length > 0) {
            setVehicles(vehData);
          }
        }
      } catch (err) {
        console.log("Menggunakan data default portal");
      }
    }
    fetchData();
  }, []);

  // Handler Salin Rekening
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Handler Kirim SOS ke Telegram
  const handleSendSOS = async (type: string) => {
    setSosSending(true);
    try {
      const message = `🚨 *PANIC BUTTON / SOS MEKAR INDAH* 🚨\n\n👤 *Nama Warga:* ${resident.name}\n🏠 *Unit:* Blok ${resident.block} No. ${resident.unit}\n📞 *No. HP:* ${resident.phone}\n⚠️ *Jenis Darurat:* ${type.toUpperCase()}\n⏰ *Waktu:* ${new Date().toLocaleString("id-ID")}\n\n*Satpam & Tim Siaga Harap Segera Menuju Lokasi!*`;

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
      alert("Peringatan darurat telah dipicu ke Pos Satpam!");
      setIsSosModalOpen(false);
    } finally {
      setSosSending(false);
    }
  };

  // Handler Generate Guest Pass
  const handleGenerateGuestPass = () => {
    if (!guestName.trim()) return;
    const randomCode = "MI-" + Math.floor(100000 + Math.random() * 900000);
    setGeneratedGuestCode(randomCode);
  };

  // Handler Submit Aduan
  const handleSubmitAduan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaint.title || !newComplaint.description) return;

    const newItem: ComplaintItem = {
      id: "c-" + (complaints.length + 1),
      title: newComplaint.title,
      category: newComplaint.category,
      description: newComplaint.description,
      status: "Pending",
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    };

    setComplaints([newItem, ...complaints]);
    setNewComplaint({ title: "", category: "Keamanan", description: "" });
    setIsAduanModalOpen(false);
    alert("Aduan berhasil dikirim ke Pengurus RW!");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-28 md:pb-12">
      {/* ========================================================
          TOP HEADER / APP BAR
      ======================================================== */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-lg shadow-lg shadow-emerald-500/20">
              MI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Warga Blok {resident.block}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h1 className="text-base font-bold text-white leading-tight">Mekar Indah Portal</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* SOS Panic Button Mini */}
            <button
              onClick={() => setIsSosModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-transform active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>SOS</span>
            </button>

            {/* Logout/Profile */}
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
          MAIN CONTENT CONTAINER
      ======================================================== */}
      <main className="max-w-4xl mx-auto px-4 py-4 space-y-5">
        {/* Profile Card Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border border-slate-700/60 p-4 sm:p-5 shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-xs font-medium text-slate-400">Selamat Datang,</p>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-1.5 mt-0.5">
                {resident.name}
                <BadgeCheck className="w-5 h-5 text-emerald-400 inline shrink-0" />
              </h2>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>Unit: <strong className="text-emerald-400">Blok {resident.block} No. {resident.unit}</strong></span>
                <span className="text-slate-600">•</span>
                <span>RFID: <code className="text-xs font-mono text-cyan-300">{resident.rfid_tag}</code></span>
              </p>
            </div>

            {/* Tombol Tampilkan QR Code Gerbang */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-slate-200 transition active:scale-95 shadow-sm"
            >
              <QrCode className="w-6 h-6 text-emerald-400" />
              <span className="text-[10px] font-medium text-slate-300 mt-1">Pass Gate</span>
            </button>
          </div>

          {/* Quick Info Badges */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-750">
            <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/40">
              <span className="text-[11px] text-slate-400 block">Status Iuran IPL (Bulan Ini)</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Lunas (Maret 2025)
              </span>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/40">
              <span className="text-[11px] text-slate-400 block">Kendaraan Terdaftar</span>
              <span className="text-xs sm:text-sm font-bold text-cyan-400 flex items-center gap-1 mt-0.5">
                <Car className="w-3.5 h-3.5" /> {vehicles.length} Unit (Aktif Auto-Gate)
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            NAVIGATION TABS (DESKTOP / TOP PILL)
        ======================================================== */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs font-semibold">
          {[
            { id: "beranda", label: "Beranda", icon: Home },
            { id: "properti", label: "Properti Saya", icon: Building2 },
            { id: "kendaraan", label: "Kendaraan", icon: Car },
            { id: "keuangan", label: "IPL & Kas", icon: CreditCard },
            { id: "tamu", label: "Akses Tamu", icon: KeyRound },
            { id: "aduan", label: "Aduan Warga", icon: MessageSquare }
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
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/50"
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
            {/* Menu Cepat Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => setActiveTab("properti")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-emerald-500/50 transition active:scale-95 text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1.5 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Properti</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{properties.length} Unit</span>
              </button>

              <button
                onClick={() => setActiveTab("kendaraan")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-cyan-500/50 transition active:scale-95 text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-1.5 group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
                  <Car className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Kendaraan</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{vehicles.length} Terdaftar</span>
              </button>

              <button
                onClick={() => setActiveTab("keuangan")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-amber-500/50 transition active:scale-95 text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-1.5 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Bayar IPL</span>
                <span className="text-[10px] text-emerald-400 mt-0.5">Lunas</span>
              </button>

              <button
                onClick={() => setIsGuestPassModalOpen(true)}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-indigo-500/50 transition active:scale-95 text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-1.5 group-hover:bg-indigo-500 group-hover:text-slate-950 transition">
                  <KeyRound className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Kode Tamu</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Buat Pass</span>
              </button>
            </div>

            {/* Pengumuman Warga */}
            <div className="rounded-2xl bg-slate-800/80 border border-slate-700/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  Pengumuman & Info RW
                </h3>
                <span className="text-[11px] text-emerald-400 font-semibold">Terkini</span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-750 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold text-emerald-400">Kerja Bakti Lingkungan</span>
                    <span>29 Mar 2025</span>
                  </div>
                  <p className="text-slate-200">
                    Diharapkan partisipasi bapak/ibu warga Blok A - J dalam kegiatan fogging dan pembersihan saluran air.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-850 border border-slate-750 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold text-cyan-400">Pembaruan Sistem Gate RFID</span>
                    <span>25 Mar 2025</span>
                  </div>
                  <p className="text-slate-200">
                    Bagi warga yang memiliki kendaraan baru, silakan laporkan ke Sekretariat RW / Admin untuk registrasi stiker RFID gate.
                  </p>
                </div>
              </div>
            </div>

            {/* Kontak Darurat Cepat */}
            <div className="rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-800 border border-rose-900/40 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Pos Satpam / Keamanan</h4>
                  <p className="text-[11px] text-slate-400">Siaga 24 Jam Non-Stop</p>
                </div>
              </div>
              <a
                href="tel:08123456789"
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
              >
                Panggil
              </a>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: PROPERTI SAYA (MOBILE-FIRST SMART CARDS)
        ======================================================== */}
        {activeTab === "properti" && (
          <div className="space-y-4">
            {/* Header Tab */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  Unit Properti Saya
                </h3>
                <p className="text-xs text-slate-400">Data unit terdaftar dan terverifikasi oleh Pengurus RW</p>
              </div>
            </div>

            {/* Info Box: Penambahan Data melalui Admin */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5 text-xs text-slate-300">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Data spesifikasi unit properti dikelola oleh Admin RW. Jika terdapat perubahan luas tanah, daya listrik, atau kepemilikan, harap hubungi Pengurus.
              </span>
            </div>

            {/* Property Cards List */}
            <div className="grid grid-cols-1 gap-3">
              {properties.map((prop, idx) => (
                <div
                  key={prop.id || idx}
                  className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border border-slate-700/80 p-4 shadow-lg space-y-3.5 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {prop.status || "Dihuni Sendiri"}
                        </span>
                        {prop.is_verified !== false && (
                          <span className="text-[10px] font-semibold text-cyan-400 flex items-center gap-0.5">
                            <BadgeCheck className="w-3.5 h-3.5" /> Terverifikasi
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-white mt-1.5 tracking-tight">
                        Blok {prop.block} — No. {prop.unit_number}
                      </h4>
                      <p className="text-xs text-slate-400">Perumahan Mekar Indah RW 08</p>
                    </div>

                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Spesifikasi Grid: Mobile-Friendly 4 Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-750">
                    <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/50">
                      <span className="text-[10px] text-slate-400 block font-medium">Luas Tanah (LT)</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-100">{prop.surface_area || 120} m²</span>
                    </div>

                    <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/50">
                      <span className="text-[10px] text-slate-400 block font-medium">Luas Bangunan (LB)</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-100">{prop.building_area || 90} m²</span>
                    </div>

                    <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/50">
                      <span className="text-[10px] text-slate-400 block font-medium">Daya Listrik</span>
                      <span className="text-xs sm:text-sm font-bold text-amber-400">{prop.electricity || "2200 VA"}</span>
                    </div>

                    <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/50">
                      <span className="text-[10px] text-slate-400 block font-medium">Iuran IPL / Bulan</span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-400">
                        Rp {Number(prop.ipl_amount || 150000).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: KENDARAAN (SMART LICENSE PLATE CARDS)
        ======================================================== */}
        {activeTab === "kendaraan" && (
          <div className="space-y-4">
            {/* Header Tab */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Car className="w-5 h-5 text-cyan-400" />
                  Kendaraan Terdaftar
                </h3>
                <p className="text-xs text-slate-400">Akses Gate Masuk Otomatis Komplek Mekar Indah</p>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5 text-xs text-slate-300">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Setiap kendaraan yang terdaftar telah terhubung dengan stiker RFID Gate. Penambahan atau pergantian plat nomor wajib diverifikasi oleh Admin Keamanan.
              </span>
            </div>

            {/* Vehicle Cards List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicles.map((veh, idx) => (
                <div
                  key={veh.id || idx}
                  className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700/80 p-4 shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {veh.type}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Auto-Gate Aktif
                    </span>
                  </div>

                  {/* Indonesian Realistic License Plate Style */}
                  <div className="bg-slate-950 rounded-xl p-3 border-2 border-slate-700 text-center shadow-inner relative">
                    <span className="text-lg sm:text-xl font-mono font-black tracking-widest text-white block uppercase">
                      {veh.plate}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 tracking-wider block mt-0.5">
                      MEKAR INDAH • VERIFIED
                    </span>
                  </div>

                  {/* Detail Info Kendaraan */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Merk & Model</span>
                      <strong className="text-slate-200">{veh.brand}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Warna</span>
                      <strong className="text-slate-200">{veh.color}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: KEUANGAN & IPL
        ======================================================== */}
        {activeTab === "keuangan" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  Tagihan IPL & Kas RW
                </h3>
                <p className="text-xs text-slate-400">Iuran Pengelolaan Lingkungan & Keamanan</p>
              </div>
            </div>

            {/* Rekening Pembayaran Resmi */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700 p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">Rekening Resmi RW 08 Mekar Indah</span>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-750 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Bank Central Asia (BCA)</span>
                  <span className="text-base font-mono font-bold text-emerald-400 tracking-wider">8820 1928 33</span>
                  <span className="text-[11px] text-slate-300 block">a.n. KAS RW 08 MEKAR INDAH</span>
                </div>
                <button
                  onClick={() => copyToClipboard("8820192833")}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="Salin Nomor Rekening"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copiedText && (
                <p className="text-xs text-emerald-400 font-semibold text-center animate-fade-in">
                  ✓ Nomor rekening berhasil disalin!
                </p>
              )}
            </div>

            {/* Riwayat Tagihan */}
            <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-200">Daftar Tagihan IPL 2025</h4>
              <div className="space-y-2">
                {bills.map((bill) => (
                  <div
                    key={bill.id}
                    className="p-3 rounded-xl bg-slate-850 border border-slate-750 flex items-center justify-between"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-white">IPL {bill.month} {bill.year}</h5>
                      <span className="text-[11px] text-slate-400">Jatuh Tempo: {bill.due_date}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-200 block">
                        Rp {bill.amount.toLocaleString("id-ID")}
                      </span>
                      {bill.status === "Lunas" ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 inline-block mt-0.5">
                          LUNAS
                        </span>
                      ) : (
                        <button
                          onClick={() => setIsPayModalOpen(true)}
                          className="text-[10px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-2.5 py-1 rounded-lg transition mt-0.5"
                        >
                          Bayar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: AKSES TAMU & GUEST PASS
        ======================================================== */}
        {activeTab === "tamu" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-indigo-400" />
                  Kode Akses Tamu (Guest Pass)
                </h3>
                <p className="text-xs text-slate-400">Buat kode akses gerbang untuk keluarga / kurir / kerabat</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">Nama Tamu / Keterangan</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: Kurir Paket / Bpk. Hendra"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleGenerateGuestPass}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition"
                >
                  Generate
                </button>
              </div>

              {generatedGuestCode && (
                <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 text-center space-y-1.5 mt-3">
                  <span className="text-[11px] text-slate-400 block">Kode Masuk Gerbang (Berlaku 24 Jam):</span>
                  <span className="text-2xl font-mono font-black text-indigo-400 tracking-wider block">
                    {generatedGuestCode}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Tunjukkan kode ini ke petugas Satpam di Gerbang Utama Mekar Indah.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: ADUAN WARGA
        ======================================================== */}
        {activeTab === "aduan" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-rose-400" />
                  Aduan & Laporan Warga
                </h3>
                <p className="text-xs text-slate-400">Sampaikan keluhan fasilitas atau keamanan ke Pengurus RW</p>
              </div>

              <button
                onClick={() => setIsAduanModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                + Buat Aduan
              </button>
            </div>

            {/* List Aduan */}
            <div className="space-y-2.5">
              {complaints.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{c.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === "Selesai"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{c.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Kategori: {c.category}</span>
                    <span>{c.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          BOTTOM NAVIGATION (KHUSUS MOBILE)
      ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 md:hidden">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          {[
            { id: "beranda", label: "Beranda", icon: Home },
            { id: "properti", label: "Properti", icon: Building2 },
            { id: "kendaraan", label: "Kendaraan", icon: Car },
            { id: "keuangan", label: "IPL", icon: CreditCard },
            { id: "aduan", label: "Aduan", icon: MessageSquare }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
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
          MODAL 1: SOS PANIC BUTTON
      ======================================================== */}
      {isSosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl max-w-sm w-full p-5 space-y-4 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-600/20 text-rose-500 mx-auto flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">PANGGILAN DARURAT (SOS)</h3>
              <p className="text-xs text-slate-300 mt-1">
                Pilih jenis darurat. Alarm & notifikasi instan akan dikirimkan ke Pos Keamanan & Telegram Satpam.
              </p>
            </div>

            {sosSent ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                ✓ Peringatan Terkirim! Petugas Sedang Menuju Lokasi Anda.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  disabled={sosSending}
                  onClick={() => handleSendSOS("Kejahatan / Maling")}
                  className="p-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex flex-col items-center gap-1.5 transition"
                >
                  <ShieldAlert className="w-5 h-5" />
                  Kejahatan
                </button>

                <button
                  disabled={sosSending}
                  onClick={() => handleSendSOS("Kebakaran")}
                  className="p-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white flex flex-col items-center gap-1.5 transition"
                >
                  <Flame className="w-5 h-5" />
                  Kebakaran
                </button>

                <button
                  disabled={sosSending}
                  onClick={() => handleSendSOS("Medis / Ambulans")}
                  className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex flex-col items-center gap-1.5 transition"
                >
                  <Ambulance className="w-5 h-5" />
                  Medis
                </button>

                <button
                  disabled={sosSending}
                  onClick={() => handleSendSOS("Bencana / Gangguan")}
                  className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex flex-col items-center gap-1.5 transition"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Bencana
                </button>
              </div>
            )}

            <button
              onClick={() => setIsSosModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-xs transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: QR CODE DIGITAL GATE
      ======================================================== */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xs w-full p-5 space-y-4 text-center shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">Pass Gerbang Otomatis</span>
              <button onClick={() => setIsQrModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl flex items-center justify-center shadow-inner">
              {/* QR Code Placeholder Graphic */}
              <div className="w-44 h-44 bg-slate-950 rounded-xl flex flex-col items-center justify-center p-2 text-center text-white">
                <QrCode className="w-28 h-28 text-white" />
                <span className="text-[10px] font-mono text-emerald-400 mt-1 font-bold">
                  {resident.block}-{resident.unit} • MI-PASS
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-white">{resident.name}</p>
              <p className="text-[11px] text-slate-400">Scan QR Code ini pada scanner Gerbang Utama Mekar Indah.</p>
            </div>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: BUAT ADUAN WARGA
      ======================================================== */}
      {isAduanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Kirim Aduan Warga</h3>
              <button onClick={() => setIsAduanModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAduan} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Judul Laporan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pohon rimbun dekat tiang listrik"
                  value={newComplaint.title}
                  onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Kategori</label>
                <select
                  value={newComplaint.category}
                  onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Keamanan">Keamanan & Ketertiban</option>
                  <option value="Kebersihan">Kebersihan & Sampah</option>
                  <option value="Fasilitas Umum">Fasilitas Umum / Lampu Jalan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Deskripsi Lengkap</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan detail lokasi dan kendala..."
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAduanModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                >
                  Kirim Aduan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: BAYAR IPL
      ======================================================== */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Konfirmasi Pembayaran IPL</h3>
              <button onClick={() => setIsPayModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 block">Transfer ke BCA Kas RW:</span>
              <p className="font-mono font-bold text-emerald-400 text-sm">8820 1928 33</p>
              <p className="text-slate-300">Nominal: <strong>Rp 150.000</strong></p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-300 font-semibold block">Upload Bukti Transfer</label>
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 transition">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-slate-300 block text-[11px]">Pilih foto struk / tangkapan layar</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert("Bukti pembayaran berhasil diunggah! Menunggu konfirmasi bendahara.");
                setIsPayModalOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
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