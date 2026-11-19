import { NextResponse } from "next/server";

const BOT_TOKEN = "9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY";
const CHAT_ID = "-1004379863895";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { residentName, unit, gateType, cardNumber } = body;

    const waktu = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const tanggal = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const nama = residentName || "Warga Mekar Indah";
    const nomorUnit = unit || "-";
    const tipeAkses = gateType || "Smart Gate (Aplikasi)";
    const rfid = cardNumber ? `(RFID: ${cardNumber})` : "";

    // Pesan Notifikasi Real-time ke Telegram Pos Satpam
    const telegramMessage = `
🚪 <b>LOG AKSES GATE MASUK / KELUAR</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Warga:</b> ${nama}
🏠 <b>Unit:</b> ${nomorUnit}
🔑 <b>Metode:</b> ${tipeAkses} ${rfid}
⏰ <b>Waktu:</b> ${waktu} WIB
📅 <b>Tanggal:</b> ${tanggal}
🟢 <b>Status Palang:</b> Terbuka Otomatis
━━━━━━━━━━━━━━━━━━━━
<i>Sistem Keamanan Portal Mekar Indah</i>
    `.trim();

    const teleRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: telegramMessage,
        parse_mode: "HTML",
      }),
    });

    if (!teleRes.ok) {
      const errDetail = await teleRes.text();
      console.error("Gagal kirim Telegram Gate:", errDetail);
    }

    return NextResponse.json({ success: true, message: "Gate dibuka & notifikasi terkirim" });
  } catch (error) {
    console.error("Error API Gate:", error);
    return NextResponse.json({ error: "Gagal memproses akses gate" }, { status: 500 });
  }
}