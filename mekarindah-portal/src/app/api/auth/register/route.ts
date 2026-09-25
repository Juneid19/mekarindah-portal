import { db } from "@/db";
import { residents, securityCodes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hashPassword, SESSION_COOKIE, createSession } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

type Body = { name?: string; email?: string; password?: string; phone?: string; unit?: string; securityCode?: string; emergencyName?: string; emergencyPhone?: string };

export async function POST(request: Request) {
  await ensureSeeded();
  const body = (await request.json().catch(() => ({}))) as Body;
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const phone = (body.phone ?? "").trim();
  const unit = (body.unit ?? "").trim().toUpperCase();
  const securityCode = (body.securityCode ?? "").trim();
  const emergencyName = (body.emergencyName ?? "").trim();
  const emergencyPhone = (body.emergencyPhone ?? "").trim();

  if (!name || !email || password.length < 6 || !unit || !securityCode) {
    return NextResponse.json({ message: "Data tidak lengkap. Password minimal 6 karakter." }, { status: 400 });
  }

  const codeRows = await db.select().from(securityCodes).where(eq(securityCodes.unit, unit)).limit(1);
  const code = codeRows[0];
  if (!code || code.code !== securityCode) {
    return NextResponse.json({ message: "Kode unit atau security code tidak valid." }, { status: 400 });
  }
  if (code.assignedTo) {
    return NextResponse.json({ message: "Unit ini sudah memiliki akun terdaftar." }, { status: 409 });
  }

  const emailRows = await db.select({ id: residents.id }).from(residents).where(eq(residents.email, email)).limit(1);
  if (emailRows.length > 0) {
    return NextResponse.json({ message: "Email sudah digunakan." }, { status: 409 });
  }

  const id = `res-${unit.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  const block = unit.split("-")[0];

  await db.insert(residents).values({
    id,
    name,
    email,
    phone,
    unit,
    block,
    emergencyName,
    emergencyPhone,
    passwordHash: hashPassword(password),
    role: "resident",
  });

  await db.update(securityCodes).set({ assignedTo: id }).where(eq(securityCodes.unit, unit));

  const { token, expiresAt } = createSession(id);
  await db.insert((await import("@/db/schema")).sessions).values({ token, residentId: id, expiresAt });

  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", expires: expiresAt });

  return NextResponse.json({ id, name, email, unit, role: "resident" });
}

void and;
