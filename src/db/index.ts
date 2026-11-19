import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL tidak ditemukan di file .env");
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
export * from "./schema"; // Pastikan baris ini ada agar semua tabel dapat diimpor langsung