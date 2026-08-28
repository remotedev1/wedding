"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, LockKeyhole, Printer, Save, ShieldCheck, UsersRound } from "lucide-react";
import { toast } from "sonner";

export function RosterManagerDialog({ open, onOpenChange, tournamentId, participationId, registration, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState([]);
  const [captainPlayerId, setCaptainPlayerId] = useState("");
  const [goalkeeperPlayerId, setGoalkeeperPlayerId] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerPhone, setManagerPhone] = useState("");

  const endpoint = registration?.id
    ? `/api/tournaments/${tournamentId}/participants/${participationId}/registrations/${registration.id}/roster`
    : null;

  useEffect(() => {
    if (!open || !endpoint) return;
    setLoading(true);
    fetch(endpoint)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to load roster");
        return payload.data;
      })
      .then((payload) => {
        setData(payload);
        const roster = payload.registration?.roster || [];
        setSelected(roster.map((member) => member.playerId));
        setCaptainPlayerId(payload.registration?.captainPlayerId || "");
        setGoalkeeperPlayerId(roster.find((member) => member.role === "GOALKEEPER")?.playerId || "");
        setManagerName(payload.registration?.managerName || "");
        setManagerPhone(payload.registration?.managerPhone || "");
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [open, endpoint]);

  const selectedPlayers = useMemo(() => {
    const playerMap = new Map((data?.availablePlayers || []).map((player) => [player.id, player]));
    return selected.map((id) => playerMap.get(id)).filter(Boolean);
  }, [data, selected]);

  const duplicateJerseys = useMemo(() => {
    const seen = new Set();
    const duplicates = new Set();
    selectedPlayers.forEach((player) => {
      if (player.jerseyNumber == null) return;
      if (seen.has(player.jerseyNumber)) duplicates.add(player.jerseyNumber);
      seen.add(player.jerseyNumber);
    });
    return [...duplicates];
  }, [selectedPlayers]);

  async function save() {
    if (!endpoint) return;
    if (duplicateJerseys.length) return toast.error(`Duplicate jersey number: ${duplicateJerseys.join(", ")}`);
    setSaving(true);
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerIds: selected,
          captainPlayerId: captainPlayerId || null,
          goalkeeperPlayerId: goalkeeperPlayerId || null,
          managerName: managerName.trim() || null,
          managerPhone: managerPhone.trim() || null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save roster");
      toast.success("Team roster saved");
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  function togglePlayer(id, checked) {
    setSelected((current) => checked ? [...new Set([...current, id])] : current.filter((value) => value !== id));
    if (!checked && captainPlayerId === id) setCaptainPlayerId("");
    if (!checked && goalkeeperPlayerId === id) setGoalkeeperPlayerId("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto bg-white print:max-h-none print:max-w-none print:overflow-visible">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><UsersRound className="h-5 w-5" />Event team roster</DialogTitle>
          <DialogDescription>
            {data?.registration ? `${data.registration.family.familyName} · ${data.registration.game.name}` : "Select the players representing this family in this event."}
          </DialogDescription>
        </DialogHeader>

        {loading ? <div className="py-10 text-center text-sm text-slate-500">Loading roster…</div> : data ? <div className="space-y-5">
          <div className={`rounded-xl border p-4 ${data.isLocked ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
            <div className="flex items-start gap-3">
              {data.isLocked ? <LockKeyhole className="mt-0.5 h-5 w-5 text-amber-700" /> : <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-700" />}
              <div><p className="font-medium text-slate-950">{data.isLocked ? "Roster locked" : "Roster editable"}</p><p className="mt-1 text-sm text-slate-600">{data.isLocked ? "Competition for this event has started. The submitted team sheet can no longer be changed." : "The roster automatically locks when the first match for this event starts."}</p></div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Team manager</Label><Input value={managerName} onChange={(e) => setManagerName(e.target.value)} disabled={data.isLocked} placeholder="Manager / representative name" /></div>
            <div className="space-y-2"><Label>Manager phone</Label><Input value={managerPhone} onChange={(e) => setManagerPhone(e.target.value)} disabled={data.isLocked} placeholder="Contact number" /></div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Captain</Label><Select value={captainPlayerId || "NONE"} onValueChange={(value) => setCaptainPlayerId(value === "NONE" ? "" : value)} disabled={data.isLocked || !selected.length}><SelectTrigger><SelectValue placeholder="Select captain" /></SelectTrigger><SelectContent><SelectItem value="NONE">No captain selected</SelectItem>{selectedPlayers.map((player) => <SelectItem key={player.id} value={player.id}>{player.playerName}{player.jerseyNumber != null ? ` · #${player.jerseyNumber}` : ""}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Goalkeeper</Label><Select value={goalkeeperPlayerId || "NONE"} onValueChange={(value) => setGoalkeeperPlayerId(value === "NONE" ? "" : value)} disabled={data.isLocked || !selected.length}><SelectTrigger><SelectValue placeholder="Select goalkeeper" /></SelectTrigger><SelectContent><SelectItem value="NONE">No goalkeeper selected</SelectItem>{selectedPlayers.map((player) => <SelectItem key={player.id} value={player.id}>{player.playerName}{player.jerseyNumber != null ? ` · #${player.jerseyNumber}` : ""}</SelectItem>)}</SelectContent></Select></div>
          </div>

          {duplicateJerseys.length > 0 && <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertTriangle className="h-4 w-4 shrink-0" />Duplicate jersey numbers in selected roster: {duplicateJerseys.join(", ")}</div>}

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3"><div><p className="font-medium text-slate-950">Eligible family players</p><p className="text-xs text-slate-500">Age, gender, verification rejection and active status are enforced by the same server eligibility rules.</p></div><Badge variant="secondary">{selected.length} selected</Badge></div>
            <div className="divide-y divide-slate-100">
              {(data.availablePlayers || []).length ? data.availablePlayers.map((player) => {
                const checked = selected.includes(player.id);
                const eligible = player.eligibility?.eligible !== false;
                return <label key={player.id} className={`flex items-center gap-3 px-4 py-3 ${data.isLocked || !eligible ? "cursor-not-allowed bg-slate-50/70 opacity-70" : "cursor-pointer hover:bg-slate-50"}`}>
                  <Checkbox checked={checked} disabled={data.isLocked || !eligible} onCheckedChange={(value) => togglePlayer(player.id, Boolean(value))} />
                  <div className="min-w-0 flex-1"><p className="font-medium text-slate-950">{player.playerName}</p><p className="text-xs text-slate-500">{player.primarySport ? player.primarySport.replaceAll("_", " ") : "No primary sport"}{player.eligibility?.age != null ? ` · Age ${player.eligibility.age}` : ""}</p>{!eligible && <p className="mt-1 text-xs font-medium text-rose-700">Not eligible · {player.eligibility?.reasons?.join(" · ")}</p>}</div>
                  {player.jerseyNumber != null ? <Badge variant="outline">#{player.jerseyNumber}</Badge> : <span className="text-xs text-amber-700">No jersey #</span>}
                  {captainPlayerId === player.id && <Badge>Captain</Badge>}
                  {goalkeeperPlayerId === player.id && <Badge variant="secondary">GK</Badge>}
                </label>;
              }) : <div className="p-8 text-center text-sm text-slate-500">No active players are available for this family.</div>}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between print:hidden">
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print team sheet</Button>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button><Button onClick={save} disabled={saving || data.isLocked || duplicateJerseys.length > 0}><Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save roster"}</Button></div>
          </div>
        </div> : null}
      </DialogContent>
    </Dialog>
  );
}
