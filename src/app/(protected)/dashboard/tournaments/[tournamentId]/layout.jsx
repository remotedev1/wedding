import TournamentWorkspaceNav from "@/modules/tournaments/components/admin/TournamentWorkspaceNav";

export default function TournamentWorkspaceLayout({ children, params }) {
  return <>
    <TournamentWorkspaceNav tournamentId={params.tournamentId}/>
    {children}
  </>;
}
