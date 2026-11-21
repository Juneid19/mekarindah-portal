// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { securityCodes } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await db.select().from(securityCodes).orderBy(desc(securityCodes.createdAt));
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { unit, assignedTo, validUntil } = body;

    // Generate kode acak 6 digit
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const newCode = await db.insert(securityCodes).values({
      unit,
      assignedTo,
      code,
      validUntil: new Date(validUntil),
      status: "active",
    }).returning();

    return NextResponse.json(newCode[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}