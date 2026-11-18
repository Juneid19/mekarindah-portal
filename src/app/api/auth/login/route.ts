import { db } from "@/db";
import { residents, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, createSession, verifyPassword } from "@/lib/auth";
import { ensureSeeded, findResidentByEmail } from "@/lib/seed";

export const dynamic = "force-dynamic";

type Body = { email?: string; password?: string };

export async function POST(request: Request) {
  await ensureSeeded();
  const body = (await request.json().catch(() => ({}))) as Body;
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ message: "Email dan password wajib diisi." }, { status: 400 });
  }

  const user = await findResidentByEmail(email);
  if (!user) {
    return NextResponse.json({ message: "Email atau password salah." }, { status: 401 });
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ message: "Email atau password salah." }, { status: 401 });
  }

  const { token, expiresAt } = createSession(user.id);
  await db.insert(sessions).values({ token, residentId: user.id, expiresAt });

  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", expires: expiresAt });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, unit: user.unit, role: user.role });
}

void eq;
