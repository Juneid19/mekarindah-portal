import { db } from "@/db";
import { portalStates } from "@/db/schema";
import { initialPortalState, type PortalState } from "@/lib/portal-data";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const STATE_ID = "demo-community";

export async function GET() {
  const [existing] = await db
    .select()
    .from(portalStates)
    .where(eq(portalStates.id, STATE_ID))
    .limit(1);

  if (existing) return NextResponse.json(existing.data);

  const [created] = await db
    .insert(portalStates)
    .values({ id: STATE_ID, data: initialPortalState })
    .onConflictDoNothing()
    .returning();

  if (created) return NextResponse.json(created.data);

  const [fallback] = await db
    .select()
    .from(portalStates)
    .where(eq(portalStates.id, STATE_ID))
    .limit(1);

  return NextResponse.json(fallback?.data ?? initialPortalState);
}

export async function PUT(request: Request) {
  const data = (await request.json()) as PortalState;
  if (!data?.profile || !Array.isArray(data.invoices)) {
    return NextResponse.json({ message: "Data portal tidak valid" }, { status: 400 });
  }

  const [saved] = await db
    .insert(portalStates)
    .values({ id: STATE_ID, data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: portalStates.id,
      set: { data, updatedAt: new Date() },
    })
    .returning();

  return NextResponse.json(saved.data);
}
