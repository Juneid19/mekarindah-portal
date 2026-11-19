import { NextResponse } from "next/server";
import { db } from "@/db";
import { complaints, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

const BOT_TOKEN = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
const CHAT_ID = "-1004379863895";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { residentId, title, category, detail, residentName, unit, phone } = body;

    const todayDate = new Date().toISOString().split("T")[0];

    // 1. Simpan ke Database Neon (Lengkap dengan title, date, residentId)
    const [newComplaint] = await db
      .insert(complaints)
      .values({
        residentId: Number(residentId) || 1,
        title: title || "Aduan Warga",
        category: category || "Umum",
        detail: detail || "-",
        date: todayDate,
        status: category === "Keamanan" && title?.includes("SOS") ? "urgent" : "pending",
      })
      .returning();

    // 2. Kirim Notifikasi ke Grup Telegram
    try {
      const namaPelapor = residentName || "Warga Mekar Indah";
      const unitPelapor = unit || "-";
      const noHp = phone || "-";

      const telegramMessage = `
📢 <b>${title || "ADUAN WARGA BARU"}</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Pelapor:</b> ${namaPelapor} (Unit: ${unitPelapor})
📞 <b>No. HP:</b> ${noHp}
🏷 <b>Kategori:</b> ${category || "Umum"}
📅 <b>Tanggal:</b> ${todayDate}

📝 <b>Rincian:</b>
${detail}
━━━━━━━━━━━━━━━━━━━━
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
      console.error("Gagal broadcast Telegram:", teleErr);
    }

    return NextResponse.json({ success: true, data: newComplaint });
  } catch (error) {
    console.error("Database insert error:", error);
    return NextResponse.json({ error: "Gagal menyimpan aduan" }, { status: 500 });
  }
}

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
        residentName: users.name,
        residentBlock: users.block,
      })
      .from(complaints)
      .leftJoin(users, eq(complaints.residentId, users.id))
      .orderBy(desc(complaints.id));

    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}