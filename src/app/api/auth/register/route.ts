// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { residents, sessions, securityCodes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { hashPassword, SESSION_COOKIE, createSession } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await ensureSeeded();
    const body = await request.json();
    const { name, email, password, phone, unitCode } = body;

    if (!name || !email || !password || !unitCode) {
      return NextResponse.json(
        { message: "Semua data wajib diisi termasuk kode unit." },
        { status: 400 }
      );
    }

    // 1. Validasi Kode Unit / Security Code
    const codes = await db
      .select()
      .from(securityCodes)
      .where(eq(securityCodes.code, unitCode))
      .limit(1);

    const code = codes[0];

    if (!code || code.status !== "active") {
      return NextResponse.json(
        { message: "Kode unit tidak valid atau sudah tidak aktif." },
        { status: 400 }
      );
    }

    if (code.assignedTo) {
      return NextResponse.json(
        { message: "Unit ini sudah memiliki akun terdaftar." },
        { status: 400 }
      );
    }

    // 2. Buat ID Warga Baru (Format: res-timestamp)
    const newResidentId = `res-${Date.now()}`;
    const hashedPassword = hashPassword(password);

    // 3. Simpan Warga Baru ke Database
    await db.insert(residents).values({
      id: newResidentId,
      name,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      phone,
      unit: code.unit,
      role: "resident",
    });

    // 4. Update Security Code agar tidak bisa dipakai lagi
    await db
      .update(securityCodes)
      .set({ 
        assignedTo: newResidentId, 
        status: "used" 
      })
      .where(eq(securityCodes.id, code.id));

    // 5. Buat Sesi Login Otomatis
    const { token, expiresAt } = createSession(newResidentId);
    await db.insert(sessions).values({ 
      token, 
      residentId: newResidentId, 
      expiresAt 
    });

    (await cookies()).set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil.",
      user: { id: newResidentId, name, email, unit: code.unit }
    });
  } catch (error: any) {
    console.error("Gagal registrasi:", error);
    return NextResponse.json(
      { message: error.message || "Gagal memproses registrasi." },
      { status: 500 }
    );
  }
}