import { db } from "@/db";
import { complaints } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
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

    // Urutkan berdasarkan ID (id menggunakan timestamp sehingga urut dari yang terbaru)
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

    const detail = body.detail || body.message || body.description || "Laporan Baru";
    const residentId = user?.id || body.residentId || "warga-1";
    const residentName = user?.name || body.residentName || "Warga Mekarindah";
    const unit = user?.unit || body.unit || "-";

    const id = `cmp-${Date.now()}`;

    // 1. Simpan ke database Neon
    await db.insert(complaints).values({
      id,
      residentId,
      detail,
      status: "Diterima",
    });

    // 2. Kirim Notifikasi ke Grup Telegram Sekuriti
    const isSOS = detail.toUpperCase().includes("SOS") || detail.toUpperCase().includes("DARURAT");
    const message = `
${isSOS ? "🚨 <b>PANGGILAN DARURAT (SOS)</b> 🚨" : "📢 <b>ADUAN WARGA BARU</b>"}
━━━━━━━━━━━━━━━━━━━━
👤 <b>Pelapor:</b> ${residentName}
🏠 <b>Unit:</b> ${unit}
📝 <b>Laporan:</b> ${detail}
📅 <b>Waktu:</b> ${new Date().toLocaleString("id-ID")}
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
      console.error("Gagal kirim notif Telegram aduan:", teleErr);
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("POST Complaints Error:", error);
    return NextResponse.json({ message: "Gagal membuat laporan" }, { status: 500 });
  }
}