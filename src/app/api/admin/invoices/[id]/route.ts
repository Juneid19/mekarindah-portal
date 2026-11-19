// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const decoded = decodeURIComponent(id);
    const body = await request.json();

    if (!body.status || !["paid", "unpaid"].includes(body.status)) {
      return NextResponse.json({ message: "Status tidak valid" }, { status: 400 });
    }

    await db
      .update(invoices)
      .set({ 
        status: body.status,
        paidAt: body.status === "paid" ? new Date() : null 
      })
      .where(eq(invoices.id, Number(decoded)));

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Gagal update tagihan IPL:", error);
    return NextResponse.json({ message: error.message || "Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const decoded = decodeURIComponent(id);

    await db
      .delete(invoices)
      .where(eq(invoices.id, Number(decoded)));

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Gagal hapus tagihan IPL:", error);
    return NextResponse.json({ message: error.message || "Error" }, { status: 500 });
  }
}