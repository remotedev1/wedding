"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, Filter, Plus, Search, Trash2, Users, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { useTournament } from "@/modules/tournaments/hooks/useTournament";
import { Can } from "@/modules/auth/components/can";
import { ACTIONS, RESOURCES } from "@/modules/auth/server/resource-authorization";
import { RosterManagerDialog } from "./RosterManagerDialog";
import { evaluateRegistrationReadiness } from "@/modules/registrations/server/readiness";

const titleCase = (value) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "WAITLISTED", "REJECTED", "CANCELLED"];
const POOLS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function ParticipantsPage() {
  const router = useRouter();
  const { tournamentId } = useParams();
  const [search, setSearch] = useState("");
  const [readinessFilter, setReadinessFilter] = useState("ALL");
  const [addOpen, setAddOpen] = useState(false);
  const [familyId, setFamilyId] = useState("");
  const [families, setFamilies] = useState([]);
  const [saving, setSaving] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [rosterTarget, setRosterTarget] = useState(null);
  const { tournament, loading, refresh } = useTournament(tournamentId, { includeParticipation: true, includeGames: true });

  useEffect(() => {
    if (!addOpen) return;
    fetch("/api/tournaments/families/list?limit=100")
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => { if (!ok) throw new Error(data.error || "Unable to load families"); setFamilies(data.data?.families || []); })
      .catch((error) => toast.error(error.message));
  }, [addOpen]);

  const participants = tournament?.participation || [];
  const registeredIds = useMemo(() => new Set(participants.map((p) => p.familyId)), [participants]);
  const availableFamilies = families.filter((family) => !registeredIds.has(family.id));
  const registrations = participants.flatMap((p) => (p.gameRegistrations || []).map((r) => {
    const item = { ...r, participationId: p.id, familyName: p.family?.familyName, activePlayers: p.family?._count?.players || 0 };
    return { ...item, readiness: evaluateRegistrationReadiness(item) };
  }));
  const filtered = participants.filter((p) => {
    const nameMatches = (p.family?.familyName || "").toLowerCase().includes(search.toLowerCase());
    if (!nameMatches) return false;
    const regs = registrations.filter((r) => r.participationId === p.id);
    if (readinessFilter === "READY") return regs.some((r) => r.readiness.ready);
    if (readinessFilter === "ACTION") return regs.some((r) => !r.readiness.ready);
    if (readinessFilter === "PENDING") return regs.some((r) => r.status === "PENDING");
    return true;
  });
  const confirmed = registrations.filter((r) => r.status === "CONFIRMED").length;
  const pending = registrations.filter((r) => r.status === "PENDING").length;
  const unpaid = registrations.filter((r) => !r.readiness.paymentReady).length;
  const ready = registrations.filter((r) => r.readiness.ready).length;
  const blocked = registrations.filter((r) => !r.readiness.ready).length;

  async function addFamily() {
    if (!familyId) return toast.error("Select a family");
    setSaving(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/participants`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ familyId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to register family");
      toast.success("Family added to tournament"); setFamilyId(""); setAddOpen(false); refresh();
    } catch (error) { toast.error(error.message); } finally { setSaving(false); }
  }

  async function addEventRegistration(participationId, gameId) {
    if (!gameId) return;
    const response = await fetch(`/api/tournaments/${tournamentId}/participants/${participationId}/registrations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gameId }) });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error || "Unable to add event registration");
    toast.success("Event registration added"); refresh();
  }

  async function updateRegistration(registration, patch) {
    const response = await fetch(`/api/tournaments/${tournamentId}/participants/${registration.participationId}/registrations/${registration.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error || "Unable to update registration");
    toast.success("Registration updated"); refresh();
  }

  async function applyBulkStatus() {
    if (!selected.length || !bulkStatus) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/registrations/bulk`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationIds: selected, status: bulkStatus }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update selected registrations");
      toast.success(`${data.data?.count || selected.length} registrations updated`); setSelected([]); setBulkStatus(""); refresh();
    } catch (error) { toast.error(error.message); } finally { setSaving(false); }
  }

  async function removeFamily() {
    if (!removeTarget) return;
    const response = await fetch(`/api/tournaments/${tournamentId}/participants/${removeTarget.id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error || "Failed to remove family");
    toast.success("Family removed from tournament"); setRemoveTarget(null); refresh();
  }

  function exportCsv() {
    const rows = [["Family", "Event", "Status", "Pool", "Payment", "Amount", "Active Players"]];
    registrations.forEach((r) => rows.push([r.familyName || "", r.game?.name || "", r.status, r.pool || "", r.paymentStatus, r.paymentAmount || 0, r.activePlayers]));
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${tournament.name}-registrations.csv`; anchor.click(); URL.revokeObjectURL(url);
  }

  if (loading) return <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading registrations…</div>;
  if (!tournament) return <div className="p-6">Tournament not found.</div>;

  return <div className="space-y-6 pb-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => router.push(`/dashboard/tournaments/${tournamentId}`)}><ArrowLeft className="mr-2 h-4 w-4" />Tournament control</Button><h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Registration control</h1><p className="mt-1 text-sm text-slate-500">Review family entries, roster readiness, payment state and event confirmation for {tournament.name}.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={exportCsv} disabled={!registrations.length}><Download className="mr-2 h-4 w-4" />Export CSV</Button><Can I={ACTIONS.CREATE} a={RESOURCES.PARTICIPATION}><Button onClick={() => setAddOpen(true)}><Plus className="mr-2 h-4 w-4" />Add family</Button></Can></div></div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">{[["Families",participants.length],["Event entries",registrations.length],["Confirmed",confirmed],["Ready",ready],["Needs action",blocked],["Payment pending",unpaid]].map(([name,value]) => <Card key={name} className="border-slate-200 bg-white shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">{name}</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-slate-950">{value}</p></CardContent></Card>)}</div>

    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between"><div className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" placeholder="Search registered families…" value={search} onChange={(event) => setSearch(event.target.value)} /></div><Select value={readinessFilter} onValueChange={setReadinessFilter}><SelectTrigger className="w-44"><Filter className="mr-2 h-4 w-4 text-slate-400"/><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All entries</SelectItem><SelectItem value="READY">Ready</SelectItem><SelectItem value="ACTION">Needs action</SelectItem><SelectItem value="PENDING">Pending review</SelectItem></SelectContent></Select><div className="flex flex-wrap items-center gap-2"><span className="text-sm text-slate-500">{selected.length} selected</span><Select value={bulkStatus} onValueChange={setBulkStatus}><SelectTrigger className="w-44"><SelectValue placeholder="Bulk status" /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{titleCase(status)}</SelectItem>)}</SelectContent></Select><Button variant="outline" disabled={!selected.length || !bulkStatus || saving} onClick={applyBulkStatus}>Apply</Button></div></div>

    {filtered.length === 0 ? <Card className="border-dashed border-slate-300 bg-white"><CardContent className="flex min-h-60 flex-col items-center justify-center p-8 text-center"><Users className="h-9 w-9 text-slate-400" /><h2 className="mt-4 font-semibold text-slate-950">{search ? "No matching family" : "No families registered"}</h2></CardContent></Card> : <div className="space-y-4">{filtered.map((p) => { const regs = p.gameRegistrations || []; const activePlayers = p.family?._count?.players || 0; return <Card key={p.id} className="border-slate-200 bg-white shadow-sm"><CardContent className="p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-semibold text-slate-950">{p.family?.familyName}</h2><p className="mt-1 text-xs text-slate-500">Registered {new Date(p.registeredAt).toLocaleDateString()} · {p.registeredVia}</p><p className={`mt-2 text-xs ${activePlayers ? "text-emerald-700" : "text-amber-700"}`}>{activePlayers ? `${activePlayers} active player${activePlayers === 1 ? "" : "s"} on roster` : "Roster not ready — no active players"}</p></div><Can I={ACTIONS.DELETE} a={RESOURCES.PARTICIPATION}><Button variant="ghost" size="icon" onClick={() => setRemoveTarget(p)} aria-label={`Remove ${p.family?.familyName}`}><Trash2 className="h-4 w-4 text-slate-500" /></Button></Can></div><div className="mt-4 space-y-3 border-t border-slate-100 pt-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Event entries</p>{(tournament.games || []).some((game) => !regs.some((reg) => reg.gameId === game.id)) && <Select onValueChange={(gameId) => addEventRegistration(p.id, gameId)}><SelectTrigger className="w-48"><SelectValue placeholder="Add event" /></SelectTrigger><SelectContent>{(tournament.games || []).filter((game) => !regs.some((reg) => reg.gameId === game.id) && game.isActive !== false).map((game) => <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>)}</SelectContent></Select>}</div>{regs.length ? regs.map((reg) => <div key={reg.id} className={`grid gap-3 rounded-xl border p-3 lg:grid-cols-[28px_1fr_150px_110px_170px] lg:items-center ${reg.readiness?.ready ? "border-emerald-200 bg-emerald-50/30" : "border-amber-200 bg-amber-50/30"}`}><Checkbox checked={selected.includes(reg.id)} onCheckedChange={(checked) => setSelected((current) => checked ? [...current, reg.id] : current.filter((id) => id !== reg.id))} /><div><p className="text-sm font-medium text-slate-950">{reg.game?.name || titleCase(reg.game?.sportType)}</p>{reg.registrationReference && <p className="mt-0.5 font-mono text-[11px] text-slate-500">{reg.registrationReference}</p>}<div className="mt-1 flex flex-wrap gap-2"><Badge variant="secondary">{titleCase(reg.game?.category)}</Badge><Badge variant={reg.paymentStatus === "COMPLETED" ? "default" : "outline"}>₹{Number(reg.paymentAmount || 0).toLocaleString("en-IN")} · {titleCase(reg.paymentStatus)}</Badge>{reg.readiness?.ready ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle2 className="mr-1 h-3 w-3"/>Ready</Badge> : <Badge variant="outline" className="border-amber-300 text-amber-700"><AlertTriangle className="mr-1 h-3 w-3"/>Needs action</Badge>}</div>{!reg.readiness?.ready && <p className="mt-1 text-[11px] font-medium text-amber-800">{reg.readiness?.reasons?.join(" · ")}</p>}</div><Select value={reg.status} onValueChange={(status) => updateRegistration({ ...reg, participationId: p.id }, { status })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{titleCase(status)}</SelectItem>)}</SelectContent></Select><Select value={reg.pool || "NONE"} onValueChange={(pool) => updateRegistration({ ...reg, participationId: p.id }, { pool: pool === "NONE" ? null : pool })}><SelectTrigger><SelectValue placeholder="Pool" /></SelectTrigger><SelectContent><SelectItem value="NONE">No pool</SelectItem>{POOLS.map((pool) => <SelectItem key={pool} value={pool}>Pool {pool}</SelectItem>)}</SelectContent></Select><div className="flex items-center justify-between gap-2"><span className="text-xs text-slate-500">{reg.roster?.length && reg.managerName ? `${reg.roster.length} rostered · Team sheet ready` : reg.status === "CONFIRMED" ? `${reg.roster?.length || 0} rostered` : reg.status === "PENDING" ? "Awaiting review" : titleCase(reg.status)}</span><Button type="button" size="sm" variant="outline" onClick={() => setRosterTarget({ participationId: p.id, registration: reg })}><UsersRound className="mr-1.5 h-3.5 w-3.5" />Roster</Button></div></div>) : <p className="text-sm text-slate-500">No event entries yet.</p>}</div></CardContent></Card>; })}</div>}

    <Dialog open={addOpen} onOpenChange={setAddOpen}><DialogContent className="bg-white sm:max-w-lg"><DialogHeader><DialogTitle>Add family to tournament</DialogTitle><DialogDescription>This creates tournament participation. Event registrations can then be submitted or managed separately.</DialogDescription></DialogHeader><div className="space-y-4"><Select value={familyId} onValueChange={setFamilyId}><SelectTrigger><SelectValue placeholder="Select a family" /></SelectTrigger><SelectContent>{availableFamilies.map((family) => <SelectItem key={family.id} value={family.id}>{family.familyName}</SelectItem>)}</SelectContent></Select><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button disabled={saving || !familyId} onClick={addFamily}>{saving ? "Adding…" : "Add family"}</Button></div></div></DialogContent></Dialog>
    <DeleteConfirmationDialog open={Boolean(removeTarget)} onOpenChange={(open) => !open && setRemoveTarget(null)} onConfirm={removeFamily} title="Remove family from tournament" description="A family with event registrations cannot be removed until those entries are cleared." itemName={removeTarget?.family?.familyName} />
    <RosterManagerDialog open={Boolean(rosterTarget)} onOpenChange={(open) => !open && setRosterTarget(null)} tournamentId={tournamentId} participationId={rosterTarget?.participationId} registration={rosterTarget?.registration} onSaved={refresh} />
  </div>;
}
