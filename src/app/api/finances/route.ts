import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_URL tidak disetel" }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Pastikan tabel finance_records tersedia
    await sql`
      CREATE TABLE IF NOT EXISTS finance_records (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL, -- 'income' atau 'expense'
        category TEXT,
        amount NUMERIC NOT NULL,
        description TEXT,
        date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const records = await sql`
      SELECT * FROM finance_records 
      ORDER BY date DESC, id DESC
    `;

    return NextResponse.json(records);
  } catch (error: any) {
    console.error("GET /api/finance error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
