import VenueManager from "@/modules/tournaments/components/admin/venues/VenueManager";
export default function TournamentVenuesPage({ params }) { return <VenueManager tournamentId={params.tournamentId} />; }
