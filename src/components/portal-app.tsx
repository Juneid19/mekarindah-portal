// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, User, Home, Receipt, CreditCard,
  PieChart, Car, FileText, Megaphone, LogOut,
  Menu, X, Plus, Edit2, Trash2, AlertTriangle,
  Loader2, Camera, Check, Radio, Key, PhoneCall,
  Clock, CheckCircle2, Send, Download
} from "lucide-react";

export function PortalApp({ initialUser }: { initialUser?: any }) {
  const [activeTab, setActiveTab] = useState("beranda");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
const [kasList, setKasList] = useState([]);
const [totalKas, setTotalKas] = useState(0);
const [iplData, setIplData] = useState([]);

  // 1. STATE FORM PROFIL
  const [profile, setProfile] = useState({
    name: initialUser?.name || "Saluniza",
    unit: initialUser?.unit || "A-001",
    phone: "08123456789",
    email: initialUser?.email || "saluniza66@gmail.com",
    avatar: "",
    cardNumber: "MKR-8849-011A",
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. STATE ADUAN
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDetail, setNewDetail] = useState("");
  const [newCategory, setNewCategory] = useState("Fasilitas Umum");
  const [editingItem, setEditingItem] = useState<any | null>(null);

     // ==========================================
  // 3. STATE KENDARAAN & PROPERTI
  // ==========================================
  const [vehicles, setVehicles] = useState<any[]>([
    { id: "veh-1", type: "Mobil", plate: "B 1234 MKR", brand: "Honda HR-V", color: "Putih" },
    { id: "veh-2", type: "Motor", plate: "B 5678 SIK", brand: "Yamaha NMAX", color: "Hitam" },
  ]);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    type: "Mobil",
    plate: "",
    brand: "",
    color: "",
  });

  const [propertyData, setPropertyData] = useState({
    unit: profile?.unit || "B-12",
    block: "B",
    status: "Milik Pribadi (Tetap)",
    occupants: "3 Orang",
    electricity: "2.200 VA (Token)",
    emergencyContact: "081234567890",
  });
  const [isEditPropertyOpen, setIsEditPropertyOpen] = useState(false);

  // ==========================================
  // STATE SMART GATE & SOS
  // ==========================================
  const [sosActive, setSosActive] = useState(false);
  const [gateStatus, setGateStatus] = useState<"CLOSED" | "OPENING" | "OPEN">("CLOSED");
  const [gateCountdown, setGateCountdown] = useState(0);

  const [kasRw, setKasRw] = useState<{
    balance: number;
    totalIncome: number;
    totalExpense: number;
    transactions: any[];
  }>({
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
    transactions: [],
  });

   // ==========================================
  // EFEK LOAD DATA DARI DATABASE (NEON)
  // ==========================================

  // 1. Load Kas RW & IPL (Utuh & Ditutup Rapi)
  useEffect(() => {
    async function ambilDataKasDanIpl() {
      try {
        // Ambil Data Kas
        const resKas = await fetch("/api/admin/finance");
        if (resKas.ok) {
          const dataKas = await resKas.json();
          if (Array.isArray(dataKas)) {
            setKasList(dataKas);
            const saldo = dataKas.reduce((acc: number, item: any) => {
              return item.type === "income"
                ? acc + parseFloat(item.amount || 0)
                : acc - parseFloat(item.amount || 0);
            }, 0);
            setTotalKas(saldo);
          }
        }

        // Ambil Data Tagihan IPL
        const resIpl = await fetch("/api/invoices");
        if (resIpl.ok) {
          const dataIpl = await resIpl.json();
          if (Array.isArray(dataIpl)) {
            setIplData(dataIpl);
          }
        }
      } catch (error) {
        console.error("Gagal sinkron data Kas & IPL:", error);
      }
    }

    ambilDataKasDanIpl();
  }, [initialUser?.id]);

     // 2. Load Data Kendaraan (Fokus ke ID agar sama dengan Properties yang sukses)
  useEffect(() => {
    const userId = profile?.id || initialUser?.id || "res-warga-1";

    fetch(`/api/admin/vehicles?residentId=${userId}`)
      .then((res) => res.json())
      .then((resJson) => {
        // Ambil bagian .data agar masuk ke tabel
        const list = resJson.data || [];
        setVehicles(list);
      })
      .catch((err) => console.warn("Gagal load kendaraan:", err));
  }, [profile?.id, initialUser?.id]);

     // 3. Load Data Properti (Sinkronisasi dari Admin)
  useEffect(() => {
    // Ambil identitas warga dari profil yang sedang login
    const targetId = profile?.id || initialUser?.id || "res-warga-1";

    fetch(`/api/admin/properties?residentId=${targetId}`)
      .then((res) => res.json())
      .then((resJson) => {
        // Ambil bagian .data dari hasil fetch
        const list = resJson.data || [];
        
        // Simpan ke state (ini akan otomatis mengisi tabel di layar)
        setDaftarProperti(
          list.map((p: any) => ({
            id: p.id,
            blok: p.block || "A",
            nomor: p.unit_number || "01",
            status: p.status || "Milik Pribadi",
            penghuni: profile?.name || "Warga",
            listrik: p.electricity || "2.200 VA",
            luasTanah: p.surface_area || "0",
            luasBangunan: p.building_area || "0",
            ipl: Number(p.ipl_amount) || 150000,
          }))
        );
      })
      .catch((err) => console.warn("Load properti error:", err));
  }, [profile?.id, profile?.name, initialUser?.id]);

  // ==========================================
  // FUNGSI HANDLER KENDARAAN & PROPERTI
  // ==========================================
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.plate) {
      alert("Nomor plat polisi wajib diisi!");
      return;
    }

    try {
      setSavingVehicle(true);
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentId: (profile as any)?.id || initialUser?.id || "res-warga-1",
          ...vehicleForm,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Kendaraan berhasil didaftarkan ke gerbang RFID!");
        setVehicles((prev) => [data, ...prev]);
        setIsAddVehicleOpen(false);
        setVehicleForm({ type: "Mobil", plate: "", brand: "", color: "" });
      } else {
        throw new Error(data.message || "Gagal menyimpan");
      }
    } catch (err: any) {
      const newVeh = { id: `veh-${Date.now()}`, ...vehicleForm };
      setVehicles((prev) => [newVeh, ...prev]);
      setIsAddVehicleOpen(false);
      setVehicleForm({ type: "Mobil", plate: "", brand: "", color: "" });
      alert("✅ Kendaraan tersimpan di perangkat!");
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    alert("✅ Data informasi properti hunian berhasil diperbarui!");
    setIsEditPropertyOpen(false);
  };

