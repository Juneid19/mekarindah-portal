"use client";
import { useEffect, useState } from "react";

interface Complaint {
  id: string;
  residentId: string;
  category: string;
  title: string;
  detail: string;
  date: string;
  status: string;
  residentName?: string;
  unit?: string;
  block?: string;
  phone?: string;
}

const STATUS_COLORS: Record<string, string> = {
  Diterima: "bg-yellow-100 text-yellow-700",
  Diproses: "bg-blue-100 text-blue-700",
  Selesai: "bg-green-100 text-green-700",
};

export default function AdminComplaints() {
  const [items, setItems] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/complaints")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (item: Complaint, newStatus: string) => {
    const res = await fetch(`/api/admin/complaints/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((c) => (c.id === item.id ? { ...c, status: newStatus } : c)));
    }
  };

  const filtered = items.filter((c) => {
    const matchFilter = filter === "all" || c.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      c.title?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.residentName?.toLowerCase().includes(q) ||
      c.unit?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const diterima = items.filter((c) => c.status === "Diterima").length;
  const diproses = items.filter((c) => c.status === "Diproses").length;
  const selesai = items.filter((c) => c.status === "Selesai").length;

  if (loading) return <p className="p-4 text-gray-500">Memuat data aduan warga...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📢 Kelola Aduan & Keluhan Warga</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 p-4 rounded-xl">
          <div className="text-sm text-yellow-600">Baru (Diterima)</div>
          <div className="text-xl font-bold text-yellow-700">{diterima}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl">
          <div className="text-sm text-blue-600">Sedang Diproses</div>
          <div className="text-xl font-bold text-blue-700">{diproses}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl">
          <div className="text-sm text-green-600">Selesai</div>
          <div className="text-xl font-bold text-green-700">{selesai}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl">
          <div className="text-sm text-purple-600">Total Aduan</div>
          <div className="text-xl font-bold text-purple-700">{items.length}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4 justify-between">
        <div className="flex gap-2 flex-wrap">
          {["all", "Diterima", "Diproses", "Selesai"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm ${filter === f ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              {f === "all" ? "Semua" : f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Cari judul, warga, unit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full md:w-72"
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Pelapor</th>
              <th className="p-3 text-left">Kategori</th>
              <th className="p-3 text-left">Judul / Detail</th>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Aksi Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-semibold">{item.residentName || "Warga"}</div>
                  <div className="text-xs text-gray-500">Unit: {item.unit || "-"} (Blok {item.block || "-"})</div>
                  {item.phone && <div className="text-xs text-blue-600">📞 {item.phone}</div>}
                </td>
                <td className="p-3 font-medium text-gray-700">{item.category}</td>
                <td className="p-3 max-w-xs">
                  <div className="font-semibold">{item.title}</div>
                  {item.detail && <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.detail}</div>}
                </td>
                <td className="p-3 text-gray-500 whitespace-nowrap">{item.date}</td>
                <td className="p-3 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[item.status] || "bg-gray-100"}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap">
                  <div className="flex gap-1">
                    {item.status !== "Diproses" && (
                      <button
                        onClick={() => updateStatus(item, "Diproses")}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        Proses
                      </button>
                    )}
                    {item.status !== "Selesai" && (
                      <button
                        onClick={() => updateStatus(item, "Selesai")}
                        className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                      >
                        Selesai
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Tidak ada aduan warga
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
