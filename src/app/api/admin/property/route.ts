import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const residentId = searchParams.get("residentId");
    const sql = neon(process.env.DATABASE_URL!);

    // Pastikan tabel properties sudah ada
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

    let data;
    if (residentId) {
      data = await sql`SELECT * FROM properties WHERE resident_id = ${residentId} ORDER BY created_at DESC`;
    } else {
      data = await sql`SELECT * FROM properties ORDER BY created_at DESC`;
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { residentId, block, unitNumber, status, surfaceArea, buildingArea, electricity } = body;
    const sql = neon(process.env.DATABASE_URL!);

    const id = `prop-${Date.now()}`;
    await sql`
      INSERT INTO properties (id, resident_id, block, unit_number, status, surface_area, building_area, electricity)
      VALUES (
        ${id}, 
        ${residentId}, 
        ${block}, 
        ${unitNumber}, 
        ${status || 'Milik Pribadi (Tetap)'}, 
        ${surfaceArea || 90}, 
        ${buildingArea || 60}, 
        ${electricity || '2.200 VA'}
      )
    `;

    return NextResponse.json({ success: true, message: "Properti berhasil ditambahkan!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const sql = neon(process.env.DATABASE_URL!);

    await sql`DELETE FROM properties WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: "Properti berhasil dihapus" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}