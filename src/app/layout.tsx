// @ts-nocheck
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Tambahkan useRouter
import { 
  // ... icon lainnya
  LogOut,
  // ...
} from "lucide-react";

// ... (navItems tetap sama)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter(); // Inisialisasi router
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // FUNGSI LOGOUT
  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari Portal Admin?")) {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
        // Redirect ke halaman login utama dan refresh total
        window.location.href = "/";
      } catch (err) {
        console.error("Logout gagal", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-40">
        {/* ... (bagian logo dan navItems tetap sama) ... */}

        {/* TOMBOL KELUAR DI DESKTOP */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Keluar Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 relative">
        {/* ... (Header mobile tetap sama) ... */}

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-white flex flex-col p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* ... (Menu navigasi mobile tetap sama) ... */}
            
            {/* TOMBOL KELUAR DI MOBILE */}
            <div className="mt-auto pt-6 border-t">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-4 text-rose-600 bg-rose-50 rounded-xl font-bold"
              >
                <LogOut className="w-5 h-5" />
                Keluar & Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}