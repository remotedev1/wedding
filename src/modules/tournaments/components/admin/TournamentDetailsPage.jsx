"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Edit,
  Gamepad2,
  Medal,
  MapPin,
  Radio,
  ShieldCheck,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { TournamentDetailSkeleton } from "./TournamentSkeleton";
import { TournamentStatusBadge } from "./TournamentStatusBadge";
import { useTournament, useDeleteTournament } from "@/modules/tournaments/hooks/useTournament";
import { formatDate } from "@/modules/tournaments/utils/tournament";
import { Can } from "@/modules/auth/components/can";
import { ACTIONS, RESOURCES } from "@/modules/auth/server/resource-authorization";

const LIVE_STATUSES = new Set(["LIVE", "ONGOING"]);
const CLOSED_MATCH_STATUSES = new Set(["COMPLETED", "CANCELLED", "ABANDONED", "NO_RESULT", "WALKOVER"]);

function sameDay(a, b) {
  const left = new Date(a);
  return left.getFullYear() === b.getFullYear() && left.getMonth() === b.getMonth() && left.getDate() === b.getDate();
}

function StatCard({ label, value, description, icon: Icon }) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowCard({ title, description, value, status, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div className="rounded-xl bg-slate-950 p-2.5 text-white">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-950">{title}</h3>
              {status && <Badge variant="secondary">{status}</Badge>}
            </div>
            <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {value !== undefined && <span className="text-lg font-semibold text-slate-900">{value}</span>}
          <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
}

export default function TournamentDetailPage() {
  const router = useRouter();
  const { tournamentId } = useParams();
  const [deleteDialog, setDeleteDialog] = useState(false);

  const { tournament, loading } = useTournament(tournamentId, {
    includeParticipation: true,
    includeMatches: true,
    includePlacements: true,
    includeGames: true,
  });
  const { deleteTournament, deleting } = useDeleteTournament();

  const operations = useMemo(() => {
    if (!tournament) return null;

    const games = tournament.games || [];
    const matches = tournament.matches || [];
    const participation = tournament.participation || [];
    const placements = tournament.placements || [];
    const today = new Date();

    const liveMatches = matches.filter((match) => LIVE_STATUSES.has(match.status));
    const todayMatches = matches.filter((match) => sameDay(match.scheduledOn, today));
    const completedMatches = matches.filter((match) => CLOSED_MATCH_STATUSES.has(match.status));
    const pendingRegistrations = participation.flatMap((item) => item.gameRegistrations || []).filter((item) => item.status === "PENDING");
    const unpaidRegistrations = participation.flatMap((item) => item.gameRegistrations || []).filter((item) => item.paymentStatus && item.paymentStatus !== "COMPLETED");

    const readinessChecks = [
      { label: "Tournament dates configured", ready: Boolean(tournament.startDate && tournament.endDate) },
      { label: "At least one game/event configured", ready: games.length > 0 },
      { label: "Families registered", ready: participation.length > 0 },
      { label: "Fixtures scheduled", ready: matches.length > 0 },
    ];
    const readyCount = readinessChecks.filter((item) => item.ready).length;

    return {
      games,
      matches,
      participation,
      placements,
      liveMatches,
      todayMatches,
      completedMatches,
      pendingRegistrations,
      unpaidRegistrations,
      readinessChecks,
      readinessPercent: Math.round((readyCount / readinessChecks.length) * 100),
    };
  }, [tournament]);

  async function handleDelete() {
    if (!tournament) return;
    await deleteTournament(tournament.id, tournament.name);
    setDeleteDialog(false);
    router.push("/dashboard/tournaments");
  }

  if (loading) return <TournamentDetailSkeleton />;

  if (!tournament || !operations) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <Trophy className="h-10 w-10 text-slate-400" />
        <h2 className="mt-4 text-xl font-semibold text-slate-950">Tournament not found</h2>
        <p className="mt-2 text-sm text-slate-500">This tournament is unavailable or you no longer have access to it.</p>
        <Button className="mt-5" onClick={() => router.push("/dashboard/tournaments")}>Back to tournaments</Button>
      </div>
    );
  }

  const nextMatch = operations.matches.find((match) => !CLOSED_MATCH_STATUSES.has(match.status) && new Date(match.scheduledOn) >= new Date());

  return (
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-950 px-5 py-6 text-white sm:px-7">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/tournaments")}
            className="mb-4 -ml-2 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to tournaments
          </Button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{tournament.name}</h1>
                <TournamentStatusBadge status={tournament.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
                <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatDate(tournament.startDate)} – {formatDate(tournament.endDate)}</span>
                <span>{tournament.year}</span>
                <span>{operations.games.length} configured event{operations.games.length === 1 ? "" : "s"}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button className="bg-red-700 text-white hover:bg-red-600" onClick={() => router.push(`/dashboard/tournaments/${tournament.id}/operations`)}>
                <Radio className="mr-2 h-4 w-4" /> Open operations
              </Button>
              <Can I={ACTIONS.UPDATE} a={RESOURCES.TOURNAMENT}>
                <Button variant="secondary" onClick={() => router.push(`/dashboard/tournaments/${tournament.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit tournament
                </Button>
              </Can>
              <Can I={ACTIONS.DELETE} a={RESOURCES.TOURNAMENT}>
                <Button variant="outline" onClick={() => setDeleteDialog(true)} className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </Can>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Next match</p><p className="mt-2 font-semibold text-slate-950">{nextMatch ? `Match #${nextMatch.matchNo}` : "Not scheduled"}</p><p className="mt-1 text-xs text-slate-500">{nextMatch ? formatDate(nextMatch.scheduledOn) : "Create fixtures when teams are ready"}</p></div>
          <div className="bg-white p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Live now</p><p className="mt-2 font-semibold text-slate-950">{operations.liveMatches.length}</p><p className="mt-1 text-xs text-slate-500">Matches requiring scorer attention</p></div>
          <div className="bg-white p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pending registrations</p><p className="mt-2 font-semibold text-slate-950">{operations.pendingRegistrations.length}</p><p className="mt-1 text-xs text-slate-500">Game entries awaiting confirmation</p></div>
          <div className="bg-white p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Operational readiness</p><div className="mt-2 flex items-center gap-3"><Progress value={operations.readinessPercent} className="h-2" /><span className="text-sm font-semibold text-slate-950">{operations.readinessPercent}%</span></div><p className="mt-1 text-xs text-slate-500">Core setup checks completed</p></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Families" value={operations.participation.length} description="Tournament participants" icon={Users} />
        <StatCard label="Games / events" value={operations.games.length} description="Configured competition categories" icon={Gamepad2} />
        <StatCard label="Matches" value={operations.matches.length} description={`${operations.todayMatches.length} scheduled today`} icon={Trophy} />
        <StatCard label="Completed" value={operations.completedMatches.length} description={`${operations.placements.length} placements recorded`} icon={CheckCircle2} />
      </section>

      {(operations.pendingRegistrations.length > 0 || operations.unpaidRegistrations.length > 0 || operations.games.length === 0 || operations.matches.length === 0) && (
        <Card className="border-amber-200 bg-amber-50/70 shadow-none">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base text-amber-950"><AlertTriangle className="h-5 w-5" />Operational attention</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm text-amber-950 md:grid-cols-2">
            {operations.games.length === 0 && <p>• Configure at least one game/event before opening tournament operations.</p>}
            {operations.matches.length === 0 && <p>• No fixtures are scheduled yet.</p>}
            {operations.pendingRegistrations.length > 0 && <p>• {operations.pendingRegistrations.length} game registration(s) are awaiting confirmation.</p>}
            {operations.unpaidRegistrations.length > 0 && <p>• {operations.unpaidRegistrations.length} registration(s) have incomplete payment status.</p>}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-950">Tournament workflow</CardTitle>
            <p className="text-sm text-slate-500">Use this sequence to run the tournament without jumping between unrelated admin screens.</p>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <WorkflowCard title="Operations hub" description="Run the tournament from live status, exceptions, staffing and readiness in one place." value={operations.liveMatches.length} status={operations.liveMatches.length ? "Live" : "Ready"} icon={Radio} onClick={() => router.push(`/dashboard/tournaments/${tournament.id}/operations`)} />
            <WorkflowCard title="Games & categories" description="Configure hockey or other sporting events, formats and event dates." value={operations.games.length} icon={Gamepad2} onClick={() => router.push(`/dashboard/tournaments/${tournament.id}/games`)} />
            <WorkflowCard title="Families & registrations" description="Review participating families and their game registrations." value={operations.participation.length} icon={Users} onClick={() => router.push(`/dashboard/tournaments/${tournament.id}/participants`)} />
            <WorkflowCard title="Venues & grounds" description="Configure tournament grounds, locations and active playing areas." icon={MapPin} onClick={() => router.push(`/dashboard/tournaments/${tournament.id}/venues`)} />
            <WorkflowCard title="Fixture operations" description="Day-by-day schedule board with venue, rest, staffing and publication checks." value={operations.matches.length} icon={CalendarDays} onClick={() => router.push(`/dashboard/tournaments/${tournament.id}/schedule`)} />
            <WorkflowCard title="Match administration" description="Review match records, scoring state and direct match-control entry points." value={operations.matches.length} icon={CalendarDays} onClick={() => router.push(`/dashboard/tournaments/${tournament.id}/matches`)} />
            <WorkflowCard title="Live scoring" description="Open active fixtures and operate scorer controls during play." value={operations.liveMatches.length} status={operations.liveMatches.length ? "Live" : "Standby"} icon={Radio} onClick={() => router.push(`/dashboard/tournaments/${tournament.id}/matches`)} />
            <WorkflowCard title="Staff & officials" description="Assign scorers, referees and technical staff; review workload and coverage." value={operations.matches.length} icon={Users} onClick={() => router.push(`/dashboard/tournaments/${tournament.id}/staff`)} />
            <WorkflowCard title="Results & progression" description="Review authoritative pool standings, qualifiers, knockout progression and champions." value={operations.placements.length} icon={Medal} onClick={() => router.push(`/dashboard/tournaments/${tournament.id}/results`)} />
            <WorkflowCard title="Sponsors" description="Manage tournament sponsor records and visibility." icon={ShieldCheck} onClick={() => router.push("/dashboard/tournaments/sponsors")} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-lg text-slate-950">Readiness checklist</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {operations.readinessChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-3 text-sm">
                  {check.ready ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <Clock3 className="h-4 w-4 shrink-0 text-amber-600" />}
                  <span className={check.ready ? "text-slate-700" : "font-medium text-slate-900"}>{check.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-lg text-slate-950">Tournament information</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p><p className="mt-1 font-medium text-slate-900">{String(tournament.status).replaceAll("_", " ")}</p></div>
              <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Duration</p><p className="mt-1 font-medium text-slate-900">{formatDate(tournament.startDate)} – {formatDate(tournament.endDate)}</p></div>
              {tournament.description && <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</p><p className="mt-1 leading-6 text-slate-600">{tournament.description}</p></div>}
            </CardContent>
          </Card>
        </div>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialog}
        onOpenChange={setDeleteDialog}
        onConfirm={handleDelete}
        title="Delete tournament"
        description="Tournaments with operational data are cancelled instead of being permanently removed."
        itemName={tournament.name}
        loading={deleting}
      />
    </div>
  );
}
