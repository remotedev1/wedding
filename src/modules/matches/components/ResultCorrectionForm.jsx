"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ResultCorrectionForm({ tournamentId, matchId }) {
  const [match, setMatch] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/matches/${matchId}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load match");
      setMatch(body.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tournamentId, matchId]);

  const submit = async () => {
    if (reason.trim().length < 10) return toast.error("Enter a clear correction reason");
    setSubmitting(true);
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/matches/${matchId}/result-correction`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expectedResultVersion: match.resultVersion,
            reason: reason.trim(),
          }),
        },
      );
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to reopen result");
      setMatch(body.data);
      toast.success("Result reopened. Match Control is ready for the correction.");
    } catch (error) {
      toast.error(error.message);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading result integrity…</div>;
  if (!match) return <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">Match could not be loaded.</div>;

  const locked = Boolean(match.lockedAt);
  const downstream = Boolean(match.nextMatchId);

  return <div className="mx-auto max-w-3xl space-y-5">
    <div>
      <Link href={`/dashboard/tournaments/${tournamentId}/matches/${matchId}/live`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4"/> Match Control
      </Link>
      <p className="mt-5 text-xs font-black uppercase tracking-[.15em] text-red-700">Controlled result correction</p>
      <h1 className="mt-1 text-3xl font-black text-slate-950">{match.name || `Match #${match.matchNo}`}</h1>
      <p className="mt-2 text-sm text-slate-500">Completed results are immutable until an authorized administrator explicitly reopens them with an audit reason.</p>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Status</p><p className="mt-1 font-black">{match.status}</p></div>
      <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Result version</p><p className="mt-1 font-black">{match.resultVersion}</p></div>
      <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Integrity</p><p className="mt-1 inline-flex items-center gap-1 font-black">{locked?<><LockKeyhole className="h-4 w-4 text-amber-600"/>Locked</>:<><ShieldCheck className="h-4 w-4 text-emerald-600"/>Open</>}</p></div>
    </div>

    {downstream && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><div className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0"/><div><p className="font-black">Downstream knockout progression exists.</p><p className="mt-1">This result cannot be reopened until the dependent bracket is reset. This prevents a corrected semi-final from silently disagreeing with an already-created final.</p></div></div></div>}

    {!locked && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">This result is already open for controlled correction. Continue in Match Control.</div>}

    {locked && !downstream && <div className="rounded-xl border border-slate-200 bg-white p-5">
      <Label htmlFor="correction-reason" className="font-bold">Correction reason</Label>
      <p className="mt-1 text-xs text-slate-500">Required in the audit trail. Describe what was wrong and why the official result must be reopened.</p>
      <textarea id="correction-reason" value={reason} onChange={(event)=>setReason(event.target.value)} maxLength={1000} rows={5} className="mt-3 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-slate-950" placeholder="Example: Official score sheet confirms the second-quarter goal was assigned to the wrong team."/>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">Reopening clears winner/draw flags, increments result/control versions and preserves the existing score for correction.</p>
        <Button onClick={submit} disabled={submitting || reason.trim().length < 10} className="bg-red-700 hover:bg-red-600">
          {submitting?<RefreshCw className="mr-2 h-4 w-4 animate-spin"/>:<LockKeyhole className="mr-2 h-4 w-4"/>}
          Reopen result
        </Button>
      </div>
    </div>}
  </div>;
}
