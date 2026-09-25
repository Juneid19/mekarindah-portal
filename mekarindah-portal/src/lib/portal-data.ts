export type Invoice = {
  id: string;
  month: string;
  year: number;
  amount: number;
  status: "paid" | "unpaid";
  dueDate: string;
};

export type Vehicle = {
  id: string;
  plate: string;
  type: "Mobil" | "Motor";
  brand: string;
  color: string;
};

export type DocumentRequest = {
  id: string;
  type: string;
  submitted: string;
  status: "pending" | "processing" | "ready" | "completed";
};

export type Complaint = {
  id: string;
  category: string;
  title: string;
  date: string;
  status: "Diterima" | "Diproses" | "Selesai";
};

export type AccessCard = {
  id: string;
  label: string;
  number: string;
  holder: string;
  active: boolean;
};

export type PortalState = {
  profile: {
    name: string;
    email: string;
    phone: string;
    unit: string;
    emergencyName: string;
    emergencyPhone: string;
  };
  property: {
    block: string;
    type: string;
    landArea: number;
    buildingArea: number;
    ownership: string;
    moveIn: string;
  };
  invoices: Invoice[];
  vehicles: Vehicle[];
  documents: DocumentRequest[];
  complaints: Complaint[];
  accessCards: AccessCard[];
  gateOpenedAt?: string;
};

export const initialPortalState: PortalState = {
  profile: {
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    phone: "0812 3456 7890",
    unit: "A-01",
    emergencyName: "Siti Santoso",
    emergencyPhone: "0813 9876 5432",
  },
  property: {
    block: "A-01",
    type: "Tipe Asri 72/120",
    landArea: 120,
    buildingArea: 72,
    ownership: "Hak Milik",
    moveIn: "12 Agustus 2022",
  },
  invoices: [
    { id: "ipl-1", month: "Juni", year: 2026, amount: 350000, status: "unpaid", dueDate: "10 Jun 2026" },
    { id: "ipl-2", month: "Mei", year: 2026, amount: 350000, status: "paid", dueDate: "10 Mei 2026" },
    { id: "ipl-3", month: "April", year: 2026, amount: 350000, status: "paid", dueDate: "10 Apr 2026" },
    { id: "ipl-4", month: "Maret", year: 2026, amount: 350000, status: "paid", dueDate: "10 Mar 2026" },
  ],
  vehicles: [
    { id: "veh-1", plate: "B 1234 KRS", type: "Mobil", brand: "Toyota Avanza", color: "Putih" },
    { id: "veh-2", plate: "B 5678 UDA", type: "Motor", brand: "Honda Vario", color: "Hitam" },
  ],
  documents: [
    { id: "doc-1", type: "Surat Pengantar Domisili", submitted: "02 Jun 2026", status: "processing" },
    { id: "doc-2", type: "Surat Pengantar SKCK", submitted: "18 Mei 2026", status: "completed" },
  ],
  complaints: [
    { id: "cmp-1", category: "Lingkungan", title: "Lampu jalan Blok A padam", date: "03 Jun 2026", status: "Diproses" },
    { id: "cmp-2", category: "Fasilitas", title: "Perbaikan ayunan taman", date: "22 Mei 2026", status: "Selesai" },
  ],
  accessCards: [
    { id: "card-1", label: "Kartu Utama", number: "RFID •••• 4821", holder: "Budi Santoso", active: true },
    { id: "card-2", label: "Kartu Keluarga", number: "RFID •••• 7734", holder: "Siti Santoso", active: true },
  ],
};
