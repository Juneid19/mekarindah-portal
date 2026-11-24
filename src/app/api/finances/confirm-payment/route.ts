import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

// Mengambil koneksi database dari env
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const pool = new Pool({ connectionString: dbUrl });

// Kredensial Bot Telegram RW Mekar Indah
const TELEGRAM_BOT_TOKEN = '9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY';
const TELEGRAM_CHAT_ID = '-1004379863895';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { residentId, residentName, unitNumber, period, amount, paymentMethod, proofImageBase64 } = body;

    if (!proofImageBase64) {
      return NextResponse.json({ error: 'Bukti transfer tidak boleh kosong!' }, { status: 400 });
    }

    // 1. Simpan ke database Neon PostgreSQL
    const client = await pool.connect();
    let paymentId;
    try {
      const result = await client.query(
        `INSERT INTO ipl_payments 
         (resident_id, resident_name, unit_number, period, amount, payment_method, proof_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
         RETURNING id`,
        [
          residentId || 'saluniza66',
          residentName || 'Saluniza',
          unitNumber || 'Blok A No. 08',
          period || 'Mei 2024',
          amount || 150000,
          paymentMethod || 'Transfer BCA',
          proofImageBase64
        ]
      );
      paymentId = result.rows[0].id;
    } finally {
      client.release();
    }

    // 2. Kirim notifikasi alert ke Telegram Pengurus RW
    try {
      const textMsg = 
        `💸 <b>KONFIRMASI BAYAR IPL MASUK</b>\n\n` +
        `👤 <b>Warga:</b> ${residentName || 'Saluniza'}\n` +
        `🏠 <b>Unit:</b> ${unitNumber || 'Blok A No. 08'}\n` +
        `📅 <b>Periode:</b> ${period || 'Mei 2024'}\n` +
        `💰 <b>Nominal:</b> Rp ${(amount || 150000).toLocaleString('id-ID')}\n` +
        `💳 <b>Metode:</b> ${paymentMethod || 'Transfer BCA'}\n` +
        `🕒 <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}\n\n` +
        `<i>Bukti transfer sudah tersimpan di database dan siap dicek di Portal Admin.</i>`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: textMsg,
          parse_mode: 'HTML',
        }),
      });
    } catch (tgErr) {
      console.warn('Telegram send failed:', tgErr);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Bukti pembayaran berhasil diunggah!', 
      paymentId 
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan di server' }, { status: 500 });
  }
}