
"use client";
import Link from "next/link";
import { Activity, BarChart3, Shield, Target, Trophy, Users } from "lucide-react";

const Form = ({items=[]}) => <div className="flex gap-1">{items.length ? items.map((v,i)=><span key={i} className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-black ${v==="W"?"bg-emerald-100 text-emerald-700":v==="D"?"bg-amber-100 text-amber-700":"bg-red-100 text-red-700"}`}>{v}</span>) : <span className="text-xs text-slate-400">—</span>}</div>;

function Leaderboard({title, rows, value, suffix="", icon:Icon=Trophy}) {
  return <section className="rounded-xl border border-slate-200 bg-white">
    <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3"><Icon className="h-4 w-4 text-slate-500"/><h2 className="font-black text-slate-950">{title}</h2></div>
    <div className="divide-y divide-slate-100">{rows?.length ? rows.map((row,index)=><Link href={row.playerId ? `/players/${row.playerId}` : `/teams/${row.familyId}`} key={row.playerId || row.familyId} className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 hover:bg-slate-50"><span className="text-xs font-black text-slate-400">{index+1}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-950">{row.playerName || row.familyName}</p>{row.playerName && <p className="truncate text-xs text-slate-500">{row.familyName}</p>}</div><span className="font-black tabular-nums text-slate-950">{value(row)}{suffix}</span></Link>) : <p className="p-6 text-center text-sm text-slate-500">Statistics will appear after completed matches are recorded.</p>}</div>
  </section>;
}

export default function TournamentStatistics({data}) {
  if(!data) return <main className="min-h-screen bg-slate-100 px-4 pt-32"><div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-10 text-center"><BarChart3 className="mx-auto h-8 w-8 text-slate-400"/><h1 className="mt-3 text-2xl font-black">Statistics not available yet</h1></div></main>;
  const {tournament, totals, leaders, families, events}=data;
  return <main className="min-h-screen bg-slate-100 pb-12 pt-[88px]">
    <section className="border-b border-slate-800 bg-slate-950 text-white"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-red-400">Official statistics</p><h1 className="mt-1 text-2xl font-black sm:text-4xl">{tournament.shortName || tournament.name}</h1></div><Link href="/tournament" className="text-sm font-bold text-slate-300 hover:text-white">← Tournament centre</Link></div></div></section>
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[[Activity,"Completed",totals.completedMatches],[Target,"Goals",totals.goals],[Users,"Families",totals.families],[BarChart3,"Tracked players",totals.playersWithRecordedEvents]].map(([Icon,label,value])=><div key={label} className="rounded-xl border border-slate-200 bg-white p-4"><Icon className="h-4 w-4 text-slate-400"/><p className="mt-3 text-2xl font-black tabular-nums text-slate-950">{value}</p><p className="text-xs font-semibold text-slate-500">{label}</p></div>)}
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <Leaderboard title="Top scorers" rows={leaders.scorers} value={(r)=>r.goals} icon={Trophy}/>
        <Leaderboard title="Shots on target" rows={leaders.shotsOnTarget} value={(r)=>r.shotsOnTarget} icon={Target}/>
        <Leaderboard title="Discipline" rows={leaders.cards.filter(r=>r.yellowCards||r.redCards)} value={(r)=>`${r.yellowCards}Y · ${r.redCards}R`} icon={Shield}/>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3"><h2 className="font-black text-slate-950">Family / team performance</h2><p className="text-xs text-slate-500">Tournament-wide completed-match form. Pool standings remain event-specific.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-4 py-3 text-left">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>CS</th><th>Win%</th><th className="px-4 text-left">Form</th></tr></thead><tbody>{families.map(row=><tr key={row.familyId} className="border-t border-slate-100"><td className="px-4 py-3 font-bold"><Link href={`/teams/${row.familyId}`} className="hover:text-red-700">{row.familyName}</Link></td><td className="text-center">{row.played}</td><td className="text-center">{row.won}</td><td className="text-center">{row.drawn}</td><td className="text-center">{row.lost}</td><td className="text-center">{row.goalsFor}</td><td className="text-center">{row.goalsAgainst}</td><td className="text-center font-bold">{row.goalDifference}</td><td className="text-center">{row.cleanSheets}</td><td className="text-center font-bold">{row.winRate}%</td><td className="px-4"><Form items={row.form}/></td></tr>)}</tbody></table></div>
      </section>

      {!!events?.length && <section className="rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-200 px-4 py-3"><h2 className="font-black text-slate-950">Event scoring</h2></div><div className="grid sm:grid-cols-2 lg:grid-cols-3">{events.map(row=><div key={row.gameId || row.gameName} className="border-b border-slate-100 p-4 sm:border-r"><p className="text-sm font-bold text-slate-950">{row.gameName}</p><div className="mt-2 flex gap-5 text-xs text-slate-500"><span><b className="text-slate-900">{row.matches}</b> matches</span><span><b className="text-slate-900">{row.goals}</b> goals</span><span><b className="text-slate-900">{row.goalsPerMatch}</b> / match</span></div></div>)}</div></section>}
      <p className="text-xs leading-5 text-slate-500">Player leaderboards are based on official recorded match events. Historical matches without player-level event data are not guessed or reconstructed.</p>
    </div>
  </main>
}
