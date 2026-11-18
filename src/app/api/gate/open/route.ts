import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Kredensial yang SUDAH TERBUKTI OK di browser tadi
    const botToken = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
    const chatId = "-1004379863895";

    const text = 
      `🚪 <b>AKSES GERBANG TERBUKA</b>\n\n` +
      `👤 <b>Warga:</b> ${body.residentName || "Saluniza"}\n` +
      `🏠 <b>Unit:</b> ${body.unit || "A-001"}\n` +
      `🚧 <b>Palang:</b> ${body.gateName || "Gerbang Utama"}\n` +
      `⏰ <b>Waktu:</b> ${new Date().toLocaleTimeString("id-ID")} WIB\n\n` +
      `<i>Status: Berhasil dibuka via Kartu Akses Digital.</i>`;

    console.log("Memulai kirim notifikasi ke Telegram...");

    const teleRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });

    const teleData = await teleRes.json();
    console.log("Respon Telegram:", teleData.ok ? "✅ BERHASIL" : "❌ GAGAL");

    return NextResponse.json({ success: true, teleData });
  } catch (error: any) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}