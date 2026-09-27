import { db } from "@/db";
import { accessCards, residents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  await requireAdmin();
  const body = (await req.json().catch(() => ({}))) as {
    unit?: string; label?: string; number?: string; holder?: string;
  };
  if (!body.unit || !body.label || !body.number) {
    return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
  }
  const [resident] = await db.select({ id: residents.id, name: residents.name }).from(residents).where(eq(residents.unit, body.unit)).limit(1);
  if (!resident) return NextResponse.json({ message: "Unit tidak ditemukan" }, { status: 404 });

  const id = `${resident.id}-card-${Date.now()}`;
  await db.insert(accessCards).values({
    id, residentId: resident.id, label: body.label, number: body.number,
    holder: body.holder ?? resident.name, active: true,
  });
  return NextResponse.json({ ok: true, id });
}
