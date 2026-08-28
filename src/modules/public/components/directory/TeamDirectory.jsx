
import Link from "next/link";
import { Search, Shield, Trophy, Users } from "lucide-react";

export default function TeamDirectory({ teams }) {
  return <main className="min-h-screen bg-slate-100 pb-12 pt-[88px]">
    <section className="border-b border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[.15em] text-red-400">Tournament directory</p>
        <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="text-3xl font-black sm:text-4xl">Families & teams</h1><p className="mt-2 max-w-2xl text-sm text-slate-400">Official public profiles, current players, results and tournament honours.</p></div>
          <div className="flex gap-2"><Link href="/players" className="rounded-lg border border-white/15 px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">Players</Link><Link href="/search" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/10"><Search className="h-4 w-4"/>Search</Link></div>
        </div>
      </div>
    </section>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {teams?.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{teams.map(team=><Link key={team.id} href={team.href} className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm">
        <div className="flex items-start gap-4">
          {team.image ? <img src={team.image} alt="" className="h-14 w-14 rounded-xl object-cover"/> : <div className="grid h-14 w-14 place-items-center rounded-xl bg-slate-100 text-lg font-black text-slate-500">{(team.shortName||team.familyName).slice(0,2).toUpperCase()}</div>}
          <div className="min-w-0"><h2 className="truncate text-lg font-black text-slate-950 group-hover:text-red-700">{team.familyName}</h2>{team.shortName&&<p className="text-xs font-bold uppercase tracking-wider text-slate-400">{team.shortName}</p>}</div>
        </div>
        {team.description&&<p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{team.description}</p>}
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          <span><b className="block text-base text-slate-950">{team._count.players}</b>Players</span>
          <span><b className="block text-base text-slate-950">{team._count.participations}</b>Events</span>
          <span><b className="block text-base text-slate-950">{team._count.placements}</b>Honours</span>
        </div>
      </Link>)}</div> : <div className="rounded-xl border border-slate-200 bg-white p-10 text-center"><Users className="mx-auto h-8 w-8 text-slate-400"/><p className="mt-3 font-bold text-slate-900">No public teams available yet.</p></div>}
    </div>
  </main>
}
