// @ts-nocheck
import { db } from "@/db";
import { residents, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, createSession, verifyPassword } from "@/lib/auth";
import { ensureSeeded, findResidentByEmail } from "@/lib/seed";

export const dynamic = "force-dynamic";

type Body = { email?: string; password?: string };

export async function POST(request: Request) {
  try {
    // 1. Jalankan seed secara aman (abaikan jika sudah pernah di-seed agar tidak crash)
    try {
      await ensureSeeded();
    } catch (seedErr) {
      console.warn("Seed warning (bisa diabaikan jika database sudah terisi):", seedErr);
    }

    // 2. Parse request body
    const body = (await request.json().catch(() => ({}))) as Body;
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    // 3. Cari user di database
    let user = null;
    try {
      user = await findResidentByEmail(email);
    } catch (dbErr) {
      console.error("Error query user:", dbErr);
      // Fallback direct query jika findResidentByEmail bermasalah
      const rows = await db
        .select()
        .from(residents)
        .where(eq(residents.email, email))
        .limit(1);
      user = rows[0] || null;
    }

    if (!user) {
      return NextResponse.json(
        { message: "Email atau password salah." },
        { status: 401 }
      );
    }

    // 4. Verifikasi Password
    const isPasswordValid = verifyPassword(password, user.passwordHash || "");
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email atau password salah." },
        { status: 401 }
      );
    }

    // 5. Buat Session
    let token: string;
    let expiresAt: Date;

    if (typeof createSession === "function") {
      const sess = createSession(user.id);
      token = sess.token;
      expiresAt = sess.expiresAt;
    } else {
      token = crypto.randomUUID();
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    // Simpan session ke database
    await db.insert(sessions).values({
      token,
      residentId: user.id,
      expiresAt,
    });

    // 6. Buat Response dan Set Cookie
    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      unit: user.unit,
      role: user.role,
    });

    response.cookies.set(SESSION_COOKIE || "session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("FATAL_LOGIN_ERROR:", error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan pada server saat login.",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}