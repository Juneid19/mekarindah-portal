
// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { complaints } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    // Pastikan status dicast ke tipe yang diizinkan schema
    const validStatus = body.status as "Diterima" | "Diproses" | "Selesai";

    await db
      .update(complaints)
      .set({ status: validStatus })
      .where(eq(complaints.id, Number(id))); // ID adalah string, jangan di-parseInt

    return NextResponse.json({ ok: true, status: validStatus });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.delete(complaints).where(eq(complaints.id, id));
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
