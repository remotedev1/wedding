import { DashboardShell } from "@/modules/admin/components/navigation/dashboard-shell";
import { requireDashboardAccess } from "@/modules/auth/server/session";

export default async function DashboardLayout({ children }) {
  await requireDashboardAccess();
  return <DashboardShell>{children}</DashboardShell>;
}
