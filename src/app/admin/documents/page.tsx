"use client";
import { useEffect, useState } from "react";

interface Doc {
  id: string;
  residentId: string;
  type: string;
  submitted: string;
  status: "pending" | "processing" | "ready" | "completed";
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  processing: "Diproses",
  ready: "Siap Diambil",
  completed: "Selesai",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  ready: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-700",
};

export default function AdminDocuments() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/admin/finance")
      .then((r) => r.json())
      .then((d) => {
        const items = Array.isArray(d) ? d : d.documents || [];
        setDocs(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (doc: Doc, newStatus: Doc["status"]) => {
    const res = await fetch(`/api/documents/${doc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: newStatus } : d)));
    }
  };

  const filtered = docs.filter((d) => filter === "all" || d.status === filter);
  const pending = docs.filter((d) => d.status === "pending").length;

  if (loading) return <p className="p-4 text-gray-500">Memuat data dokumen...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📄 Kelola Dokumen</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 p-4 rounded-xl">
          <div className="text-sm text-yellow-600">Menunggu</div>
          <div className="text-xl font-bold text-yellow-700">{pending}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl">
          <div className="text-sm text-blue-600">Diproses</div>
          <div className="text-xl font-bold text-blue-700">{docs.filter((d) => d.status === "processing").length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl">
          <div className="text-sm text-green-600">Siap Diambil</div>
          <div className="text-xl font-bold text-green-700">{docs.filter((d) => d.status === "ready").length}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <div className="text-sm text-gray-600">Selesai</div>
          <div className="text-xl font-bold text-gray-700">{docs.filter((d) => d.status === "completed").length}</div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "pending", "processing", "ready", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm ${filter === f ? "bg-purple-600 text-white" : "bg-gray-200"}`}
          >
            {f === "all" ? "Semua" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Jenis</th>
              <th className="p-3 text-left">Diajukan</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((doc) => (
              <tr key={doc.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{doc.type}</td>
                <td className="p-3 text-gray-500">{doc.submitted}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[doc.status]}`}>
                    {STATUS_LABELS[doc.status]}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {doc.status !== "processing" && (
                      <button onClick={() => updateStatus(doc, "processing")} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Proses</button>
                    )}
                    {doc.status !== "ready" && (
                      <button onClick={() => updateStatus(doc, "ready")} className="bg-green-500 text-white px-2 py-1 rounded text-xs">Siap</button>
                    )}
                    {doc.status !== "completed" && (
                      <button onClick={() => updateStatus(doc, "completed")} className="bg-gray-500 text-white px-2 py-1 rounded text-xs">Selesai</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-gray-400">Tidak ada dokumen</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
