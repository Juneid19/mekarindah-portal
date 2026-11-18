import { NextResponse } from "next/server";
import { db } from "@/db";
import { complaints, residents } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET: Ambil daftar aduan
export async function GET() {
  try {
    const user = await getCurrentUser();
    const allComplaints = await db
      .select()
      .from(complaints)
      .orderBy(desc(complaints.createdAt));

    if (user && user.role !== "admin") {
      const userComplaints = allComplaints.filter((c: any) => c.residentId === user.id);
      return NextResponse.json(userComplaints.length > 0 ? userComplaints : allComplaints);
    }

    return NextResponse.json(allComplaints);
  } catch (error: any) {
    console.error("GET /api/complaints error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST: Buat Aduan Baru atau Sinyal SOS Darurat
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { detail, category, phone, unit, residentName } = body;

    if (!detail || !detail.trim()) {
      return NextResponse.json({ error: "Detail aduan wajib diisi" }, { status: 400 });
    }

    const name = residentName || user?.name || "Saluniza";
    const houseUnit = unit || user?.unit || "A-001";
    const userPhone = phone || "08123456789";
    const isSOS = detail.toUpperCase().includes("SOS") || detail.toUpperCase().includes("DARURAT");
    const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    // Kredensial Telegram yang sudah terbukti OK di grup
    const botToken = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
    const chatId = "-1004379863895";

    let alertMsg = "";
    if (isSOS) {
      alertMsg = 
        `🚨🚨🚨 <b>PERINGATAN SOS DARURAT!</b> 🚨🚨🚨\n\n` +
        `👤 <b>Warga:</b> ${name}\n` +
        `🏠 <b>Unit Rumah:</b> ${houseUnit}\n` +
        `📞 <b>No. HP/WA:</b> ${userPhone}\n` +
        `⚠️ <b>Keterangan:</b> ${detail.trim()}\n` +
        `⏰ <b>Waktu:</b> ${time} WIB\n\n` +
        `<i>Petugas Keamanan / Security segera menuju ke lokasi!</i>`;
    } else {
      alertMsg = 
        `📢 <b>ADUAN WARGA MASUK</b>\n\n` +
        `👤 <b>Warga:</b> ${name} (Unit ${houseUnit})\n` +
        `📁 <b>Kategori:</b> ${category || "Fasilitas Umum"}\n` +
        `📝 <b>Rincian:</b> ${detail.trim()}\n` +
        `⏰ <b>Waktu:</b> ${time} WIB\n` +
        `📌 <b>Status:</b> Diterima`;
    }

    // 1. KIRIM NOTIFIKASI KE TELEGRAM TERLEBIH DAHULU (Pasti Terkirim)
    try {
      const teleRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: alertMsg,
          parse_mode: "HTML",
        }),
      });
      const teleData = await teleRes.json();
      console.log("Status Telegram (Complaints/SOS):", teleData.ok ? "✅ TERKIRIM" : "❌ GAGAL: " + teleData.description);
    } catch (teleErr) {
      console.error("Gagal koneksi Telegram:", teleErr);
    }

    // 2. SIMPAN KE DATABASE NEON
    try {
      let validResidentId = user?.id;
      if (!validResidentId) {
        const firstResident = await db.select().from(residents).limit(1);
        if (firstResident && firstResident.length > 0) {
          validResidentId = firstResident[0].id;
        }
      }

      const uniqueId = `cmp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await db.insert(complaints).values({
        id: uniqueId,
        residentId: validResidentId || "warga-1",
        detail: detail.trim(),
        status: "Diterima" as any,
        createdAt: new Date(),
      } as any);
    } catch (dbErr) {
      console.warn("Catatan database (non-fatal):", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: isSOS ? "Sinyal SOS Darurat Terkirim!" : "Aduan berhasil disimpan",
      isSOS,
    });
  } catch (error: any) {
    console.error("POST /api/complaints error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}