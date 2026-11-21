// @ts-nocheck
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session_token");
    cookieStore.delete("session");

    const res = NextResponse.json({ success: true, message: "Berhasil logout" });
    res.cookies.delete("session_token");
    res.cookies.delete("session");
    return res;
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}