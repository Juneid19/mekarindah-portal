export const dynamic = "force-dynamic"; // Memastikan data selalu segar, bukan dari cache
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

async function setupPropertiesTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      resident_id TEXT,
      block TEXT,
      unit_number TEXT,
      status TEXT DEFAULT 'Milik Pribadi (Tetap)',
      surface_area TEXT DEFAULT '90',
      building_area TEXT DEFAULT '60',
      electricity TEXT DEFAULT '2.200 VA',
      ipl_amount NUMERIC DEFAULT 150000,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  // Pastikan kolom-kolom penting ada
  try {
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS resident_id TEXT;`;
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS block TEXT;`;
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS unit_number TEXT;`;
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS status TEXT;`;
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS surface_area TEXT;`;
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS building_area TEXT;`;
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS electricity TEXT;`;
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS ipl_amount NUMERIC;`;
  } catch (e) {
    // Abaikan jika kolom sudah ada
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const residentId = searchParams.get("residentId") || "";
    const email = searchParams.get("email") || "";
    const unit = searchParams.get("unit") || "";
    const sql = neon(process.env.DATABASE_URL!);

    await setupPropertiesTable(sql);

    // Ambil data properti yang cocok dengan residentId, email, atau unit
    let data;
    if (residentId || email || unit) {
      data = await sql`
        SELECT * FROM properties 
        WHERE resident_id = ${residentId} 
           OR resident_id = ${email}
           OR resident_id = 'res-warga-1'
           OR unit_number = ${unit}
        ORDER BY created_at DESC
      `;
    } else {
      data = await sql`SELECT * FROM properties ORDER BY created_at DESC`;
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    console.error("GET Properties Error:", err);
    return NextResponse.json({ success: false, error: err.message, data: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { residentId, email, block, unitNumber, status, surfaceArea, buildingArea, electricity } = body;
    const sql = neon(process.env.DATABASE_URL!);

    await setupPropertiesTable(sql);

    const id = `prop-${Date.now()}`;
    const cleanResidentId = String(residentId || email || "res-warga-1");
    const cleanBlock = String(block || "A");
    const cleanUnit = String(unitNumber || "1");
    const cleanStatus = String(status || "Milik Pribadi (Tetap)");
    const cleanSurface = String(surfaceArea || "90");
    const cleanBuilding = String(buildingArea || "60");
    const cleanElectricity = String(electricity || "2.200 VA");

    await sql`
      INSERT INTO properties (
        id, resident_id, block, unit_number, status, 
        surface_area, building_area, electricity, ipl_amount
      )
      VALUES (
        ${id}, 
        ${cleanResidentId}, 
        ${cleanBlock}, 
        ${cleanUnit}, 
        ${cleanStatus}, 
        ${cleanSurface}, 
        ${cleanBuilding}, 
        ${cleanElectricity},
        150000
      )
    `;

    return NextResponse.json({ success: true, message: "Properti berhasil ditambahkan!" });
  } catch (err: any) {
    console.error("POST Properties Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const sql = neon(process.env.DATABASE_URL!);

    await setupPropertiesTable(sql);
    await sql`DELETE FROM properties WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: "Properti berhasil dihapus" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}