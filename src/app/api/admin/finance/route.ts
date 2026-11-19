import { db } from "@/db";
import { financeTransactions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

// Ambil semua data kas
export async function GET() {
  try {
    const data = await db.select().from(financeTransactions).orderBy(desc(financeTransactions.date));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data kas" }, { status: 500 });
  }
}

// Tambah transaksi baru (Pemasukan/Pengeluaran)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItem = await db.insert(financeTransactions).values({
      type: body.type,
      category: body.category,
      amount: body.amount.toString(),
      description: body.description,
      date: body.date,
    }).returning();
    
    return NextResponse.json(newItem[0]);
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan transaksi" }, { status: 500 });
  }
}