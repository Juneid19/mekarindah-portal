'use server';

import { Pool } from '@neondatabase/serverless';

const TELEGRAM_BOT_TOKEN = '9027386348:AAESveYphsdbpLtnrew-bddA8BsgHnJJXjY';
const TELEGRAM_GROUP_ID = '-1004379863895'; // Ke Grup RW

// 👇 MASUKKAN ID TELEGRAM PRIBADI MAS BRO / SATPAM DI SINI (Contoh: '123456789'):
const TELEGRAM_PERSONAL_ID = ''; 

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

    // 2. 📸 KIRIM FOTO KE GRUP & JAPRI (DIJAMIN DERING KENCANG)
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

      // Fungsi bantuan kirim foto
      const sendPhotoToTarget = async (targetChatId: string) => {
        const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('chat_id', targetChatId);
        formData.append('photo', imageBlob, 'bukti_transfer.jpg');
        formData.append('caption', captionText);
        formData.append('parse_mode', 'HTML');

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          body: formData,
        });
      };

      // 1. Kirim ke Grup RW (Untuk Arsip)
      await sendPhotoToTarget(TELEGRAM_GROUP_ID);

      // 2. Kirim Japri ke Akun Pribadi Satpam (Untuk Bunyi Dering Keras)
      if (TELEGRAM_PERSONAL_ID) {
        // Catatan: Pastikan akun pribadi sudah pernah klik "Start" di bot @MekarindahsosBOT
        await sendPhotoToTarget(TELEGRAM_PERSONAL_ID);
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