import { db } from "@/db";
import { financeTransactions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();
  const rows = await db.select().from(financeTransactions).orderBy(desc(financeTransactions.date));
  return NextResponse.json(rows.map((r) => ({
    id: r.id, type: r.type, category: r.category, amount: Number(r.amount),
    description: r.description, date: r.date, createdBy: r.createdBy,
  })));
}

export async function POST(req: Request) {
  const user = await requireAdmin();
  const body = (await req.json().catch(() => ({}))) as {
    type?: "income" | "expense"; category?: string; amount?: number; description?: string;
  };
  if (!body.type || !body.category || !body.amount) {
    return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
  }
  const id = `fin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await db.insert(financeTransactions).values({
    id, type: body.type, category: body.category,
    amount: String(body.amount), description: body.description ?? "", createdBy: user.email,
  });
  return NextResponse.json({ ok: true, id });
}
