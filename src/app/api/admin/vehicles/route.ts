import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

async function setupVehiclesTable(sql: any) {
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
  try {
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS resident_id TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS plate TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS type TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS brand TEXT;`;
    await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color TEXT;`;
  } catch (e) {}
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const residentId = searchParams.get("residentId") || "";
    const email = searchParams.get("email") || "";
    const sql = neon(process.env.DATABASE_URL!);

    await setupVehiclesTable(sql);

    let data;
    if (residentId || email) {
      data = await sql`
        SELECT * FROM vehicles 
        WHERE resident_id = ${residentId} 
           OR resident_id = ${email}
           OR resident_id = 'res-warga-1'
           OR resident_id = '1'
        ORDER BY created_at DESC
      `;
    } else {
      data = await sql`SELECT * FROM vehicles ORDER BY created_at DESC`;
    }

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
    const cleanResidentId = String(residentId || email || "res-warga-1");
    const cleanPlate = String(plate || "").toUpperCase().trim();
    const cleanType = String(type || "Mobil");
    const cleanBrand = String(brand || "-");
    const cleanColor = String(color || "-");

    await sql`
      INSERT INTO vehicles (id, resident_id, plate, type, brand, color)
      VALUES (${id}, ${cleanResidentId}, ${cleanPlate}, ${cleanType}, ${cleanBrand}, ${cleanColor})
    `;

    return NextResponse.json({ success: true, message: "Kendaraan berhasil didaftarkan!" });
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

    await setupVehiclesTable(sql);
    await sql`DELETE FROM vehicles WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: "Kendaraan berhasil dihapus" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}