import TournamentStatistics from "@/modules/tournaments/components/public/TournamentStatistics";
import { getPublicTournamentStatistics } from "@/modules/tournaments/server/tournament-statistics";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Tournament Statistics | Chenanda Hockey",
  description: "Official scorers, team form, discipline and tournament statistics.",
};

export default async function TournamentStatisticsPage() {
  let data = null;
  try {
    data = await getPublicTournamentStatistics();
  } catch (error) {
    console.error("Tournament statistics unavailable", error);
  }
  return <TournamentStatistics data={data} />;
}
