import MatchesMain from "@/modules/tournaments/components/admin/matches/MatchesMain";
import { db } from "@/lib/db";
import { requirePermission } from "@/modules/auth/server/session";
import { PERMISSIONS } from "@/modules/auth/server/permissions";

export default async function TournamentMatches({ params }) {
  await requirePermission(PERMISSIONS.MATCHES_VIEW, `/dashboard/tournaments/${params.tournamentId}/matches`);
  const games = await db.tournamentGame.findMany({
    where: { tournamentId: params.tournamentId, isActive: true },
    select: { id: true, name: true, sportType: true, category: true, format: true },
    orderBy: { date: "asc" },
  });
  return <MatchesMain games={games} />;
}
