import TournamentLiveBoard from "@/modules/tournaments/components/public/TournamentLiveBoard";
import { getPublicTournamentSnapshot } from "@/modules/tournaments/server/public";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Live Scores | Chenanda Hockey",
  description: "Official live scores and upcoming fixtures from the tournament control system.",
};

export default async function ScoreHockeyPage() {
  let tournament = null;
  try {
    tournament = await getPublicTournamentSnapshot();
  } catch (error) {
    console.error("Live score data unavailable", error);
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      {tournament ? (
        <TournamentLiveBoard initialTournament={tournament} />
      ) : (
        <section className="mx-auto max-w-4xl px-4 py-32 text-center">
          <h1 className="text-4xl font-black text-slate-950">Live scores are not published yet</h1>
          <p className="mt-4 text-slate-600">This page will automatically use the current official tournament once it is published.</p>
        </section>
      )}
    </main>
  );
}
