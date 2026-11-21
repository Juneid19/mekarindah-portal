// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  ShieldAlert, 
  CreditCard, 
  Wallet, 
  Receipt,
  ArrowUpRight, 
  Clock, 
  ChevronRight 
} from "lucide-react";

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [stats, setStats] = useState({
    warga: 0,
    aduan: 0,
    iplPending: 0,
    cardsActive: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Jalankan hanya setelah browser selesai memuat (Client-side only)
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString("id-ID"));

    async function fetchStats() {
      try {
        const [resWarga, resAduan, resCards] = await Promise.all([
          fetch("/api/residents").then((r) => r.json()).catch(() => []),
          fetch("/api/complaints").then((r) => r.json()).catch(() => []),
          fetch("/api/admin/cards").then((r) => r.json()).catch(() => []),
        ]);

        const wargaList = Array.isArray(resWarga) ? resWarga : [];
        const aduanList = Array.isArray(resAduan) ? resAduan : [];
        const cardList = Array.isArray(resCards) ? resCards : [];

        setStats({
          warga: wargaList.length,
          aduan: aduanList.filter((a) => a.status === "pending").length,
          iplPending: 0,
          cardsActive: cardList.filter((c) => c.active).length,
        });
      } catch (e) {
        console.error("Gagal load statistik:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const menuButtons = [
    {
      label: "Data Warga",
      val: stats.warga,
      desc: "Warga Terdaftar",
      color: "text-purple-600",
      bg: "bg-purple-50",
      icon: Users,
      href: "/admin/residents",
    },
    {
      label: "Aduan Baru",
      val: stats.aduan,
      desc: "Perlu Tindakan",
      color: "text-rose-600",
      bg: "bg-rose-50",
      icon: ShieldAlert,
      href: "/admin/complaints",
    },
    {
      label: "Tagihan IPL",
      val: stats.iplPending,
      desc: "Perlu Verifikasi",
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: Receipt,
      href: "/admin/ipl",
    },
    {
      label: "RFID Aktif",
      val: stats.cardsActive,
      desc: "Kartu Terdaftar",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      icon: CreditCard,
      href: "/admin/cards",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Ringkasan Portal RW
          </h1>
          <p className="text-slate-500 font-medium">
            Laporan status dan kendali sistem Mekar Indah hari ini.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-500 shadow-sm w-fit">
          <Clock className="w-4 h-4 text-emerald-500" />
          <span suppressHydrationWarning>
            {mounted && currentTime ? `WAKTU: ${currentTime} WIB` : "MEMUAT WAKTU..."}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuButtons.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="group bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            <div className="relative z-10">
              <div
                className={`inline-flex p-3 ${item.bg} ${item.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform`}
              >
                <item.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-slate-800 mb-1">
                {loading ? "..." : item.val}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                {item.label}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {item.desc}
              </div>
            </div>
            <ArrowUpRight className="absolute top-6 right-6 w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            <div
              className={`absolute -bottom-4 -right-4 w-24 h-24 ${item.bg} opacity-20 rounded-full blur-2xl group-hover:opacity-40 transition-opacity`}
            ></div>
          </Link>
        ))}
      </div>

      {/* Banner & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Banner Gerbang RFID */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-emerald-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-3">
                Manajemen Akses Gerbang & RFID
              </h2>
              <p className="text-emerald-200 text-sm leading-relaxed max-w-md mb-6">
                Pantau kartu RFID warga yang aktif, buat kode akses sementara untuk tamu/kurir, dan kelola keamanan palang otomatis.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/admin/cards"
                  className="px-6 py-3 bg-white text-emerald-900 font-black rounded-xl hover:bg-emerald-50 transition-colors shadow-lg text-sm"
                >
                  Kelola Kartu RFID
                </Link>
                <Link
                  href="/admin/security"
                  className="px-6 py-3 bg-emerald-800 text-white font-black rounded-xl hover:bg-emerald-700 transition-colors border border-emerald-700 text-sm"
                >
                  Kode Akses Tamu
                </Link>
              </div>
            </div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
          </div>

          {/* Akses Cepat Keuangan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/admin/finance"
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-2xl group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 transition-colors">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Kas Keuangan RW</h3>
                  <p className="text-xs text-slate-500">Pemasukan & Pengeluaran Kas</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/ipl"
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-2xl group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 transition-colors">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Tagihan IPL Warga</h3>
                  <p className="text-xs text-slate-500">Iuran bulanan per unit rumah</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Sidebar Mini - Log Keamanan */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-600" />
              Kontrol Keamanan
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                  Sistem Palang Pintu
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-700">Terkoneksi (Online)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                  Telegram Bot Keamanan
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                  <span className="text-xs font-bold text-slate-700">Aktif (@MekarindahsosBOT)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link
              href="/admin/security"
              className="flex items-center justify-between text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors group"
            >
              <span>Kelola Kode Tamu</span>
              <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}