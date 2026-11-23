import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const residentId = searchParams.get("residentId") || "";
    const email = searchParams.get("email") || "";
    const unit = searchParams.get("unit") || "";
    
    const sql = neon(process.env.DATABASE_URL!);

    // Query cerdas: Mencari kendaraan yang terikat ke ID, Email, atau Unit yang sama
    const data = await sql`
      SELECT v.* FROM vehicles v
      LEFT JOIN residents r ON v.resident_id = r.id OR v.resident_id = r.email
      WHERE v.resident_id = ${residentId}
         OR v.resident_id = ${email}
         OR v.resident_id = ${unit}
         OR r.email = ${email}
         OR r.unit = ${unit}
      ORDER BY v.created_at DESC
    `;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, data: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { residentId, plate, type, brand, color } = body;
    const sql = neon(process.env.DATABASE_URL!);

    const id = `veh-${Date.now()}`;
    await sql`
      INSERT INTO vehicles (id, resident_id, plate, type, brand, color)
      VALUES (${id}, ${residentId}, ${plate.toUpperCase().trim()}, ${type}, ${brand || '-'}, ${color || '-'})
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
    return NextResponse.json({ success: true, message: "OK" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}