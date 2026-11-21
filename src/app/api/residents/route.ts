// @ts-nocheck
import { NextResponse } from "next/server";
import { db } from "@/db";
import { residents } from "@/db/schema";
import { desc } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

// 1. GET: Ambil daftar seluruh warga
export async function GET() {
  try {
    const list = await db
      .select()
      .from(residents)
      .orderBy(desc(residents.createdAt));
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

// 2. POST: Simpan warga baru ke Neon
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, unit, block, password } = body;

    if (!name || !email || !unit || !block) {
      return NextResponse.json(
        { message: "Nama, email, unit, dan blok wajib diisi!" },
        { status: 400 }
      );
    }

    // Password default jika admin tidak mengisi: mekarindah123
    const rawPassword = password || "mekarindah123";
    const passwordHash = hashPassword(rawPassword);
    const id = `res-${Date.now()}`;

    const newResident = await db
      .insert(residents)
      .values({
        id,
        name,
        email: email.trim().toLowerCase(),
        phone: phone || "",
        unit,
        block,
        role: "resident",
        passwordHash,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Warga berhasil ditambahkan!",
      data: newResident[0],
    });
  } catch (error: any) {
    console.error("ADD_RESIDENT_ERROR:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menambah warga" },
      { status: 500 }
    );
  }
}