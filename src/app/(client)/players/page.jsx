import PlayerDirectory from "@/modules/public/components/directory/PlayerDirectory";
import { getPublicPlayers } from "@/modules/tournaments/server/directory";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Players | Chenanda Hockey",
  description: "Official player directory for active tournament families.",
};

export default async function PlayersPage() {
  let players = [];
  try { players = await getPublicPlayers(); }
  catch (error) { console.error("Public player directory unavailable", error); }
  return <PlayerDirectory players={players} />;
}
