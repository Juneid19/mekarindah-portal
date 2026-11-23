import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

async function ensureVehiclesTable(sql: any) {
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
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const residentId = searchParams.get("residentId");
    const unit = searchParams.get("unit");
    const sql = neon(process.env.DATABASE_URL!);

    await ensureVehiclesTable(sql);

    let data;
    if (residentId && residentId !== "undefined" && residentId !== "") {
      data = await sql`
        SELECT * FROM vehicles 
        WHERE resident_id = ${residentId} 
           OR resident_id IN (SELECT id FROM residents WHERE unit = ${unit || ''})
        ORDER BY created_at DESC
      `;
    } else {
      data = await sql`SELECT * FROM vehicles ORDER BY created_at DESC`;
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { residentId, plate, type, brand, color } = body;
    const sql = neon(process.env.DATABASE_URL!);

    await ensureVehiclesTable(sql);

    const id = `veh-${Date.now()}`;
    await sql`
      INSERT INTO vehicles (id, resident_id, plate, type, brand, color)
      VALUES (${id}, ${residentId || ''}, ${plate.toUpperCase().trim()}, ${type}, ${brand || '-'}, ${color || '-'})
    `;

    return NextResponse.json({ success: true, message: "Kendaraan berhasil didaftarkan!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const sql = neon(process.env.DATABASE_URL!);

    await ensureVehiclesTable(sql);
    await sql`DELETE FROM vehicles WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: "Kendaraan berhasil dihapus" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}