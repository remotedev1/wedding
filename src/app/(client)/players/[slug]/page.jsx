import { notFound } from "next/navigation";
import PlayerProfile from "@/modules/public/components/directory/PlayerProfile";
import { getPublicPlayerProfile } from "@/modules/tournaments/server/directory";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const player = await getPublicPlayerProfile(params.slug).catch(() => null);
  if (!player) return { title: "Player | Chenanda Hockey" };
  const name = player.displayName || player.playerName;
  return {
    title: `${name} | Chenanda Hockey`,
    description: player.biography || `Official player profile and tournament statistics for ${name}.`,
  };
}

export default async function PlayerProfilePage({ params }) {
  const player = await getPublicPlayerProfile(params.slug);
  if (!player) notFound();
  return <PlayerProfile player={player} />;
}
