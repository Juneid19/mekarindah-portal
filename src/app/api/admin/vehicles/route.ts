import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

 export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rid = searchParams.get("residentId") || "res-warga-1";
    const sql = neon(process.env.DATABASE_URL!);

    const data = await sql`
      SELECT * FROM vehicles 
      WHERE resident_id = ${rid} 
         OR resident_id = 'res-warga-1'
      ORDER BY id DESC
    `;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    return NextResponse.json({ success: false, data: [] });
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
      VALUES (${id}, ${residentId}, ${plate.toUpperCase()}, ${type}, ${brand || '-'}, ${color || '-'})
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}