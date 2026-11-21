// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { complaints, residents } from "@/db/schema";
import { eq } from "drizzle-orm";

const TELEGRAM_BOT_TOKEN = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
const TELEGRAM_CHAT_ID = "-1004379863895";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { residentId, detail, unit } = body;

    // Ambil data warga
    let residentName = "Warga Mekar Indah";
    let residentUnit = unit || "Tidak diketahui";

    if (residentId) {
      try {
        const rows = await db.select().from(residents).where(eq(residents.id, residentId)).limit(1);
        if (rows[0]) {
          residentName = rows[0].name;
          residentUnit = rows[0].unit;
        }
      } catch (e) {
        console.warn("Gagal fetch warga di SOS:", e);
      }
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // 1. Simpan ke database complaints
    try {
      await db.insert(complaints).values({
        residentId: residentId || "res-warga-1",
        title: "🚨 TOMBOL DARURAT (SOS)",
        category: "Keamanan Darurat",
        detail: detail || `Panggilan darurat SOS aktif dari ${residentName} (Unit ${residentUnit})`,
        date: dateStr,
        status: "pending",
      });
    } catch (dbErr) {
      console.error("DB Insert SOS Error:", dbErr);
    }

    // 2. Kirim Notifikasi ke Grup Telegram Satpam
    const telegramMessage = `
🚨🚨 <b>PANGGILAN DARURAT (SOS)!</b> 🚨🚨
━━━━━━━━━━━━━━━━━━
👤 <b>Warga:</b> ${residentName}
🏠 <b>Unit / Rumah:</b> ${residentUnit}
⏰ <b>Waktu:</b> ${dateStr} WIB
⚠️ <b>Keterangan:</b> ${detail || "Warga menekan tombol SOS darurat melalui portal!"}
━━━━━━━━━━━━━━━━━━
<i>Tim Keamanan segera cek lokasi warga tersebut!</i>
    `.trim();

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: "HTML",
        }),
      });
    } catch (teleErr) {
      console.error("Telegram Send Error:", teleErr);
    }

    return NextResponse.json({
      success: true,
      message: "Sinyal darurat SOS telah disebarkan ke tim keamanan!",
    });
  } catch (error: any) {
    console.error("SOS_FATAL_ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}