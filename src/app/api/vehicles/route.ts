import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(vehicles).where(eq(vehicles.residentId, user.id));
  return NextResponse.json(rows.map((v) => ({ id: v.id, plate: v.plate, type: v.type, brand: v.brand, color: v.color })));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { plate?: string; type?: "Mobil" | "Motor"; brand?: string; color?: string };
  if (!body.plate || !body.type) return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
  const id = `veh-${Date.now()}`;
  await db.insert(vehicles).values({
    id,
    residentId: user.id,
    plate: body.plate.toUpperCase(),
    type: body.type,
    brand: body.brand ?? "",
    color: body.color ?? "",
  });
  return NextResponse.json({ id });
}

void and;
