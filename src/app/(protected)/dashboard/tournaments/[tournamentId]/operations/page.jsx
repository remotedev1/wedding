import TournamentCommandCenter from "@/modules/tournaments/components/admin/TournamentCommandCenter";
import { getTournamentCommandCenter } from "@/modules/tournaments/server/operations";
import { requirePermission } from "@/modules/auth/server/session";
import { PERMISSIONS } from "@/modules/auth/server/permissions";

export const dynamic="force-dynamic";

export default async function TournamentOperationsPage({params}){
  await requirePermission(PERMISSIONS.OPERATIONS_VIEW,`/dashboard/tournaments/${params.tournamentId}/operations`);
  const data=await getTournamentCommandCenter(params.tournamentId);
  return <TournamentCommandCenter data={data} scoped/>;
}
