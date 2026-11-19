// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { complaints } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, detail } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (detail) updateData.detail = detail;

    // Gunakan Number(id) agar sesuai tipe kolom serial (angka)
    await db
      .update(complaints)
      .set(updateData)
      .where(eq(complaints.id, Number(id)));

    return NextResponse.json({ success: true, message: "Berhasil diperbarui" });
  } catch (error: any) {
    console.error("Gagal update aduan:", error);
    return NextResponse.json({ error: "Gagal memperbarui aduan" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db
      .delete(complaints)
      .where(eq(complaints.id, Number(id)));

    return NextResponse.json({ success: true, message: "Berhasil dihapus" });
  } catch (error: any) {
    console.error("Gagal menghapus aduan:", error);
    return NextResponse.json({ error: "Gagal menghapus aduan" }, { status: 500 });
  }
}