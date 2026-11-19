// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { complaints } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Pastikan hanya admin yang bisa mengubah status aduan
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ message: "Status wajib diisi" }, { status: 400 });
    }

    // 2. Update status aduan di database Neon
    // Kita gunakan Number(id) karena id di schema adalah serial (number)
    await db
      .update(complaints)
      .set({ status: status })
      .where(eq(complaints.id, Number(id)));

    return NextResponse.json({ ok: true, status });
  } catch (error: any) {
    console.error("Gagal update aduan:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}