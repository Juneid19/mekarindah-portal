import { db } from "@/db";
import { residents, securityCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ unit: string }> }) {
  await requireAdmin();
  const { unit } = await ctx.params;
  const decoded = decodeURIComponent(unit);
  const [resident] = await db.select().from(residents).where(eq(residents.unit, decoded)).limit(1);
  if (!resident) return NextResponse.json({ message: "Unit tidak ditemukan" }, { status: 404 });
  const [code] = await db.select().from(securityCodes).where(eq(securityCodes.unit, decoded)).limit(1);
  return NextResponse.json({
    unit: resident.unit,
    block: resident.block,
    name: resident.name,
    landArea: resident.landArea,
    buildingArea: resident.buildingArea,
    bedrooms: resident.bedrooms,
    securityCode: code?.code ?? "",
  });
}

export async function PUT(req: Request, ctx: { params: Promise<{ unit: string }> }) {
  await requireAdmin();
  const { unit } = await ctx.params;
  const decoded = decodeURIComponent(unit);
  const body = (await req.json().catch(() => ({}))) as {
    landArea?: number | null;
    buildingArea?: number | null;
    bedrooms?: number | null;
    securityCode?: string;
  };

  await db.update(residents).set({
    landArea: body.landArea ?? null,
    buildingArea: body.buildingArea ?? null,
    bedrooms: body.bedrooms ?? null,
  }).where(eq(residents.unit, decoded));

  if (typeof body.securityCode === "string" && /^\d{4}$/.test(body.securityCode)) {
    const existing = await db.select().from(securityCodes).where(eq(securityCodes.unit, decoded)).limit(1);
    if (existing.length > 0) {
      await db.update(securityCodes).set({ code: body.securityCode }).where(eq(securityCodes.unit, decoded));
    } else {
      const [resident] = await db.select({ id: residents.id }).from(residents).where(eq(residents.unit, decoded)).limit(1);
      await db.insert(securityCodes).values({ unit: decoded, code: body.securityCode, assignedTo: resident?.id ?? null });
    }
  }

  return NextResponse.json({ ok: true });
}
