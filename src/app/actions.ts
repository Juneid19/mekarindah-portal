'use server';

import { Pool } from '@neondatabase/serverless';

const TELEGRAM_BOT_TOKEN = '9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY';

// 1. ID Grup RW Mekar Indah
const TELEGRAM_CHAT_ID = '-1004379863895';

// 2. (OPSIONAL) ID Chat Pribadi Satpam/Admin (Ganti dengan ID akun Satpam jika ingin japri langsung berdering kencang)
// const SATPAM_PERSONAL_CHAT_ID = '123456789'; 

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

    // 1. Simpan ke database Neon
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

    // 2. 📸 KIRIM KE TELEGRAM (DENGAN SUARA PENUH TANPA PARAMETER SILENT)
    try {
      const captionText = 
        `🚨 <b>NOTIFIKASI IPL MASUK</b> 🚨\n\n` +
        `👤 <b>Warga:</b> ${residentName || 'Saluniza'}\n` +
        `🏠 <b>Unit:</b> ${unitNumber || 'Blok A No. 08'}\n` +
        `📅 <b>Periode:</b> ${period || 'Mei 2024'}\n` +
        `💰 <b>Nominal:</b> Rp ${(amount || 150000).toLocaleString('id-ID')}\n` +
        `💳 <b>Metode:</b> ${paymentMethod || 'Transfer BCA'}\n` +
        `🕒 <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}\n\n` +
        `<i>Petugas mohon segera periksa bukti di Portal Admin.</i>`;

      const cleanBase64 = proofImageBase64.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(cleanBase64, 'base64');
      const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });

      // Siapkan FormData
      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      formData.append('photo', imageBlob, 'bukti_transfer.jpg');
      formData.append('caption', captionText);
      formData.append('parse_mode', 'HTML');
      // ⚠️ CATATAN: disable_notification SENGAJA DIHAPUS agar Telegram memakai default: BERSUARA

      const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });

      // Cadangan teks biasa (jika foto gagal)
      if (!tgRes.ok) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: captionText,
            parse_mode: 'HTML',
          }),
        });
      }

    } catch (tgErr) {
      console.warn('Telegram send error:', tgErr);
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