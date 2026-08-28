import { notFound } from "next/navigation";
import TeamProfile from "@/modules/public/components/directory/TeamProfile";
import { getPublicFamilyProfile } from "@/modules/tournaments/server/directory";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const team = await getPublicFamilyProfile(params.slug).catch(() => null);
  if (!team) return { title: "Team | Chenanda Hockey" };
  return {
    title: `${team.familyName} | Chenanda Hockey`,
    description: team.description || `Official ${team.familyName} team profile, roster, results and tournament honours.`,
  };
}

export default async function TeamProfilePage({ params }) {
  const team = await getPublicFamilyProfile(params.slug);
  if (!team) notFound();
  return <TeamProfile team={team} />;
}
