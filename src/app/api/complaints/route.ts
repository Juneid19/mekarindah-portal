import { db } from "@/db";
import { documents, residents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const BOT_TOKEN = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
const CHAT_ID = "-1004379863895";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (user.role === "admin") {
      const all = await db.select({ id: documents.id, type: documents.type, status: documents.status, submitted: documents.submitted, residentName: residents.name, unit: residents.unit }).from(documents).leftJoin(residents, eq(documents.residentId, residents.id)).orderBy(desc(documents.submitted));
      return NextResponse.json(all);
    }
    const mine = await db.select().from(documents).where(eq(documents.residentId, user.id)).orderBy(desc(documents.submitted));
    return NextResponse.json(mine);
  } catch (e) { return NextResponse.json([]); }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json().catch(() => ({}));
    
    // LOGIKA BYPASS TOTAL: Jangan panggil user?.phone secara langsung
    const u = user as any;
    let waNumber = "-";
    if (u && u["phone"]) {
      waNumber = u["phone"];
    }
    if (body.phone) {
      waNumber = body.phone;
    }

    const docType = body.documentType || body.type || "Surat Pengantar RT/RW";
    const note = body.purpose || body.description || "-";
    const name = body.residentName || u?.name || "Warga";
    const unit = body.unit || u?.unit || "-";

    const id = `doc-${Date.now()}`;
    const date = new Date().toLocaleDateString("id-ID");

    const msg = `📄 <b>DOKUMEN BARU</b>\n👤 ${name}\n🏠 ${unit}\n📱 WA: ${waNumber}\n📝 ${docType}\nℹ️ ${note}`.trim();

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: "HTML" }),
      });
    } catch (e) {}

    await db.insert(documents).values({
      id,
      residentId: u?.id || "warga-1",
      type: docType,
      submitted: date,
      status: "pending",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const body = await req.json();
  await db.update(documents).set({ status: body.status }).where(eq(documents.id, body.id));
  return NextResponse.json({ success: true });
}