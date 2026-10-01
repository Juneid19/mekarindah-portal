import { db } from "@/db";
import {
  accessCards,
  complaints,
  documents,
  gateEvents,
  invoices,
  vehicles,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const [profile] = await db.select().from((await import("@/db/schema")).residents).where(eq((await import("@/db/schema")).residents.id, user.id)).limit(1);
  const userInvoices = await db.select().from(invoices).where(eq(invoices.residentId, user.id));
  const userVehicles = await db.select().from(vehicles).where(eq(vehicles.residentId, user.id));
  const userDocuments = await db.select().from(documents).where(eq(documents.residentId, user.id));
  const userComplaints = await db.select().from(complaints).where(eq(complaints.residentId, user.id));
  const userCards = await db.select().from(accessCards).where(eq(accessCards.residentId, user.id));
  const lastGate = await db.select().from(gateEvents).where(eq(gateEvents.residentId, user.id)).orderBy(desc(gateEvents.triggeredAt)).limit(1);

  return NextResponse.json({
    profile: {
      id: profile?.id,
      name: profile?.name,
      email: profile?.email,
      phone: profile?.phone,
      unit: profile?.unit,
      block: profile?.block,
      emergencyName: profile?.emergencyName,
      emergencyPhone: profile?.emergencyPhone,
      role: profile?.role,
      photoUrl: profile?.photoUrl,
    },
    invoices: userInvoices.map((i) => ({ id: i.id, month: i.month, year: i.year, amount: Number(i.amount), status: i.status, dueDate: i.dueDate })),
    vehicles: userVehicles.map((v) => ({ id: v.id, plate: v.plate, type: v.type, brand: v.brand, color: v.color })),
    documents: userDocuments.map((d) => ({ id: d.id, type: d.type, submitted: d.submitted, status: d.status })),
    complaints: userComplaints.map((c) => ({ id: c.id, category: c.category, title: c.title, date: c.date, status: c.status })),
    accessCards: userCards.map((c) => ({ id: c.id, label: c.label, number: c.number, holder: c.holder, active: c.active })),
    gateOpenedAt: lastGate[0]?.triggeredAt ?? null,
  });
}
