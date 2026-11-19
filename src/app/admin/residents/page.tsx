"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  UserPlus, 
  FileEdit, 
  Trash2,
  Users
} from "lucide-react";

interface Resident {
  id: string | number;
  name?: string;
  block?: string;
  unit?: string;
  phone?: string;
  email?: string;
  role?: string;
}

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // State Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 50;
  const maxPages = 20;

  useEffect(() => {
    fetchResidents();
  }, [currentPage]);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/residents?page=${currentPage}&limit=${itemsPerPage}`);
      if (response.ok) {
        const data = await response.json();
        setResidents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Gagal mengambil data warga:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter client-side untuk pencarian nama/blok/unit
  const filteredResidents = residents.filter((r: Resident) => 
    (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.block || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.unit || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" /> Data Warga Mekar Indah
          </h1>
          <p className="text-sm text-gray-500">Daftar warga terdaftar dan status hunian</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-fit text-sm font-medium">
          <UserPlus size={18} />
          Tambah Warga
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-3 rounded-xl shadow-sm border flex items-center gap-3">
        <Search className="text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Cari nama, nomor unit, atau blok rumah..." 
          className="flex-1 outline-none text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3.5 font-semibold text-gray-600 text-sm">Nama Warga</th>
                <th className="p-3.5 font-semibold text-gray-600 text-sm">Blok / Unit</th>
                <th className="p-3.5 font-semibold text-gray-600 text-sm">No. HP</th>
                <th className="p-3.5 font-semibold text-gray-600 text-sm">Status</th>
                <th className="p-3.5 font-semibold text-gray-600 text-sm text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Memuat data warga...</td>
                </tr>
              ) : filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Data warga tidak ditemukan</td>
                </tr>
              ) : (
                filteredResidents.map((warga: Resident) => (
                  <tr key={String(warga.id)} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3.5 text-sm font-medium text-gray-800">{warga.name || "-"}</td>
                    <td className="p-3.5 text-sm text-gray-600">{warga.block || warga.unit || "-"}</td>
                    <td className="p-3.5 text-sm text-gray-600">{warga.phone || "-"}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Aktif
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex justify-center gap-2">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                          <FileEdit size={16}/>
                        </button>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Halaman <span className="font-semibold text-gray-800">{currentPage}</span> dari <span className="font-semibold text-gray-800">{maxPages}</span>
          </p>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className={`p-2 rounded-md border ${currentPage === 1 ? 'text-gray-300 bg-gray-100 cursor-not-allowed' : 'text-gray-600 bg-white hover:bg-gray-100'}`}
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="hidden sm:flex items-center gap-1">
              {[...Array(5)].map((_, i) => {
                let pageNum = currentPage;
                if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= maxPages - 2) pageNum = maxPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                if (pageNum < 1 || pageNum > maxPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === pageNum 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, maxPages))}
              disabled={currentPage === maxPages || loading}
              className={`p-2 rounded-md border ${currentPage === maxPages ? 'text-gray-300 bg-gray-100 cursor-not-allowed' : 'text-gray-600 bg-white hover:bg-gray-100'}`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}