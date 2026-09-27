import { db } from "@/db";
import { accessCards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const decoded = decodeURIComponent(id);
  const body = (await req.json().catch(() => ({}))) as {
    label?: string; number?: string; holder?: string; active?: boolean;
  };
  const update: Record<string, unknown> = {};
  if (typeof body.label === "string") update.label = body.label;
  if (typeof body.number === "string") update.number = body.number;
  if (typeof body.holder === "string") update.holder = body.holder;
  if (typeof body.active === "boolean") update.active = body.active;
  await db.update(accessCards).set(update).where(eq(accessCards.id, decoded));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const decoded = decodeURIComponent(id);
  await db.delete(accessCards).where(eq(accessCards.id, decoded));
  return NextResponse.json({ ok: true });
}
