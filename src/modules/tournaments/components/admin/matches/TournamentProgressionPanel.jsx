"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy, RefreshCw, GitBranch, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Can } from "@/modules/auth/components/can";
import { ACTIONS, RESOURCES } from "@/modules/auth/server/resource-authorization";

const formatLabel = (value = "") => value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function TournamentProgressionPanel({ tournamentId, games = [], onGenerated }) {
  const [gameId, setGameId] = useState(games[0]?.id || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [startAt, setStartAt] = useState("");
  const [venues, setVenues] = useState(["Main Stadium", "Ground 2"]);
  const [venueText, setVenueText] = useState("Main Stadium, Ground 2");
  const selectedGame = useMemo(() => games.find((g) => g.id === gameId), [games, gameId]);

  async function loadStandings() {
    if (!gameId) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/standings?gameId=${gameId}`, { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Unable to load standings");
      setData(body.data);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  useEffect(() => { if (gameId) loadStandings(); }, [gameId]);

  async function generate(commit = false) {
    if (!gameId || !startAt || !venues.length) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/knockout/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, startAt: new Date(startAt).toISOString(), venues, slotMinutes: 90, preview: !commit }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Unable to generate knockout fixtures");
      if (commit) { setPreview(null); onGenerated?.(); await loadStandings(); }
      else setPreview(body.data);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  if (!games.length) return null;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle className="flex items-center gap-2 text-lg"><Trophy className="h-5 w-5" />Standings & qualification</CardTitle><p className="mt-1 text-sm text-slate-500">Pool tables are calculated only from completed results. Knockout fixtures use the top two families from each pool.</p></div>
          <Button variant="outline" size="sm" onClick={loadStandings} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="text-sm font-medium text-slate-700">Event<select className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={gameId} onChange={(e) => { setGameId(e.target.value); setPreview(null); }}>{games.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}</select></label>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm"><p className="font-medium text-slate-900">{selectedGame?.name}</p><p className="mt-1 text-xs text-slate-500">{formatLabel(selectedGame?.sportType)} · {formatLabel(selectedGame?.category)}</p></div>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {data?.pools?.length ? <div className="grid gap-4 xl:grid-cols-2">{data.pools.map((pool) => <div key={pool.pool} className="overflow-hidden rounded-xl border border-slate-200"><div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold">Pool {pool.pool}</div><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead className="text-xs text-slate-500"><tr className="border-b"><th className="px-3 py-2 text-left">#</th><th className="px-3 py-2 text-left">Family</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead><tbody>{pool.standings.map((row) => <tr key={row.familyId} className={row.position <= 2 ? "bg-emerald-50/50" : "border-t border-slate-100"}><td className="px-3 py-2 font-semibold">{row.position}</td><td className="px-3 py-2 font-medium">{row.family}{row.position <= 2 && <ShieldCheck className="ml-2 inline h-3.5 w-3.5 text-emerald-600" />}</td><td className="text-center">{row.played}</td><td className="text-center">{row.won}</td><td className="text-center">{row.drawn}</td><td className="text-center">{row.lost}</td><td className="text-center">{row.goalsFor}</td><td className="text-center">{row.goalsAgainst}</td><td className="text-center">{row.goalDifference}</td><td className="text-center font-semibold">{row.points}</td></tr>)}</tbody></table></div></div>)}</div> : <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No completed pool results are available for this event yet.</div>}

        <Can I={ACTIONS.CREATE} a={RESOURCES.MATCH}>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 font-semibold text-slate-900"><GitBranch className="h-4 w-4" />Knockout qualification</div>
            <p className="mt-1 text-xs text-slate-500">Requires every pool fixture to be complete. Supports 2 pools → semifinals and 4 pools → quarter-finals.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2"><label className="text-sm">First knockout start<input type="datetime-local" className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3" value={startAt} onChange={(e) => setStartAt(e.target.value)} /></label><label className="text-sm">Venues<input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3" value={venueText} onChange={(e) => { const value = e.target.value; setVenueText(value); setVenues(value.split(",").map((item) => item.trim()).filter(Boolean)); }} placeholder="Main Stadium, Ground 2" /></label></div>
            <div className="mt-3 flex gap-2"><Button variant="outline" disabled={loading || !startAt} onClick={() => generate(false)}>Preview knockout</Button>{preview && <Button disabled={loading} onClick={() => generate(true)}>Generate {formatLabel(preview.round)}</Button>}</div>
            {preview && <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>{preview.fixtures.map((fixture) => <div key={fixture.matchNo} className="flex flex-col justify-between gap-1 rounded-md border bg-white px-3 py-2 text-sm sm:flex-row"><span className="font-medium">{fixture.participants[0].family} vs {fixture.participants[1].family}</span><span className="text-slate-500">{new Date(fixture.scheduledOn).toLocaleString()} · {formatLabel(fixture.venue)}</span></div>)}</div>}
          </div>
        </Can>
      </CardContent>
    </Card>
  );
}
