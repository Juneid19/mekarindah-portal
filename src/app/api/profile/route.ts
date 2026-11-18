import { db } from "@/db";
import { residents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    phone?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    photoUrl?: string;
  };
  await db.update(residents)
    .set({
      name: body.name ?? user.name,
      phone: body.phone ?? "",
      emergencyName: body.emergencyName ?? "",
      emergencyPhone: body.emergencyPhone ?? "",
      photoUrl: body.photoUrl ?? "",
    })
    .where(eq(residents.id, user.id));
  return NextResponse.json({ ok: true });
}
