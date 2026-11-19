// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { accessCards, residents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const BOT_TOKEN = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
const CHAT_ID = "-1004379863895";

// ==========================================
// 1. GET: Ambil Daftar Semua Kartu RFID
// ==========================================
export async function GET() {
  try {
    const list = await db
      .select({
        id: accessCards.id,
        residentId: accessCards.residentId,
        label: accessCards.label,
        number: accessCards.number,
        active: accessCards.active,
        holder: residents.name,
        unit: residents.unit,
      })
      .from(accessCards)
      .leftJoin(residents, eq(accessCards.residentId, residents.id))
      .orderBy(desc(accessCards.id));

    const formatted = list.map((c) => ({
      id: String(c.id),
      residentId: c.residentId || "",
      label: c.label || "Kartu Warga Utama",
      number: c.number || "-",
      holder: c.holder ? `${c.holder} (${c.unit || "-"})` : "Belum Terdaftar",
      active: Boolean(c.active),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Gagal mengambil daftar kartu:", error);
    return NextResponse.json([]);
  }
}

// ==========================================
// 2. POST: Tambah Kartu RFID Baru & Kirim Telegram
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { residentId, number, label } = body;

    if (!number || !residentId) {
      return NextResponse.json({ error: "Nomor kartu dan pemilik wajib diisi" }, { status: 400 });
    }

    const cardNumberClean = String(number).trim().toUpperCase();
    const generatedId = `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 1. Simpan ke Database Neon dengan ID teks unik
    const [newCard] = await db
      .insert(accessCards)
      .values({
        id: generatedId,
        residentId: String(residentId),
        label: label || "Kartu Warga Utama",
        number: cardNumberClean,
        active: true,
      })
      .returning();

    // 2. Ambil Profil Pemilik untuk Pesan Telegram
    const owner = await db
      .select()
      .from(residents)
      .where(eq(residents.id, String(residentId)))
      .limit(1);

    const ownerName = owner[0]?.name || "Warga Mekar Indah";
    const ownerUnit = owner[0]?.unit || "-";

    // 3. Kirim Notifikasi ke Grup Telegram Satpam
    try {
      const telegramMessage = `
💳 <b>REGISTRASI KARTU RFID BARU</b>
━━━━━━━━━━━━━━━━━━━━
🔢 <b>No. Seri RFID:</b> <code>${cardNumberClean}</code>
👤 <b>Pemegang:</b> ${ownerName}
🏠 <b>Unit / Blok:</b> ${ownerUnit}
🏷 <b>Tipe:</b> ${label || "Kartu Warga Utama"}
🟢 <b>Status:</b> AKTIF (Akses Gerbang Diberikan)
━━━━━━━━━━━━━━━━━━━━
<i>Sistem Keamanan Portal Mekar Indah</i>
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
    } catch (teleErr) {
      console.error("Gagal kirim Telegram:", teleErr);
    }

    return NextResponse.json({ success: true, data: newCard });
  } catch (error) {
    console.error("Error pendaftaran kartu:", error);
    return NextResponse.json({ error: "Gagal menyimpan kartu ke database" }, { status: 500 });
  }
}