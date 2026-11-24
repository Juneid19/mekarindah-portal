"use client";
import { submitPaymentProof } from '@/app/actions';
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
  BadgeCheck,
  Copy,
  Flame,
  Ambulance,
  ShieldAlert,
  Send,
  X,
  LayoutGrid,
  Table as TableIcon,
  Bike,
  FileText,
  MessageSquare,
  Radio,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  TrendingUp
} from "lucide-react";

// Tipe Data
export interface ResidentData {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  block?: string;
  unit?: string;
  role?: string;
  rfid_tag?: string;
}

export interface PropertyItem {
  id: string | number;
  resident_id?: string | number;
  block: string;
  unit_number: string;
  status: string;
  surface_area: number | string;
  building_area: number | string;
  electricity: string;
  ipl_amount: number | string;
  is_verified?: boolean;
}

export interface VehicleItem {
  id: string | number;
  resident_id?: string | number;
  plate: string;
  type: string;
  brand: string;
  color: string;
  rfid_tag?: string;
  is_rfid_active?: boolean;
}

export interface FinanceRecord {
  id: string | number;
  type: "income" | "expense" | "pemasukan" | "pengeluaran";
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface DocumentRequestItem {
  id: string;
  type: string;
  purpose: string;
  date: string;
  status: "Menunggu" | "Diproses" | "Selesai";
}

interface ComplaintItem {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  status: "Terkirim" | "Diproses" | "Selesai";
}

interface PortalAppProps {
  currentUser?: any;
  initialVehicles?: VehicleItem[];
  initialProperties?: PropertyItem[];
}

export function PortalApp({
  currentUser,
  initialVehicles = [],
  initialProperties = []
}: PortalAppProps) {
  // Tab Navigasi Aktif
  const [activeTab, setActiveTab] = useState<
    "beranda" | "properti" | "kendaraan" | "keuangan" | "kartu" | "dokumen" | "aduan"
  >("beranda");

  // ==========================================
// 1. STATE UNTUK KONFIRMASI BAYAR IPL
// ==========================================
const [isPayModalOpen, setIsPayModalOpen] = useState(false);
const [selectedMonth, setSelectedMonth] = useState('Mei 2024');
const [paymentAmount, setPaymentAmount] = useState(250000);
const [paymentMethod, setPaymentMethod] = useState('Transfer Bank BCA');
const [proofBase64, setProofBase64] = useState<string | null>(null);
const [isSubmittingPay, setIsSubmittingPay] = useState(false);
const [uploadSuccess, setUploadSuccess] = useState(false);

   // ==========================================
  // 1. HANDLER BACA FOTO + KOMPRES
  // ==========================================
  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize foto maksimal 1000px agar ringan dan cepat
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1000;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Kompres ke JPEG 75%
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
        setProofBase64(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // 2. HANDLER KIRIM KE DATABASE & TELEGRAM
  // ==========================================
 const handleSubmitPayment = async () => {
  if (!proofBase64) {
    alert('Silakan pilih foto bukti transfer terlebih dahulu!');
    return;
  }

  setIsSubmittingPay(true);
  try {
    // Panggil langsung fungsi server tanpa fetch URL HTTP:
    const res = await submitPaymentProof({
      residentId: 'saluniza66',
      residentName: 'Saluniza',
      unitNumber: 'Blok A No. 08',
      period: 'Mei 2024',
      amount: 150000,
      paymentMethod: 'Transfer BCA',
      proofImageBase64: proofBase64,
    });

    if (res.success) {
      alert('✅ Berhasil! Bukti transfer sudah tersimpan dan terkirim ke Telegram Pengurus RW.');
      setProofBase64(null);
      setIsPayModalOpen(false);
    } else {
      alert(`❌ Gagal: ${res.error}`);
    }
  } catch (err: any) {
    console.error(err);
    alert(`⚠️ Terjadi kesalahan: ${err.message}`);
  } finally {
    setIsSubmittingPay(false);
  }
};
  // Mode Tampilan Kendaraan: Kartu Plat Realistis vs Tabel
  const [vehicleViewMode, setVehicleViewMode] = useState<"card" | "table">("card");

  // State Animasi Remote Gate Interaktif
  const [isGateOpening, setIsGateOpening] = useState(false);
  const [gateCountdown, setGateCountdown] = useState(10);

  // Sub-Tab Keuangan: Arus Kas Transparansi vs Tagihan IPL Saya
  const [financeSubTab, setFinanceSubTab] = useState<"cashflow" | "tagihan">("cashflow");
  const [cashflowFilter, setCashflowFilter] = useState<"semua" | "income" | "expense">("semua");

  // Data Profil Warga
  const [resident] = useState<ResidentData>({
    id: currentUser?.id || "1",
    name: currentUser?.name || "Saluniza",
    email: currentUser?.email || "saluniza66@gmail.com",
    phone: currentUser?.phone || "0812-3456-7890",
    block: currentUser?.block || "A",
    unit: currentUser?.unit || "08",
    rfid_tag: currentUser?.rfid_tag || "RFID-MI-8821"
  });

  // State Properti & Kendaraan (Sinkron DB)
  const [properties, setProperties] = useState<PropertyItem[]>(initialProperties);
  const [vehicles, setVehicles] = useState<VehicleItem[]>(initialVehicles);

  // State Laporan Keuangan Kas RW (Transparansi Real-Time)
  const [cashflowRecords, setCashflowRecords] = useState<FinanceRecord[]>([
    {
      id: 1,
      type: "income",
      category: "Iuran IPL",
      amount: 14850000,
      description: "Penerimaan Iuran IPL Warga Bulan Maret (99 Unit)",
      date: "25 Mar 2025"
    },
    {
      id: 2,
      type: "expense",
      category: "Keamanan",
      amount: 4500000,
      description: "Honor & Insentif 3 Petugas Satpam Pos Utama RW 08",
      date: "24 Mar 2025"
    },
    {
      id: 3,
      type: "expense",
      category: "Kebersihan",
      amount: 2200000,
      description: "Operasional Pengangkutan Sampah & Kebersihan Selokan",
      date: "22 Mar 2025"
    },
    {
      id: 4,
      type: "expense",
      category: "Fasilitas",
      amount: 1350000,
      description: "Penggantian 6 Lampu LED Penerangan Jalan (PJU) Blok B & C",
      date: "18 Mar 2025"
    },
    {
      id: 5,
      type: "income",
      category: "Sumbangan",
      amount: 2500000,
      description: "Donasi Warga untuk Perbaikan Pos Ronda & Portal RFID",
      date: "15 Mar 2025"
    },
    {
      id: 6,
      type: "expense",
      category: "Operasional",
      amount: 450000,
      description: "Biaya Listrik Pos Satpam, Pompa Air & Internet CCTV",
      date: "10 Mar 2025"
    }
  ]);

  // State Tagihan IPL Pribadi Warga
  const [bills] = useState([
    { id: "bill-1", month: "Maret", year: 2025, amount: 150000, status: "Lunas", due_date: "10 Mar 2025", date_paid: "05 Mar 2025" },
    { id: "bill-2", month: "April", year: 2025, amount: 150000, status: "Belum Bayar", due_date: "10 Apr 2025", date_paid: "-" }
  ]);

  // State Dokumen / Pengajuan Surat
  const [docRequests, setDocRequests] = useState<DocumentRequestItem[]>([
    {
      id: "DOC-2025-001",
      type: "Surat Pengantar Domisili",
      purpose: "Pengurusan Berkas Perbankan",
      date: "25 Mar 2025",
      status: "Selesai"
    }
  ]);

  // State Aduan Warga
  const [complaints, setComplaints] = useState<ComplaintItem[]>([
    {
      id: "ADU-102",
      title: "Penerangan Jalan Depan Blok B Kurang Terang",
      category: "Fasilitas Umum",
      description: "Lampu penerangan di tiang no 4 redup sejak malam minggu.",
      date: "26 Mar 2025",
      status: "Diproses"
    }
  ]);

  // Modal State
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isAduanModalOpen, setIsAduanModalOpen] = useState(false);

  // Form State
  const [guestName, setGuestName] = useState("");
  const [generatedGuestCode, setGeneratedGuestCode] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [sosSending, setSosSending] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  const [newDocType, setNewDocType] = useState("Surat Pengantar Domisili");
  const [newDocPurpose, setNewDocPurpose] = useState("");
  const [docSubmitting, setDocSubmitting] = useState(false);

  const [newAduanTitle, setNewAduanTitle] = useState("");
  const [newAduanCategory, setNewAduanCategory] = useState("Fasilitas Umum");
  const [newAduanDesc, setNewAduanDesc] = useState("");
  const [aduanSubmitting, setAduanSubmitting] = useState(false);

  // Ambil data Kas RW dari Database secara real-time
  useEffect(() => {
    async function fetchFinanceData() {
      try {
        const res = await fetch("/api/finance");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCashflowRecords(data);
          }
        }
      } catch (err) {
        console.log("Menggunakan data default kas");
      }
    }
    fetchFinanceData();
  }, []);

  // Hitung Total Pemasukan, Pengeluaran, dan Saldo Kas RW
  const totalIncome = cashflowRecords
    .filter((r) => r.type === "income" || r.type === "pemasukan")
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalExpense = cashflowRecords
    .filter((r) => r.type === "expense" || r.type === "pengeluaran")
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const currentBalance = 32500000 + totalIncome - totalExpense;

  const filteredCashflow = cashflowRecords.filter((item) => {
    if (cashflowFilter === "income") return item.type === "income" || item.type === "pemasukan";
    if (cashflowFilter === "expense") return item.type === "expense" || item.type === "pengeluaran";
    return true;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Handler Kirim SOS Panic Button ke Telegram
  const handleSendSOS = async (type: string) => {
    setSosSending(true);
    try {
      const message = `🚨 *PANIC BUTTON / SOS MEKAR INDAH* 🚨\n\n👤 *Nama Warga:* ${resident.name}\n🏠 *Unit:* Blok ${resident.block} No. ${resident.unit}\n⚠️ *Jenis Darurat:* ${type.toUpperCase()}\n⏰ *Waktu:* ${new Date().toLocaleString("id-ID")}\n\n*Petugas Satpam Harap Segera Menuju Lokasi!*`;

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

  // Handler Buka Palang Gate Otomatis
  const handleTriggerOpenGate = async () => {
    setIsGateOpening(true);
    setGateCountdown(10);

    try {
      await fetch("https://api.telegram.org/bot9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: "-1004379863895",
          text: `🚪 *REMOTE GATE DIBUKA OLEH WARGA*\n\n👤 *Nama:* ${resident.name}\n🏠 *Unit:* Blok ${resident.block}-${resident.unit}\n⏰ *Waktu:* ${new Date().toLocaleTimeString("id-ID")} WIB\n\n*Palang otomatis gerbang terbuka.*`,
          parse_mode: "Markdown"
        })
      });
    } catch (e) {}

    const interval = setInterval(() => {
      setGateCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsGateOpening(false);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmitDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocPurpose.trim()) return;

    setDocSubmitting(true);
    try {
      const message = `📄 *PERMOHONAN SURAT WARGA BARU* 📄\n\n👤 *Pemohon:* ${resident.name} (Blok ${resident.block}-${resident.unit})\n📑 *Jenis Surat:* ${newDocType}\n📝 *Keperluan:* ${newDocPurpose}\n⏰ *Waktu Pengajuan:* ${new Date().toLocaleString("id-ID")}\n\n*Pengurus RW silakan periksa & terbitkan surat pengantar.*`;

      await fetch("https://api.telegram.org/bot9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: "-1004379863895",
          text: message,
          parse_mode: "Markdown"
        })
      });

      const newDoc: DocumentRequestItem = {
        id: `DOC-2025-00${docRequests.length + 1}`,
        type: newDocType,
        purpose: newDocPurpose,
        date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        status: "Menunggu"
      };

      setDocRequests([newDoc, ...docRequests]);
      setNewDocPurpose("");
      setIsDocModalOpen(false);
      alert("Permohonan surat berhasil dikirim ke Pengurus RW!");
    } catch (error) {
      alert("Gagal mengirim surat, silakan coba lagi.");
    } finally {
      setDocSubmitting(false);
    }
  };

  const handleSubmitAduan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAduanTitle.trim() || !newAduanDesc.trim()) return;

    setAduanSubmitting(true);
    try {
      const message = `📢 *LAPORAN / ADUAN WARGA RW 08* 📢\n\n👤 *Pelapor:* ${resident.name} (Blok ${resident.block}-${resident.unit})\n🏷️ *Kategori:* ${newAduanCategory}\n📌 *Judul:* ${newAduanTitle}\n💬 *Detail:* ${newAduanDesc}\n⏰ *Waktu:* ${new Date().toLocaleString("id-ID")}\n\n*Tim Satpam & Pengurus harap segera menindaklanjuti.*`;

      await fetch("https://api.telegram.org/bot9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: "-1004379863895",
          text: message,
          parse_mode: "Markdown"
        })
      });

      const newAduan: ComplaintItem = {
        id: `ADU-${100 + complaints.length + 1}`,
        title: newAduanTitle,
        category: newAduanCategory,
        description: newAduanDesc,
        date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        status: "Terkirim"
      };

      setComplaints([newAduan, ...complaints]);
      setNewAduanTitle("");
      setNewAduanDesc("");
      setIsAduanModalOpen(false);
      alert("Aduan berhasil dilaporkan ke Pengurus RW & Petugas!");
    } catch (error) {
      alert("Gagal mengirim aduan, silakan coba lagi.");
    } finally {
      setAduanSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-28 md:pb-12">
      {/* APP BAR */}
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

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Banner Profil Warga */}
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
                <Car className="w-3.5 h-3.5" /> {vehicles.length} Unit Terverifikasi
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigasi Atas */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs font-semibold">
          {[
            { id: "beranda", label: "Beranda", icon: Home },
            { id: "properti", label: "Properti", icon: Building2 },
            { id: "kendaraan", label: `Kendaraan (${vehicles.length})`, icon: Car },
            { id: "keuangan", label: "Laporan Kas & IPL", icon: CreditCard },
            { id: "kartu", label: "Akses Gate RFID", icon: Radio },
            { id: "dokumen", label: "Surat RW", icon: FileText },
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
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: BERANDA */}
        {activeTab === "beranda" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <button
                onClick={() => setActiveTab("properti")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition active:scale-95 text-center"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-slate-200">Properti</span>
              </button>

              <button
                onClick={() => setActiveTab("kendaraan")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition active:scale-95 text-center"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-1">
                  <Car className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-slate-200">Kendaraan</span>
              </button>

              <button
                onClick={() => setActiveTab("keuangan")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition active:scale-95 text-center"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-1">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-slate-200">Kas RW</span>
              </button>

              <button
                onClick={() => setActiveTab("kartu")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition active:scale-95 text-center"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-1">
                  <Radio className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-slate-200">Akses Gate</span>
              </button>

              <button
                onClick={() => setActiveTab("dokumen")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition active:scale-95 text-center"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-slate-200">Surat RW</span>
              </button>

              <button
                onClick={() => setActiveTab("aduan")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition active:scale-95 text-center"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-1">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-slate-200">Aduan</span>
              </button>
            </div>

            {/* Pengumuman Warga */}
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
                  <span className="font-bold text-emerald-400">Transparansi Keuangan Terbuka</span>
                  <span>Mekar Indah</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Kini warga dapat melihat langsung rincian pemasukan, pengeluaran, dan saldo kas RW pada menu <strong>Laporan Kas & IPL</strong> demi keterbukaan bersama.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROPERTI */}
        {activeTab === "properti" && (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Data Unit Properti Terdaftar
              </h3>
              <p className="text-[11px] text-slate-400">Data resmi spesifikasi rumah dari database RW</p>
            </div>

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

        {/* TAB 3: KENDARAAN */}
        {activeTab === "kendaraan" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-cyan-400" />
                  Kendaraan Terverifikasi ({vehicles.length})
                </h3>
                <p className="text-[11px] text-slate-400">Akses resmi Auto-Gate RW 08 Mekar Indah</p>
              </div>

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

            {vehicleViewMode === "card" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicles.map((veh, idx) => (
                  <div
                    key={veh.id || idx}
                    className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-4 shadow-lg space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400">
                          {veh.type?.toLowerCase().includes("motor") ? (
                            <Bike className="w-4 h-4" />
                          ) : (
                            <Car className="w-4 h-4" />
                          )}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{veh.type || "Mobil"}</span>
                      </div>

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Gate Aktif
                      </span>
                    </div>

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

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                      <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-850">
                        <span className="text-[10px] text-slate-400 block font-medium">Merk & Model</span>
                        <span className="font-bold text-slate-200 text-xs truncate block">{veh.brand}</span>
                      </div>

                      <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-850">
                        <span className="text-[10px] text-slate-400 block font-medium">Warna Kendaraan</span>
                        <span className="font-bold text-slate-200 text-xs truncate block">{veh.color}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
                          <td className="py-3 px-3.5 font-mono font-bold text-white tracking-wide">{v.plate}</td>
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

        {/* TAB 4: KEUANGAN KAS RW */}
        {activeTab === "keuangan" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Laporan Keuangan Kas RW 08
              </h3>
              <p className="text-[11px] text-slate-400">
                Transparansi mutasi kas masuk, pengeluaran operasional, dan saldo riil lingkungan
              </p>
            </div>

            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setFinanceSubTab("cashflow")}
                className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  financeSubTab === "cashflow"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Arus Kas RW (Transparansi)
              </button>
              <button
                onClick={() => setFinanceSubTab("tagihan")}
                className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  financeSubTab === "tagihan"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                Tagihan IPL Saya
              </button>
            </div>

            {financeSubTab === "cashflow" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="col-span-2 sm:col-span-1 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 p-3.5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-emerald-400 font-semibold">Sisa Saldo Kas RW</span>
                      <Wallet className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-xl sm:text-2xl font-mono font-black text-white block mt-1 tracking-tight">
                      Rp {currentBalance.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Saldo aktif tersimpan di Kas BCA RW</span>
                  </div>

                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">Total Masuk</span>
                      <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-base sm:text-lg font-mono font-bold text-emerald-400 block mt-1">
                      +Rp {totalIncome.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">IPL & Donasi Warga</span>
                  </div>

                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">Total Keluar</span>
                      <ArrowUpRight className="w-4 h-4 text-rose-400" />
                    </div>
                    <span className="text-base sm:text-lg font-mono font-bold text-rose-400 block mt-1">
                      -Rp {totalExpense.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Operasional & Gaji</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Buku Kas & Transaksi RW Terbaru
                      </h4>
                      <p className="text-[10px] text-slate-400">Dikelola transparan oleh Bendahara RW 08</p>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                      <button
                        onClick={() => setCashflowFilter("semua")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                          cashflowFilter === "semua"
                            ? "bg-slate-800 text-white font-bold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Semua
                      </button>
                      <button
                        onClick={() => setCashflowFilter("income")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                          cashflowFilter === "income"
                            ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Masuk
                      </button>
                      <button
                        onClick={() => setCashflowFilter("expense")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                          cashflowFilter === "expense"
                            ? "bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Keluar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    {filteredCashflow.map((item, idx) => {
                      const isIncome = item.type === "income" || item.type === "pemasukan";
                      return (
                        <div
                          key={item.id || idx}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                isIncome
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>

                            <div>
                              <span className="font-bold text-white block leading-snug">{item.description}</span>
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                                <span className="px-2 py-0.2 rounded-full bg-slate-850 border border-slate-750 text-slate-300 font-medium">
                                  {item.category || (isIncome ? "Pemasukan" : "Operasional")}
                                </span>
                                <span>•</span>
                                <span>{item.date}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`font-mono font-bold text-xs sm:text-sm block ${
                                isIncome ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {isIncome ? "+" : "-"}Rp {Number(item.amount).toLocaleString("id-ID")}
                            </span>
                            <span className="text-[9px] text-slate-500 block uppercase">
                              {isIncome ? "Kas Masuk" : "Kas Keluar"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {financeSubTab === "tagihan" && (
              <div className="space-y-4">
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

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">Status Iuran IPL Unit Blok {resident.block}-{resident.unit}</h4>
                    <button
                      onClick={() => setIsPayModalOpen(true)}
                      className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-sm"
                    >
                      + Konfirmasi Bayar
                    </button>
                  </div>

                  <div className="space-y-2">
                    {bills.map((bill) => (
                      <div
                        key={bill.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">IPL {bill.month} {bill.year}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              bill.status === "Lunas"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {bill.status}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Jatuh Tempo: {bill.due_date} {bill.status === "Lunas" && `• Dibayar: ${bill.date_paid}`}
                          </span>
                        </div>

                        <div className="text-right font-mono font-bold text-slate-200">
                          Rp {bill.amount.toLocaleString("id-ID")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: AKSES KARTU & GATE (DENGAN TOMBOL REMOTE BUKA PALANG) */}
        {activeTab === "kartu" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-400" />
                Smart Access Card & Gate System
              </h3>
              <p className="text-[11px] text-slate-400">Remote pembuka palang otomatis & kartu identitas digital</p>
            </div>

            {/* WIDGET REMOTE BUKA GERBANG UTAMA INTERAKTIF */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Palang Gerbang Otomatis</span>
                  <span className="text-[10px] text-slate-400">Pos Keamanan Gerbang Utama RW 08</span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                    isGateOpening
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isGateOpening ? "bg-emerald-400" : "bg-slate-500"}`}></span>
                  {isGateOpening ? `PALANG TERBUKA (${gateCountdown}s)` : "PALANG TERTUTUP"}
                </span>
              </div>

              {/* TOMBOL BESAR BUKA GATE */}
              <button
                disabled={isGateOpening}
                onClick={handleTriggerOpenGate}
                className={`w-full py-4 rounded-xl font-black text-sm tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isGateOpening
                    ? "bg-slate-800 text-emerald-400 border-2 border-emerald-500/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/20 active:scale-98"
                }`}
              >
                <Radio className={`w-5 h-5 ${isGateOpening ? "animate-spin" : "animate-pulse"}`} />
                <span>{isGateOpening ? `MEMBUKA GERBANG... (${gateCountdown} DETIK)` : "TAP UNTUK BUKA PALANG GATE"}</span>
              </button>
            </div>

                       {/* VIRTUAL SMART RFID CARD */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-5 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                    MI
                  </div>
                  <div>
                    <span className="text-[11px] font-bold tracking-wider uppercase block">RW 08 MEKAR INDAH</span>
                    <span className="text-[9px] text-slate-400 block -mt-0.5">RESIDENT DIGITAL PASS</span>
                  </div>
                </div>
                <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>

              <div className="w-10 h-7 rounded bg-amber-400/80 border border-amber-300 shadow-inner my-2 flex items-center justify-center">
                <div className="w-full h-0.5 bg-amber-600/40"></div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono tracking-widest block">NOMOR RFID TAG:</span>
                <span className="text-lg font-mono font-black tracking-widest text-cyan-300 block">
                  {resident?.rfid_tag || "RFID-MI-8821"}
                </span>
              </div>

              <div className="flex items-end justify-between pt-2 border-t border-indigo-900/40">
                <div>
                  <span className="text-[9px] text-slate-400 block">NAMA WARGA</span>
                  <span className="text-xs font-bold uppercase text-white block">{resident?.name || "Saluniza"}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 block">UNIT</span>
                  <span className="text-xs font-bold text-emerald-400 block">{resident?.unit || "Blok A No. 08"}</span>
                </div>
              </div>
            </div>

            {/* Generator Pass Tamu */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-white">Buat Kode Akses Tamu (Guest Pass)</h4>
              </div>

              <p className="text-[11px] text-slate-400">
                Buat kode 6 digit untuk kurir pengiriman paket atau kerabat yang bertamu.
              </p>

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
                  <span className="text-[10px] text-slate-400 block">Kode Masuk Gerbang (Berlaku 24 Jam):</span>
                  <span className="text-xl font-mono font-black text-indigo-400 tracking-wider block">
                    {generatedGuestCode}
                  </span>
                  <p className="text-[10px] text-slate-400">Tunjukkan ke Satpam Pos Utama Mekar Indah.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: DOKUMEN / SURAT */}
        {activeTab === "dokumen" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Layanan Surat Pengantar RT/RW
                </h3>
                <p className="text-[11px] text-slate-400">Pengajuan surat pengantar resmi tanpa antre</p>
              </div>

              <button
                onClick={() => setIsDocModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
              >
                + Ajukan Surat
              </button>
            </div>

            <div className="space-y-2">
              {docRequests.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{doc.type}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      doc.status === "Selesai"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {doc.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">Keperluan: {doc.purpose}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-850">
                    <span>No. Pengajuan: {doc.id}</span>
                    <span>{doc.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ADUAN WARGA */}
        {activeTab === "aduan" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-rose-400" />
                  Aduan & Keluhan Warga
                </h3>
                <p className="text-[11px] text-slate-400">Laporan langsung tersambung ke Telegram Satpam & RW</p>
              </div>

              <button
                onClick={() => setIsAduanModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm"
              >
                + Buat Laporan
              </button>
            </div>

            <div className="space-y-2">
              {complaints.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
                >
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

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-850">
                    <span>Kategori: {c.category}</span>
                    <span>{c.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM NAVIGATION (MOBILE) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 md:hidden">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          {[
            { id: "beranda", label: "Beranda", icon: Home },
            { id: "kendaraan", label: "Mobil", icon: Car },
            { id: "keuangan", label: "Kas RW", icon: CreditCard },
            { id: "kartu", label: "Gate Pass", icon: Radio },
            { id: "aduan", label: "Aduan", icon: MessageSquare }
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

      {/* MODAL 1: AJUKAN SURAT DIGITAL */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Permohonan Surat Pengantar</h3>
              <button onClick={() => setIsDocModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDocument} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Jenis Surat</label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Surat Pengantar Domisili">Surat Pengantar Domisili</option>
                  <option value="Surat Pengantar SKCK">Surat Pengantar SKCK</option>
                  <option value="Surat Pengantar Pembuatan KTP / KK">Surat Pengantar Pembuatan KTP / KK</option>
                  <option value="Surat Keterangan Usaha">Surat Keterangan Usaha (SKU)</option>
                  <option value="Surat Keterangan Belum Menikah">Surat Keterangan Belum Menikah</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Keperluan Pengurusan</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Untuk syarat pembukaan rekening tabungan / mutasi kerja"
                  value={newDocPurpose}
                  onChange={(e) => setNewDocPurpose(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={docSubmitting}
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition"
                >
                  {docSubmitting ? "Mengirim..." : "Kirim Permohonan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BUAT ADUAN WARGA */}
      {isAduanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Lapor Aduan / Keluhan</h3>
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
                  placeholder="Contoh: Pohon rimbun menutup penerangan jalan"
                  value={newAduanTitle}
                  onChange={(e) => setNewAduanTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Kategori</label>
                <select
                  value={newAduanCategory}
                  onChange={(e) => setNewAduanCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Fasilitas Umum">Fasilitas Umum & Lampu Jalan</option>
                  <option value="Kebersihan">Kebersihan & Sampah</option>
                  <option value="Keamanan">Keamanan & Ketertiban</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Deskripsi & Lokasi Detail</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan detail kendala..."
                  value={newAduanDesc}
                  onChange={(e) => setNewAduanDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAduanModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={aduanSubmitting}
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 transition"
                >
                  {aduanSubmitting ? "Mengirim..." : "Kirim Laporan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* MODAL 3: BAYAR IPL */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xs w-full p-4 space-y-3 shadow-2xl">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white">Konfirmasi Pembayaran IPL</h3>
              <button 
                onClick={() => {
                  setProofBase64(null);
                  setIsPayModalOpen(false);
                }} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Rekening */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px]">Transfer ke Rekening BCA:</span>
              <p className="font-mono font-bold text-emerald-400">8820 1928 33</p>
              <p className="text-slate-200 mt-0.5">Nominal: <strong>Rp 150.000</strong></p>
            </div>

            {/* Area Upload File / Preview Gambar */}
            <div className="border border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-3 text-center transition bg-slate-950/40">
              {proofBase64 ? (
                <div className="space-y-2">
                  <img 
                    src={proofBase64} 
                    alt="Bukti Transfer" 
                    className="max-h-32 mx-auto rounded-lg object-contain border border-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setProofBase64(null)}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold block mx-auto"
                  >
                    ✕ Ganti Foto
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-300 block font-medium">Klik untuk pilih foto bukti transfer</span>
                  <span className="text-[9px] text-slate-500 block">Format JPG/PNG (Maks 5MB)</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProofChange} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>

            {/* Tombol Kirim */}
            <button
              onClick={handleSubmitPayment}
              disabled={isSubmittingPay || !proofBase64}
              className={`w-full py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                isSubmittingPay || !proofBase64
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
              }`}
            >
              {isSubmittingPay ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
            </button>

          </div>
        </div>
      )}

      {/* MODAL 4: QR CODE PASS GATE */}
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

      {/* MODAL 5: SOS PANIC BUTTON */}
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
    </div>
  );
}

export default PortalApp;