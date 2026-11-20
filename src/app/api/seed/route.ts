// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Memulai Pembersihan Tabel...");

    // 1. HAPUS TABEL LAMA (Agar bersih dari struktur lama yang salah)
    await db.execute(sql`DROP TABLE IF EXISTS "sessions" CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS "residents" CASCADE;`);

    // 2. BUAT ULANG TABEL RESIDENTS DENGAN KOLOM LENGKAP
    await db.execute(sql`
      CREATE TABLE "residents" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "password_hash" text,
        "phone" text,
        "unit" text NOT NULL,
        "block" text NOT NULL,
        "role" text NOT NULL DEFAULT 'resident',
        "emergency_name" text,
        "emergency_phone" text,
        "avatar" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 3. BUAT ULANG TABEL SESSIONS
    await db.execute(sql`
      CREATE TABLE "sessions" (
        "token" text PRIMARY KEY,
        "resident_id" text NOT NULL,
        "expires_at" timestamp NOT NULL
      );
    `);

    // 4. ISI ULANG DATA (Admin & Warga)
    await ensureSeeded();

    return NextResponse.json({
      success: true,
      message: "DATABASE BERHASIL DIRESET & DIISI ULANG!",
      note: "Sekarang tabel residents sudah punya kolom emergency_name dan avatar."
    });
  } catch (error: any) {
    console.error("RESET_ERROR:", error);
    return NextResponse.json({
      success: false,
      message: "Gagal reset database.",
      error: error?.message || String(error)
    }, { status: 500 });
  }
}