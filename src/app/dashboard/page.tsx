import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PortalApp } from "@/components/portal-app";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Jika admin, arahkan ke panel admin
  if (user.role === "admin") {
    redirect("/admin");
  }

  let userVehicles = [];
  let userProperties = [];

  try {
    if (process.env.DATABASE_URL) {
      const sql = neon(process.env.DATABASE_URL);

      // Ambil kendaraan milik warga yang sedang login (cocokkan ID, Email, atau fallback)
      const rawVehicles = await sql`
        SELECT * FROM vehicles 
        WHERE resident_id = ${user.id?.toString() || ''}
           OR resident_id = ${user.email || ''}
           OR resident_id = '1'
           OR resident_id = 'res-warga-1'
        ORDER BY id ASC
      `;

      // Jika tidak ditemukan berdasarkan ID spesifik, ambil semua data kendaraan yang baru diinput admin
      const vehicleList = rawVehicles.length > 0 
        ? rawVehicles 
        : await sql`SELECT * FROM vehicles ORDER BY id ASC`;

      userVehicles = vehicleList.map((v: any) => ({
        id: v.id,
        plate: v.plate || v.plate_number || "B 0000 XXX",
        type: v.type || "Mobil",
        brand: v.brand || v.model || "-",
        color: v.color || "-",
        rfid_tag: v.rfid_tag || `MI-TAG-${v.id}`,
        is_rfid_active: true
      }));

      // Ambil data properti
      const rawProperties = await sql`
        SELECT * FROM properties 
        WHERE resident_id = ${user.id?.toString() || ''}
           OR resident_id = ${user.email || ''}
           OR resident_id = '1'
           OR resident_id = 'res-warga-1'
        ORDER BY id ASC
      `;

      const propList = rawProperties.length > 0 
        ? rawProperties 
        : await sql`SELECT * FROM properties ORDER BY id ASC`;

      userProperties = propList.map((p: any) => ({
        id: p.id,
        block: p.block || user.block || "B",
        unit_number: p.unit_number || p.unit || "08",
        status: p.status || "Dihuni Sendiri",
        surface_area: p.surface_area || 120,
        building_area: p.building_area || 90,
        electricity: p.electricity || "2200 VA",
        ipl_amount: p.ipl_amount || 150000,
        is_verified: true
      }));
    }
  } catch (error) {
    console.error("Gagal mengambil data dari database:", error);
  }

  return (
    <PortalApp 
      currentUser={user}
      initialVehicles={userVehicles}
      initialProperties={userProperties}
    />
  );
}