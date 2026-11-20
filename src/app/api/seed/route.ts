// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Memulai proses pembuatan tabel (Force SQL)...");

    // 1. Buat tabel residents secara manual jika belum ada
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "residents" (
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

    // 2. Buat tabel sessions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "token" text PRIMARY KEY,
        "resident_id" text NOT NULL,
        "expires_at" timestamp NOT NULL
      );
    `);

    // 3. Jalankan seed untuk isi data admin & warga
    await ensureSeeded();

    return NextResponse.json({
      success: true,
      message: "Tabel berhasil dibuat dan database berhasil diisi data awal.",
    });
  } catch (error: any) {
    console.error("FORCE_SEED_ERROR:", error);
    return NextResponse.json({
      success: false,
      message: "Gagal membuat tabel atau mengisi data.",
      error: error?.message || String(error)
    }, { status: 500 });
  }
}