"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Medal, Plus, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTournament } from "@/modules/tournaments/hooks/useTournament";
import { Can } from "@/modules/auth/components/can";
import { ACTIONS, RESOURCES } from "@/modules/auth/server/resource-authorization";

const SPORTS = ["FIELD_HOCKEY", "FOOTBALL", "CRICKET", "RELAY", "BASKETBALL", "VOLLEYBALL", "KABADDI", "ATHLETICS", "BADMINTON", "TABLE_TENNIS", "TENNIS", "SQUASH", "CARROM", "CHESS", "THROWBALL", "KHO_KHO", "SWIMMING", "WRESTLING", "BOXING", "OTHER"];
const PLACEMENTS = ["FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH", "SEVENTH", "EIGHTH"];
const MEDALS = { FIRST: "🥇", SECOND: "🥈", THIRD: "🥉" };
const label = (value) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default function PlacementsPage() {
  const router = useRouter();
  const { tournamentId } = useParams();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ familyId: "", gameId: "", placement: "FIRST" });
  const { tournament, loading, refresh } = useTournament(tournamentId, { includeParticipation: true, includePlacements: true, includeGames: true });



  async function savePlacement() {
    if (!form.familyId || !form.gameId) return toast.error("Select a family and event");
    setSaving(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/placements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to record placement");
      toast.success("Placement recorded");
      setOpen(false);
      setForm({ familyId: "", gameId: "", placement: "FIRST" });
      refresh();
    } catch (error) { toast.error(error.message); } finally { setSaving(false); }
  }

  async function removePlacement(id) {
    const response = await fetch(`/api/tournaments/${tournamentId}/placements/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error || "Failed to remove placement");
    toast.success("Placement removed");
    refresh();
  }

  if (loading) return <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading tournament results…</div>;
  if (!tournament) return <div className="p-6">Tournament not found.</div>;

  const placements = tournament.placements || [];
  const grouped = placements.reduce((acc, item) => { const key = item.gameId || item.game?.id || item.sport; (acc[key] ||= []).push(item); return acc; }, {});

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => router.push(`/dashboard/tournaments/${tournamentId}`)}><ArrowLeft className="mr-2 h-4 w-4" />Tournament control</Button>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Results & placements</h1>
          <p className="mt-1 text-sm text-slate-500">Record final standings only after match results have been confirmed.</p>
        </div>
        <Can I={ACTIONS.CREATE} a={RESOURCES.PLACEMENT}><Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Record placement</Button></Can>
      </div>

      {placements.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-white"><CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center"><Trophy className="h-9 w-9 text-slate-400" /><h2 className="mt-4 font-semibold text-slate-950">No final standings yet</h2><p className="mt-2 max-w-md text-sm text-slate-500">Complete the required matches, confirm the winner, then record placements for each configured sport.</p></CardContent></Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">{Object.entries(grouped).map(([groupKey, items]) => <Card key={groupKey} className="border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Medal className="h-5 w-5" />{items[0]?.game?.name || label(items[0]?.sport)}</CardTitle></CardHeader><CardContent className="space-y-2">{items.sort((a,b) => PLACEMENTS.indexOf(a.placement)-PLACEMENTS.indexOf(b.placement)).map((item) => <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3"><div className="flex items-center gap-3"><span className="text-xl">{MEDALS[item.placement] || "🏅"}</span><div><p className="font-medium text-slate-950">{item.family?.familyName}</p><Badge variant="secondary" className="mt-1">{label(item.placement)}</Badge></div></div><Can I={ACTIONS.DELETE} a={RESOURCES.PLACEMENT}><Button size="icon" variant="ghost" onClick={() => removePlacement(item.id)} aria-label={`Remove ${item.family?.familyName} placement`}><Trash2 className="h-4 w-4 text-slate-500" /></Button></Can></div>)}</CardContent></Card>)}</div>
      )}

      <Dialog open={open} onOpenChange={setOpen}><DialogContent className="bg-white sm:max-w-lg"><DialogHeader><DialogTitle>Record final placement</DialogTitle><DialogDescription>A sport and placement can only be assigned once per tournament.</DialogDescription></DialogHeader><div className="space-y-4"><div><p className="mb-2 text-sm font-medium">Family</p><Select value={form.familyId} onValueChange={(familyId) => setForm((v) => ({ ...v, familyId }))}><SelectTrigger><SelectValue placeholder="Select registered family" /></SelectTrigger><SelectContent>{(tournament.participation || []).map((p) => <SelectItem key={p.familyId} value={p.familyId}>{p.family?.familyName}</SelectItem>)}</SelectContent></Select></div><div className="grid gap-4 sm:grid-cols-2"><div><p className="mb-2 text-sm font-medium">Event</p><Select value={form.gameId} onValueChange={(gameId) => setForm((v) => ({ ...v, gameId }))}><SelectTrigger><SelectValue placeholder="Select event" /></SelectTrigger><SelectContent>{(tournament.games || []).map((game) => <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>)}</SelectContent></Select></div><div><p className="mb-2 text-sm font-medium">Placement</p><Select value={form.placement} onValueChange={(placement) => setForm((v) => ({ ...v, placement }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PLACEMENTS.map((placement) => <SelectItem key={placement} value={placement}>{label(placement)}</SelectItem>)}</SelectContent></Select></div></div><div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={saving} onClick={savePlacement}>{saving ? "Saving…" : "Record placement"}</Button></div></div></DialogContent></Dialog>
    </div>
  );
}
