import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Fungsi penjamin kolom database (SAMA SEPERTI PROPERTIES)
async function setupVehiclesTable(sql: any) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY,
        resident_id TEXT,
        plate TEXT,
        type TEXT DEFAULT 'Mobil',
        brand TEXT DEFAULT '-',
        color TEXT DEFAULT '-',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    // Tambahkan kolom jika belum ada di tabel lama
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS resident_id TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS plate TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS type TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS brand TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`;
  } catch (e) {
    // Lewatkan jika kolom sudah ada
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rid = searchParams.get("residentId") || "";
    const email = searchParams.get("email") || "";
    const sql = neon(process.env.DATABASE_URL!);

    await setupVehiclesTable(sql);

    // Cari berdasarkan ID "res-warga-1", Email, atau fallback
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
    console.error("GET Vehicles Error:", err);
    return NextResponse.json({ success: false, error: err.message, data: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { residentId, email, plate, type, brand, color } = body;
    const sql = neon(process.env.DATABASE_URL!);

    await setupVehiclesTable(sql);

    const id = `veh-${Date.now()}`;
    // Simpan "res-warga-1" (sama seperti yang dipakai Properties!)
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
    console.error("POST Vehicles Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const sql = neon(process.env.DATABASE_URL!);
    await sql`DELETE FROM vehicles WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}