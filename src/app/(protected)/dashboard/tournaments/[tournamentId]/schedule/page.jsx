import FixtureScheduleBoard from "@/modules/tournaments/components/admin/matches/FixtureScheduleBoard";
import { requirePermission } from "@/modules/auth/server/session";
import { PERMISSIONS } from "@/modules/auth/server/permissions";

export const dynamic = "force-dynamic";

export default async function TournamentSchedulePage({ params }) {
  await requirePermission(PERMISSIONS.OPERATIONS_VIEW, `/dashboard/tournaments/${params.tournamentId}/schedule`);
  return <FixtureScheduleBoard tournamentId={params.tournamentId} />;
}
