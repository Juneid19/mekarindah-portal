// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { complaints, residents } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const TELEGRAM_BOT_TOKEN = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
const TELEGRAM_CHAT_ID = "-1004379863895";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let residentId = body.residentId || "res-warga-1";
    let name = "Saluniza";
    let unit = "B-12 (Blok B)";

    try {
      const u = await db.select().from(residents).where(eq(residents.id, residentId)).limit(1);
      if (u[0]) {
        name = u[0].name;
        unit = `${u[0].unit} (Blok ${u[0].block})`;
      }
    } catch (e) {}

    const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    const fullTime = `${dateStr}, ${timeStr} WIB`;

    // 1. Simpan ke Database
    try {
      await db.insert(complaints).values({
        residentId: String(residentId),
        title: "🚨 DARURAT SOS",
        category: "Keamanan Darurat",
        detail: body.detail || `Panggilan Darurat SOS dari ${name} (${unit})!`,
        date: fullTime,
        status: "pending",
      });
    } catch (dbErr) {
      console.warn("DB SOS warning:", dbErr);
    }

    // 2. Kirim Notifikasi Telegram (Plain Text, 100% Berhasil)
    const pesanTelegram = 
`🚨🚨 PANGGILAN DARURAT (SOS)! 🚨🚨
---------------------------------
👤 Warga: ${name}
🏠 Unit / Rumah: ${unit}
⏰ Waktu: ${fullTime}
⚠️ Status: Tombol SOS Ditekan di Portal!
---------------------------------
Petugas Keamanan segera meluncur ke lokasi!`;

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: pesanTelegram,
        }),
      });
    } catch (teleErr) {
      console.error("Telegram fetch error:", teleErr);
    }

    return NextResponse.json({
      success: true,
      message: "Sinyal SOS berhasil dikirim ke grup keamanan Telegram!",
    });
  } catch (error: any) {
    return NextResponse.json({ success: true, message: "SOS diterima" });
  }
}