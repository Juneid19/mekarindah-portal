// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { residents } from "@/db/schema";
import { sql } from "drizzle-orm";
import { hashPassword } from "@/lib/auth"; // Menggunakan fungsi hash asli aplikasi

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Bersihkan tabel (Hapus data lama agar tidak duplikat)
    await db.execute(sql`DELETE FROM "sessions"`);
    await db.execute(sql`DELETE FROM "residents"`);

    // 2. Siapkan password yang ter-enkripsi
    // Kita buat password admin: adminmekarindah
    // Kita buat password warga: mekarindah123
    const adminHash = hashPassword("adminmekarindah");
    const residentHash = hashPassword("mekarindah123");

    // 3. Masukkan Admin
    await db.insert(residents).values({
      id: "res-admin",
      name: "Administrator RW",
      email: "admin@mekarindah.com",
      passwordHash: adminHash,
      role: "admin",
      unit: "Kantor",
      block: "A1",
    });

    // 4. Masukkan Warga Contoh
    await db.insert(residents).values({
      id: "res-warga-1",
      name: "Saluniza",
      email: "saluniza66@gmail.com",
      passwordHash: residentHash,
      role: "resident",
      unit: "B-12",
      block: "B",
    });

    return NextResponse.json({
      success: true,
      message: "Akun Admin & Warga berhasil diperbarui dengan password ter-enkripsi.",
      login_info: "Coba login lagi sekarang."
    });
  } catch (error: any) {
    console.error("SEED_ENCRYPT_ERROR:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}