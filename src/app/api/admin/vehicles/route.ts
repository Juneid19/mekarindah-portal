import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "";
    const rid = searchParams.get("residentId") || "";
    const sql = neon(process.env.DATABASE_URL!);

    // Cari kendaraan yang resident_id nya cocok dengan Email atau ID
    const data = await sql`
      SELECT * FROM vehicles 
      WHERE resident_id = ${email} 
         OR resident_id = ${rid}
         OR resident_id = 'saluniza66@gmail.com' -- Pastikan saluniza selalu masuk
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    return NextResponse.json({ success: false, data: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { residentId, email, plate, type, brand, color } = body;
    const sql = neon(process.env.DATABASE_URL!);

    const id = `veh-${Date.now()}`;
    // Admin mengirim residentId (isinya email saluniza)
    const target = residentId || email || "saluniza66@gmail.com";

    await sql`
      INSERT INTO vehicles (id, resident_id, plate, type, brand, color)
      VALUES (${id}, ${target}, ${plate.toUpperCase().trim()}, ${type}, ${brand || '-'}, ${color || '-'})
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
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