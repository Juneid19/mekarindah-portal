import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, type ResidentRole } from "@/db/schema";
import { eq } from "drizzle-orm";

export const SESSION_COOKIE = "mekarindah_session";
const SESSION_DAYS = 14;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  unit: string;
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

export function createSession(residentId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  return { token, expiresAt };
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await db
    .select({
      token: sessions.token,
      expiresAt: sessions.expiresAt,
      residentId: sessions.residentId,
      name: sessions.residentId,
    })
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (rows.length === 0) return null;
  const row = rows[0];
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.token, token));
    return null;
  }

  const { residents } = await import("@/db/schema");
  const userRows = await db
    .select({
      id: residents.id,
      name: residents.name,
      email: residents.email,
      unit: residents.unit,
      role: residents.role,
    })
    .from(residents)
    .where(eq(residents.id, row.residentId))
    .limit(1);

  return userRows[0] ?? null;
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
