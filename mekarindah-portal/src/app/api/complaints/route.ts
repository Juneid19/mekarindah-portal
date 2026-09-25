import { db } from "@/db";
import { complaints, sosEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { category?: string; title?: string; detail?: string };
  if (!body.title) return NextResponse.json({ message: "Judul wajib diisi" }, { status: 400 });
  const id = `cmp-${Date.now()}`;
  const date = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  await db.insert(complaints).values({
    id,
    residentId: user.id,
    category: body.category ?? "Lainnya",
    title: body.title,
    detail: body.detail ?? "",
    date,
    status: "Diterima",
  });
  return NextResponse.json({ id });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { kind?: "Kebakaran" | "Pencurian" };
  if (!body.kind) return NextResponse.json({ message: "Jenis SOS wajib diisi" }, { status: 400 });
  const id = `sos-${Date.now()}`;
  await db.insert(sosEvents).values({ id, residentId: user.id, kind: body.kind });
  return NextResponse.json({ ok: true });
}

void eq;
