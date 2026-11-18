import { db } from "@/db";
import { documents, residents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TELEGRAM_BOT_TOKEN = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
const TELEGRAM_CHAT_ID = "-1004379863895";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    if (user.role === "admin") {
      const allDocs = await db
        .select({
          id: documents.id,
          type: documents.type,
          status: documents.status,
          submitted: documents.submitted,
          residentId: documents.residentId,
          residentName: residents.name,
          unit: residents.unit,
        })
        .from(documents)
        .leftJoin(residents, eq(documents.residentId, residents.id))
        .orderBy(desc(documents.submitted));
      return NextResponse.json(allDocs);
    }

    const userDocs = await db.select().from(documents).where(eq(documents.residentId, user.id)).orderBy(desc(documents.submitted));
    return NextResponse.json(userDocs);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    // Gunakan casting 'any' secara langsung pada akses properti agar Vercel tidak error
    const u = user as any; 
    
    const body = await request.json().catch(() => ({}));

    const docType = body.documentType || body.type || "Surat Pengantar RT/RW";
    const purpose = body.purpose || body.description || "-";
    const delivery = body.deliveryMethod || "Ambil di Pos Satpam";
    
    // PERBAIKAN: Akses properti dengan pengaman 'any'
    const residentName = body.residentName || u?.name || "Warga Mekarindah";
    const residentUnit = body.unit || u?.unit || "-";
    const residentPhone = body.phone || (u && u.phone ? u.phone : "-");
    const residentId = u?.id || "warga-1";

    const id = `doc-${Date.now()}`;
    const submitted = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const messageHtml = `
📄 <b>PERMOHONAN DOKUMEN / SURAT</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Pemohon:</b> ${residentName}
🏠 <b>Unit:</b> ${residentUnit}
📱 <b>WhatsApp:</b> ${residentPhone}
📝 <b>Jenis Surat:</b> ${docType}
ℹ️ <b>Keperluan:</b> ${purpose}
📦 <b>Pengambilan:</b> ${delivery}
📅 <b>Tanggal:</b> ${submitted}
━━━━━━━━━━━━━━━━━━━━
<i>Status: Menunggu Proses Pengurus / RT</i>
    `.trim();

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: messageHtml,
          parse_mode: "HTML",
        }),
      });
    } catch (e) {}

    await db.insert(documents).values({
      id,
      residentId,
      type: docType,
      submitted,
      status: "pending",
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ message: "Gagal memproses" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    await db.update(documents).set({ status }).where(eq(documents.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Gagal update" }, { status: 500 });
  }
}