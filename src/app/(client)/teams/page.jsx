import TeamDirectory from "@/modules/public/components/directory/TeamDirectory";
import { getPublicFamilies } from "@/modules/tournaments/server/directory";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Teams & Families | Chenanda Hockey",
  description: "Official family and team directory, player rosters, results and tournament honours.",
};

export default async function TeamsPage() {
  let teams = [];
  try { teams = await getPublicFamilies(); }
  catch (error) { console.error("Public team directory unavailable", error); }
  return <TeamDirectory teams={teams} />;
}
