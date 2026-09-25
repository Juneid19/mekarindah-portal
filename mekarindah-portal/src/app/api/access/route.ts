import { db } from "@/db";
import { accessCards, gateEvents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const id = `gate-${Date.now()}`;
  await db.insert(gateEvents).values({ id, residentId: user.id });
  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { id?: string };
  if (!body.id) return NextResponse.json({ message: "ID kartu wajib diisi" }, { status: 400 });
  const [card] = await db.select().from(accessCards).where(and(eq(accessCards.id, body.id), eq(accessCards.residentId, user.id))).limit(1);
  if (!card) return NextResponse.json({ message: "Not found" }, { status: 404 });
  await db.update(accessCards).set({ active: !card.active }).where(eq(accessCards.id, body.id));
  return NextResponse.json({ ok: true, active: !card.active });
}
