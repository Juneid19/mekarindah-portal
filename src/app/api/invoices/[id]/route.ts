import { db } from "@/db";
import { invoices } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_STATUS = ["paid", "unpaid"] as const;
type InvStatus = (typeof VALID_STATUS)[number];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: string };
  if (!body.status || !VALID_STATUS.includes(body.status as InvStatus)) {
    return NextResponse.json({ message: "Status tidak valid" }, { status: 400 });
  }

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.residentId, user.id)))
    .limit(1);

  if (!invoice) return NextResponse.json({ message: "Not found" }, { status: 404 });

  await db.update(invoices).set({ status: body.status as InvStatus }).where(eq(invoices.id, id));
  return NextResponse.json({ ok: true, status: body.status });
}
