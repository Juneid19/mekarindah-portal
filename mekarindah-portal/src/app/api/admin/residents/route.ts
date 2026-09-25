import { db } from "@/db";
import { residents, invoices, accessCards, vehicles, documents, complaints } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { hashPassword, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();
  const rows = await db.select().from(residents).where(sql`${residents.role} <> 'admin'`);
  return NextResponse.json(rows.map((r) => ({
    id: r.id, name: r.name, email: r.email, unit: r.unit, phone: r.phone, role: r.role, createdAt: r.createdAt,
  })));
}

export async function POST(request: Request) {
  await requireAdmin();
  const body = (await request.json().catch(() => ({}))) as { id?: string };
  if (!body.id) return NextResponse.json({ message: "ID wajib diisi" }, { status: 400 });
  await db.update(residents).set({ passwordHash: hashPassword("mekarindah123") }).where(eq(residents.id, body.id));
  return NextResponse.json({ ok: true });
}

void invoices; void accessCards; void vehicles; void documents; void complaints;
