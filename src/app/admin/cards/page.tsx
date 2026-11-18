"use client";
import { useEffect, useState } from "react";

interface Card {
  id: string;
  residentId: string;
  label: string;
  number: string;
  holder: string;
  active: boolean;
}

export default function AdminCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/cards")
      .then((r) => r.json())
      .then((d) => setCards(Array.isArray(d) ? d : d.cards || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleCard = async (card: Card) => {
    const newActive = !card.active;
    const res = await fetch(`/api/admin/cards/${card.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: newActive }),
    });
    if (res.ok) {
      setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, active: newActive } : c)));
    }
  };

  const filtered = cards.filter(
    (c) =>
      c.holder.toLowerCase().includes(search.toLowerCase()) ||
      c.number.toLowerCase().includes(search.toLowerCase()) ||
      c.label.toLowerCase().includes(search.toLowerCase())
  );

  const aktif = cards.filter((c) => c.active).length;
  const blokir = cards.filter((c) => !c.active).length;

  if (loading) return <p className="p-4 text-gray-500">Memuat data kartu...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">🪪 Kelola Kartu Akses</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-teal-50 p-4 rounded-xl">
          <div className="text-sm text-teal-600">Total Kartu</div>
          <div className="text-xl font-bold text-teal-700">{cards.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl">
          <div className="text-sm text-green-600">Aktif</div>
          <div className="text-xl font-bold text-green-700">{aktif}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-xl">
          <div className="text-sm text-red-600">Diblokir</div>
          <div className="text-xl font-bold text-red-700">{blokir}</div>
        </div>
      </div>

      <input
        type="text"
        placeholder="Cari nama pemegang, nomor kartu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-96 px-4 py-2 border rounded-lg mb-4"
      />

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Label</th>
              <th className="p-3 text-left">Nomor</th>
              <th className="p-3 text-left">Pemegang</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{c.label}</td>
                <td className="p-3 font-mono">{c.number}</td>
                <td className="p-3">{c.holder}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${c.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {c.active ? "Aktif" : "Diblokir"}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleCard(c)}
                    className={`px-3 py-1 rounded text-xs ${c.active ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
                  >
                    {c.active ? "Blokir" : "Aktifkan"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 100 && (
          <p className="p-3 text-gray-400 text-center">Menampilkan 100 dari {filtered.length} kartu.</p>
        )}
      </div>
    </div>
  );
}
