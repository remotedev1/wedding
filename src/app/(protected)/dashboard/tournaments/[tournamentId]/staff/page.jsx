import Link from "next/link";
import { AlertTriangle, BadgeCheck, CalendarClock, ClipboardCheck, UsersRound } from "lucide-react";
import { requirePermission } from "@/modules/auth/server/session";
import { PERMISSIONS } from "@/modules/auth/server/permissions";
import { getTournamentStaffOperations } from "@/modules/officials/operations";

export const dynamic="force-dynamic";

export default async function TournamentStaffPage({params}){
  await requirePermission(PERMISSIONS.MATCHES_MANAGE,`/dashboard/tournaments/${params.tournamentId}/staff`);
  const data=await getTournamentStaffOperations(params.tournamentId);
  if(!data)return <div className="p-8">Tournament not found.</div>;
  return <div className="space-y-6 p-4 sm:p-6 lg:p-8">
    <div><p className="text-xs font-black uppercase tracking-[.14em] text-red-700">Tournament workforce</p><h1 className="mt-1 text-3xl font-black">Staff & match officials</h1><p className="mt-1 text-sm text-slate-500">Assignment coverage, workload, check-in state and match-day responsibility.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[
      ["Staff",data.counts.staff,UsersRound],["Assignments",data.counts.assignments,CalendarClock],["Coverage gaps",data.counts.missing,AlertTriangle],["Checked in",data.counts.checkedIn,BadgeCheck],["No show",data.counts.noShow,ClipboardCheck],
    ].map(([label,value,Icon])=><div key={label} className="rounded-xl border bg-white p-4"><Icon className="h-4 w-4 text-slate-400"/><p className="mt-3 text-2xl font-black">{value}</p><p className="text-xs font-semibold text-slate-500">{label}</p></div>)}</div>
    {data.missing.length>0&&<section><h2 className="mb-3 text-lg font-black">Coverage gaps</h2><div className="grid gap-2 lg:grid-cols-2">{data.missing.map(m=><Link key={m.id} href={`/dashboard/tournaments/${params.tournamentId}/matches/${m.id}/live`} className="rounded-xl border border-amber-200 bg-amber-50 p-4 hover:border-amber-400"><div className="flex justify-between gap-3"><div><p className="font-black">Match #{m.matchNo} · {m.name||m.event}</p><p className="mt-1 text-xs text-amber-800">{new Date(m.scheduledOn).toLocaleString()} · {m.venue}</p></div><AlertTriangle className="h-5 w-5 text-amber-600"/></div><p className="mt-2 text-xs font-bold text-amber-700">{[m.missingScorer&&"Scorer/table official",m.missingFieldOfficial&&"Referee/umpire"].filter(Boolean).join(" + ")} required</p></Link>)}</div></section>}
    <section><h2 className="mb-3 text-lg font-black">Staff workload</h2><div className="overflow-hidden rounded-xl border bg-white"><div className="grid grid-cols-[minmax(180px,1fr)_140px_100px_100px_120px] gap-3 border-b bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500 max-md:hidden"><span>Staff</span><span>Roles</span><span>Duties</span><span>Checked in</span><span>Busiest day</span></div>{data.staff.length?data.staff.map(row=><div key={row.key} className="grid gap-2 border-b px-4 py-3 md:grid-cols-[minmax(180px,1fr)_140px_100px_100px_120px] md:items-center"><div><p className="font-bold">{row.name}</p><p className="text-xs text-slate-400">{row.userId?"Linked account":"External official"}</p></div><p className="text-xs font-semibold text-slate-600">{row.roles.map(r=>r.replaceAll("_"," ")).join(", ")}</p><p className="font-black">{row.assignmentCount}</p><p className="font-black">{row.checkedIn}</p><p className="text-xs text-slate-500">{row.busiestDay?`${row.busiestDay[0]} · ${row.busiestDay[1]}`:"—"}</p></div>):<p className="p-8 text-center text-sm text-slate-500">No staff assignments yet.</p>}</div></section>
  </div>;
}
