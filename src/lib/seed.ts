import { db } from "@/db";
import {
  accessCards,
  complaints,
  documents,
  financeSummary,
  invoices,
  residents,
  securityCodes,
  sessions,
  vehicles,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

const DEFAULT_PASSWORD = "mekarindah123";
const ADMIN_PASSWORD = "adminmekarindah";

const units = [
  { unit: "A-01", block: "A", name: "Budi Santoso", email: "budi.santoso@email.com", phone: "0812 3456 7890", emergencyName: "Siti Santoso", emergencyPhone: "0813 9876 5432" },
  { unit: "A-02", block: "A", name: "Nadia Putri",   email: "nadia.putri@email.com",  phone: "0817 2244 9031", emergencyName: "Andi Putra",  emergencyPhone: "0821 9988 1122" },
  { unit: "B-03", block: "B", name: "Rangga Wijaya", email: "rangga.wijaya@email.com", phone: "0857 4452 1020", emergencyName: "Lia Wijaya",  emergencyPhone: "0856 3344 7788" },
  { unit: "B-04", block: "B", name: "Fajar Nugraha", email: "fajar.nugraha@email.com", phone: "0821 3388 0712", emergencyName: "Tio Nugraha", emergencyPhone: "0823 2211 5566" },
  { unit: "C-07", block: "C", name: "Agus Pranoto",  email: "agus.pranoto@email.com",  phone: "0811 5566 2233", emergencyName: "Dewi Pranoto",emergencyPhone: "0811 3344 7788" },
  { unit: "D-12", block: "D", name: "Rina Kartika",  email: "rina.kartika@email.com",  phone: "0813 7799 4488", emergencyName: "Doni Kartika",emergencyPhone: "0813 2211 3344" },
];

const sampleInvoices = [
  { month: "Juni",  year: 2026, amount: 350000, status: "unpaid" as const, dueDate: "10 Jun 2026" },
  { month: "Mei",   year: 2026, amount: 350000, status: "paid" as const,   dueDate: "10 Mei 2026" },
  { month: "April", year: 2026, amount: 350000, status: "paid" as const,   dueDate: "10 Apr 2026" },
  { month: "Maret", year: 2026, amount: 350000, status: "paid" as const,   dueDate: "10 Mar 2026" },
];

const financeData = {
  monthly: { income: 87_500_000, expense: 54_275_000, balance: 33_225_000 },
  budgets: [
    { name: "Keamanan & petugas", value: 22_500_000, width: 82, color: "#2563eb" },
    { name: "Kebersihan lingkungan", value: 14_750_000, width: 64, color: "#10b981" },
    { name: "Perawatan fasilitas", value: 10_225_000, width: 47, color: "#f59e0b" },
    { name: "Utilitas & operasional", value: 6_800_000, width: 31, color: "#8b5cf6" },
  ],
  updatedAt: new Date().toISOString(),
};

export async function ensureSeeded() {
  const existing = await db.select({ id: residents.id }).from(residents).limit(1);
  if (existing.length > 0) return;

  for (const u of units) {
    const id = `res-${u.unit.toLowerCase().replace("-", "")}`;
    await db.insert(residents).values({
      id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      unit: u.unit,
      block: u.block,
      emergencyName: u.emergencyName,
      emergencyPhone: u.emergencyPhone,
      passwordHash: hashPassword(DEFAULT_PASSWORD),
      role: "resident",
    }).onConflictDoNothing();

    await db.insert(securityCodes).values({ unit: u.unit, code: "1111", assignedTo: id }).onConflictDoNothing();

    for (const inv of sampleInvoices) {
      await db.insert(invoices).values({
        id: `${id}-ipl-${inv.month.toLowerCase()}`,
        residentId: id,
        month: inv.month,
        year: inv.year,
        amount: String(inv.amount),
        status: inv.status,
        dueDate: inv.dueDate,
      }).onConflictDoNothing();
    }

    await db.insert(vehicles).values([
      { id: `${id}-veh-1`, residentId: id, plate: `B ${1000 + Math.floor(Math.random() * 9000)} KRS`, type: "Mobil", brand: "Toyota Avanza", color: "Putih" },
      { id: `${id}-veh-2`, residentId: id, plate: `B ${5000 + Math.floor(Math.random() * 4000)} UDA`, type: "Motor", brand: "Honda Vario",   color: "Hitam" },
    ]).onConflictDoNothing();

    await db.insert(documents).values([
      { id: `${id}-doc-1`, residentId: id, type: "Surat Pengantar Domisili", submitted: "02 Jun 2026", status: "processing" },
      { id: `${id}-doc-2`, residentId: id, type: "Surat Pengantar SKCK",     submitted: "18 Mei 2026", status: "completed" },
    ]).onConflictDoNothing();

    await db.insert(complaints).values([
      { id: `${id}-cmp-1`, residentId: id, category: "Lingkungan", title: "Lampu jalan Blok A padam", detail: "", date: "03 Jun 2026", status: "Diproses" },
      { id: `${id}-cmp-2`, residentId: id, category: "Fasilitas",  title: "Perbaikan ayunan taman",    detail: "", date: "22 Mei 2026", status: "Selesai"  },
    ]).onConflictDoNothing();

    await db.insert(accessCards).values([
      { id: `${id}-card-1`, residentId: id, label: "Kartu Utama",    number: `RFID •••• ${1000 + Math.floor(Math.random() * 9000)}`, holder: u.name,         active: true  },
      { id: `${id}-card-2`, residentId: id, label: "Kartu Keluarga", number: `RFID •••• ${1000 + Math.floor(Math.random() * 9000)}`, holder: u.emergencyName, active: true },
    ]).onConflictDoNothing();
  }

  await db.insert(residents).values({
    id: "res-admin",
    name: "Admin Mekarindah",
    email: "admin@mekarindah.com",
    phone: "021-555-0147",
    unit: "ADMIN",
    block: "—",
    emergencyName: "Sekretariat",
    emergencyPhone: "021-555-0148",
    passwordHash: hashPassword(ADMIN_PASSWORD),
    role: "admin",
  }).onConflictDoNothing();

  await db.insert(financeSummary).values({
    id: "default",
    data: financeData,
    updatedAt: new Date(),
  }).onConflictDoNothing();
}

export async function findResidentByEmail(email: string) {
  const rows = await db.select().from(residents).where(eq(residents.email, email)).limit(1);
  return rows[0] ?? null;
}

export async function clearAllSessions(residentId: string) {
  await db.delete(sessions).where(eq(sessions.residentId, residentId));
}
