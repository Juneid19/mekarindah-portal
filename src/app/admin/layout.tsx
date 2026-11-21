// @ts-nocheck
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, CreditCard, MessageSquare, 
  AlertTriangle, Menu, X, LogOut, ChevronRight, 
  ShieldCheck, Wallet, Receipt 
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/residents", label: "Data Warga", icon: Users },
  { href: "/admin/finance", label: "Kas Keuangan RW", icon: Wallet },
  { href: "/admin/ipl", label: "Tagihan IPL Warga", icon: Receipt },
  { href: "/admin/cards", label: "Kelola Kartu RFID", icon: CreditCard },
  { href: "/admin/complaints", label: "Aduan & SOS", icon: MessageSquare },
  { href: "/admin/security", label: "Kode Keamanan", icon: AlertTriangle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    if (confirm("Keluar dari Portal Admin?")) {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-white fixed h-full z-50">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">Mekar Indah</h1>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Portal Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${
                  isActive 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-emerald-300" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar Portal</span>
          </button>
        </div>
      </aside>

      {/* AREA KONTEN UTAMA */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col">
        {/* Header Mobile */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h1 className="font-black text-slate-800 uppercase tracking-tighter">Admin RW</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-100 rounded-lg">
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
        </header>

        {/* Konten Halaman */}
        <div className="p-6 lg:p-10 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* MOBILE DRAWER */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] lg:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-slate-900 flex flex-col p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
              <h2 className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" /> Menu Admin
              </h2>
              <button onClick={() => setIsSidebarOpen(false)}><X className="text-slate-400" /></button>
            </div>
            <nav className="space-y-2 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl font-bold ${
                    pathname === item.href ? "bg-emerald-600 text-white" : "text-slate-400"
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <button onClick={handleLogout} className="mt-6 w-full flex items-center gap-3 px-4 py-4 text-rose-400 bg-rose-400/10 rounded-xl font-bold">
              <LogOut /> Keluar Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}