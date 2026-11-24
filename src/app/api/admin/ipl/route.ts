import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// GET: Ambil semua data verifikasi pembayaran IPL
export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`SELECT * FROM ipl_payments ORDER BY created_at DESC`);
      return NextResponse.json({ success: true, data: result.rows });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Aksi Verifikasi Admin (Approve / Reject)
export async function POST(req: Request) {
  try {
    const { paymentId, action, rejectionReason, adminName } = await req.json();

    const client = await pool.connect();
    try {
      if (action === 'approve') {
        // 1. Update status pembayaran menjadi 'approved'
        const updated = await client.query(
          `UPDATE ipl_payments 
           SET status = 'approved', verified_at = NOW(), verified_by = $1
           WHERE id = $2 RETURNING *`,
          [adminName || 'Admin RW', paymentId]
        );

        const payment = updated.rows[0];

        // 2. OTOMATIS Masukkan ke Buku Kas RW (Pemasukan)
        await client.query(
          `INSERT INTO cash_flows (type, category, amount, description, transaction_date)
           VALUES ('income', 'IPL Warga', $1, $2, NOW())`,
          [payment.amount, `Iuran IPL ${payment.period} - ${payment.resident_name} (${payment.unit_number})`]
        );

        return NextResponse.json({ success: true, message: 'Pembayaran berhasil disetujui & tercatat di Buku Kas RW!' });
      } else if (action === 'reject') {
        await client.query(
          `UPDATE ipl_payments 
           SET status = 'rejected', rejection_reason = $1, verified_at = NOW(), verified_by = $2
           WHERE id = $3`,
          [rejectionReason || 'Bukti transfer tidak valid/jelas', adminName || 'Admin RW', paymentId]
        );
        return NextResponse.json({ success: true, message: 'Pembayaran telah ditolak.' });
      }
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}