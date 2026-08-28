
import Link from "next/link";
import { CalendarClock, Search, Shield, Trophy, UserRound, Users } from "lucide-react";
const label=(v="")=>String(v).replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
const dt=(v)=>v?new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(v)):"TBA";

function Section({title,children,empty}) {
  return <section className="rounded-xl border border-slate-200 bg-white">
    <div className="border-b border-slate-200 px-4 py-3"><h2 className="font-black text-slate-950">{title}</h2></div>
    {children || <p className="p-6 text-sm text-slate-500">{empty}</p>}
  </section>;
}

export default function PublicSearch({results}) {
  const hasQuery=results.query?.length>=2;
  const count=(results.teams?.length||0)+(results.players?.length||0)+(results.events?.length||0)+(results.matches?.length||0);
  return <main className="min-h-screen bg-slate-100 pb-12 pt-[88px]">
    <section className="border-b border-slate-800 bg-slate-950 text-white"><div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase tracking-[.15em] text-red-400">Tournament discovery</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">Search</h1><form action="/search" method="get" className="mt-5 flex max-w-2xl gap-2"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input name="q" defaultValue={results.query||""} minLength={2} maxLength={80} placeholder="Search family, player, event or match…" className="h-11 w-full rounded-lg border border-white/15 bg-white pl-10 pr-3 text-sm font-semibold text-slate-950 outline-none ring-red-500 focus:ring-2"/></div><button className="rounded-lg bg-red-700 px-4 text-sm font-black text-white hover:bg-red-600">Search</button></form></div></section>
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      {!hasQuery?<div className="rounded-xl border border-slate-200 bg-white p-10 text-center"><Search className="mx-auto h-8 w-8 text-slate-400"/><p className="mt-3 font-bold text-slate-950">Enter at least two characters.</p><p className="mt-1 text-sm text-slate-500">Search official public tournament data only.</p></div>:<>
        <p className="text-sm text-slate-500"><b className="text-slate-900">{count}</b> result{count===1?"":"s"} for <b className="text-slate-900">“{results.query}”</b></p>
        {count===0&&<div className="rounded-xl border border-slate-200 bg-white p-10 text-center"><p className="font-bold text-slate-950">No public results found.</p><p className="mt-1 text-sm text-slate-500">Try a family name, player, event code, venue or match title.</p></div>}
        {!!results.teams?.length&&<Section title="Families & teams"><div className="grid sm:grid-cols-2">{results.teams.map(team=><Link key={team.id} href={team.href} className="flex items-center gap-3 border-b border-slate-100 p-4 hover:bg-slate-50 sm:border-r">{team.image?<img src={team.image} alt="" className="h-11 w-11 rounded-lg object-cover"/>:<div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100"><Users className="h-4 w-4 text-slate-400"/></div>}<div className="min-w-0"><p className="truncate text-sm font-bold text-slate-950">{team.familyName}</p>{team.shortName&&<p className="text-xs text-slate-500">{team.shortName}</p>}</div></Link>)}</div></Section>}
        {!!results.players?.length&&<Section title="Players"><div className="grid sm:grid-cols-2">{results.players.map(player=><Link key={player.id} href={player.href} className="flex items-center gap-3 border-b border-slate-100 p-4 hover:bg-slate-50 sm:border-r">{player.photoUrl?<img src={player.photoUrl} alt="" className="h-11 w-11 rounded-full object-cover"/>:<div className="grid h-11 w-11 place-items-center rounded-full bg-slate-100"><UserRound className="h-4 w-4 text-slate-400"/></div>}<div className="min-w-0"><p className="truncate text-sm font-bold text-slate-950">{player.displayName||player.playerName}</p><p className="truncate text-xs text-slate-500">{player.family?.familyName}{player.jerseyNumber!=null?` · #${player.jerseyNumber}`:""}</p></div></Link>)}</div></Section>}
        {!!results.events?.length&&<Section title="Events"><div className="divide-y divide-slate-100">{results.events.map(event=><Link key={event.id} href="/tournament" className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-950">{event.shortName||event.name}</p><p className="truncate text-xs text-slate-500">{event.tournament?.shortName||event.tournament?.name} · {label(event.sportType)} · {label(event.category)}</p></div>{event.eventCode&&<span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">{event.eventCode}</span>}</Link>)}</div></Section>}
        {!!results.matches?.length&&<Section title="Matches"><div className="divide-y divide-slate-100">{results.matches.map(match=>{const[a,b]=match.participants||[];return <Link key={match.id} href={`/tournament/matches/${match.id}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-4 py-3 hover:bg-slate-50"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-950">{a?.family||"TBD"} vs {b?.family||"TBD"}</p><p className="truncate text-xs text-slate-500">{match.game?.shortName||match.game?.name||"Event"} · {dt(match.scheduledOn)} · {match.venue||"Venue TBA"}</p></div><span className="self-center text-xs font-black text-slate-500">{label(match.status)}</span></Link>})}</div></Section>}
      </>}
    </div>
  </main>
}
