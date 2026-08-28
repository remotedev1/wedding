"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const TYPES = ["INJURY", "CARD", "DISCIPLINE", "TECHNICAL", "WEATHER", "CROWD", "PROTEST", "MEDICAL", "OTHER"];

export default function MatchIncidentPanel({ tournamentId, matchId, participants = [] }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: "INJURY", severity: "INFO", minute: "", familyId: "", description: "" });
  const endpoint = useMemo(() => `/api/tournaments/${tournamentId}/matches/${matchId}/incidents`, [tournamentId, matchId]);

  const load = useCallback(async () => {
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setItems(json.data || []);
    } finally { setLoading(false); }
  }, [endpoint]);
  useEffect(() => { load(); }, [load]);

  async function submit(e) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, minute: form.minute === "" ? null : Number(form.minute), familyId: form.familyId || null }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Unable to record incident");
      toast.success("Incident recorded"); setForm({ type: "INJURY", severity: "INFO", minute: "", familyId: "", description: "" }); await load();
    } catch (error) { toast.error(error.message); } finally { setSaving(false); }
  }

  async function resolve(id) {
    const resolution = window.prompt("Resolution / action taken");
    if (!resolution?.trim()) return;
    const res = await fetch(`${endpoint}/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resolution }) });
    const json = await res.json();
    if (!res.ok) return toast.error(json.error || "Unable to resolve incident");
    toast.success("Incident resolved"); load();
  }

  return <section className="rounded-2xl border border-slate-700/40 bg-slate-900/60 p-5">
    <div className="mb-4 flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400"/><h3 className="font-semibold text-white">Match incidents</h3></div><p className="mt-1 text-xs text-slate-400">Record injuries, cards, discipline, weather, protests and operational issues separately from match notes.</p></div><span className="text-xs text-slate-500">{items.filter(x => !x.resolvedAt).length} open</span></div>
    <form onSubmit={submit} className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4 md:grid-cols-6">
      <div className="md:col-span-1"><Label className="text-slate-400">Type</Label><Select value={form.type} onValueChange={(type) => setForm(f => ({...f,type}))}><SelectTrigger className="mt-1 border-slate-700 bg-slate-900 text-white"><SelectValue/></SelectTrigger><SelectContent>{TYPES.map(x => <SelectItem key={x} value={x}>{x.replaceAll("_"," ")}</SelectItem>)}</SelectContent></Select></div>
      <div className="md:col-span-1"><Label className="text-slate-400">Severity</Label><Select value={form.severity} onValueChange={(severity) => setForm(f => ({...f,severity}))}><SelectTrigger className="mt-1 border-slate-700 bg-slate-900 text-white"><SelectValue/></SelectTrigger><SelectContent>{["INFO","WARNING","CRITICAL"].map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
      <div className="md:col-span-1"><Label className="text-slate-400">Minute</Label><Input className="mt-1 border-slate-700 bg-slate-900 text-white" type="number" min="0" value={form.minute} onChange={e => setForm(f => ({...f,minute:e.target.value}))}/></div>
      <div className="md:col-span-1"><Label className="text-slate-400">Family</Label><Select value={form.familyId || "none"} onValueChange={(familyId) => setForm(f => ({...f,familyId:familyId === "none" ? "" : familyId}))}><SelectTrigger className="mt-1 border-slate-700 bg-slate-900 text-white"><SelectValue placeholder="Optional"/></SelectTrigger><SelectContent><SelectItem value="none">Not team-specific</SelectItem>{participants.map(p => <SelectItem key={p.familyId} value={p.familyId}>{p.family}</SelectItem>)}</SelectContent></Select></div>
      <div className="md:col-span-2"><Label className="text-slate-400">Description</Label><div className="mt-1 flex gap-2"><Input className="border-slate-700 bg-slate-900 text-white" value={form.description} onChange={e => setForm(f => ({...f,description:e.target.value}))} placeholder="What happened and immediate action" required minLength={3}/><Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Plus className="h-4 w-4"/>}</Button></div></div>
    </form>
    <div className="mt-4 space-y-2">{loading ? <p className="text-sm text-slate-500">Loading incidents…</p> : items.length ? items.map(x => <div key={x.id} className="rounded-xl border border-slate-800 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${x.severity === "CRITICAL" ? "bg-red-500/15 text-red-300" : x.severity === "WARNING" ? "bg-amber-500/15 text-amber-300" : "bg-slate-700 text-slate-300"}`}>{x.severity}</span><span className="text-sm font-semibold text-white">{x.type.replaceAll("_"," ")}</span>{x.minute != null && <span className="text-xs text-slate-500">{x.minute}′</span>}</div>{x.resolvedAt ? <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="h-3 w-3"/>Resolved</span> : <Button size="sm" variant="outline" className="h-7 border-slate-700 text-xs" onClick={() => resolve(x.id)}>Resolve</Button>}</div><p className="mt-2 text-sm text-slate-300">{x.description}</p>{x.resolution && <p className="mt-2 text-xs text-emerald-300">Resolution: {x.resolution}</p>}</div>) : <p className="text-sm text-slate-500">No incidents recorded for this match.</p>}</div>
  </section>;
}
