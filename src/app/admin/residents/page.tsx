"use client";
import { useEffect, useState } from "react";

interface Resident {
  id: string;
  name: string;
  email: string;
  unit: string;
  phone: string;
  role: string;
  landArea: number | null;
  buildingArea: number | null;
  bedrooms: number | null;
}

export default function AdminResidents() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", emergencyName: "", emergencyPhone: "" });

  useEffect(() => {
    fetch("/api/admin/residents")
      .then((r) => r.json())
      .then((d) => setResidents(Array.isArray(d) ? d : d.residents || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = residents.filter(
    (r) =>
      r.role !== "admin" &&
      (r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.unit.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase()))
  );

  const startEdit = (r: Resident) => {
    setEditId(r.id);
    setEditForm({ name: r.name, phone: r.phone || "", emergencyName: "", emergencyPhone: "" });
  };

  const saveEdit = async () => {
    if (!editId) return;
    await fetch("/api/portal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setResidents((prev) => prev.map((r) => (r.id === editId ? { ...r, ...editForm } : r)));
    setEditId(null);
  };

  if (loading) return <p className="p-4 text-gray-500">Memuat data warga...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">👥 Kelola Data Warga</h2>
      <p className="text-gray-500 mb-4">Total: {filtered.length} warga</p>

      <input
        type="text"
        placeholder="Cari nama, unit, atau email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-96 px-4 py-2 border rounded-lg mb-4"
      />

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Unit</th>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Telepon</th>
              <th className="p-3 text-left">Luas Tanah</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono">{r.unit}</td>
                <td className="p-3">
                  {editId === r.id ? (
                    <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="border px-2 py-1 rounded w-full" />
                  ) : r.name}
                </td>
                <td className="p-3 text-gray-500">{r.email}</td>
                <td className="p-3">
                  {editId === r.id ? (
                    <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="border px-2 py-1 rounded w-full" />
                  ) : r.phone || "-"}
                </td>
                <td className="p-3">{r.landArea ? `${r.landArea} m²` : "-"}</td>
                <td className="p-3">
                  {editId === r.id ? (
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="bg-green-500 text-white px-3 py-1 rounded text-xs">Simpan</button>
                      <button onClick={() => setEditId(null)} className="bg-gray-300 px-3 py-1 rounded text-xs">Batal</button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(r)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs">Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 50 && (
          <p className="p-3 text-gray-400 text-center">Menampilkan 50 dari {filtered.length} warga. Gunakan search untuk filter.</p>
        )}
      </div>
    </div>
  );
}
