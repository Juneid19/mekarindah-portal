// @ts-nocheck
import { db } from "@/db";
import {
  accessCards,
  complaints,
  documents,
  invoices,
  residents,
  vehicles,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import type { PortalState } from "@/lib/portal-data";

export const dynamic = "force-dynamic";

function formatTanggal(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatStatus(status: string): "paid" | "unpaid" {
  const s = (status ?? "").toLowerCase();
  return s === "paid" || s === "lunas" || s === "selesai" ? "paid" : "unpaid";
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [resident] = await db
    .select()
    .from(residents)
    .where(eq(residents.id, user.id))
    .limit(1);

  if (!resident) {
    return NextResponse.json({ message: "Data warga tidak ditemukan" }, { status: 404 });
  }

  const [invRows, vehRows, cardRows, docRows, cmpRows] = await Promise.all([
    db.select().from(invoices).where(eq(invoices.residentId, user.id)),
    db.select().from(vehicles).where(eq(vehicles.residentId, user.id)),
    db.select().from(accessCards).where(eq(accessCards.residentId, user.id)),
    db.select().from(documents).where(eq(documents.residentId, user.id)),
    db.select().from(complaints).where(eq(complaints.residentId, user.id)),
  ]);

  const landArea = resident.landArea ?? 0;
  const buildingArea = resident.buildingArea ?? 0;
  const typeLabel =
    buildingArea > 0 && landArea > 0 ? `${buildingArea}/${landArea}` : "";

  const payload: PortalState = {
    profile: {
      name: resident.name ?? "",
      email: resident.email ?? "",
      phone: resident.phone ?? "",
      unit: resident.unit ?? "",
      emergencyName: resident.emergencyName ?? "",
      emergencyPhone: resident.emergencyPhone ?? "",
    },
    property: {
      block: resident.block ?? "",
      type: typeLabel,
      landArea,
      buildingArea,
      ownership: "",
      moveIn: formatTanggal(resident.createdAt),
    },
    invoices: invRows.map((inv: any) => ({
      id: inv.id,
      month: inv.month ?? "",
      year: inv.year ?? new Date().getFullYear(),
      amount: Number(inv.amount ?? 0),
      status: formatStatus(inv.status),
      dueDate: inv.dueDate ?? "",
    })),
    vehicles: vehRows.map((v: any) => ({
      id: v.id,
      plate: v.plate ?? "",
      type: (v.type === "Motor" ? "Motor" : "Mobil") as "Mobil" | "Motor",
      brand: v.brand ?? "",
      color: v.color ?? "",
    })),
    documents: docRows.map((d: any) => ({
      id: d.id,
      type: d.type ?? "",
      submitted: d.submitted ?? "",
      status: (d.status ?? "pending") as
        | "pending"
        | "processing"
        | "ready"
        | "completed",
    })),
    complaints: cmpRows.map((c: any) => ({
      id: c.id,
      category: c.category ?? "",
      title: c.title ?? "",
      date: c.date ?? "",
      status: (c.status ?? "Diterima") as "Diterima" | "Diproses" | "Selesai",
    })),
    accessCards: cardRows.map((c: any) => ({
      id: c.id,
      label: c.label ?? "",
      number: c.number ?? "",
      holder: c.holder ?? "",
      active: c.active ?? true,
    })),
  };

  return NextResponse.json(payload);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Partial<PortalState>;

  await db
    .update(residents)
    .set({
      name: body.profile?.name ?? undefined,
      phone: body.profile?.phone ?? undefined,
      emergencyName: body.profile?.emergencyName ?? undefined,
      emergencyPhone: body.profile?.emergencyPhone ?? undefined,
    })
    .where(eq(residents.id, user.id));

  return NextResponse.json({ ok: true });
}
