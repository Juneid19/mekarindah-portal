"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Receipt, 
  CreditCard, 
  Menu, 
  X,
  LogOut
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter atau hapus item "Dokumen" dari daftar ini
  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Data Warga", href: "/admin/residents", icon: Users },
    { label: "Kas Keuangan", href: "/admin/finance", icon: Wallet },
    { label: "Tagihan IPL", href: "/admin/ipl", icon: Receipt },
    { label: "Kartu Akses", href: "/admin/cards", icon: CreditCard },
    // Menu "Dokumen" dihapus dari sini
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-blue-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-bold tracking-tight">Portal Admin Mekar Indah</h1>
          </div>
          
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  pathname === item.href 
                    ? "bg-blue-800 text-white" 
                    : "text-blue-100 hover:bg-blue-800 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
            <Link 
              href="/login" 
              className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <LogOut size={18} />
              Keluar
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full flex flex-col py-4" onClick={e => e.stopPropagation()}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-6 py-4 text-sm font-medium flex items-center gap-3 ${
                  pathname === item.href 
                    ? "bg-blue-50 text-blue-900 border-r-4 border-blue-900" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
            <Link 
              href="/login"
              className="px-6 py-4 text-sm font-medium text-red-600 flex items-center gap-3 mt-auto border-t"
            >
              <LogOut size={20} />
              Keluar Admin
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
}