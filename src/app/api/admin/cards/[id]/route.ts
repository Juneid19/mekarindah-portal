// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { accessCards, residents } from "@/db/schema";
import { eq } from "drizzle-orm";

const BOT_TOKEN = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
const CHAT_ID = "-1004379863895";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { active } = body;

    // 1. Update status di Neon DB
    await db
      .update(accessCards)
      .set({ active: Boolean(active) })
      .where(eq(accessCards.id, String(id)));

    // 2. Ambil info kartu untuk Telegram
    const cardInfo = await db
      .select({
        number: accessCards.number,
        holder: residents.name,
        unit: residents.unit,
      })
      .from(accessCards)
      .leftJoin(residents, eq(accessCards.residentId, residents.id))
      .where(eq(accessCards.id, String(id)))
      .limit(1);

    const noKartu = cardInfo[0]?.number || id;
    const pemegang = cardInfo[0]?.holder || "Warga";
    const unit = cardInfo[0]?.unit || "-";

    // 3. Kirim Telegram Satpam
    try {
      const statusIcon = active ? "🟢 <b>DIAKTIFKAN KEMBALI</b>" : "🔴 <b>DIBLOKIR / NONAKTIF</b>";
      const telegramMessage = `
⚠️ <b>UPDATE STATUS KARTU RFID</b>
━━━━━━━━━━━━━━━━━━━━
🔢 <b>No. Kartu:</b> <code>${noKartu}</code>
👤 <b>Pemegang:</b> ${pemegang} (Unit ${unit})
📢 <b>Status Baru:</b> ${statusIcon}
━━━━━━━━━━━━━━━━━━━━
<i>Sistem Gerbang Otomatis Mekar Indah</i>
      `.trim();

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: telegramMessage,
          parse_mode: "HTML",
        }),
      });
    } catch (e) {
      console.error("Telegram error:", e);
    }

    return NextResponse.json({ success: true, active: Boolean(active) });
  } catch (error) {
    console.error("Gagal update status kartu:", error);
    return NextResponse.json({ error: "Gagal memperbarui status kartu" }, { status: 500 });
  }
}