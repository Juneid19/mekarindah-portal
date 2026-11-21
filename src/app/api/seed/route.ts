// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { residents, invoices, vehicles, accessCards, documents, complaints } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Membuat seluruh tabel database Neon...");

    // 1. Buat Tabel Complaints (Aduan & SOS)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "complaints" (
        "id" serial PRIMARY KEY,
        "resident_id" text NOT NULL,
        "title" text NOT NULL,
        "category" text NOT NULL,
        "detail" text NOT NULL,
        "date" text NOT NULL,
        "status" text NOT NULL DEFAULT 'pending',
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 2. Buat Tabel Documents (Surat / Dokumen)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "documents" (
        "id" serial PRIMARY KEY,
        "resident_id" text NOT NULL,
        "type" text NOT NULL,
        "status" text NOT NULL DEFAULT 'Diproses',
        "submitted" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 3. Buat Tabel Invoices (Tagihan IPL Warga)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "invoices" (
        "id" text PRIMARY KEY,
        "resident_id" text NOT NULL,
        "month" text NOT NULL,
        "year" integer NOT NULL,
        "amount" integer NOT NULL,
        "description" text NOT NULL,
        "status" text NOT NULL DEFAULT 'unpaid',
        "due_date" text NOT NULL,
        "paid_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 4. Buat Tabel Vehicles (Kendaraan Warga)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "vehicles" (
        "id" text PRIMARY KEY,
        "resident_id" text NOT NULL,
        "plate" text NOT NULL,
        "type" text NOT NULL,
        "brand" text,
        "color" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 5. Buat Tabel Access Cards (RFID)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "access_cards" (
        "id" text PRIMARY KEY,
        "resident_id" text NOT NULL,
        "label" text NOT NULL,
        "number" text NOT NULL,
        "active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 6. Buat Tabel Finance Transactions (Kas RW)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "finance_transactions" (
        "id" serial PRIMARY KEY,
        "type" text NOT NULL,
        "category" text NOT NULL,
        "amount" integer NOT NULL,
        "description" text NOT NULL,
        "date" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 7. Masukkan Data Awal untuk Warga Saluniza jika belum ada
    const residentId = "res-warga-1";

    // Isi Tagihan IPL (Bulan ini & bulan lalu)
    await db.execute(sql`
      INSERT INTO "invoices" ("id", "resident_id", "month", "year", "amount", "description", "status", "due_date")
      VALUES 
        ('inv-2025-03', ${residentId}, 'Maret', 2025, 150000, 'Iuran Pengelolaan Lingkungan (IPL) & Keamanan', 'unpaid', '10 Maret 2025'),
        ('inv-2025-02', ${residentId}, 'Februari', 2025, 150000, 'Iuran Pengelolaan Lingkungan (IPL) & Keamanan', 'paid', '10 Februari 2025')
      ON CONFLICT ("id") DO NOTHING;
    `);

    // Isi Kendaraan Warga
    await db.execute(sql`
      INSERT INTO "vehicles" ("id", "resident_id", "plate", "type", "brand", "color")
      VALUES 
        ('veh-1', ${residentId}, 'B 1234 MKR', 'Mobil', 'Honda HR-V', 'Putih'),
        ('veh-2', ${residentId}, 'B 5678 SIK', 'Motor', 'Yamaha NMAX', 'Hitam')
      ON CONFLICT ("id") DO NOTHING;
    `);

    // Isi Kartu Akses RFID
    await db.execute(sql`
      INSERT INTO "access_cards" ("id", "resident_id", "label", "number", "active")
      VALUES 
        ('card-1', ${residentId}, 'Kartu Utama (Mobil)', 'RFID-99021', true),
        ('card-2', ${residentId}, 'Kartu Tambahan (Motor)', 'RFID-99022', true)
      ON CONFLICT ("id") DO NOTHING;
    `);

    return NextResponse.json({
      success: true,
      message: "SELURUH TABEL & DATA AWAL BERHASIL DIBUAT!",
      details: {
        tables: ["complaints", "documents", "invoices", "vehicles", "access_cards", "finance"],
        user_seeded: "saluniza66@gmail.com (IPL, Kendaraan, dan Kartu sudah terisi)",
      }
    });
  } catch (error: any) {
    console.error("SEED_ALL_ERROR:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}