'use server';

import { Pool } from '@neondatabase/serverless';

const TELEGRAM_BOT_TOKEN = '9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY';
const TELEGRAM_CHAT_ID = '-1004379863895';

export async function submitPaymentProof(data: {
  residentId: string;
  residentName: string;
  unitNumber: string;
  period: string;
  amount: number;
  paymentMethod: string;
  proofImageBase64: string;
}) {
  try {
    const { residentId, residentName, unitNumber, period, amount, paymentMethod, proofImageBase64 } = data;

    if (!proofImageBase64) {
      return { success: false, error: 'Bukti transfer tidak boleh kosong!' };
    }

    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!dbUrl) {
      return { success: false, error: 'DATABASE_URL tidak ditemukan di .env' };
    }

    // 1. Simpan ke database Neon PostgreSQL
    const pool = new Pool({ connectionString: dbUrl });
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
          proofImageBase64,
        ]
      );
      paymentId = result.rows[0].id;
    } finally {
      client.release();
    }

    // 2. 📸 KIRIM FOTO RESI + BUNYI DERING KENCANG KE TELEGRAM
    try {
      const captionText = 
        `💸 <b>KONFIRMASI BAYAR IPL MASUK</b>\n\n` +
        `👤 <b>Warga:</b> ${residentName || 'Saluniza'}\n` +
        `🏠 <b>Unit:</b> ${unitNumber || 'Blok A No. 08'}\n` +
        `📅 <b>Periode:</b> ${period || 'Mei 2024'}\n` +
        `💰 <b>Nominal:</b> Rp ${(amount || 150000).toLocaleString('id-ID')}\n` +
        `💳 <b>Metode:</b> ${paymentMethod || 'Transfer BCA'}\n` +
        `🕒 <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}\n\n` +
        `<i>Bukti transfer di atas siap diverifikasi pengurus RW via Portal Admin.</i>`;

      // Konversi Base64 ke Binary Blob
      const cleanBase64 = proofImageBase64.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(cleanBase64, 'base64');
      const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });

      // Siapkan paket pengiriman foto Telegram
      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      formData.append('photo', imageBlob, 'bukti_transfer.jpg');
      formData.append('caption', captionText);
      formData.append('parse_mode', 'HTML');
      // 👇 DI SINI POSISINYA (AGAR HP SATPAM DERING & GETAR):
      formData.append('disable_notification', 'false');

      const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });

      // Cadangan jika foto gagal terkirim (pesan teks biasa):
      if (!tgRes.ok) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: captionText,
            parse_mode: 'HTML',
            disable_notification: false, // 👈 DI SINI POSISINYA
          }),
        });
      }

    } catch (tgErr) {
      console.warn('Telegram send photo error:', tgErr);
    }

    return { 
      success: true, 
      message: 'Bukti transfer dan foto berhasil dikirim!', 
      paymentId 
    };

  } catch (err: any) {
    console.error('Server Action Error:', err);
    return { success: false, error: err.message || 'Terjadi kesalahan di server' };
  }
}