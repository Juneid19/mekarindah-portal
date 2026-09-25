import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { type?: string };
  if (!body.type) return NextResponse.json({ message: "Jenis dokumen wajib diisi" }, { status: 400 });
  const id = `doc-${Date.now()}`;
  const submitted = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  await db.insert(documents).values({ id, residentId: user.id, type: body.type, submitted, status: "pending" });
  return NextResponse.json({ id });
}

void eq;
