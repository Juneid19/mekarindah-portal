// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { complaints } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const TELEGRAM_BOT_TOKEN = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
const TELEGRAM_CHAT_ID = "-1004379863895";

export async function GET() {
  try {
    const list = await db.select().from(complaints).orderBy(desc(complaints.id));
    return NextResponse.json(list || []);
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { residentId, title, category, detail, date } = body;

    const fullTime = date || new Date().toLocaleString("id-ID");
    const isSOS = title?.includes("SOS") || category?.includes("Darurat");

    const newRecord = {
      id: Date.now(),
      residentId: String(residentId || "res-warga-1"),
      title: title || (isSOS ? "🚨 DARURAT SOS" : "Aduan Warga"),
      category: category || "Umum",
      detail: detail || "Laporan dari warga",
      date: fullTime,
      status: "pending",
    };

    try {
      const res = await db.insert(complaints).values(newRecord).returning();
      if (res[0]) newRecord.id = res[0].id;
    } catch (e) {
      console.warn("DB complaint warning:", e);
    }

    // Kirim Telegram
    const teleText = isSOS
      ? `🚨🚨 PANGGILAN DARURAT (SOS)! 🚨🚨\nUnit: Saluniza (B-12)\nWaktu: ${fullTime}\nPesan: ${detail}`
      : `📢 ADUAN WARGA BARU\n------------------------\n📌 Kategori: ${category || "Umum"}\n📝 Judul: ${title}\n💬 Detail: ${detail}\n⏰ Waktu: ${fullTime}`;

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: teleText,
        }),
      });
    } catch (e) {}

    // Return format ganda agar kompatibel dengan state React
    return NextResponse.json({
      success: true,
      ...newRecord,
      data: newRecord,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message }, { status: 500 });
  }
}