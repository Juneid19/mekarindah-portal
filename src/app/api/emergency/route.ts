import { db } from "@/db";
import { residents } from "@/db/schema";
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

export async function POST(request: Request) {
  let kind = "SOS";
  let detail = "";
  try {
    const body = await request.json();
    kind = body.kind || "SOS";
    detail = body.detail || "";
  } catch {}

  let nama = "Warga";
  let unit = "-";
  let blok = "-";
  let telepon = "-";

  try {
    const user = await getCurrentUser();
    if (user) {
      nama = user.name || nama;
      unit = user.unit || unit;
      const [w] = await db.select().from(residents).where(eq(residents.id, user.id)).limit(1);
      if (w) {
        nama = w.name || nama;
        unit = w.unit || unit;
        blok = w.block || blok;
        telepon = w.phone || telepon;
      }
    }
  } catch {}

  const now = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  const emoji = kind === "Kebakaran" ? "🔥" : kind === "Pencurian" ? "🚨" : "🆘";

  const message = [
    `${emoji} <b>ALERT DARURAT: ${kind.toUpperCase()}</b>`,
    ``,
    `👤 <b>Nama:</b> ${nama}`,
    `🏠 <b>Unit:</b> ${unit}`,
    `📍 <b>Blok:</b> ${blok}`,
    `📞 <b>Telepon:</b> ${telepon}`,
    detail ? `📝 <b>Detail:</b> ${detail}` : "",
    ``,
    `⏰ ${now}`,
    ``,
    `⚠️ <b>SEGERA CEK LOKASI & HUBUNGI WARGA!</b>`,
  ].filter(Boolean).join("\n");

  await sendTelegram(message);

  return new NextResponse(JSON.stringify({ ok: true, kind }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
