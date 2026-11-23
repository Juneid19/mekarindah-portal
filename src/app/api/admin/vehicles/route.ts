import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rid = searchParams.get("residentId") || "";
    const sql = neon(process.env.DATABASE_URL!);

    // 1. Pastikan Tabel & Kolom Benar (Anti Error 500)
    await sql`CREATE TABLE IF NOT EXISTS vehicles (id TEXT PRIMARY KEY, resident_id TEXT, plate TEXT, type TEXT, brand TEXT, color TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;
    try { await sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS resident_id TEXT;`; } catch(e){}

    // 2. Ambil Data (Cari berdasarkan ID res-warga-1)
    const data = await sql`
      SELECT * FROM vehicles 
      WHERE resident_id = ${rid} 
         OR resident_id = 'res-warga-1' 
      ORDER BY id DESC
    `;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { residentId, plate, type, brand, color } = body;
    const sql = neon(process.env.DATABASE_URL!);

    const id = `veh-${Date.now()}`;
    // Pastikan kita pakai ID yang dikirim Admin (res-warga-1)
    const target = residentId || "res-warga-1";

    await sql`
      INSERT INTO vehicles (id, resident_id, plate, type, brand, color)
      VALUES (${id}, ${target}, ${plate.toUpperCase()}, ${type}, ${brand || '-'}, ${color || '-'})
    `;

    return NextResponse.json({ success: true });
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