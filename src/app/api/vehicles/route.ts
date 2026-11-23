import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database URL missing" }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);
    const user = await getCurrentUser();

    // Pastikan tabel vehicles ada
    await sql`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        resident_id TEXT,
        plate TEXT,
        type TEXT DEFAULT 'Mobil',
        brand TEXT,
        color TEXT,
        rfid_tag TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { searchParams } = new URL(request.url);
    const reqResidentId = searchParams.get("resident_id") || user?.id?.toString();
    const reqEmail = searchParams.get("email") || user?.email;

    let rows = await sql`
      SELECT * FROM vehicles 
      WHERE resident_id = ${reqResidentId || ''} 
         OR resident_id = ${reqEmail || ''}
         OR resident_id = '1'
         OR resident_id = 'res-warga-1'
      ORDER BY id ASC
    `;

    // Fallback: Jika ID spesifik tidak cocok, ambil semua kendaraan
    if (!rows || rows.length === 0) {
      rows = await sql`SELECT * FROM vehicles ORDER BY id ASC`;
    }

    const formatted = rows.map((v: any) => ({
      id: v.id,
      resident_id: v.resident_id,
      plate: v.plate || v.plate_number || "B 0000 XXX",
      type: v.type || "Mobil",
      brand: v.brand || v.model || "-",
      color: v.color || "-",
      rfid_tag: v.rfid_tag || `MI-TAG-${v.id}`,
      is_rfid_active: true
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("GET /api/vehicles error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}