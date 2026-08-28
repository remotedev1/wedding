"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, CreditCard, FileText, Loader2, LockKeyhole, Printer, ShieldCheck, Trophy, UsersRound } from "lucide-react";
import { toast } from "sonner";

const titleCase = (value) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const money = (minor) => `₹${(Number(minor || 0) / 100).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export function RegistrationConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const access = searchParams.get("access") || "";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [managerName, setManagerName] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [selected, setSelected] = useState([]);
  const [captainPlayerId, setCaptainPlayerId] = useState("");
  const [goalkeeperPlayerId, setGoalkeeperPlayerId] = useState("");

  const endpoint = `/api/public/registrations/context?access=${encodeURIComponent(access)}`;

  async function load() {
    if (!access) { setLoading(false); return; }
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load registration");
      setData(body.data);
      const roster = body.data.registration?.roster || [];
      setManagerName(body.data.registration?.managerName || "");
      setManagerPhone(body.data.registration?.managerPhone || "");
      setSelected(roster.map((member) => member.playerId));
      setCaptainPlayerId(body.data.registration?.captainPlayerId || "");
      setGoalkeeperPlayerId(roster.find((member) => member.role === "GOALKEEPER")?.playerId || "");
    } catch (error) {
      toast.error(error.message);
      setData({ error: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [access]);

  const selectedPlayers = useMemo(() => {
    const map = new Map((data?.availablePlayers || []).map((player) => [player.id, player]));
    return selected.map((id) => map.get(id)).filter(Boolean);
  }, [data, selected]);

  function toggle(id, checked) {
    setSelected((current) => checked ? [...new Set([...current, id])] : current.filter((value) => value !== id));
    if (!checked && captainPlayerId === id) setCaptainPlayerId("");
    if (!checked && goalkeeperPlayerId === id) setGoalkeeperPlayerId("");
  }

  async function saveTeamEntry() {
    if (!managerName.trim()) return toast.error("Enter the team manager / representative name");
    if (!managerPhone.trim()) return toast.error("Enter a contact number");
    if (!selected.length) return toast.error("Select the team roster");
    setSaving(true);
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          managerName: managerName.trim(),
          managerPhone: managerPhone.trim(),
          playerIds: selected,
          captainPlayerId: captainPlayerId || null,
          goalkeeperPlayerId: goalkeeperPlayerId || null,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to save team entry");
      toast.success("Team entry saved");
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="mx-auto max-w-5xl px-4 py-20 text-sm text-slate-500">Loading official registration…</main>;
  if (!access || data?.error || !data) return <main className="mx-auto max-w-3xl px-4 py-20"><Card><CardHeader><CardTitle>Registration link unavailable</CardTitle><CardDescription>{data?.error || "This confirmation link is missing or invalid."}</CardDescription></CardHeader></Card></main>;

  const registration = data.registration;
  const rosterLocked = data.rosterLocked;
  const minRoster = Number(data.game?.minRosterSize || 0);
  const maxRoster = Number(data.game?.maxRosterSize || 40);

  return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:mb-5">
      <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Official tournament registration</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{data.family.familyName}</h1><p className="mt-2 text-sm text-slate-600">{data.tournament.name} · {data.game.name}</p></div>
      <Button variant="outline" onClick={() => window.print()} className="print:hidden"><Printer className="mr-2 h-4 w-4"/>Print confirmation</Button>
    </div>

    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-950 text-white"><div className="flex flex-wrap items-start justify-between gap-4"><div><CardTitle className="text-white">Registration confirmed in system</CardTitle><CardDescription className="mt-1 text-slate-300">Keep this reference for tournament communication.</CardDescription></div><Badge className="bg-white text-slate-950 hover:bg-white">{registration.reference}</Badge></div></CardHeader>
          <CardContent className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div><p className="text-xs uppercase tracking-wide text-slate-500">Event</p><p className="mt-1 font-semibold text-slate-950">{data.game.name}</p><p className="text-sm text-slate-500">{titleCase(data.game.sportType)} · {titleCase(data.game.category)}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-500">Entry status</p><div className="mt-1 flex items-center gap-2"><Badge variant={registration.status === "CONFIRMED" ? "default" : "outline"}>{titleCase(registration.status)}</Badge><span className="text-xs text-slate-500">Tournament approval</span></div></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-500">Registered</p><p className="mt-1 font-medium">{new Date(registration.registeredAt).toLocaleString("en-IN")}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-500">Fee</p><p className="mt-1 font-semibold">{money(registration.paymentAmountMinor)}</p></div>
          </CardContent>
        </Card>

        {data.paymentComplete ? <Card className="border-emerald-200 bg-emerald-50/40"><CardContent className="flex gap-3 p-5"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"/><div><p className="font-semibold text-emerald-950">Payment complete</p><p className="mt-1 text-sm text-emerald-800">{data.payment?.receiptNumber ? `Receipt ${data.payment.receiptNumber}` : Number(registration.paymentAmountMinor) === 0 ? "This is a free event; no payment was required." : "The registration fee has been settled."}</p>{data.payment?.transactionId && !String(data.payment.transactionId).startsWith("pending:") && <p className="mt-1 font-mono text-xs text-emerald-700">Transaction {data.payment.transactionId}</p>}</div></CardContent></Card> : <Card className="border-amber-200 bg-amber-50/40"><CardContent className="p-5"><div className="flex gap-3"><CreditCard className="mt-0.5 h-5 w-5 text-amber-700"/><div className="flex-1"><p className="font-semibold text-amber-950">Payment outstanding</p><p className="mt-1 text-sm text-amber-800">Your event entry exists and cannot be duplicated. Complete the outstanding payment to continue with the official team sheet.</p>{data.paymentUrl && <Button className="mt-4" onClick={() => router.push(data.paymentUrl)}><CreditCard className="mr-2 h-4 w-4"/>Continue payment</Button>}</div></div></CardContent></Card>}

        {data.paymentComplete && <Card className="border-slate-200 shadow-sm"><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="flex items-center gap-2"><UsersRound className="h-5 w-5"/>Team entry</CardTitle><CardDescription>Submit the representative details and official event roster. No login is required for this secure registration link.</CardDescription></div>{data.rosterComplete && <Badge className="bg-emerald-700">Team sheet complete</Badge>}</div></CardHeader><CardContent className="space-y-5">
          {rosterLocked && <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"><LockKeyhole className="mt-0.5 h-5 w-5 text-amber-700"/><div><p className="font-semibold text-amber-950">Roster locked</p><p className="mt-1 text-sm text-amber-800">Competition for this event has started. Contact tournament administration for exceptional corrections.</p></div></div>}
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Team manager / representative</Label><Input value={managerName} onChange={(e) => setManagerName(e.target.value)} disabled={rosterLocked} placeholder="Full name" /></div><div className="space-y-2"><Label>Contact number</Label><Input value={managerPhone} onChange={(e) => setManagerPhone(e.target.value)} disabled={rosterLocked} placeholder="Mobile number" inputMode="tel" /></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Captain</Label><Select value={captainPlayerId || "NONE"} onValueChange={(v) => setCaptainPlayerId(v === "NONE" ? "" : v)} disabled={rosterLocked || !selected.length}><SelectTrigger><SelectValue placeholder="Select captain"/></SelectTrigger><SelectContent><SelectItem value="NONE">No captain selected</SelectItem>{selectedPlayers.map((player) => <SelectItem key={player.id} value={player.id}>{player.playerName}{player.jerseyNumber != null ? ` · #${player.jerseyNumber}` : ""}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Goalkeeper</Label><Select value={goalkeeperPlayerId || "NONE"} onValueChange={(v) => setGoalkeeperPlayerId(v === "NONE" ? "" : v)} disabled={rosterLocked || !selected.length}><SelectTrigger><SelectValue placeholder="Select goalkeeper"/></SelectTrigger><SelectContent><SelectItem value="NONE">No goalkeeper selected</SelectItem>{selectedPlayers.map((player) => <SelectItem key={player.id} value={player.id}>{player.playerName}{player.jerseyNumber != null ? ` · #${player.jerseyNumber}` : ""}</SelectItem>)}</SelectContent></Select></div></div>
          <div className="overflow-hidden rounded-xl border border-slate-200"><div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3"><div><p className="font-medium">Official roster</p><p className="text-xs text-slate-500">{minRoster ? `Minimum ${minRoster}` : "Select participating players"}{maxRoster ? ` · Maximum ${maxRoster}` : ""}</p></div><Badge variant="secondary">{selected.length} selected</Badge></div><div className="divide-y divide-slate-100">{(data.availablePlayers || []).length ? data.availablePlayers.map((player) => { const eligible = player.eligibility?.eligible !== false; const reason = player.eligibility?.reasons?.join(" · "); return <label key={player.id} className={`flex items-center gap-3 px-4 py-3 ${rosterLocked || !eligible ? "cursor-not-allowed bg-slate-50/70 opacity-70" : "cursor-pointer hover:bg-slate-50"}`}><Checkbox checked={selected.includes(player.id)} disabled={rosterLocked || !eligible} onCheckedChange={(value) => toggle(player.id, Boolean(value))}/><div className="min-w-0 flex-1"><p className="font-medium text-slate-950">{player.playerName}</p><p className="text-xs text-slate-500">{player.primarySport ? titleCase(player.primarySport) : "Family player"}{player.eligibility?.age != null ? ` · Age ${player.eligibility.age}` : ""}</p>{!eligible && <p className="mt-1 text-xs font-medium text-rose-700">Not eligible · {reason}</p>}</div>{player.jerseyNumber != null ? <Badge variant="outline">#{player.jerseyNumber}</Badge> : <span className="text-xs text-amber-700">No jersey #</span>}</label>; }) : <div className="p-8 text-center text-sm text-slate-500">No active players are recorded for this family. Contact tournament administration to add players.</div>}</div></div>
          {!rosterLocked && <Button onClick={saveTeamEntry} disabled={saving || !data.availablePlayers?.length}><ShieldCheck className="mr-2 h-4 w-4"/>{saving ? "Saving team entry…" : "Save official team entry"}</Button>}
        </CardContent></Card>}
      </div>

      <div className="space-y-4">
        <Card><CardHeader><CardTitle className="text-base">Registration summary</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><div><p className="text-xs uppercase tracking-wide text-slate-500">Reference</p><p className="mt-1 font-mono font-semibold">{registration.reference}</p></div><div><p className="text-xs uppercase tracking-wide text-slate-500">Family</p><p className="mt-1 font-medium">{data.family.familyName}</p></div><div><p className="text-xs uppercase tracking-wide text-slate-500">Event</p><p className="mt-1 font-medium">{data.game.name}</p></div><div><p className="text-xs uppercase tracking-wide text-slate-500">Payment</p><Badge className="mt-1" variant={data.paymentComplete ? "default" : "outline"}>{titleCase(registration.paymentStatus)}</Badge></div><div><p className="text-xs uppercase tracking-wide text-slate-500">Tournament approval</p><Badge className="mt-1" variant={registration.status === "CONFIRMED" ? "default" : "outline"}>{titleCase(registration.status)}</Badge></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex gap-3"><Trophy className="mt-0.5 h-5 w-5 text-slate-700"/><div><p className="font-semibold">What happens next?</p><p className="mt-1 text-xs leading-5 text-slate-500">After payment and team-sheet completion, tournament staff review the entry. The sporting status changes to Confirmed only after that approval.</p></div></div></CardContent></Card>
        <Card className="print:hidden"><CardContent className="p-5"><div className="flex gap-3"><FileText className="mt-0.5 h-5 w-5 text-slate-700"/><div><p className="font-semibold">Keep this link private</p><p className="mt-1 text-xs leading-5 text-slate-500">This secure link allows management of this registration without a user account. Share it only with the family/team representative.</p></div></div></CardContent></Card>
      </div>
    </div>
  </main>;
}
