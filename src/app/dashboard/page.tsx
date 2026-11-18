import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PortalApp } from "@/components/portal-app"; // Pastikan pakai kurung kurawal

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Proteksi Login
  if (!user) {
    redirect("/login");
  }

  // Proteksi Admin (Admin tidak boleh masuk ke dashboard warga)
  if (user.role === "admin") {
    redirect("/admin");
  }

  // TAMPILKAN PORTAL WARGA
  return <PortalApp initialUser={user} />;
}