"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  UserPlus, 
  FileEdit, 
  Trash2 
} from "lucide-react";

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const maxPages = 20; // Sesuai permintaan (max 1000 warga)

  useEffect(() => {
    fetchResidents();
  }, [currentPage]);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      // Kita panggil API dengan parameter limit dan offset
      const response = await fetch(`/api/residents?page=${currentPage}&limit=${itemsPerPage}`);
      const data = await response.json();
      setResidents(data);
    } catch (error) {
      console.error("Gagal mengambil data warga:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter client-side untuk pencarian nama/blok
  const filteredResidents = residents.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.block?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Warga</h1>
          <p className="text-gray-500">Total warga terdaftar di sistem</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-fit">
          <UserPlus size={20} />
          Tambah Warga
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari nama atau blok rumah..." 
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
              <tr className="bg-gray-50 border-bottom">
                <th className="p-4 font-semibold text-gray-600 text-sm">Nama</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Blok</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">No. HP</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Memuat data...</td>
                </tr>
              ) : filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Data tidak ditemukan</td>
                </tr>
              ) : (
                filteredResidents.map((warga: any) => (
                  <tr key={warga.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-800">{warga.name}</td>
                    <td className="p-4 text-sm text-gray-600">{warga.block}</td>
                    <td className="p-4 text-sm text-gray-600">{warga.phone}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Aktif</span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><FileEdit size={16}/></button>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Halaman <span className="font-semibold text-gray-800">{currentPage}</span> dari <span className="font-semibold text-gray-800">{maxPages}</span>
          </p>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className={`p-2 rounded-md border ${currentPage === 1 ? 'text-gray-300 bg-gray-100' : 'text-gray-600 bg-white hover:bg-gray-100'}`}
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="hidden sm:flex items-center gap-1">
              {[...Array(5)].map((_, i) => {
                // Logika menampilkan 5 nomor halaman terdekat
                let pageNum = currentPage;
                if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= maxPages - 2) pageNum = maxPages - 4 + i;
                else pageNum = currentPage - 2 + i;

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
              className={`p-2 rounded-md border ${currentPage === maxPages ? 'text-gray-300 bg-gray-100' : 'text-gray-600 bg-white hover:bg-gray-100'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}