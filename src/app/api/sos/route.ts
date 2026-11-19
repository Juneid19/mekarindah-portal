// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { complaints, users } from "@/db/schema";
import { eq } from "drizzle-orm";

const BOT_TOKEN = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
const CHAT_ID = "-1004379863895";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { residentId, note } = body;

    const todayDate = new Date().toISOString().split("T")[0];

    // 1. Ambil data warga penekan SOS (gunakan String)
    let residentName = "Warga";
    let residentBlock = "-";
    let residentPhone = "-";

    if (residentId) {
      const r = await db
        .select()
        .from(users)
        .where(eq(users.id, String(residentId)))
        .limit(1);

      if (r.length > 0) {
        residentName = r[0].name;
        residentBlock = r[0].block || r[0].unit || "-";
        residentPhone = r[0].phone || "-";
      }
    }

    // 2. Simpan insiden SOS ke tabel complaints (residentId disimpan sebagai string)
    if (residentId) {
      await db.insert(complaints).values({
        residentId: String(residentId),
        title: "🚨 TOMBOL DARURAT SOS DIPICU",
        category: "Keamanan",
        detail: note || "Warga memicu tombol darurat SOS dari aplikasi!",
        date: todayDate,
        status: "urgent",
      });
    }

    // 3. Kirim Alert Telegram Prioritas Tinggi ke Pos Satpam
    const sosMessage = `
🚨🚨🚨 <b>PERINGATAN DARURAT (SOS)!</b> 🚨🚨🚨
━━━━━━━━━━━━━━━━━━━━
Warga menekan Tombol Darurat dari aplikasi Portal!

👤 <b>Nama:</b> ${residentName}
🏠 <b>Blok / Unit:</b> ${residentBlock}
📞 <b>No HP:</b> ${residentPhone}
⏰ <b>Waktu:</b> ${new Date().toLocaleTimeString("id-ID")} WIB
📅 <b>Tanggal:</b> ${todayDate}
📝 <b>Keterangan:</b> ${note || "Butuh bantuan mendesak!"}
━━━━━━━━━━━━━━━━━━━━
⚠️ <b>PETUGAS KEAMANAN / PENGURUS HARAP SEGERA CEK LOKASI!</b>
    `.trim();

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: sosMessage,
        parse_mode: "HTML",
      }),
    });

    return NextResponse.json({ success: true, message: "Peringatan SOS berhasil disebarkan" });
  } catch (error) {
    console.error("Gagal trigger SOS:", error);
    return NextResponse.json({ error: "Gagal mengirim sinyal SOS" }, { status: 500 });
  }
}