import { db } from "@/db";
import { invoices, residents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  await requireAdmin();
  const body = (await req.json().catch(() => ({}))) as {
    unit?: string; month?: string; year?: number; amount?: number;
    description?: string; dueDate?: string;
  };
  if (!body.unit || !body.month || !body.year || !body.amount || !body.dueDate) {
    return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
  }
  const [resident] = await db.select({ id: residents.id }).from(residents).where(eq(residents.unit, body.unit)).limit(1);
  if (!resident) return NextResponse.json({ message: "Unit tidak ditemukan" }, { status: 404 });

  const id = `${resident.id}-ipl-${body.month.toLowerCase()}-${body.year}-${Date.now()}`;
  await db.insert(invoices).values({
    id, residentId: resident.id, month: body.month, year: body.year,
    amount: String(body.amount), description: body.description ?? "IPL",
    status: "unpaid", dueDate: body.dueDate,
  });
  return NextResponse.json({ ok: true, id });
}
