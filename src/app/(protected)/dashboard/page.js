import Link from "next/link";
import {
  Activity,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Flag,
  ShieldCheck,
  Trophy,
  Users,
  UserRound,
  Zap,
} from "lucide-react";
import { db } from "@/lib/db";
import { requireDashboardAccess } from "@/modules/auth/server/session";

function StatCard({ title, value, note, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{note}</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

export default async function DashboardPage() {
  const user = await requireDashboardAccess();
  const now = new Date();
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);

  let data;
  try {
    const [
      activeTournament,
      tournamentCount,
      familyCount,
      playerCount,
      liveMatches,
      todaysMatches,
      pendingRegistrations,
      completedPayments,
      recentActivity,
    ] = await Promise.all([
      db.tournament.findFirst({
        where: { status: { in: ["REGISTRATION", "UPCOMING", "ONGOING"] } },
        orderBy: [{ status: "desc" }, { startDate: "asc" }],
        include: { _count: { select: { games: true, participation: true, matches: true } } },
      }),
      db.tournament.count(),
      db.families.count(),
      db.player.count({ where: { isActive: true } }),
      db.matches.count({ where: { status: "LIVE" } }),
      db.matches.count({ where: { scheduledOn: { gte: startOfDay, lte: endOfDay } } }),
      db.gameRegistration.count({ where: { status: "PENDING" } }),
      db.payment.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true }, _count: true }),
      db.activityLog.findMany({
        orderBy: { timestamp: "desc" },
        take: 6,
        select: { id: true, action: true, entity: true, description: true, timestamp: true },
      }),
    ]);
    data = { activeTournament, tournamentCount, familyCount, playerCount, liveMatches, todaysMatches, pendingRegistrations, completedPayments, recentActivity };
  } catch (error) {
    console.error("Dashboard overview query failed", error);
    data = { activeTournament: null, tournamentCount: 0, familyCount: 0, playerCount: 0, liveMatches: 0, todaysMatches: 0, pendingRegistrations: 0, completedPayments: { _sum: { amount: 0 }, _count: 0 }, recentActivity: [] };
  }

  const t = data.activeTournament;
  const paymentTotal = data.completedPayments?._sum?.amount || 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4" /> Tournament Control Center
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Good day, {user.firstName || "Administrator"}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">Monitor registrations, matches, teams and tournament operations from one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/command-center" className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600">Open command center</Link>
          <Link href="/dashboard/tournaments" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950">Manage tournaments</Link>
          <Link href="/dashboard/families" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">Families & teams</Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Live matches" value={data.liveMatches} note="Currently in play" icon={Zap} />
        <StatCard title="Today's matches" value={data.todaysMatches} note="Scheduled for today" icon={CalendarDays} />
        <StatCard title="Registered families" value={data.familyCount} note={`${data.playerCount} active players`} icon={Users} />
        <StatCard title="Pending registrations" value={data.pendingRegistrations} note="Awaiting confirmation" icon={Clock3} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Active tournament</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{t?.name || "No active tournament"}</h2>
              <p className="mt-1 text-sm text-slate-500">{t ? `${formatDate(t.startDate)} — ${formatDate(t.endDate)}` : "Create or activate a tournament to begin operations."}</p>
            </div>
            {t?.status && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{t.status.replaceAll("_", " ")}</span>}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70"><Flag className="h-4 w-4 text-slate-500" /><p className="mt-3 text-2xl font-bold">{t?._count?.games || 0}</p><p className="text-xs text-slate-500">Configured games</p></div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70"><UserRound className="h-4 w-4 text-slate-500" /><p className="mt-3 text-2xl font-bold">{t?._count?.participation || 0}</p><p className="text-xs text-slate-500">Participants</p></div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70"><Trophy className="h-4 w-4 text-slate-500" /><p className="mt-3 text-2xl font-bold">{t?._count?.matches || 0}</p><p className="text-xs text-slate-500">Matches</p></div>
          </div>
          {t && <div className="mt-5 flex flex-wrap gap-3"><Link href={`/dashboard/tournaments/${t.id}/operations`} className="inline-flex rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600">Open operations</Link><Link href={`/dashboard/tournaments/${t.id}`} className="inline-flex px-1 py-2 text-sm font-semibold text-slate-900 hover:underline dark:text-white">Tournament overview →</Link></div>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Operations snapshot</p>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800"><span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Trophy className="h-4 w-4" /> Tournaments</span><strong>{data.tournamentCount}</strong></div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800"><span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><CircleDollarSign className="h-4 w-4" /> Successful payments</span><strong>{data.completedPayments?._count || 0}</strong></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-300">Collected value</span><strong>₹{paymentTotal.toLocaleString("en-IN")}</strong></div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-950 dark:text-white">Recent activity</h2><p className="text-sm text-slate-500">Latest administrative actions recorded by the system.</p></div><Activity className="h-5 w-5 text-slate-400" /></div>
        <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
          {data.recentActivity.length ? data.recentActivity.map((item) => (
            <div key={item.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.description}</p><p className="text-xs text-slate-500">{item.entity} · {item.action}</p></div>
              <time className="text-xs text-slate-400">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(item.timestamp)}</time>
            </div>
          )) : <p className="py-8 text-center text-sm text-slate-500">No recent activity yet.</p>}
        </div>
      </section>
    </div>
  );
}
