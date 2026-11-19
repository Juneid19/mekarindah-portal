// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { complaints, residents } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const BOT_TOKEN = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
const CHAT_ID = "-1004379863895";

// GET: Ambil daftar aduan warga
export async function GET() {
  try {
    const list = await db
      .select({
        id: complaints.id,
        title: complaints.title,
        category: complaints.category,
        detail: complaints.detail,
        date: complaints.date,
        status: complaints.status,
        residentId: complaints.residentId,
        residentName: residents.name,
        residentUnit: residents.unit,
        residentBlock: residents.block,
        residentPhone: residents.phone,
      })
      .from(complaints)
      .leftJoin(residents, eq(complaints.residentId, residents.id))
      .orderBy(desc(complaints.id));

    return NextResponse.json(list);
  } catch (error) {
    console.error("Gagal mengambil data aduan:", error);
    return NextResponse.json({ error: "Gagal memuat aduan" }, { status: 500 });
  }
}

// POST: Warga kirim aduan atau sinyal SOS
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { residentId, title, category, detail, residentName, unit, phone } = body;

    const todayDate = new Date().toISOString().split("T")[0];
    const isSos = (category || "").toLowerCase() === "keamanan" && (title || "").includes("SOS");

    // 1. Simpan ke Database Neon (residentId disimpan sebagai String)
    const [newComplaint] = await db
      .insert(complaints)
      .values({
        residentId: String(residentId || "res-1"),
        title: title || (isSos ? "🚨 DARURAT SOS" : "Aduan Warga"),
        category: category || "Umum",
        detail: detail || "-",
        date: todayDate,
        status: isSos ? "urgent" : "pending",
      })
      .returning();

    // 2. Ambil data nama & unit untuk Telegram
    const namaPelapor = residentName || "Warga Mekar Indah";
    const unitPelapor = unit || "-";
    const noHp = phone || "-";

    // 3. Kirim Broadcast Telegram ke Pos Satpam & Pengurus
    try {
      const iconJudul = isSos ? "🚨🚨🚨 PERINGATAN DARURAT (SOS) 🚨🚨🚨" : "📢 ADUAN WARGA BARU";
      const telegramMessage = `
<b>${iconJudul}</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Pelapor:</b> ${namaPelapor}
🏠 <b>Unit / Blok:</b> ${unitPelapor}
📞 <b>No. HP:</b> ${noHp}
🏷 <b>Kategori:</b> ${category || "Umum"}
📅 <b>Tanggal:</b> ${todayDate}

📝 <b>Rincian:</b>
${detail || "-"}
━━━━━━━━━━━━━━━━━━━━
<i>Sistem Informasi Portal Mekar Indah</i>
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
      console.error("Telegram broadcast error:", teleErr);
    }

    return NextResponse.json({ success: true, data: newComplaint });
  } catch (error) {
    console.error("Database insert error:", error);
    return NextResponse.json({ error: "Gagal menyimpan aduan" }, { status: 500 });
  }
}