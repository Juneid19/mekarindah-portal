"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Home,
  Car,
  Phone,
  Mail,
  Building,
  KeyRound,
  Shield,
  Eye,
  AlertCircle,
} from "lucide-react";

// Tipe Data Warga
interface Resident {
  id: string;
  name: string;
  nik: string;
  email: string;
  phone: string;
  block: string;
  unit: string;
  address: string;
  status: "TETAP" | "KONTRAK" | "PENGURUS";
  occupantsCount: number;
  vehicles: { type: "Mobil" | "Motor"; plate: string; model: string }[];
  rfid: string;
  rfidStatus: "AKTIF" | "NONAKTIF";
  iplStatus: "LUNAS" | "BELUM_BAYAR";
  joinedDate: string;
}

// Data Database Warga Mekar Indah (Blok A s/d Blok J)
const INITIAL_RESIDENTS: Resident[] = [
  // BLOK A
  {
    id: "RES-A08",
    name: "Saluniza",
    nik: "3275012308910001",
    email: "saluniza66@gmail.com",
    phone: "0812-9876-5432",
    block: "A",
    unit: "A-08",
    address: "Perumahan Mekar Indah, Blok A No. 08",
    status: "TETAP",
    occupantsCount: 4,
    vehicles: [
      { type: "Mobil", plate: "B 6700 UAS", model: "Jaguar XF" },
      { type: "Mobil", plate: "B 1966 HMJ", model: "Toyota Innova Zenix" },
      { type: "Mobil", plate: "B 3456 FGH", model: "Innova Reborn" },
      { type: "Mobil", plate: "B 1243 GTH", model: "Jaguar F-Pace" },
    ],
    rfid: "RFID-MI-A08-01",
    rfidStatus: "AKTIF",
    iplStatus: "LUNAS",
    joinedDate: "2021-03-15",
  },
  {
    id: "RES-A01",
    name: "Budi Santoso",
    nik: "3275011102850002",
    email: "budi.santoso@gmail.com",
    phone: "0813-1122-3344",
    block: "A",
    unit: "A-01",
    address: "Perumahan Mekar Indah, Blok A No. 01",
    status: "PENGURUS",
    occupantsCount: 3,
    vehicles: [
      { type: "Mobil", plate: "B 1234 BCD", model: "Honda CR-V" },
      { type: "Motor", plate: "B 6789 XYZ", model: "Yamaha NMAX" },
    ],
    rfid: "RFID-MI-A01-01",
    rfidStatus: "AKTIF",
    iplStatus: "LUNAS",
    joinedDate: "2019-01-10",
  },
  {
    id: "RES-A05",
    name: "Dr. Hendra Wijaya",
    nik: "3275011504880003",
    email: "hendra.wijaya@gmail.com",
    phone: "0811-2233-4455",
    block: "A",
    unit: "A-05",
    address: "Perumahan Mekar Indah, Blok A No. 05",
    status: "TETAP",
    occupantsCount: 5,
    vehicles: [
      { type: "Mobil", plate: "B 8888 DOC", model: "Mercedes-Benz C200" },
    ],
    rfid: "RFID-MI-A05-01",
    rfidStatus: "AKTIF",
    iplStatus: "LUNAS",
    joinedDate: "2020-07-22",
  },
  {
    id: "RES-A12",
    name: "Siti Rahmawati",
    nik: "3275012809920004",
    email: "siti.rahma@yahoo.com",
    phone: "0856-7788-9900",
    block: "A",
    unit: "A-12",
    address: "Perumahan Mekar Indah, Blok A No. 12",
    status: "KONTRAK",
    occupantsCount: 2,
    vehicles: [
      { type: "Mobil", plate: "B 2345 SRA", model: "Toyota Yaris" },
      { type: "Motor", plate: "B 4567 KLA", model: "Honda Vario" },
    ],
    rfid: "RFID-MI-A12-01",
    rfidStatus: "AKTIF",
    iplStatus: "LUNAS",
    joinedDate: "2023-01-05",
  },

  // BLOK B
  {
    id: "RES-B03",
    name: "Ahmad Fauzi",
    nik: "3275011203870005",
    email: "ahmad.fauzi@gmail.com",
    phone: "0812-3344-5566",
    block: "B",
    unit: "B-03",
    address: "Perumahan Mekar Indah, Blok B No. 03",
    status: "TETAP",
    occupantsCount: 4,
    vehicles: [
      { type: "Mobil", plate: "B 1999 FAZ", model: "Mitsubishi Pajero Sport" },
    ],
    rfid: "RFID-MI-B03-01",
    rfidStatus: "AKTIF",
    iplStatus: "LUNAS",
    joinedDate: "2020-11-12",
  },
  {
    id: "RES-B10",
    name: "Bambang Pamungkas",
    nik: "3275011006830010",
    email: "bambang.p@gmail.com",
    phone: "0813-8899-7766",
    block: "B",
    unit: "B-10",
    address: "Perumahan Mekar Indah, Blok B No. 10",
    status: "TETAP",
    occupantsCount: 3,
    vehicles: [
      { type: "Mobil", plate: "B 2002 BP", model: "Toyota Fortuner" },
    ],
    rfid: "RFID-MI-B10-01",
    rfidStatus: "AKTIF",
    iplStatus: "LUNAS",
    joinedDate: "2021-04-10",
  },

  // BLOK C
  {
    id: "RES-C07",
    name: "Rina Kusuma",
    nik: "3275014506940006",
    email: "rina.kusuma@gmail.com",
    phone: "0878-1122-8899",
    block: "C",
    unit: "C-07",
    address: "Perumahan Mekar Indah, Blok C No. 07",
    status: "TETAP",
    occupantsCount: 3,
    vehicles: [
      { type: "Mobil", plate: "B 2468 RNK", model: "Honda HR-V" },
    ],
    rfid: "RFID-MI-C07-01",
    rfidStatus: "AKTIF",
    iplStatus: "BELUM_BAYAR",
    joinedDate: "2021-08-19",
  },

  // BLOK D
  {
    id: "RES-D02",
    name: "Dedi Supardi",
    nik: "3275013004820007",
    email: "dedi.supardi@gmail.com",
    phone: "0818-4455-6677",
    block: "D",
    unit: "D-02",
    address: "Perumahan Mekar Indah, Blok D No. 02",
    status: "TETAP",
    occupantsCount: 4,
    vehicles: [
      { type: "Mobil", plate: "B 4411 DED", model: "Hyundai Creta" },
    ],
    rfid: "RFID-MI-D02-01",
    rfidStatus: "AKTIF",
    iplStatus: "LUNAS",
    joinedDate: "2022-02-14",
  },

  // BLOK E
  {
    id: "RES-E04",
    name: "Eko Prasetyo",
    nik: "3275011905890008",
    email: "eko.prasetyo@gmail.com",
    phone: "0819-3322-1100",
    block: "E",
    unit: "E-04",
    address: "Perumahan Mekar Indah, Blok E No. 04",
    status: "KONTRAK",
    occupantsCount: 2,
    vehicles: [
      { type: "Mobil", plate: "B 5500 EKO", model: "Suzuki XL7" },
    ],
    rfid: "RFID-MI-E04-01",
    rfidStatus: "AKTIF",
    iplStatus: "LUNAS",
    joinedDate: "2023-05-20",
  },

  // BLOK F s/d J
  {
    id: "RES-F01",
    name: "Farhan Maulana",
    nik: "3275012501900009",
    email: "farhan.m@gmail.com",
    phone: "0821-9988-7711",
    block: "F",
    unit: "F-01",
    address: "Perumahan Mekar Indah, Blok F No. 01",
    status: "TETAP",
    occupantsCount: 3,
    vehicles: [{ type: "Mobil", plate: "B 6100 FRH", model: "Mazda CX-5" }],
    rfid: "RFID-MI-F01-01",
    rfidStatus: "AKTIF",
    iplStatus: "LUNAS",
    joinedDate: "2022-09-01",
  },
  {
    id: "RES-G09",
    name: "Gunawan Santoso",
    nik: "3275011808800010",
    email: "gunawan.s@gmail.com",
    phone: "0812-7766-5544",
    block: "G",
    unit: "G-09",
    address: "Perumahan Mekar Indah, Blok G No. 09",
    status: "TETAP",
    occupantsCount: 5,
    vehicles: [{ type: "Mobil", plate: "B 7009 GNW", model: "Toyota Alphard" }],
    rfid: "RFID-MI-G09-01",
    rfidStatus: "AKTIF",
    iplStatus: "LUNAS",
    joinedDate: "2018-11-20",
  },
  {
    id: "RES-H03",
    name: "Hadi Purnomo",
    nik: "3275010507860011",
    email: "hadi.purnomo@gmail.com",
    phone: "0857-1133-5577",
    block: "H",
    unit: "H-03",
    address: "Perumahan Mekar Indah, Blok H No. 03",
    status: "TETAP",
    occupantsCount: 4,
    vehicles: [{ type: "Mobil", plate: "B 8303 HAD", model: "Wuling Almaz" }],
    rfid: "RFID-MI-H03-01",
    rfidStatus: "AKTIF",
    iplStatus: "LUNAS",
    joinedDate: "2021-06-18",
  },
  {
    id: "RES-I06",
    name: "Indra Wijaya",
    nik: "3275011211910012",
    email: "indra.w@gmail.com",
    phone: "0813-4466-8800",
    block: "I",
    unit: "I-06",
    address: "Perumahan Mekar Indah, Blok I No. 06",
    status: "KONTRAK",
    occupantsCount: 2,
    vehicles: [{ type: "Mobil", plate: "B 9600 IND", model: "Honda City Hatchback" }],
    rfid: "RFID-MI-I06-01",
    rfidStatus: "AKTIF",
    iplStatus: "LUNAS",
    joinedDate: "2023-08-11",
  },
  {
    id: "RES-J05",
    name: "Joko Susilo",
    nik: "3275010903840013",
    email: "joko.susilo@gmail.com",
    phone: "0812-6655-4433",
    block: "J",
    unit: "J-05",
    address: "Perumahan Mekar Indah, Blok J No. 05",
    status: "TETAP",
    occupantsCount: 4,
    vehicles: [{ type: "Mobil", plate: "B 1005 JOK", model: "Mitsubishi Xpander" }],
    rfid: "RFID-MI-J05-01",
    rfidStatus: "AKTIF",
    iplStatus: "LUNAS",
    joinedDate: "2020-03-01",
  },
];

