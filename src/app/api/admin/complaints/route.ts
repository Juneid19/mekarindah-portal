import { db } from "@/db";
import { complaints, residents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const rows = await db
    .select({
      id: complaints.id,
      residentId: complaints.residentId,
      category: complaints.category,
      title: complaints.title,
      detail: complaints.detail,
      date: complaints.date,
      status: complaints.status,
      residentName: residents.name,
      unit: residents.unit,
      block: residents.block,
      phone: residents.phone,
    })
    .from(complaints)
    .leftJoin(residents, eq(complaints.residentId, residents.id))
    .orderBy(desc(complaints.id));

  return NextResponse.json(rows);
}
