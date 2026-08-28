import { notFound } from "next/navigation";
import EventCenter from "@/modules/tournaments/components/public/EventCenter";
import { getPublicTournamentEvent } from "@/modules/tournaments/server/public";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const event = await getPublicTournamentEvent(params.eventId).catch(() => null);
  if (!event) return { title: "Event | Chenanda Hockey" };
  return {
    title: `${event.shortName || event.name} | Chenanda Hockey`,
    description: event.description || `Official fixtures, standings, teams and results for ${event.name}.`,
  };
}

export default async function TournamentEventPage({ params }) {
  const event = await getPublicTournamentEvent(params.eventId);
  if (!event) notFound();
  return <EventCenter event={event} />;
}
