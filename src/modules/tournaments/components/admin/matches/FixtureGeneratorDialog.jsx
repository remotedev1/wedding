"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, Loader2, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const display = (value) => value.replaceAll("_", " ");

export function FixtureGeneratorDialog({ tournamentId, onGenerated, onCancel }) {
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ gameId: "", startAt: "", poolCount: 2, slotMinutes: 75, restMinutes: 30, venues: ["Main Stadium"], assignPools: true });
  const [venueText, setVenueText] = useState("Main Stadium");

  useEffect(() => {
    let active = true;
    fetch(`/api/tournaments/games?tournamentId=${tournamentId}&limit=100&status=active`)
      .then((r) => r.json())
      .then((body) => { if (active) setGames(body.data?.games || []); })
      .catch(() => toast.error("Failed to load tournament events"))
      .finally(() => active && setLoadingGames(false));
    return () => { active = false; };
  }, [tournamentId]);

  const selectedGame = useMemo(() => games.find((game) => game.id === form.gameId), [games, form.gameId]);

  const submit = async (commit) => {
    if (!form.gameId || !form.startAt || form.venues.length === 0) return toast.error("Choose an event, start time and at least one venue");
    setSubmitting(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/fixtures/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, poolCount: Number(form.poolCount), slotMinutes: Number(form.slotMinutes), restMinutes: Number(form.restMinutes), startAt: new Date(form.startAt).toISOString(), commit }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Fixture generation failed");
      if (commit) {
        toast.success(body.message || "Fixtures generated");
        onGenerated?.();
      } else setPreview(body.data);
    } catch (error) {
      toast.error(error.message || "Fixture generation failed");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-5">
      <Alert>
        <WandSparkles className="h-4 w-4" />
        <AlertTitle>Auditable fixture generation</AlertTitle>
        <AlertDescription>Uses confirmed event registrations only. Preview first; nothing is written until you confirm.</AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2"><Label>Event</Label><Select value={form.gameId} onValueChange={(gameId) => { const g = games.find((x) => x.id === gameId); setForm((f) => ({ ...f, gameId, slotMinutes: g?.sportType === "FIELD_HOCKEY" ? 75 : f.slotMinutes })); setPreview(null); }}><SelectTrigger><SelectValue placeholder={loadingGames ? "Loading events..." : "Select event"} /></SelectTrigger><SelectContent>{games.map((game) => <SelectItem key={game.id} value={game.id}>{game.name} · {display(game.sportType)}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>First fixture</Label><Input type="datetime-local" value={form.startAt} onChange={(e) => { setForm((f) => ({ ...f, startAt: e.target.value })); setPreview(null); }} /></div>
        <div className="space-y-2"><Label>Number of pools</Label><Input type="number" min="1" max="8" value={form.poolCount} onChange={(e) => { setForm((f) => ({ ...f, poolCount: e.target.value })); setPreview(null); }} /></div>
        <div className="space-y-2"><Label>Match slot (minutes)</Label><Input type="number" min="30" max="360" value={form.slotMinutes} onChange={(e) => { setForm((f) => ({ ...f, slotMinutes: e.target.value })); setPreview(null); }} /></div>
        <div className="space-y-2"><Label>Minimum team rest (minutes)</Label><Input type="number" min="0" max="240" value={form.restMinutes} onChange={(e) => { setForm((f) => ({ ...f, restMinutes: e.target.value })); setPreview(null); }} /></div>
      </div>

      <div className="space-y-2"><Label>Available venues</Label><Input value={venueText} onChange={(event) => { const value = event.target.value; setVenueText(value); setForm((f) => ({ ...f, venues: value.split(",").map((item) => item.trim()).filter(Boolean) })); setPreview(null); }} placeholder="Main Stadium, Ground 2, Practice Turf"/><p className="text-xs text-muted-foreground">Comma-separated. Add as many tournament venues as required.</p></div>
      <label className="flex items-start gap-3 rounded-lg border p-3"><Checkbox checked={form.assignPools} onCheckedChange={(assignPools) => { setForm((f) => ({ ...f, assignPools: Boolean(assignPools) })); setPreview(null); }} /><span><span className="block text-sm font-medium">Balance unassigned teams into pools</span><span className="block text-xs text-muted-foreground">Existing valid pool assignments are preserved.</span></span></label>

      {selectedGame && <p className="text-sm text-muted-foreground">Generating for <strong>{selectedGame.name}</strong>. Existing non-cancelled fixtures for this event will block generation.</p>}

      {preview && <div className="rounded-xl border bg-slate-50 p-4 space-y-3"><div className="flex items-center gap-2 font-medium"><CheckCircle2 className="h-4 w-4 text-emerald-600" />Preview ready: {preview.fixtures?.length || 0} fixtures</div><div className="max-h-56 overflow-auto divide-y text-sm">{preview.fixtures?.map((fixture) => <div key={`${fixture.matchNo}-${fixture.scheduledOn}`} className="py-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><span>#{fixture.matchNo} · Pool {fixture.pool} · {fixture.participants?.[0]?.family} vs {fixture.participants?.[1]?.family}</span><span className="text-muted-foreground">{new Date(fixture.scheduledOn).toLocaleString()} · {display(fixture.venue)}</span></div>)}</div></div>}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" onClick={onCancel} disabled={submitting}>Cancel</Button><Button variant="outline" onClick={() => submit(false)} disabled={submitting}>{submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />}Preview fixtures</Button><Button onClick={() => submit(true)} disabled={submitting || !preview}>{submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}Generate {preview?.fixtures?.length || ""} fixtures</Button></div>
    </div>
  );
}
