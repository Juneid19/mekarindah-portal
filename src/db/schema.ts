import { 
  pgTable, 
  serial, 
  text, 
  integer, 
  timestamp, 
  date, 
  numeric, 
  boolean, 
  jsonb 
} from "drizzle-orm/pg-core";

// --- 1. TABEL RESIDENTS ---
export const residents = pgTable("residents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  unit: text("unit"),
  block: text("block"),
  role: text("role").default("resident"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = residents;

// --- 2. TABEL SESSIONS ---
export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  residentId: text("resident_id").references(() => residents.id).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// --- 3. TABEL COMPLAINTS ---
export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  residentId: text("resident_id").references(() => residents.id),
  title: text("title").notNull(),
  category: text("category").notNull(),
  detail: text("detail").notNull(),
  date: date("date").notNull(),
  status: text("status").default("pending"),
});

// --- 4. TABEL DOCUMENTS ---
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  residentId: text("resident_id").references(() => residents.id),
  type: text("type").notNull(),
  status: text("status").default("pending"),
  submitted: text("submitted"),
});

// --- 5. TABEL ACCESS CARDS ---
export const accessCards = pgTable("access_cards", {
  id: text("id").primaryKey(),
  residentId: text("resident_id").references(() => residents.id),
  label: text("label").notNull(),
  number: text("number").notNull(),
  active: boolean("active").default(true),
});

// --- 6. TABEL GATE EVENTS (Riwayat Buka Gate) ---
export const gateEvents = pgTable("gate_events", {
  id: text("id").primaryKey(),
  residentId: text("resident_id").references(() => residents.id),
  direction: text("direction").default("in"),
  method: text("method").default("remote"),
  note: text("note"),
  triggeredAt: timestamp("triggered_at").defaultNow(), // <--- Tambahkan kolom ini
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

//// --- 7. TABEL INVOICES (Tagihan IPL) ---
export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(), // Menggunakan text string ID
  residentId: text("resident_id").references(() => residents.id),
  month: text("month").notNull(),
  year: text("year").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  status: text("status").default("unpaid"),
  dueDate: date("due_date"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const iplBills = invoices;

// --- 8. TABEL SECURITY CODES (Kode Tamu / Registrasi Warga) ---
export const securityCodes = pgTable("security_codes", {
  id: serial("id").primaryKey(),
  residentId: text("resident_id").references(() => residents.id),
  unit: text("unit"),
  code: text("code").notNull(),
  assignedTo: text("assigned_to"), // <--- Tambahkan kolom ini
  validUntil: timestamp("valid_until"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- 9. TABEL VEHICLES ---
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  residentId: text("resident_id").references(() => residents.id),
  plateNumber: text("plate_number").notNull(),
  type: text("type").default("Mobil"),
  brand: text("brand"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- 10. TABEL FINANCE TRANSACTIONS ---
export const financeTransactions = pgTable("finance_transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- 11. TABEL FINANCE SUMMARY ---
export const financeSummary = pgTable("finance_summary", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ResidentRole = "admin" | "resident";