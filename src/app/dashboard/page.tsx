import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PortalApp } from "@/components/portal-app";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Jika admin login ke /dashboard, arahkan ke /admin
  if (user.role === "admin") {
    redirect("/admin");
  }

  return <PortalApp />;
}