import HomeAboutPreview from "@/modules/public/components/homepage/HomeAboutPreview";
import {
  ChampionsPreview,
  PublicTournamentHero,
  ResultsPreview,
  TournamentAtAGlance,
} from "@/modules/tournaments/components/public/PublicTournamentOverview";
import TournamentLiveBoard from "@/modules/tournaments/components/public/TournamentLiveBoard";
import PublicLiveTicker from "@/modules/tournaments/components/public/PublicLiveTicker";
import { getPublicTournamentSnapshot } from "@/modules/tournaments/server/public";

export const dynamic = "force-dynamic";

export default async function Page() {
  let tournament = null;
  try {
    tournament = await getPublicTournamentSnapshot();
  } catch (error) {
    console.error("Homepage tournament data unavailable", error);
  }

  return (
    <main className="min-h-screen bg-white">
      <PublicTournamentHero tournament={tournament} />
      {tournament && <PublicLiveTicker initialTournament={tournament} />}
      <TournamentAtAGlance tournament={tournament} />
      {tournament && <TournamentLiveBoard initialTournament={tournament} compact />}
      <ResultsPreview tournament={tournament} />
      <ChampionsPreview tournament={tournament} />
      <HomeAboutPreview />
    </main>
  );
}
