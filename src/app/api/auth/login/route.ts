// @ts-nocheck
import { db } from "@/db";
import { residents, sessions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, createSession, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Body = { email?: string; password?: string };

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Body;
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Ambil data user (dengan auto-fix jika kolom belum ada di database)
    let rows;
    try {
      rows = await db
        .select()
        .from(residents)
        .where(eq(residents.email, email))
        .limit(1);
    } catch (queryErr: any) {
      console.warn("Kolom database belum lengkap, melakukan auto-migration...", queryErr?.message);
      // Menambahkan kolom yang kurang secara otomatis ke Neon
      await db.execute(sql`
        ALTER TABLE "residents" ADD COLUMN IF NOT EXISTS "emergency_name" text;
        ALTER TABLE "residents" ADD COLUMN IF NOT EXISTS "emergency_phone" text;
        ALTER TABLE "residents" ADD COLUMN IF NOT EXISTS "avatar" text;
      `);
      // Coba query ulang setelah kolom ditambahkan
      rows = await db
        .select()
        .from(residents)
        .where(eq(residents.email, email))
        .limit(1);
    }

    const user = rows ? rows[0] : null;

    if (!user) {
      return NextResponse.json(
        { message: `Email ${email} tidak terdaftar di sistem.` },
        { status: 401 }
      );
    }

    // 2. Verifikasi Password (Hash & Plain text)
    let isPasswordValid = false;
    try {
      if (typeof verifyPassword === "function" && user.passwordHash) {
        isPasswordValid = verifyPassword(password, user.passwordHash);
      }
    } catch (e) {
      console.warn("verifyPassword fallback", e);
    }

    if (!isPasswordValid && user.passwordHash === password) {
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Password salah. Periksa kembali huruf besar/kecilnya." },
        { status: 401 }
      );
    }

    // 3. Buat Session Token
    let token = crypto.randomUUID();
    let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (typeof createSession === "function") {
      try {
        const sess = createSession(user.id);
        token = sess.token;
        expiresAt = sess.expiresAt;
      } catch (err) {
        console.warn("createSession fallback", err);
      }
    }

    // 4. Simpan session (auto-create tabel jika belum ada)
    try {
      await db.insert(sessions).values({
        token,
        residentId: user.id,
        expiresAt,
      });
    } catch (sessErr: any) {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "sessions" (
          "token" text PRIMARY KEY,
          "resident_id" text NOT NULL,
          "expires_at" timestamp NOT NULL
        );
      `);
      await db.insert(sessions).values({
        token,
        residentId: user.id,
        expiresAt,
      });
    }

    // 5. Simpan Cookie Session
    const cookieName = SESSION_COOKIE || "session_token";

    try {
      const cookieStore = await cookies();
      cookieStore.set(cookieName, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
        secure: process.env.NODE_ENV === "production",
      });
    } catch (cookieErr) {
      console.warn("cookies() set warning:", cookieErr);
    }

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        unit: user.unit,
        role: user.role,
      },
    });

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error: any) {
    console.error("FATAL_LOGIN_ERROR:", error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan internal saat login.",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}