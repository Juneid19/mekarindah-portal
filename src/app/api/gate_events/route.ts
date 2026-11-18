import { db } from "@/db";
import { gateEvents } from "@/db/schema";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const id = `gate-${Date.now()}`;
  await db.insert(gateEvents).values({ id, residentId: user.id });
  return NextResponse.json({ ok: true, id });
}