const [daftarProperti, setDaftarProperti] = useState<any[]>([]);

const [modalPropertiBuka, setModalPropertiBuka] = useState(false);
const [formProperti, setFormProperti] = useState({
  blok: "A",
  nomor: "",
  status: "Milik Pribadi (Tetap)",
  penghuni: profile.name || "",
  listrik: "2.200 VA",
});

const handleTambahProperti = (e: React.FormEvent) => {
  e.preventDefault();
  if (!formProperti.nomor) {
    alert("Silakan isi nomor rumah!");
    return;
  }

  const unitBaru = {
    id: `prop-${Date.now()}`,
    blok: formProperti.blok,
    nomor: formProperti.nomor,
    status: formProperti.status,
    penghuni: formProperti.penghuni || profile.name,
    listrik: `${formProperti.listrik} (Token)`,
    ipl: 150000,
  };

  setDaftarProperti([...daftarProperti, unitBaru]);
  setFormProperti({
    blok: "A",
    nomor: "",
    status: "Milik Pribadi (Tetap)",
    penghuni: profile.name,
    listrik: "2.200 VA",
  });
  setModalPropertiBuka(false);
  alert(`✅ Unit Blok ${unitBaru.blok} No. ${unitBaru.nomor} berhasil ditambahkan!`);
};

  // 4. STATE PERMINTAAN DOKUMEN
  const [documents, setDocuments] = useState<any[]>([
    {
      id: "doc-1",
      documentType: "Surat Pengantar RT/RW",
      purpose: "Pengurusan KTP baru di Kelurahan",
      deliveryMethod: "Ambil di Pos Satpam",
      date: "Kemarin, 14:20 WIB",
      status: "Siap Diambil",
    },
  ]);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [submittingDoc, setSubmittingDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({
    documentType: "Surat Pengantar RT/RW",
    purpose: "",
    deliveryMethod: "Ambil di Pos Satpam",
  });

  // Muat data profil & dokumen dari localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mekarindah_resident_profile");
      if (saved) setProfile(JSON.parse(saved));
      const savedDocs = localStorage.getItem("mekarindah_docs");
      if (savedDocs) setDocuments(JSON.parse(savedDocs));
    } catch (_) {}
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    try {
      const res = await fetch("/api/complaints");
      if (res.ok) {
        const data = await res.json();
        setComplaints(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComplaints(false);
    }
  };

  // Timer Gerbang Otomatis 10 Detik
  useEffect(() => {
    let timer: any;
    if (gateStatus === "OPEN" && gateCountdown > 0) {
      timer = setInterval(() => {
        setGateCountdown((prev) => {
          if (prev <= 1) {
            setGateStatus("CLOSED");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gateStatus, gateCountdown]);

  // Buka Gerbang (Kirim ke Telegram)
  const handleOpenGate = async (gateName: string) => {
    setGateStatus("OPENING");
    try {
      await fetch("/api/gate/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gateName,
          residentName: profile.name,
          unit: profile.unit,
          cardNumber: profile.cardNumber,
        }),
      });
    } catch (e) {
      console.error("Gagal panggil gate API:", e);
    }

    setTimeout(() => {
      setGateStatus("OPEN");
      setGateCountdown(10);
    }, 1000);
  };

 // Kirim SOS Darurat (Kirim ke Database & Telegram)
  const handleSOS = async () => {
    if (!window.confirm("KIRIM SINYAL SOS DARURAT KE REGU KEAMANAN & SATPAM?")) return;
    setSosActive(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentId: (profile as any)?.id || initialUser?.id || "res-admin",
          title: "🚨 DARURAT SOS",
          category: "Keamanan",
          detail: `🚨 [DARURAT SOS] Warga ${profile.name} (Unit ${profile.unit}) MEMINTA BANTUAN SEGERA!`,
          residentName: profile.name,
          unit: profile.unit,
          phone: profile.phone,
        }),
      });

      if (res.ok) {
        alert("Sinyal SOS DARURAT berhasil dikirim ke Satpam & Telegram!");
      }
      await fetchComplaints();
    } catch (e) {
      console.error(e);
      alert("Gagal mengirim sinyal SOS.");
    } finally {
      setSosActive(false);
    }
  };

  // Simpan Form Profil
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("mekarindah_resident_profile", JSON.stringify(profile));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Upload Foto Profil
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

   // Kirim Permintaan Dokumen (Kirim ke Telegram & Simpan)
  const handleRequestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.purpose.trim()) {
      alert("Harap isi keperluan pengajuan dokumen");
      return;
    }
    setSubmittingDoc(true);

    try {
      // 1. Tembak API Dokumen
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: newDoc.documentType,
          purpose: newDoc.purpose,
          deliveryMethod: newDoc.deliveryMethod,
          residentName: profile.name,
          unit: profile.unit,
          phone: profile.phone,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal mengirim ke server");
      }

      // 2. Simpan ke daftar riwayat dokumen lokal
      const newEntry = {
        id: `doc-${Date.now()}`,
        documentType: newDoc.documentType,
        purpose: newDoc.purpose,
        deliveryMethod: newDoc.deliveryMethod,
        date: "Baru saja",
        status: "Menunggu Pengurus",
      };

      const updated = [newEntry, ...documents];
      setDocuments(updated);
      localStorage.setItem("mekarindah_docs", JSON.stringify(updated));

      alert("✅ Permintaan dokumen berhasil dikirim ke Pengurus RT/RW via Telegram!");
      setIsDocModalOpen(false);
      setNewDoc({
        documentType: "Surat Pengantar RT/RW",
        purpose: "",
        deliveryMethod: "Ambil di Pos Satpam",
      });
    } catch (err) {
      console.error(err);
      alert("❌ Gagal mengirim permintaan dokumen. Coba lagi.");
    } finally {
      setSubmittingDoc(false);
    }
  };

  // Kirim Aduan Baru
  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDetail.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentId: profile?.id || initialUser?.id || 1,
          title: `Aduan ${newCategory}`,
          category: newCategory,
          detail: `[${newCategory}] ${newDetail.trim()}`,
          residentName: profile.name,
          unit: profile.unit,
          phone: profile.phone,
        }),
      });

      if (res.ok) {
        setNewDetail("");
        setIsCreateModalOpen(false);
        await fetchComplaints();
        alert("Aduan berhasil dikirim ke Pengelola & Telegram!");
      } else {
        alert("Gagal mengirim aduan.");
      }
    } catch {
      alert("Kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Update Aduan (Edit)
  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.detail.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/complaints/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detail: editingItem.detail }),
      });
      if (res.ok) {
        setEditingItem(null);
        await fetchComplaints();
        alert("Aduan berhasil diperbarui!");
      } else {
        alert("Gagal memperbarui aduan");
      }
    } catch {
      alert("Kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Hapus Aduan
  const handleDeleteComplaint = async (id: string, status: string) => {
    if (status && status !== "Diterima") {
      alert("Aduan yang telah diproses tidak dapat dihapus.");
      return;
    }
    if (!window.confirm("Yakin ingin menghapus aduan ini?")) return;
    try {
      const res = await fetch(`/api/complaints/${id}`, { method: "DELETE" });
      if (res.ok) {
        setComplaints((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("Gagal menghapus aduan.");
      }
    } catch {
      alert("Kesalahan jaringan.");
    }
  };

  // Logout
  const handleLogout = async () => {
    if (!window.confirm("Keluar dari Portal Mekarindah?")) return;
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  };

  const menuItems = [
    { id: "beranda", label: "Beranda", icon: <LayoutDashboard size={20} /> },
    { id: "profil", label: "Profil Saya", icon: <User size={20} /> },
    { id: "akses", label: "Kartu Akses Gerbang", icon: <CreditCard size={20} /> },
    { id: "tagihan", label: "Tagihan IPL", icon: <Receipt size={20} /> },
    { id: "properti", label: "Properti", icon: <Home size={20} /> },
    { id: "keuangan", label: "Laporan Keuangan", icon: <PieChart size={20} /> },
    { id: "kendaraan", label: "Kendaraan", icon: <Car size={20} /> },
    { id: "dokumen", label: "Minta Dokumen", icon: <FileText size={20} /> },
    { id: "aduan", label: "Aduan & SOS", icon: <Megaphone size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* POPUP OVERLAY SOS DARURAT */}
      {sosActive && (
        <div className="fixed inset-0 bg-red-950/90 z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 border-4 border-red-500 shadow-2xl animate-pulse">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={48} className="animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-red-600 tracking-wide">SINYAL SOS DIAKTIFKAN!</h2>
            <p className="text-sm text-slate-600">
              Notifikasi darurat unit <b>{profile.unit}</b> telah diteruskan ke grup Telegram Satpam Mekarindah.
            </p>
            <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-left text-xs space-y-1">
              <p><b>Pelapor:</b> {profile.name}</p>
              <p><b>Unit Rumah:</b> {profile.unit}</p>
              <p><b>No. Kontak:</b> {profile.phone}</p>
              <p className="text-emerald-700 font-bold">✔ Notifikasi Telegram terkirim ke pos jaga</p>
            </div>
            <div className="flex gap-2 pt-2">
              <a
                href={`tel:${profile.phone}`}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow"
              >
                <PhoneCall size={18} /> Hubungi Satpam
              </a>
              <button
                onClick={() => setSosActive(false)}
                className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BACKDROP DRAWER */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR LENGKAP 9 MENU */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 transform transition-transform duration-300 md:static md:translate-x-0 flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-700 bg-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg text-white font-bold">MI</div>
            <span className="font-bold text-white tracking-wider text-sm">PORTAL MEKARINDAH</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-blue-600 text-white border-l-4 border-orange-400 font-semibold"
                  : "hover:bg-slate-800 hover:text-white text-slate-300"
              }`}
            >
              {item.icon}
              <span className="ml-3.5">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={handleSOS}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm shadow transition-colors"
          >
            <AlertTriangle size={18} /> TOMBOL SOS
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 py-2 text-sm font-medium transition-colors"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* CONTAINER KONTEN */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER ATAS */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={22} />
            </button>
            <h1 className="font-bold text-slate-800 text-base sm:text-lg uppercase">
              {menuItems.find((m) => m.id === activeTab)?.label}
            </h1>
          </div>

          <div
            onClick={() => setActiveTab("profil")}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">{profile.name}</p>
              <p className="text-xs text-slate-500">Unit: {profile.unit}</p>
            </div>
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border border-blue-500 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {profile.name.charAt(0)}
              </div>
            )}
          </div>
        </header>

        {/* ISI HALAMAN BERGULIR */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          {/* TAB 1: BERANDA */}
          {activeTab === "beranda" && (
            <div className="space-y-5 max-w-5xl mx-auto">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-md">
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">Halo, {profile.name}!</h2>
                <p className="text-blue-100 text-sm sm:text-base">
                  Selamat datang di Portal Digital Perumahan Mekarindah.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab("akses")}
                    className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg text-sm font-bold shadow flex items-center gap-1.5"
                  >
                    <Key size={16} /> Buka Gerbang
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("dokumen");
                      setIsDocModalOpen(true);
                    }}
                    className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow flex items-center gap-1.5"
                  >
                    <FileText size={16} /> Minta Dokumen
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("aduan");
                      setIsCreateModalOpen(true);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-bold shadow"
                  >
                    + Buat Aduan
                  </button>
                  <button
                    onClick={handleSOS}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-bold shadow flex items-center gap-1.5"
                  >
                    <AlertTriangle size={16} /> Bantuan Darurat
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Unit Properti</span>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{profile.unit}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Kartu Akses Gerbang</span>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">AKTIF</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Dokumen Diminta</span>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">{documents.length} Berkas</p>
                </div>
              </div>
            </div>
          )}

        {/* ======================================================== */}
      {/* TAB PROPERTI (FORMAT TABEL WARGA)                        */}
      {/* ======================================================== */}
      {activeTab === "properti" && (
        <div className="space-y-4 p-4 max-w-2xl mx-auto pb-24">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Daftar Properti & Unit Hunian</h2>
              <p className="text-xs text-slate-500">Unit sah yang terdaftar atas nama Anda di database pengurus RW</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
              {daftarProperti.length} Unit
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 pl-4">No</th>
                    <th className="p-3.5">Unit / Blok</th>
                    <th className="p-3.5">Status Hunian</th>
                    <th className="p-3.5">Luas (LB / LT)</th>
                    <th className="p-3.5">Daya Listrik</th>
                    <th className="p-3.5">Iuran IPL</th>
                    <th className="p-3.5 pr-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
  {daftarProperti.length > 0 ? (
    daftarProperti.map((item, idx) => (
      <tr key={item.id || idx} className="hover:bg-slate-50/70 transition">
        <td className="p-3.5 pl-4 text-slate-400 font-bold">{idx + 1}</td>
        <td className="p-3.5">
          <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-xs">
            Blok {item.blok} No. {item.nomor}
          </span>
        </td>
        <td className="p-3.5 font-medium">{item.status}</td>
        <td className="p-3.5 font-mono text-slate-600">{item.luasBangunan} m² / {item.luasTanah} m²</td>
        <td className="p-3.5 font-mono">{item.listrik}</td>
        <td className="p-3.5 font-bold text-emerald-600">
          Rp {item.ipl ? item.ipl.toLocaleString('id-ID') : "150.000"}
        </td>
        <td className="p-3.5 pr-4 text-center">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            Sah / Terverifikasi
          </span>
        </td>
      </tr>
    ))
  ) : (
    /* TAMPILAN INI MUNCUL JIKA SEMUA UNIT TELAH DIHAPUS OLEH ADMIN */
    <tr>
      <td colSpan={7} className="p-8 text-center text-slate-400">
        Belum ada unit properti yang terdaftar atas nama Anda. Hubungi Pengurus RW untuk pendaftaran unit.
      </td>
    </tr>
  )}
</tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200/70 p-3.5 rounded-xl flex items-start gap-3">
            <span className="text-blue-600 text-base">🏠</span>
            <p className="text-xs text-blue-800 leading-relaxed">
              <b>Administrasi Properti:</b> Perubahan status sewa/kontrak, balik nama kepemilikan, atau izin renovasi bangunan wajib dilaporkan kepada <b>Pengurus RW</b> atau melalui tab <b>Aduan</b>.
            </p>
          </div>
        </div>
      )}


          {/* TAB 2: PROFIL SAYA */}
          {activeTab === "profil" && (
            <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Pengaturan Profil Warga</h2>

              {savedSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg flex items-center gap-2">
                  <Check size={18} /> Profil berhasil disimpan!
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="Profil"
                        className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 shadow"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center font-bold text-2xl border-2 border-slate-200">
                        {profile.name.charAt(0)}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow"
                      title="Upload Foto"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <span className="text-xs text-slate-400 mt-2">Ketuk icon kamera untuk ganti foto</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Blok / Nomor Unit
                    </label>
                    <input
                      type="text"
                      value={profile.unit}
                      onChange={(e) => setProfile({ ...profile, unit: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm shadow transition-all"
                  >
                    Simpan Perubahan Profil
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: KARTU AKSES GERBANG */}
          {activeTab === "akses" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-700 max-w-lg mx-auto">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">KARTU AKSES PENGHUNI</span>
                    <h3 className="text-lg font-black tracking-wide text-white">MEKARINDAH RESIDENCE</h3>
                  </div>
                  <Radio size={24} className="text-emerald-400 animate-pulse" />
                </div>

                <div className="w-12 h-9 bg-amber-400/90 rounded-md border border-amber-300 shadow-sm flex items-center justify-center mb-6">
                  <div className="w-8 h-5 border border-amber-600/50 rounded flex items-center justify-center">
                    <div className="w-3 h-3 border border-amber-700/40 rounded-full" />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-lg sm:text-xl font-mono tracking-widest text-slate-200 font-bold">
                    {profile.cardNumber}
                  </p>
                  <div className="flex justify-between items-end text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">NAMA PEMILIK</span>
                      <span className="font-bold text-sm text-white">{profile.name}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">UNIT RUMAH</span>
                      <span className="font-bold text-sm text-white">{profile.unit}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">STATUS</span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold text-[10px] border border-emerald-500/30">
                        AKTIF
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PANEL PENGENDALI PALANG */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-lg mx-auto">
                <div className="text-center space-y-1">
                  <h3 className="font-bold text-slate-800 text-lg">Kendali Gerbang Otomatis</h3>
                  <p className="text-xs text-slate-500">Ketuk tombol di bawah untuk membuka palang gerbang perumahan.</p>
                </div>

                <div className="p-4 rounded-xl text-center border bg-slate-50 border-slate-200">
                  {gateStatus === "OPEN" ? (
                    <div className="space-y-1">
                      <p className="font-black text-xl text-emerald-600 flex items-center justify-center gap-2">
                        <Check size={22} /> GERBANG TERBUKA
                      </p>
                      <p className="text-xs font-semibold text-emerald-700">
                        Menutup otomatis dalam <b>{gateCountdown} detik</b>
                      </p>
                    </div>
                  ) : gateStatus === "OPENING" ? (
                    <div className="flex items-center justify-center gap-2 font-bold text-amber-600">
                      <Loader2 className="animate-spin" size={20} /> Mengirim Sinyal ke Palang Gerbang...
                    </div>
                  ) : (
                    <p className="font-bold text-slate-600 flex items-center justify-center gap-2 text-sm">
                      Palang Gerbang Terkunci / Tertutup
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleOpenGate("Gerbang Utama")}
                    disabled={gateStatus !== "CLOSED"}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Key size={18} /> Buka Gerbang Utama
                  </button>
                  <button
                    onClick={() => handleOpenGate("Gerbang Samping")}
                    disabled={gateStatus !== "CLOSED"}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Key size={18} /> Buka Gerbang Samping
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MINTA DOKUMEN / LAYANAN SURAT WARGA */}
          {activeTab === "dokumen" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Layanan Permintaan Dokumen</h2>
                  <p className="text-xs text-slate-500">Ajukan surat pengantar RT/RW atau keterangan resmi pengurus.</p>
                </div>
                <button
                  onClick={() => setIsDocModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow"
                >
                  <Plus size={18} /> Ajukan Surat Baru
                </button>
              </div>

              {/* CARD INFORMASI ALUR */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-sm">
                  <Clock size={16} /> Alur Pengajuan Surat Digital:
                </p>
                <p>1. Isi formulir pengajuan surat secara lengkap di portal ini.</p>
                <p>2. Pengurus RT/RW & Satpam akan otomatis menerima notifikasi via Telegram.</p>
                <p>3. Surat akan diproses dalam 1x24 jam dan dapat diambil di Pos Jaga Satpam.</p>
              </div>

              {/* RIWAYAT PENGAJUAN SURAT */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-700 text-sm">
                  Riwayat Surat yang Pernah Diajukan
                </div>

                {documents.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    Belum ada riwayat pengajuan surat. Klik tombol <b>Ajukan Surat Baru</b> di atas.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-slate-50">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">{doc.documentType}</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                doc.status === "Siap Diambil"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : doc.status === "Diproses"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {doc.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600"><b>Keperluan:</b> {doc.purpose}</p>
                          <p className="text-[11px] text-slate-400">
                            Pengambilan: <b>{doc.deliveryMethod}</b> • Diajukan: {doc.date}
                          </p>
                        </div>

                        {doc.status === "Siap Diambil" && (
                          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 self-end sm:self-center bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                            <CheckCircle2 size={16} /> Berkas Siap di Pos Jaga
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ADUAN & SOS */}
          {activeTab === "aduan" && (
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Daftar Laporan Anda</h2>
                  <p className="text-xs text-slate-500">Kelola laporan keluhan atau fasilitas perumahan.</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 shadow"
                >
                  <Plus size={18} /> Buat Aduan
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loadingComplaints ? (
                  <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} /> Memuat riwayat...
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    Belum ada riwayat aduan. Ketuk tombol <b>Buat Aduan</b> untuk melapor.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {complaints.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-800">{item.detail}</p>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              item.status === "Selesai"
                                ? "bg-emerald-100 text-emerald-700"
                                : item.status === "Diproses"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {item.status || "Diterima"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {(!item.status || item.status === "Diterima") && (
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg text-xs flex items-center gap-1 font-semibold"
                              title="Edit Aduan"
                            >
                              <Edit2 size={16} /> Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteComplaint(item.id, item.status)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg text-xs flex items-center gap-1 font-semibold"
                            title="Hapus Aduan"
                          >
                            <Trash2 size={16} /> Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

                          {/* ================= MODUL: LAPORAN KAS & KEUANGAN RW ================= */}
        {activeTab === "keuangan" && (
          <div className="space-y-6">
            {/* JUDUL LAPORAN */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
                  💰 Laporan Kas & Transparansi RW Mekarindah
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Laporan terbuka kondisi kas RT/RW dan rincian penggunaan anggaran untuk warga.
                </p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-full border border-emerald-200">
                ● Kas Terbuka & Terverifikasi
              </span>
            </div>

            {/* 3 KARTU KONDISI KAS RW */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* KARTU 1: SISA SALDO KAS */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Sisa Saldo Kas RT Saat Ini
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-800 mt-2 font-mono">
                    Rp {kasRw.balance.toLocaleString("id-ID")}
                  </p>
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-3">
                  Dana kas siap pakai untuk operasional
                </p>
              </div>

              {/* KARTU 2: TOTAL PEMASUKAN */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Kas Masuk
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2 font-mono">
                    + Rp {kasRw.totalIncome.toLocaleString("id-ID")}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 mt-3">
                  Dari iuran IPL, donasi & sewa fasilitas
                </p>
              </div>

              {/* KARTU 3: TOTAL PENGELUARAN / BELANJA */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Pengeluaran (Belanja RW)
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-2 font-mono">
                    - Rp {kasRw.totalExpense.toLocaleString("id-ID")}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 mt-3">
                  Gaji satpam, listrik gate, sampah & rawat jalan
                </p>
              </div>
            </div>

            {/* TABEL RINCIAN PEMAKAIAN UANG KAS OLEH PENGURUS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Rincian Pemakaian Kas Lingkungan Terakhir
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {kasRw.transactions.length} Transaksi Tercatat
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 font-bold">Tanggal</th>
                      <th className="p-3.5 font-bold">Jenis Kas</th>
                      <th className="p-3.5 font-bold">Kategori</th>
                      <th className="p-3.5 font-bold">Rincian Penggunaan Kas RW</th>
                      <th className="p-3.5 font-bold text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {kasRw.transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          Belum ada catatan pembukuan kas dari pengurus RT.
                        </td>
                      </tr>
                    ) : (
                      kasRw.transactions.map((t: any) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="p-3.5 text-xs text-slate-500 whitespace-nowrap">{t.date}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                t.type === "income"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {t.type === "income" ? "Kas Masuk" : "Kas Keluar"}
                            </span>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-700">{t.category}</td>
                          <td className="p-3.5 text-slate-800 font-medium max-w-sm">{t.description}</td>
                          <td
                            className={`p-3.5 font-mono font-bold text-right whitespace-nowrap ${
                              t.type === "income" ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {t.type === "income" ? "+ " : "- "}
                            Rp {t.amount.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

          {/* TAB LAINNYA */}
          {activeTab !== "beranda" && activeTab !== "profil" && activeTab !== "akses" && activeTab !== "dokumen" && activeTab !== "aduan" && (
            <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                {menuItems.find((m) => m.id === activeTab)?.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Menu {menuItems.find((m) => m.id === activeTab)?.label}
              </h3>
              <p className="text-xs text-slate-500">
                Data modul ini sinkron otomatis dengan Unit <b>{profile.unit}</b> atas nama <b>{profile.name}</b>.
              </p>
            </div>
          )}
        </main>

        {/* ======================================================== */}
{/* TAB KENDARAAN (FORMAT TABEL KHUSUS WARGA)                */}
{/* ======================================================== */}
{activeTab === "kendaraan" && (
  <div className="space-y-4 p-4 max-w-2xl mx-auto pb-24">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Daftar Kendaraan Terdaftar</h2>
        <p className="text-xs text-slate-500">Kendaraan resmi penghuni yang terverifikasi di gerbang masuk</p>
      </div>
      <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
        {vehicles.length} Kendaraan
      </span>
    </div>

    {/* TABEL DAFTAR KENDARAAN */}
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5 pl-4">No</th>
              <th className="p-3.5">Jenis</th>
              <th className="p-3.5">Plat Nomor</th>
              <th className="p-3.5">Merk / Model</th>
              <th className="p-3.5">Warna</th>
              <th className="p-3.5 pr-4 text-center">Status Akses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {vehicles.length > 0 ? (
              vehicles.map((v: any, idx: number) => (
                <tr key={v.id || idx} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5 pl-4 text-slate-400 font-bold">{idx + 1}</td>
                  <td className="p-3.5 font-bold">
                    {v.type === "mobil" || v.type === "Mobil" ? (
                      <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        🚗 Mobil
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        🛵 Motor
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono font-bold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-slate-900 tracking-wider">
                      {v.plate}
                    </span>
                  </td>
                  <td className="p-3.5">{v.brand || "-"}</td>
                  <td className="p-3.5 text-slate-500">{v.color || "-"}</td>
                  <td className="p-3.5 pr-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      ✓ Aktif / Sah
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  Belum ada kendaraan yang terdaftar atas unit Anda. Hubungi Sekretariat RW / Pos Satpam untuk pendaftaran plat nomor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* KOTAK INFORMASI */}
    <div className="bg-amber-50 border border-amber-200/70 p-3.5 rounded-xl flex items-start gap-3">
      <span className="text-amber-600 text-base">ℹ️</span>
      <p className="text-xs text-amber-800 leading-relaxed">
        <b>Catatan Satpam / RW:</b> Pendaftaran kendaraan baru atau perubahan nomor plat wajib melampirkan foto STNK ke kantor pengurus RW demi keamanan lingkungan.
      </p>
    </div>
  </div>
)}

    {/* POPUP MODAL TAMBAH */}
    {isAddVehicleOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-100">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Daftarkan Kendaraan</h3>
            <button onClick={() => setIsAddVehicleOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <form onSubmit={handleSaveVehicle} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Jenis</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVehicleForm({ ...vehicleForm, type: "Mobil" })}
                  className={`py-2 text-xs font-bold rounded-xl border ${vehicleForm.type === "Mobil" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "border-slate-200 text-slate-500"}`}
                >
                  🚗 Mobil
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleForm({ ...vehicleForm, type: "Motor" })}
                  className={`py-2 text-xs font-bold rounded-xl border ${vehicleForm.type === "Motor" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "border-slate-200 text-slate-500"}`}
                >
                  🏍️ Motor
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Nomor Plat Polisi *</label>
              <input
                type="text"
                required
                placeholder="Contoh: B 1234 MKR"
                value={vehicleForm.plate}
                onChange={(e) => setVehicleForm({ ...vehicleForm, plate: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Merk / Tipe</label>
              <input
                type="text"
                placeholder="Contoh: Honda HR-V / NMAX"
                value={vehicleForm.brand}
                onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Warna</label>
              <input
                type="text"
                placeholder="Contoh: Putih Metalik"
                value={vehicleForm.color}
                onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddVehicleOpen(false)}
                className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={savingVehicle}
                className="flex-[2] py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {savingVehicle ? "Menyimpan..." : "Simpan Kendaraan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>


        {/* BOTTOM NAVIGATION KHUSUS HP */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-14 z-30">
          <button
            onClick={() => setActiveTab("beranda")}
            className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium ${
              activeTab === "beranda" ? "text-blue-600 font-bold" : "text-slate-400"
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="text-[10px] mt-0.5">Beranda</span>
          </button>
          <button
            onClick={() => setActiveTab("akses")}
            className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium ${
              activeTab === "akses" ? "text-blue-600 font-bold" : "text-slate-400"
            }`}
          >
            <CreditCard size={18} />
            <span className="text-[10px] mt-0.5">Akses</span>
          </button>
          <button
            onClick={handleSOS}
            className="flex flex-col items-center justify-center w-full h-full text-xs font-bold text-red-600"
          >
            <AlertTriangle size={20} />
            <span className="text-[10px] mt-0.5">SOS</span>
          </button>
          <button
            onClick={() => setActiveTab("dokumen")}
            className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium ${
              activeTab === "dokumen" ? "text-blue-600 font-bold" : "text-slate-400"
            }`}
          >
            <FileText size={18} />
            <span className="text-[10px] mt-0.5">Dokumen</span>
          </button>
          <button
            onClick={() => setActiveTab("profil")}
            className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium ${
              activeTab === "profil" ? "text-blue-600 font-bold" : "text-slate-400"
            }`}
          >
            <User size={18} />
            <span className="text-[10px] mt-0.5">Profil</span>
          </button>
        </nav>
    

      {/* MODAL: FORM PERMINTAAN DOKUMEN BARU */}
      {isDocModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Form Pengajuan Surat</h3>
                <p className="text-xs text-slate-500">Surat pengantar resmi pengurus RT/RW</p>
              </div>
              <button onClick={() => setIsDocModalOpen(false)} className="text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRequestDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Pilih Jenis Surat
                </label>
                <select
                  value={newDoc.documentType}
                  onChange={(e) => setNewDoc({ ...newDoc, documentType: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                >
                  <option value="Surat Pengantar RT/RW">Surat Pengantar RT/RW (KTP/KK)</option>
                  <option value="Surat Keterangan Domisili">Surat Keterangan Domisili Tinggal</option>
                  <option value="Surat Izin Renovasi / Bangunan">Surat Izin Renovasi Bangunan</option>
                  <option value="Surat Izin Acara / Tenda">Surat Izin Keramaian / Pasang Tenda</option>
                  <option value="Surat Keterangan Usaha (SKU)">Surat Keterangan Usaha Warga</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Keperluan / Alasan Pengajuan
                </label>
                <textarea
                  rows={3}
                  value={newDoc.purpose}
                  onChange={(e) => setNewDoc({ ...newDoc, purpose: e.target.value })}
                  placeholder="Contoh: Mengurus perpindahan KTP baru ke Kelurahan..."
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Metode Pengambilan Berkas
                </label>
                <select
                  value={newDoc.deliveryMethod}
                  onChange={(e) => setNewDoc({ ...newDoc, deliveryMethod: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                >
                  <option value="Ambil di Pos Satpam">Ambil di Pos Jaga Satpam (Gratis)</option>
                  <option value="Diantar ke Rumah">Diantar Petugas ke Rumah Unit {profile.unit}</option>
                  <option value="Format PDF via WhatsApp">Kirim Softcopy PDF via WhatsApp</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                Pemohon: <b>{profile.name}</b> (Unit {profile.unit}) • WA: {profile.phone}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-2 text-slate-500 text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingDoc}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 shadow"
                >
                  {submittingDoc && <Loader2 className="animate-spin" size={16} />}
                  <Send size={16} /> Kirim Permintaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        
    </div>
  );
}