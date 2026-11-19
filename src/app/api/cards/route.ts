// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { accessCards, residents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

const BOT_TOKEN = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
const CHAT_ID = "-1004379863895";

// ==========================================
// 1. GET: Ambil Semua Kartu Akses (Admin & Warga)
// ==========================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const residentId = searchParams.get("residentId");

    // Jika dipanggil dengan filter residentId (dari portal warga)
    if (residentId) {
      const userCards = await db
        .select()
        .from(accessCards)
        .where(eq(accessCards.residentId, residentId))
        .orderBy(desc(accessCards.id));

      return NextResponse.json(userCards);
    }

    // Default (Admin): Ambil semua kartu beserta data pemiliknya
    const allCards = await db
      .select({
        id: accessCards.id,
        cardNumber: accessCards.cardNumber,
        type: accessCards.type,
        status: accessCards.status,
        createdAt: accessCards.createdAt,
        residentId: accessCards.residentId,
        residentName: residents.name,
        residentUnit: residents.unit,
        residentPhone: residents.phone,
      })
      .from(accessCards)
      .leftJoin(residents, eq(accessCards.residentId, residents.id))
      .orderBy(desc(accessCards.id));

    return NextResponse.json(allCards);
  } catch (error) {
    console.error("Gagal mengambil data kartu akses:", error);
    return NextResponse.json({ error: "Gagal memuat kartu akses" }, { status: 500 });
  }
}

// ==========================================
// 2. POST: Tambah Kartu RFID Baru (Admin)
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { residentId, cardNumber, type } = body;

    if (!cardNumber || !residentId) {
      return NextResponse.json(
        { error: "Nomor kartu dan pemilik wajib diisi" },
        { status: 400 }
      );
    }

    // 1. Simpan ke Database
    const [newCard] = await db
      .insert(accessCards)
      .values({
        residentId: String(residentId),
        cardNumber: cardNumber.trim().toUpperCase(),
        type: type || "Resident",
        status: "active",
      })
      .returning();

    // 2. Ambil data pemilik untuk notifikasi
    const owner = await db
      .select()
      .from(residents)
      .where(eq(residents.id, String(residentId)))
      .limit(1);

    const ownerName = owner[0]?.name || "Warga";
    const ownerUnit = owner[0]?.unit || "-";

    // 3. Notifikasi ke Telegram
    try {
      const msg = `
💳 <b>KARTU RFID BARU TERDAFTAR</b>
━━━━━━━━━━━━━━━━━━━━
🔢 <b>No. Kartu:</b> <code>${cardNumber.trim().toUpperCase()}</code>
👤 <b>Pemilik:</b> ${ownerName} (Unit ${ownerUnit})
🏷 <b>Tipe:</b> ${type || "Resident"}
🟢 <b>Status:</b> Aktif
━━━━━━━━━━━━━━━━━━━━
      `.trim();

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: msg,
          parse_mode: "HTML",
        }),
      });
    } catch (e) {
      console.error("Telegram error:", e);
    }

    return NextResponse.json({ success: true, data: newCard });
  } catch (error) {
    console.error("Gagal mendaftarkan kartu:", error);
    return NextResponse.json({ error: "Gagal menyimpan kartu akses" }, { status: 500 });
  }
}

// ==========================================
// 3. PATCH: Ubah Status Kartu (Aktif / Blokir)
// ==========================================
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { cardId, status } = body;

    if (!cardId || !status) {
      return NextResponse.json({ error: "cardId dan status wajib dikirim" }, { status: 400 });
    }

    await db
      .update(accessCards)
      .set({ status: status })
      .where(eq(accessCards.id, Number(cardId)));

    return NextResponse.json({ success: true, message: `Status kartu berhasil diubah menjadi ${status}` });
  } catch (error) {
    console.error("Gagal update kartu:", error);
    return NextResponse.json({ error: "Gagal memperbarui status kartu" }, { status: 500 });
  }
}

// ==========================================
// 4. DELETE: Hapus Kartu Akses
// ==========================================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("id");

    if (!cardId) {
      return NextResponse.json({ error: "ID kartu wajib disertakan" }, { status: 400 });
    }

    await db.delete(accessCards).where(eq(accessCards.id, Number(cardId)));

    return NextResponse.json({ success: true, message: "Kartu berhasil dihapus" });
  } catch (error) {
    console.error("Gagal menghapus kartu:", error);
    return NextResponse.json({ error: "Gagal menghapus kartu" }, { status: 500 });
  }
}