const BLOCKS = [
  "Semua Blok",
  "Blok A",
  "Blok B",
  "Blok C",
  "Blok D",
  "Blok E",
  "Blok F",
  "Blok G",
  "Blok H",
  "Blok I",
  "Blok J",
];

// Helper: Bersihkan dan ambil huruf Blok dari tombol filter
function getTargetBlock(selected: string): string {
  if (!selected || selected === "ALL" || selected.toLowerCase().includes("semua")) {
    return "";
  }
  // Hapus kata 'blok' terlebih dahulu agar tidak salah mendeteksi huruf 'B'
  return selected.replace(/blok/gi, "").trim().toUpperCase();
}

// Helper: Bersihkan dan ambil huruf Blok dari objek warga
function extractResidentBlock(resident: Resident): string {
  if (resident.block) {
    return resident.block.replace(/blok/gi, "").trim().toUpperCase();
  }
  if (resident.unit) {
    const cleaned = resident.unit.replace(/blok/gi, "").trim().toUpperCase();
    return cleaned.charAt(0);
  }
  return "";
}

export default function ResidentsAdminPage() {
  const [residents, setResidents] = useState<Resident[]>(INITIAL_RESIDENTS);
  const [selectedBlock, setSelectedBlock] = useState<string>("Semua Blok");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form Tambah Warga
  const [formData, setFormData] = useState({
    name: "",
    nik: "",
    email: "",
    phone: "",
    block: "A",
    unitNumber: "",
    status: "TETAP" as "TETAP" | "KONTRAK" | "PENGURUS",
    occupantsCount: 1,
    rfid: "",
  });

  // Filter Data Presisi
  const filteredResidents = useMemo(() => {
    const targetBlock = getTargetBlock(selectedBlock);

    return residents.filter((r) => {
      // 1. Filter Blok
      if (targetBlock) {
        const resBlock = extractResidentBlock(r);
        if (resBlock !== targetBlock) {
          return false;
        }
      }

      // 2. Filter Status Hunian
      if (statusFilter !== "ALL" && r.status !== statusFilter) {
        return false;
      }

      // 3. Filter Pencarian
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.name.toLowerCase().includes(q);
        const matchEmail = r.email.toLowerCase().includes(q);
        const matchPhone = r.phone.toLowerCase().includes(q);
        const matchUnit = r.unit.toLowerCase().includes(q);
        const matchNik = r.nik.toLowerCase().includes(q);
        const matchVehicle = r.vehicles.some(
          (v) =>
            v.plate.toLowerCase().includes(q) ||
            v.model.toLowerCase().includes(q)
        );
        const matchRfid = r.rfid.toLowerCase().includes(q);

        if (
          !matchName &&
          !matchEmail &&
          !matchPhone &&
          !matchUnit &&
          !matchNik &&
          !matchVehicle &&
          !matchRfid
        ) {
          return false;
        }
      }

      return true;
    });
  }, [residents, selectedBlock, statusFilter, searchQuery]);

  // Statistik Cepat
  const stats = useMemo(() => {
    return {
      total: residents.length,
      tetap: residents.filter((r) => r.status === "TETAP" || r.status === "PENGURUS").length,
      kontrak: residents.filter((r) => r.status === "KONTRAK").length,
      rfidAktif: residents.filter((r) => r.rfidStatus === "AKTIF").length,
    };
  }, [residents]);

  // Handle Tambah Warga
  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.unitNumber) return;

    const unitFormatted = `${formData.block.toUpperCase()}-${formData.unitNumber.padStart(2, "0")}`;
    const newResident: Resident = {
      id: `RES-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      nik: formData.nik || "3275" + Math.floor(100000000000 + Math.random() * 900000000000),
      email: formData.email,
      phone: formData.phone,
      block: formData.block.toUpperCase(),
      unit: unitFormatted,
      address: `Perumahan Mekar Indah, Blok ${formData.block.toUpperCase()} No. ${formData.unitNumber}`,
      status: formData.status,
      occupantsCount: Number(formData.occupantsCount) || 1,
      vehicles: [],
      rfid: formData.rfid || `RFID-MI-${unitFormatted}-01`,
      rfidStatus: "AKTIF",
      iplStatus: "LUNAS",
      joinedDate: new Date().toISOString().split("T")[0],
    };

    setResidents([newResident, ...residents]);
    setIsAddModalOpen(false);
    setFormData({
      name: "",
      nik: "",
      email: "",
      phone: "",
      block: "A",
      unitNumber: "",
      status: "TETAP",
      occupantsCount: 1,
      rfid: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <Shield className="w-4 h-4" />
              Sistem Manajemen Kawasan
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-500" />
              Data Warga & Hunian
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Kelola database warga, hak akses RFID gate, dan kepemilikan unit Perumahan Mekar Indah.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-900/30 transition-all active:scale-95 text-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Warga Baru
            </button>
          </div>
        </div>

        {/* Statistik Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Warga Terdata</p>
              <p className="text-2xl font-bold text-white mt-0.5">{stats.total} <span className="text-xs text-slate-500 font-normal">KK</span></p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Warga Tetap</p>
              <p className="text-2xl font-bold text-white mt-0.5">{stats.tetap} <span className="text-xs text-slate-500 font-normal">Unit</span></p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Warga Kontrak</p>
              <p className="text-2xl font-bold text-white mt-0.5">{stats.kontrak} <span className="text-xs text-slate-500 font-normal">Unit</span></p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Kartu RFID Aktif</p>
              <p className="text-2xl font-bold text-white mt-0.5">{stats.rfidAktif} <span className="text-xs text-slate-500 font-normal">Kartu</span></p>
            </div>
          </div>
        </div>

        {/* Filter Tombol Blok A - J */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              Filter Blok Perumahan
            </label>
            <span className="text-xs text-slate-500">
              Menampilkan {filteredResidents.length} dari {residents.length} warga
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {BLOCKS.map((blockName) => {
              const isSelected = selectedBlock === blockName;
              const target = getTargetBlock(blockName);
              const count = target
                ? residents.filter((r) => extractResidentBlock(r) === target).length
                : residents.length;

              return (
                <button
                  key={blockName}
                  onClick={() => setSelectedBlock(blockName)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold"
                      : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  {blockName}
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-slate-950/20 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bar Pencarian & Filter Status */}
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, NIK, plat kendaraan (cth: Saluniza / A-08)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="ALL">Semua Status Hunian</option>
              <option value="TETAP">Warga Tetap</option>
              <option value="KONTRAK">Warga Kontrak</option>
              <option value="PENGURUS">Pengurus RT/RW</option>
            </select>
          </div>
        </div>

        {/* Tabel Warga */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Warga / NIK</th>
                  <th className="py-3.5 px-4">Unit & Blok</th>
                  <th className="py-3.5 px-4">Kontak</th>
                  <th className="py-3.5 px-4">Status Hunian</th>
                  <th className="py-3.5 px-4">Kendaraan Terdaftar</th>
                  <th className="py-3.5 px-4">RFID Gate</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredResidents.length > 0 ? (
                  filteredResidents.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Nama & NIK */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                            {r.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                              {r.name}
                            </p>
                            <p className="text-[11px] text-slate-400">NIK: {r.nik}</p>
                          </div>
                        </div>
                      </td>

                      {/* Unit & Blok */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-bold font-mono">
                          <Home className="w-3 h-3 text-slate-400" />
                          Blok {r.unit}
                        </span>
                      </td>

                      {/* Kontak */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{r.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span className="truncate max-w-[140px]">{r.email}</span>
                        </div>
                      </td>

                      {/* Status Hunian */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === "PENGURUS"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : r.status === "TETAP"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {r.status === "PENGURUS" ? "Pengurus RT/RW" : r.status === "TETAP" ? "Warga Tetap" : "Warga Kontrak"}
                        </span>
                      </td>

                      {/* Kendaraan */}
                      <td className="py-3.5 px-4">
                        {r.vehicles.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {r.vehicles.slice(0, 2).map((v, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1.5 text-[11px] text-slate-300"
                              >
                                <Car className="w-3 h-3 text-slate-500" />
                                <span className="font-mono font-semibold text-emerald-300">
                                  {v.plate}
                                </span>
                                <span className="text-slate-500 text-[10px]">
                                  ({v.model})
                                </span>
                              </div>
                            ))}
                            {r.vehicles.length > 2 && (
                              <span className="text-[10px] text-slate-400 italic">
                                +{r.vehicles.length - 2} kendaraan lainnya
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">
                            Belum ada
                          </span>
                        )}
                      </td>

                      {/* RFID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="font-mono text-slate-300 text-[11px]">
                            {r.rfid}
                          </span>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedResident(r)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <AlertCircle className="w-8 h-8 text-slate-600" />
                        <p className="text-sm font-medium text-slate-300">
                          Tidak ada warga ditemukan di {selectedBlock}
                        </p>
                        <button
                          onClick={() => {
                            setSelectedBlock("Semua Blok");
                            setSearchQuery("");
                            setStatusFilter("ALL");
                          }}
                          className="mt-2 text-xs text-emerald-400 hover:underline"
                        >
                          Tampilkan Semua Warga
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Detail Warga */}
      {selectedResident && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xl flex items-center justify-center">
                  {selectedResident.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedResident.name}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-normal border border-emerald-500/20">
                      {selectedResident.status}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">NIK: {selectedResident.nik}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResident(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/50"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Informasi Hunian</p>
                <p className="text-white font-medium text-sm">Blok {selectedResident.unit}</p>
                <p className="text-slate-400">{selectedResident.address}</p>
                <p className="text-slate-400">Jumlah Penghuni: <span className="text-white font-semibold">{selectedResident.occupantsCount} Orang</span></p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Kontak & Akses</p>
                <p className="text-slate-300">No. WhatsApp: <span className="text-white font-semibold">{selectedResident.phone}</span></p>
                <p className="text-slate-300">Email: <span className="text-white font-semibold">{selectedResident.email}</span></p>
                <p className="text-slate-300">No. RFID Gate: <span className="text-emerald-400 font-mono font-semibold">{selectedResident.rfid}</span></p>
              </div>
            </div>

            {/* Daftar Kendaraan */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-emerald-400" />
                Kendaraan Terdaftar Warga ({selectedResident.vehicles.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedResident.vehicles.map((v, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-emerald-400 text-sm">{v.plate}</p>
                      <p className="text-[11px] text-slate-400">{v.model}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {v.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedResident(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Warga */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Tambah Warga & Unit Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddResident} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Nama Lengkap Sesuai KTP</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Saluniza"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Pilih Blok</label>
                  <select
                    value={formData.block}
                    onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map((b) => (
                      <option key={b} value={b}>
                        Blok {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Nomor Unit / Rumah</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 08"
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="warga@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Status Hunian</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="TETAP">Warga Tetap</option>
                    <option value="KONTRAK">Warga Kontrak</option>
                    <option value="PENGURUS">Pengurus RT/RW</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Jumlah Anggota Keluarga</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.occupantsCount}
                    onChange={(e) => setFormData({ ...formData, occupantsCount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs shadow-lg shadow-emerald-900/30"
                >
                  Simpan Warga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}