// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { financeTransactions } from "@/db/schema";
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

    const update: any = {};
    if (typeof body.type === "string") update.type = body.type;
    if (typeof body.category === "string") update.category = body.category;
    if (typeof body.amount === "number" || typeof body.amount === "string") {
      update.amount = String(body.amount);
    }
    if (typeof body.description === "string") update.description = body.description;
    if (typeof body.date === "string") update.date = body.date;

    await db
      .update(financeTransactions)
      .set(update)
      .where(eq(financeTransactions.id, Number(decoded)));

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Gagal update transaksi:", error);
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
      .delete(financeTransactions)
      .where(eq(financeTransactions.id, Number(decoded)));

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Gagal hapus transaksi:", error);
    return NextResponse.json({ message: error.message || "Error" }, { status: 500 });
  }
}