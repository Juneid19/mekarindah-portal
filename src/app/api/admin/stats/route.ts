import { db } from "@/db";
import { residents, invoices, complaints, documents, accessCards } from "@/db/schema";
import { eq, ne, count } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const [warga] = await db.select({ c: count() }).from(residents).where(ne(residents.role, "admin"));
  const [tagihanBelum] = await db.select({ c: count() }).from(invoices).where(ne(invoices.status, "paid"));
  const [tagihanLunas] = await db.select({ c: count() }).from(invoices).where(eq(invoices.status, "paid"));
  const [keluhan] = await db.select({ c: count() }).from(complaints).where(ne(complaints.status, "Selesai"));
  const [dokumen] = await db.select({ c: count() }).from(documents).where(eq(documents.status, "pending"));
  const [kartuAktif] = await db.select({ c: count() }).from(accessCards).where(eq(accessCards.active, true));

  return NextResponse.json({
    warga: warga.c,
    tagihanBelum: tagihanBelum.c,
    tagihanLunas: tagihanLunas.c,
    keluhan: keluhan.c,
    dokumenPending: dokumen.c,
    kartuAktif: kartuAktif.c,
  });
}
