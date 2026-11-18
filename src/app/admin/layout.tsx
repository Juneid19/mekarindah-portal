import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between flex-wrap gap-2 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-sm">
            MI
          </div>
          <h1 className="text-lg font-bold">Admin Mekarindah</h1>
        </div>
        <div className="flex gap-4 text-sm flex-wrap items-center">
          <a href="/admin" className="hover:text-emerald-400 font-medium transition-colors">Dashboard</a>
          <a href="/admin/residents" className="hover:text-emerald-400 font-medium transition-colors">Warga</a>
          <a href="/admin/finance" className="hover:text-emerald-400 font-medium transition-colors">Keuangan</a>
          <a href="/admin/cards" className="hover:text-emerald-400 font-medium transition-colors">Kartu</a>
          <a href="/admin/documents" className="hover:text-emerald-400 font-medium transition-colors">Dokumen</a>
          <a href="/admin/complaints" className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-md hover:bg-amber-500/30 font-semibold transition-colors flex items-center gap-1">
            📢 Aduan & SOS
          </a>
          <a href="/api/auth/signout" className="text-rose-400 hover:text-rose-300 font-medium transition-colors ml-2">Keluar</a>
        </div>
      </nav>
      <main className="p-4 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
