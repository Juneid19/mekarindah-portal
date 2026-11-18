import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let kasData = [
  { id: "1", type: "income", category: "IPL", amount: 4500000, description: "Kas Masuk", date: "01/10/2024" },
];

export async function GET() {
  const income = kasData.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = kasData.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  return NextResponse.json({
    balance: income - expense,
    totalIncome: income,
    totalExpense: expense,
    transactions: kasData,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newTx = {
      id: `tx-${Date.now()}`,
      type: body.type || "expense",
      category: body.category || "Lain-lain",
      amount: parseInt(body.amount) || 0,
      description: body.description || "-",
      date: new Date().toLocaleDateString("id-ID"),
    };
    kasData = [newTx, ...kasData];
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) kasData = kasData.filter((t) => t.id !== id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}