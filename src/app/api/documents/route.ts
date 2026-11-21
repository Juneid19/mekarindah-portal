// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const TELEGRAM_BOT_TOKEN = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
const TELEGRAM_CHAT_ID = "-1004379863895";

export async function GET() {
  try {
    const list = await db.select().from(documents).orderBy(desc(documents.id));
    return NextResponse.json(list || []);
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const docType = body.type || body.documentType || "Surat Pengantar RW";
    const dateStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const newRecord = {
      id: Date.now(),
      residentId: String(body.residentId || "res-warga-1"),
      type: docType,
      status: "Diproses",
      submitted: dateStr,
    };

    try {
      const res = await db.insert(documents).values(newRecord).returning();
      if (res[0]) newRecord.id = res[0].id;
    } catch (e) {
      console.warn("DB doc warning:", e);
    }

    // Telegram Alert
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `📄 PERMOHONAN DOKUMEN BARU\n-------------------------\n📋 Dokumen: ${docType}\n👤 Pemohon: Saluniza (Unit B-12)\n📅 Tanggal: ${dateStr}\nStatus: Menunggu Persetujuan Pengurus`,
        }),
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: "Permohonan berhasil diajukan!",
      ...newRecord,
      data: newRecord,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message }, { status: 500 });
  }
}