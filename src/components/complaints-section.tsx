"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Plus, Edit2, Trash2, Clock, CheckCircle, AlertCircle, X, Ban } from "lucide-react";

interface Complaint {
  id: string;
  title: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
}

interface ComplaintsSectionProps {
  residentId: string;
  residentName: string;
  unit: string;
}

export function ComplaintsSection({ residentId, residentName, unit }: ComplaintsSectionProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState<Complaint | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Keamanan");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch complaints
  const fetchComplaints = async () => {
    if (!residentId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/complaints?resident_id=${residentId}`);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat aduan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [residentId]);

  // Submit Handler (Create & Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditing) {
        const res = await fetch(`/api/complaints/${isEditing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, category, description }),
        });
        const data = await res.json();
        if (data.success) {
          alert("✅ Aduan berhasil diperbarui!");
          closeModal();
          fetchComplaints();
        } else {
          alert(data.message || "Gagal mengupdate aduan");
        }
      } else {
        const res = await fetch("/api/complaints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resident_id: residentId,
            resident_name: residentName,
            unit: unit,
            title,
            category,
            description,
          }),
        });
        const data = await res.json();
        if (data.success) {
          alert("🚀 Aduan Anda berhasil terkirim dan telah diteruskan ke Sekuriti / RT RW!");
          closeModal();
          fetchComplaints();
        } else {
          alert(data.message || "Gagal mengirim aduan");
        }
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan/menghapus aduan ini?")) return;

    try {
      const res = await fetch(`/api/complaints/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("🗑️ Aduan berhasil dihapus");
        fetchComplaints();
      } else {
        alert(data.message || "Gagal menghapus aduan");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    }
  };

  const openEditModal = (item: Complaint) => {
    setIsEditing(item);
    setTitle(item.title);
    setCategory(item.category || "Keamanan");
    setDescription(item.description);
    setIsOpenModal(true);
  };

  const closeModal = () => {
    setIsOpenModal(false);
    setIsEditing(null);
    setTitle("");
    setCategory("Keamanan");
    setDescription("");
  };

  const renderBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "pending") {
      return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
    }
    if (s === "diproses" || s === "in_progress") {
      return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Diproses</span>;
    }
    if (s === "selesai" || s === "completed" || s === "resolved") {
      return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Selesai</span>;
    }
    if (s === "ditolak" || s === "rejected") {
      return <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"><Ban className="w-3 h-3" /> Ditolak</span>;
    }
    return <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-full font-medium">{status}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Laporan & Aduan Warga
          </h3>
          <p className="text-sm text-slate-500">Sampaikan keluhan, aduan, atau saran fasilitas lingkungan Anda.</p>
        </div>
        <button
          onClick={() => { setIsEditing(null); setTitle(""); setDescription(""); setIsOpenModal(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Buat Laporan Baru
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 py-6 text-center">Memuat riwayat aduan...</p>
      ) : complaints.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-xl border-slate-200 bg-slate-50/50">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 font-medium text-sm">Belum ada aduan yang pernah dikirim.</p>
          <p className="text-slate-400 text-xs mt-1">Klik "Buat Laporan Baru" di atas untuk mengirim aduan ke RT/RW & Sekuriti.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((item) => {
            const isPending = (item.status || "").toLowerCase() === "pending";
            return (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4 transition-all hover:border-slate-300">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-700">{item.category || "Umum"}</span>
                    {renderBadge(item.status)}
                  </div>
                  <h4 className="font-semibold text-slate-800 text-base">{item.title}</h4>
                  <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{item.description}</p>
                  <span className="text-xs text-slate-400 block pt-1">
                    {new Date(item.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Tombol Action Edit & Hapus (Hanya untuk Status Pending) */}
                {isPending && (
                  <div className="flex items-center gap-1 shrink-0 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                      title="Edit Aduan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Hapus / Batal Aduan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form Tambah / Edit Aduan */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-slate-800 text-lg">{isEditing ? "Edit Laporan Aduan" : "Buat Laporan Baru"}</h4>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Laporan</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="Keamanan">Keamanan & Ketertiban</option>
                  <option value="Kebersihan">Kebersihan & Sampah</option>
                  <option value="Fasilitas Umum">Fasilitas Umum / Penerangan</option>
                  <option value="Keuangan / IPL">Keuangan / IPL</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Laporan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pohon Rindang Menghalangi Lampu Gang A"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detail Aduan / Rincian Laporan</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Jelaskan detail masalah atau kronologi..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                >
                  {submitting ? "Proses..." : isEditing ? "Simpan Perubahan" : "Kirim Laporan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
