"use client";

import { useEffect, useState, type FormEvent } from "react";

type AdminResident = { id: string; name: string; email: string; unit: string; phone: string; role: "resident" | "admin" };

type FinanceTxn = {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: string;
  createdBy: string;
};

type Property = {
  unit: string;
  block: string;
  name: string;
  landArea: number | null;
  buildingArea: number | null;
  bedrooms: number | null;
  securityCode: string;
};

const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");
const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export function PropertyTab({ residents, onSaved }: { residents: AdminResident[]; onSaved: () => void }) {
  const [unit, setUnit] = useState("");
  const [data, setData] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const loadUnit = async (u: string) => {
    if (!u) { setData(null); return; }
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/property/${encodeURIComponent(u)}`);
      if (!res.ok) { setData(null); setMsg("Unit tidak ditemukan"); return; }
      const d = await res.json();
      setData(d);
    } finally {
      setLoading(false);
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/property/${encodeURIComponent(data.unit)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landArea: data.landArea,
          buildingArea: data.buildingArea,
          bedrooms: data.bedrooms,
          securityCode: data.securityCode,
        }),
      });
      if (res.ok) { setMsg("Tersimpan ✓"); onSaved(); }
      else setMsg("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Unit</label>
        <select
          value={unit}
          onChange={(e) => { setUnit(e.target.value); loadUnit(e.target.value); }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">-- pilih unit --</option>
          {residents.map((r) => (
            <option key={r.id} value={r.unit}>{r.unit} — {r.name}</option>
          ))}
        </select>
      </div>
      {loading && <p className="text-sm text-slate-500">Memuat...</p>}
      {data && (
        <form onSubmit={save} className="space-y-3 bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-600">Penghuni: <b>{data.name}</b> (Blok {data.block})</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Luas Tanah (m²)</label>
              <input
                type="number"
                value={data.landArea ?? ""}
                onChange={(e) => setData({ ...data, landArea: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded border border-slate-300 px-2 py-1.5"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Luas Bangunan (m²)</label>
              <input
                type="number"
                value={data.buildingArea ?? ""}
                onChange={(e) => setData({ ...data, buildingArea: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded border border-slate-300 px-2 py-1.5"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Kamar Tidur</label>
              <input
                type="number"
                value={data.bedrooms ?? ""}
                onChange={(e) => setData({ ...data, bedrooms: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded border border-slate-300 px-2 py-1.5"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Security Code (4 angka)</label>
            <input
              type="text"
              maxLength={4}
              pattern="\d{4}"
              value={data.securityCode}
              onChange={(e) => setData({ ...data, securityCode: e.target.value })}
              className="w-32 rounded border border-slate-300 px-2 py-1.5"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Properti"}
          </button>
          {msg && <span className="ml-3 text-sm text-emerald-600">{msg}</span>}
        </form>
      )}
    </div>
  );
}

export function InvoicesTab({ residents }: { residents: AdminResident[] }) {
  const [unit, setUnit] = useState("");
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState(350000);
  const [desc, setDesc] = useState("IPL");
  const [due, setDue] = useState("10");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!unit) { setMsg("Pilih unit dulu"); return; }
    setSaving(true);
    setMsg("");
    try {
      const dueDate = `${due} ${month.slice(0,3)} ${year}`;
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unit, month, year, amount, description: desc, dueDate }),
      });
      if (res.ok) { setMsg("Tagihan dibuat ✓"); }
      else {
        const j = await res.json();
        setMsg(j.message ?? "Gagal");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <p className="font-medium text-slate-800">Buat Tagihan IPL Baru</p>
      <div>
        <label className="block text-xs text-slate-600 mb-1">Unit</label>
        <select
          required
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1.5"
        >
          <option value="">-- pilih unit --</option>
          {residents.map((r) => (
            <option key={r.id} value={r.unit}>{r.unit} — {r.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-600 mb-1">Bulan</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1.5"
          >
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-1">Tahun</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full rounded border border-slate-300 px-2 py-1.5"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-slate-600 mb-1">Nominal (Rp)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded border border-slate-300 px-2 py-1.5"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-1">Keterangan</label>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1.5"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-1">Tgl Jatuh Tempo</label>
          <input
            type="text"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            placeholder="10"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Membuat..." : "Buat Tagihan"}
      </button>
      {msg && <span className="ml-3 text-sm text-emerald-600">{msg}</span>}
    </form>
  );
}

export function FinanceTab() {
  const [list, setList] = useState<FinanceTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState("IPL");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/finance");
      if (res.ok) setList(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!amount) { setMsg("Nominal wajib"); return; }
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, category, amount, description }),
      });
      if (res.ok) {
        setMsg("Tersimpan ✓");
        setAmount(0);
        setDescription("");
        load();
      }
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    await fetch(`/api/admin/finance/${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
  };

  const totalIn = list.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0);
  const totalOut = list.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0);
  const balance = totalIn - totalOut;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <p className="text-xs text-emerald-700">Total Pemasukan</p>
          <p className="font-bold text-emerald-900">{rupiah(totalIn)}</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
          <p className="text-xs text-rose-700">Total Pengeluaran</p>
          <p className="font-bold text-rose-900">{rupiah(totalOut)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-700">Saldo Berjalan</p>
          <p className="font-bold text-blue-900">{rupiah(balance)}</p>
        </div>
      </div>
      <form onSubmit={add} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <p className="font-medium text-slate-800">Tambah Transaksi</p>
        <div className="grid grid-cols-4 gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "income" | "expense")}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Kategori"
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
          <input
            type="number"
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Nominal"
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Keterangan"
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Tambah"}
        </button>
        {msg && <span className="ml-3 text-sm text-emerald-600">{msg}</span>}
      </form>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Tanggal</th>
              <th className="px-3 py-2 text-left">Tipe</th>
              <th className="px-3 py-2 text-left">Kategori</th>
              <th className="px-3 py-2 text-right">Nominal</th>
              <th className="px-3 py-2 text-left">Keterangan</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="p-3 text-center text-slate-500">Memuat...</td></tr>
            )}
            {!loading && list.length === 0 && (
              <tr><td colSpan={6} className="p-3 text-center text-slate-500">Belum ada transaksi</td></tr>
            )}
            {list.map((t) => (
              <tr key={t.id} className="border-t border-slate-100">
                <td className="px-3 py-2 text-slate-600">{new Date(t.date).toLocaleDateString("id-ID")}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${t.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {t.type === "income" ? "Masuk" : "Keluar"}
                  </span>
                </td>
                <td className="px-3 py-2">{t.category}</td>
                <td className="px-3 py-2 text-right font-mono">{rupiah(t.amount)}</td>
                <td className="px-3 py-2 text-slate-600 text-xs">{t.description}</td>
                <td className="px-3 py-2">
                  <button onClick={() => del(t.id)} className="text-xs text-rose-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CardsTab({ residents }: { residents: AdminResident[] }) {
  const [unit, setUnit] = useState("");
  const [label, setLabel] = useState("Kartu Baru");
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!unit || !label || !number) { setMsg("Lengkapi data"); return; }
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unit, label, number, holder }),
      });
      if (res.ok) {
        setMsg("Kartu ditambahkan ✓");
        setNumber("");
        setHolder("");
      } else {
        const j = await res.json();
        setMsg(j.message ?? "Gagal");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <p className="font-medium text-slate-800">Tambah Kartu Akses</p>
      <div>
        <label className="block text-xs text-slate-600 mb-1">Unit</label>
        <select
          required
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1.5"
        >
          <option value="">-- pilih unit --</option>
          {residents.map((r) => (
            <option key={r.id} value={r.unit}>{r.unit} — {r.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-slate-600 mb-1">Label Kartu</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1.5"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-1">Nomor RFID</label>
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="RF001"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-1">Pemegang (opsional)</label>
          <input
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
            placeholder="Nama pemegang"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Menyimpan..." : "Tambah Kartu"}
      </button>
      {msg && <span className="ml-3 text-sm text-emerald-600">{msg}</span>}
    </form>
  );
}

export function BulkUnitsTab() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const generate = async () => {
    if (!confirm("Buat 1000 unit baru dan download CSV? Unit yang sudah ada akan dilewati.")) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/bulk-units", { method: "POST" });
      if (!res.ok) {
        setMsg("Gagal membuat unit");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mekarindah-units-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg("Berhasil! File CSV terdownload. Silakan reload halaman.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
      <p className="font-medium text-slate-800">Generator Kode Unit Massal</p>
      <p className="text-sm text-slate-600">
        Membuat <b>1000 unit baru</b> dengan pola A-001 sampai J-100. Unit yang sudah ada di database
        akan dilewati. Setiap unit mendapat <b>security code 4 angka acak dan unik</b>. Hasil dapat
        diunduh sebagai file CSV.
      </p>
      <button
        onClick={generate}
        disabled={busy}
        className="rounded-lg bg-blue-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {busy ? "Membuat..." : "Buat 1000 Unit & Download CSV"}
      </button>
      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      <div className="text-xs text-slate-500 mt-3 space-y-1">
        <p>ℹ️ Setelah download, refresh halaman dashboard untuk melihat unit baru.</p>
        <p>⚠️ Unit yang dibuat otomatis belum punya akun login (hanya kode & security code).</p>
      </div>
    </div>
  );
}
