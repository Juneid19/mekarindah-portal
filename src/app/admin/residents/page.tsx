"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Home, Car, Trash2, X, CheckCircle2 } from "lucide-react";

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState("SEMUA");
  const [search, setSearch] = useState("");

  // Modal State
  const [activeModal, setActiveModal] = useState<"property" | "vehicle" | null>(null);
  const [selectedResident, setSelectedResident] = useState<any>(null);

  // Data List Modal
  const [residentProperties, setResidentProperties] = useState<any[]>([]);
  const [residentVehicles, setResidentVehicles] = useState<any[]>([]);

  // Form State Properti
  const [propForm, setPropForm] = useState({
    block: "A",
    unitNumber: "",
    surfaceArea: "90",
    buildingArea: "60",
    electricity: "2.200 VA",
    status: "Milik Pribadi (Tetap)",
  });

  // Form State Kendaraan
  const [vehForm, setVehForm] = useState({
    plate: "",
    type: "Mobil",
    brand: "",
    color: "",
  });

  // Load Residents
  const fetchResidents = async () => {
    try {
      const res = await fetch("/api/admin/residents");
      const json = await res.json();
      if (json.data) setResidents(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  // Buka Modal Properti Warga
  const handleOpenPropertyModal = async (resident: any) => {
    setSelectedResident(resident);
    setPropForm({ ...propForm, block: resident.block || "A", unitNumber: resident.unit || "" });
    setActiveModal("property");

    try {
      const res = await fetch(`/api/admin/properties?residentId=${resident.id}`);
      const json = await res.json();
      if (json.data) setResidentProperties(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Simpan Properti
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResident) return;

    const res = await fetch("/api/admin/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        residentId: selectedResident.id,
        ...propForm,
      }),
    });

    if (res.ok) {
      alert("✅ Unit Properti berhasil ditambahkan!");
      handleOpenPropertyModal(selectedResident); // refresh list
    }
  };

  // Hapus Properti
  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Hapus unit properti ini?")) return;
    await fetch(`/api/admin/properties?id=${id}`, { method: "DELETE" });
    handleOpenPropertyModal(selectedResident);
  };

  // Buka Modal Kendaraan Warga
  const handleOpenVehicleModal = async (resident: any) => {
    setSelectedResident(resident);
    setVehForm({ plate: "", type: "Mobil", brand: "", color: "" });
    setActiveModal("vehicle");

    try {
      const res = await fetch(`/api/admin/vehicles?residentId=${resident.id}`);
      const json = await res.json();
      if (json.data) setResidentVehicles(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Simpan Kendaraan
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResident || !vehForm.plate) return;

    const res = await fetch("/api/admin/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        residentId: selectedResident.id,
        ...vehForm,
      }),
    });

    if (res.ok) {
      alert("✅ Kendaraan berhasil didaftarkan!");
      handleOpenVehicleModal(selectedResident); // refresh list
    }
  };

  // Hapus Kendaraan
  const handleDeleteVehicle = async (id: string) => {
    if (!confirm("Hapus data kendaraan ini?")) return;
    await fetch(`/api/admin/vehicles?id=${id}`, { method: "DELETE" });
    handleOpenVehicleModal(selectedResident);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Kelola Data Warga</h1>
          <p className="text-xs text-slate-500">Kelola identitas, unit hunian (LT/LB), dan izin kendaraan warga</p>
        </div>
      </div>

      {/* FILTER BLOK A - J */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {["SEMUA", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map((b) => (
          <button
            key={b}
            onClick={() => setSelectedBlock(b)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedBlock === b
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            {b === "SEMUA" ? "Semua Blok" : `Blok ${b}`}
          </button>
        ))}
      </div>

      {/* TABEL DATA WARGA */}
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
                      onClick={() => handleOpenPropertyModal(r)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-[11px] inline-flex items-center gap-1.5 transition border border-blue-200"
                    >
                      <Home className="w-3.5 h-3.5" />
                      Unit Properti
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleOpenVehicleModal(r)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-[11px] inline-flex items-center gap-1.5 transition border border-emerald-200"
                    >
                      <Car className="w-3.5 h-3.5" />
                      Kendaraan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL KELOLA PROPERTI WARGA (ADMIN)                      */}
      {/* ======================================================== */}
      {activeModal === "property" && selectedResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-800">Unit Properti: {selectedResident.name}</h3>
                <p className="text-xs text-slate-500">Kelola luas tanah, bangunan, dan unit tambahan warga</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">✕</button>
            </div>

            {/* FORM INPUT PROPERTI */}
            <form onSubmit={handleSaveProperty} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-700">+ Tambah Unit Rumah / Kavling Baru</div>
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
                    className="w-full text-xs p-2.5 bg-white border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Luas Tanah (LT)</label>
                  <input
                    type="number"
                    placeholder="90"
                    value={propForm.surfaceArea}
                    onChange={(e) => setPropForm({ ...propForm, surfaceArea: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Luas Bangunan (LB)</label>
                  <input
                    type="number"
                    placeholder="60"
                    value={propForm.buildingArea}
                    onChange={(e) => setPropForm({ ...propForm, buildingArea: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border rounded-xl"
                    required
                  />
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

              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition">
                + Daftarkan Unit Properti
              </button>
            </form>

            {/* DAFTAR UNIT TERDAFTAR */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">Daftar Unit Milik Warga Ini:</div>
              {residentProperties.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">Belum ada unit properti tercatat khusus di database.</div>
              ) : (
                residentProperties.map((p) => (
                  <div key={p.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">Blok {p.block} No. {p.unit_number}</span>
                      <div className="text-[10px] text-slate-500">LT: {p.surface_area} m² | LB: {p.building_area} m² | {p.electricity}</div>
                    </div>
                    <button onClick={() => handleDeleteProperty(p.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg">
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
      {/* MODAL KELOLA KENDARAAN WARGA (ADMIN)                     */}
      {/* ======================================================== */}
      {activeModal === "vehicle" && selectedResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-800">Izin Kendaraan: {selectedResident.name}</h3>
                <p className="text-xs text-slate-500">Kelola nomor plat mobil/motor yang berhak melewati gerbang</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">✕</button>
            </div>

            {/* FORM INPUT KENDARAAN */}
            <form onSubmit={handleSaveVehicle} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-700">+ Daftarkan Kendaraan Baru</div>
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
                  <label className="text-[10px] font-bold text-slate-500">Plat Nomor (Huruf & Angka)</label>
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
                  <label className="text-[10px] font-bold text-slate-500">Merk / Tipe</label>
                  <input
                    type="text"
                    placeholder="Contoh: Avanza / Vario"
                    value={vehForm.brand}
                    onChange={(e) => setVehForm({ ...vehForm, brand: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Warna Kendaraan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Hitam Metalik"
                    value={vehForm.color}
                    onChange={(e) => setVehForm({ ...vehForm, color: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border rounded-xl"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition">
                + Simpan Kendaraan
              </button>
            </form>

            {/* DAFTAR KENDARAAN TERDAFTAR */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">Kendaraan Terverifikasi:</div>
              {residentVehicles.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">Belum ada plat nomor yang terdaftar atas warga ini.</div>
              ) : (
                residentVehicles.map((v) => (
                  <div key={v.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-base">{v.type === "Mobil" ? "🚗" : "🛵"}</span>
                      <div>
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{v.plate}</span>
                        <div className="text-[10px] text-slate-500">{v.brand} ({v.color})</div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteVehicle(v.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg">
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