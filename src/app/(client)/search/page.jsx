import PublicSearch from "@/modules/public/components/directory/PublicSearch";
import { searchPublicTournament } from "@/modules/tournaments/server/directory";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Search | Chenanda Hockey",
  description: "Search official public tournament teams, players, events and matches.",
};

export default async function SearchPage({ searchParams }) {
  const q = typeof searchParams?.q === "string" ? searchParams.q : "";
  let results = { query: q, teams: [], players: [], events: [], matches: [] };
  try { results = await searchPublicTournament(q); }
  catch (error) { console.error("Public search unavailable", error); }
  return <PublicSearch results={results} />;
}
