import Link from "next/link";
import { AlertTriangle, Bell, CircleDollarSign, Clock3, FileClock, ShieldAlert, Users } from "lucide-react";
import { db } from "@/lib/db";
import { requirePermission } from "@/modules/auth/server/session";
import { PERMISSIONS } from "@/modules/auth/server/permissions";

function Card({ title, value, note, icon: Icon }) {
  return <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-3xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div><div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800"><Icon className="h-5 w-5" /></div></div></div>;
}

function Severity({ value }) {
  const classes = value === "CRITICAL" ? "bg-red-100 text-red-700" : value === "WARNING" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${classes}`}>{value}</span>;
}

export default async function OperationsPage() {
  const user = await requirePermission(PERMISSIONS.OPERATIONS_VIEW, "/dashboard/operations");
  const now = new Date();
  const [incidents, paymentIssues, rosterIssues, matchIssues, notifications, activity] = await Promise.all([
    db.matchIncident.findMany({ where: { resolvedAt: null }, orderBy: [{ severity: "desc" }, { createdAt: "desc" }], take: 25, include: { createdBy: { select: { firstName: true, lastName: true } } } }),
    db.gameRegistration.findMany({ where: { status: "CONFIRMED", paymentStatus: { not: "COMPLETED" }, paymentAmount: { gt: 0 } }, take: 25, include: { game: { select: { name: true, tournamentId: true } }, participation: { include: { family: { select: { familyName: true } } } } } }),
    db.gameRegistration.findMany({ where: { status: "CONFIRMED", roster: { isEmpty: true } }, take: 25, include: { game: { select: { name: true, tournamentId: true } }, participation: { include: { family: { select: { familyName: true } } } } } }),
    db.matches.findMany({ where: { status: { in: ["DELAYED", "SUSPENDED", "POSTPONED", "ABANDONED", "NO_RESULT"] } }, orderBy: { scheduledOn: "asc" }, take: 25, select: { id: true, tournamentId: true, matchNo: true, name: true, status: true, venue: true, scheduledOn: true } }),
    db.operationalNotification.findMany({ where: { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.activityLog.findMany({ orderBy: { timestamp: "desc" }, take: 20, include: { User: { select: { firstName: true, lastName: true, role: true } } } }),
  ]);
  const unread = notifications.filter((n) => !n.readBy.includes(user.id));
  const attention = incidents.length + paymentIssues.length + rosterIssues.length + matchIssues.length;

  return <div className="space-y-7">
    <div><p className="text-sm font-medium text-slate-500">Tournament operations</p><h1 className="text-3xl font-bold tracking-tight">Attention & audit center</h1><p className="mt-2 max-w-3xl text-sm text-slate-500">One place for unresolved match incidents, registration readiness, payment exceptions, disrupted fixtures, persistent notifications and recent staff activity.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Card title="Attention required" value={attention} note="Live operational exceptions" icon={ShieldAlert}/><Card title="Open incidents" value={incidents.length} note="Unresolved match incidents" icon={AlertTriangle}/><Card title="Payment issues" value={paymentIssues.length} note="Confirmed entries not settled" icon={CircleDollarSign}/><Card title="Roster issues" value={rosterIssues.length} note="Confirmed entries without roster" icon={Users}/><Card title="Unread alerts" value={unread.length} note="Persistent operational alerts" icon={Bell}/>
    </div>

    <section className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h2 className="font-semibold">Open match incidents</h2><div className="mt-4 space-y-3">{incidents.length ? incidents.map((x) => <Link key={x.id} href={`/dashboard/tournaments/${x.tournamentId}/matches/${x.matchId}/live`} className="block rounded-xl border p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"><div className="flex items-center justify-between gap-3"><p className="font-medium">{x.type.replaceAll("_", " ")}</p><Severity value={x.severity}/></div><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{x.description}</p><p className="mt-2 text-xs text-slate-400">{new Date(x.createdAt).toLocaleString("en-IN")}</p></Link>) : <p className="text-sm text-slate-500">No unresolved incidents.</p>}</div></div>

      <div className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h2 className="font-semibold">Fixture exceptions</h2><div className="mt-4 space-y-3">{matchIssues.length ? matchIssues.map((m) => <Link key={m.id} href={`/dashboard/tournaments/${m.tournamentId}/matches/${m.id}/live`} className="flex items-center justify-between gap-3 rounded-xl border p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"><div><p className="font-medium">{m.name || `Match #${m.matchNo}`}</p><p className="text-xs text-slate-500">{m.venue.replaceAll("_", " ")} · {new Date(m.scheduledOn).toLocaleString("en-IN")}</p></div><span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">{m.status}</span></Link>) : <p className="text-sm text-slate-500">No disrupted fixtures.</p>}</div></div>
    </section>

    <section className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h2 className="font-semibold">Registration readiness</h2><div className="mt-4 space-y-3">{[...paymentIssues.map(x => ({...x, kind:"Payment pending"})), ...rosterIssues.map(x => ({...x, kind:"Roster missing"}))].slice(0,30).map((x, i) => <Link key={`${x.id}-${i}`} href={`/dashboard/tournaments/${x.game.tournamentId}/participants`} className="flex items-center justify-between rounded-xl border p-3 dark:border-slate-800"><div><p className="font-medium">{x.participation.family.familyName}</p><p className="text-xs text-slate-500">{x.game.name}</p></div><span className="text-xs font-semibold text-amber-700">{x.kind}</span></Link>)}</div></div>
      <div className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h2 className="font-semibold">Persistent alerts</h2><div className="mt-4 space-y-3">{notifications.length ? notifications.map(n => <div key={n.id} className="rounded-xl border p-3 dark:border-slate-800"><div className="flex items-center justify-between"><p className="font-medium">{n.title}</p><Severity value={n.severity}/></div><p className="mt-1 text-sm text-slate-500">{n.message}</p></div>) : <p className="text-sm text-slate-500">No active alerts.</p>}</div></div>
    </section>

    <section className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2"><FileClock className="h-5 w-5"/><h2 className="font-semibold">Recent staff audit trail</h2></div><div className="mt-4 divide-y dark:divide-slate-800">{activity.map(a => <div key={a.id} className="grid gap-1 py-3 md:grid-cols-[180px_160px_1fr]"><p className="text-xs text-slate-400">{new Date(a.timestamp).toLocaleString("en-IN")}</p><p className="text-sm font-medium">{a.User?.firstName || "System"} {a.User?.lastName || ""}</p><p className="text-sm text-slate-600 dark:text-slate-300">{a.description}</p></div>)}</div></section>
  </div>;
}
