import TournamentCommandCenter from "@/modules/tournaments/components/admin/TournamentCommandCenter";
import { getTournamentCommandCenter } from "@/modules/tournaments/server/operations";
import { requirePermission } from "@/modules/auth/server/session";
import { PERMISSIONS } from "@/modules/auth/server/permissions";

export const dynamic = "force-dynamic";

export default async function CommandCenterPage() {
  await requirePermission(PERMISSIONS.OPERATIONS_VIEW, "/dashboard/command-center");
  const data = await getTournamentCommandCenter();
  return <TournamentCommandCenter data={data} />;
}
