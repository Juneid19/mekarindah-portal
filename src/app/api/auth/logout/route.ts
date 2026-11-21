// @ts-nocheck
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    // Hapus cookie session
    cookieStore.delete("session_token");
    
    return NextResponse.json({ success: true, message: "Berhasil keluar" });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}