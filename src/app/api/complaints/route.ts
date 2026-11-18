import { db } from "@/db";
import { complaints } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TELEGRAM_BOT_TOKEN = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
const TELEGRAM_CHAT_ID = "-1004379863895";

// GET: Ambil daftar aduan / SOS
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const allComplaints = await db
      .select()
      .from(complaints)
      .orderBy(desc(complaints.id));

    if (user.role !== "admin") {
      const userComplaints = allComplaints.filter((c: any) => c.residentId === user.id);
      return NextResponse.json(userComplaints);
    }

    return NextResponse.json(allComplaints);
  } catch (error) {
    console.error("GET Complaints Error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST: Buat laporan aduan baru / SOS
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json().catch(() => ({}));

    const detailText = body.detail || body.message || body.description || "Laporan Baru";
    const isSOS =
      detailText.toUpperCase().includes("SOS") ||
      detailText.toUpperCase().includes("DARURAT") ||
      body.category === "Darurat";

    const residentId = user?.id || body.residentId || "warga-1";
    const residentName = user?.name || body.residentName || "Warga Mekarindah";
    const unit = user?.unit || body.unit || "-";

    const id = `cmp-${Date.now()}`;
    const title = body.title || (isSOS ? "PANGGILAN DARURAT (SOS)" : "Aduan Warga");
    const category = body.category || (isSOS ? "Darurat" : "Fasilitas");
    const date =
      body.date ||
      new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    const status = body.status || "Diterima";

    // 1. Simpan ke database Neon (Lengkap semua kolom wajib)
    await db.insert(complaints).values({
      id,
      residentId,
      title,
      category,
      detail: detailText,
      date,
      status,
    });

    // 2. Kirim Notifikasi ke Grup Telegram Sekuriti
    const message = `
${isSOS ? "🚨 <b>PANGGILAN DARURAT (SOS)</b> 🚨" : "📢 <b>ADUAN WARGA BARU</b>"}
━━━━━━━━━━━━━━━━━━━━
👤 <b>Pelapor:</b> ${residentName}
🏠 <b>Unit:</b> ${unit}
📌 <b>Judul:</b> ${title}
📂 <b>Kategori:</b> ${category}
📝 <b>Rincian:</b> ${detailText}
📅 <b>Waktu:</b> ${date}
━━━━━━━━━━━━━━━━━━━━
<i>Segera tindak lanjuti oleh Petugas Keamanan / RT</i>
    `.trim();

    try {
      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "HTML",
          }),
        }
      );
    } catch (teleErr) {
      console.error("Gagal kirim notif Telegram:", teleErr);
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("POST Complaints Error:", error);
    return NextResponse.json({ message: "Gagal membuat laporan" }, { status: 500 });
  }
}