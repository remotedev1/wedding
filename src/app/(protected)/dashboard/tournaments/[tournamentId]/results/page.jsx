import TournamentResultsCenter from "@/modules/tournaments/components/admin/results/TournamentResultsCenter";
import { requirePermission } from "@/modules/auth/server/session";
import { PERMISSIONS } from "@/modules/auth/server/permissions";
export const dynamic="force-dynamic";
export default async function TournamentResultsPage({params}){
 await requirePermission(PERMISSIONS.OPERATIONS_VIEW,`/dashboard/tournaments/${params.tournamentId}/results`);
 return <TournamentResultsCenter tournamentId={params.tournamentId}/>;
}
