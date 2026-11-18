import { db } from "@/db";
import { financeTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const decoded = decodeURIComponent(id);
  const body = (await req.json().catch(() => ({}))) as {
    type?: "income" | "expense"; category?: string; amount?: number; description?: string;
  };
  const update: Record<string, unknown> = {};
  if (body.type === "income" || body.type === "expense") update.type = body.type;
  if (typeof body.category === "string") update.category = body.category;
  if (typeof body.amount === "number") update.amount = String(body.amount);
  if (typeof body.description === "string") update.description = body.description;
  await db.update(financeTransactions).set(update).where(eq(financeTransactions.id, decoded));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const decoded = decodeURIComponent(id);
  await db.delete(financeTransactions).where(eq(financeTransactions.id, decoded));
  return NextResponse.json({ ok: true });
}
