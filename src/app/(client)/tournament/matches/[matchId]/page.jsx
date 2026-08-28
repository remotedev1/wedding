import { notFound } from "next/navigation";
import PublicMatchCenter from "@/modules/tournaments/components/public/PublicMatchCenter";
import { getPublicMatchDetail } from "@/modules/tournaments/server/public";

export const dynamic = "force-dynamic";


export async function generateMetadata({ params }) {
  const match = await getPublicMatchDetail(params.matchId).catch(() => null);
  if (!match) return { title: "Match | Chenanda Hockey" };
  const [home, away] = match.participants || [];
  const title = `${home?.family || "TBD"} vs ${away?.family || "TBD"} | ${match.game?.shortName || match.game?.name || "Match"}`;
  const description = match.status === "LIVE"
    ? `Live official score: ${home?.family || "TBD"} ${home?.score ?? 0}-${away?.score ?? 0} ${away?.family || "TBD"}.`
    : `Official match centre for ${home?.family || "TBD"} vs ${away?.family || "TBD"}, including result, timeline and statistics.`;
  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: { title, description, type: "article" },
  };
}


export default async function PublicMatchPage({ params }) {
  const match = await getPublicMatchDetail(params.matchId);
  if (!match) notFound();
  return <PublicMatchCenter match={match} />;
}
