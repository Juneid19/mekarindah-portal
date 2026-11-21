// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
    if (list && list.length > 0) {
      return NextResponse.json(list);
    }
  } catch (e) {
    console.error("DB Vehicles error:", e);
  }

  // Data default kendaraan Saluniza
  return NextResponse.json([
    {
      id: "veh-1",
      residentId: "res-warga-1",
      plate: "B 1234 MKR",
      type: "Mobil",
      brand: "Honda HR-V",
      color: "Putih",
    },
    {
      id: "veh-2",
      residentId: "res-warga-1",
      plate: "B 5678 SIK",
      type: "Motor",
      brand: "Yamaha NMAX",
      color: "Hitam",
    },
  ]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = `veh-${Date.now()}`;
    const newVeh = await db.insert(vehicles).values({
      id,
      residentId: body.residentId || "res-warga-1",
      plate: body.plate || "B 0000 XXX",
      type: body.type || "Mobil",
      brand: body.brand || "-",
      color: body.color || "-",
    }).returning();
    return NextResponse.json(newVeh[0] || { id, ...body });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}