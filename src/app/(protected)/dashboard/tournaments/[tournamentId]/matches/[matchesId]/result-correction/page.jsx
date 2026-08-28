import ResultCorrectionForm from "@/modules/matches/components/ResultCorrectionForm";
import { requirePermission } from "@/modules/auth/server/session";
import { PERMISSIONS } from "@/modules/auth/server/permissions";

export const dynamic = "force-dynamic";

export default async function MatchResultCorrectionPage({ params }) {
  await requirePermission(
    PERMISSIONS.MATCHES_MANAGE,
    `/dashboard/tournaments/${params.tournamentId}/matches/${params.matchesId}/result-correction`,
  );
  return <div className="min-h-screen bg-slate-100 p-4 py-8 sm:p-6 lg:p-8"><ResultCorrectionForm tournamentId={params.tournamentId} matchId={params.matchesId}/></div>;
}
