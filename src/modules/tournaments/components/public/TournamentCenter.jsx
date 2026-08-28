
import Link from "next/link";
import { Activity, ChevronRight, Trophy } from "lucide-react";
import MatchBrowser from "@/modules/tournaments/components/public/MatchBrowser";

const label=(v="")=>String(v).replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());

function LiveStrip({matches=[]}) {
  if(!matches.length)return null;
  return <section id="live" className="border-b border-red-900 bg-red-800 text-white"><div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8"><span className="sticky left-0 shrink-0 bg-red-800 pr-2 text-[10px] font-black uppercase tracking-[.15em]"><Activity className="mr-1 inline h-3 w-3"/>Live</span>{matches.map(match=>{const[a,b]=match.participants||[];return <Link href={`/tournament/matches/${match.id}`} key={match.id} className="flex shrink-0 items-center gap-2 rounded-md bg-black/15 px-3 py-1.5 text-xs hover:bg-black/25"><span className="max-w-[110px] truncate font-semibold">{a?.family||"TBD"}</span><b className="tabular-nums">{a?.score??0}-{b?.score??0}</b><span className="max-w-[110px] truncate font-semibold">{b?.family||"TBD"}</span><span className="text-red-100">›</span></Link>})}</div></section>;
}

function Events({games=[]}) {
 if(!games.length)return null;
 return <section id="events"><div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="text-xl font-black text-slate-950">Events</h2><p className="text-sm text-slate-500">Open one competition for fixtures, standings, teams and honours.</p></div></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{games.map(game=><Link key={game.id} href={`/tournament/events/${game.slug||game.id}`} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-wider text-red-700">{game.eventCode||label(game.sportType)} · {label(game.category)}</p><h3 className="mt-1 truncate font-black text-slate-950">{game.shortName||game.name}</h3>{game.format&&<p className="mt-1 text-xs text-slate-500">{game.format}</p>}</div><ChevronRight className="h-4 w-4 shrink-0 text-slate-300"/></div><div className="mt-4 flex gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500"><span><b className="text-slate-900">{game.registrationCount}</b> teams</span><span><b className="text-slate-900">{game.matchCount}</b> matches</span></div></Link>)}</div></section>;
}

function Standings({tournament}) {
 const groups=(tournament.standingsByGame||[]).filter(g=>g.pools?.length);
 if(!groups.length)return null;
 return <section id="standings" className="space-y-4"><div><h2 className="text-xl font-black text-slate-950">Standings</h2><p className="text-sm text-slate-500">Official pool tables from completed matches.</p></div>{groups.map(game=><div key={game.gameId} className="rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><span className="font-bold">{game.gameName}</span><Link href={`/tournament/events/${game.gameId}#standings`} className="text-xs font-bold text-red-700">Event page →</Link></div><div className="grid xl:grid-cols-2">{game.pools.map(pool=><div key={pool.pool} className="overflow-x-auto border-b border-slate-100 p-4 xl:border-r"><p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">Pool {pool.pool}</p><table className="w-full min-w-[500px] text-sm"><thead><tr className="text-xs text-slate-500"><th className="pb-2 text-left">#</th><th className="pb-2 text-left">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead><tbody>{pool.standings.map(row=><tr key={row.familyId} className="border-t border-slate-100"><td className="py-2 font-bold">{row.position}</td><td className="py-2 font-semibold"><Link href={`/teams/${row.familyId}`} className="hover:text-red-700">{row.family}</Link></td><td className="text-center">{row.played}</td><td className="text-center">{row.won}</td><td className="text-center">{row.drawn}</td><td className="text-center">{row.lost}</td><td className="text-center">{row.goalDifference}</td><td className="text-center font-black">{row.points}</td></tr>)}</tbody></table></div>)}</div></div>)}</section>;
}

function Honours({placements=[]}) {
 if(!placements.length)return null;
 return <section className="rounded-xl border border-slate-200 bg-white"><div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3"><Trophy className="h-4 w-4 text-amber-600"/><h2 className="font-black text-slate-950">Honours</h2></div><div className="divide-y divide-slate-100">{placements.slice(0,12).map(p=><div key={p.id} className="p-4"><p className="text-[10px] font-black uppercase tracking-wider text-amber-700">{p.gameName||label(p.sport)} · {label(p.placement)}</p><p className="mt-1 text-sm font-black text-slate-950">{p.familyName}</p></div>)}</div></section>;
}

export default function TournamentCenter({tournament,tickerOffset=false}) {
 if(!tournament)return <main className="min-h-screen bg-slate-100 px-4 pt-32"><div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-10 text-center"><Trophy className="mx-auto h-8 w-8 text-slate-400"/><h1 className="mt-3 text-2xl font-black">No public tournament yet</h1></div></main>;
 return <main className={`min-h-screen bg-slate-100 pb-12 ${tickerOffset?"pt-0":"pt-[88px]"}`}>
  <section className="border-b border-slate-800 bg-slate-950 text-white"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-red-400">Official tournament centre</p><h1 className="mt-1 text-2xl font-black sm:text-4xl">{tournament.name}</h1></div><p className="text-sm text-slate-400">{label(tournament.status)} · {tournament.counts.families} families · {tournament.counts.matches} matches</p></div><nav className="mt-5 flex gap-1 overflow-x-auto">{[["#matches","Matches"],["#events","Events"],["#standings","Standings"],["/tournament/stats","Stats"],["/teams","Teams"]].map(([href,name])=><Link key={href} href={href} className="whitespace-nowrap rounded-md bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white">{name}</Link>)}</nav></div></section>
  <LiveStrip matches={tournament.liveMatches}/>
  <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,.65fr)] lg:px-8">
   <div className="space-y-6"><MatchBrowser matches={tournament.allMatches||[]} timeZone={tournament.timezone}/><Events games={tournament.games}/><Standings tournament={tournament}/></div>
   <aside className="space-y-5"><Honours placements={tournament.placements}/><Link href="/tournament/stats" className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-950 hover:border-slate-300">Tournament statistics <ChevronRight className="h-4 w-4"/></Link><Link href="/tournament-registration" className="flex items-center justify-between rounded-xl bg-red-700 px-4 py-4 font-bold text-white hover:bg-red-600">Tournament registration <ChevronRight className="h-4 w-4"/></Link></aside>
  </div>
 </main>;
}
