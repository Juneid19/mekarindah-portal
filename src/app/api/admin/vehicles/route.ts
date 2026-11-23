import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rid = searchParams.get("residentId") || "";
    const email = searchParams.get("email") || "";
    const unit = searchParams.get("unit") || "";

    const sql = neon(process.env.DATABASE_URL!);

    // Pastikan tabel vehicles ada di Neon
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

    // Ambil data kendaraan dari database Neon asli
    let data;
    if (rid || email || unit) {
      data = await sql`
        SELECT * FROM vehicles 
        WHERE resident_id = ${rid} 
           OR resident_id = ${email} 
           OR resident_id = ${unit}
           OR resident_id = 'res-warga-1'
           OR resident_id = '1'
           OR resident_id = 'saluniza66@gmail.com'
        ORDER BY created_at DESC
      `;
    } else {
      data = await sql`SELECT * FROM vehicles ORDER BY created_at DESC`;
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    console.error("GET vehicles error:", err);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { residentId, email, plate, type, brand, color } = body;
    const sql = neon(process.env.DATABASE_URL!);

    const id = `veh-${Date.now()}`;
    const cleanResidentId = email || residentId || "saluniza66@gmail.com";

    await sql`
      INSERT INTO vehicles (id, resident_id, plate, type, brand, color)
      VALUES (${id}, ${cleanResidentId}, ${plate.toUpperCase().trim()}, ${type}, ${brand || '-'}, ${color || '-'})
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

    await sql`DELETE FROM vehicles WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}