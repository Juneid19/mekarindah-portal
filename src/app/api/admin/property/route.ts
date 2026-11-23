import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Fungsi pembuat tabel otomatis
async function ensurePropertiesTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      resident_id TEXT,
      block TEXT NOT NULL,
      unit_number TEXT NOT NULL,
      status TEXT DEFAULT 'Milik Pribadi (Tetap)',
      surface_area NUMERIC DEFAULT 90,
      building_area NUMERIC DEFAULT 60,
      electricity TEXT DEFAULT '2.200 VA',
      ipl_amount NUMERIC DEFAULT 150000,
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

    await ensurePropertiesTable(sql);

    let data;
    if (residentId && residentId !== "undefined" && residentId !== "") {
      data = await sql`
        SELECT * FROM properties 
        WHERE resident_id = ${residentId} 
           OR unit_number = ${unit || ''}
        ORDER BY created_at DESC
      `;
    } else {
      data = await sql`SELECT * FROM properties ORDER BY created_at DESC`;
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("GET Properties Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { residentId, block, unitNumber, status, surfaceArea, buildingArea, electricity } = body;
    const sql = neon(process.env.DATABASE_URL!);

    // Pastikan tabel ada
    await ensurePropertiesTable(sql);

    const id = `prop-${Date.now()}`;
    const numSurface = parseFloat(surfaceArea) || 90;
    const numBuilding = parseFloat(buildingArea) || 60;

    await sql`
      INSERT INTO properties (
        id, resident_id, block, unit_number, status, 
        surface_area, building_area, electricity, ipl_amount
      )
      VALUES (
        ${id}, 
        ${residentId || ''}, 
        ${block || 'A'}, 
        ${unitNumber || ''}, 
        ${status || 'Milik Pribadi (Tetap)'}, 
        ${numSurface}, 
        ${numBuilding}, 
        ${electricity || '2.200 VA'},
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

    await ensurePropertiesTable(sql);
    await sql`DELETE FROM properties WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: "Properti berhasil dihapus" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}