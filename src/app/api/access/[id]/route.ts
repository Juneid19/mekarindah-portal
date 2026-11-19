// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { accessCards } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { active?: boolean };
  if (typeof body.active !== "boolean") {
    return NextResponse.json({ message: "Field active (boolean) wajib diisi" }, { status: 400 });
  }

  const [card] = await db
    .select()
    .from(accessCards)
    .where(and(eq(accessCards.id, id), eq(accessCards.residentId, user.id)))
    .limit(1);

  if (!card) return NextResponse.json({ message: "Not found" }, { status: 404 });

  await db.update(accessCards).set({ active: body.active }).where(eq(accessCards.id, id));
  return NextResponse.json({ ok: true, active: body.active });
}
