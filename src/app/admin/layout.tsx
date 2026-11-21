// @ts-nocheck
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  MessageSquare, 
  AlertTriangle,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Wallet,
  Receipt
} from "lucide-react";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/residents",
    label: "Data Warga",
    icon: Users,
  },
  {
    href: "/admin/finance",
    label: "Kas Keuangan RW",
    icon: Wallet,
  },
  {
    href: "/admin/ipl",
    label: "Tagihan IPL Warga",
    icon: Receipt,
  },
  {
    href: "/admin/cards",
    label: "Kelola Kartu RFID",
    icon: CreditCard,
  },
  {
    href: "/admin/complaints",
    label: "Aduan & SOS",
    icon: MessageSquare,
  },
  {
    href: "/admin/security",
    label: "Kode Keamanan",
    icon: AlertTriangle,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // FUNGSI LOGOUT / QUIT SEBENARNYA
  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dan menutup sesi Admin?")) {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch (err) {
        console.error("Logout error:", err);
      }
      // Langsung diarahkan ke Halaman Login khusus
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-40">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-xl text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-none">Mekar Indah</h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Portal Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? "bg-emerald-50 text-emerald-700 font-semibold shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        {/* TOMBOL QUIT DI DESKTOP */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 relative">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h1 className="font-bold text-slate-800">Admin RW</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Drawer */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-white flex flex-col p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold text-slate-800">Menu Admin</h2>
              <button onClick={() => setIsSidebarOpen(false)}>
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <nav className="space-y-2 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium ${
                    pathname === item.href ? "bg-emerald-50 text-emerald-700" : "text-slate-500"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* TOMBOL QUIT DI MOBILE */}
            <div className="mt-auto pt-6 border-t border-slate-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl font-bold text-sm"
              >
                <LogOut className="w-5 h-5" />
                <span>Keluar &amp; Quit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}