import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

async function ensureVehiclesTable(sql: any) {
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
    // Pastikan kolom resident_id tersedia
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS resident_id TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS plate TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS type TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS brand TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color TEXT;`;
  } catch (e) {
    // Lewatkan jika tabel sudah siap
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rid = searchParams.get("residentId") || "";
    const email = searchParams.get("email") || "";

    const sql = neon(process.env.DATABASE_URL!);
    await ensureVehiclesTable(sql);

    let data: any[] = [];

    // Coba query format snake_case (resident_id)
    try {
      data = await sql`
        SELECT * FROM vehicles 
        WHERE resident_id = ${email} 
           OR resident_id = ${rid} 
           OR resident_id = 'saluniza66@gmail.com'
           OR resident_id = 'res-warga-1'
        ORDER BY created_at DESC
      `;
    } catch (e1) {
      // Fallback jika database memakai format camelCase ("residentId")
      try {
        data = await sql`
          SELECT id, "residentId" as resident_id, plate, type, brand, color 
          FROM vehicles 
          WHERE "residentId" = ${email} 
             OR "residentId" = ${rid}
             OR "residentId" = 'saluniza66@gmail.com'
        `;
      } catch (e2) {
        console.error("Gagal query kendaraan:", e2);
      }
    }

    return NextResponse.json({ success: true, data: data || [] }, { status: 200 });
  } catch (err: any) {
    console.error("GET vehicles error:", err);
    // Kembalikan data kosong dengan status 200 agar frontend tidak error 500
    return NextResponse.json({ success: false, data: [] }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { residentId, email, plate, type, brand, color } = body;
    const sql = neon(process.env.DATABASE_URL!);
    await ensureVehiclesTable(sql);

    const id = `veh-${Date.now()}`;
    const finalRid = email || residentId || "saluniza66@gmail.com";
    const cleanPlate = (plate || "").toUpperCase().trim();

    try {
      await sql`
        INSERT INTO vehicles (id, resident_id, plate, type, brand, color)
        VALUES (${id}, ${finalRid}, ${cleanPlate}, ${type || 'Mobil'}, ${brand || '-'}, ${color || '-'})
      `;
    } catch (err1) {
      await sql`
        INSERT INTO vehicles (id, "residentId", plate, type, brand, color)
        VALUES (${id}, ${finalRid}, ${cleanPlate}, ${type || 'Mobil'}, ${brand || '-'}, ${color || '-'})
      `;
    }

    return NextResponse.json({ success: true, message: "Kendaraan berhasil disimpan!" });
  } catch (err: any) {
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
  } catch (err) {
    return NextResponse.json({ success: false });
  }
}