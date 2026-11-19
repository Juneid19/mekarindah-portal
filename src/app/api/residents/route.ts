import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 1. Ambil parameter dari URL (contoh: ?page=1&limit=50)
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // 2. Query ke Neon Database
    // Kita filter hanya yang rolenya 'resident'
    const residentsData = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        block: users.block,
        role: users.role,
      })
      .from(users)
      .where(eq(users.role, "resident"))
      .orderBy(asc(users.name)) // Urutkan nama A-Z
      .limit(limit)
      .offset(offset);

    // 3. Kembalikan data dalam format JSON
    return NextResponse.json(residentsData);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data warga" }, 
      { status: 500 }
    );
  }
}