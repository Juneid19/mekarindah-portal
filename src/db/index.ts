import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Ambil URL database dari berbagai kemungkinan nama variabel
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  "";

if (!databaseUrl) {
  console.warn("⚠️ PERINGATAN: DATABASE_URL belum terdeteksi di environment variables!");
}

// Gunakan connection string atau dummy fallback agar tidak crash saat kompilasi awal
const sql = neon(databaseUrl || "postgresql://placeholder:placeholder@localhost/placeholder");

// Export WAJIB di baris paling luar (top-level)
export const db = drizzle(sql);