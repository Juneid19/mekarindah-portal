import { db } from "@/db";
import { invoices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const decoded = decodeURIComponent(id);
  const body = (await req.json().catch(() => ({}))) as { status?: "paid" | "unpaid" };
  if (body.status !== "paid" && body.status !== "unpaid") {
    return NextResponse.json({ message: "Status tidak valid" }, { status: 400 });
  }
  await db.update(invoices).set({ status: body.status }).where(eq(invoices.id, decoded));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await ctx.params;
  const decoded = decodeURIComponent(id);
  await db.delete(invoices).where(eq(invoices.id, decoded));
  return NextResponse.json({ ok: true });
}
