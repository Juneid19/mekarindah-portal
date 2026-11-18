import { db } from "@/db";
import { gateEvents, residents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const ids = chatId.split(",").map((s) => s.trim());
  for (const id of ids) {
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: id, text, parse_mode: "HTML" }),
      });
    } catch {}
  }
}

export async function POST() {
  let nama = "Warga";
  let unit = "-";
  let blok = "-";
  let residentId = "";

  try {
    const user = await getCurrentUser();
    if (user) {
      residentId = user.id;
      nama = user.name || nama;
      unit = user.unit || unit;
      const [w] = await db.select().from(residents).where(eq(residents.id, user.id)).limit(1);
      if (w) {
        nama = w.name || nama;
        unit = w.unit || unit;
        blok = w.block || blok;
      }
    }
  } catch {}

  if (residentId) {
    try {
      const id = `gate-${Date.now()}`;
      await db.insert(gateEvents).values({ id, residentId });
    } catch {}
  }

  const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  const message = [
    `🚪 <b>AKSES GERBANG DIBUKA</b>`,
    ``,
    `👤 <b>Nama:</b> ${nama}`,
    `🏠 <b>Unit:</b> ${unit}`,
    `📍 <b>Blok:</b> ${blok}`,
    ``,
    `⏰ ${now}`,
  ].join("\n");

  await sendTelegram(message);

  return new NextResponse(JSON.stringify({ ok: true, message: "Gerbang dibuka" }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
