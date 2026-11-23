"use client";

import { useState, useEffect } from "react";
import { Search, Home, Car, Trash2, X, Plus } from "lucide-react";

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState("SEMUA");
  const [search, setSearch] = useState("");

  // State Modal Aktif
  const [activeModal, setActiveModal] = useState<"property" | "vehicle" | null>(null);
  const [selectedResident, setSelectedResident] = useState<any>(null);

  // State Data Dalam Modal
  const [residentProperties, setResidentProperties] = useState<any[]>([]);
  const [residentVehicles, setResidentVehicles] = useState<any[]>([]);

  // State Form Properti
  const [propForm, setPropForm] = useState({
    block: "A",
    unitNumber: "",
    surfaceArea: "90",
    buildingArea: "60",
    electricity: "2.200 VA",
    status: "Milik Pribadi (Tetap)",
  });

  // State Form Kendaraan
  const [vehForm, setVehForm] = useState({
    plate: "",
    type: "Mobil",
    brand: "",
    color: "",
  });

  // 1. Ambil Data Warga
  const fetchResidents = async () => {
    try {
      const res = await fetch("/api/admin/residents");
      if (res.ok) {
        const json = await res.json();
        const data = Array.isArray(json) ? json : json.data || [];
        setResidents(data);
      }
    } catch (e) {
      console.error("Gagal load residents:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  // 2. Klik Tombol Properti
  const handleOpenPropertyModal = async (resident: any) => {
    console.log("Buka modal properti untuk warga:", resident);
    setSelectedResident(resident);
    setPropForm({
      block: resident.block || "A",
      unitNumber: resident.unit || "",
      surfaceArea: "90",
      buildingArea: "60",
      electricity: "2.200 VA",
      status: "Milik Pribadi (Tetap)",
    });
    setActiveModal("property");

    try {
      const res = await fetch(`/api/admin/properties?residentId=${resident.id}`);
      if (res.ok) {
        const json = await res.json();
        setResidentProperties(json.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Simpan Properti
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResident) return;

    try {
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  residentId: selectedResident.id, 
  ...propForm,
        }),
      });

      if (res.ok) {
        alert("✅ Unit properti berhasil ditambahkan!");
        // Refresh list
        const resReload = await fetch(`/api/admin/properties?residentId=${selectedResident.id}`);
        const jsonReload = await resReload.json();
        setResidentProperties(jsonReload.data || []);
      } else {
        alert("Gagal menambahkan properti");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Hapus Properti
  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Hapus unit properti ini?")) return;
    await fetch(`/api/admin/properties?id=${id}`, { method: "DELETE" });
    const resReload = await fetch(`/api/admin/properties?residentId=${selectedResident.id}`);
    const jsonReload = await resReload.json();
    setResidentProperties(jsonReload.data || []);
  };

  // 5. Klik Tombol Kendaraan
  const handleOpenVehicleModal = async (resident: any) => {
    console.log("Buka modal kendaraan untuk warga:", resident);
    setSelectedResident(resident);
    setVehForm({ plate: "", type: "Mobil", brand: "", color: "" });
    setActiveModal("vehicle");

    try {
      const res = await fetch(`/api/admin/vehicles?residentId=${resident.id}`);
      if (res.ok) {
        const json = await res.json();
        setResidentVehicles(json.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

 // 6. Simpan Kendaraan (VERSI FINAL - ANTI ERROR PARSING)
const handleSaveVehicle = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedResident || !vehForm.plate) return;

  try {
    const res = await fetch("/api/admin/vehicles", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    residentId: selectedResident.id, // Gunakan ID (res-warga-1)
    ...vehForm,
  }),
});

    if (res.ok) {
      alert("✅ Kendaraan berhasil didaftarkan!");
      
      // Ambil data terbaru untuk update tabel di modal
      const resReload = await fetch(`/api/admin/vehicles?residentId=${selectedResident.id}`);
      const jsonReload = await resReload.json();
      
      // Update state tabel modal
      setResidentVehicles(jsonReload.data || []);
      
      // Reset form input
      setVehForm({ plate: "", type: "Mobil", brand: "", color: "" });
    } else {
      alert("Gagal menyimpan ke database");
    }
  } catch (err) {
    console.error("Gagal simpan kendaraan:", err);
  }
};

  // 7. Hapus Kendaraan
  const handleDeleteVehicle = async (id: string) => {
    if (!confirm("Hapus data kendaraan ini?")) return;
    await fetch(`/api/admin/vehicles?id=${id}`, { method: "DELETE" });
    const resReload = await fetch(`/api/admin/vehicles?residentId=${selectedResident.id}`);
    const jsonReload = await resReload.json();
    setResidentVehicles(jsonReload.data || []);
  };

  // Filter Data
  const filteredResidents = residents.filter((r) => {
    const matchBlock = selectedBlock === "SEMUA" || r.block === selectedBlock;
    const matchSearch =
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.unit?.toLowerCase().includes(search.toLowerCase());
    return matchBlock && matchSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Kelola Data Warga</h1>
        <p className="text-xs text-slate-500">Kelola unit properti (LT/LB) dan verifikasi kendaraan warga</p>
      </div>

      {/* FILTER BLOK A - J */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {["SEMUA", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setSelectedBlock(b)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedBlock === b
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            {b === "SEMUA" ? "Semua Blok" : `Blok ${b}`}
          </button>
        ))}
      </div>

      {/* TABEL WARGA */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari nama atau nomor unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <span className="text-xs text-slate-400 font-bold">{filteredResidents.length} Warga Ditemukan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-4">Nama Warga</th>
                <th className="p-4">Unit Utama</th>
                <th className="p-4">No. Telepon</th>
                <th className="p-4 text-center">Kelola Properti</th>
                <th className="p-4 text-center">Kelola Kendaraan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredResidents.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{r.name}</div>
                    <div className="text-[10px] text-slate-400">{r.email}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    Blok {r.block || "-"} No. {r.unit || "-"}
                  </td>
                  <td className="p-4 text-slate-500">{r.phone || "-"}</td>
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenPropertyModal(r)}
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition border border-blue-200 cursor-pointer shadow-sm"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>+ Unit Properti</span>
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenVehicleModal(r)}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-700 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition border border-emerald-200 cursor-pointer shadow-sm"
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>+ Kendaraan</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL KELOLA PROPERTI (Z-[9999] AGAR TIDAK KETUTUP)     */}
      {/* ======================================================== */}
      {activeModal === "property" && selectedResident && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-800">Unit Properti: {selectedResident.name}</h3>
                <p className="text-xs text-slate-500">Kelola unit rumah (LT / LB) resmi atas nama warga ini</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* FORM TAMBAH PROPERTI */}
            <form onSubmit={handleSaveProperty} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-700">+ Daftarkan Unit Properti Baru</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Blok</label>
                  <select
                    value={propForm.block}
                    onChange={(e) => setPropForm({ ...propForm, block: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border rounded-xl font-bold"
                  >
                    {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map((b) => (
                      <option key={b} value={b}>Blok {b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Nomor Rumah</label>
                  <input
                    type="text"
                    placeholder="Contoh: 12"
                    value={propForm.unitNumber}
                    onChange={(e) => setPropForm({ ...propForm, unitNumber: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Luas Tanah (LT)</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="90"
                      value={propForm.surfaceArea}
                      onChange={(e) => setPropForm({ ...propForm, surfaceArea: e.target.value })}
                      className="w-full text-xs p-2.5 pr-7 bg-white border rounded-xl"
                      required
                    />
                    <span className="absolute right-2.5 top-2.5 text-[10px] text-slate-400">m²</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Luas Bangunan (LB)</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="60"
                      value={propForm.buildingArea}
                      onChange={(e) => setPropForm({ ...propForm, buildingArea: e.target.value })}
                      className="w-full text-xs p-2.5 pr-7 bg-white border rounded-xl"
                      required
                    />
                    <span className="absolute right-2.5 top-2.5 text-[10px] text-slate-400">m²</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Status Kepemilikan</label>
                  <select
                    value={propForm.status}
                    onChange={(e) => setPropForm({ ...propForm, status: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border rounded-xl"
                  >
                    <option value="Milik Pribadi (Tetap)">Milik Pribadi (Tetap)</option>
                    <option value="Sewa / Kontrak">Sewa / Kontrak</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Daya Listrik</label>
                  <select
                    value={propForm.electricity}
                    onChange={(e) => setPropForm({ ...propForm, electricity: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border rounded-xl"
                  >
                    <option value="1.300 VA">1.300 VA</option>
                    <option value="2.200 VA">2.200 VA</option>
                    <option value="3.500 VA">3.500 VA</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                + Simpan Unit Properti
              </button>
            </form>

            {/* DAFTAR UNIT */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-700">Daftar Unit Terverifikasi:</div>
              {residentProperties.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Belum ada unit properti yang ditambahkan.
                </div>
              ) : (
                residentProperties.map((p) => (
                  <div key={p.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs shadow-sm">
                    <div>
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">Blok {p.block} No. {p.unit_number}</span>
                      <div className="text-[10px] text-slate-500 mt-1">LT: {p.surface_area} m² • LB: {p.building_area} m² • {p.electricity}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteProperty(p.id)}
                      className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg cursor-pointer transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL KELOLA KENDARAAN (Z-[9999] AGAR TIDAK KETUTUP)    */}
      {/* ======================================================== */}
      {activeModal === "vehicle" && selectedResident && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-800">Izin Kendaraan: {selectedResident.name}</h3>
                <p className="text-xs text-slate-500">Pendaftaran plat nomor yang diizinkan lewat portal satpam</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* FORM TAMBAH KENDARAAN */}
            <form onSubmit={handleSaveVehicle} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-700">+ Daftarkan Plat Nomor Baru</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Jenis Kendaraan</label>
                  <select
                    value={vehForm.type}
                    onChange={(e) => setVehForm({ ...vehForm, type: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border rounded-xl font-bold"
                  >
                    <option value="Mobil">🚗 Mobil</option>
                    <option value="Motor">🛵 Motor</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Plat Nomor</label>
                  <input
                    type="text"
                    placeholder="Contoh: B 1234 CD"
                    value={vehForm.plate}
                    onChange={(e) => setVehForm({ ...vehForm, plate: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border rounded-xl uppercase font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Merk / Model</label>
                  <input
                    type="text"
                    placeholder="Avanza / Vario"
                    value={vehForm.brand}
                    onChange={(e) => setVehForm({ ...vehForm, brand: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Warna</label>
                  <input
                    type="text"
                    placeholder="Hitam / Putih"
                    value={vehForm.color}
                    onChange={(e) => setVehForm({ ...vehForm, color: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                + Simpan Kendaraan
              </button>
            </form>

            {/* DAFTAR KENDARAAN */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-700">Plat Nomor Terverifikasi:</div>
              {residentVehicles.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Belum ada plat nomor terdaftar.
                </div>
              ) : (
                residentVehicles.map((v) => (
                  <div key={v.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{v.type === "Mobil" ? "🚗" : "🛵"}</span>
                      <div>
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{v.plate}</span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{v.brand || "-"} ({v.color || "-"})</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteVehicle(v.id)}
                      className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg cursor-pointer transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}