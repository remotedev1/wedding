import TournamentCenter from "@/modules/tournaments/components/public/TournamentCenter";
import PublicLiveTicker from "@/modules/tournaments/components/public/PublicLiveTicker";
import { getPublicTournamentSnapshot } from "@/modules/tournaments/server/public";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Tournament Center | Chenanda Hockey",
  description: "Official fixtures, live scores, standings, knockout bracket and results.",
};

export default async function TournamentPage() {
  let tournament = null;
  try {
    tournament = await getPublicTournamentSnapshot();
  } catch (error) {
    console.error("Tournament center data unavailable", error);
  }
  return <><div className="pt-[88px]"><PublicLiveTicker initialTournament={tournament}/></div><TournamentCenter tournament={tournament} tickerOffset/></>;
}
