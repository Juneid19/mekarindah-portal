"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, Plus, X, Search, ShieldCheck, ShieldAlert } from "lucide-react";

interface Card {
  id: string;
  residentId: string;
  label: string;
  number: string;
  holder: string;
  active: boolean;
}

interface ResidentOption {
  id: string;
  name: string;
  unit: string;
}

export default function AdminCardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [residentsList, setResidentsList] = useState<ResidentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // State Modal Tambah Kartu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newLabel, setNewLabel] = useState("Kartu Warga Utama");
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadCards = async () => {
    try {
      const res = await fetch("/api/admin/cards");
      if (res.ok) {
        const data = await res.json();
        setCards(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Gagal load cards:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();

    // Ambil daftar warga untuk pilihan pemilik kartu
    fetch("/api/residents?limit=200")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setResidentsList(d);
          if (d.length > 0) setSelectedResidentId(String(d[0].id));
        }
      })
      .catch((e) => console.error("Gagal load warga:", e));
  }, []);

  const toggleCard = async (card: Card) => {
    const newActive = !card.active;
    try {
      const res = await fetch(`/api/admin/cards/${card.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive }),
      });
      if (res.ok) {
        setCards((prev) =>
          prev.map((c) => (c.id === card.id ? { ...c, active: newActive } : c))
        );
      } else {
        alert("Gagal mengubah status kartu.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber.trim() || !selectedResidentId) {
      alert("Mohon isi nomor RFID dan pilih warga pemegang kartu.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentId: selectedResidentId,
          number: newNumber.trim(),
          label: newLabel,
        }),
      });

      if (res.ok) {
        alert("Kartu RFID berhasil didaftarkan dan dikirim ke Telegram!");
        setNewNumber("");
        setIsModalOpen(false);
        loadCards();
      } else {
        const err = await res.json();
        alert("Gagal: " + (err.error || "Terjadi kesalahan"));
      }
    } catch {
      alert("Gagal menghubungi server.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = cards.filter(
    (c) =>
      c.holder?.toLowerCase().includes(search.toLowerCase()) ||
      c.number?.toLowerCase().includes(search.toLowerCase()) ||
      c.label?.toLowerCase().includes(search.toLowerCase())
  );

  const aktif = cards.filter((c) => c.active).length;
  const blokir = cards.filter((c) => !c.active).length;

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
        <CreditCard className="animate-pulse" /> Memuat data kartu akses...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CreditCard className="text-blue-600" /> Kelola Kartu Akses RFID
          </h2>
          <p className="text-sm text-gray-500">
            Manajemen hak akses palang pintu masuk otomatis perumahan
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors w-fit"
        >
          <Plus size={18} /> Tambah Kartu RFID
        </button>
      </div>

      {/* Ringkasan Status */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl">
          <div className="text-sm text-teal-600 font-medium">Total Kartu</div>
          <div className="text-2xl font-bold text-teal-800">{cards.length}</div>
        </div>
        <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
          <div className="text-sm text-green-600 font-medium">Aktif</div>
          <div className="text-2xl font-bold text-green-800">{aktif}</div>
        </div>
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
          <div className="text-sm text-red-600 font-medium">Diblokir</div>
          <div className="text-2xl font-bold text-red-800">{blokir}</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 bg-white px-3 py-2 border rounded-lg w-full md:w-96 shadow-sm">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama pemegang, nomor kartu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none text-sm"
        />
      </div>

      {/* Tabel Kartu Akses */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b text-gray-600">
            <tr>
              <th className="p-3.5">Label</th>
              <th className="p-3.5">Nomor RFID</th>
              <th className="p-3.5">Pemegang</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  Belum ada data kartu akses terdaftar.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3.5 font-medium text-gray-800">{c.label}</td>
                  <td className="p-3.5 font-mono text-blue-700 font-semibold">{c.number}</td>
                  <td className="p-3.5 text-gray-700">{c.holder}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        c.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.active ? (
                        <>
                          <ShieldCheck size={14} /> Aktif
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={14} /> Diblokir
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => toggleCard(c)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        c.active
                          ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {c.active ? "Blokir" : "Aktifkan"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Kartu Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Daftarkan Kartu RFID Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Pilih Warga Pemilik
                </label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm bg-white"
                  required
                >
                  <option value="">-- Pilih Warga --</option>
                  {residentsList.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.name} (Unit: {res.unit || "-"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Nomor Seri RFID (Tap / Ketik)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: RFID-99281 atau 0012938475"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Label / Tipe Kartu
                </label>
                <select
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm bg-white"
                >
                  <option value="Kartu Warga Utama">Kartu Warga Utama</option>
                  <option value="Kartu Mobil">Kartu Mobil</option>
                  <option value="Kartu Motor">Kartu Motor</option>
                  <option value="Kartu Tamu / ART">Kartu Tamu / ART</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan & Daftarkan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}