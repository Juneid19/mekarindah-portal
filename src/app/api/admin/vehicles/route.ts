import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Helper untuk memastikan tabel dan kolom siap
async function setupVehiclesTable(sql: any) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY,
        resident_id TEXT,
        plate TEXT NOT NULL,
        type TEXT NOT NULL,
        brand TEXT,
        color TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS resident_id TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS plate TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS type TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS brand TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color TEXT;`;
  } catch (e) {
    // Lewatkan jika sudah ada
  }
}

// 1. GET: Ambil Kendaraan Warga
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rid = searchParams.get("residentId") || "";
    const email = searchParams.get("email") || "";
    const sql = neon(process.env.DATABASE_URL!);

    await setupVehiclesTable(sql);

    const data = await sql`
      SELECT * FROM vehicles 
      WHERE resident_id = ${rid} 
         OR resident_id = ${email}
         OR resident_id = 'res-warga-1'
         OR resident_id = 'saluniza66@gmail.com'
      ORDER BY id DESC
    `;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    console.error("GET vehicles error:", err);
    return NextResponse.json({ success: false, data: [] });
  }
}

// 2. POST: Tambah Kendaraan Baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { residentId, plate, type, brand, color } = body;
    const sql = neon(process.env.DATABASE_URL!);

    await setupVehiclesTable(sql);

    const id = `veh-${Date.now()}`;
    const targetId = residentId || "res-warga-1";

    await sql`
      INSERT INTO vehicles (id, resident_id, plate, type, brand, color)
      VALUES (
        ${id}, 
        ${targetId}, 
        ${(plate || '').toUpperCase().trim()}, 
        ${type || 'Mobil'}, 
        ${brand || '-'}, 
        ${color || '-'}
      )
    `;

    return NextResponse.json({ success: true, message: "Kendaraan berhasil disimpan!" });
  } catch (err: any) {
    console.error("POST vehicles error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 3. DELETE: INI YANG SEBELUMNYA HILANG (Fungsi Hapus Kendaraan)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID kendaraan tidak ditemukan" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Hapus baris kendaraan dari database Neon
    await sql`DELETE FROM vehicles WHERE id = ${id}`;

    return NextResponse.json({ success: true, message: "Kendaraan berhasil dihapus!" });
  } catch (err: any) {
    console.error("DELETE vehicle error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}