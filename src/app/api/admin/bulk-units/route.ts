import { db } from "@/db";
import { residents, securityCodes } from "@/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { generateAllUnits, toCsv } from "@/lib/bulk-units";

export const dynamic = "force-dynamic";

export async function POST() {
  await requireAdmin();
  const rows = await db.select({ unit: residents.unit }).from(residents);
  const existing = new Set(rows.map((r) => r.unit));
  const generated = generateAllUnits(existing);
  if (generated.length === 0) {
    return NextResponse.json({ message: "Semua unit sudah ada", count: 0, csv: "" });
  }

  // Insert ke tabel residents dan security_codes (password default kosong, role resident)
  for (const u of generated) {
    await db.insert(residents).values({
      id: `res-${u.unit.toLowerCase().replace("-", "")}`,
      name: `Penghuni ${u.unit}`,
      email: `${u.unit.toLowerCase()}@mekarindah.local`,
      phone: "",
      unit: u.unit,
      block: u.block,
      emergencyName: "",
      emergencyPhone: "",
      passwordHash: "",
      role: "resident",
    }).onConflictDoNothing();

    await db.insert(securityCodes).values({
      unit: u.unit, code: u.securityCode, assignedTo: null,
    }).onConflictDoNothing();
  }

  const csv = toCsv(generated);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="units-${Date.now()}.csv"`,
    },
  });
}
