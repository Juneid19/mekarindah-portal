import { db } from "@/db";
import { documents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_STATUS = ["pending", "processing", "ready", "completed"] as const;
type DocStatus = (typeof VALID_STATUS)[number];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: string };
  if (!body.status || !VALID_STATUS.includes(body.status as DocStatus)) {
    return NextResponse.json({ message: "Status tidak valid" }, { status: 400 });
  }

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.residentId, user.id)))
    .limit(1);

  if (!doc) return NextResponse.json({ message: "Not found" }, { status: 404 });

  await db.update(documents).set({ status: body.status as DocStatus }).where(eq(documents.id, id));
  return NextResponse.json({ ok: true, status: body.status });
}
