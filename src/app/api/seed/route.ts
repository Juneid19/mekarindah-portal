// @ts-nocheck
import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fungsi ini akan membuat data admin & warga default di database
    await ensureSeeded();

    return NextResponse.json({
      success: true,
      message: "Database Neon berhasil diisi data awal. Silakan login.",
      data: {
        admin: "admin@mekarindah.com",
        resident: "saluniza66@gmail.com"
      }
    });
  } catch (error: any) {
    console.error("SEED_ERROR:", error);
    return NextResponse.json({
      success: false,
      message: "Gagal mengisi data.",
      error: error?.message || String(error)
    }, { status: 500 });
  }
}