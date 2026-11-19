// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents, residents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

const BOT_TOKEN = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
const CHAT_ID = "-1004379863895";

// ==========================================
// 1. GET: Ambil Dokumen (Admin vs Warga)
// ==========================================
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // JIKA ADMIN: Ambil SEMUA permohonan dokumen seluruh warga
    if (user.role === "admin") {
      const allDocs = await db
        .select({
          id: documents.id,
          type: documents.type,
          status: documents.status,
          submitted: documents.submitted,
          submittedAt: documents.submitted, // alias agar komponen frontend tidak error
          residentId: documents.residentId,
          residentName: residents.name,
          residentUnit: residents.unit,
          residentBlock: residents.block,
          residentPhone: residents.phone,
        })
        .from(documents)
        .leftJoin(residents, eq(documents.residentId, residents.id))
        .orderBy(desc(documents.id));

      return NextResponse.json(allDocs);
    }

    // JIKA WARGA: Hanya ambil dokumen milik warga yang login
    const userDocs = await db
      .select({
        id: documents.id,
        type: documents.type,
        status: documents.status,
        submitted: documents.submitted,
        submittedAt: documents.submitted,
        residentId: documents.residentId,
      })
      .from(documents)
      .where(eq(documents.residentId, String(user.id)))
      .orderBy(desc(documents.id));

    return NextResponse.json(userDocs);
  } catch (error) {
    console.error("Gagal mengambil data dokumen:", error);
    return NextResponse.json({ error: "Gagal memuat dokumen" }, { status: 500 });
  }
}

// ==========================================
// 2. POST: Warga Mengajukan Dokumen Baru
// ==========================================
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { type, notes } = body;

    const residentId = user?.id ? String(user.id) : String(body.residentId || "res-1");
    const residentName = user?.name || body.residentName || "Warga";
    const residentUnit = user?.unit || body.residentUnit || "-";
    const documentType = type || "Surat Pengantar RT/RW";
    const todayFormatted = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD

    // A. Simpan ke Database Neon
    const [newDoc] = await db
      .insert(documents)
      .values({
        residentId: residentId,
        type: documentType,
        status: "pending",
        submitted: todayFormatted,
      })
      .returning();

    // B. Kirim Notifikasi ke Grup Telegram
    try {
      const telegramMessage = `
📄 <b>PERMOHONAN DOKUMEN WARGA</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Pemohon:</b> ${residentName}
🏠 <b>Unit / Blok:</b> ${residentUnit}
📑 <b>Jenis Dokumen:</b> ${documentType}
📝 <b>Keterangan:</b> ${notes || "Permohonan baru"}
📅 <b>Tanggal:</b> ${todayFormatted}
━━━━━━━━━━━━━━━━━━━━
<i>Status: Menunggu Persetujuan Admin</i>
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
      console.error("Gagal broadcast Telegram dokumen:", teleErr);
    }

    return NextResponse.json({ success: true, data: newDoc });
  } catch (error) {
    console.error("Gagal mengajukan dokumen:", error);
    return NextResponse.json({ error: "Gagal memproses permohonan dokumen" }, { status: 500 });
  }
}

// ==========================================
// 3. PATCH: Admin Menyetujui / Menolak Dokumen
// ==========================================
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Hanya admin yang dapat memproses dokumen" }, { status: 403 });
    }

    const { documentId, status } = await request.json();

    await db
      .update(documents)
      .set({ status: status })
      .where(eq(documents.id, Number(documentId)));

    return NextResponse.json({ success: true, message: `Dokumen berhasil diubah status menjadi ${status}` });
  } catch (error) {
    console.error("Gagal update status dokumen:", error);
    return NextResponse.json({ error: "Gagal memperbarui status dokumen" }, { status: 500 });
  }
}