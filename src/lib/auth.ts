import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, residents, type ResidentRole } from "@/db/schema";
import { eq } from "drizzle-orm";

export const SESSION_COOKIE = "mekarindah_session";
const SESSION_DAYS = 14;

export type SessionUser = {
  id: number | string;
  name: string;
  email: string;
  unit: string;
  phone?: string;
  role: ResidentRole;
};

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const derived = scryptSync(plain, salt, 64);
  const expectedBuf = Buffer.from(expected, "hex");
  if (derived.length !== expectedBuf.length) return false;
  return timingSafeEqual(derived, expectedBuf);
}

export function createSession(residentId: number | string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  return { token, expiresAt };
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    // 1. Ambil sesi berdasarkan token
    const sessionRows = await db
      .select({
        token: sessions.token,
        expiresAt: sessions.expiresAt,
        residentId: sessions.residentId,
      })
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (sessionRows.length === 0) return null;
    
    const session = sessionRows[0];
    if (session.expiresAt.getTime() < Date.now()) {
      await db.delete(sessions).where(eq(sessions.token, token));
      return null;
    }

    // 2. Ambil data warga dari tabel residents
    const userRows = await db
      .select({
        id: residents.id,
        name: residents.name,
        email: residents.email,
        unit: residents.unit,
        phone: residents.phone,
        role: residents.role,
      })
      .from(residents)
      .where(eq(residents.id, session.residentId))
      .limit(1);

    if (userRows.length === 0) return null;

    const user = userRows[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      unit: user.unit || "",
      phone: user.phone || "",
      role: (user.role as ResidentRole) || "resident",
    };
  } catch (error) {
    console.error("Gagal mendapatkan sesi user:", error);
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}