import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as { plate?: string; type?: "Mobil" | "Motor"; brand?: string; color?: string };
  const updated = await db
    .update(vehicles)
    .set({
      plate: body.plate?.toUpperCase() ?? "",
      type: body.type ?? "Mobil",
      brand: body.brand ?? "",
      color: body.color ?? "",
    })
    .where(and(eq(vehicles.id, id), eq(vehicles.residentId, user.id)))
    .returning();
  if (updated.length === 0) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await db.delete(vehicles).where(and(eq(vehicles.id, id), eq(vehicles.residentId, user.id)));
  return NextResponse.json({ ok: true });
}
