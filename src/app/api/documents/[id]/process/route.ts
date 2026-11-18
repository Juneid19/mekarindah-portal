import { db } from "@/db";
import { documents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const nextStatus: Record<string, "processing" | "ready" | "completed"> = {
  pending: "processing",
  processing: "ready",
  ready: "completed",
};

export async function POST(_request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const [existing] = await db.select().from(documents).where(and(eq(documents.id, id), eq(documents.residentId, user.id))).limit(1);
  if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const next = nextStatus[existing.status];
  if (!next) return NextResponse.json({ message: "Sudah selesai" }, { status: 400 });
  await db.update(documents).set({ status: next }).where(eq(documents.id, id));
  return NextResponse.json({ ok: true, status: next });
}
